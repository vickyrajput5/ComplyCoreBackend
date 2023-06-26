const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
  // Get the JWT from the Sessions API.
  const token = req.session.token;

  if (!token)
    return res
      .status(401)
      .send({ status: "failed", message: "Access denied, Session Time Out" });

  // Verify the JWT
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).send({ status: "failed", message: "Invalid token" });
  }
};

module.exports = verifyToken;
