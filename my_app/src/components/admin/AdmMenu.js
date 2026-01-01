import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';



function AdmMenu()
{
    return(
        <>
        <Navbar expand="md" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand href="/admin/*">Admin Dashboard</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/admin/register_admin"> Add Admin</Nav.Link>
                        <Nav.Link as={Link} to="/admin/register_medical">Register Medical Store</Nav.Link>
                        <Nav.Link as={Link} to="/admin/show_medicals">Manage Stores</Nav.Link>
                        <Nav.Link as={Link} to="/admin/edit_admin">Edit Profile</Nav.Link>
                        <Nav.Link as={Link} to="/">Logout</Nav.Link>                  
                    </Nav>
                </Navbar.Collapse>
            </Container>
            </Navbar>
                
        </>
    );
}
export default AdmMenu;
