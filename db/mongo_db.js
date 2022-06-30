const config = require('./config.js')
var MongoClient = require('mongodb').MongoClient
// var url = 'mongodb://root:Lw135246@dds-wz9d6a6d9e6c9f141.mongodb.rds.aliyuncs.com:3717,dds-wz9d6a6d9e6c9f142.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-46400415'
var url = config.mongodb_url
var connect = function () {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
      if (err) {
        reject(err)
      } else {
        // console.log(db)
        console.log('数据库已创建!')
        resolve(db)
      }
    })
  })
}
exports.count = async function (database, tablename, data) {
  let conn = await connect()
  var dbbase = conn.db(database)
  let total = await dbbase.collection(tablename).find(data).count()
  conn.close()
  return total
}

exports.findData = async function (database, tablename, data, sort) {
  let conn = await connect()
  var dbbase = conn.db(database)
  let res = await dbbase.collection(tablename).find(data).sort(sort).toArray()
  conn.close()
  return res
}

exports.pageing = async function (database, tablename, data, skip, limit, sort) {
  const conn = await connect()
  const dbbase = conn.db(database)
  let total = await dbbase
    .collection(tablename)
    .find(data)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .count()
  let res = await dbbase
    .collection(tablename)
    .find(data)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .toArray()
  conn.close()
  return { total, res }
}


exports.updateOne = async function (database, tablename, data, set) {
  const conn = await connect();
  const dbbase = conn.db(database);
  let res = dbbase.collection(tablename).updateOne(data, set)
  conn.close
  return res
}