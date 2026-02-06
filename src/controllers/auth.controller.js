const dbConnection = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../helpers/responseHandler");

const checkIfUserExists = (email) => {
  const query = `SELECT * FROM users WHERE email = ?`;
  return new Promise((resolve, reject) => {
    dbConnection.query(query, [email], (err, result) => {
      if (err) return reject(err);
      resolve(result.length > 0);
    });
  });
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, name, email, password: enteredPassword } = req.body;

    const userExists = await checkIfUserExists(email);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(enteredPassword);

    const q = `INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?)`;
    const values = [username, name, email, hashedPassword];

    dbConnection.query(q, values, (err, result) => {
      if (err) {
        return sendErrorResponse(res, 500, "Failed to register user", err);
      } else {
        const token = jwt.sign(
          { id: result.insertId, email },
          process.env.JWT_SECRET
        );

        return sendSuccessResponse(res, 201, "User registered successfully", {
          token,
          user: {
            id: result.insertId,
            username,
            name,
            email,
          },
        });
      }
    });
  } catch (error) {
    return sendErrorResponse(res, 500, "Failed to register user", error);
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password: enteredPassword } = req.body;

    const ifUserExists = await checkIfUserExists(email);

    if (!ifUserExists) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const q = `SELECT * FROM users WHERE email = ?`;
    const values = [email];

    dbConnection.query(q, values, async (err, result) => {
      if (err) {
        return sendErrorResponse(res, 500, "Failed to login", err);
      }

      const user = result[0];
      const isPasswordValid = await bcrypt.compare(
        enteredPassword,
        user.password
      );
      if (!isPasswordValid) {
        return sendErrorResponse(res, 401, "Invalid credentials");
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET
      );

      const { password, ...userWithoutPassword } = user;

      return sendSuccessResponse(res, 200, "User logged in successfully", {
        token,
        user: userWithoutPassword,
      });
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to login",
      error: err.message,
    });
  }
};

const logout = async (req, res) => {
  // For JWT, logout is typically handled client-side by removing the token
  // But we can provide an endpoint for consistency
  return sendSuccessResponse(res, 200, "User logged out successfully");
};

module.exports = {
  login,
  register,
  logout,
};
