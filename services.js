const db = require('./db.js')
const token = require('./token')
const url = ''
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
          token: token
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
exports.select = async (req, res) => {
  let sql = 'select * from users'
  let usertoken = req.headers['authorization']
  let Auth = await selectAuth(usertoken)
  if (!Auth) {
    return res.json({
      status: 403,
      msg: '权限不足',
    })
  }
  let userList = await db.base(sql)
  if (userList) {
    res.json({
      list: userList.results,
    })
  }
}
//获取用户信息
exports.getUserInfo = async (req,res)=>{
  let usertoken = req.headers['authorization']
  let sql = `select * from users where username = ?`
  if (usertoken.indexOf('Bearer') >= 0) {
    usertoken = usertoken.split(' ')[1]
  }
  let userInfo = await token.verToken(usertoken)
  let {results} = await db.base(sql,userInfo.username)
  res.json(results[0])
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
  let update = 'update users set ? where id = ? and username  = ?'
  let updateMsg = [
    {
      username,
      password,
    },
    id,
    username
  ]
  let Auth = await selectAuth(req.headers.authorization)
  if (!Auth) {
    return res.json({
      status: 403,
      msg: '权限不足',
    })
  }
  let { results } = await db.base(update, updateMsg)
  console.log(results);
  if (results.changedRows === 1) {
    res.json({
      status: 200,
      msg: '修改成功',
    })
  } else{
    res.json({
      status: 500,
      msg: '修改失败',
    })
  }
}

//查日记
exports.selectDiary = async (req, res) => {
  let pageIndex = req.query.pageIndex || 1
  let pageSize = req.query.pageSize || 10
  let currentPage = (pageIndex - 1) * pageSize
  let startTime = req.query.startTime
  let endTime = req.query.endTime
  let sql = `SELECT * FROM diary`
  let sqlcount = `SELECT COUNT(*) as count FROM diary`
  if(startTime!== '0' && endTime!== '0'){
    sql += ` where date between '${startTime}' and '${endTime}' order by date Desc limit ${currentPage},${pageSize} `
    sqlcount += ` where date between '${startTime}' and '${endTime}'`
  }else{
    sql += ` order by date Desc limit ${currentPage},${pageSize}`
  }
  let diaryCount = await db.base(sqlcount)
  console.log(sql);
  console.log(sqlcount);
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
  let Auth = await selectAuth(usertoken)
  let del = 'delete from diary where id = ? and userName = ?'
  if (!Auth) {
    return res.json({
      status: 403,
      msg: '权限不足',
    })
  }
  let { results } = await db.base(del, [id, userName])
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
    console.log(results,'????');
    return results[0].username === 'admin' ? true : false
  }
}


exports.uploadImg = async (req, res) => {
  console.log(req.file);
  let id = req.body.id
  let username = req.body.username
  let avatarUrl ="http://localhost:4000/"+req.file.filename
  let update = 'update users set ? where id =? and username = ?'
  let updateMsg = [
    {
      avatarUrl
    },
    id,
    username
  ]
  let {results} = await db.base(update,updateMsg)
  if(results.affectedRows === 1){
    res.json({
      status:200,
      msg:'上传成功'
    })
  }
}