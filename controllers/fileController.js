const FileService = require('../services/fileService')
const config = require("config")
const fs = require("fs")
const User = require('../models/User') 
const File = require('../models/File') 
const fileService = require('../services/fileService')

class FileController {
    async createDir(req,res){
        try{
            const {name, type, parent} = req.body
            const file = new File({name, type, parent, user: req.user.id})
            const parentFile = await File.findOne({_id:parent})
            if(!parentFile){
                 file.path = name
                 await fileService.createDir(file)
            }else{
                file.path = `${parentFile.path}/${file.name}`
                await fileService.createDir(file)
                parentFile.childs.push(file._id)
                await parentFile.save()
            }
            await file.save()
            return res.json(file)
        }catch(e){
            console.log(e)
            return res.status(400).json(e)
        }
    }

    async fetchFiles(req,res) {
        try{
            const {sort} = req.query
            const files = await File.find({user: req.user.id, parent: req.query.parent}).sort({[sort] : 1})
            return res.json(files)

        }catch(e){
            console.log(e)
            return res.status(500).json({message: "can NOT GET files"})
        }
    }

    async uploadFile(req,res){
        try{
            const file = req.files.file

            const parent = await File.findOne({user: req.user.id, _id: req.body.parent})
            const user = await User.findOne({_id: req.user.id})

            if (user.usedSpace + file.size > user.diskSpace){
                return res.status(400).json({message: "no space on the disk"})
            }
            user.usedSpace = user.usedSpace + file.size

            let path
            if (parent){
                path = `${config.get('filePath')}/${user.id}/${parent.path}/${file.name}`
            }else{
                path = `${config.get('filePath')}/${user.id}/${file.name}`
            }

            if (fs.existsSync(path)){
                return res.status(400).json({message: "File Already Exist "})
            }
            file.mv(path)
            
            const type = file.name.split(".").pop()
            let filePath = file.name
            if (parent){
                filePath = parent.path + '/' + file.name
            }
            const dbFile = new File({
                name: file.name,
                type,
                size: file.size,
                path: filePath,
                parent: parent?._id,
                user: user._id
            })

            await dbFile.save()
            await user.save()

            res.json(dbFile)

        }catch(e){
            console.log(e)
            return res.status(500).json({message: "error upload"})
        }
    }

    async downloadFile(req,res){
        try{
            const file = await File.findOne({_id:req.query.id, user: req.user.id})
            const path = fileService.getPath(file)
            if (fs.existsSync(path)){
                return res.download(path,file.name)
            }
            return res.status(400).json({message: "error download non file"})
        }catch(e){
            console.log(e)
            return res.status(500).json({message: "error download"})
        }
    }

    async deleteFile(req,res){
        try{
            const file = await File.findOne({_id:req.query.id, user: req.user.id})
            if (!file){
                return res.status(400).json({message: "error not found file"})
            }
            fileService.delFile(file)
            await file.remove()
            return res.json({message: 'File was deleted'})
        }catch(e){
            console.log(e)
            return res.status(400).json({message: "error delete - dir not empty"})
        }
    }

    async searchFile(req,res){
        try{
            const searchValue = req.query.search
            let files = await File.find({user: req.user.id})
            files = files.filter(file => file.name.includes(searchValue))
            return res.json(files)
           
        }catch(e){
            console.log(e)
            return res.status(400).json({message: "search error"})
        }
    }

    async updateStatus(req,res) {
        try{
            const id = req.body.id
            const updateValue = req.body.status
            console.log(req.query.status)
            const files = await File.update({_id:id}, {$set:{status: updateValue} }, {
                new: true
              });
            return res.json(files)


        }catch(e){
            console.log(e)
            return res.status(500).json({message: "error update"})
        }
    }

    async searchFileData(req,res){
        try{
            const searchV = req.query.searchData
            let files = await File.find({user: req.user.id})
            files = files.filter(file => file.date.includes(searchV))
            return res.json(files)
           
        }catch(e){
            console.log(e)
            return res.status(400).json({message: "search error DAta"})
        }
    }

}

module.exports = new FileController()