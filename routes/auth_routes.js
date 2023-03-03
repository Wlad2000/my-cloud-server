const Router = require("express");
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const config = require("config")
const jwt = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")
const authMiddleware = require("../middleware/auth.middleware")

const router = new Router()


router.post('/registration',
    [
        check('email', 'Uncorrect email').isEmail(),
        check('password', 'Password must be longer 3 and shorter then 12').isLength({min:3,max:12})
    ],
    async (req,res) => {
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.satus(400).json({message: "Uncorrect request", errors })
        }

        const {email,password} = req.body

        const candidate = await User.findOne({email})

        if(candidate){
            return res.status(400).json({message: `User with email ${email} already exist`})
        }

        const hashPassword = await bcrypt.hash(password, 6)
        const user = new User({email, password: hashPassword})
        await user.save()

        return res.json({message: "User was created"})


    }catch(e){
        console.log(e)
        res.send({message: "SERVER ERROR"})

    }
})

router.post('/login',
 
    async (req,res) => {
    try{
        const {email,password} = req.body
        const user = await User.findOne({email})

        if (!user){
            return res.status(404).json({message: "User not found"})
        }
        const isPassValid = bcrypt.compareSync(password, user.password)
        if(!isPassValid){
            return res.status(400).json({message: "incorrect password "})
        }

        const token = jwt.sign({id: user.id}, config.get("KEY"),{expiresIn: "1h"})
        return res.json({
            token,
            user:{
                id: user.id,
                email: user.email,
                diskSpace: user.diskSpace,
                usedSpace: user.usedSpace,
                avatar: user.avatar
            }
        })

    }catch(e){
        console.log(e)
        res.send({message: "SERVER ERROR"})

    }
})

router.get('/auth', authMiddleware,
 
    async (req,res) => {
    try{
       const user = await User.findOne({_id: req.user.id})
       const token = jwt.sign({id: user.id}, config.get("KEY"),{expiresIn: "1h"})
        return res.json({
            token,
            user:{
                id: user.id,
                email: user.email,
                diskSpace: user.diskSpace,
                usedSpace: user.usedSpace,
                avatar: user.avatar
            }
        })

    }catch(e){
        console.log(e)
        res.send({message: "SERVER ERROR"})

    }
})

module.exports = router

 