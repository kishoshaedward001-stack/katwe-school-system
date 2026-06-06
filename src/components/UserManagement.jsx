import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'https://katwe-backend.onrender.com/api';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ User approved successfully!');
        fetchUsers();
      }
    } catch (error) {
      alert('❌ Failed to approve user');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`${API_URL}/users/${userId}`, { method: 'DELETE' });
        alert('✅ User deleted successfully!');
        fetchUsers();
      } catch (error) {
        alert('❌ Failed to delete user');
      }
    }
  };

  return (
    <div className="user-management-container">
      <div className="card">
        <div className="card-header">
          <h2><i className="fas fa-users"></i> User Management</h2>
        </div>
        <div className="card-body">
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Username</th><th>Email</th><th>Full Name</th><th>Phone</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.fullname || '-'}</td>
                      <td>{user.phone || '-'}</td>
                      <td>
                        {user.isapproved ? (
                          <span className="approved-badge">✓ Approved</span>
                        ) : (
                          <span className="pending-badge">⏳ Pending</span>
                        )}
                       </td>
                      <td>
                        {!user.isapproved && (
                          <button onClick={() => approveUser(user.id)} className="btn btn-sm btn-success">
                            <i className="fas fa-check"></i> Approve
                          </button>
                        )}
                        <button onClick={() => deleteUser(user.id)} className="btn btn-sm btn-danger">
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;