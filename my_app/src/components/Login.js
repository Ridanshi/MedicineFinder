import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import GenMenu from './GenMenu';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const navigate = useNavigate();

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      let result = await fetch(`${process.env.REACT_APP_API_URL}/check_login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // ← THIS IS THE FIX - MUST ADD THIS
      });

      result = await result.json();
      console.log("Login response:", result);

      if (result == null || result.error) {
        setMsg("Invalid Email and/or Password");
      } else {
        let ut = result.usertype;
        if (ut === "admin") {
          navigate('/admin/adminhome', { replace: true });
        } else if (ut === "medical") {
          navigate('/medical/medicalhome', { replace: true });
        } else {
          setMsg("Contact admin for access");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setMsg("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <GenMenu />
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow border-0 rounded-4">
              <Card.Body>
                <Card.Title className="text-center text-primary mb-4 fw-bold">
                  Login
                </Card.Title>
                <Form onSubmit={handleOnSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button type="submit" variant="primary" className="rounded-pill">
                      Login
                    </Button>
                  </div>
                </Form>

                {msg && (
                  <Alert variant={msg.includes("Invalid") ? "danger" : "warning"} className="mt-4 text-center">
                    {msg}
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

export default Login;