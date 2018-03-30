var express = require('express');
var router = express.Router();//返回一个路由的实例
var auth = require('../auth');

/* GET users listing. */
router.get('/reg',auth.mustNotLogin,function (req, res, next) {
    res.render('user/reg',{
        'title':'用户注册'
    });
});

router.post('/reg',auth.mustNotLogin,function (req, res, next) {
    var user = req.body;
    if (user.password != user.repassword){
        req.flash('error','两次输入的密码不一致');
        return res.redirect('back');//回退到上个页面
    }
    delete user.repassword;
    user.password = blogUtil.md5(user.password);
    user.avatar = "https://secure.gravatar.com/avatar/"+blogUtil.md5(user.email)+"?s=48";
    new Modle('User')(user).save(function (err,doc) {
        if (err){
            req.flash('error','注册失败');
        }else {
            req.session.user = doc;
            req.flash('success','注册成功');
            res.redirect('/');
        }

    });
});

router.get('/login',auth.mustNotLogin,function (req, res, next) {
    res.render('user/login',{
        'title':'用户登录'
    });
});

router.post('/login',auth.mustNotLogin,function (req, res, next) {
    if(req.body){
        var user = req.body;
        user.password = blogUtil.md5(user.password);
        Modle('User').findOne(user,function (err,doc) {
            if(err){
                req.flash('error','用户名或密码错误，请重新登录');
                return res.redirect('back');
            }else {
                req.session.user = doc;
                req.flash('success','欢迎登录');
                res.redirect('/');
            }
        });
    }else {
        req.flash('error','输入不能为空');
        return res.redirect('back');
    }

});

router.get('/logout',auth.mustLogin,function (req, res, next) {
    req.session.user = null;
    res.redirect('/');
});


module.exports = router;
