const express = require("express")
const mongoose = require("mongoose")
const config = require("config")
const fileUpload = require("express-fileupload")
const authRouter = require("./routes/auth_routes")
const fileRouter = require("./routes/file_routes")

const app = express()
const PORT = process.env.PORT || config.get("serverPort")
const corsMiddleware = require('./middleware/middleware')
const fileMiddleware = require('./middleware/filepath.middleware')
const path = require('path')

app.use(corsMiddleware)
app.use(fileUpload({}))
app.use(fileMiddleware(path.resolve(__dirname,'files')))
app.use(express.json())
app.use("/api/auth", authRouter)
app.use("/api/files", fileRouter)

const start = async () => {
    try{
        await mongoose.connect(config.get("dbUrl"))

        app.listen(PORT, () => {
            console.log('START ON PORT', PORT)
        })

    }catch(e){

    }

}

start()