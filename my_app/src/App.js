import 'bootstrap/dist/css/bootstrap.css'
import AdminHome from './components/admin/AdminHome';
import MedicalHome from './components/medical/MedicalHome';
import Login from './components/Login';
import HomePage from './components/HomePage';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import ChangePass from './components/ChangePass';
import Editprof from './components/Editprof';
import Editprofmed from './components/medical/Editprofmed';
import MedReg from './components/medicine/MedReg';
import ShowMedi from './components/medicine/ShowMedi';
import EditMedi from './components/medicine/EditMedi';
import DeleteMedi from './components/medicine/DeleteMedi';
import AdminReg from './components/admin/AdminReg';
import ShowAdmins from './components/admin/ShowAdmins';
import MedicalReg from './components/medical/MedicalReg';
import ShowMedicals from './components/medical/ShowMedicals';
import DeleteMedical from './components/medical/DeleteMedical';
import EditMedical from './components/medical/EditMedical';
import Search from './components/Search';
import Showallmed from './components/medicine/Showallmed';

function App() {
  return (
    <div>
        <Router>
              <Routes>
                    <Route path='/' element={<HomePage/>} />
                    <Route path='/login' element={<Login/>} />
                    <Route path='/change_pass' element={<ChangePass/>} />
                    <Route path='/get_admin' element={<Editprof/>} />
                    <Route path='/get_medical' element={<Editprofmed/>} />
                    <Route path='/admin/*' element={<AdminHome/>} />
                    <Route path='/medical/*' element={<MedicalHome/>} />
                    <Route path='/search' element={<Search/>}/>
                    <Route path='medicine/show_medicines' element={<Showallmed/>} />

                    <Route path='admin/register_admin' element={<AdminReg/>} />
                    <Route path='admin/show_admins' element={<ShowAdmins/>} />
                    <Route path='admin/register_medical' element={<MedicalReg/>} />
                    <Route path='admin/show_medicals' element={<ShowMedicals/>} />
                    <Route path='edit_medical/:id' element={<EditMedical/>} />
                    <Route path='delete_medical/:id' element={<DeleteMedical/>} />
                    <Route path='admin/edit_admin' element={<Editprof/>} />

                    <Route path='medical/register_medicine' element={<MedReg/>} />
                    <Route path='medical/show_medicine' element={<ShowMedi/>} />
                    <Route path='edit_medicine/:id' element={<EditMedi/>} />
                    <Route path='delete_medicine/:id' element={<DeleteMedi/>} />
                    <Route path='medical/edit_medical' element={<Editprofmed/>} />


              </Routes>

        </Router>
    </div>
  );
}
export default App;
