const express = require('express')
const router = express.Router()
const esick_admin = require('./services/esick_admin.js')
const jtw = require('jsonwebtoken')
const request = require('request')
const upload = require('./upload')

// router.get('/',services.start)
// 登录功能
router.post('/api/login', esick_admin.login)
// 注册功能
router.post('/api/register', esick_admin.register)
//查用户
router.get('/api/select', esick_admin.select)
//查用户信息
router.get('/api/getUserInfo', esick_admin.getUserInfo)
//删用户
router.post('/api/delete', esick_admin.delete)
// 改用户
router.post('/api/update', esick_admin.update)

//获取日记
router.get('/api/getDiary', esick_admin.selectDiary)
//新增日记
router.post('/api/addDiary', esick_admin.addtDiary)
//修改日记
router.post('/api/updateDiary', esick_admin.updateDiary)
//删除日记
router.delete('/api/deleteDiary', esick_admin.deleteDiary)

//上传头像
router.post('/api/uploadImg', upload.single('image'), esick_admin.uploadImg)
//获取头像
router.get('/api/getImgs', esick_admin.getImgs)
//删除头像
router.delete('/api/deleteImgs', esick_admin.deleteImgs)

//blog
//获取标签
router.get('/api/getTagList', esick_admin.getTagList)
//获取文章
router.get('/api/getAllArchive', esick_admin.getAllArchive)
//新增文章
router.post('/api/addArchive', esick_admin.addArchive)
//修改文章
router.post('/api/updateArchive', esick_admin.updateArchive)
//删除文章
router.delete('/api/deleteArchive', esick_admin.deleteArchive)
module.exports = router
