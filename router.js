const express = require('express')
const router = express.Router()
const services = require('./services.js')
const jtw = require('jsonwebtoken')
const request = require('request');
const upload = require('./upload')

// router.get('/',services.start)
// 登录功能
router.post('/api/login',services.login)
// 注册功能
router.post('/api/register',services.register)
//查用户
router.get('/api/select',services.select)
//查用户信息
router.get('/api/getUserInfo',services.getUserInfo)
//删用户
router.post('/api/delete',services.delete)
// 改用户
router.post('/api/update',services.update)

//获取日记
router.get('/api/getDiary',services.selectDiary)
//新增日记
router.post('/api/addDiary',services.addtDiary)
//修改日记
router.post('/api/updateDiary',services.updateDiary)
//删除日记
router.delete('/api/deleteDiary',services.deleteDiary)


//上传头像
router.post('/api/uploadImg',upload.single('avatar'),services.uploadImg)
//获取头像
router.get('/api/getImgs',services.getImgs)
//删除头像
router.delete('/api/deleteImgs',services.deleteImgs)
module.exports = router
