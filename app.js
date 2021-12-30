// 创建express服务器
const express = require('express')
const app = express()
// 注册解析 表单数据的 body-parser
const bodyParser = require('body-parser')
// 将请求响应设置content-type设置为application/json
const router = require('./router')
const jwt = require('express-jwt')


app.use('/api/*', function (req, res, next) {
	// 设置请求头为允许跨域
    res.header("Access-Control-Allow-Origin", "*");
    // 设置服务器支持的所有头信息字段
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    // 设置服务器支持的所有跨域请求的方法
    res.header("Access-Control-Allow-Methods", "GET,POST");
    // res.header("Access-control-Allow-Orign","http://127.0.0.1:8080")
    // next()方法表示进入下一个路由
    next();
});

//配置静态文件夹
app.use(express.static('Images'));
// express-jwt解析token，无token返回401给前端
app.use(jwt({
    secret: 'mes_qdhd_mobile',  // 签名的密钥 或 PublicKey
    algorithms: ['HS256']
  }).unless({
    path: ['/api/login', '/api/register']  // 指定路径不经过 Token 解析
  }))
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {   
        return res.json({ status: 401, msg: '令牌无效',err})
    }
})


// post
app.use(bodyParser.urlencoded({extended:false}))
// 处理json格式的参数
app.use(bodyParser.json())
// 配置路由
app.use(router)
// 服务器已经启动
app.listen('4000',function(){
    console.log('running...')
})
