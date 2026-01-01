// Load environment variables FIRST
require('dotenv').config();

// Required dependencies
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// ==================== CLOUDINARY SETUP (VERCEL REQUIRED) ====================
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary AFTER dotenv is loaded
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ==================== CONFIGURATION ====================
const ATLAS_URI = process.env.MONGODB_ATLAS_URI || "mongodb+srv://MedicineFinder:MedicineFinder@cluster0.lcwb5m8.mongodb.net/MedicineFinder?retryWrites=true&w=majority";
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const PORT = process.env.PORT || 5000;
const SALT_ROUNDS = 10;

// ==================== DATABASE CONNECTION ====================
// Fix Mongoose deprecation warning
mongoose.set('strictQuery', false);

async function connectDB() {
    try {
        await mongoose.connect(ATLAS_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB Atlas successfully');
    } catch (err) {
        console.error('MongoDB Atlas connection error:', err.message);
        process.exit(1);
    }
}

connectDB();

// ==================== SCHEMAS ====================
const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

const LoginSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    usertype: { type: String, required: true }
});

const MedicalSchema = new mongoose.Schema({
    storename: { type: String, required: true },
    owner: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    license: { type: String, required: true },
    licensePath: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

const MedicineSchema = new mongoose.Schema({
    medname: { type: String, required: true },
    company: { type: String, required: true },
    license: { type: String, required: true },
    des: { type: String, required: true },
    u_price: { type: String, required: true },
    type: { type: String, required: true },
    medical_email: { type: String, required: true }
});

// ==================== MODELS ====================
const AdminData = mongoose.model('admindata', AdminSchema);
const LoginData = mongoose.model('logindata', LoginSchema);
const MedicalData = mongoose.model('medicaldata', MedicalSchema);
const MedicineData = mongoose.model('medicinedata', MedicineSchema);

// ==================== JWT MIDDLEWARE ====================
function authenticateToken(req, res, next) {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
}

// ==================== EXPRESS APP SETUP ====================
const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(cookieParser());

// ==================== FILE UPLOAD SETUP (CLOUDINARY FOR VERCEL) ====================
// Verify Cloudinary is configured
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Cloudinary environment variables are missing!');
    process.exit(1);
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Create custom filename: storename-timestamp
        const storeName = req.body.sname || 'unknown';
        const sanitizedStoreName = storeName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const timestamp = Date.now();
        const customFilename = `${sanitizedStoreName}-${timestamp}`;
        
        return {
            folder: 'medicine-licenses',
            public_id: customFilename,
            allowed_formats: ['jpg', 'png', 'pdf', 'jpeg'],
            resource_type: 'auto'
        };
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and image files are allowed!'), false);
        }
    }
});

