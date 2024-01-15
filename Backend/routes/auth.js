const express = require('express');
const router = express.Router();
const authentication = require('../middleware/authentication');  // Assuming this is your authentication middleware
const rateLimiter = require('express-rate-limit');

const apiLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        msg: 'Too many requests from this IP, please try again after 15 minutes'
    }
});

const { register, login, getAllUsers, updatePassword, getProfileData, updateProfileData, getAllProfiles, deleteUser } = require('../controllers/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/users', authentication, getAllUsers);
router.put('/update-password', authentication, updatePassword);
router.get('/profile/:id', authentication, getProfileData);
router.put('/profile/:userId', authentication, updateProfileData);
router.get('/profiles', authentication, getAllProfiles);
router.delete('/delete-user/:id', deleteUser);



module.exports = router;
