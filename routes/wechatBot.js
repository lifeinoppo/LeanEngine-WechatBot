var router = require('express').Router();
// 引用 wechat 库，详细请查看 https://github.com/node-webot/wechat
var wechat = require('wechat');

var qiniubucket = require('./qiniubucket.js');

// for extend to support cloud storage of message
var AV = require('leanengine');
var news = AV.Object.extend('news');
var Answer = AV.Object.extend('answers');


// most visit links 
var most_visited_array = [
"https://nanzhuang.tmall.com",
"http://www.tianya.cn",
"http://jiankang.163.com",
"http://www.mop.com",
"http://www.miaopai.com/miaopai/plaza"，
"http://health.sina.com.cn",
];

// voice reply , the book of answer
var answer_array = 
["http://ww4.sinaimg.cn/large/006tKfTcgy1ff1m70h0jaj30ii0cigpn.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1m7hbh8jj30gs0dimyo.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1m7se17ij30c2080wh6.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1m8tf4oxj30ni0iqqjm.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1m9hqrbaj30qa0ms7wh.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1m9daao8j30tw0hunom.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1m98dzx6j30dk0cwtea.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1m976sbmj30bq0bwqb6.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1m95sbbwj30ia0f2tme.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1m94bpa0j30ag09u0wk.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1maw8eu4j307q0c2gpw.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1mavspgdj30bo0detgk.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1mauf0omj30ha0msk59.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1mbio5umj30ca090ae1.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1mbifokqj30b206qn0r.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1mbhmahdj30m60t6hch.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1mc6r9isj30b60a8420.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1mc5lxwij30cq0fq44u.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1mc4yw4aj30k80k0ao2.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1mcrkn52j30ke0gc7e3.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mcpp6e6j30c2080wh6.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mcpiyo0j30ga0bcn5g.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1md8qig5j30ee05cn11.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1md76hyqj30bc0cmjxm.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1md5q8jgj30iw0ceqbf.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1mdlti7tj30ne07atd1.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1mdlfwctj30be05gdhm.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mdl5u9yj30gy07qn1b.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1meg4ecnj30bc0fcn2k.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mee9qaej30t80qonma.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1me69u20j30ti0mae6r.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1meyluuyj30aq0am0xf.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1mexdpfuj30ek0cuwl2.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mevwf5rj314w0cwgt6.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1mfd6uumj30is04mwin.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mfd15i9j30xa0agwlt.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mftcbhdj30fs0a6n0s.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1mfs8p0yj30o20i8adn.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1mfrtxg4j30yc0i8q5p.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1mgcfcwaj310o0fqwna.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mgblpf8j30i60gqdpu.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1mgat888j30hk0co47j.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1mgr5gg5j30gm09wgnc.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1mgqsgp2j30ce08oq4c.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1mh3nf4cj30lc0buafo.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1mh2xjw7j30j60lu7j4.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1mhfg3kuj30du07sq3q.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mhf1qfkj30xw0hcgw6.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mhdxecij317g0doaks.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1mhujs7uj30n80ikwoi.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1mht7o1kj30bi07240z.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mhsjncqj30vc0gcwxd.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1mi8dao1j30oq0k2qut.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff62oaq3luj309m05y0tc.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff62o7nkf4j30jc0dwwjs.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff62o3sdomj30gm0dmqdu.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff62ngsd30j30eo0dk76t.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff62ng02clj30ju0gq11i.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff62nepifqj30bk0bmq96.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff62rf0tmqj30gq0fi0x9.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff62reb6l4j30gs0f2tc7.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff62ut2tm0j30iu0h4q96.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff62untq8dj30h00g2wnc.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff62u1o9g9j3086062myg.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff62vdhlwdj30ec0de0vl.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff62vbkuirj30ey0f4gpo.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff630phvhtj30km0csaea.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff630p441yj30bm0dgjts.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff630n71k6j30j80f6gwn.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff6314wqyyj30kc0fs435.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff6314gly3j30fa0lqdr5.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff6313uwjmj30hw0fkgwk.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff631kvdogj30hm0figs9.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff631k26guj30ha0aqq6c.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff631jm47rj30jq0dwtiu.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff6328fb4hj30ds0aatav.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff6328438aj30je0bggv1.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff631ybz8sj30gs0dggo9.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff63322r3xj30ec096wgq.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff633133ldj30ea06cq4b.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff6330r7zlj30dw0j2ad8.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff65l5ey8gj30fm0ky0yj.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff65l3lt8hj30di08i75w.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff65l2q31hj30e60963zr.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65luwpeej30gi0iutdr.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff65lsbec0j30ac08yjt2.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff65lrto1rj30k60psat4.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65mbbcy2j30gy09wdj5.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65makm3nj30d209477v.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff65m9tdn4j30i20980ur.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff65mnhr36j30bg08ogp6.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff65mmo3asj30cy08yt9p.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff65mmbu6ij30ao058gn9.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff65n5j9s7j30fi0g4gqs.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65mzl9cjj30c005w407.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65mz1p89j30e006ota4.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65nlu3pdj308i07egn9.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff65nlf6jyj309w046q47.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff65nl7e4nj30ay06wdh5.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65qf8t2jj30cq08a768.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff65qemhidj30es08ijum.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff65qd3yp5j30ec07yq5r.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff65qr4bioj30go08kjwf.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff65qpsvl3j30c009iq4i.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65rmia1rj30cs0bk0wb.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff65rxi9m9j30ds0cw422.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff65rwlhrxj30gg07s78h.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff65rvmvjaj30hc0aa43f.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65sayaswj30fy05qjuk.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65sa2hgyj30iw08o7ah.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65sa2hgyj30iw08o7ah.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65sa2hgyj30iw08o7ah.jpg"];


