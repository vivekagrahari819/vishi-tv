import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const API_URL = 'https://api.unsplash.com/search/photos';
const IMAGES_PER_PAGE = 20;

// CSS Styles
const styles = `
:root {
  --primary-color: #4361ee;
  --secondary-color: #3a0ca3;
  --accent-color: #4cc9f0;
  --text-light: #f8f9fa;
  --text-dark: #212529;
  --transition-speed: 0.3s;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background-color: #f5f7fb;
  color: var(--text-dark);
  line-height: 1.6;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navigation Styles */
.navbar-custom {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--text-light);
  display: flex;
  align-items: center;
  transition: color var(--transition-speed);
  text-decoration: none;
}

.navbar-brand:hover {
  color: var(--accent-color);
}

.navbar-brand i {
  margin-right: 10px;
  font-size: 1.8rem;
}

.navbar-toggler {
  border: none;
  padding: 8px 12px;
  color: var(--text-light);
  font-size: 1.2rem;
}

.navbar-toggler:focus {
  box-shadow: none;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  padding: 15px 20px;
  border-radius: 8px;
  transition: all var(--transition-speed);
  display: flex;
  align-items: center;
  text-decoration: none;
}

.nav-link i {
  margin-right: 8px;
  font-size: 1.1rem;
}

.nav-link:hover {
  color: var(--text-light);
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active .nav-link {
  color: var(--text-light);
  background-color: rgba(255, 255, 255, 0.15);
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 40px 0;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: var(--secondary-color);
  font-weight: 700;
  font-size: 2.5rem;
}

.search-section {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.search-input {
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #e1e5ee;
  font-size: 1rem;
  width: 100%;
  max-width: 500px;
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(67, 97, 238, 0.25);
}

/* Filters */
.filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.filters div {
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e1e5ee;
  font-weight: 500;
  user-select: none;
}

.filters div:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
}

/* Images Grid */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.image-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  background: white;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 15px;
  transform: translateY(100%);
  transition: transform 0.3s;
}

.image-card:hover .image-overlay {
  transform: translateY(0);
}

.image-description {
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

/* Pagination */
.pagination-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

.pagination-btn {
  padding: 10px 25px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  background: var(--primary-color);
  color: white;
}

.pagination-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  background: var(--secondary-color);
}

/* Loading and Error States */
.loading {
  text-align: center;
  font-size: 1.2rem;
  color: var(--primary-color);
  margin: 50px 0;
}

.error-msg {
  text-align: center;
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid rgba(220, 53, 69, 0.2);
}

/* Footer */
.footer {
  background-color: var(--secondary-color);
  color: var(--text-light);
  padding: 30px 0;
  text-align: center;
  margin-top: auto;
}

.social-links {
  margin-top: 15px;
}

.social-link {
  color: var(--text-light);
  margin: 0 10px;
  font-size: 1.2rem;
  transition: color 0.3s;
  text-decoration: none;
}

.social-link:hover {
  color: var(--accent-color);
}

/* Responsive Design */
@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .filters {
    gap: 8px;
  }
  
  .filters div {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
  
  .nav-link {
    padding: 10px 15px;
  }
  
  .main-content {
    padding: 20px 0;
  }
}

@media (max-width: 576px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .search-input {
    max-width: 100%;
  }
  
  .filters {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 10px;
  }
  
  .filters div {
    flex-shrink: 0;
  }
}

/* Bootstrap overrides for better integration */
.container {
  max-width: 1200px;
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(67, 97, 238, 0.25);
}
`;

// Add styles to document head
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

function App() {
  const searchInput = useRef(null);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-search when component mounts
  useEffect(() => {
    // Set default search value and trigger search
    if (searchInput.current) {
      searchInput.current.value = 'nature';
      fetchImages();
    }
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
            import.meta.env.VITE_API_KEY || 'your-unsplash-access-key'
          }`
        );
        setImages(data.results);
        setTotalPages(data.total_pages);
        setLoading(false);
      }
    } catch (error) {
      setErrorMsg('Error fetching images. Try again later.');
      console.log('Error fetching images:', error);
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
            <p className='loading'>Loading beautiful images...</p>
          ) : (
            <>
              <div className='images-grid'>
                {images.map((image) => (
                  <div key={image.id} className="image-card">
                    <img
                      src={image.urls.small}
                      alt={image.alt_description || 'Beautiful image'}
                      className='image'
                      loading="lazy"
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
                    <button 
                      onClick={() => setPage(page - 1)}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                  )}
                  {page < totalPages && (
                    <button 
                      onClick={() => setPage(page + 1)}
                      className="pagination-btn"
                    >
                      Next
                    </button>
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
