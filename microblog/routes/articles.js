var express = require('express');
var auth = require('../auth');
var path = require('path');
var markdown = require('markdown').markdown;
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({ storage: storage });

var router = express.Router();//返回一个路由的实例

//添加文章
router.get('/add',auth.mustLogin,function (req, res, next) {
    res.render('article/add',{article:{}});
});

//显示文章详情
router.get('/detail/:_id',function (req, res, next) {
    var _id = req.params._id;
    Modle('Article').findById(_id,function (err,article) {
        if (err && !article){
            req.flash('error','文章不存在');
        }else {
            article.content = markdown.toHTML(article.content);
            res.render('article/detail',{article:article});
        }
    });
});

//编辑已经发表的文章
router.get('/edit/:_id',function (req, res, next) {
    var _id = req.params._id;
    Modle('Article').findById(_id,function (err,article) {
        if (err && !article){
            req.flash('error','文章不存在');
        }else {
            res.render('article/add',{article:article});
        }
    });
});


//删除已经发表的文章
router.get('/delete/:_id',function (req, res, next) {
    var _id = req.params._id;
    Modle('Article').findByIdAndRemove(_id,function (err,result) {
        if(err){
            req.flash('error','删除文章失败');
            return res.redirect('back');
        }else {
            req.flash('success','删除文章成功');
            res.redirect('/');
        }
    });
});

//发表文章
router.post('/add',auth.mustLogin,upload.single('img'),function (req, res, next) {
    var article = req.body;
    var _id = req.body._id;

    if (req.file){
        article.img = path.join('/uploads',req.file.filename);
    }

    if (_id){//这里进行判断，是否是更新后的文章，还是第一次发表的文章
        var update = {
            title:article.title,
            content:article.content
        };
        if (article.img){
            update.img = article.img;
        }
        Modle('Article').findByIdAndUpdate(_id,{$set:update},function (err,article) {
            if(err){
                req.flash('error','文章更新失败');
                return res.redirect('back');
            }else {
                req.flash('success','文章更新成功');
                res.redirect('/articles/detail/'+_id);
            }
        });
    }else {
        delete article._id;
        var user = req.session.user;
        article.author = user._id;
        new Modle('Article')(article).save(function (err,article) {
            if(err){
                console.error(err);
                req.flash('error','文章发表失败');
                return res.redirect('back');
            }else {
                req.flash('success','文章发表成功');
                res.redirect('/');
            }
        });
    }

});

router.get('/list/:pageNum/:pageSize',function (req, res, next) {
    var query = {};
    var pageNum = parseInt(req.params.pageNum);
    var pageSize = parseInt(req.params.pageSize);
    if (req.query.keyword) {
        req.session.keyword = req.query.keyword;
        query['title'] = new RegExp(req.query.keyword, 'i');
    }
    Modle('Article').count(query,function (err,count) {
        Modle('Article').find(query).skip((pageNum-1)*pageSize).limit(pageSize).sort({createAt:-1}).populate('author').exec(function (err, articles) {
            articles.forEach(function (article) {
                article.content = markdown.toHTML(article.content);
            });
            res.render('index', {
                articles: articles,
                keyword:req.query.keyword,
                pageNum:pageNum,
                pageSize:pageSize,
                totalPage:Math.ceil(count/pageSize)
            });
        });
    });

});

module.exports = router;