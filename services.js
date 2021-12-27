const db = require('./db.js')
const token = require('./token')
// 登录注册处理
exports.login = (req, res) => {
  let username = req.body.username
  let password = req.body.password
  // 查询语句
  let sql = 'select * from users where username = ?'
  token.setToken(username).then(async (token) => {
    let { results } = await db.base(sql, username)
    if (!results.length) {
      return res.json({
        status: 403,
        msg: '登录失败',
      })
    } else {
      if (results[0].password === password) {
        return res.json({
          status: 200,
          msg: '登录成功',
          username: results[0].username,
          token: token,
          authority: results[0].authority,
        })
      }
      return res.json({
        status: 1001,
        msg: '密码错误',
      })
    }
  })
}
//注册
exports.register = async (req, res) => {
  let username = req.body.username
  let password = req.body.password
  // 查询语句
  let sql = 'select * from users where username = ?'
  // 插入语句
  let insert = 'insert into users set ?'
  let { results } = await db.base(sql, username)
  if (results.length !== 0) {
    return res.json({
      status: 1,
      msg: '该用户名已经存在',
    })
  } else {
    let { results } = await db.base(insert, {
      username,
      password,
    })
    if (results.affectedRows === 1) {
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
  }
  token
    .verToken(usertoken)
    .then(async (token) => {
      let { results } = await db.base(findUserqx, token.username)
      console.log(results)
      if (!results.length) {
        return res.json({
          status: 401,
          msg: '账号异常，请咨询管理员',
        })
      } else if (results[0].authority === 1) {
        let userList = await db.base(sql)
        if (userList) {
          res.json({
            list: userList.results,
          })
        }
      } else {
        return res.json({
          status: 403,
          msg: '无权限',
        })
      }
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
exports.delete = async (req, res) => {
  let id = req.body.id
  let del = 'delete from users where id = ?'
  let usertoken = req.headers['authorization']
  let Auth = await selectAuth(usertoken)
  if (!Auth) {
    return res.json({
      status: 403,
      msg: '权限不足',
    })
  }
  let { results } = await db.base(del, id)
  if (results.affectedRows === 1) {
    res.json({
      status: 200,
      msg: '删除成功',
    })
  } else {
    res.json({
      status: 501,
      msg: '删除失败',
    })
  }
}
//改用户
exports.update = async (req, res) => {
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
  let Auth = await selectAuth(req.headers.authorization)
  if (!Auth) {
    return res.json({
      status: 403,
      msg: '权限不足',
    })
  }
  let { results } = await db.base(update, updateMsg)
  if (results.affectedRows === 1) {
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
}

//查日记
exports.selectDiary = async (req, res) => {
  let pageIndex = req.query.pageIndex || 1
  let pageSize = req.query.pageSize || 10
  let currentPage = (pageIndex - 1) * pageSize
  let sql = `SELECT * FROM diary order by date Desc limit ${currentPage},${pageSize}`
  let sqlcount = `SELECT COUNT(*) as count FROM diary`
  let diaryCount = await db.base(sqlcount)
  let { results } = await db.base(sql)
  if (results) {
    let data = results.map((item) => ({
      id: item.id,
      date: item.date,
      title: item.title,
      content: item.content,
      userName: item.userName,
    }))
    res.json({
      status: 200,
      total: diaryCount.results[0].count,
      data,
    })
  } else {
    res.json({
      status: 200,
      err,
    })
  }
}

//增日记
exports.addtDiary = async (req, res) => {
  let userName = req.body.userName
  let title = req.body.title
  let content = req.body.content
  let date = new Date().getTime()
  let create_time = new Date().getTime()
  let sql = `insert into diary set ? `
  let { results } = await db.base(sql, {
    userName,
    title,
    content,
    date,
    create_time,
  })
  if (results.affectedRows === 1) {
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

//改日记
exports.updateDiary = async (req, res) => {
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
  let { results } = await db.base(update, updateMsg)
  console.log(results)
  if (results.affectedRows === 1) {
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
}

//删日记
exports.deleteDiary = async (req, res) => {
  let id = req.query.id
  let userName = req.query.userName
  let usertoken = req.headers['authorization']
  let Auth = selectAuth(usertoken)
  let sql = `select * from users where username = ?`
  let del = 'delete from diary where id = ? and userName = ?'
  if (!Auth) {
    return res.json({
      status: 403,
      msg: '权限不足',
    })
  }
  let { results } = await db.base(del, [id, userName])
  console.log(results);
  if (results.affectedRows === 1) {
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
}

let selectAuth = async function (usertoken) {
  let sql = `select * from users where username = ?`
  if (usertoken.indexOf('Bearer') >= 0) {
    usertoken = usertoken.split(' ')[1]
  }
  let userInfo = await token.verToken(usertoken)
  if (userInfo) {
    let { results } = await db.base(sql, userInfo.username)
    return results[0].authority
  }
}