var config = {
  token: process.env.token,
  appid: process.env.AppID,
  encodingAESKey: process.env.encodingAESKey,
  qingid : process.env.qingid,
  qingsecret : process.env.qingsecret,
  baiduak : process.env.baidu_ak,
  baidusk : process.env.baidu_sk
};

var WechatAPI = require('wechat-api');
var api = new WechatAPI(process.env.AppID,
  process.env.secretKey);

var ocr = require('baidu-ocr-api-another').create(config.baiduak,config.baidusk);

router.use('/', wechat(config.token).image(function(message, req, res, next) {
  // message为图片内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359124971',
  // MsgType: 'image',
  // PicUrl: 'http://mmsns.qpic.cn/mmsns/bfc815ygvIWcaaZlEXJV7NzhmA3Y2fc4eBOxLjpPI60Q1Q6ibYicwg/0',
  // MediaId: 'media_id',
  // MsgId: '5837397301622104395' }}).voice(function(message, req, res, next) {
  // TODO
      
  ocr.scan({
    url:message.PicUrl, // 支持本地路径
    type:'text',
  }).then(function (result) {

    var anew = new news();
    anew.set('content', result['results']['words']);
    anew.save();
   
   res.reply({
        type: "text",
        content: result['results']['words']
    });


  }).catch(function (err) {
    console.log('err', err);
  })    
  



}).text(function(message, req, res, next) {
  // message为文本内容
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125035',
  // MsgType: 'text',
  // Content: 'http',
  // MsgId: '5837397576500011341' }
  var keyArray = ['你好', '约吗','泼辣','七头牛'];
  var content = message.Content;
  var keyIndex = keyArray.indexOf(content);
  switch (keyIndex) {
    case 0:
      {
        res.reply({
          type: "text",
          content: '您好，大家好才是真的好！'
        });

      }
      break;
    case 1:
      {
        res.reply({
          type: "text",
          content: '不约，不约，叔叔我们不约！'
        });

      }
      break;
    case 2:
      {
        // for pic uploading test

          var ndwejdj = 0;
      }
      break;
    case 3:
      {
        // for pic uploading test

          
          var filePath = 'http://ppe.oss-cn-shenzhen.aliyuncs.com/collections/36/4/thumb.jpg';
          var bucket = 'from-wechat';
          var key = 'test_file1.jpg';
          var token = qiniubucket.uptoken(bucket,key);
          qiniubucket.uploadFile(token,key,filePath);
          

      }
      break;
    default:
      res.reply([
        {title:'Bilibili',  description:'Bilibili', picurl:'http://i1.hdslb.com/promote/d088cfcb7689f8c5d23cb88caca0c73b.jpg', url : 'http://search.bilibili.com/all?keyword='+content },
        {title:'SouGou',  description:'SouGou', picurl:'https://www.sogou.com/images/logo/new/search400x150.png', url : 'http://weixin.sogou.com/weixin?type=2&query='+content+'&ie=utf8&_sug_=n' },
        {title:'github',  description:'github', picurl:'https://assets-cdn.github.com/images/modules/about/about-header.jpg', url :  'https://github.com/search?utf8=✓&q='+content },
        {title:'BiYing',  description:'BiYing', picurl:'http://cn.bing.com/sa/simg/sw_mg_l_4e_ly_cn.png', url : 'http://cn.bing.com/search?q='+content },
        {title:'ximalaya',  description:'ximalaya', picurl:'http://s1.xmcdn.com/lib/open_static/1.0.0/css/img/common/inside-Logo-grey.png', url : 'http://www.ximalaya.com/search/'+content },
        {title:'ZHIHU',  description:'zhihu', picurl:'http://static.zhihu.com/static/revved/img/index/logo.6837e927.png', url : 'http://zhihu.sogou.com/zhihu?ie=utf8&p=73351201&query='+content },
        {title:'1haodian',  description:'1haodian', picurl:'http://d7.yihaodianimg.com/N07/M07/AE/F3/CgQIz1ZyfEqAaJj8AAAPqOO2cwQ12100.png', url : 'http://search.yhd.com/c0-0/k'+content },
        {title:'WeiBo',  description:'Weibo', picurl:'http://img.t.sinajs.cn/t6/style/images/global_nav/WB_logo_b.png', url : 'http://s.weibo.com/weibo/'+content+'&Refer=index'} 
         ]);
      break;
  }
}).voice(function(message, req, res, next) {
  // message为音频内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'voice',
  // MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
  // Format: 'amr',
  // MsgId: '5837397520665436492' }
        // save the Mediaid of the answer
        /*
        var answer = new Answer();
        answer.set('content', message.MediaId);
        answer.save();
        */

        var bias = answer_array.length-1;
        var random_index = new Number(Math.random()*bias).toFixed(0); 

        var bias_link = most_visited_array.length-1;
        var random_index_link = new Number(Math.random()*bias_link).toFixed(0);


        res.reply(
        {	
        	title:'answer',  
        	description:'answer', 
        	picurl: answer_array[random_index],
        	url : most_visited_array[random_index_link]
        });
       
   

}).video(function(message, req, res, next) {
  // message为视频内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'video',
  // MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
  // ThumbMediaId: 'media_id',
  // MsgId: '5837397520665436492' }
  // TODO
        
}).shortvideo(function(message, req, res, next) {
  // message为短视频内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'shortvideo',
  // MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
  // ThumbMediaId: 'media_id',
  // MsgId: '5837397520665436492' }
  // TODO
}).location(function(message, req, res, next) {
  // message为链接内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'link',
  // Title: '公众平台官网链接',
  // Description: '公众平台官网链接',
  // Url: 'http://1024.com/',
  // MsgId: '5837397520665436492' }
  // TODO
       
}).link(function(message, req, res, next) {
  // message为链接内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'link',
  // Title: '公众平台官网链接',
  // Description: '公众平台官网链接',
  // Url: 'http://1024.com/',
  // MsgId: '5837397520665436492' }
  // TODO
}).event(function(message, req, res, next) {
  // message为事件内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'event',
  // Event: 'LOCATION',
  // Latitude: '23.137466',
  // Longitude: '113.352425',
  // Precision: '119.385040',
  // MsgId: '5837397520665436492' }
  // TODO
}).device_text(function(message, req, res, next) {
  // message为设备文本消息内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'device_text',
  // DeviceType: 'gh_d3e07d51b513'
  // DeviceID: 'dev1234abcd',
  // Content: 'd2hvc3lvdXJkYWRkeQ==',
  // SessionID: '9394',
  // MsgId: '5837397520665436492',
  // OpenID: 'oPKu7jgOibOA-De4u8J2RuNKpZRw' }
  // TODO
}).device_event(function(message, req, res, next) {
  // message为设备事件内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'device_event',
  // Event: 'bind'
  // DeviceType: 'gh_d3e07d51b513'
  // DeviceID: 'dev1234abcd',
  // OpType : 0, //Event为subscribe_status/unsubscribe_status时存在
  // Content: 'd2hvc3lvdXJkYWRkeQ==', //Event不为subscribe_status/unsubscribe_status时存在
  // SessionID: '9394',
  // MsgId: '5837397520665436492',
  // OpenID: 'oPKu7jgOibOA-De4u8J2RuNKpZRw' }
  // TODO
}).middlewarify());

module.exports = router;
