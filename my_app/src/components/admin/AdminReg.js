import { useState } from "react";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import AdmMenu from "./AdmMenu";

function AdminReg() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState(""); // ← CHANGED from 'confirm'
  const [result, setResult] = useState("");
  const [error, setError] = useState(""); // ← ADDED for error messages

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setResult(""); // Clear previous results
    
    try {
      let r = await fetch('http://localhost:5000/register_admin', {
        method: "POST",
        body: JSON.stringify({ 
          name, 
          address, 
          contact, 
          email, 
          password, 
          cpassword // ← FIXED: was 'confirm', now 'cpassword'
        }),
        credentials: 'include', // ← ADDED for cookies
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await r.json();
      console.log("Response:", data); // ← For debugging
      
      if (r.ok && data.msg === "Data received and saved") {
        setResult("Admin registered successfully!");
        // Clear form
        setEmail("");
        setName("");
        setAddress("");
        setContact("");
        setPassword("");
        setCpassword("");
      } else {
        // Show error message from backend
        setError(data.msg || data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred. Please try again.");
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
                <Card.Title className="text-center text-success mb-4 fw-bold">
                  Admin Registration
                </Card.Title>
                <Form onSubmit={handleOnSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Enter Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Enter Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Enter Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your address"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Enter Contact</Form.Label>
                    <Form.Control
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Enter contact number"
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
                      required
                      minLength={6}
                    />
                    <Form.Text className="text-muted">
                      Password must be at least 6 characters
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={cpassword}
                      onChange={(e) => setCpassword(e.target.value)} // ← FIXED
                      placeholder="Re-enter password"
                      required
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button variant="success" type="submit" className="rounded-pill">
                      Register
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

export default AdminReg;