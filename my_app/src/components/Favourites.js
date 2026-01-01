import { useState, useEffect } from "react";
import { Container, Table, Button, Alert, Spinner } from "react-bootstrap";
import GenMenu from "./GenMenu";
import axios from "axios";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null);

  // Fetch favorites from backend on component mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5000/get_favorites", {
        withCredentials: true
      });

      if (response.data.data === 'success') {
        setFavorites(response.data.favorites);
      } else if (response.data.data === 'Failed') {
        setError('Please login to view your favorites');
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (medicine) => {
    try {
      setRemoving(medicine.medicine_id);
      const response = await axios.post(
        "http://localhost:5000/remove_favorite",
        { medicine_id: medicine.medicine_id },
        { withCredentials: true }
      );

      if (response.data.data === 'success') {
        // Remove from local state
        setFavorites((prev) =>
          prev.filter((fav) => fav.medicine_id !== medicine.medicine_id)
        );
      } else {
        alert(response.data.msg || 'Failed to remove from favorites');
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
      alert('Failed to remove from favorites. Please try again.');
    } finally {
      setRemoving(null);
    }
  };

  const clearAllFavorites = async () => {
    if (!window.confirm('Are you sure you want to clear all favorites?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        "http://localhost:5000/clear_favorites",
        { withCredentials: true }
      );

      if (response.data.data === 'success') {
        setFavorites([]);
        alert(response.data.msg);
      }
    } catch (err) {
      console.error("Error clearing favorites:", err);
      alert('Failed to clear favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <GenMenu />
        <Container className="py-4 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading your favorites...</p>
        </Container>
      </>
    );
  }

  return (
    <>
      <GenMenu />
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Your Favorite Medicines</h4>
          {favorites.length > 0 && (
            <Button variant="outline-danger" onClick={clearAllFavorites}>
              Clear All
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}

        {!error && favorites.length === 0 ? (
          <Alert variant="info" className="text-center">
            No favourites have been added yet!
          </Alert>
        ) : (
          <Table bordered responsive hover>
            <thead className="table-light">
              <tr>
                <th>Medicine Name</th>
                <th>Company</th>
                <th>Description</th>
                <th>Type</th>
                <th>Unit Price</th>
                <th>Store Name</th>
                <th>Store Contact</th>
                <th>Store Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {favorites.map((fav) => (
                <tr key={fav._id}>
                  <td><strong>{fav.medname}</strong></td>
                  <td>{fav.company}</td>
                  <td>{fav.des}</td>
                  <td>
                    <span className="badge bg-info text-dark">
                      {fav.type}
                    </span>
                  </td>
                  <td>₹{fav.u_price}</td>
                  <td>{fav.storename}</td>
                  <td>{fav.store_contact}</td>
                  <td>{fav.store_address}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeFavorite(fav)}
                      disabled={removing === fav.medicine_id}
                    >
                      {removing === fav.medicine_id ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-1"
                          />
                          Removing...
                        </>
                      ) : (
                        'Remove'
                      )}
                    </Button>
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

export default Favorites;