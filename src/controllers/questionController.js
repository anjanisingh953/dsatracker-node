const AppError = require('../utils/appError');
const Question = require('../models/questionModel');
const User = require('../models/userModel');

//Create a Question
exports.create = async (req, res, next) => {
     try {
          const newQuestion = await Question.create(req.body);
          res.status(200).json({ status: 'success', data: newQuestion });
     } catch (err) {
          return next(err)
     }
}

//Fetch All  Questions
exports.getAllQuestions = async (req, res, next) => {
     try {
          const newQuestion = await Question.find({});
          res.status(200).json({ status: 'success', data: newQuestion });
     } catch (err) {
          return next(err)
     }
}




//Fetch Question with status
exports.getQuestionsWithStatus = async (req, res, next) => {
     try {
          // const newQuestion = await Question.find({});
          const userId = req.user.id;
          // console.log('userId <<<<<<<' ,userId)   
          const questions = await Question.aggregate([
               {
                    $group: {
                         _id: '$dsa_topic',
                         totalQuestions: { $sum: 1 },
                         questions: {
                              $push: {
                                   _id: '$_id',
                                   question_name: '$question_name',
                                   level: '$level',
                                   leetcode_link: '$leetcode_link',
                                   youtube_link: '$youtube_link',
                                   article_link: '$article_link'
                              }
                         }
                    }
               }, {
                    $sort: {
                         _id: 1
                    }
               }
          ]);

          const user = await User.findById(userId).select('solvedQuestions');

          const solvedSet = new Set(
               user.solvedQuestions.map(id => id.toString())
          );

          const result = questions.map(topic => {
               let solvedCount = 0;

               const updatedQuestions = topic.questions.map(ques => {
                    const isSolved = solvedSet.has(ques._id.toString());
                    if (isSolved) solvedCount++;

                    return {
                         ...ques,
                         status: isSolved ? 'Done' : 'Pending'
                    };
               });

               return {
                    topic: topic._id,
                    completed: solvedCount === topic.totalQuestions,
                    questions: updatedQuestions
               };
          });

          res.json({
               status: 'success',
               data: result
          });
     } catch (err) {
          return next(err)
     }
};



//Mark the status (done OR Pending) based on action
exports.markQuestionDone = async (req, res, next) => {
     try {
          const userId = req.user.id;
          const { questionId, checked } = req.body;

          if (!questionId) {
               return next(new AppError('Question ID is required', 400));
          }

          const updateQuery = checked
               ? { $addToSet: { solvedQuestions: questionId } }
               : { $pull: { solvedQuestions: questionId } };

          const user = await User.findByIdAndUpdate(
               userId,
               updateQuery,
               { returnDocument: 'after' } //option new:true is deprecated
          );

          res.status(200).json({
               status: 'success',
               solvedQuestions: user.solvedQuestions
          });

     } catch (err) {
          return next(err)
     }
};



//get progress report based on diffculty level
exports.getDifficultyProgress = async (req, res, next) => {

     console.log('PROGRESS API HITTED >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

     try {
          // 1. Get logged-in user's solved questions
          const user = await User.findById(req.user.id).select('solvedQuestions');
          const solvedIds = user.solvedQuestions; // ObjectIds

          // 2. Aggregate questions by difficulty
          const progress = await Question.aggregate([
               {
                    $group: {
                         _id: "$level",
                         totalQuestions: { $sum: 1 },
                         questions: { $push: "$_id" }
                    }
               },
               {
                    $project: {
                         level: "$_id",
                         totalQuestions: 1,
                         solved: {
                              $size: {
                                   $filter: {
                                        input: "$questions",
                                        as: "qid",
                                        cond: { $in: ["$$qid", solvedIds] }
                                   }
                              }
                         }
                    }
               },
               {
                    $addFields: {
                         progress: {
                              $cond: [
                                   { $eq: ["$totalQuestions", 0] },
                                   0,
                                   {
                                        $round: [
                                             {
                                                  $multiply: [
                                                       { $divide: ["$solved", "$totalQuestions"] },
                                                       100
                                                  ]
                                             },
                                             0
                                        ]
                                   }
                              ]
                         }
                    }
               },
               {
                    $sort: {
                         _id: 1
                    }
               },
               {
                    $project: {
                         _id: 0,
                         level: 1,
                         totalQuestions: 1,
                         solved: 1,
                         progress: 1
                    }
               }
          ]);

          res.status(200).json({
               status: 'success',
               data: progress
          });
     } catch (err) {
          return next(err);
     }
};