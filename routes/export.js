const Router = require('express').Router();
const Send = require('send');
const fs = require('fs');

const  getKey= require('../controllers/getKey');
const  getUsers = require('../controllers/getUsers');
const verifyKey = require('../controllers/verifyKey');

//A job queue that maintains running Export tasks
let exportQueue = {};

Router.post('/', (req, res)=> {
    try{
        //Extract api key from the JWT
        const auth_token = req.headers.auth_token;
        const api_key = getKey(auth_token);

        //Verify if the api key matches.
        if(verifyKey(api_key)) {

            //Extract user from JWT
            const user = getUsers(auth_token);

            //filename is the required file to be exported
            const filename = req.body.filename;
            console.log(`${user} requested download for ${filename}`);

            const filepath = './uploads/' + filename;
            console.log(`serving ${filepath}`);

            //Check if requested file exists
            if(fs.existsSync(filepath)) {

                //create Read stream
                let dataStream = fs.createReadStream(filepath);

                //Create a task on user's name
                exportQueue[user] = dataStream;

                Send(req, filepath)
                    .on('abort', () => {
                        res.status(200).end("Your export has been aborted.");
                        //Destroy the stream
                        res.destroy();

                        //Delete from Job queue since, it is aborted
                        delete exportQueue[user];
                    })
                    .on('end', () => {
                        res.status(200).end("The file is served.");

                        //Delete from Job queue after finish
                        delete exportQueue[user];
                    })
                    .pipe(res);

            }
            else {
                //file doesn't exist. So, throw error.
                throw "file doesn't exist";
            }
        }
        else {
            //Respond with UnAuthorized access
            res.status(401)
                .end("API Key is invalid.");
        }
    }
    catch(err) {
        console.log(err);
        res.status(400)
            .end(err);
    }
});

Router.post('/kill', function(req, res) {
    //Extract username from JWT
    const user = getUsers(req.headers.auth_token);

    if(user in exportQueue) {

        //Emit abort event
        exportQueue[user].emit('abort');
        console.log(`${user} aborted their export`);

        //Respond that you have aborted successfully
        res.status(200).end("You have successfully aborted your export task.");
    }
    else
        res.status(404).end('You are not performing any export task currently.');

});

module.exports = Router;
