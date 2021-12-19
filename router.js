const express = require('express')
const router = express.Router()
const services = require('./services.js')
const jtw = require('jsonwebtoken')
const request = require('request');

// router.get('/',services.start)
// 登录功能
router.post('/api/login',services.login)
// 注册功能
router.post('/api/register',services.register)
//查用户
router.post('/api/select',services.select)
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

module.exports = router
