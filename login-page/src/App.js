import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AccountList from "./pages/AccountList"; 
import SecretPhrases from "./pages/SecretPhrases"; 
import NavBar from "./pages/NavBar"; 

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/account/*" element={<AccountWrapper />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

const AccountWrapper = () => {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="account-list" element={<AccountList />} />
        <Route path="secret-phrases" element={<SecretPhrases />} />
      </Routes>
    </>
  );
};

export default App;
