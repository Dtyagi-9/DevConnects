const mongoose = require('mongoose')
const config = require('config')


const connectionURL = config.get('mongoURI') //'mongodb://127.0.0.1:27017/DevConnects'

const connectDB = async ()=>{
    try{
        await mongoose.connect(connectionURL,
            { 
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true
            });
        console.log("Database Connected ..")
    }
    catch(e) {
        console.log(e.message);
        process.exit(1);

    }
}

module.exports = connectDB  