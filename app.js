require('dotenv').config()
const express=require('express')
const app=express();
const PORT=process.env.PORT || 3000;


/*
* Importing routes
* */


/*
* Middlewares
* */

/*
* Opening up the server
* */
app.listen(PORT,()=>{
    console.log('Server is up and running on PORT : ',PORT)
})
