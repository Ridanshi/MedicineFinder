// ==================== ShowMedicals.js ====================
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Container, Table, Button, Alert } from "react-bootstrap";
import AdmMenu from "../admin/AdmMenu";

function ShowMedicals() {
  const [med, setMed] = useState([]);

  useEffect(() => {
    displayMedical();
  }, []);

  const displayMedical = async () => {
    try {
      const res = await axios.get("/show_medicals"); // Using global baseURL
      // Check if response is an array before setting
      if (Array.isArray(res.data)) {
        setMed(res.data);
      } else {
        setMed([]); // Set empty array if not array
      }
      console.log(res.data);
    } catch (err) {
      console.log(err);
      setMed([]); // Set empty array on error
    }
  };

  return (
    <>
      <AdmMenu />
      <Container className="py-5">
        <h3 className="mb-4 text-primary text-center fw-bold">Registered Medical Stores</h3>

        {med.length === 0 ? (
          <Alert variant="info" className="text-center">
            No medical stores found.
          </Alert>
        ) : (
          <Table striped bordered hover responsive className="shadow-sm rounded-3">
            <thead className="table-dark">
              <tr>
                <th>Store Name</th>
                <th>Owner</th>
                <th>Address</th>
                <th>Contact</th>
                <th>License #</th>
                <th>Email</th>
                <th colSpan="2" className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {med.map((m) => (
                <tr key={m.email}>
                  <td>{m.storename}</td>
                  <td>{m.owner}</td>
                  <td>{m.address}</td>
                  <td>{m.contact}</td>
                  <td>{m.license}</td>
                  <td>{m.email}</td>
                  <td className="text-center">
                    <Link to={`../edit_medical/${m.email}`}>
                      <Button variant="success" size="sm" className="w-100">Edit</Button>
                    </Link>
                  </td>
                  <td className="text-center">
                    <Link to={`../delete_medical/${m.email}`}>
                      <Button variant="danger" size="sm" className="w-100">Delete</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </>
  );
}

export default ShowMedicals;