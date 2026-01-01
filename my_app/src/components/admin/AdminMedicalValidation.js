import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert, Spinner } from "react-bootstrap";
import AdmMenu from "../admin/AdmMenu";

function AdminMedicalValidation() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/get_medical_applications");
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.applications);
      } else {
        setMessage("Failed to load applications");
        setMessageType("danger");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setMessage("Error connecting to server");
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (app) => {
    setSelectedApp(app);
    setShowModal(true);
    setRejectionReason("");
  };

  const handleApprove = async (appId) => {
    if (!window.confirm("Are you sure you want to approve this application?")) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("http://localhost:5000/validate_medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: appId,
          action: "approve",
          reason: ""
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Application approved successfully!");
        setMessageType("success");
        fetchApplications();
        setShowModal(false);
      } else {
        setMessage(data.message || "Failed to approve application");
        setMessageType("danger");
      }
    } catch (error) {
      console.error("Error approving application:", error);
      setMessage("Error processing approval");
      setMessageType("danger");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (appId) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    if (!window.confirm("Are you sure you want to reject this application?")) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("http://localhost:5000/validate_medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: appId,
          action: "reject",
          reason: rejectionReason
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Application rejected");
        setMessageType("warning");
        fetchApplications();
        setShowModal(false);
        setRejectionReason("");
      } else {
        setMessage(data.message || "Failed to reject application");
        setMessageType("danger");
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      setMessage("Error processing rejection");
      setMessageType("danger");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning" text="dark">Pending</Badge>;
      case "approved":
        return <Badge bg="success">Approved</Badge>;
      case "rejected":
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  const pendingCount = applications.filter(app => app.status === "pending").length;
  const approvedCount = applications.filter(app => app.status === "approved").length;
  const rejectedCount = applications.filter(app => app.status === "rejected").length;

  return (
    <>
      <AdmMenu />
      <Container className="py-5">
        <h2 className="text-center mb-4">Medical Store Validation Dashboard</h2>

        {message && (
          <Alert variant={messageType} onClose={() => setMessage("")} dismissible>
            {message}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h3 className="text-primary">{applications.length}</h3>
                <p className="mb-0">Total Applications</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h3 className="text-warning">{pendingCount}</h3>
                <p className="mb-0">Pending Review</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h3 className="text-success">{approvedCount}</h3>
                <p className="mb-0">Approved</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h3 className="text-danger">{rejectedCount}</h3>
                <p className="mb-0">Rejected</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filter Buttons */}
        <div className="mb-3">
          <Button 
            variant={filter === "all" ? "primary" : "outline-primary"}
            onClick={() => setFilter("all")}
            className="me-2"
          >
            All ({applications.length})
          </Button>
          <Button 
            variant={filter === "pending" ? "warning" : "outline-warning"}
            onClick={() => setFilter("pending")}
            className="me-2"
          >
            Pending ({pendingCount})
          </Button>
          <Button 
            variant={filter === "approved" ? "success" : "outline-success"}
            onClick={() => setFilter("approved")}
            className="me-2"
          >
            Approved ({approvedCount})
          </Button>
          <Button 
            variant={filter === "rejected" ? "danger" : "outline-danger"}
            onClick={() => setFilter("rejected")}
          >
            Rejected ({rejectedCount})
          </Button>
        </div>

        {/* Applications Table */}
        <Card className="shadow-sm">
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>No applications found</h5>
                <p>There are no {filter !== "all" ? filter : ""} applications at the moment.</p>
              </div>
            ) : (
              <Table responsive hover>
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Store Name</th>
                    <th>Owner</th>
                    <th>Email</th>
                    <th>License</th>
                    <th>Status</th>
                    <th>Applied On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app, index) => (
                    <tr key={app.id}>
                      <td>{index + 1}</td>
                      <td><strong>{app.sname}</strong></td>
                      <td>{app.owner}</td>
                      <td>{app.email}</td>
                      <td>
                        {app.hasLicense === "true" ? (
                          <Badge bg="info">{app.lno}</Badge>
                        ) : (
                          <Badge bg="secondary">No License</Badge>
                        )}
                      </td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>{new Date(app.created_at).toLocaleDateString()}</td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => handleViewDetails(app)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Details Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Application Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedApp && (
              <>
                <Row className="mb-3">
                  <Col md={6}>
                    <p><strong>Store Name:</strong> {selectedApp.sname}</p>
                    <p><strong>Owner:</strong> {selectedApp.owner}</p>
                    <p><strong>Email:</strong> {selectedApp.email}</p>
                    <p><strong>Contact:</strong> {selectedApp.contact}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Address:</strong> {selectedApp.address}</p>
                    <p><strong>Has License:</strong> {selectedApp.hasLicense === "true" ? "Yes" : "No"}</p>
                    {selectedApp.hasLicense === "true" && (
                      <p><strong>License Number:</strong> {selectedApp.lno}</p>
                    )}
                    <p><strong>Status:</strong> {getStatusBadge(selectedApp.status)}</p>
                  </Col>
                </Row>

                {selectedApp.hasLicense === "true" && selectedApp.license_file && (
                  <div className="mb-3">
                    <strong>License Document:</strong>
                    <div className="mt-2">
                      <a 
                        href={`http://localhost:5000/uploads/${selectedApp.license_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-info"
                      >
                        View License Document
                      </a>
                    </div>
                  </div>
                )}

                {selectedApp.status === "rejected" && selectedApp.rejection_reason && (
                  <Alert variant="danger">
                    <strong>Rejection Reason:</strong> {selectedApp.rejection_reason}
                  </Alert>
                )}

                {selectedApp.status === "pending" && (
                  <>
                    <hr />
                    <h5 className="mb-3">Admin Actions</h5>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Rejection Reason (Optional for reject action)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Enter reason for rejection..."
                      />
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <Button 
                        variant="success" 
                        onClick={() => handleApprove(selectedApp.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Processing..." : "✓ Approve"}
                      </Button>
                      <Button 
                        variant="danger" 
                        onClick={() => handleReject(selectedApp.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Processing..." : "✗ Reject"}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}

export default AdminMedicalValidation;