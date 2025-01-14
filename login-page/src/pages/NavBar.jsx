import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation
import '../styles/NavBar.css'; // Import the CSS file for styling

const NavBar = () => {
  const navigate = useNavigate(); // Initialize navigate function

  const handleLogout = (e) => {
    e.preventDefault(); // Prevent the default link behavior
    console.log('Logging out...');    
    localStorage.clear(); // Clear stored user tokens or session data    
    navigate('/login'); // Redirect to the login page
  };

  return (
    <nav className="navbar">
      <ul>
        <li className="admin-title">Admin Dashboard</li>
        <div className="nav-links"> {/* Wrap links in a div for right alignment */}
          <li>
            <Link to="/account/account-list">Account List</Link>
          </li>
          <li>
            <Link to="/account/secret-phrases">Secret Phrases</Link>
          </li>
          <li>
            <Link to="/login" onClick={handleLogout}>
              Logout
            </Link>
          </li>
        </div>
      </ul>
    </nav>
  );
};

export default NavBar;
