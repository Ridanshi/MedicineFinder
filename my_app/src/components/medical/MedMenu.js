import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, Routes, Route } from 'react-router-dom';
import MedReg from '../medicine/MedReg';
import ShowMedi from '../medicine/ShowMedi';
import EditMedi from '../medicine/EditMedi';
import DeleteMedi from '../medicine/DeleteMedi';

function MedMenu()
{
    return(
        <>
        <Navbar expand="md" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand href="/medical/*">Medical Dashboard</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/medical/register_medicine">Add Medicine</Nav.Link>
                        <Nav.Link as={Link} to="/medical/show_medicine">Medicine List</Nav.Link>
                        <Nav.Link as={Link} to="/medical/edit_medical">Edit Profile</Nav.Link>
                        <Nav.Link as={Link} to="/">Logout</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
            </Navbar>
            <Routes>
                    <Route path='/register_medicine' element={<MedReg/>} />
                    <Route path='/show_medicine' element={<ShowMedi/>} />
                    <Route path='/edit_medicine/:id' element={<EditMedi/>} />
                    <Route path='/delete_medicine/:id' element={<DeleteMedi/>} />
            </Routes>

            
        </>
    );
}
export default MedMenu;


