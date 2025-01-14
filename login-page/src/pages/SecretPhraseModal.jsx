// src/pages/SecretPhraseModal.jsx
import React, { useState } from 'react';
import '../styles/SecretPhraseModal.css';
import axios from 'axios';

const SecretPhraseModal = ({ isOpen, onClose, onGenerateSuccess }) => {
  const [employeeNumber, setEmployeeNumber] = useState('');

  const handleGenerateSecretPhrase = async () => {
    if (employeeNumber) {
      const userData = {
        employee: {
          employeeNumber: employeeNumber
        }
      };

      try {
        const response = await axios.post('http://localhost:8080/secret-phrase/generate-secret-phrase', userData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });

        if (response.status === 200) {
          console.log('Secret phrase generated successfully');
          onGenerateSuccess(); // Trigger re-fetch of phrases
        }

      } catch (error) {
        console.error('Error generating secret phrase:', error);
      }

      onClose(); // Close the modal after handling the request
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Generate Secret Phrase</h3>
        <button className="close-button" onClick={onClose}>&times;</button>
        
        <input
          type="text"
          placeholder="Enter employee number"
          value={employeeNumber}
          onChange={(e) => setEmployeeNumber(e.target.value)}
          className="modal-input"
        />
        <button
          onClick={handleGenerateSecretPhrase}
          disabled={!employeeNumber}
          className="modal-button"
        >
          Generate
        </button>
      </div>
    </div>
  );
};

export default SecretPhraseModal;
