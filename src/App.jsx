import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  overflow-x: hidden;
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
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.navbar-brand {
  font-weight: 700;
  font-size: clamp(1.2rem, 4vw, 1.5rem);
  color: var(--text-light);
  display: flex;
  align-items: center;
  transition: color var(--transition-speed);
  text-decoration: none;
  white-space: nowrap;
}

.navbar-brand:hover {
  color: var(--accent-color);
}

.navbar-brand i {
  margin-right: 10px;
  font-size: clamp(1.5rem, 4vw, 1.8rem);
}

.navbar-toggler {
  display: none;
  border: none;
  background: none;
  color: var(--text-light);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.navbar-toggler:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.navbar-nav {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
  gap: 5px;
}

.nav-item {
  margin: 0;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  padding: 12px 20px;
  border-radius: 8px;
  transition: all var(--transition-speed);
  display: flex;
  align-items: center;
  text-decoration: none;
  white-space: nowrap;
  font-size: clamp(0.9rem, 2vw, 1rem);
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
  padding: clamp(20px, 4vw, 40px) clamp(15px, 3vw, 20px);
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.title {
  text-align: center;
  margin-bottom: clamp(20px, 4vw, 30px);
  color: var(--secondary-color);
  font-weight: 700;
  font-size: clamp(1.8rem, 6vw, 2.5rem);
  line-height: 1.2;
}

.search-section {
  margin-bottom: clamp(20px, 4vw, 30px);
  display: flex;
  justify-content: center;
}

.search-form {
  width: 100%;
  max-width: min(600px, 90vw);
}

.search-input {
  padding: clamp(10px, 2vw, 12px) clamp(12px, 2vw, 15px);
  border-radius: 8px;
  border: 1px solid #e1e5ee;
  font-size: clamp(0.9rem, 2vw, 1rem);
  width: 100%;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(67, 97, 238, 0.25);
  outline: none;
}

/* Filters */
.filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: clamp(6px, 1.5vw, 10px);
  margin-bottom: clamp(20px, 4vw, 30px);
  padding: 0 10px;
}

.filter-item {
  background: white;
  padding: clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e1e5ee;
  font-weight: 500;
  user-select: none;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  text-align: center;
  flex-shrink: 0;
}

.filter-item:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
}

.filter-item:active {
  transform: translateY(0);
}

/* Images Grid */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(250px, 100%), 1fr));
  gap: clamp(10px, 2vw, 20px);
  margin-bottom: clamp(20px, 4vw, 30px);
  padding: 0 5px;
}

.image-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  background: white;
  aspect-ratio: 4/3;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.image {
  width: 100%;
  height: 100%;
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
  padding: clamp(10px, 2vw, 15px);
  transform: translateY(100%);
  transition: transform 0.3s;
}

.image-card:hover .image-overlay {
  transform: translateY(0);
}

.image-description {
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Pagination */
.pagination-buttons {
  display: flex;
  justify-content: center;
  gap: clamp(10px, 2vw, 15px);
  margin-top: clamp(20px, 4vw, 30px);
  flex-wrap: wrap;
}

.pagination-btn {
  padding: clamp(8px, 2vw, 10px) clamp(20px, 3vw, 25px);
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  font-size: clamp(0.9rem, 2vw, 1rem);
  min-width: 100px;
}

.pagination-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  background: var(--secondary-color);
}

.pagination-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.6;
}

/* Loading and Error States */
.loading {
  text-align: center;
  font-size: clamp(1rem, 3vw, 1.2rem);
  color: var(--primary-color);
  margin: clamp(30px, 6vw, 50px) 0;
  padding: 0 20px;
}

