const Auth = require('../models/auth');
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            throw new UnauthenticatedError('Authentication invalid');
        }
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const user = await Auth.findById(payload.userId);
        if (!user) {
            throw new UnauthenticatedError('User not found');
        }

        req.user = {
            userId: user._id,
            email: user.email,
            role: user.role,
            name: user.fName
        };

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = authMiddleware;
