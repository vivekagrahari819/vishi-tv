import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // We'll create this CSS file

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
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-custom">
        <div className="container">
          <a className="navbar-brand" href="/">
            <i className="fas fa-rocket"></i>selling.com
          </a>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarContent"
          >
            <i className="fas fa-bars text-white"></i>
          </button>
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item active">
                <a className="nav-link" href="/">
                  <i className="fas fa-home"></i>Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/about">
                  <i className="fas fa-user-friends"></i>About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/gallery">
                  <i className="fas fa-images"></i>Gallery
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/contact">
                  <i className="fas fa-envelope"></i>Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          <h1 className='title'>Image Search Gallery</h1>
          
          {errorMsg && <p className='error-msg'>{errorMsg}</p>}
          
          <div className='search-section'>
            <Form onSubmit={handleSearch}>
              <Form.Control
                type='search'
                placeholder='Type something to search...'
                className='search-input'
                ref={searchInput}
              />
            </Form>
          </div>
          
          <div className='filters'>
            <div onClick={() => handleSelection('nature')}>Nature</div>
            <div onClick={() => handleSelection('technology')}>Technology</div>
            <div onClick={() => handleSelection('animals')}>Animals</div>
            <div onClick={() => handleSelection('travel')}>Travel</div>
            <div onClick={() => handleSelection('food')}>Food</div>
            <div onClick={() => handleSelection('sports')}>Sports</div>
            <div onClick={() => handleSelection('art')}>Art</div>
            <div onClick={() => handleSelection('architecture')}>Architecture</div>
          </div>
          
          {loading ? (
            <p className='loading'>Loading...</p>
          ) : (
            <>
              <div className='images-grid'>
                {images.map((image) => (
                  <div key={image.id} className="image-card">
                    <img
                      src={image.urls.small}
                      alt={image.alt_description}
                      className='image'
                    />
                    <div className="image-overlay">
                      <p className="image-description">
                        {image.alt_description || 'No description available'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {images.length > 0 && (
                <div className='pagination-buttons'>
                  {page > 1 && (
                    <Button 
                      variant="primary" 
                      onClick={() => setPage(page - 1)}
                      className="pagination-btn"
                    >
                      Previous
                    </Button>
                  )}
                  {page < totalPages && (
                    <Button 
                      variant="primary" 
                      onClick={() => setPage(page + 1)}
                      className="pagination-btn"
                    >
                      Next
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2023 selling.com. All rights reserved.</p>
          <div className="social-links">
            <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
            <a href="#" className="social-link"><i className="fab fa-facebook"></i></a>
            <a href="#" className="social-link"><i className="fab fa-linkedin"></i></a>
            <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
