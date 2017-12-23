var router = require('express').Router();


/* X.html
<iframe name='iframe1' marginwidth=0 marginheight=0 width=100% height='600' src="http://s.weibo.com/weibo/huanyouji&Refer=index" frameborder=0></iframe>
<iframe name='iframe2' marginwidth=0 marginheight=0 width=100% height='600' src="http://zhihu.sogou.com/zhihu?query=huanyouji&ie=utf8&w=&sut=120&sst0=1513519523658&lkt=2%2C1513519523497%2C1513519523553" frameborder=0></iframe>
<iframe name='iframe3' marginwidth=0 marginheight=0 width=100% height='600' src="https://www.sogou.com/web?query=huanyouji&_asf=www.sogou.com&_ast=&w=01019900&p=40040100&ie=utf8&from=index-nologin&s_from=index&sut=273&sst0=1513519511336&lkt=1%2C1513519511244%2C1513519511244&sugsuv=1513519509325815&sugtime=1513519511336" frameborder=0></iframe>
<iframe name='iframe4' marginwidth=0 marginheight=0 width=100% height='600' src="https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=huanyouji&oq=djkds&rsv_pq=c36089d500011126&rsv_t=16695IEDeiQ6N7%2BAUr0DUSqpRZ2I90wWcqijcRaWzmqOwCSF6GFXeq%2BDZfo&rqlang=cn&rsv_enter=1&inputT=3646&rsv_sug3=16&rsv_sug1=5&rsv_sug7=100&rsv_sug2=0&rsv_sug4=3646" frameborder=0></iframe>
*/

router.use('/', function(req,res,next){
	 res.render('X', {
	    keyword: req.query.q
	  });
});



module.exports = router;