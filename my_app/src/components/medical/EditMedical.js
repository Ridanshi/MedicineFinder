import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdmMenu from "../admin/AdmMenu";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

function EditMedical() {
    let history = useNavigate();
    const { id } = useParams();

    const [sname, setSname] = useState("");
    const [owner, setOwner] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");
    const [lno, setLno] = useState("");
    const [email, setEmail] = useState("");
    const [result, setResult] = useState("");

    useEffect(() => {
        displayMedical();
    }, []);

    const displayMedical = async () => {
        let res = await fetch("http://localhost:5000/get_medicals", {
            method: "post",
            body: JSON.stringify({ id }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        let result = await res.json();
        setSname(result.storename);
        setOwner(result.owner);
        setAddress(result.address);
        setContact(result.contact);
        setLno(result.license);
        setEmail(result.email);
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        let res = await fetch("http://localhost:5000/update_medical", {
            method: "post",
            body: JSON.stringify({ sname, owner, address, contact, lno, id }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        let result = await res.json();
        if (result.data === "success") {
            setResult("Data saved successfully!");
        } else {
            setResult(result.msg || "Something went wrong.");
        }
    };

    return (
        <>
            <AdmMenu />
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card className="shadow p-4">
                            <Card.Body>
                                <Card.Title className="text-center text-primary mb-4">
                                    Edit Medical Store Details
                                </Card.Title>
                                <Form onSubmit={handleOnSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Store Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={sname}
                                            onChange={(e) => setSname(e.target.value)}
                                            placeholder="Enter store name"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Owner Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={owner}
                                            onChange={(e) => setOwner(e.target.value)}
                                            placeholder="Enter owner's name"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Address</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Enter address"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Contact</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={contact}
                                            onChange={(e) => setContact(e.target.value)}
                                            placeholder="Enter contact number"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>License Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={lno}
                                            onChange={(e) => setLno(e.target.value)}
                                            placeholder="Enter license number"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={email}
                                            readOnly
                                        />
                                    </Form.Group>

                                    <div className="text-center mt-4">
                                        <Button variant="primary" type="submit">
                                            Save Changes
                                        </Button>
                                    </div>
                                </Form>

                                {result && (
                                    <Alert
                                        className="mt-4 text-center"
                                        variant={result.includes("success") ? "success" : "danger"}
                                    >
                                        {result}
                                    </Alert>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default EditMedical;
