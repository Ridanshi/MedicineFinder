
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MedMenu from "./MedMenu";
import { Container, Card, Row, Col } from "react-bootstrap";

function MedicalHome() {
    const navigate = useNavigate();
    const [sname, setSname] = useState("");
    const [owner, setOwner] = useState("");
    const [add, setAdd] = useState("");
    const [contact, setContact] = useState("");
    const [email, setEmail] = useState("");
    const [lic, setLic] = useState("");

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const res = await axios.get('http://localhost:5000/isUser');
            if (res.data.usertype === "medical") {
                const data = await axios.get('http://localhost:5000/get_medical');
                const d = data.data;
                setSname(d.storename);
                setOwner(d.owner);
                setAdd(d.address);
                setContact(d.contact);
                setEmail(d.email);
                setLic(d.license);
            } else {
                navigate('/wrong_login');
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <MedMenu />
            <Container className="d-flex flex-column align-items-center mt-5">
                <h2 className="fw-bold text-primary mb-4">Welcome, Medical!</h2>

                <Card className="p-4 shadow" style={{ borderRadius: "15px", width: "100%", maxWidth: "600px" }}>
                    <h4 className="text-success text-center mb-4">Medical Profile</h4>
                    
                    <Row className="mb-2">
                        <Col sm={4}><strong>Store Name:</strong></Col>
                        <Col sm={8}>{sname}</Col>
                    </Row>
                    <hr />
                    <Row className="mb-2 d-flex justify-content-between">
                        <Col sm={4}><strong>Owner:</strong></Col>
                        <Col sm={8}>{owner}</Col>
                    </Row>
                    <hr />
                    <Row className="mb-2">
                        <Col sm={4}><strong>Address:</strong></Col>
                        <Col sm={8}>{add}</Col>
                    </Row>
                    <hr />
                    <Row className="mb-2">
                        <Col sm={4}><strong>Contact:</strong></Col>
                        <Col sm={8}>{contact}</Col>
                    </Row>
                    <hr />
                    <Row className="mb-2">
                        <Col sm={4}><strong>Email:</strong></Col>
                        <Col sm={8}>{email}</Col>
                    </Row>
                    <hr />
                    <Row className="mb-2">
                        <Col sm={4}><strong>License:</strong></Col>
                        <Col sm={8}>{lic}</Col>
                    </Row>
                </Card>
            </Container>
        </>
    );
}

export default MedicalHome;
