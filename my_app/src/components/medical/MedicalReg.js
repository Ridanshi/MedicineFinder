import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import AdmMenu from "../admin/AdmMenu";

function MedicalReg() {
  const [sname, setSname] = useState("");
  const [owner, setOwner] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [lno, setLno] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpass] = useState("");
  const [licenseFile, setLicenseFile] = useState(null);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setLicenseFile(e.target.files[0]);
    setError(""); // Clear error when file is selected
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!licenseFile) {
      setError("Please upload a valid license document");
      setResult("");
      return;
    }

    if (password !== cpassword) {
      setError("Passwords do not match");
      setResult("");
      return;
    }

    setError("");
    setResult("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("sname", sname);
      formData.append("owner", owner);
      formData.append("address", address);
      formData.append("contact", contact);
      formData.append("lno", lno);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("cpassword", cpassword);
      formData.append("licenseFile", licenseFile);

      const response = await fetch("http://localhost:5000/register_medical", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();

      if (data.success) {
        setResult(data.message || "Medical store registered successfully!");
        setError("");
        
        // Clear form
        setSname("");
        setOwner("");
        setAddress("");
        setContact("");
        setLno("");
        setEmail("");
        setPassword("");
        setCpass("");
        setLicenseFile(null);
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      } else {
        setError(data.message || "Registration failed");
        setResult("");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Server error. Please check if the backend is running.");
      setResult("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdmMenu />
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow-lg border-0 rounded-4">
              <Card.Body>
                <Card.Title className="text-center text-primary mb-4 fw-bold">
                  Medical Store Registration
                </Card.Title>
                <Form onSubmit={handleOnSubmit} encType="multipart/form-data">
                  <Form.Group className="mb-3">
                    <Form.Label>Store Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={sname}
                      onChange={(e) => setSname(e.target.value)}
                      placeholder="Enter store name"
                      disabled={loading}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Owner</Form.Label>
                    <Form.Control
                      type="text"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      placeholder="Enter owner's name"
                      disabled={loading}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter address"
                      disabled={loading}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Contact</Form.Label>
                    <Form.Control
                      type="tel"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Enter contact number"
                      pattern="^[0-9+\-\s]{7,15}$"
                      disabled={loading}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>License Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={lno}
                      onChange={(e) => setLno(e.target.value)}
                      placeholder="Enter license number"
                      disabled={loading}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      disabled={loading}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      minLength={6}
                      disabled={loading}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={cpassword}
                      onChange={(e) => setCpass(e.target.value)}
                      placeholder="Confirm password"
                      minLength={6}
                      disabled={loading}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>License Document</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      disabled={loading}
                      required
                    />
                    {licenseFile && (
                      <small className="text-muted d-block mt-1">
                        Selected: {licenseFile.name}
                      </small>
                    )}
                  </Form.Group>

                  {error && <Alert variant="danger">{error}</Alert>}
                  {result && <Alert variant="success">{result}</Alert>}

                  <div className="d-grid">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="rounded-pill"
                      disabled={loading}
                    >
                      {loading ? "Registering..." : "Register"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default MedicalReg;