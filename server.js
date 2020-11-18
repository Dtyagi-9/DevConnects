const express = require('express');
const app = express();

const PORT = process.env.PORT || 3005;

//connecting to DB
const connectDB = require('./config/db');
connectDB();

//Initializing middlewares 
app.use(express.json({extended: false}));


//Defining routes 
app.use('/api/user',require('./routes/api/user'));
app.use('/api/auth',require('./routes/api/auth'));
app.use('/api/post',require('./routes/api/post'));
app.use('/api/profile',require('./routes/api/profile'));


app.get('/',(req,res)=>{
    res.send("API Running");
})


app.listen(PORT,()=>{
    console.log("Server up at ",PORT);
})