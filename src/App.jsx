import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  Button,
  Form,
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Row,
  Col,
  Card
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "https://api.unsplash.com/search/photos";
const IMAGES_PER_PAGE = 20;
const ACCESS_KEY = "YOUR_UNSPLASH_ACCESS_KEY"; // 🔹 Replace this with your actual key

function Home() {
  const searchInput = useRef(null);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchImages = async (query, page) => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        params: {
          query,
          page,
          per_page: IMAGES_PER_PAGE,
          client_id: ACCESS_KEY,
        },
      });
      setImages(response.data.results);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const queryValue = searchInput.current.value.trim();
    if (queryValue) {
      setQuery(queryValue);
      fetchImages(queryValue, 1);
      setPage(1);
    }
  };

  const handleCategorySearch = (category) => {
    if (searchInput.current) {
      searchInput.current.value = category;
      setQuery(category);
      fetchImages(category, 1);
      setPage(1);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchImages(query, newPage);
    }
  };

  useEffect(() => {
    fetchImages("nature", 1); // Default search
  }, []);

  return (
    <Container className="mt-4">
      {/* Search Section */}
      <Row className="justify-content-center mb-4">
        <Col md={8} lg={6}>
          <Form onSubmit={handleSearch} className="d-flex mb-3">
            <Form.Control
              type="search"
              placeholder="Search for images..."
              ref={searchInput}
              className="me-2"
              size="lg"
            />
            <Button variant="primary" type="submit" size="lg">
              <i className="fas fa-search me-2"></i>
              Search
            </Button>
          </Form>
        </Col>
      </Row>

      {/* Quick Categories */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            {['Nature', 'Technology', 'Animals', 'Travel', 'Food', 'Sports', 'Art', 'Architecture'].map((category) => (
              <Button
                key={category}
                variant="outline-primary"
                size="sm"
                onClick={() => handleCategorySearch(category.toLowerCase())}
                className="rounded-pill"
              >
                {category}
              </Button>
            ))}
          </div>
        </Col>
      </Row>

      {/* Loading State */}
      {loading && (
        <Row>
          <Col className="text-center">
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-3 text-muted">Loading beautiful images...</span>
            </div>
          </Col>
        </Row>
      )}

      {/* Images Grid */}
      {!loading && images.length > 0 && (
        <>
          <Row>
            <Col>
              <h4 className="text-center text-muted mb-4">
                Showing results for "{query}" - Page {page} of {totalPages}
              </h4>
            </Col>
          </Row>
          <Row className="g-4">
            {images.map((image) => (
              <Col key={image.id} xs={12} sm={6} md={4} lg={3}>
                <Card className="h-100 shadow-sm border-0">
                  <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                    <Card.Img 
                      variant="top" 
                      src={image.urls.small} 
                      alt={image.alt_description}
                      style={{ 
                        height: '100%', 
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Text className="text-muted small flex-grow-1">
                      {image.alt_description || 'No description available'}
                    </Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        by {image.user.name}
                      </small>
                      <a
                        href={image.links.html}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        View
                      </a>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <Row className="mt-4">
            <Col className="d-flex justify-content-center align-items-center gap-3">
              <Button
                variant="outline-primary"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                <i className="fas fa-chevron-left me-2"></i>
                Previous
              </Button>
              <span className="text-muted">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline-primary"
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
                <i className="fas fa-chevron-right ms-2"></i>
              </Button>
            </Col>
          </Row>
        </>
      )}

      {/* No Results */}
      {!loading && images.length === 0 && query && (
        <Row>
          <Col className="text-center py-5">
            <div className="text-muted">
              <i className="fas fa-search fa-3x mb-3"></i>
              <h4>No images found for "{query}"</h4>
              <p>Try a different search term or browse the categories above.</p>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}

function About() {
  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="text-center">
            <h2 className="mb-4">About PhotoSearch</h2>
            <div className="mb-4">
              <i className="fas fa-camera fa-3x text-primary mb-3"></i>
            </div>
            <p className="lead mb-4">
              Discover and explore millions of beautiful, high-quality photos from talented photographers around the world.
            </p>
            
            <Row className="text-start mt-5">
              <Col md={6} className="mb-4">
                <div className="d-flex align-items-start">
                  <i className="fas fa-search text-primary me-3 mt-1"></i>
                  <div>
                    <h5>Powerful Search</h5>
                    <p className="text-muted mb-0">
                      Find exactly what you're looking for with our intuitive search functionality.
                    </p>
                  </div>
                </div>
              </Col>
              <Col md={6} className="mb-4">
                <div className="d-flex align-items-start">
                  <i className="fas fa-images text-primary me-3 mt-1"></i>
                  <div>
                    <h5>Curated Collections</h5>
                    <p className="text-muted mb-0">
                      Browse through carefully organized categories and collections.
                    </p>
                  </div>
                </div>
              </Col>
              <Col md={6} className="mb-4">
                <div className="d-flex align-items-start">
                  <i className="fas fa-bolt text-primary me-3 mt-1"></i>
                  <div>
                    <h5>Lightning Fast</h5>
                    <p className="text-muted mb-0">
                      Enjoy quick loading times and smooth browsing experience.
                    </p>
                  </div>
                </div>
              </Col>
              <Col md={6} className="mb-4">
                <div className="d-flex align-items-start">
                  <i className="fas fa-mobile-alt text-primary me-3 mt-1"></i>
                  <div>
                    <h5>Fully Responsive</h5>
                    <p className="text-muted mb-0">
                      Works perfectly on all devices - desktop, tablet, and mobile.
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="text-center mb-5">
            <h2>Contact Us</h2>
            <p className="text-muted">Get in touch with our team</p>
          </div>
          
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message here..."
                    required
                  />
                </Form.Group>
                <div className="text-center">
                  <Button variant="primary" type="submit" size="lg">
                    Send Message
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

function App() {
  return (
    <Router>
     <nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Navbar</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="#">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Link</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Dropdown
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
            <li><a class="dropdown-item" href="#">Action</a></li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#">Something else here</a></li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
        </li>
      </ul>
      <form class="d-flex">
        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-success" type="submit">Search</button>
      </form>
    </div>
  </div>
</nav>

      {/* Font Awesome Icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    </Router>
  );
}

export default App;

