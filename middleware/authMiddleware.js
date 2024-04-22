const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    jwt.verify(token,'amir-dev-back-end', (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
   
      req.userId = decodedToken.userId;
      next();
    });
  } else {
    res.status(401).json({ error: 'Token is required' });
  }
};

module.exports = authenticateJWT;