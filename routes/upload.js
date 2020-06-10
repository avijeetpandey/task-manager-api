const router=require('express').Router()
const {getUser}=require('../controllers/getUsers')
const formidable=require('formidable')
const fs=require('fs')

// Dictionary to store running jobs
let uploadJob={}

// uploading and handling the file
router.post('/',(req,res)=> {
    try {
        const user = getUser(req.headers.auth_token)
        console.log(`${user} uploading file`)

        // status of upload
        let status = ""

        let fileName;

        const form = new formidable.IncomingForm({
            maxFileSize: Infinity,
            keepExtensions: true
        })

        form.parse(req);

        form.on('fileBegin', (name, file) => {
            fileName = file.name
            status = `uploading ${fileName}`
            console.log(status)

            let path = './uploads/' + fileName

            uploadJob[user] = form
        })

        form.on('file', (name, file) => {

            status = `${fileName} is uploaded.`
            console.log(status)
            res.status(200).end(status)

            //Transfer file from Temp directory to Required directory, as file is completely uploaded
            fs.rename(file.path, './uploads/' + fileName, (err) => {
                if (err) {
                    throw err
                }
                console.log(`${fileName} stored to Uploads`)
            })

            delete uploadJob[user]
        })


        form.on('abort', () => {

            status = `${path} upload aborted`;
            console.log(status);

            res.status(200)
                .end("File upload aborted Reason -> triggered abort event.");

            res.destroy();

            delete uploadJob[user];
        });

        form.on('error', (err) => {

            status = `Stopped uploading ${path} due to:`
            console.log(status)

            res.status(400)
                .end('Error while uploading. upload again !')

            throw err
        });

    }catch(err) {
        console.log(err);
        res.status(400)
            .end("Couldn't upload file due to errors. Try again.")
    }


})


// handling the deletion of the file
router.delete('/kill',(req,res)=>{
    try {
        const formData = new formidable.IncomingForm()

        formData.parse(req, (err, fields, files) => {
            const user = getUser(req.headers.auth_token)

            if (user in uploadJob) {
                console.log(`Killing ${user}'s upload`)
                res.status(200).end("Process Terminated")
            } else {
                res.status(404)
                    .end(`No uploads by user found `)
            }
        })
    }catch (e) {
        res.status(400)
            .end("Error occured while killing the process")
    }

})

module.exports = router
