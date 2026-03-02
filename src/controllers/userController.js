const User = require('../models/userModel');

exports.getMe = (req, res, next) => {
    try {
        req.params.id = req.user.id;
        next()
    } catch (err) {
        return next(err)
    }
};


exports.getSingleUser = async (req, res, next) => {
    try {
        let data = await User.findById(req.params.id);
        res.status(200).json({ status: 'success', data })
    } catch (err) {
        return next(err)
    }
}
