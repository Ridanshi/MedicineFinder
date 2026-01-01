import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Alert,
} from "react-bootstrap";

function EditMedi() {
    const history = useNavigate();
    const { id } = useParams();

    const [medid, setMedid] = useState("");
    const [name, setName] = useState("");
    const [com, setCom] = useState("");
    const [lic, setLic] = useState("");
    const [desp, setDesp] = useState("");
    const [uprice, setUprice] = useState("");
    const [type, setType] = useState("");
    const [result, setResult] = useState("");

    useEffect(() => {
        displayMedicine();
    }, []);

    const displayMedicine = async () => {
        let res = await fetch("http://localhost:5000/get_medicine", {
            method: "post",
            body: JSON.stringify({ id }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        let result = await res.json();
        setMedid(result._id);
        setName(result.medname);
        setCom(result.company);
        setLic(result.license);
        setDesp(result.des);
        setUprice(result.u_price);
        setType(result.type);
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        let res = await fetch("http://localhost:5000/update_medicine", {
            method: "post",
            body: JSON.stringify({ id, name, com, lic, desp, uprice, type }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        res = await res.json();
        if (res.data === "success") {
            setResult("Data saved successfully.");
        } else {
            setResult(res.msg || "Update failed.");
        }
    };

    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow p-4">
                        <Card.Body>
                            <Card.Title className="text-center text-primary mb-4">
                                Edit Medicine Details
                            </Card.Title>
                            <Form onSubmit={handleOnSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Medicine ID</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={medid}
                                        readOnly
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Medicine Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="Enter medicine name"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Company</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={com}
                                        onChange={(e) =>
                                            setCom(e.target.value)
                                        }
                                        placeholder="Enter company name"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>License Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={lic}
                                        onChange={(e) =>
                                            setLic(e.target.value)
                                        }
                                        placeholder="Enter license number"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={desp}
                                        onChange={(e) =>
                                            setDesp(e.target.value)
                                        }
                                        placeholder="Enter description"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Unit Price</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={uprice}
                                        onChange={(e) =>
                                            setUprice(e.target.value)
                                        }
                                        placeholder="Enter price"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Type</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={type}
                                        onChange={(e) =>
                                            setType(e.target.value)
                                        }
                                        placeholder="Enter medicine type"
                                    />
                                </Form.Group>

                                <div className="text-center mt-4">
                                    <Button type="submit" variant="primary">
                                        Save Changes
                                    </Button>
                                </div>
                            </Form>

                            {result && (
                                <Alert
                                    variant={
                                        result.includes("success")
                                            ? "success"
                                            : "danger"
                                    }
                                    className="mt-4 text-center"
                                >
                                    {result}
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default EditMedi;
