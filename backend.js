const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors());
app.use(cookieParser());  // Initialize cookie parser

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/Authentication")
  .then(() => console.log("MongoDB Connected!"))
  .catch(err => console.log('Mongo Error:', err));

// Auth Schema
const authSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password1: {
    type: String,
    required: true,
  },
  token: {
    type: String
  }
});

// Auth Model
const AuthData = mongoose.model("AuthData", authSchema);

// Save User's Data (Registration)
app.post('/save-note', async (req, res) => {
  const { firstName, lastName, email, password1 } = req.body;

  try {
    // Encrypt the password
    const encPass = await bcrypt.hash(password1, 8);

    // Create new user document
    const authData = new AuthData({
      firstName,
      lastName,
      email,
      password1: encPass
    });

    // Generate JWT token
    const token = jwt.sign({ id: authData._id }, 'secret.key', { expiresIn: '1h' });

    // Assign token to the user object
    authData.token = token;

    // Save to DB
    await authData.save();

    // Send token in an httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,  // Prevents JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === 'production',  // Only send cookies over HTTPS in production
      maxAge: 3600000  // Cookie expires in 1 hour
    });

    // Don't send password back
    const userResponse = {
      success: true,
      message: 'Data saved successfully',
      user: {
        firstName: authData.firstName,
        lastName: authData.lastName,
        email: authData.email,
      }
    };

    res.json(userResponse);

  } catch (err) {
    console.error('Error saving data:', err.message);
    if (err.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Email is already registered',
        error: err.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save data',
        error: err.message
      });
    }
  }
});

// Compare user data with DB data (Login)
app.post('/login-note', async (req, res) => {
  const { email, password1 } = req.body;

  try {
    const user = await AuthData.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This email doesn't exist"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password1, user.password1);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password"
      });
    }

    const token = jwt.sign({ id: user._id }, 'secret.key', { expiresIn: '1h' });

    user.token = token;
    await user.save();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000
    });

    res.json({
      success: true,
      message: "Login successful",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message
    });
  }
});

// Delete Account
app.delete('/delete-account', async (req, res) => {
  const { email, password1 } = req.body;

  try {
    const user = await AuthData.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No user found with this email"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password1, user.password1);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password"
      });
    }

    await AuthData.deleteOne({ email });

    res.clearCookie('token');  // Remove cookie

    res.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error("Account deletion error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during account deletion",
      error: error.message
    });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;  // Get token from the cookie

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token not provided, please login'
    });
  }

  // Verify token and extract user ID
  jwt.verify(token, 'secret.key', (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Attach the decoded user info (user ID) to the request
    req.user = decoded;  // Save decoded user info to `req.user`
    next();  // Proceed to the next middleware/route handler
  });
};

// Get User's Email (Protected Route)
app.get('/get-user-email', verifyToken, async (req, res) => {
  try {
    const user = await AuthData.findById(req.user.id);  
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      email: user.email
    });
  } catch (error) {
    console.error('Error fetching user email:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching user email',
      error: error.message
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
