import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Navbar, Nav, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = 'https://api.unsplash.com/search/photos';
const IMAGES_PER_PAGE = 20;

function App() {
  const searchInput = useRef(null);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState('home'); // 👈 current navbar section

  const fetchImages = useCallback(async () => {
    try {
      if (searchInput.current.value) {
        setErrorMsg('');
        setLoading(true);
        const { data } = await axios.get(
          `${API_URL}?query=${
            searchInput.current.value
          }&page=${page}&per_page=${IMAGES_PER_PAGE}&client_id=${
            import.meta.env.VITE_API_KEY
          }`
        );
        setImages(data.results);
        setTotalPages(data.total_pages);
        setLoading(false);
      }
    } catch (error) {
      setErrorMsg('Error fetching images. Try again later.');
      console.log(error);
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const resetSearch = () => {
    setPage(1);
    fetchImages();
  };

  const handleSearch = (event) => {
    event.preventDefault();
    resetSearch();
  };

  const handleSelection = (selection) => {
    searchInput.current.value = selection;
    resetSearch();
  };

  return (
    <div>
      {/* ✅ Navbar Section */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand style={{ cursor: 'pointer' }} onClick={() => setActivePage('home')}>
            ImageApp
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => setActivePage('home')}>Home</Nav.Link>
              <Nav.Link onClick={() => setActivePage('gallery')}>Gallery</Nav.Link>
              <Nav.Link onClick={() => setActivePage('about')}>About</Nav.Link>
              <Nav.Link onClick={() => setActivePage('contact')}>Contact</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* ✅ Conditional Rendering Based on Navbar Selection */}
      {activePage === 'home' && (
        <div className="container mt-4">
          <h1 className="title">Welcome to ImageApp</h1>
          <p>Search and explore images using Unsplash API.</p>
        </div>
      )}

      {activePage === 'gallery' && (
        <div className="container mt-4">
          <h1 className="title">Image Search</h1>
          {errorMsg && <p className="error-msg">{errorMsg}</p>}
          <div className="search-section">
            <Form onSubmit={handleSearch}>
              <Form.Control
                type="search"
                placeholder="Type something to search..."
                className="search-input"
                ref={searchInput}
              />
            </Form>
          </div>

          {/* Filter buttons */}
          <div className="filters mt-3 d-flex flex-wrap gap-2">
            {['code', 'hacker', 'nature', 'birds', 'cats', 'shoes', 'elephant', 'toys'].map((item) => (
              <Button key={item} variant="outline-dark" onClick={() => handleSelection(item)}>
                {item}
              </Button>
            ))}
          </div>

          {loading ? (
            <p className="loading mt-4">Loading...</p>
          ) : (
            <>
              <div className="images d-flex flex-wrap justify-content-center mt-4 gap-3">
                {images.map((image) => (
                  <img
                    key={image.id}
                    src={image.urls.small}
                    alt={image.alt_description}
                    className="image"
                    style={{ width: '250px', height: '200px', objectFit: 'cover', borderRadius: '10px' }}
                  />
                ))}
              </div>
              <div className="buttons mt-3 d-flex justify-content-center gap-3">
                {page > 1 && <Button onClick={() => setPage(page - 1)}>Previous</Button>}
                {page < totalPages && <Button onClick={() => setPage(page + 1)}>Next</Button>}
              </div>
            </>
          )}
        </div>
      )}

      {activePage === 'about' && (
        <div className="container mt-4">
          <h1>About</h1>
          <p>This is a simple Unsplash image search app built using React and Bootstrap.</p>
        </div>
      )}

      {activePage === 'contact' && (
        <div className="container mt-4">
          <h1>Contact</h1>
          <p>Email: support@imageapp.com</p>
        </div>
      )}
    </div>
  );
}

export default App;
