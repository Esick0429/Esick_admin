const db = require('../db/mysql_db.js')
const token = require('../token')
const fs = require('fs')
const path = require('path')
const mongodb = require('../db/mongo_db')
const ObjectId = require('mongodb').ObjectId
// const blogItem = require('./db/schema/blogItem')
// const TagGroup = require('../db/schema/tagGroup')
// const Archives = require('../db/schema/archive')
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
          token: token,
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
exports.getUserInfo = async (req, res) => {
  let usertoken = req.headers['authorization']
  let sql = `select * from users where username = ?`
  if (usertoken.indexOf('Bearer') >= 0) {
    usertoken = usertoken.split(' ')[1]
  }
  let userInfo = await token.verToken(usertoken)
  let { results } = await db.base(sql, userInfo.username)
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
    username,
  ]
  let Auth = await selectAuth(req.headers.authorization)
  if (!Auth) {
    return res.json({
      status: 403,
      msg: '权限不足',
    })
  }
  let { results } = await db.base(update, updateMsg)
  console.log(results)
  if (results.changedRows === 1) {
    res.json({
      status: 200,
      msg: '修改成功',
    })
  } else {
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
  if (startTime !== '0' && endTime !== '0') {
    sql += ` where date between '${startTime}' and '${endTime}' order by date Desc limit ${currentPage},${pageSize} `
    sqlcount += ` where date between '${startTime}' and '${endTime}'`
  } else {
    sql += ` order by date Desc limit ${currentPage},${pageSize}`
  }
  let diaryCount = await db.base(sqlcount)
  let { results } = await db.base(sql)
  if (results) {
    let data = results.map((item) => ({
      id: item.id,
      date: item.date,
      title: item.title,
      content: item.content,
      userName: item.userName,
      updateTime: item.update_time,
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
  let usertoken = req.headers['authorization']
  let Auth = await selectAuth(usertoken)
  let del = 'delete from diary where id = ? and userName = ?'
  if (!Auth) {
    return res.json({
      status: 403,
      msg: '权限不足',
    })
  }
  let update = 'update diary set ? where id =? and userName = ?'
  let updateMsg = [
    {
      title,
      content,
      update_time: new Date().getTime(),
    },
    id,
    userName,
  ]
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

//查询权限
let selectAuth = async function (usertoken) {
  let sql = `select * from users where username = ?`
  if (usertoken.indexOf('Bearer') >= 0) {
    usertoken = usertoken.split(' ')[1]
  }
  let userInfo = await token.verToken(usertoken)
  if (userInfo) {
    let { results } = await db.base(sql, userInfo.username)
    return results[0].username === 'admin' ? true : false
  }
}
//上传图片
exports.uploadImg = async (req, res) => {
  console.log(req.headers.host)
  if (req.file.mimetype.split('/')[0] !== 'image') {
    return res.json({ status: 700, msg: '上传文件格式错误' })
  }
  let id = req.body.id
  let username = req.body.username
  let avatarUrl = `https://${req.headers.host}/images/${req.file.filename}`
  const insertImg = 'insert into gallery set ?'
  if (id && username) {
    let update = 'update users set ? where id =? and username = ?'
    let updateMsg = [
      {
        avatarUrl,
      },
      id,
      username,
    ]
    let { results } = await db.base(update, updateMsg)
  }
  let data = await db.base(insertImg, {
    imgName: req.file.filename,
    imgUrl: `/images/${req.file.filename}`,
    upload_time: new Date().getTime(),
  })
  if (data.results.affectedRows === 1) {
    res.json({
      status: 200,
      msg: '上传成功',
    })
  }
}
//获取图片
exports.getImgs = async (req, res) => {
  const selectImgs = `select * from gallery order by upload_time Desc`
  let { results } = await db.base(selectImgs)
  for (let i of results) {
    i.imgUrl = `https://${req.headers.host}${i.imgUrl}`
  }
  res.json({
    status: 200,
    data: {
      list: results,
    },
  })
}
//删除图片
exports.deleteImgs = async (req, res) => {
  let id = req.query.id
  let imgName = req.query.imgName
  let sqlImg = `select * from gallery where id = '${id}' and imgName = '${imgName}'`
  let { results } = await db.base(sqlImg)
  let imgUrl = `./public/images`
  if (results.length === 1) {
    const deletImgSql = `delete from gallery where id = '${id}' and imgName = '${imgName}'`
    let deleteData = await db.base(deletImgSql)
    if (deleteData.results.affectedRows === 1) {
      deleteFolderRecursive(imgUrl, imgName)
      res.json({ status: 200, msg: '删除成功' })
    } else {
      res.json({ status: 503, msg: '删除失败' })
    }
  } else {
    res.json({ status: 503, msg: '删除失败' })
  }
}

function deleteFolderRecursive(url, name) {
  var files = []
  if (fs.existsSync(url)) {
    //判断给定的路径是否存在
    files = fs.readdirSync(url) //返回文件和子目录的数组
    console.log(files)
    files.forEach(function (file, index) {
      var curPath = path.join(url, file)
      if (fs.statSync(curPath).isDirectory()) {
        //同步读取文件夹文件，如果是文件夹，则函数回调
        deleteFile(curPath, name)
      } else {
        if (file.indexOf(name) > -1) {
          //是指定文件，则删除
          fs.unlinkSync(curPath)
          console.log('删除文件：' + curPath)
        }
      }
    })
  } else {
    console.log('给定的路径不存在！')
  }
}

//blog

//获取标签
exports.getTagList = async (req, res) => {
  let tagListData = await mongodb.findData(
    'myblog',
    'taggroups',
    { deleted: false },
    { create_time: -1 }
  )
  let data = tagListData.map((item) => {
    return {
      tagId: item._id,
      tagName: item.tagName,
    }
  })
  res.json(data)
}
//获取文章
exports.getAllArchive = async (req, res) => {
  let { tagId, startTime, endTime } = req.query
  console.log(req.query)
  let pageSize = req.query.pageSize ?? 10
  if (req.query.currentPage == 0) {
    ctx.body = {
      code: 90000,
      msg: '页码不能为0',
    }
    return
  }
  let currentPage = (req.query.currentPage - 1) * pageSize
  let conditions = { deleted: false }
  if (tagId) {
    conditions.tagId = tagId
  }
  if (startTime !== '0' && endTime !== '0') {
    conditions.archiveDate = {
      $gte: Number(startTime),
      $lt: Number(endTime),
    }
  }
  let archiveData = await mongodb.pageing(
    'myblog',
    'archives',
    conditions,
    currentPage,
    Number(pageSize),
    { archiveDate: -1 }
  )
  let archiveDataRes = archiveData.res
  let tagIdList = []
  for (let i = 0; i < archiveDataRes.length; i++) {
    tagIdList.push(ObjectId(archiveDataRes[i].tagId))
  }
  let tagData = await mongodb.findData(
    'myblog',
    'taggroups',
    {
      _id: { $in: tagIdList },
      deleted: false,
    },
    {}
  )
  let data = archiveDataRes.map((item) => {
    for (let i of tagData) {
      if (item.tagId === String(i._id)) {
        return {
          date: item.archiveDate,
          archiveId: String(item._id),
          archiveTitle: item.archiveTitle,
          archiveContent: item.archiveContent,
          updateTime: item.updateTime,
          tagId: item.tagId,
          tagName: i.tagName,
        }
      }
    }
  })
  res.json({
    code: 200,
    data: {
      total: archiveData.total,
      list: data,
    },
    msg: '',
  })
}

exports.addArchive = async (req, res) => {
  console.log(req.body)
  let usertoken = req.headers['authorization']
  let Auth = await selectAuth(usertoken)
  if (!Auth) {
    return res.json({
      status: 403,
      msg: '权限不足',
    })
  }
  let data = {
    ...req.body,
    deleted: false,
    archiveDate: new Date().getTime(),
    createTime: new Date().getTime(),
    updateTime: new Date().getTime(),
  }
  let result = await mongodb.insertOne('myblog', 'archives', data)
  console.log(result)
  res.json({ status: 200, msg: '新增成功' })
}

exports.updateArchive = async (req, res) => {
  console.log(req.body)
  let archiveId = ObjectId(req.body.archiveId)
  let usertoken = req.headers['authorization']
  let Auth = await selectAuth(usertoken)
  if (!Auth) {
    return res.json({
      status: 403,
      msg: '权限不足',
    })
  }
  console.log(1)
  let result = await mongodb.updateOne(
    'myblog',
    'archives',
    {
      _id: archiveId,
    },
    {
      $set: {
        archiveTitle: req.body.archiveTitle,
        archiveContent: req.body.archiveContent,
        tagId: req.body.tagId,
        updateTime: new Date().getTime(),
      },
    }
  )
  console.log(result)

  if (result.modifiedCount === 1) {
    res.json({
      status: 200,
      msg: '修改成功',
    })
  }
}

exports.deleteArchive = async (req, res) => {
  let archiveId = req.query.archiveId
  let usertoken = req.headers['authorization']
  let Auth = await selectAuth(usertoken)
  if (!Auth) {
    return res.json({
      status: 403,
      msg: '权限不足',
    })
  }
  let result = await mongodb.updateOne(
    'myblog',
    'archives',
    {
      _id: archiveId,
    },
    {
      $set: {
        deleted: true,
      },
    }
  )
  if (result.modifiedCount === 1) {
    res.json({
      status: 200,
      msg: '删除成功',
    })
  }
}