.error-msg {
  text-align: center;
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
  padding: clamp(12px, 2vw, 15px);
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid rgba(220, 53, 69, 0.2);
  font-size: clamp(0.9rem, 2vw, 1rem);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.no-images {
  text-align: center;
  color: #6c757d;
  font-size: clamp(1rem, 3vw, 1.1rem);
  margin: clamp(30px, 6vw, 50px) 0;
  padding: 0 20px;
}

/* Footer */
.footer {
  background-color: var(--secondary-color);
  color: var(--text-light);
  padding: clamp(20px, 4vw, 30px) 0;
  text-align: center;
  margin-top: auto;
  width: 100%;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer p {
  margin-bottom: 10px;
  font-size: clamp(0.9rem, 2vw, 1rem);
}

.social-links {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.social-link {
  color: var(--text-light);
  font-size: clamp(1rem, 3vw, 1.2rem);
  transition: color 0.3s, transform 0.3s;
  text-decoration: none;
  padding: 8px;
}

.social-link:hover {
  color: var(--accent-color);
  transform: translateY(-2px);
}

/* ========== RESPONSIVE DESIGN ========== */

/* Large Desktops (1440px and above) */
@media (min-width: 1440px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
  }
}

/* Tablets and Small Laptops (768px - 1024px) */
@media (max-width: 1024px) {
  .navbar-container {
    padding: 0 15px;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 15px;
  }
  
  .nav-link {
    padding: 10px 15px;
  }
}

/* Tablets (768px and below) */
@media (max-width: 768px) {
  .navbar-toggler {
    display: block;
  }
  
  .navbar-nav {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    padding: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    gap: 5px;
  }
  
  .navbar-nav.show {
    display: flex;
  }
  
  .nav-item {
    margin: 0;
    width: 100%;
  }
  
  .nav-link {
    justify-content: center;
    padding: 15px 20px;
    border-radius: 6px;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }
  
  .filters {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 15px;
    margin-left: -5px;
    margin-right: -5px;
    padding-left: 5px;
    padding-right: 5px;
  }
  
  .filters::-webkit-scrollbar {
    height: 4px;
  }
  
  .filters::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  .filters::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 10px;
  }
}

/* Mobile Devices (480px and below) */
@media (max-width: 480px) {
  .navbar-container {
    padding: 0 10px;
  }
  
  .main-content {
    padding: 15px 10px;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
  }
  
  .image-card {
    border-radius: 8px;
  }
  
  .filters {
    gap: 5px;
  }
  
  .filter-item {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  
  .pagination-buttons {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  
  .pagination-btn {
    width: 100%;
    max-width: 200px;
  }
  
  .search-form {
    max-width: 100%;
  }
}

/* Small Mobile Devices (360px and below) */
@media (max-width: 360px) {
  .navbar-brand {
    font-size: 1.1rem;
  }
  
  .navbar-brand i {
    font-size: 1.3rem;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 6px;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .filter-item {
    padding: 5px 10px;
    font-size: 0.75rem;
  }
}

/* Touch Device Optimizations */
@media (hover: none) and (pointer: coarse) {
  .image-card:hover {
    transform: none;
  }
  
  .image-overlay {
    transform: translateY(0);
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  }
  
  .filter-item:hover {
    transform: none;
  }
  
  .nav-link:hover {
    background-color: transparent;
  }
}

/* High DPI Screens */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .image {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

/* Print Styles */
@media print {
  .navbar-custom,
  .footer,
  .search-section,
  .filters,
  .pagination-buttons {
    display: none;
  }
  
  .images-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .image-card {
    break-inside: avoid;
  }
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
  const [isNavOpen, setIsNavOpen] = useState(false);

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

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNavOpen && !event.target.closest('.navbar-container')) {
        setIsNavOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isNavOpen]);

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar-custom">
        <div className="navbar-container">
          <a className="navbar-brand" href="/">
            <i className="fas fa-rocket"></i>selling.com
          </a>
          
          <button className="navbar-toggler" onClick={toggleNav} aria-label="Toggle navigation">
            <i className="fas fa-bars"></i>
          </button>
          
          <ul className={`navbar-nav ${isNavOpen ? 'show' : ''}`}>
            <li className="nav-item active">
              <a className="nav-link" href="/" onClick={() => setIsNavOpen(false)}>
                <i className="fas fa-home"></i>Home
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/about" onClick={() => setIsNavOpen(false)}>
                <i className="fas fa-user-friends"></i>About
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/gallery" onClick={() => setIsNavOpen(false)}>
                <i className="fas fa-images"></i>Gallery
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/contact" onClick={() => setIsNavOpen(false)}>
                <i className="fas fa-envelope"></i>Contact
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <h1 className='title'>Image Search Gallery</h1>
        
        {errorMsg && <p className='error-msg'>{errorMsg}</p>}
        
        <div className='search-section'>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type='search'
              placeholder='Type something to search...'
              className='search-input'
              ref={searchInput}
              aria-label="Search for images"
            />
          </form>
        </div>
        
        <div className='filters'>
          <div className="filter-item" onClick={() => handleSelection('nature')}>Nature</div>
          <div className="filter-item" onClick={() => handleSelection('technology')}>Technology</div>
          <div className="filter-item" onClick={() => handleSelection('animals')}>Animals</div>
          <div className="filter-item" onClick={() => handleSelection('travel')}>Travel</div>
          <div className="filter-item" onClick={() => handleSelection('food')}>Food</div>
          <div className="filter-item" onClick={() => handleSelection('sports')}>Sports</div>
          <div className="filter-item" onClick={() => handleSelection('art')}>Art</div>
          <div className="filter-item" onClick={() => handleSelection('architecture')}>Architecture</div>
        </div>
        
        {loading ? (
          <p className='loading'>Loading beautiful images...</p>
        ) : (
          <>
            {images.length === 0 ? (
              <p className='no-images'>No images found. Try a different search term.</p>
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
                
                <div className='pagination-buttons'>
                  <button 
                    onClick={() => setPage(page - 1)}
                    className="pagination-btn"
                    disabled={page <= 1}
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setPage(page + 1)}
                    className="pagination-btn"
                    disabled={page >= totalPages}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>&copy; 2023 selling.com. All rights reserved.</p>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="#" className="social-link" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
            <a href="#" className="social-link" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
            <a href="#" className="social-link" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
