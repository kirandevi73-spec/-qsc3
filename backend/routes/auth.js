const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ethers } = require('ethers');
const crypto = require('crypto');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// Connect to existing db
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ users: [] }).write();

const JWT_SECRET = process.env.JWT_SECRET || 'qsc3_super_secret_key_for_jwt_2024';

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existingUser = db.get('users').find({ email }).value();
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      type: 'email',
      createdAt: new Date().toISOString()
    };

    db.get('users').push(newUser).write();

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, type: 'email' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: { email: newUser.email, type: 'email' } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.get('users').find({ email }).value();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'email' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { email: user.email, type: 'email' } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Store nonces temporarily in memory since they are short-lived.
const nonceStore = new Map();

// POST /metamask/nonce
router.post('/metamask/nonce', (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }

    const nonce = `QSC3-Auth-Nonce-${crypto.randomBytes(16).toString('hex')}`;
    nonceStore.set(address.toLowerCase(), nonce);

    res.json({ nonce });
  } catch (error) {
    console.error('Nonce error:', error);
    res.status(500).json({ error: 'Server error generating nonce' });
  }
});

// POST /metamask/verify
router.post('/metamask/verify', async (req, res) => {
  try {
    const { address, signature } = req.body;
    if (!address || !signature) {
      return res.status(400).json({ error: 'Address and signature required' });
    }

    const lowerAddress = address.toLowerCase();
    const nonce = nonceStore.get(lowerAddress);

    if (!nonce) {
      return res.status(400).json({ error: 'Nonce not found or expired. Please request a new nonce.' });
    }

    const message = `Please sign this nonce to login to QSC3: ${nonce}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== lowerAddress) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Nonce is single-use
    nonceStore.delete(lowerAddress);

    let user = db.get('users').find({ address: lowerAddress }).value();
    
    if (!user) {
      user = {
        id: crypto.randomUUID(),
        address: lowerAddress,
        type: 'wallet',
        createdAt: new Date().toISOString()
      };
      db.get('users').push(user).write();
    }

    const token = jwt.sign(
      { id: user.id, address: user.address, type: 'wallet' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { address: user.address, type: 'wallet' } });
  } catch (error) {
    console.error('MetaMask verify error:', error);
    res.status(500).json({ error: 'Server error verifying signature' });
  }
});

// GET /verify
router.get('/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists in DB
    let user;
    if (decoded.type === 'wallet') {
      user = db.get('users').find({ address: decoded.address }).value();
    } else {
      user = db.get('users').find({ email: decoded.email }).value();
    }

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    res.json({ valid: true, user: { email: user.email, address: user.address, type: decoded.type } });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
