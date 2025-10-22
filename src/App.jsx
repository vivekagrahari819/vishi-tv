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
      <Form onSubmit={handleSearch} className="d-flex mb-3 justify-content-center">
        <Form.Control
          type="search"
          placeholder="Search for images..."
          ref={searchInput}
          className="me-2 w-50"
        />
        <Button variant="success" type="submit">
          Search
        </Button>
      </Form>

      {loading ? (
        <p className="text-center mt-5 text-muted">Loading images...</p>
      ) : images.length > 0 ? (
        <div className="d-flex flex-wrap justify-content-center gap-3">
          {images.map((image) => (
            <div key={image.id} className="card shadow-sm" style={{ width: "18rem" }}>
              <img
                src={image.urls.small}
                alt={image.alt_description}
                className="card-img-top"
                style={{ borderRadius: "10px" }}
              />
              <div className="card-body text-center">
                <p className="card-text text-muted">{image.user.name}</p>
                <a
                  href={image.links.html}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-success btn-sm"
                >
                  View on Unsplash
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center mt-4 text-muted">No images found.</p>
      )}

      <div className="d-flex justify-content-center mt-4 gap-2">
        <Button
          variant="secondary"
          disabled={page === 1}
          onClick={() => handlePageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="align-self-center">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          disabled={page === totalPages}
          onClick={() => handlePageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </Container>
  );
}

function About() {
  return (
    <Container className="mt-4 text-center">
      <h2>About This App</h2>
      <p>
        This app uses the Unsplash API to search and display beautiful photos.
        Built with React, Axios, and React Bootstrap.
      </p>
    </Container>
  );
}

function App() {
  return (
    <Router>
      {/* ✅ Responsive, Clean Bootstrap Navbar */}
      <Navbar bg="light" expand="lg" className="shadow-sm py-3">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-success fs-4">
            PhotoSearch
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarSupportedContent" />
          <Navbar.Collapse id="navbarSupportedContent">
            <Nav className="me-auto mb-2 mb-lg-0">
              <Nav.Link as={Link} to="/" className="fw-semibold">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/about" className="fw-semibold">
                About
              </Nav.Link>

              <NavDropdown title="Categories" id="navbarDropdown">
                <NavDropdown.Item onClick={() => window.location.reload()}>
                  Nature
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => window.location.reload()}>
                  Technology
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => window.location.reload()}>
                  Animals
                </NavDropdown.Item>
              </NavDropdown>

              <Nav.Link disabled>Disabled</Nav.Link>
            </Nav>

            <Form className="d-flex">
              <Form.Control
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
              />
              <Button variant="outline-success">Search</Button>
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Page Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
