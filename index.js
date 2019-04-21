const express = require('express');
const dbHelper = require('./lib/dbHelper');

const multer  = require('multer')
const upload = multer({ dest: 'views/imgs/' })
const path = require('path');
const app = express();



app.use(express.static('views'))

app.get('/heroList', (req, res) => {
    // 接收数据 页码
    const pagenum = parseInt(req.query.pagenum)
    // 接收数据 页容量
    const pagesize = parseInt(req.query.pagesize)
  
    // 接收数据 查询条件
    const query = req.query.query
  
    // 获取所有数据
    dbHelper.find('cqlist', {}, result => {
      // 检索出符合查询条件的数据
      const temArr = result.filter(v => {
        if (v.heroName.indexOf(query) != -1 || v.skillName.indexOf(query) != -1) {
          return true
        }
      })
      // 返回的数据
      let list = []
      // 计算起始索引
      const startIndex = (pagenum - 1) * pagesize
      // 计算结束索引
      const endIndex = startIndex + pagesize
      // 获取当前这一页的数据
      for (let i = startIndex; i < endIndex; i++) {
        if (temArr[i]) {
          list.push(temArr[i])
        }
      }
      // 获取总页数
      const totalPage = Math.ceil(temArr.length / pagesize)
      // 返回数据
      res.send({
        totalPage,
        list
      })
    })
  })
  
  // 路由2 英雄详情
  app.get('/heroDetail', (req, res) => {
    // 获取id
    const id = req.query.id
    // 根据id查询数据
    dbHelper.find('cqlist', { _id: dbHelper.ObjectId(id) }, result => {
      // 返回查询的数据
      res.send(result[0])
    })
  })


app.post('/heroAdd',upload.single('heroIcon'),(req, res) => {
    const heroName = req.body.heroName;
    const skillName = req.body.skillName;
    const heroIcon=path.join('imgs',req.file.filename);
    // console.log(heroIcon,skillName,heroName);
    dbHelper.insertOne('cqlist',{
        heroName,
        skillName,
        heroIcon
    },(result)=>{
        res.send({
            code:200,
            msg:'添加成功'
        })
    })  
})

app.post('/heroUpdata',upload.single('heroIcon'),(req, res) => {
    const heroName = req.body.heroName;
    const skillName = req.body.skillName;
    const heroIcon=path.join('imgs',req.file.filename);
    const id = req.body.id;
    // console.log(heroIcon,skillName,heroName);
    dbHelper.updateOne('cqlist',{_id:dbHelper.ObjectId(id)},{
        heroName,
        skillName,
        heroIcon
    },result=>{
        res.send({
            code:200,
            msg:'添加成功'
        })
    })
})

app.get('/heroDelete',(req,res)=>{
    const id = req.query.id;
    dbHelper.deleteOne('cqlist',{_id:dbHelper.ObjectId(id)},result=>{
        res.send({
            code:200,
            msg:'删除成功'
        })
    })
})


app.listen('3000')