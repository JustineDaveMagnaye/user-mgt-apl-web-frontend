import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/Login.css';

import { FaUser } from "react-icons/fa";
import { TbEyeClosed, TbEyeUp } from "react-icons/tb";
import logo from '../assets/logo.png';
import { jwtDecode } from 'jwt-decode';


const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const userData = {
      username,
      password
    };

    try {
      const response = await axios.post('http://localhost:8080/user/login-admin', userData);
      if (response.status === 200) {
        const token = response.headers['jwt-token'];
        if (token) {
          const tokenDecoded = jwtDecode(token);
          const authorities = tokenDecoded.authorities;

          localStorage.setItem('token', token);
          localStorage.setItem('exp', tokenDecoded.exp);
          localStorage.setItem('role', authorities[0]);
          if (authorities.includes('ROLE_ROLE_ADMIN')) {
            localStorage.setItem('authority', 'ROLE_ADMIN_ADMIN');
            navigate('/account/account-list');
          } else {
            setErrorMessage('Unauthorized access.');
          }
        }
      } else {
        alert('Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Error:', error.message);
      setErrorMessage(error.response.data)
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="semi-body">
      <div className="form-box-login">
        <form onSubmit={handleLogin} className="form-container-login">
          <div className="header">
            <div className="logo">
              <img src={logo} alt="Logo" id="logo" />
            </div>
            <h1>Login</h1>
          </div>

          <div className="field-box">
            <label>Username</label>
            <div className="insert">
              <input type="text" required onChange={(e) => setUsername(e.target.value)} />
              <FaUser className="icon" />
            </div>
          </div>
          {errorMessage && errorMessage === 'Username not found!' && <p className="error-message">{errorMessage}</p>}


          <div className="field-box field-box-password">
            <label>Password</label>
            <div className="insert">
              <input type={showPassword ? "text" : "password"} required onChange={(e) => setPassword(e.target.value)} />
              {showPassword ? (
                <TbEyeUp className="icon" onClick={togglePasswordVisibility} />
              ) : (
                <TbEyeClosed className="icon" onClick={togglePasswordVisibility} />
              )}
            </div>
          </div>
          {errorMessage && errorMessage === 'Incorrect Password!' && <p className="error-message">{errorMessage}</p>}

          {errorMessage && errorMessage === "You don't have enough permission to be here!" && <p className="error-message">{errorMessage}</p>}

          <button type="submit" className="login">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
