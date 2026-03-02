
const express = require('express');
const questionController = require('../controllers/questionController');
const authController = require('../controllers/authController');


const router = express.Router()

router.use(authController.protect);

router.post('/createquestion',questionController.create);
router.get('/getallquestions',questionController.getAllQuestions);
router.get('/questionswithstatus',questionController.getQuestionsWithStatus);
router.post('/markdone', questionController.markQuestionDone);
router.get('/progressreport', questionController.getDifficultyProgress);


module.exports = router;