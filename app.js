require('dotenv').config()
const express=require('express')
const app=express();
const PORT=process.env.PORT || 3000
const logger=require('morgan')
const path=require('path')
const fs=require('fs')

//writting stream for logs
const logStream=fs.createWriteStream(path.join(__dirname,'server.log'),{flags:'a'});


/*
* Importing routes
* */
const uploadRoute=require('./routes/upload')
const exportRoute=require('./routes/export')
const authRoute=require('./routes/auth')

/*
* Middlewares
* */
app.use(logger('dev'));
app.use(logger('combined', { stream: logStream }));
app.use(express.json())

app.use('/upload',uploadRoute);
app.use('/export',exportRoute);
app.use('/auth',authRoute);

/*
* Opening up the server
* */
app.listen(PORT,()=>{
    console.log('Server is up and running on PORT : ',PORT)
})
