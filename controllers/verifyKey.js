const jwt = require('jsonwebtoken');

/*
* verify  the key
* */

module.exports= (key) =>{
   for(let user of users){
       if(user.API_KEY == key){
           return true;
       }
   // if not found return error
       return false;
   }
}

