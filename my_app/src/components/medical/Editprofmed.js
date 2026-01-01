import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MedMenu from "./MedMenu";
import {Container,Row,Col,Form,Button,Alert} from "react-bootstrap";

function Editprofmed() {
    let history = useNavigate();
    const { id } = useParams();

    const [storename, setStorename] = useState("");
    const [owner, setOwner] = useState("");
    const [contact, setContact] = useState("");
    const [address, setAddress] = useState("");
    const [license, setLicense] = useState("");
    const [result, setResult] = useState("");

    useEffect(
        () => {
            console.log(id);
            displayMedical();
        },
        []
    )

    const displayMedical = async (e) => {
        //e.preventDefault();
        let meddata = await axios.get("http://localhost:5000/get_medical");

        console.log("meddata: ", meddata.data);
        const medical=meddata.data;
        if (medical) {
            setStorename(medical.storename );
            setOwner(medical.owner);
            setAddress(medical.address);
            setContact(medical.contact);
            setLicense(medical.license);
        }
        else {
            setResult("Data Not Found")
        }
    };
    const handleOnSubmit = async (e) => {
        e.preventDefault();
        let result = await fetch(
            'http://localhost:5000/update_medical_profile', {
            method: "post",
            body: JSON.stringify({ storename, owner, address, contact, license }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        result = await result.json();
        console.log(result);

        if (result) {
            setResult("Data Updated successfully!");
            setStorename(storename);
            setOwner(owner);
            setAddress(address);
            setContact(contact);
            setLicense(license);
        }
        else {
            setResult("Data cannot be changed");
        }
    };

    return (
         <>
            <MedMenu />
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <h4 className="text-center text-primary mb-4">Edit Medical Profile</h4>
                        <Form onSubmit={handleOnSubmit} className="p-4 border rounded shadow-sm bg-light">
                            <Form.Group className="mb-3">
                                <Form.Label>Store Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={storename}
                                    onChange={(e) => setStorename(e.target.value)}
                                    placeholder="Enter store name"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Owner Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={owner}
                                    onChange={(e) => setOwner(e.target.value)}
                                    placeholder="Enter owner name"
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
                            <Form.Group className="mb-4">
                                <Form.Label>License Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={license}
                                    onChange={(e) => setLicense(e.target.value)}
                                    placeholder="Enter license number"
                                />
                            </Form.Group>
                            <div className="d-grid">
                                <Button type="submit" variant="primary">
                                    Update Profile
                                </Button>
                            </div>
                        </Form>
                        {result && (
                            <Alert className="mt-4" variant={result.includes("successfully") ? "success" : "danger"}>
                                {result}
                            </Alert>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );

}
export default Editprofmed;