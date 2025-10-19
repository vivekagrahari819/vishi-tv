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

/* Navigation Styles - Laptop Friendly */
.navbar-custom {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 0.8rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.4rem;
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
  font-size: 1.6rem;
}

.navbar-toggler {
  display: none;
  border: none;
  background: none;
  color: var(--text-light);
  font-size: 1.4rem;
  cursor: pointer;
  padding: 6px;
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
  gap: 0.5rem;
}

.nav-item {
  margin: 0;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  padding: 0.8rem 1.2rem;
  border-radius: 6px;
  transition: all var(--transition-speed);
  display: flex;
  align-items: center;
  text-decoration: none;
  white-space: nowrap;
  font-size: 0.95rem;
}

.nav-link i {
  margin-right: 6px;
  font-size: 1rem;
}

.nav-link:hover {
  color: var(--text-light);
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.nav-item.active .nav-link {
  color: var(--text-light);
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Main Content - Laptop Optimized */
.main-content {
  flex: 1;
  padding: 2.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.title {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--secondary-color);
  font-weight: 700;
  font-size: 2.2rem;
  line-height: 1.2;
}

.search-section {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.search-form {
  width: 100%;
  max-width: 500px;
}

.search-input {
  padding: 0.9rem 1.2rem;
  border-radius: 8px;
  border: 1px solid #e1e5ee;
  font-size: 1rem;
  width: 100%;
  transition: all 0.3s;
  background: white;
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(67, 97, 238, 0.25);
  outline: none;
}

/* Filters - Laptop Friendly */
.filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 2.5rem;
  padding: 0 1rem;
}

.filter-item {
  background: white;
  padding: 0.7rem 1.3rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e1e5ee;
  font-weight: 500;
  user-select: none;
  font-size: 0.9rem;
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

/* Images Grid - Laptop Optimized */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding: 0 0.5rem;
}

.image-card {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  background: white;
  aspect-ratio: 4/3;
}

.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
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
  padding: 1rem;
  transform: translateY(100%);
  transition: transform 0.3s;
}

.image-card:hover .image-overlay {
  transform: translateY(0);
}

.image-description {
  font-size: 0.85rem;
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
  gap: 1rem;
  margin-top: 2.5rem;
}

.pagination-btn {
  padding: 0.8rem 1.8rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  font-size: 0.95rem;
  min-width: 110px;
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
  font-size: 1.1rem;
  color: var(--primary-color);
  margin: 3rem 0;
  padding: 0 1rem;
}

.error-msg {
  text-align: center;
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(220, 53, 69, 0.2);
  font-size: 0.95rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.no-images {
  text-align: center;
  color: #6c757d;
  font-size: 1.05rem;
  margin: 3rem 0;
  padding: 0 1rem;
}

/* Footer */
.footer {
  background-color: var(--secondary-color);
  color: var(--text-light);
  padding: 2rem 0;
  text-align: center;
  margin-top: auto;
  width: 100%;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer p {
  margin-bottom: 0.8rem;
  font-size: 0.95rem;
}

.social-links {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1.2rem;
}

.social-link {
  color: var(--text-light);
  font-size: 1.1rem;
  transition: color 0.3s, transform 0.3s;
  text-decoration: none;
  padding: 0.5rem;
}

.social-link:hover {
  color: var(--accent-color);
  transform: translateY(-2px);
}

/* ========== RESPONSIVE DESIGN ========== */

/* Large Laptops and Desktops (1200px and above) */
@media (min-width: 1200px) {
  .navbar-container {
    max-width: 1400px;
    padding: 0 3rem;
  }
  
  .main-content {
    max-width: 1400px;
    padding: 3rem 3rem;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 2rem;
  }
  
  .footer-container {
    max-width: 1400px;
  }
}

/* Standard Laptops (1024px - 1199px) */
@media (max-width: 1199px) {
  .navbar-container {
    padding: 0 1.5rem;
  }
  
  .main-content {
    padding: 2rem 1.5rem;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.2rem;
  }
  
  .nav-link {
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }
}

/* Small Laptops and Large Tablets (992px - 1023px) */
@media (max-width: 1023px) {
  .navbar-container {
    padding: 0 1.2rem;
  }
  
  .main-content {
    padding: 1.8rem 1.2rem;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .nav-link {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .navbar-brand {
    font-size: 1.3rem;
  }
  
  .navbar-brand i {
    font-size: 1.4rem;
  }
}

/* Tablets (768px - 991px) */
@media (max-width: 991px) {
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
    padding: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    gap: 0.5rem;
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
    padding: 1rem 1.2rem;
    border-radius: 6px;
    font-size: 1rem;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }
  
  .filters {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 1rem;
    margin-left: -0.5rem;
    margin-right: -0.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
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

/* Mobile Devices (480px - 767px) */
@media (max-width: 767px) {
  .navbar-container {
    padding: 0 1rem;
  }
  
  .main-content {
    padding: 1.5rem 1rem;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.8rem;
  }
  
  .image-card {
    border-radius: 8px;
  }
  
  .filters {
    gap: 0.6rem;
  }
  
  .filter-item {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .search-input {
    padding: 0.8rem 1rem;
  }
}

/* Small Mobile Devices (360px - 479px) */
@media (max-width: 479px) {
  .navbar-container {
    padding: 0 0.8rem;
  }
  
  .main-content {
    padding: 1.2rem 0.8rem;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 0.6rem;
  }
  
  .title {
    font-size: 1.6rem;
  }
  
  .filter-item {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .pagination-buttons {
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
  }
  
  .pagination-btn {
    width: 100%;
    max-width: 180px;
  }
  
  .search-form {
    max-width: 100%;
  }
}

/* Very Small Mobile Devices (below 360px) */
@media (max-width: 359px) {
  .navbar-brand {
    font-size: 1.1rem;
  }
  
  .navbar-brand i {
    font-size: 1.2rem;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.5rem;
  }
  
  .title {
    font-size: 1.4rem;
  }
  
  .filter-item {
    padding: 0.4rem 0.7rem;
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
    transform: none;
  }
  
  .pagination-btn:hover {
    transform: none;
  }
}

/* High DPI Screens */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .image {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
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
      {/* Navigation Bar - Laptop Optimized */}
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
