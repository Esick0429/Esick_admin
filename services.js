const db = require('./db.js')
const token = require('./token')

exports.start = (req, res) => {}
// 登录注册处理
exports.login = (req, res) => {
  let username = req.body.username
  let password = req.body.password
  // 查询语句
  let sql = 'select * from users where username = ?'
  token.setToken(username).then((token) => {
    db.base(sql, username, (result) => {
      console.log(result)
      if (!result.length) {
        return res.json({
          status: 403,
          msg: '登录失败',
        })
      } else {
        // [ RowDataPacket { password: '123', username: 'admin', id: 1 } ]
        // if(result[0].password==pwd){
        //     return res.json({ status: 200, msg: '登录成功' ,username:req.body.username})
        // }
        // return res.json({ status: 1001, msg: '密码错误' })

        if (result[0].password === password) {
          return res.json({
            status: 200,
            msg: '登录成功',
            username: result[0].username,
            token: token,
            authority: result[0].authority,
          })
        }
        return res.json({
          status: 1001,
          msg: '密码错误',
        })
      }
    })
  })
}
//注册
exports.register = (req, res) => {
  let username = req.body.username
  let password = req.body.password
  // 查询语句
  let sql = 'select * from users where username = ?'
  // 插入语句
  let insert = 'insert into users set ?'
  db.base(sql, username, (result) => {
    console.log(result.length)
    if (result.length !== 0) {
      return res.json({
        status: 1,
        msg: '该用户名已经存在',
      })
    } else {
      db.base(
        insert,
        {
          username,
          password,
        },
        (result) => {
          console.log(result)
          if (result.affectedRows === 1) {
            return res.json({
              status: 200,
              msg: '注册成功',
            })
          }
          return res.json({
            status: 1,
            msg: '注册失败',
          })
        }
      )
    }
  })
}
//查用户
exports.select = (req, res) => {
  let sql = 'select * from users'
  let findUserqx = 'select * from users where username = ?'
  let usertoken = req.headers['authorization']
  if (!usertoken) {
    return res.json({
      status: 501,
      msg: '没token',
    })
  }
  if (usertoken.indexOf('Bearer') >= 0) {
    usertoken = usertoken.split(' ')[1]
    console.log(usertoken)
  }
  token
    .verToken(usertoken)
    .then((token) => {
      db.base(findUserqx, token.username, (result) => {
        console.log(result)
        if (!result.length) {
          return res.json({
            status: 401,
            msg: '账号异常，请咨询管理员',
          })
        } else if (result[0].authority === 1) {
          db.base(sql, (err, rows) => {
            if (err) {
              res.json({
                err: 'chucuole',
              })
            } else {
              res.json({
                list: rows,
              })
            }
          })
        } else {
          return res.json({
            status: 403,
            msg: '无权限',
          })
        }
      })
    })
    .catch((err) => {
      console.log(err)
      res.json({
        status: 401,
        msg: 'token验证错误',
      })
    })
}
//删用户
exports.delete = (req, res) => {
  let id = req.body.id
  let del = 'delete from users where id = ?'
  db.base(del, id, (relust) => {
    if (relust) {
      console.log('删除成功', relust.message)
      res.json({
        msg: '删除成功',
      })
    } else {
      res.json({
        msg: '删除失败',
      })
    }
  })
}
//改用户
exports.update = (req, res) => {
  let id = req.body.id
  let username = req.body.username
  let password = req.body.password
  let update = 'update users set ? where id = ? '
  let updateMsg = [
    {
      username,
      password,
    },
    id,
  ]
  db.base(update, updateMsg, (relust) => {
    if (relust) {
      console.log('修改成功', relust.message)
      res.json({
        status: 200,
        msg: '修改成功',
      })
    } else {
      res.json({
        status: 200,
        msg: '修改失败',
      })
    }
  })
}

//查日记
exports.selectDiary = (req, res) => {
  let pageIndex = req.query.pageIndex || 1
  let pageSize = req.query.pageSize || 10
  let currentPage = (pageIndex - 1) * pageSize
  let usertoken = req.headers['authorization']
  if (usertoken.indexOf('Bearer') >= 0) {
    usertoken = usertoken.split(' ')[1]
  }
  token.verToken(usertoken).then(async (token) => {
    console.log(token)
    let userName = token.username
    let count
    let sql = `SELECT * FROM diary WHERE userName = ? order by date Desc limit ${currentPage},${pageSize}`
    let sqlcount = `SELECT COUNT(*) as count FROM diary WHERE userName = ?`
    await db.base(sqlcount, userName, (result) => {
      count = result[0].count
      db.base(sql, userName, (result, err) => {
        if (result) {
          let data = result.map((item) => ({
            id: item.id,
            date: item.date,
            title: item.title,
            content: item.content,
          }))
          res.json({
            status: 200,
            total: count,
            data,
          })
        } else {
          res.json({
            status: 200,
            err,
          })
        }
      })
    })
  })
}

//增日记
exports.addtDiary = (req, res) => {
  let userName = req.body.userName
  let title = req.body.title
  let content = req.body.content
  let date = new Date().getTime()
  let create_time = new Date().getTime()
  let sql = `insert into diary set ? `
  db.base(
    sql,
    {
      userName,
      title,
      content,
      date,
      create_time,
    },
    (result, err) => {
      if (result.affectedRows === 1) {
        return res.json({
          status: 200,
          msg: '新增成功',
        })
      }
      return res.json({
        status: 1,
        msg: '新增失败',
        err,
      })
    }
  )
}

//改日记
exports.updateDiary = (req, res) => {
  let id = req.body.id
  let userName = req.body.userName
  let title = req.body.title
  let content = req.body.content
  let update = 'update diary set ? where id =? and userName = ?'
  let updateMsg = [
    {
      title,
      content,
    },
    id,
    userName,
  ]
  db.base(update, updateMsg, (relust) => {
    if (relust) {
      console.log('修改成功', relust.message)
      res.json({
        status: 200,
        msg: '修改成功',
      })
    } else {
      res.json({
        status: 200,
        msg: '修改失败',
      })
    }
  })
}

//删日记
exports.deleteDiary = (req, res) => {
  let id = req.query.id
  let usertoken = req.headers['authorization']
  if (usertoken.indexOf('Bearer') >= 0) {
    usertoken = usertoken.split(' ')[1]
  }
  token.verToken(usertoken).then((token) => {
    console.log(token)
    let userName = token.username
    let del = 'delete from diary where id = ? and userName = ?'
    db.base(del, [id, userName], (relust) => {
      if (relust.affectedRows === 1) {
        res.json({
          msg: '删除成功',
          status: 200,
        })
      } else {
        res.json({
          status: 200,
          msg: '删除失败,已删除或条件错误',
        })
      }
    })
  })
}
