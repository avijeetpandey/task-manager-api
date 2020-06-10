let jwt  = require('jsonwebtoken');

/*
* Verify the web token and extract the users from the dummy data
* */
module.exports = (token)=>{
    try{
        let data=jwt.verify(token,process.env.SECRET_KEY || "atlan secret key")
        return data.user
    }catch (e) {
        throw e;
    }
}
