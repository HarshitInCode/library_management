const Auth = require('../models/auth');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const register = async (req, res) => {
    const { email } = req.body;
    const emailCheck = await Auth.findOne({ email });

    if (emailCheck) {
        throw new UnauthenticatedError('User Already Registered');
    }
    const user = await Auth.create({ ...req.body });
    const token = user.createJWT();
    res.status(201).json({
        msg: 'User created successful',
        user: {
            name: user.fName,
            email: user.email,
            role: user.role,
            token,
        },
    });
}

const login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError('Please provide email and password');
    }
    const user = await Auth.findOne({ email });
    if (!user) {
        throw new UnauthenticatedError('Invalid Credentials');
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid Credentials');
    }

    // Setting a custom property on the request object
    req.user = {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.fName
    };

    // Compared password
    const token = user.createJWT();
    res.status(201).json({
        msg: 'Login successful',
        user: {
            userId: user._id,
            name: user.fName,
            email: user.email,
            role: user.role,
            token,
        },
    });

    // Call the next middleware in the chain
    next();
};

const getAllUsers = async (req, res) => {
    try {
        const users = await Auth.find({ role: 'user' })
        res.status(200).json({
            msg: 'Users retrieved successfully',
            users: users,
        });
    } catch (error) {
        console.error('Error retrieving users:', error.message);
        throw new BadRequestError('Failed to retrieve users');
    }
};

const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!currentPassword || !newPassword) {
        throw new BadRequestError('Please provide current and new passwords');
    }

    try {
        const isPasswordCorrect = await user.comparePassword(currentPassword);
        if (!isPasswordCorrect) {
            throw new UnauthenticatedError('Current password is incorrect');
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            msg: 'Password updated successfully',
        });
    } catch (error) {
        console.error('Error updating password:', error.message);
        throw new BadRequestError('Failed to update password');
    }
};

const getProfileData = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await Auth.findById(userId);

        if (!user) {
            throw new BadRequestError('User not found');
        }

        res.status(200).json({
            msg: 'Profile data retrieved successfully',
            user: user,
        });
    } catch (error) {
        console.error('Error retrieving profile data:', error.message);
        throw new BadRequestError('Failed to retrieve profile data');
    }
};

const getAllProfiles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const totalCount = await Auth.countDocuments({ role: 'user' });

        const allProfiles = await Auth.find({ role: 'user' })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            msg: 'User profiles retrieved successfully',
            profiles: allProfiles,
            totalCount: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error('Error retrieving user profiles:', error.message);
        throw new BadRequestError('Failed to retrieve user profiles');
    }
};

const updateProfileData = async (req, res) => {
    const userId = req.params.userId;



    try {
        const user = await Auth.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.fName = req.body.fName || user.fName;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.phone = req.body.phone || user.phone;
        user.street = req.body.street || user.street;
        user.city = req.body.city || user.city;
        user.state = req.body.state || user.state;
        user.zipCode = req.body.zipCode || user.zipCode;
        user.about = req.body.about || user.about;


        if (req.body.password) {
            user.password = req.body.password;
        }

        await user.save();

        res.status(200).json({
            msg: 'Profile data updated successfully',
            user: {
                fullName: user.fName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                street: user.street,
                city: user.city,
                state: user.state,
                zipCode: user.zipCode,
                about: user.about,
            },
        });
    } catch (error) {
        console.error('Error updating profile data:', error.message);
        res.status(500).json({ error: 'Failed to update profile data' });
    }
};

const deleteUser = async (req, res) => {
    const userId = req.params.id;


    try {
        const user = await Auth.findById(userId);

        if (!user) {
            throw new BadRequestError('User not found');
        }

        await user.deleteOne();

        res.status(200).json({
            msg: 'User deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        throw new BadRequestError('Failed to delete user');
    }
};


module.exports = { register, login, getAllUsers, updatePassword, getProfileData, updateProfileData, getAllProfiles, deleteUser };
