//检查必须登录，不登录就跳到登录页
exports.mustLogin = function (req,res,next) {
  if (req.session.user) {
      next();
  }else {
      req.flash('error','你尚未登录，请登录');
      res.redirect('/users/login');
  }
};

//检查未登录，已登录就跳到首
exports.mustNotLogin = function (req,res,next) {
    if (req.session.user) {
        req.flash('error','你已登录');
        res.redirect('/users/login');
    }else {
        next();
    }
};