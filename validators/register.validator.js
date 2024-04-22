const { body } = require('express-validator');
const  User  = require('../model/user.model');

const validateRegistration = () => {
  return [
    body('email')
      .isEmail()
      .withMessage('Email is not valid')
      .normalizeEmail()
      .custom(async (value) => {
        const existingUser = await User.findOne({ where: { email: value } });
        if (existingUser) {
          throw new Error('Email is already in use');
        }
        return true;
      }),

    body('username')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long')
      .isAlphanumeric()
      .withMessage('Username must contain only alphanumeric characters')
      .custom(async (value) => {
        const existingUser = await User.findOne({ where: { username: value } });
        if (existingUser) {
          throw new Error('Username is already in use');
        }
        return true;
      }),


    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('confirm_password')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
  ];
};

module.exports = validateRegistration;