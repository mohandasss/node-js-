const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/Person');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
const PORT =  3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

mongoose.connect('mongodb://localhost:27017/newdb', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).send('User registered successfully!');
});

// Public route
app.get('/', (req, res) => {
    res.send('Welcome to the public route!');
});


// Basic authentication middleware
const basicAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.sendStatus(401); // Unauthorized
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    // Find the user in the database
    const user = await User.findOne({ username });

    if (user && user.password === password) {
        return next(); // Access granted
    } else {
        return res.sendStatus(403); // Forbidden
    }
};

// Secure route
app.get('/secure', basicAuth, (req, res) => {
    res.send('Access granted to secure route!');
});


