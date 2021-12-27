const mysqlDb = require("mysql");
let options = {
  host: "esick.xyz",
  user: "users",
  password: "123",
  database: "users",
  multipleStatements: true, //启用多线池
};
var pool = mysqlDb.createPool(options);
exports.base = function (sql, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        reject(err);
        //console.log(err, "数据库连接失败");
        resolve({
          status: 500,
        });
      } else {
        //console.log("数据库连接成功");
        connection.query(sql, values, (err, results) => {
          if (err) {
            reject(err);
            resolve({
              status: 400,
            });
          } else {
            connection.release();
            resolve({
              status: 200,
              results,
            });
            //resolve(rows)
          }
          //connection.release() // 释放连接池
        });
      }
    });
  });
};