// ==================== AUTHENTICATION ROUTES ====================
app.post("/check_login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await LoginData.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { email: user.email, usertype: user.usertype },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

res.cookie('token', token, {
  httpOnly: true,
  secure: true,        // REQUIRED on Render (HTTPS)
  sameSite: 'none',    // REQUIRED for cross-site cookies
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
});


        console.log("Login successful for:", email);

        res.json({ usertype: user.usertype });
    } catch (e) {
        console.error("Login error:", e);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get("/isUser", authenticateToken, async (req, res) => {
    res.json({
        usertype: req.user.usertype,
        email: req.user.email
    });
});

app.get("/logout", (req, res) => {
    res.clearCookie('token');
    res.json({ msg: "success" });
});

// ==================== REGISTRATION ROUTES ====================
app.post("/register_admin", async (req, res) => {
    try {
        const { name, address, contact, email, password, cpassword } = req.body;
        
        if (password !== cpassword) {
            return res.status(400).json({ msg: "Passwords don't match" });
        }

        const existingUser = await LoginData.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const ad1 = new AdminData({ name, address, contact, email });
        const lgn = new LoginData({ email, password: hashedPassword, usertype: "admin" });

        await ad1.save();
        await lgn.save();

        res.json({ msg: "Data received and saved" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Error: " + e.message });
    }
});

app.post("/register_medical", upload.single('licenseFile'), async (req, res) => {
    try {
        const { sname, owner, address, contact, lno, email, password, cpassword } = req.body;
        
        if (!sname || !owner || !address || !contact || !lno || !email || !password || !cpassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "License file is required" });
        }

        if (password !== cpassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        const existingUser = await LoginData.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // CHANGED: Use Cloudinary URL instead of local path
        const licensePath = req.file.path;

        const ad1 = new MedicalData({ 
            storename: sname, owner, address, contact, license: lno, licensePath, email 
        });
        const lgn = new LoginData({ email, password: hashedPassword, usertype: "medical" });

        await ad1.save();
        await lgn.save();

        res.json({ success: true, message: "Medical store registered successfully!" });
    } catch (e) {
        console.error("Registration error:", e);
        res.status(500).json({ success: false, message: "Error: " + e.message });
    }
});

// ==================== ADMIN ROUTES ====================
app.get("/show_admins", async (req, res) => {
    try {
        const admins = await AdminData.find();
        res.json(admins);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post("/update_admin", async (req, res) => {
    try {
        const { name, address, contact, email } = req.body;
        const result = await AdminData.findOneAndUpdate(
            { email },
            { name, address, contact },
            { new: true }
        );
        res.json({ data: 'success', msg: 'Data Saved Successfully' });
    } catch (e) {
        console.error(e);
        res.json({ data: 'error', msg: 'Cannot Save changes' });
    }
});

app.get("/get_admin", authenticateToken, async (req, res) => {
    try {
        const admin = await AdminData.findOne({ email: req.user.email });
        res.json(admin);
    } catch (e) {
        console.error(e);
        res.json({ data: 'error', msg: 'Cannot get admin' });
    }
});

app.post("/update_admin_profile", authenticateToken, async (req, res) => {
    try {
        const { name, address, contact } = req.body;
        const result = await AdminData.findOneAndUpdate(
            { email: req.user.email },
            { name, address, contact },
            { new: true }
        );
        res.json({ data: 'success', msg: 'Data Saved Successfully' });
    } catch (e) {
        console.error(e);
        res.json({ data: 'error', msg: 'Cannot save changes' });
    }
});

// ==================== MEDICAL ROUTES ====================
app.get("/show_medical", async (req, res) => {
    try {
        const medical = await MedicalData.find();
        res.json(medical);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post("/get_medicals", async (req, res) => {
    try {
        const medical = await MedicalData.findOne({ email: req.body.id });
        res.json(medical);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post("/update_medical", async (req, res) => {
    try {
        const { sname, owner, address, contact, lno, id } = req.body;
        const result = await MedicalData.findOneAndUpdate(
            { email: id },
            { storename: sname, owner, address, contact, license: lno },
            { new: true }
        );
        res.json({ data: 'success', msg: 'Data Saved Successfully' });
    } catch (e) {
        console.error(e);
        res.json({ data: 'error', msg: 'Cannot save changes' });
    }
});

app.post("/delete_medical", async (req, res) => {
    try {
        const result = await MedicalData.findOneAndDelete({ email: req.body.id });
        res.json({ data: 'success', msg: 'Data Deleted Successfully' });
    } catch (e) {
        console.error(e);
        res.json({ data: 'error', msg: 'Cannot save changes' });
    }
});

app.get("/get_medical", authenticateToken, async (req, res) => {
    try {
        const medical = await MedicalData.findOne({ email: req.user.email });
        res.json(medical);
    } catch (e) {
        console.error(e);
        res.json({ data: 'error', msg: 'Cannot get medical' });
    }
});

app.post("/update_medical_profile", authenticateToken, async (req, res) => {
    try {
        const { storename, owner, address, contact, license } = req.body;
        const result = await MedicalData.findOneAndUpdate(
            { email: req.user.email },
            { storename, owner, address, contact, license },
            { new: true }
        );
        res.json({ data: 'success', msg: 'Data Saved Successfully' });
    } catch (e) {
        console.error(e);
        res.json({ data: 'error', msg: 'Cannot save changes' });
    }
});

// ==================== MEDICINE ROUTES ====================
app.post("/register_medicine", authenticateToken, async (req, res) => {
    try {
        const { name, com, lic, desp, uprice, type } = req.body;
        
        const medicine = new MedicineData({
            medical_email: req.user.email,
            medname: name,
            company: com,
            license: lic,
            des: desp,
            u_price: uprice,
            type
        });
        
        await medicine.save();
        res.json({ msg: "Data received and saved" });
    } catch (e) {
        console.error(e);
        res.json({ msg: "Error" });
    }
});

app.get("/show_medicine", authenticateToken, async (req, res) => {
    try {
        const medicine = await MedicineData.find({ medical_email: req.user.email });
        
        if (medicine.length > 0) {
            res.json(medicine);
        } else {
            res.json({ msg: "No medicines found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/get_medicine", async (req, res) => {
    try {
        const medicine = await MedicineData.findOne({ _id: req.body.id });
        res.json(medicine);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post("/update_medicine", async (req, res) => {
    try {
        const { id, name, com, lic, desp, type, uprice } = req.body;
        const result = await MedicineData.findOneAndUpdate(
            { _id: id },
            { medname: name, company: com, license: lic, des: desp, type, u_price: uprice },
            { new: true }
        );
        res.json({ data: 'success', msg: 'Data Updated Successfully' });
    } catch (e) {
        console.error(e);
        res.json({ data: 'error', msg: 'Cannot save changes' });
    }
});

app.post("/delete_medicine", async (req, res) => {
    try {
        const result = await MedicineData.findOneAndDelete({ _id: req.body.id });
        res.json({ data: 'success', msg: 'Data Deleted Successfully' });
    } catch (e) {
        console.error(e);
        res.json({ data: 'error', msg: 'Cannot save changes' });
    }
});

app.post("/get_med", async (req, res) => {
    try {
        const m = req.body.mediname;
        
        const medicines = await MedicineData.aggregate([
            {
                $match: {
                    $or: [
                        { medname: { $regex: m, $options: 'i' } },
                        { des: { $regex: m, $options: 'i' } },
                        { company: { $regex: m, $options: 'i' } }
                    ]
                }
            },
            {
                $lookup: {
                    from: "medicaldatas",
                    localField: "medical_email",
                    foreignField: "email",
                    as: "storeInfo"
                }
            },
            { $unwind: "$storeInfo" },
            {
                $project: {
                    medname: 1,
                    company: 1,
                    des: 1,
                    u_price: 1,
                    type: 1,
                    license: 1,
                    storename: "$storeInfo.storename",
                    contact: "$storeInfo.contact",
                    address: "$storeInfo.address"
                }
            }
        ]);

        res.json(medicines);
    } catch (e) {
        console.error(e);
        res.status(500).json({ data: 'error', msg: 'Cannot get medicine with store info' });
    }
});

app.post("/suggest_med", async (req, res) => {
    try {
        const keyword = req.body.keyword;
        const meds = await MedicineData.find({
            $or: [
                { medname: { $regex: keyword, $options: "i" } },
                { des: { $regex: keyword, $options: "i" } }
            ]
        }).limit(10);
        res.json(meds);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server Error" });
    }
});

// ==================== PASSWORD CHANGE ====================
app.post("/change_pass", authenticateToken, async (req, res) => {
    try {
        const { curr, pass } = req.body;
        
        const user = await LoginData.findOne({ email: req.user.email });
        
        if (!user) {
            return res.json({ data: 'error', msg: 'User not found' });
        }

        const isCurrentPasswordValid = await bcrypt.compare(curr, user.password);
        
        if (!isCurrentPasswordValid) {
            return res.json({ data: 'error', msg: 'Current password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(pass, SALT_ROUNDS);

        const result = await LoginData.findOneAndUpdate(
            { email: req.user.email },
            { password: hashedNewPassword },
            { new: true }
        );
        
        if (result) {
            res.json({ data: 'success', msg: 'Password changed successfully' });
        } else {
            res.json({ data: 'error', msg: 'Failed to update password' });
        }
    } catch (e) {
        console.error(e);
        res.json({ data: 'error', msg: 'Cannot save changes' });
    }
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});

module.exports = app;