const User = require('../models/userModel');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_Secret, { expiresIn: '1d' });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }
    // if(process.env.NODE_ENV == 'production') {
    //     cookieOptions.secure = true;
    //     cookieOptions.sameSite = 'none'; 
    // }

    res.cookie('jwt', token, cookieOptions)

    //Not display user password in response output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

//Singup or Create a User
exports.signup = async (req, res, next) => {

    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        createSendToken(newUser, 201, res);
    } catch (err) {
        return next(err)
    }

}

//Login a User
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // 1. check if email and password exists

        if (!email || !password) {
            return next(new AppError('Please provide a valid email and password', 404));
        }
        // 2. Check if user exists and password is correct
        const user = await User.findOne({ email }).select("+password");
        // console.log('user', user);

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
            status: 'fail',
            msg: 'Incorrect email or password'
        });
        }
        //  3. If everything is ok, send JWT token
        createSendToken(user, 201, res);
    } catch (error) {
        
        return res.status(401).json({
            status: 'fail',
            msg: 'Please check your email and password.'
        });
    }


}

//check token
exports.protect = async (req, res, next) => {
    let token;
    // 1. Getting token and check of it is there
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    console.log('token protect >>>>>>', token);

    if (!token) {

        return res.status(401).json({
            status: 'fail',
            msg: 'Something went wrong. Please login again...'
        });
        // return next(new AppError('You are not logged in. Please login to access it.', 400))
    }
    // 2. verfication token 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_Secret);
    // console.log('decoded ', decoded);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    // console.log('currentUser',currentUser)

    if (!currentUser) {
        return next(
            new AppError('The user belonging to this token is No longer exists.')
        )
    }

    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    // console.log('req.user ^^^^^^^^^^^^^^',req.user)

    next();
}