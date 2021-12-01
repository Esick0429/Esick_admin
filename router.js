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
//查商品
router.post('/api/selectGood',services.selectGood)
// 存储用户信息
router.post('/api/setUserinfo',services.setUserinfo)
//获取用户信息

router.get('/api/getSession',(req,res) =>{
  const code = req.query.code
  const  appId = "111"
  const  appSecret="111" 
// if(!code){
//     res.json({err:'没有code'})
// }else{
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
    request(url, (err,response,body)=>{
        res.send(
          body
        )  //将请求到的 OpenID与 session_key 返回给小程序页面js文件
      })
// }

})

module.exports = router
