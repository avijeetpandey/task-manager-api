const router=require('express').Router()
const getUsers=require('../controllers/getUsers')
const formidable=require('formidable')
const fs=require('fs')
const path=require('path');

// Dictionary to store running jobs
let uploadJob={}

// uploading and handling the file
router.post('/',(req,res)=> {
    try {
        const user = getUsers(req.headers.auth_token)
        console.log(`${user} uploading file`)

        // status of upload
        let status = ""

        let fileName
        let oldPath
        const form = new formidable.IncomingForm({
            maxFileSize: Infinity,
            keepExtensions: true
        })

        form.parse(req);

        form.on('fileBegin', (name, file) => {
            fileName = file.name
            status = `uploading ${fileName}`
            console.log(status)

            oldPath = file.path

            uploadJob[user] = form
        })

        form.on('file', (name, file) => {

            status = `${fileName} is uploaded.`
            console.log(status)
            res.status(200).end(status)

            //Transfer file from Temp directory to Required directory, as file is completely uploaded
            // fs.rename(file.path, './uploads/' + fileName, (err) => {
            //     if (err) {
            //         throw err
            //     }
            //     console.log(`${fileName} stored to Uploads`)
            // })

            fs.readFile(oldPath,(err,data)=>{
                if(err) throw err
                console.log('Buffering File on the server')

                let newPath = './uploads/'+fileName

                fs.writeFile(newPath,data,(err)=>{
                    if(err) throw err;
                    console.log('File Uploaded Succesfully');
                })

                fs.unlink(oldPath,(err)=>{
                    if (err) throw err
                    console.log('Moved to uploads')
                })

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
            const user = getUsers(req.headers.auth_token)

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
