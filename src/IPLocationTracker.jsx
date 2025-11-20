import React, { useState, useEffect, useRef } from 'react';
import './IPLocationTracker.css'; // We'll create this CSS file separately

const IPLocationTracker = () => {
  const [ipInfo, setIpInfo] = useState({
    ipv4: 'Detecting...',
    ipv6: 'Detecting...',
    isp: '-',
    country: '-',
    region: '-',
    city: '-',
    locationDetail: 'Locating your position...',
    ipv4Status: 'Detecting your public IPv4 address',
    ipv6Status: 'Detecting your IPv6 address',
    loading: true,
    error: null
  });

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  // Initialize the map
  const initMap = (lat, lon, accuracy) => {
    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    // Set zoom level based on accuracy
    let zoomLevel = 13;
    if (accuracy > 10000) zoomLevel = 10;
    else if (accuracy > 5000) zoomLevel = 11;
    else if (accuracy > 1000) zoomLevel = 12;

    mapInstance.current = L.map(mapRef.current).setView([lat, lon], zoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance.current);

    // Add accuracy circle if we have accuracy data
    if (accuracy) {
      L.circle([lat, lon], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: accuracy
      }).addTo(mapInstance.current);
    }

    // Create a custom icon
    const customIcon = L.divIcon({
      html: `<svg width="30" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#3b82f6" stroke="#1e40af" stroke-width="1"/>
                <circle cx="12" cy="9" r="3" fill="white"/>
            </svg>`,
      className: 'custom-marker',
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    });

    markerRef.current = L.marker([lat, lon], { icon: customIcon })
      .addTo(mapInstance.current)
      .bindPopup('<b>Your Approximate Location</b><br>Based on your IP address')
      .openPopup();
  };

  // Specialized function to detect IPv6
  const detectIPv6 = () => {
    return new Promise((resolve) => {
      // First try: Use a dedicated IPv6 detection service
      fetch('https://api6.ipify.org?format=json')
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(data => {
          resolve({
            ipv6: data.ip,
            source: 'ipify IPv6 API'
          });
        })
        .catch(() => {
          // Second try: Use another IPv6 service
          fetch('https://v6.ident.me/.json')
            .then(response => response.ok ? response.json() : Promise.reject())
            .then(data => {
              resolve({
                ipv6: data.address,
                source: 'ident.me IPv6 API'
              });
            })
            .catch(() => {
              // Third try: Check if the current connection is IPv6
              const rtc = new RTCPeerConnection({ iceServers: [] });
              rtc.createDataChannel('');
              rtc.createOffer()
                .then(offer => rtc.setLocalDescription(offer))
                .catch(() => { });

              rtc.onicecandidate = (ice) => {
                if (ice && ice.candidate && ice.candidate.candidate) {
                  const candidate = ice.candidate.candidate;
                  // Look for IPv6 addresses in the candidate string
                  const ipv6Regex = /([0-9a-fA-F]{1,4}(:[0-9a-fA-F]{1,4}){7})|([0-9a-fA-F]{1,4}(:[0-9a-fA-F]{1,4}){0,7}::[0-9a-fA-F]{0,4}(:[0-9a-fA-F]{1,4}){0,7})/g;
                  const matches = candidate.match(ipv6Regex);
                  if (matches && matches.length > 0) {
                    rtc.close();
                    resolve({
                      ipv6: matches[0],
                      source: 'WebRTC detection'
                    });
                    return;
                  }
                }
              };

              // Timeout after 2 seconds
              setTimeout(() => {
                rtc.close();
                resolve({
                  ipv6: null,
                  source: 'No IPv6 detected'
                });
              }, 2000);
            });
        });
    });
  };

  // Function to get IP and location information
  const getIPInfo = async () => {
    setIpInfo(prev => ({
      ...prev,
      loading: true,
      error: null,
      ipv4: 'Detecting...',
      ipv6: 'Detecting...',
      isp: '-',
      country: '-',
      region: '-',
      city: '-',
      locationDetail: 'Locating your position...',
      ipv4Status: 'Detecting your public IPv4 address',
      ipv6Status: 'Detecting your IPv6 address'
    }));

    try {
      // Get IPv4 and location info
      const [ipv4Response, locationResponse, ipv6Data] = await Promise.all([
        fetch('https://api.ipify.org?format=json').then(res => res.json()),
        fetch('https://ipapi.co/json/').then(res => res.json()),
        detectIPv6()
      ]);

      const locationData = locationResponse;

      setIpInfo(prev => ({
        ...prev,
        ipv4: ipv4Response.ip,
        ipv6: ipv6Data.ipv6 || 'Not Available',
        isp: locationData.org || 'Unknown',
        country: locationData.country_name || 'Unknown',
        region: locationData.region || 'Unknown',
        city: locationData.city || 'Unknown',
        locationDetail: locationData.city 
          ? `Located in ${locationData.city}${locationData.region ? `, ${locationData.region}` : ''}`
          : 'Precise location not available',
        ipv4Status: 'Public IPv4 address detected',
        ipv6Status: ipv6Data.ipv6 
          ? `IPv6 detected via ${ipv6Data.source}`
          : 'Your network doesn\'t support IPv6',
        loading: false
      }));

      // Initialize map with approximate location
      if (locationData.latitude && locationData.longitude) {
        initMap(locationData.latitude, locationData.longitude, 5000);
      }
    } catch (error) {
      console.error('Error:', error);
      // Fallback: Try a different API
      try {
        const fallbackResponse = await fetch('https://api.db-ip.com/v2/free/self');
        const fallbackData = await fallbackResponse.json();

        const ipv6Fallback = await detectIPv6();

        setIpInfo(prev => ({
          ...prev,
          ipv4: fallbackData.ipAddress || 'Not detected',
          ipv6: ipv6Fallback.ipv6 || 'Not Available',
          isp: fallbackData.organization || 'Unknown',
          country: fallbackData.countryName || 'Unknown',
          region: fallbackData.stateProv || 'Unknown',
          city: fallbackData.city || 'Unknown',
          locationDetail: fallbackData.city 
            ? `Located in ${fallbackData.city}`
            : 'Precise location not available',
          ipv4Status: 'Public IPv4 address detected',
          ipv6Status: ipv6Fallback.ipv6 
            ? `IPv6 detected via ${ipv6Fallback.source}`
            : 'Your network doesn\'t support IPv6',
          loading: false
        }));

        // Use approximate coordinates for the map
        initMap(19.0760, 72.8777, 15000);
      } catch (finalError) {
        setIpInfo(prev => ({
          ...prev,
          loading: false,
          error: 'Unable to retrieve your information. Please check your internet connection and try again.'
        }));
        console.error('Error fetching IP info:', finalError);
      }
    }
  };

  useEffect(() => {
    getIPInfo();

    // Cleanup function to remove map when component unmounts
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, []);

  const StatusIcon = ({ status }) => {
    if (status.includes('Detecting')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else if (status.includes('detected') || status.includes('detected via')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
  };

  return (
    <div className="container">
      <div className="info-panel">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        
        <div className="header">
          <h1>IP Address & Location Tracker</h1>
          <p className="subtitle">Discover your IP addresses and precise location information in real-time</p>
        </div>
        
        <div className="ip-display">
          <div className="ip-section">
            <div className="ip-type">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.7764 3 12 3C8.22355 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              IPv4 Address
            </div>
            <div className="ip-address">{ipInfo.ipv4}</div>
            <div className="ip-status">
              <StatusIcon status={ipInfo.ipv4Status} />
              <span>{ipInfo.ipv4Status}</span>
            </div>
          </div>
          
          <div className="ip-section">
            <div className="ip-type">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.7764 3 12 3C8.22355 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              IPv6 Address
            </div>
            <div className="ip-address">{ipInfo.ipv6}</div>
            <div className="ip-status">
              <StatusIcon status={ipInfo.ipv6Status} />
              <span>{ipInfo.ipv6Status}</span>
            </div>
          </div>
        </div>
        
        <div className="details-grid">
          <div className="detail-card">
            <div className="detail-label">Internet Service Provider</div>
            <div className="detail-value">{ipInfo.isp}</div>
          </div>
          
          <div className="detail-card">
            <div className="detail-label">Country</div>
            <div className="detail-value">{ipInfo.country}</div>
          </div>
          
          <div className="detail-card">
            <div className="detail-label">Region/State</div>
            <div className="detail-value">{ipInfo.region}</div>
          </div>
          
          <div className="detail-card">
            <div className="detail-label">City & District</div>
            <div className="detail-value">{ipInfo.city}</div>
            <div className="location-pin">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#3b82f6"/>
              </svg>
              <span>{ipInfo.locationDetail}</span>
            </div>
          </div>
        </div>
        
        {ipInfo.loading && (
          <div className="loader"></div>
        )}
        
        {ipInfo.error && (
          <div className="error">{ipInfo.error}</div>
        )}
        
        <button onClick={getIPInfo} disabled={ipInfo.loading}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '10px'}}>
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="white"/>
          </svg>
          {ipInfo.loading ? 'Refreshing...' : 'Refresh Information'}
        </button>
      </div>
      
      <div className="map-panel">
        <div ref={mapRef} id="map"></div>
      </div>
    </div>
  );
};

export default IPLocationTracker;
