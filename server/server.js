const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '360abhijeetratan.bt@gmail.com',
        pass: 'jonq oldn htqw hjxm', // Replace with your App Password if using 2FA
    },
});

// Map of users to store email-OTP mappings
const otpMap = new Map();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ROOT',
    database: 'employee',
});

db.connect((err) => {
    if (err) {
        console.error("Db connection error", err);
    } else {
        console.log("Db is connected");
    }
});

// CREATE TABLE query
db.query(
    "CREATE TABLE IF NOT EXISTS userss ( userid INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL)",
    (err) => {
        if (err) {
            console.error("Table creation error", err);
        } else {
            // If table creation is successful, reset AUTO_INCREMENT
            db.query("ALTER TABLE userss AUTO_INCREMENT = 1", (err) => {
                if (err) {
                    console.error("Error resetting AUTO_INCREMENT:", err);
                } else {
                    console.log("AUTO_INCREMENT reset successfully");
                }
            });
        }
    }
);

app.use(express.json());
// Register a new user
app.post("/register", async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        db.query(
            "INSERT INTO userss (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword],
            (err) => {
                if (err) {
                    console.error("Registration error", err);
                    res.status(500).json({ error: "Internal server error" });
                } else {
                    console.log(`User registered: ${username}`);
                    res.status(201).json({ message: "User registered" });
                }
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Login user
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        db.query(
            "SELECT * FROM userss WHERE username=?",
            [username],
            async (err, result) => {
                if (err) {
                    console.error("Error retrieving user:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                if (result.length > 0) {
                    const user = result[0];
                    const passwordMatch = await bcrypt.compare(password, user.password);

                    if (passwordMatch) {
                        const token = jwt.sign({ username }, "your-secret-key");
                        console.log(`User logged in: ${username}`);
                        console.log(`Token generated: ${token}`);
                        return res.status(200).json({ token });
                    } else {
                        console.log(`Invalid credentials for user: ${username}`);
                        return res.status(401).json({ error: "Invalid credentials" });
                    }
                } else {
                    console.log(`User not found: ${username}`);
                    return res.status(401).json({ error: "Invalid credentials" });
                }
            }
        );
    } catch (error) {
        console.error("Login failed:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/users', (req, res) => {
    try {
        db.query("SELECT * FROM userss", (err, result) => {
            if (err) {
                console.error("Error in retrieving", err);
                res.status(500).json({ error: "Internal server error" });
            } else {
                res.status(200).json({ message: 'Users found', users: result });
            }
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ... (previous code)

app.delete('/delete/:userid', (req, res) => {
    const userid = req.params.userid;
    db.query("DELETE FROM userss WHERE userid = ?", [userid], (err, results) => {
        if (err) {
            console.error("Error deleting user:", err);
            res.status(500).send("Error deleting user");
        } else {
            if (results.affectedRows > 0) {
                console.log("Data deleted successfully");
                res.status(200).send("Data deleted successfully");
            } else {
                console.log("User not found");
                res.status(404).send("User not found");
            }
        }
    });
});

app.put('/update/:userid', (req, res) => {
    const userid = req.params.userid;
    const { username, email, password } = req.body;

    // Validate inputs
    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required for update" });
    }

    db.query(
        "UPDATE userss SET username = ?, email = ?, password = ? WHERE userid = ?",
        [username, email, password, userid],
        (err, results) => {
            if (err) {
                console.error("Error updating user:", err);
                return res.status(500).json({ error: "Internal server error" });
            }

            if (results.affectedRows === 0) {
                // No rows were updated, meaning the user with the given ID was not found
                return res.status(404).json({ error: "User not found" });
            }

            console.log("User updated successfully");
            res.status(200).json({ message: "User updated successfully" });
        }
    );
});

// Send OTP via email
app.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required for OTP' });
        }

        const otp = speakeasy.totp({
            secret: speakeasy.generateSecret({ length: 20 }).base32,
            step: 60,
        });

        otpMap.set(email, { otp, secret: otp.secret });

        console.log('Generated OTP:', otp);

        const mailOptions = {
            from: '360abhijeetratan.bt@gmail.com',
            to: email,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ success: false, error: 'Internal server error' });
            }
            res.json({ success: true, message: 'OTP sent to email for verification' });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
