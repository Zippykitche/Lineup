import { adminAuth } from "../config/firebase.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No token provided in header");
      return res.status(401).json({
        error: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (verifyIdError) {
      console.error("Token verification failed:", verifyIdError.message);
      
      return res.status(401).json({
        error: "Unauthorized: Invalid or expired token.",
      });
    }
  } catch (error) {
    console.error("AUTH ERROR:", error.message);
    return res.status(401).json({
      error: "Unauthorized",
    });
  }
};