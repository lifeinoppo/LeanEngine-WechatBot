var router = require('express').Router();
// 引用 wechat 库，详细请查看 https://github.com/node-webot/wechat
var wechat = require('wechat');

var qiniubucket = require('./qiniubucket.js');


var config = {
  token: process.env.token,
  appid: process.env.AppID,
  encodingAESKey: process.env.encodingAESKey,
  qingid : process.env.qingid,
  qingsecret : process.env.qingsecret 
};

var WechatAPI = require('wechat-api');
var api = new WechatAPI(process.env.AppID,
  process.env.secretKey);

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
      
  
        res.reply({
          type: "text",
          content: message.CreateTime
        });
  


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
        res.reply({
          type: "text",
          content: '不约，不约，叔叔我们不约！'
        });
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
        res.reply({
          type: "text",
          content: '不约，不约，叔叔我们不约！'
        });
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
