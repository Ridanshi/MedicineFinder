import { useState } from "react";
import MedMenu from "../medical/MedMenu";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

function MedReg() {
    const [name, setName] = useState("");
    const [com, setCom] = useState("");
    const [lic, setLic] = useState("");
    const [desp, setDesp] = useState("");
    const [uprice, setUprice] = useState("");
    const [type, setType] = useState("");
    const [result, setResult] = useState("");
    const [error, setError] = useState("");

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setResult("");
        
        console.log(name, com, lic, desp, uprice, type);

        try {
            let r = await fetch('http://localhost:5000/register_medicine', {
                method: 'post',
                body: JSON.stringify({ name, com, lic, desp, uprice, type }),
                credentials: 'include', // ← ADDED THIS - CRITICAL!
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            r = await r.json();
            console.log(r);
            
            if (r.msg === "Data received and saved") {
                setResult("Medicine registered successfully!");
                // Clear form
                setName("");
                setCom("");
                setLic("");
                setDesp("");
                setUprice("");
                setType("");
            } else {
                setError(r.msg || "Failed to register medicine");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <>
            <MedMenu />
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card className="shadow p-4">
                            <Card.Body>
                                <Card.Title className="text-center text-primary mb-4">
                                    Medicine Registration
                                </Card.Title>
                                <Form onSubmit={handleOnSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Medicine Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter medicine name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Company</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter company name"
                                            value={com}
                                            onChange={(e) => setCom(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>License</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter license"
                                            value={lic}
                                            onChange={(e) => setLic(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Medicine Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Enter description"
                                            value={desp}
                                            onChange={(e) => setDesp(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Unit Price</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            placeholder="Enter unit price"
                                            value={uprice}
                                            onChange={(e) => setUprice(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Medicine Type</Form.Label>
                                        <Form.Select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            required
                                        >
                                            <option value="">Select type</option>
                                            <option value="Tablet">Tablet</option>
                                            <option value="Capsule">Capsule</option>
                                            <option value="Injection">Injection</option>
                                            <option value="Syrup">Syrup</option>
                                            <option value="Ointment">Ointment</option>
                                            <option value="Drops">Drops</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <div className="text-center mt-4">
                                        <Button variant="success" type="submit">
                                            Register Medicine
                                        </Button>
                                    </div>
                                </Form>

                                {result && (
                                    <Alert variant="success" className="mt-4 text-center">
                                        {result}
                                    </Alert>
                                )}
                                
                                {error && (
                                    <Alert variant="danger" className="mt-4 text-center">
                                        {error}
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

export default MedReg;