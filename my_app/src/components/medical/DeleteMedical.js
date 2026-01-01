import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdmMenu from "../admin/AdmMenu";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

function DeleteMedical() {
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
        let res = await fetch("http://localhost:5000/delete_medical", {
            method: "post",
            body: JSON.stringify({ sname, owner, address, contact, lno, id }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        let result = await res.json();
        if (result.data === "success") {
            setResult("Data deleted successfully.");
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
                        <Card className="shadow p-4 border-danger">
                            <Card.Body>
                                <Card.Title className="text-center text-danger mb-4">
                                    Delete Medical Store
                                </Card.Title>
                                <Form onSubmit={handleOnSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Store Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={sname}
                                            readOnly
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Owner Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={owner}
                                            readOnly
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Address</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={address}
                                            readOnly
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Contact</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={contact}
                                            readOnly
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>License Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={lno}
                                            readOnly
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
                                        <Button variant="danger" type="submit">
                                            Delete Record
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

export default DeleteMedical;
