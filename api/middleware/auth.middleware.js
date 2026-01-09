import jwt from 'jsonwebtoken';
import User from '../users/user.model.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded._id).select('-__v');

            if (!req.user) {
                return res.status(401).json({ msg: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ msg: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ msg: 'Not authorized, no token' });
    }
};