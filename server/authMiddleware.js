const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
    // Implement your logic to check if user is authenticated (e.g., if DB connection is made)
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
      } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
  
module.exports = { isAuthenticated };