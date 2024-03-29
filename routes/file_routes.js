const Router = require("express");

const authMiddleware = require("../middleware/auth.middleware")
const router = new Router()
const fileController = require('../controllers/fileController')

router.post('',authMiddleware,fileController.createDir)
router.get('',authMiddleware,fileController.fetchFiles)
router.post('/upload',authMiddleware,fileController.uploadFile)
router.get('/download',authMiddleware,fileController.downloadFile)
router.delete('/',authMiddleware,fileController.deleteFile)
router.get('/search',authMiddleware,fileController.searchFile)
router.post('/update' ,fileController.updateStatus)

module.exports = router