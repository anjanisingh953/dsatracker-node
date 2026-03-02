
const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router()

// router.use((req,res,next)=>{
//    req.requestedTime = new Date().toLocaleDateString();
//    next();
// })

router.post('/signup',authController.signup);
router.post('/login',authController.login);

//protect all routes after this middleware, it checks the token available or not
router.use(authController.protect);
router.get('/me', userController.getMe, userController.getSingleUser);

module.exports = router;