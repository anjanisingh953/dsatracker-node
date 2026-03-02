const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question_name: {
        type: String,
        required: [true, 'Please enter question name'],
    },
    leetcode_link: {
        type: String,
        required: [true, 'Please enter leetcode_link']
    },
    youtube_link: {
        type: String,
        required: [true, 'Please enter youtube_link']
    },
    article_link: {
        type: String,
        required: [true, 'Please enter article_link']
    },
    level: {
        type: String,
        enum: ['EASY', 'MEDIUM', 'HARD'],
        default: 'EASY'
    },
    dsa_topic: {
        type: String,
        required: [true, 'Please enter Dsa Topic']
    },

});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;