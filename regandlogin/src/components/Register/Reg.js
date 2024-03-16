import React, { useState } from 'react';
import axios from 'axios';
import './Reg.css';

const Register = () => {
    const initialFormData = {
        username: '',
        email: '',
        password: '',
    };

    const [formData, setFormData] = useState(initialFormData);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/register', formData);
            console.log('Form submitted with data:', response.data);

            // Assuming your server sends a success message
            setSuccessMessage('User registered successfully');
            setErrorMessage('');
        } catch (error) {
            console.error('Registration failed:', error);

            // Handle registration error
            setSuccessMessage('');
            setErrorMessage('Registration failed');
        }
    };

    return (

        <div className='register-container'>
            <h2>Registration Form</h2>
            <form onSubmit={handleSubmit} className='register-form'>
                <div className='form-group'>
                    <label htmlFor='username'>UserName:</label>
                    <input type='text' id='username' name='username' value={formData.username} onChange={handleChange} required />
                </div>
                <div className='form-group'>
                    <label htmlFor='email'>Email:</label>
                    <input type='email' id='email' name='email' value={formData.email} onChange={handleChange} required />
                </div>
                <div className='form-group'>
                    <label htmlFor='password'>Password:</label>
                    <input type='password' id='password' name='password' value={formData.password} onChange={handleChange} required />
                </div>
                <div className='form-group'>
                    <button type='submit'>Register</button>
                </div>
            </form>

            {successMessage && <p className='success-message'>{successMessage}</p>}
            {errorMessage && <p className='error-message'>{errorMessage}</p>}
        </div>
    );
};
export default Register;