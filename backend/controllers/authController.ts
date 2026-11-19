import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, User } from '../models/db.js';
import { generateToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register a new user
 */
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      res.status(400).json({ success: false, message: 'All fields are required.' });
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      res.status(400).json({ success: false, message: 'Full Name must be at least 2 characters.' });
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    // Check if user already exists
    const existingUser = db.users.findByEmail(trimmedEmail);
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email already exists. Please login.' });
      return;
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      email: trimmedEmail,
      password_hash,
      created_at: new Date().toISOString(),
    };

    db.users.create(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please login to continue.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed due to a server error. Please try again.' });
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = db.users.findByEmail(trimmedEmail);

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed due to a server error. Please try again.' });
  }
}

/**
 * Get current user profile and learning statistics
 */
export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const user = db.users.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const userDocuments = db.documents.findByUser(userId);
    const questionsCount = db.questions.countByUser(userId);
    const attemptsCount = db.mcqAttempts.countByUser(userId);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
      stats: {
        documentsCount: userDocuments.length,
        questionsCount,
        mcqsAttempted: attemptsCount,
      },
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}
