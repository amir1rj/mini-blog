const User = require('../model/user.model'); // Assuming you have a User model

const isAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    // User is admin, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = isAdmin;