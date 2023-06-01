const {Schema, model, ObjectId} = require("mongoose")

const File = new Schema({
    name: {type: String, required: true},
    type: {type: String, required: true},
    accessLink: {type: String},
    size: {type: Number, default: 0},
    path: {type: String, default: ''},
    date: {type:Date, default: Date.now()},
    user: {type: ObjectId, ref:'User'},
    status:{type: String, default: 'edit'},
    access_link:{type: String, default: 'accounting'},
    description:{type: String, default: 'WorkingFile'},
    parent: {type: ObjectId, ref:'File'},
    childs:[{type:ObjectId, ref:'File'}]
})

module.exports = model('File', File)