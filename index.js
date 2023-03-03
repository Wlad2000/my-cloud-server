const express = require("express")
const mongoose = require("mongoose")
const config = require("config")
const authRouter = require("./routes/auth_routes")

const app = express()
const PORT = config.get("serverPort")
const corsMiddleware = require('./middleware/middleware')

app.use(corsMiddleware)
app.use(express.json())
app.use("/api/auth", authRouter)

const start = async () => {
    try{
        await mongoose.connect(config.get("dbUrl"))

        app.listen(PORT, () => {
            console.log('FUCKING START ON PORT', PORT)
        })

    }catch(e){

    }

}

start()