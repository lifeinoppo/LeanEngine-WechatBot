var router = require('express').Router();

// read data from 'recommend' class in lean and show it to terminal users
var AV = require('leanengine');
var _recommend = AV.Object.extend('recommend');


router.use('/', function(message, req, res, next) {
	// do some thing here , users can determin the need for 
	// special kinds of news, actually templates for all kinds of news 
	// is recommended to be used here. 
	// for example,  xxx.lean.cn/tech    or  xxx.lean.cn/videos 
	// not useable yet
	var query = new AV.Query(Todo);
	query.descending('createdAt');

	query.find().then(function(results) {
    res.render('recommend', {
      title: '推荐 列表',
      recommend: results
    });


   });

});	
