import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './List.css';

const List = () => {
  const initialFormData = {
    username: '',
    email: '',
    password: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [updatedUserData, setUpdatedUserData] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      console.log('API response:', response.data);

      if (response.data && response.data.users && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        console.error('Invalid data structure received from the API:', response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [successMessage, errorMessage]);

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/delete/${userId}`);
      setSuccessMessage('User deleted successfully');
      // Fetch updated user list after deletion
      fetchUsers();
    } catch (error) {
      if (error.response?.status === 404) {
        setErrorMessage('User not found');
      } else {
        console.error('Deletion failed:', error.response?.data?.error || 'Unknown error');
        setErrorMessage(error.response?.data?.error || 'Unknown error');
      }
    }
  };

  const handleUpdate = (userId) => {
    const selectedUser = users.find((user) => user.userid === userId);
    if (selectedUser) {
      setUpdatedUserData(selectedUser);
      setSelectedUserId(userId);
    }
  };
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make a PUT request to update the user
      await axios.put(`http://localhost:5000/update/${selectedUserId}`, updatedUserData);
      setSuccessMessage('User updated successfully');

      // Reset the selected user and updated data
      setSelectedUserId(null);
      setUpdatedUserData(null);

      // Fetch the updated user list
      fetchUsers();
    } catch (error) {
      console.error('Update failed:', error.response?.data?.error || 'Unknown error');
      setErrorMessage(error.response?.data?.error || 'Unknown error');
    }
  };


  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/register', formData);
      setSuccessMessage('User added successfully');
      setFormData(initialFormData);
      // Fetch updated user list after addition
      fetchUsers();
    } catch (error) {
      console.error('User addition failed:', error.response?.data?.error || 'Unknown error');
      setErrorMessage(error.response?.data?.error || 'Unknown error');
    }
  };

  const maskPassword = (password) => '*'.repeat(password.length);

  return (
    <div>
      <h2>Details of Users</h2>

      <div className='container'>
        <div className='form-div'>
          <form onSubmit={handleAddUser}>
            <input
              type='text'
              placeholder='Enter name'
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <input
              type='text'
              placeholder='Enter email'
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type='text'
              placeholder='Enter password'
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button type='submit'>Add</button>
          </form>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Userid</th>
            <th>Username</th>
            <th>Email</th>
            <th>Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userid}>
              <td>{user.userid}</td>
              <td>{user.username}</td>
              <td>{maskPassword(user.password)}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => handleDelete(user.userid)}>Delete</button>
                <button onClick={() => handleUpdate(user.userid)}>Update</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Display information for the selected user to update */}
      {selectedUserId && updatedUserData && (
        <div>
          <h3>Update User</h3>
          <form onSubmit={handleUpdateSubmit}>
            <label>
              User ID:
              <input type='text' value={updatedUserData.userid} readOnly />
            </label>
            <label>
              Username:
              <input
                type='text'
                value={updatedUserData.username}
                onChange={(e) => setUpdatedUserData({ ...updatedUserData, username: e.target.value })}
              />
            </label>
            <label>
              Email:
              <input
                type='text'
                value={updatedUserData.email}
                onChange={(e) => setUpdatedUserData({ ...updatedUserData, email: e.target.value })}
              />
            </label>
            <label>
              Password:
              <input
                type='text'
                value={updatedUserData.password}
                onChange={(e) => setUpdatedUserData({ ...updatedUserData, password: e.target.value })}
              />
            </label>
            <button type='submit'>Submit Update</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default List;