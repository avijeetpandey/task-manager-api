const jwt = require('jsonwebtoken')
const Router = require('express').Router()
const users = require('../dummy_data.json')
require('dotenv').config()

const secret_key = process.env.SECRET_KEY || "atlan secret key"

const jwt_headers = {
    algorithm : 'HS256',
    expiresIn : 123459876
}

Router.post("/signin", function(req, res) {
    try{
        for(let user of users) {
            if(user.username === req.body.username && user.password === req.body.password) {
                const token = jwt.sign({
                        user : user.username,
                        api_key : user.API_KEY
                    },
                    secret_key,
                    jwt_headers
                )
                res.status(200).json({'auth_token' : token})
                res.end()
            }
        }
    }
    catch(error) {
        res.status(401).end(`Invalid Details`)
    }
    res.status(401).end(`no user found`)
})

module.exports = Router
