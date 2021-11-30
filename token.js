var jwt = require('jsonwebtoken')
var signkey = 'mes_qdhd_mobile' //密钥
 
//设置token
exports.setToken = function (username) {
    return new Promise((resolve, reject) => {
        var token ='Bearer ' + jwt.sign({
            username: username
        }, signkey, {
            expiresIn: 60 * 60 * 24 * 3 //表示3天后token过期
        });
        resolve(token)
    })
}
 
//验证token
exports.verToken = function (token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, signkey, (error, decoded) => {
            if (error) {
                reject(error)
            } else {
                resolve(decoded)
            }
        })
    })
  }