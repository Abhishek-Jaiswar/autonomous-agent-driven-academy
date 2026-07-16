import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../config/database.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

export const authService = {
  /**
   * Hashes a password and registers a new User record in PostgreSQL.
   */
  async registerUser(email: string, rawPassword: string) {
    logger.info(`[AuthService] Attempting to register user with email: ${email}`);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn(`[AuthService] User registration failed — email already exists: ${email}`);
      throw new Error("Email is already registered");
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(rawPassword, saltRounds);

    // Save to Database
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    logger.info(`[AuthService] User registered successfully: ${user.id}`);
    return { id: user.id, email: user.email };
  },

  /**
   * Validates credentials and returns a JWT token.
   */
  async authenticateUser(email: string, rawPassword: string) {
    logger.info(`[AuthService] Authenticating user: ${email}`);

    // Fetch user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.warn(`[AuthService] Authentication failed — user not found: ${email}`);
      throw new Error("Invalid email or password");
    }

    // Verify password match
    const isPasswordValid = await bcrypt.compare(rawPassword, user.passwordHash);

    if (!isPasswordValid) {
      logger.warn(`[AuthService] Authentication failed — invalid password for user: ${email}`);
      throw new Error("Invalid email or password");
    }

    // Sign JWT token
    const tokenPayload = { id: user.id, email: user.email };
    const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    logger.info(`[AuthService] User authenticated successfully: ${user.id}`);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  },
};
