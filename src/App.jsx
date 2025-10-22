import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import './index.css'; // We'll create this for custom styles

const API_URL = 'https://api.unsplash.com/search/photos';
const IMAGES_PER_PAGE = 20;

function App() {
  const searchInput = useRef(null);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

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
      {/* Enhanced Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="custom-navbar">
        <Container>
          <Navbar.Brand href="#" className="brand">
            <i className="fas fa-camera me-2"></i>
            Image Gallery Pro
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarSupportedContent" />
          <Navbar.Collapse id="navbarSupportedContent">
            <Nav className="me-auto">
              <Nav.Link href="#" className="active">Home</Nav.Link>
              <Nav.Link href="#">Featured</Nav.Link>
              <NavDropdown title="Categories" id="navbarDropdown">
                <NavDropdown.Item onClick={() => handleSelection('nature')}>Nature</NavDropdown.Item>
                <NavDropdown.Item onClick={() => handleSelection('animals')}>Animals</NavDropdown.Item>
                <NavDropdown.Item onClick={() => handleSelection('technology')}>Technology</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => handleSelection('art')}>Art & Design</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link href="#">About</Nav.Link>
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

      {/* Main Content */}
      <div className='main-container'>
        <Container>
          {/* Hero Section */}
          <div className='hero-section text-center mb-5'>
            <h1 className='hero-title'>Discover Amazing Images</h1>
            <p className='hero-subtitle'>Search through millions of high-quality photos from Vishi.ai</p>
            
            {/* Main Search */}
            <div className='search-section mb-4'>
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
              <h5 className="filters-title">Popular Searches:</h5>
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
                <div className="filter-chip" onClick={() => handleSelection('elephant')}>
                  <i className="fas fa-paw me-1"></i>Elephant
                </div>
                <div className="filter-chip" onClick={() => handleSelection('toys')}>
                  <i className="fas fa-gamepad me-1"></i>Toys
                </div>
              </div>
            </div>
          </div>

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
                  <h4>No images found</h4>
                  <p>Try searching for something else or browse our popular categories</p>
                </div>
              )}
            </>
          )}
        </Container>
      </div>

      {/* Footer */}
      <footer className="footer bg-dark text-light text-center py-4 mt-5">
        <Container>
          <p className="mb-0">
            Made with <i className="fas fa-heart text-danger"></i> for developers <b>Vivek Agrahari</b>
          </p>
        </Container>
      </footer>
    </>
  );
}

export default App;






