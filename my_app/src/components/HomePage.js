import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  InputGroup,
  Table,
  Badge,
  Card,
  ButtonGroup,
  Modal,
  Dropdown,
} from "react-bootstrap";
import {
  FaSearch, FaTimes, FaFilter, FaBalanceScale, FaShareAlt,
  FaStar, FaWhatsapp, FaEnvelope, FaLink, FaSortAmountDown,
  FaPhone, FaMapMarkerAlt
} from "react-icons/fa";
import GenMenu from "./GenMenu";

function HomePage() {
  const [result, setResult] = useState("");
  const [mediname, setMedName] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const [shareModalShow, setShareModalShow] = useState(false);
  const [shareData, setShareData] = useState(null);

  const [ratingModalShow, setRatingModalShow] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);
  const [storeRatings, setStoreRatings] = useState({});

  const [sortBy, setSortBy] = useState("name");

  const categories = [
    { value: "all", label: "All", color: "secondary" },
    { value: "tablet", label: "Tablets", color: "primary" },
    { value: "capsule", label: "Capsules", color: "success" },
    { value: "syrup", label: "Syrups", color: "info" },
    { value: "injection", label: "Injections", color: "danger" },
    { value: "ointment", label: "Ointments", color: "warning" },
    { value: "drops", label: "Drops", color: "dark" },
  ];

  const symptoms = [
    { keyword: "fever", medicines: ["paracetamol", "ibuprofen", "aspirin", "crocin", "dolo"] },
    { keyword: "headache", medicines: ["paracetamol", "aspirin", "ibuprofen", "saridon", "disprin"] },
    { keyword: "cold", medicines: ["cetirizine", "paracetamol", "sinarest", "wikoryl", "coldact"] },
    { keyword: "cough", medicines: ["benadryl", "ascoril", "alex", "glycodin", "chericof"] },
    { keyword: "stomach pain", medicines: ["digene", "pan", "omez", "gelusil", "ranitidine"] },
    { keyword: "acidity", medicines: ["eno", "digene", "omez", "pan", "pantoprazole"] },
    { keyword: "body pain", medicines: ["ibuprofen", "combiflam", "voveran", "diclofenac", "brufen"] },
    { keyword: "allergy", medicines: ["cetirizine", "allegra", "avil", "benadryl", "fexo"] },
    { keyword: "diabetes", medicines: ["metformin", "glycomet", "januvia", "insulin", "glimepiride"] },
    { keyword: "blood pressure", medicines: ["amlodipine", "telmisartan", "metoprolol", "atenolol"] },
  ];

  // Load ratings from localStorage on mount
  useEffect(() => {
    const savedRatings = localStorage.getItem("storeRatings");
    if (savedRatings) {
      setStoreRatings(JSON.parse(savedRatings));
    }
  }, []);

  // Auto-search on mediname change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mediname.trim()) {
        handleSearch(null, mediname);
      } else {
        setMedicines([]);
        setResult("");
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [mediname, selectedCategory]); // Re-search when category changes too

  const findMedicinesBySymptom = useCallback((searchTerm) => {
    const lowerSearch = searchTerm.toLowerCase();
    return symptoms.find(s => lowerSearch.includes(s.keyword))?.medicines || null;
  }, []);

  const fetchMedicine = useCallback(async (medName) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/get_med`,
        {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediname: medName }),
          credentials: "include" // ✅ REQUIRED
        }
      );
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }, []);


  const handleSearch = useCallback(async (e, voiceInput = null) => {
    if (e) e.preventDefault();

    const searchTerm = voiceInput || mediname;

    if (!searchTerm.trim()) {
      setResult("Please enter a medicine name or symptom");
      setMedicines([]);
      return;
    }

    setIsSearching(true);
    setResult("Searching...");
    setMedicines([]);

    try {
      let allResults = [];

      // First, search by exact search term
      const directSearchRes = await fetchMedicine(searchTerm);
      allResults = [...directSearchRes];

      // Then check symptoms and search related medicines
      const symptomMedicines = findMedicinesBySymptom(searchTerm);
      if (symptomMedicines && symptomMedicines.length > 0) {
        const symptomPromises = symptomMedicines.map(med => fetchMedicine(med));
        const symptomResults = await Promise.all(symptomPromises);
        const flattenedSymptomResults = symptomResults.flat();
        allResults = [...allResults, ...flattenedSymptomResults];
      }

      // Remove duplicates by _id
      const uniqueResults = allResults.filter((medicine, index, self) =>
        index === self.findIndex((m) => m._id === medicine._id)
      );

      // Apply category filter
      let filteredData = uniqueResults;
      if (selectedCategory !== "all") {
        filteredData = uniqueResults.filter(m =>
          m.type && m.type.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      }

      setMedicines(filteredData);

      if (filteredData.length === 0) {
        setResult(`No ${selectedCategory !== "all" ? `${selectedCategory} ` : ""}medicines found for "${searchTerm}".`);
      } else {
        setResult(`Found ${filteredData.length} ${selectedCategory !== "all" ? `${selectedCategory} ` : ""}medicine(s) for "${searchTerm}"`);
      }
    } catch (err) {
      console.error(err);
      setResult("Server error. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, [mediname, selectedCategory, findMedicinesBySymptom, fetchMedicine]);

  const toggleCompare = (medicine) => {
    if (compareList.find(m => m._id === medicine._id)) {
      setCompareList(compareList.filter(m => m._id !== medicine._id));
    } else {
      if (compareList.length < 3) {
        setCompareList([...compareList, medicine]);
      } else {
        alert("You can compare up to 3 medicines only!");
      }
    }
  };

  const isInCompareList = (medicineId) => {
    return compareList.some(m => m._id === medicineId);
  };

  const sortMedicines = (meds) => {
    const sorted = [...meds];
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => parseFloat(a.u_price) - parseFloat(b.u_price));
      case "price-high":
        return sorted.sort((a, b) => parseFloat(b.u_price) - parseFloat(a.u_price));
      case "name":
        return sorted.sort((a, b) => a.medname.localeCompare(b.medname));
      case "rating":
        return sorted.sort((a, b) => {
          const ratingA = getStoreRating(a.storename);
          const ratingB = getStoreRating(b.storename);
          return ratingB - ratingA;
        });
      default:
        return sorted;
    }
  };

  const shareMedicine = (medicine) => {
    setShareData(medicine);
    setShareModalShow(true);
  };

  const shareViaWhatsApp = () => {
    const text = `Check out this medicine:\n\n*${shareData.medname}*\nCompany: ${shareData.company}\nPrice: ₹${shareData.u_price}\nStore: ${shareData.storename}\nContact: ${shareData.contact}\nAddress: ${shareData.address}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Medicine Info: ${shareData.medname}`;
    const body = `Medicine Details:\n\nName: ${shareData.medname}\nCompany: ${shareData.company}\nPrice: ₹${shareData.u_price}\nType: ${shareData.type}\nDescription: ${shareData.des}\n\nStore Information:\nStore: ${shareData.storename}\nContact: ${shareData.contact}\nAddress: ${shareData.address}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const copyLink = () => {
    const text = `${shareData.medname} - ₹${shareData.u_price} at ${shareData.storename}. Contact: ${shareData.contact}`;
    navigator.clipboard.writeText(text);
    alert("Medicine details copied to clipboard!");
  };

  const openRatingModal = (storename) => {
    setCurrentStore(storename);
    setRatingModalShow(true);
  };

  const submitRating = (rating, review) => {
    const newRatings = { ...storeRatings };

    if (!newRatings[currentStore]) {
      newRatings[currentStore] = { ratings: [], reviews: [] };
    }

    newRatings[currentStore].ratings.push(rating);
    newRatings[currentStore].reviews.push({ rating, review, date: new Date().toLocaleDateString() });

    setStoreRatings(newRatings);
    localStorage.setItem("storeRatings", JSON.stringify(newRatings));
    setRatingModalShow(false);
    alert("Thank you for your review!");
  };

  const getStoreRating = (storename) => {
    if (storeRatings[storename] && storeRatings[storename].ratings.length > 0) {
      const sum = storeRatings[storename].ratings.reduce((a, b) => a + b, 0);
      return (sum / storeRatings[storename].ratings.length).toFixed(1);
    }
    return 0;
  };

  const getStoreReviewCount = (storename) => {
    return storeRatings[storename]?.ratings.length || 0;
  };

  const quickSymptomSearch = (symptom) => {
    setSelectedSymptom(symptom);
    setMedName(symptom);
  };

  const clearSearch = () => {
    setMedName("");
    setMedicines([]);
    setResult("");
    setSelectedCategory("all");
    setSelectedSymptom("");
    setCompareList([]);
  };

  const filterByCategory = (category) => {
    setSelectedCategory(category);
  };

  const sortedMedicines = sortMedicines(medicines);

  return (
    <>
      <GenMenu />
      <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '3rem' }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ color: '#000', fontSize: '2.5rem', fontWeight: '400', marginBottom: '0.5rem' }}>
              Find your medicine here
            </h1>
          </div>

          {/* Search Bar */}
          <Form autoComplete="off">
            <Row className="justify-content-center">
              <Col md={10} lg={8}>
                <Card style={{ border: 'none', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
                  <Card.Body className="p-4">
                    <InputGroup size="lg">
                      <Form.Control
                        type="text"
                        placeholder="Search medicine or symptom..."
                        value={mediname}
                        onChange={(e) => setMedName(e.target.value)}
                        style={{ border: '1px solid #dee2e6', borderRadius: '8px 0 0 8px', padding: '0.75rem 1rem' }}
                      />

                      {mediname && (
                        <Button
                          variant="light"
                          onClick={clearSearch}
                          title="Clear search"
                          style={{ border: '1px solid #dee2e6', borderLeft: 'none', borderRight: 'none' }}
                        >
                          <FaTimes />
                        </Button>
                      )}

                      <Button
                        type="submit"
                        onClick={handleSearch}
                        disabled={isSearching}
                        style={{
                          background: isSearching ? '#6c757d' : '#007bff',
                          border: 'none',
                          borderRadius: mediname ? '0' : '0 8px 8px 0',
                          padding: '0 2rem',
                          fontWeight: '400',
                          color: '#fff'
                        }}
                      >
                        {isSearching ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Searching...
                          </>
                        ) : (
                          <>
                            <FaSearch className="me-2" /> Search
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        title="Show filters"
                        style={{ borderRadius: '0 8px 8px 0', border: '1px solid #dee2e6', borderLeft: 'none' }}
                      >
                        <FaFilter />
                      </Button>
                    </InputGroup>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Form>

          {/* Category Filters */}
          {showFilters && (
            <Row className="justify-content-center mt-3">
              <Col md={10} lg={8}>
                <Card style={{ border: 'none', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
                  <Card.Body className="p-4">
                    <h6 className="mb-3" style={{ color: '#000', fontWeight: '400' }}>
                      <FaFilter className="me-2" /> Filter by Medicine Type
                    </h6>
                    <div className="d-flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Button
                          key={cat.value}
                          variant={selectedCategory === cat.value ? cat.color : `outline-${cat.color}`}
                          size="sm"
                          onClick={() => filterByCategory(cat.value)}
                          style={{
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            fontWeight: '400',
                            border: '1px solid'
                          }}
                        >
                          {cat.label}
                        </Button>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Quick Symptom Search */}
          <Row className="justify-content-center mt-3">
            <Col md={10} lg={8}>
              <Card style={{ border: 'none', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
                <Card.Body className="p-4">
                  <div className="mb-2" style={{ color: '#666', fontWeight: '600', fontSize: '0.95rem' }}>
                    Quick Search by Common Symptoms
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {symptoms.map((symptom) => (
                      <Badge
                        key={symptom.keyword}
                        bg={selectedSymptom === symptom.keyword ? "primary" : "light"}
                        text={selectedSymptom === symptom.keyword ? "white" : "dark"}
                        style={{
                          cursor: "pointer",
                          fontSize: '0.9rem',
                          textTransform: "capitalize",
                          padding: '0.5rem 1rem',
                          fontWeight: '500',
                          borderRadius: '20px',
                          border: selectedSymptom === symptom.keyword ? 'none' : '2px solid #dee2e6'
                        }}
                        onClick={() => quickSymptomSearch(symptom.keyword)}
                      >
                        {symptom.keyword.replace(/([A-Z])/g, ' $1').trim()}
                      </Badge>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Search Result Message */}
          {result && (
            <Row className="justify-content-center mt-3">
              <Col md={10} lg={8}>
                <Alert
                  variant={result.includes("Found") ? "success" : result.includes("No medicines") ? "warning" : "info"}
                  style={{ borderRadius: '8px', border: 'none', fontWeight: '400' }}
                >
                  {result}
                </Alert>
              </Col>
            </Row>
          )}

          {/* Sort and Compare Bar */}
          {medicines.length > 0 && (
            <Row className="justify-content-center mt-4">
              <Col md={10} lg={8}>
                <Card style={{ border: 'none', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <FaSortAmountDown style={{ color: '#000' }} />
                        <span style={{ fontWeight: '400', color: '#000' }}>Sort by:</span>
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="outline-secondary"
                            size="sm"
                            style={{ borderRadius: '6px', fontWeight: '400' }}
                          >
                            {sortBy === "price-low" ? "Price: Low to High" :
                              sortBy === "price-high" ? "Price: High to Low" :
                                sortBy === "rating" ? "Rating" : "Name"}
                          </Dropdown.Toggle>
                          <Dropdown.Menu style={{ borderRadius: '8px' }}>
                            <Dropdown.Item onClick={() => setSortBy("name")}>Name (A-Z)</Dropdown.Item>
                            <Dropdown.Item onClick={() => setSortBy("price-low")}>Price: Low to High</Dropdown.Item>
                            <Dropdown.Item onClick={() => setSortBy("price-high")}>Price: High to Low</Dropdown.Item>
                            <Dropdown.Item onClick={() => setSortBy("rating")}>Rating</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>

                      {compareList.length > 0 && (
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => setShowCompareModal(true)}
                          style={{ borderRadius: '6px', fontWeight: '400', padding: '0.5rem 1rem' }}
                        >
                          <FaBalanceScale className="me-2" /> Compare ({compareList.length})
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Container>

        {/* Medicine Results Table */}
        {sortedMedicines.length > 0 && (
          <Container className="mt-4">
            <Row className="justify-content-center">
              <Col md={12} lg={11}>
                <Card style={{ border: 'none', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
                  <Card.Body className="p-4">
                    <h3 className="mb-4" style={{ color: '#000', fontWeight: '400', fontSize: '1.5rem' }}>
                      Medicines Available <span style={{ color: '#007bff', fontSize: '1.2rem' }}>({sortedMedicines.length} results)</span>
                    </h3>

                    <div style={{ overflowX: 'auto' }}>
                      <Table hover responsive style={{ marginBottom: 0 }}>
                        <thead style={{ background: '#000', color: '#fff', borderBottom: '2px solid #dee2e6' }}>
                          <tr>
                            <th style={{ padding: '1rem', fontWeight: '400' }}>Select</th>
                            <th style={{ padding: '1rem', fontWeight: '400' }}>Medicine Name</th>
                            <th style={{ padding: '1rem', fontWeight: '400' }}>Company</th>
                            <th style={{ padding: '1rem', fontWeight: '400' }}>Store Name</th>
                            <th style={{ padding: '1rem', fontWeight: '400' }}>Price</th>
                            <th style={{ padding: '1rem', fontWeight: '400' }}>Type</th>
                            <th style={{ padding: '1rem', fontWeight: '400' }}>Contact</th>
                            <th style={{ padding: '1rem', fontWeight: '400' }}>Address</th>
                            <th style={{ padding: '1rem', fontWeight: '400' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedMedicines.map((m, idx) => (
                            <tr key={m._id} style={{
                              borderBottom: '1px solid #f0f0f0',
                              background: idx % 2 === 0 ? 'white' : '#fafafa'
                            }}>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <Form.Check
                                  type="checkbox"
                                  checked={isInCompareList(m._id)}
                                  onChange={() => toggleCompare(m)}
                                  disabled={compareList.length >= 3 && !isInCompareList(m._id)}
                                />
                              </td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <div style={{ fontWeight: '400', color: '#000', marginBottom: '0.25rem' }}>{m.medname}</div>
                                <small style={{ color: '#6c757d' }}>{m.des}</small>
                              </td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle', color: '#000', fontWeight: '400' }}>{m.company}</td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <div style={{ fontWeight: '400', color: '#000' }}>{m.storename}</div>
                                <div className="mt-1 d-flex align-items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} color={i < Math.round(getStoreRating(m.storename)) ? "#ffc107" : "#e4e5e9"} size={14} />
                                  ))}
                                  <small style={{ color: '#6c757d', marginLeft: '0.25rem' }}>
                                    ({getStoreReviewCount(m.storename)})
                                  </small>
                                </div>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 mt-1"
                                  onClick={() => openRatingModal(m.storename)}
                                  style={{ fontSize: '0.85rem', textDecoration: 'none', fontWeight: '400' }}
                                >
                                  Rate Store
                                </Button>
                              </td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <Badge
                                  bg="success"
                                  style={{
                                    fontSize: '1rem',
                                    fontWeight: '400',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '6px'
                                  }}
                                >
                                  ₹{m.u_price}
                                </Badge>
                              </td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <Badge
                                  bg="info"
                                  text="dark"
                                  style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '6px',
                                    fontWeight: '400'
                                  }}
                                >
                                  {m.type}
                                </Badge>
                              </td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <a
                                  href={`tel:${m.contact}`}
                                  style={{
                                    textDecoration: 'none',
                                    color: '#007bff',
                                    fontWeight: '400',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                  }}
                                >
                                  <FaPhone size={12} /> {m.contact}
                                </a>
                              </td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <div style={{
                                  color: '#6c757d',
                                  fontSize: '0.9rem',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '0.5rem'
                                }}>
                                  <FaMapMarkerAlt size={12} style={{ marginTop: '0.2rem' }} />
                                  <span>{m.address}</span>
                                </div>
                              </td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => shareMedicine(m)}
                                  style={{
                                    borderRadius: '6px',
                                    fontWeight: '400',
                                    padding: '0.5rem 1rem'
                                  }}
                                >
                                  <FaShareAlt className="me-1" /> Share
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        )}

        {/* Compare Modal */}
        <Modal show={showCompareModal} onHide={() => setShowCompareModal(false)} size="lg" centered>
          <Modal.Header closeButton style={{ borderBottom: '1px solid #dee2e6' }}>
            <Modal.Title style={{ fontWeight: '400', color: '#000' }}>
              <FaBalanceScale className="me-2" /> Compare Medicines
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '2rem' }}>
            {compareList.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6c757d' }}>No medicines selected for comparison</p>
            ) : (
              <Table bordered hover>
                <thead style={{ background: '#f8f9fa' }}>
                  <tr>
                    <th style={{ fontWeight: '400', color: '#000' }}>Feature</th>
                    {compareList.map((m) => (
                      <th key={m._id} style={{ fontWeight: '400', color: '#000' }}>{m.medname}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: '400' }}>Company</td>
                    {compareList.map((m) => (<td key={m._id}>{m.company}</td>))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '400' }}>Price</td>
                    {compareList.map((m) => (
                      <td key={m._id}>
                        <Badge bg="success" style={{ fontSize: '0.95rem', fontWeight: '400' }}>₹{m.u_price}</Badge>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '400' }}>Type</td>
                    {compareList.map((m) => (<td key={m._id}>{m.type}</td>))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '400' }}>Store</td>
                    {compareList.map((m) => (<td key={m._id}>{m.storename}</td>))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '400' }}>Store Rating</td>
                    {compareList.map((m) => (
                      <td key={m._id}>
                        <FaStar color="#ffc107" /> {getStoreRating(m.storename) || "No ratings"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '400' }}>Contact</td>
                    {compareList.map((m) => (<td key={m._id}>{m.contact}</td>))}
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '400' }}>Address</td>
                    {compareList.map((m) => (<td key={m._id}>{m.address}</td>))}
                  </tr>
                </tbody>
              </Table>
            )}
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '2px solid #f0f0f0', padding: '1rem 2rem' }}>
            <Button variant="secondary" onClick={() => setShowCompareModal(false)} style={{ borderRadius: '8px' }}>
              Close
            </Button>
            <Button variant="danger" onClick={() => setCompareList([])} style={{ borderRadius: '8px', fontWeight: '600' }}>
              Clear All
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Share Modal */}
        <Modal show={shareModalShow} onHide={() => setShareModalShow(false)} centered>
          <Modal.Header closeButton style={{ borderBottom: '2px solid #f0f0f0' }}>
            <Modal.Title style={{ fontWeight: '700', color: '#333' }}>
              <FaShareAlt className="me-2" style={{ color: '#667eea' }} /> Share Medicine Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '2rem' }}>
            {shareData && (
              <div>
                <h5 style={{ fontWeight: '700', color: '#333', marginBottom: '1rem' }}>{shareData.medname}</h5>
                <div style={{ color: '#495057', marginBottom: '0.75rem' }}>
                  <strong>Company:</strong> {shareData.company}
                </div>
                <div style={{ color: '#495057', marginBottom: '0.75rem' }}>
                  <strong>Price:</strong> <span style={{ color: '#28a745', fontWeight: '600', fontSize: '1.1rem' }}>₹{shareData.u_price}</span>
                </div>
                <div style={{ color: '#495057', marginBottom: '1.5rem' }}>
                  <strong>Store:</strong> {shareData.storename}
                </div>
                <hr style={{ margin: '1.5rem 0' }} />
                <div className="d-grid gap-3">
                  <Button
                    variant="success"
                    onClick={shareViaWhatsApp}
                    style={{
                      borderRadius: '10px',
                      padding: '0.75rem',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}
                  >
                    <FaWhatsapp className="me-2" size={20} /> Share via WhatsApp
                  </Button>
                  <Button
                    variant="primary"
                    onClick={shareViaEmail}
                    style={{
                      borderRadius: '10px',
                      padding: '0.75rem',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}
                  >
                    <FaLink className="me-2" size={18} /> Copy Details
                  </Button>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>

        {/* Rating Modal */}
        <RatingModal
          show={ratingModalShow}
          onHide={() => setRatingModalShow(false)}
          storeName={currentStore}
          onSubmit={submitRating}
        />
      </div>
    </>
  );
}

// Rating Modal Component (unchanged)
function RatingModal({ show, onHide, storeName, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [hover, setHover] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    onSubmit(rating, review);
    setRating(0);
    setReview("");
  };

  const getRatingLabel = (rating) => {
    if (rating === 0) return "Select rating";
    if (rating === 1) return "Poor";
    if (rating === 2) return "Fair";
    if (rating === 3) return "Good";
    if (rating === 4) return "Very Good";
    return "Excellent";
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton style={{ borderBottom: '2px solid #f0f0f0' }}>
        <Modal.Title style={{ fontWeight: '700', color: '#333' }}>
          Rate Store: <span style={{ color: '#667eea' }}>{storeName}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '2rem' }}>
        <div className="text-center mb-4">
          <h6 style={{ color: '#495057', marginBottom: '1.5rem', fontWeight: '600' }}>
            How would you rate this store?
          </h6>
          <div style={{ marginBottom: '1rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                size={45}
                style={{ cursor: "pointer", marginRight: 8, transition: 'all 0.2s' }}
                color={star <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              />
            ))}
          </div>
          <p style={{
            color: '#667eea',
            fontWeight: '600',
            fontSize: '1.1rem',
            marginTop: '1rem'
          }}>
            {getRatingLabel(rating)}
          </p>
        </div>
        <Form.Group>
          <Form.Label style={{ fontWeight: '600', color: '#495057' }}>
            Review (Optional)
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience..."
            style={{
              borderRadius: '10px',
              border: '2px solid #e0e0e0',
              padding: '0.75rem'
            }}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer style={{ borderTop: '2px solid #f0f0f0', padding: '1rem 2rem' }}>
        <Button
          variant="secondary"
          onClick={onHide}
          style={{ borderRadius: '8px', padding: '0.5rem 1.5rem' }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          style={{
            borderRadius: '8px',
            padding: '0.5rem 1.5rem',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none'
          }}
        >
          Submit Review
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default HomePage;
