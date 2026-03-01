import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { env } from '../config/env';

// User service for database operations
export const userService = {
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  },

  /**
   * Find user by email with password
   */
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select('+password');
  },

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  },

  /**
   * Create a new user
   */
  async createUser(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<IUser> {
    return User.create(data);
  },

  /**
   * Verify user email
   */
  async verifyUser(email: string): Promise<IUser | null> {
    return User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );
  },

  /**
   * Update user password
   */
  async updatePassword(email: string, newPassword: string): Promise<IUser | null> {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return null;

    user.password = newPassword;
    await user.save();

    return user;
  },

  /**
   * Generate JWT token
   */
  generateToken(user: IUser): string {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN as string,
      } as jwt.SignOptions
    );
  },

  /**
   * Update user profile (name)
   */
  async updateProfile(id: string, data: { name: string }): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { name: data.name }, { new: true, runValidators: true });
  },

  /**
   * Get all users (admin)
   */
  async getAllUsers(): Promise<IUser[]> {
    return User.find().sort({ createdAt: -1 });
  },

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { id: string; email: string; role: string } | null {
    try {
      return jwt.verify(token, env.JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
      };
    } catch {
      return null;
    }
  },
};
