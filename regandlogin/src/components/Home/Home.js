import React from "react";
import Navbar from "./Navbar/Navbar"

import reg from "../Register/Reg"
import Login from "../Login/Login";
import Header from "./Header/Header"
import Footer from "./Footer/Footer";
import './Home.css'
import Register from "../Register/Reg";
import List from "../List/List";
const Home = ({ currentPage, onPageChange }) => {
    return (
        <div className="home">
            <Header />
            <Navbar onPageChange={onPageChange} />
            {currentPage === 'home' && <h2>Welcome</h2>}
            {currentPage === 'register' && <Register />}
            {currentPage === 'login' && <Login />}
            {currentPage === 'List' && <List />}
            <Footer />
        </div>
    )
}
export default Home;
