// CustomNavbar.js
import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';

const CustomNavbar = ({ onPageChange }) => {
    const handlePageChange = (page) => {
        onPageChange(page);
    };

    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand href="#home">TICHKULU & Sons</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link onClick={() => handlePageChange('home')}>Home</Nav.Link>
                    <Nav.Link onClick={() => handlePageChange('about')}>About</Nav.Link>
                    <Nav.Link onClick={() => handlePageChange('contact')}>Contact</Nav.Link>
                    <Nav.Link onClick={() => handlePageChange("List")}>List</Nav.Link>
                </Nav>
                <Nav className="ml-auto">
                    <Nav.Link className="signup-link" onClick={() => handlePageChange('register')}>
                        Sign Up
                    </Nav.Link>
                    <Nav.Link className="login-link" onClick={() => handlePageChange('login')}>
                        Login
                    </Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default CustomNavbar;
