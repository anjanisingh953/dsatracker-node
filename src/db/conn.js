const mongoose = require('mongoose');

const connectDb = async(DB_URL)=>{
   try {
     await  mongoose.connect(DB_URL)
     console.log('Database connected successfull')
   } catch (err) {
        console.log('DB connection error>>',err.message);
   }
}

module.exports = connectDb;