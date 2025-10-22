import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Button, Form, Navbar, Nav, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "https://api.unsplash.com/search/photos";
const IMAGES_PER_PAGE = 20;
const ACCESS_KEY = "YOUR_UNSPLASH_ACCESS_KEY"; // 🔹 Replace with your Unsplash Access Key

function Home() {
  const searchInput = useRef(null);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [query, setQuery] = useState("");

  const fetchImages = async (query, page) => {
    try {
      const response = await axios.get(API_URL, {
        params: {
          query: query,
          page: page,
          per_page: IMAGES_PER_PAGE,
          client_id: ACCESS_KEY,
        },
      });
      setImages(response.data.results);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error("Error fetching images:", error);
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
      <Form onSubmit={handleSearch} className="d-flex mb-3">
        <Form.Control
          type="search"
          placeholder="Search for images..."
          ref={searchInput}
          className="me-2"
        />
        <Button variant="primary" type="submit">
          Search
        </Button>
      </Form>

      {images.length > 0 ? (
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
                <p className="card-text text-muted">
                  {image.user.name}
                </p>
                <a
                  href={image.links.html}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm"
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
        This app uses the Unsplash API to search and display images. Built with React, Axios, and React Bootstrap.
      </p>
    </Container>
  );
}

function App() {
  return (
    <Router>
      {/* 🔹 Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Unsplash Gallery
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/about">
                About
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 🔹 Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
