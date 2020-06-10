const jwt = require('jsonwebtoken');

const getKey = (token)=>{
    try{
        let data=jwt.verify(token,process.env.SECRET_KEY || "atlan secret key")
        return data.API_KEY;
    }catch(err) {
        throw err;
    }
}

module.exports = getKey
