const jwt = require('jsonwebtoken');

// Helper function to generate test JWT token
const generateTestToken = (userId, email) => {
  return jwt.sign(
    { 
      userId, 
      email,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET || 'test-jwt-secret',
    { 
      expiresIn: '1h',
      algorithm: 'HS256'
    }
  );
};

module.exports = {
  generateTestToken
};
