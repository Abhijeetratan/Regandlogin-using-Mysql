import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const useForm = (initialState) => {
    const [values, setValues] = useState(initialState);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prevValues) => ({ ...prevValues, [name]: value }));
    };

    return [values, handleChange];
};

const Login = () => {
    const [formData, setFormData] = useForm({
        username: '',
        password: '',
        otp: '',
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [showOTPField, setShowOTPField] = useState(false);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/login', formData);
            const { requiresOTP, message, token } = response.data;

            if (requiresOTP) {
                setShowOTPField(true);
                setSuccessMessage(message || 'OTP required');
            } else {
                setSuccessMessage('User login successful');
                console.log('Token:', token); // Log the token to the console
                console.log('Login successful'); // Log the success message to the console
            }

            setErrorMessage('');
            setShowAlert(true);
        } catch (error) {
            console.error('Login failed:', error.response?.data?.error || 'Unknown error');
            setErrorMessage(error.response?.data?.error || 'Unknown error');
            setSuccessMessage('');

            if (error.response?.data?.requiresOTP) {
                setShowOTPField(true);
                setSuccessMessage(error.response?.data?.message || 'OTP required');
            }

            setShowAlert(true);
        }
    };

    const handleOTPSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post('http://localhost:5000/verify-otp', {
                username: formData.username,
                otp: formData.otp,
            });

            setSuccessMessage('OTP verification successful');
            console.log('Login successful'); // Log the success message to the console
            setErrorMessage('');
            setShowAlert(true);

            // Additional logic if OTP verification is successful (e.g., update password)
        } catch (error) {
            console.error('OTP verification failed:', error.response?.data?.error || 'Unknown error');
            setErrorMessage(error.response?.data?.error || 'Unknown error');
            setSuccessMessage('');
            setShowAlert(true);
        }
    };

    return (
        <div className="login-container">
            <h2>Login Form</h2>
            <form onSubmit={showOTPField ? handleOTPSubmit : handleLoginSubmit} className="login-form">
                <div className="form-group">
                    <label>Username:</label>
                    <input type="text" name="username" value={formData.username} onChange={setFormData} required />
                </div>

                <div className="form-group">
                    <label>Password:</label>
                    <input type="password" name="password" value={formData.password} onChange={setFormData} required />
                </div>

                {showOTPField && (
                    <div className="form-group">
                        <label>OTP:</label>
                        <input type="text" name="otp" value={formData.otp} onChange={setFormData} required />
                    </div>
                )}

                <button type="submit">Login</button>

                {showAlert && (
                    <div className={errorMessage ? 'error-message' : 'success-message'}>
                        {errorMessage || successMessage}
                    </div>
                )}
            </form>
        </div>
    );
};

export default Login;
