import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import './App.css';

const API_URL = 'https://api.unsplash.com/search/photos';
const IMAGES_PER_PAGE = 20;

function App() {
  const searchInput = useRef(null);
  const parallaxRef = useRef(null);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Parallax Effect
  useEffect(() => {
    const handleParallax = (e) => {
      if (!parallaxRef.current) return;
      
      let _w = window.innerWidth / 2;
      let _h = window.innerHeight / 2;
      let _mouseX = e.clientX;
      let _mouseY = e.clientY;
      let _depth1 = `${50 - (_mouseX - _w) * 0.01}% ${50 - (_mouseY - _h) * 0.01}%`;
      let _depth2 = `${50 - (_mouseX - _w) * 0.02}% ${50 - (_mouseY - _h) * 0.02}%`;
      let _depth3 = `${50 - (_mouseX - _w) * 0.06}% ${50 - (_mouseY - _h) * 0.06}%`;
      let x = `${_depth3}, ${_depth2}, ${_depth1}`;
      
      parallaxRef.current.style.backgroundPosition = x;
    };

    document.addEventListener("mousemove", handleParallax);
    return () => {
      document.removeEventListener("mousemove", handleParallax);
    };
  }, []);

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
    <>
      {/* Parallax Hero Section */}
      <div className="parallax-hero">
        <div 
          id="parallax" 
          ref={parallaxRef}
          className="parallax-container"
        >
          <div className="parallax-overlay">
            {/* Navbar */}
            <Navbar bg="transparent" variant="dark" expand="lg" className="custom-navbar">
              <Container>
                <Navbar.Brand href="#" className="brand">
                  <i className="fas fa-camera me-2"></i>
                  Image Gallery Pro
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarSupportedContent" />
                <Navbar.Collapse id="navbarSupportedContent">
                  <Nav className="me-auto">
                    <Nav.Link href="#" className="nav-link-custom active">Home</Nav.Link>
                    <Nav.Link href="#" className="nav-link-custom">Featured</Nav.Link>
                    <NavDropdown title="Categories" id="navbarDropdown" className="nav-dropdown-custom">
                      <NavDropdown.Item onClick={() => handleSelection('nature')}>Nature</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleSelection('animals')}>Animals</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => handleSelection('technology')}>Technology</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={() => handleSelection('art')}>Art & Design</NavDropdown.Item>
                    </NavDropdown>
                    <Nav.Link href="#" className="nav-link-custom">About</Nav.Link>
                  </Nav>
                  <Form className="d-flex search-form" onSubmit={handleSearch}>
                    <Form.Control
                      type="search"
                      placeholder="Search for images..."
                      className="me-2 search-input-nav"
                      aria-label="Search"
                      ref={searchInput}
                    />
                    <Button variant="outline-light" type="submit">
                      <i className="fas fa-search"></i>
                    </Button>
                  </Form>
                </Navbar.Collapse>
              </Container>
            </Navbar>

            {/* Hero Content */}
            <div className="hero-content">
              <h1 className="hero-title">Discover Amazing Images</h1>
              <p className="hero-subtitle">Search through millions of high-quality photos with stunning parallax effects</p>
              
              {/* Main Search */}
              <div className='search-section'>
                <Form onSubmit={handleSearch} className="main-search-form">
                  <div className="search-input-group">
                    <Form.Control
                      type='search'
                      placeholder='What are you looking for? (e.g., mountains, coffee, coding...)'
                      className='main-search-input'
                      ref={searchInput}
                    />
                    <Button variant="primary" type="submit" className="search-btn">
                      <i className="fas fa-search me-2"></i>
                      Search
                    </Button>
                  </div>
                </Form>
              </div>

              {/* Quick Filters */}
              <div className='filters-section'>
                <h5 className="filters-title">Trending Searches:</h5>
                <div className='filters'>
                  <div className="filter-chip" onClick={() => handleSelection('code')}>
                    <i className="fas fa-code me-1"></i>Code
                  </div>
                  <div className="filter-chip" onClick={() => handleSelection('hacker')}>
                    <i className="fas fa-laptop me-1"></i>Hacker
                  </div>
                  <div className="filter-chip" onClick={() => handleSelection('nature')}>
                    <i className="fas fa-tree me-1"></i>Nature
                  </div>
                  <div className="filter-chip" onClick={() => handleSelection('birds')}>
                    <i className="fas fa-dove me-1"></i>Birds
                  </div>
                  <div className="filter-chip" onClick={() => handleSelection('cats')}>
                    <i className="fas fa-cat me-1"></i>Cats
                  </div>
                  <div className="filter-chip" onClick={() => handleSelection('shoes')}>
                    <i className="fas fa-shoe-prints me-1"></i>Shoes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='main-content'>
        <Container>
          {/* Error Message */}
          {errorMsg && (
            <div className='alert alert-danger text-center error-message' role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {errorMsg}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="loading-container text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className='loading-text mt-3'>Loading amazing images...</p>
            </div>
          ) : (
            <>
              {/* Images Grid */}
              {images.length > 0 && (
                <div className='images-section'>
                  <div className="results-header d-flex justify-content-between align-items-center mb-4">
                    <h4>Search Results</h4>
                    <span className="results-count">Page {page} of {totalPages}</span>
                  </div>
                  <div className='images-grid'>
                    {images.map((image) => (
                      <div key={image.id} className="image-card">
                        <img
                          src={image.urls.small}
                          alt={image.alt_description}
                          className='image'
                        />
                        <div className="image-overlay">
                          <div className="image-info">
                            <p className="image-description">
                              {image.alt_description || 'Beautiful image'}
                            </p>
                            <div className="image-stats">
                              <small>
                                <i className="fas fa-heart me-1"></i>
                                {image.likes}
                              </small>
                              <small>
                                <i className="fas fa-eye me-1 ms-2"></i>
                                {image.views || 0}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className='pagination-section text-center mt-5'>
                      <div className="pagination-buttons">
                        <Button 
                          variant="outline-primary" 
                          onClick={() => setPage(page - 1)}
                          disabled={page <= 1}
                          className="pagination-btn"
                        >
                          <i className="fas fa-chevron-left me-2"></i>
                          Previous
                        </Button>
                        <span className="page-indicator mx-3">
                          Page {page} of {totalPages}
                        </span>
                        <Button 
                          variant="outline-primary" 
                          onClick={() => setPage(page + 1)}
                          disabled={page >= totalPages}
                          className="pagination-btn"
                        >
                          Next
                          <i className="fas fa-chevron-right ms-2"></i>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {images.length === 0 && !loading && (
                <div className="empty-state text-center py-5">
                  <i className="fas fa-images empty-icon"></i>
                  <h4>Ready to Explore?</h4>
                  <p>Search for images above or try our trending categories to get started</p>
                </div>
              )}
            </>
          )}
        </Container>
      </div>

      {/* Footer */}
      <footer className="footer bg-dark text-light text-center py-4">
        <Container>
          <p className="mb-0">
            Powered by <strong>Unsplash API</strong> • Made with <i className="fas fa-heart text-danger"></i> for developers
          </p>
        </Container>
      </footer>
    </>
  );
}

export default App;
