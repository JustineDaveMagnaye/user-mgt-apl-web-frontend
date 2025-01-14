// src/pages/SecretPhrases.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SecretPhrases.css';
import { useNavigate } from "react-router-dom";
import SecretPhraseModal from './SecretPhraseModal';

const SecretPhrases = () => {
  const [secretPhrases, setSecretPhrases] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhrases, setSelectedPhrases] = useState(new Set());
  const [visibleSecretPhrases, setVisibleSecretPhrases] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const navigate = useNavigate();


  // Fetch secret phrases from the backend
  const fetchSecretPhrases = async () => {
    try {
      const response = await axios.get('http://localhost:8080/secret-phrase/list', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setSecretPhrases(response.data);
    } catch (error) {
      console.error('Error fetching secret phrases:', error);
    }
  };

  useEffect(() => {
    if(localStorage.getItem('authority') == null){
      navigate('/login');
    }
    fetchSecretPhrases();
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handlePrintSelectedPhrases = () => {
    const selectedSecretPhrases = secretPhrases.filter((phrase) => selectedPhrases.has(phrase.id));

    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <html>
        <head>
          <title>Print Selected Secret Phrases</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h3 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h3>Selected Secret Phrases</h3>
          <table>
            <thead>
              <tr>
                <th>Employee Number</th>
                <th>Secret Phrase</th>
              </tr>
            </thead>
            <tbody>
              ${selectedSecretPhrases
                .map(
                  (phrase) => `
                  <tr>
                    <td>${phrase.employee.employeeNumber}</td>
                    <td>${phrase.secretPhrase}</td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const toggleSecretPhraseVisibility = (phraseId) => {
    setVisibleSecretPhrases((prevState) => ({
      ...prevState,
      [phraseId]: !prevState[phraseId],
    }));
  };

  const handleCheckboxChange = (phraseId) => {
    setSelectedPhrases((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(phraseId)) {
        newSelected.delete(phraseId);
      } else {
        newSelected.add(phraseId);
      }
      return newSelected;
    });
  };

  const filteredSecretPhrases = secretPhrases.filter((phrase) => {
    const matchesSearchQuery = phrase.employee.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const isSelected = selectedPhrases.has(phrase.id);
    return matchesSearchQuery && (!showSelectedOnly || isSelected);
  });

  return (
    <div className="admin-body">
      <div className="admin-box">
        <div className="admin-header">
          <h2>Secret Phrase List</h2>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search Employee Number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button onClick={openModal} className="small-button">Generate Secret Phrase</button>
          <button
            onClick={handlePrintSelectedPhrases}
            className="small-button"
            disabled={selectedPhrases.size === 0}
          >
            Print Secret Phrase
          </button>
          <button
            onClick={() => setShowSelectedOnly((prev) => !prev)}
            className={`small-button ${showSelectedOnly ? 'active' : ''}`}
          >
            {showSelectedOnly ? 'Show All' : 'Show Selected'}
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>Employee Number</th>
                <th>Secret Phrase</th>
              </tr>
            </thead>
            <tbody>
              {filteredSecretPhrases.map((phrase) => (
                <tr key={phrase.id} className={selectedPhrases.has(phrase.id) ? 'selected-row' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedPhrases.has(phrase.id)}
                      onChange={() => handleCheckboxChange(phrase.id)}
                    />
                  </td>
                  <td>{phrase.employee.employeeNumber}</td>
                  <td>
                    <span
                      onClick={() => toggleSecretPhraseVisibility(phrase.id)}
                      className="toggle-phrase"
                    >
                      {visibleSecretPhrases[phrase.id] ? phrase.secretPhrase : '**********'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SecretPhraseModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onGenerateSuccess={fetchSecretPhrases} // Refresh list after generating a new phrase
        />
      </div>
    </div>
  );
};

export default SecretPhrases;
