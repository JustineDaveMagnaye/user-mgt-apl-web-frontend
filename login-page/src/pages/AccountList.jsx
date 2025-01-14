import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AccountList.css'; 
import { useNavigate } from "react-router-dom";
const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const [visibleDeviceIds, setVisibleDeviceIds] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const fetchAccounts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/user/list', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  useEffect(() => {
    if(localStorage.getItem('authority') == null){
      navigate('/login');
    }
    fetchAccounts();
  }, []);

  const handleResetDeviceId = async (event, accountId) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await axios.post('http://localhost:8080/user/reset-device-id', { id: accountId }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      console.log(`Device ID reset for account ${accountId}`);
      // Re-fetch accounts to refresh the table
      await fetchAccounts(); 
    } catch (error) {
      console.error(`Error resetting device ID for account ${accountId}:`, error);
    }
  };

  const toggleDeviceIdVisibility = (event, accountId) => {
    event.preventDefault();
    event.stopPropagation();
    setVisibleDeviceIds((prevState) => ({
      ...prevState,
      [accountId]: !prevState[accountId],
    }));
  };

  const toggleAccountLock = async (accountId, isLocked) => {
    try {
      const endpoint = isLocked ? 'http://localhost:8080/user/unlock' : 'http://localhost:8080/user/lock';
      await axios.post(endpoint, { id: accountId }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.id === accountId ? { ...account, locked: !account.locked } : account
        )
      );
    } catch (error) {
      console.error(`Error toggling lock for account ${accountId}:`, error);
    }
  };

  const handlePrintAllAccounts = () => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <html>
        <head>
          <title>Print Accounts</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Account List</h2>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Device ID</th>
                <th>Is Active</th>
                <th>Is Locked</th>
              </tr>
            </thead>
            <tbody>
              ${accounts
                .map(account => account.role !== 'ROLE_ADMIN' ? `
                  <tr>
                    <td>${account.username}</td>
                    <td>*****</td> <!-- Display as ***** for all Device IDs -->
                    <td>${account.active ? 'Yes' : 'No'}</td>
                    <td>${account.locked ? 'Yes' : 'No'}</td>
                  </tr>
                ` : '').join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
  
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };
  
  // Filter out accounts with the role "ROLE_ADMIN"
  const filteredAccounts = accounts.filter(
    (account) => 
      account.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      account.role !== 'ROLE_ADMIN' // Exclude ROLE_ADMIN accounts
  );

  return (
    <div className="admin-body">
      <div className="admin-box">
        <div className="admin-header">
          <h2>Account List</h2>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={handlePrintAllAccounts} className="small-button">
            Print All Accounts
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Device ID</th>
                <th>Is Active</th>
                <th>Is Locked</th>
              </tr>
            </thead>
            <tbody>
              {(searchTerm ? filteredAccounts : accounts).map((account) => (
                account.role !== 'ROLE_ADMIN' && (  // Check to ensure ROLE_ADMIN accounts are not rendered
                  <tr key={account.id}>
                    <td>{account.username}</td>
                    <td>
                      <span
                        onClick={(e) => toggleDeviceIdVisibility(e, account.id)}
                        className="toggle-device-id"
                      >
                        {account.deviceId === null
                          ? 'no device'
                          : visibleDeviceIds[account.id]
                          ? account.deviceId
                          : '**********'}
                      </span>
                      <span
                        onClick={(e) => handleResetDeviceId(e, account.id)}
                        className="reset-device-id"
                        title="Reset Device ID"
                      >
                        🔄
                      </span>
                    </td>
                    <td>{account.active ? 'Yes' : 'No'}</td>
                    <td>
                      <button
                        onClick={() => toggleAccountLock(account.id, account.locked)}
                      >
                        {account.locked ? 'Unlock' : 'Lock'}
                      </button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>

        {searchTerm && filteredAccounts.length === 0 && (
          <p>No accounts found for "{searchTerm}"</p>
        )}
      </div>
    </div>
  );
};

export default AccountList;
