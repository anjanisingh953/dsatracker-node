const express = require('express');
const helmet = require('helmet');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const app = express();
const userRouter = require('./routes/userRoutes');
const questionRouter = require('./routes/questionRoutes');
const globalErr = require('./controllers/errorController')

app.set('trust proxy', 1);

app.use( cors({
    origin: 'https://dsatracker-ochre.vercel.app',
    credentials: true
  }))
app.use(cookieParser());  
app.use(express.json());

app.use(helmet());

// console.log('URL>>>>>',process.env.DB_URL)
app.get('/testing',(req,res)=>{
    res.status(200).json({data:'Testing dones'})
})

app.use('/api/v1/users/',userRouter);
app.use('/api/v1/questions/',questionRouter);

app.use(globalErr);

module.exports = app;