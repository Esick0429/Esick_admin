const db = require('./db.js')
const token = require('./token')

exports.start = (req,res)=>{
}
// 登录注册处理
exports.login = (req,res)=>{
    let username = req.body.username
    let password = req.body.password
    // 查询语句
    let sql ='select * from users where username = ?'
    token.setToken(username).then(token =>{
        db.base(sql,username,(result)=>{
            console.log(result)
            if(!result.length){
                return res.json({ status: 403, msg: '登录失败' })
            }else{
                // [ RowDataPacket { password: '123', username: 'admin', id: 1 } ]
                // if(result[0].password==pwd){
                //     return res.json({ status: 200, msg: '登录成功' ,username:req.body.username})
                // }
                // return res.json({ status: 1001, msg: '密码错误' })
                
                    if(result[0].password==password){
                        return res.json({ status: 200, msg: '登录成功' ,username:result[0].password,token:token,authority:result[0].authority})
                    }
                    return res.json({ status: 1001, msg: '密码错误'});
            }
        })
    })
}
//注册
exports.register = (req,res)=>{
    let username = req.body.username
    let password = req.body.password
    // 查询语句
    let sql = 'select * from users where username = ?'
    // 插入语句
    let insert = 'insert into users set ?'
    db.base(sql,username,(result)=>{
        console.log(result.length)
        if(result.length!==0){
            return res.json({ status: 1, msg: '该用户名已经存在' })
        }else{
            db.base(insert,{username,password},(result)=>{
                console.log(result)
                if(result.affectedRows==1){
                    return res.json({ status: 200, msg: '注册成功' })
                }
                return res.json({ status: 1, msg: '注册失败' })
            })
        }
    })
}
//查用户
exports.select = (req,res)=>{
    let sql = 'select * from users';
    let findUserqx = 'select * from users where username = ?'
    let usertoken = req.headers['authorization'];
    if(!usertoken){
        return res.json({status:501,msg:'没token'})
    }
    if(usertoken.indexOf('Bearer') >= 0){
        usertoken = usertoken.split(' ')[1]
        console.log(usertoken);
        
    }
    token.verToken(usertoken).then(token =>{
        db.base(findUserqx,token.username,(result)=>{
            console.log(result);
            if(!result.length){
                return res.json({status:401,msg:'账号异常，请咨询管理员'})
            }else if(result[0].authority === 1){
                db.base(sql,(err, rows)=> {
                    if(err){
                        res.json({err:"chucuole"})
                      }
                      else{
                        res.json({list:rows})
                      }
                })
            }else{
                return res.json({status:403,msg:'无权限'})
            }
        })
    }).catch(err =>{
        console.log(err)
        res.json({status:401,msg:'token验证错误'})
    })


}
//删用户
exports.delete = (req,res)=>{
    let id = req.body.id
    let del = 'delete from users where id = ?';
    db.base(del,id,(relust)=> {
        if(relust){
            console.log('删除成功',relust.message);
             res.json({msg:'删除成功'})
          }
          else{
             res.json({msg:'删除失败'})
          }
    })
}
//改用户
exports.update = (req,res)=>{
    let id = req.body.id
    let username = req.body.username
    let password = req.body.password
    let update = 'update users set ? where id = ? ';
    let updateMsg = [{username,password},id]
    db.base(update,updateMsg,(relust)=> {
        if(relust){
            console.log('修改成功',relust.message);
             res.json({msg:'修改成功'})
          }
          else{
             res.json({msg:'修改失败'})
          }
    })
}
//查商品
exports.selectGood = (req,res)=>{
    let sql = 'select goodname,price,date,count from good';
    db.base(sql,(err, rows)=> {
        if(err){
            res.json({err:"查不到啊"})
          }
          else{
            res.json({list:rows})
          }
    })
}

//存储用户信息
exports.setUserinfo = (req,res)=>{
    let userinfo = req.body.userinfo;
    let setUserinfo = 'INSERT INTO userInfo set ?';
    db.base(setUserinfo,userinfo,(relust)=> {
        if(relust){
            console.log('添加成功');
             res.json({msg:'添加成功'})
          }
          else{
             res.json({msg:'添加失败'})
          }
    })
}
