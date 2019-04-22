const express = require('express');
const dbHelper = require('./lib/dbHelper');
const bodyParser = require('body-parser')
const multer = require('multer')
const upload = multer({
    dest: 'views/imgs/'
})
const path = require('path');
const cookieSession = require('cookie-session')
const app = express();
var svgCaptcha = require('svg-captcha');
app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))

app.use(express.static('views'))

app.use((req,res,next)=>{
    if(req.url.indexOf('/hero')===0){
        if(req.session.username){
            next()
        }else{
            res.send({
                code:400,
                msg:'请先登录'
            })
        }
    }else{
        next();
    }
})

app.get('/heroList', (req, res) => {
    // 接收数据 页码
    const pagenum = parseInt(req.query.pagenum)
    // 接收数据 页容量
    const pagesize = parseInt(req.query.pagesize)

    // 接收数据 查询条件
    const query = req.query.query

    // 获取所有数据
    dbHelper.find('cqlist', {}, result => {
        result = result.reverse();
        // result.result();
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
    dbHelper.find('cqlist', {
        _id: dbHelper.ObjectId(id)
    }, result => {
        // 返回查询的数据
        res.send(result[0])
    })
})

app.post('/heroAdd', upload.single('heroIcon'), (req, res) => {
    const heroName = req.body.heroName;
    const skillName = req.body.skillName;
    const heroIcon = path.join('imgs', req.file.filename);
    // console.log(heroIcon,skillName,heroName);
    dbHelper.insertOne('cqlist', {
        heroName,
        skillName,
        heroIcon
    }, (result) => {
        res.send({
            code: 200,
            msg: '添加成功'
        })
    })
})

app.post('/heroUpdata', upload.single('heroIcon'), (req, res) => {
    const heroName = req.body.heroName;
    const skillName = req.body.skillName;
    const id = req.body.id;
    let herocq = {
        heroName,
        skillName,
    }
    if (req.file) {
        const heroIcon = path.join('imgs', req.file.filename);
        herocq.heroIcon = heroIcon;
    }
    // console.log(heroIcon,skillName,heroName);
    dbHelper.updateOne('cqlist', {
        _id: dbHelper.ObjectId(id)
    }, herocq, result => {
        res.send({
            code: 200,
            msg: '添加成功'
        })
    })
})

app.get('/heroDelete', (req, res) => {
    const id = req.query.id;
    dbHelper.deleteOne('cqlist', {
        _id: dbHelper.ObjectId(id)
    }, result => {
        res.send({
            code: 200,
            msg: '删除成功'
        })
    })
})

app.post('/register', (req, res) => {
    dbHelper.find('userlist', {
        username: req.body.username
    }, result => {
        if (result.length === 0) {
            //没有
            dbHelper.insertOne('userlist', req.body, result => {
                res.send({
                    code: '200',
                    msg: '账号注册成功'
                })
            })
        } else {
            //有
            res.send({
                code: '400',
                msg: '此账号已被使用'
            })
        }
    })
})

app.get('/captcha', function (req, res) {
    var captcha = svgCaptcha.create();
    req.session.vcode = captcha.text
    res.type('svg');

    res.status(200).send(captcha.data);
    console.log(captcha.text);
    // console.log(req.session.vcode);

});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let vcode = req.body.vcode;
    if (req.session.vcode.toLowerCase() === vcode.toLowerCase()) {
        //验证正确
        // res.send('恭喜正确,进入下一个(测试)')
        dbHelper.find('userlist', {
            username,
            password
        }, (result) => {
            if (result.length != 0) {
                req.session.username = username
                //有
                res.send({
                    code: 200,
                    msg: '欢迎回来',
                    username
                })

            } else {
                //没有
                res.send({
                    code: 400,
                    msg: '账号或密码错误'
                })
            }
            // console.log(result);

        })
    } else {
        res.send({
            code: '401',
            msg: '验证码错误,请重新输入'
        })
    }

})

app.get('/logout',(req,res)=>{
    req.session = null;
    res.send({
        code:200,
        msg:'退出成功'
    })
})


app.listen('3000')