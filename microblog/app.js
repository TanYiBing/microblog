var express = require('express');
var path = require('path');//处理路径
var favicon = require('serve-favicon');//处理收藏夹图标
var logger = require('morgan');//处理日志
var cookieParser = require('cookie-parser');//处理cookie req.cookie  req.cookies
var bodyParser = require('body-parser');//解析请求体
var flash = require('connect-flash');
var session = require('express-session');//依赖cookieParser，要放在cookieParser的下面
var mongoStore = require('connect-mongo')(session);

require('./util');//自己的工具文件
require('./db');//连接数据库加载
var settings = require('./settings');

var routes = require('./routes/index');//根路由;
var users = require('./routes/users');//用户路由
var articles = require('./routes/articles');//文章路由

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));//设置模板的存放路径
app.set('view engine', 'html');//设置模板引擎
app.engine('html',require('ejs').__express);//设置对html文件的渲染方式


//uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));//指定日志输出的格式
app.use(bodyParser.json());//处理JSON  通过Content-Type来判断是否由自己来处理
app.use(bodyParser.urlencoded({ extended: false }));//处理form-urlencoded
app.use(cookieParser());//处理cookie 把请求头中的cookie转换成对象，加入一个cookie函数的属性
app.use(session({
    saveUninitialized:true,
    secret:'tyb',
    resave:true,
    store:new mongoStore({url:settings.dbUrl})
}));
app.use(express.static(path.join(__dirname, 'public')));//静态文件服务
app.use(flash());
app.use(function (req,res,next) {
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString()||'';//这里使用（）而不是[]
    res.locals.error = req.flash('error').toString()||'';
    res.locals.keyword = req.session.keyword;
    next();

});

app.use('/', routes);
app.use('/users', users);
app.use('/articles',articles);



// catch 404 and forward to error handler
//捕获404错误并且发送到错误处理中间件(前面的路由没有匹配到)
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);

});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};//设置参数数据
    // render the error page
  res.status(err.status || 500);//设置响应状态码
  res.render('error');//渲染模板

});



module.exports = app;