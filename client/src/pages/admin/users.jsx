import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './admin.css';
const AdminUsers = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/auth');
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user, navigate]);
  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/auth/${id}`);
        setUsers(users.filter(u => u._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Manage Users</h2>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="table-wrapper">
        <table className="table admin-users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>ADMIN</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u._id.substring(0, 8)}...</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  {u.isAdmin ? (
                    <span className="badge badge-success">YES</span>
                  ) : (
                    <span className="badge badge-neutral">NO</span>
                  )}
                </td>
                <td className="table-actions">
                  <Link to={`/admin/user/${u._id}/edit`} className="btn btn-light">
                    Edit
                  </Link>
                  <button className="btn btn-danger" onClick={() => deleteHandler(u._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
};
export default AdminUsers;
