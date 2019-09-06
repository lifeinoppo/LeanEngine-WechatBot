var router = require('express').Router();
// 引用 wechat 库，详细请查看 https://github.com/node-webot/wechat
var wechat = require('wechat');

var qiniubucket = require('./qiniubucket.js');

// for extend to support cloud storage of message
var AV = require('leanengine');
var news = AV.Object.extend('news');
var Answer = AV.Object.extend('answers');
var bookmarks = AV.Object.extend('bookmarks');
var weblinks = AV.Object.extend('weblinks');
var keywords = AV.Object.extend('keywords');

var special_events = [
  "http://ww2.sinaimg.cn/large/006tKfTcgy1ffk5cqlukoj30b407r0tk.jpg",
  "https://y.qq.com/n/yqq/song/002edeyc0xaACC.html?ADTAG=baiduald&play=1"

];

// for convert link to epub books to ireader
const EpubPress = require('epub-press-js');


// wechat focus history 
var wechat_focus = [
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA4NDI3NjcyNA==&scene=124#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA4NTQ5NzAzMw==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MjM5MjQxNjg2NA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA5MTE5MzExMQ==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzIyMDEyMjM1MA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzAxNTQyMzA4NA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MjM5NTIwMzIzNg==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MjM5NjQ5MTI5OA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzI1NjE2MDAwMQ==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzI2ODAzNzQ0Mw==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzI0MjAwNzExOA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MjM5MDM0NDY2Mg==&scene=123#wechat_redirect",
"http://www.520fx.com/Resources/isvrshow/listnews.php",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA4NTEyOTY1MA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MjM5NDA2MTgwMg==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzIyMDI0NzEwOQ==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA5MzQ2Mjc3MA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzAxNTM4NzU4Ng==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MjM5MDE2MDYxMg==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzIxNjA5MzUyNA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA4ODQ1NzIzMA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA5ODY2NzUzMg==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA5ODg4Mzk2OQ==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzI0MTAzMzY3Mw==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzI1MTA0MDk4NQ==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzI2NTE3MjAyNA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzIwMTE2OTQ2NQ==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzAxNzcwMTA4Ng==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzI0NTQyOTg2OA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MjM5NTEwMTAwNg==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA3MzU1MzMzNg==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzAxNjU3NTU4OQ==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzAwNDkyNzM3OQ==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA4OTk1MTczMA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA3MDI3MjI4OA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzI4ODMxNjk0NA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA4MTE1ODQzOQ==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzI1NjAzMDQ0NA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzA5NjU5NjQ4MA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzAxODYzNjY5Ng==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzIxNjU4Njg1Mw==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzI4ODUxNTczMA==&scene=123#wechat_redirect",
"https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MjM5NjM3Nzk4Mg==&scene=123#wechat_redirect",

];


// bookmarks array 
var bookmarks_array = [
"http://doxmate.cool/node-webot/wechat/index.html",
"https://www.kaggle.com/?",
"http://login.codevs.com/auth/choose",
"https://github.com/netpi/baidu-ocr-api",
"https://www.ricequant.com/community/topic/558/",
"http://www.ytz8.com/user/index.html",
"https://www.joinquant.com/post/1025?f=study&m=guide",
"https://aws.amazon.com/cn/free/?sc_channel=PS&sc_campaign=acquisition_CN&sc_publisher=baidu&sc_category=pc&sc_medium=cloud_computing_competitor_nb&sc_content=%E5%85%B6%E5%AE%83_competitor_e&sc_detail=%e4%b8%bb%e6%9c%ba%e5%b1%8b&sc_segment=100015275&sc_matchtype=phrase&sc_country=CN&s_kwcid=AL!4422!88!5433146304!!56880881598&ef_id=WNEH2QAABE47na9Z:20170321110041:s",
"http://xiuxiu.web.meitu.com/decorate/",
"https://gitter.im/breakwa11/shadowsocksr",
"https://tab.leancloud.cn/cloud.html?appid=egOOjBfxtQTcWUYQs3CwCmdx-9Nh9j0Va#/deploy",
"https://docs.docker.com/docker-for-mac/",
"http://www.gaitubao.com/",
"http://mongoosejs.com/index.html",
"http://node-tricks.com/category/express/",
"http://www.jack003.com/",
"https://www.npmjs.com/package/made-in-bulgaria",
"http://blog.sina.com.cn/s/blog_48ab118d0101fo3q.html",
"http://phphttpclient.com/",
"http://www.w3cfuns.com/",
"https://zhuanlan.zhihu.com/shenzhenware",
"http://www.cnblogs.com/tk091/p/3671160.html",
"https://packagist.org/",
"http://www.kancloud.cn/weekly/www-75team/85705",
"http://www.oschina.net/question/5189_4306",
"https://www.acrcloud.com/docs/audio-fingerprinting-api/",
"https://dribbble.com/shots/1184620-Disqus-Palette",
"https://dribbble.com/",
"http://www.runoob.com/react/react-install.html",
"https://segmentfault.com/a/1190000000473869",
"https://www.heroku.com/home",
"https://www.nodejitsu.com/",
"http://aosabook.org/en/index.html",
"http://i5ting.github.io/reactjs-getting-start/",
"http://auraphp.com/",
"http://www.alloyteam.com/",
"http://gold.xitu.io/#/",
"http://jsbin.com/?html",
"http://nodeframework.com/",
"https://github.com/trending",
"http://debug.fangbei.org/",
"http://www.cnblogs.com/txw1958/p/mp-weixin-debug.html",
"http://www.open-open.com/github/",
"https://developer.apple.com/account/#/welcome",
"http://dev.xiaomi.com/index",
"http://www.cnblogs.com/lyzg/",
"http://www.tuicool.com/articles/7V7vYn",
"http://www.tuicool.com/articles/UBNvMjq",
"http://www.oschina.net/translate/installing-docker-on-mac-os-x",
"http://www.alauda.cn/tutorial/",
"https://leetcode.com/",
"http://www.360doc.com/content/09/1011/09/370541_7102598.shtml",
"http://club.alibabatech.org/",
"https://www.shodan.io/",
"http://docs.upyun.com/api/rest_api/#api_1",
"http://lock522.b0.upaiyun.com/2-wangjin.pdf",
"http://lock522.b0.upaiyun.com/zhangzhaokun.mp4",
"http://www.runoob.com/php/php-json.html",
"http://www.jb51.net/article/27954.htm",
"http://blog.sina.com.cn/s/blog_68b4ec9b0101eoze.html",
"http://yaml.org/",
"http://www.jb51.net/LINUXjishu/19905.html",
"http://open.weibo.com/wiki/2/place/nearby/pois",
"http://www.ibm.com/developerworks/cn/web/wa-mean1/",
"http://c.runoob.com/compile/1",
"http://c.runoob.com/compile/73",
"http://c.runoob.com/compile/66",
"https://book.douban.com/subject/1079252/",
"http://guides.ruby-china.org/getting_started.html",
"http://www.ruanyifeng.com/blog/2015/03/react.html",
"https://github.com/NLPChina",
"https://github.com/hongyangAndroid",
"http://sspai.com/26632",
"https://www.zhihu.com/question/20656680",
"http://www.cocoachina.com/",
"https://yq.aliyun.com/articles/?spm=5176.7960203.201.187.oIk5lb&sort=top",
"https://api.weibo.com/oauth2/authorize?client_id=2354958370&redirect_uri=http%3A%2F%2Fwww.sinacloud.com%2Fsso%2Fweibo_callback.html%3Fsccb%3Dhttp%253A%252F%252Fsae.sina.com.cn%252F%253Fm%253Duser%2526a%253Dreg_check_login&response_type=code&forcelogin=true",
"https://www.aliyun.com/?utm_medium=text&utm_source=bdbrand&utm_campaign=bdbrand&utm_content=se_32492",
"https://bce.baidu.com/index.html?t=cp:nsem%7Cpf:pc%7Cpp:baiducloud%7Cpu:baiducloud%7Ckw:1231",
"http://www.github.com/",
"https://www.apple.com/cn/",
"https://www.icloud.com",
"http://www.baidu.com",
"http://www.weibo.com/",
"https://www.linkedin.com",
"http://guides.ruby-china.org/getting_started.html",
"http://yuedu.baidu.com/ebook/5e5a74d102d276a200292ebc?fr=aladdin&key=%E4%BB%8E%E9%9B%B6%E5%BC%80%E5%A7%8B%E5%81%9A%E8%BF%90%E8%90%A5&f=read&fsend=send_to_phone",
"http://www.iqiyi.com/v_19rrifvfoa.html?vfm=2008_aldbd&fc=828fb30b722f3164&fv=p_02_01",
"http://so.iqiyi.com/so/q_%E7%99%BD%E8%89%B2%E5%B7%A8%E5%A1%94%E6%97%A5%E5%89%A7_p_4",
"https://www.npmjs.com/",
"http://lz.book.sohu.com/chapter-17548-113838370.html",
"http://www.w3cfuns.com/",
"http://www.php230.com/1410669841.html",
"https://bitmessage.org/wiki/Main_Page",
"http://huzj.sinaapp.com/gif/editor.html",
"http://v.youku.com/v_show/id_XMTM0MTMyNTcyMA==.html?from=s1.8-1-1.1",
"https://portal.qiniu.com/create/third_party_ufop/sequickimage/document",
"http://www.th7.cn/db/mysql/201504/101743.shtml",
"http://www.tuicool.com/articles/3eIJj2j",
"http://www.cnblogs.com/weilaikeji/archive/2013/05/30/3107836.html",
"http://www.cnblogs.com/TsengYuen/archive/2012/01/11/2318920.html",
"http://www.yxdown.com/soft/248118.html",
"http://www.mp4ba.com/show.php?hash=9a98075156544672445e35d39b2249326cb2862c",
"http://v.youku.com/v_show/id_XNDg2MTExNg==.html?from=s1.8-1-1.2",
"http://v.youku.com/v_show/id_XNTEyMjQ0OA==.html?from=y1.2-1-87.3.1-2.1-1-1-0-0",
"http://v.youku.com/v_show/id_XNTE2NTgxMg==.html?from=s1.8-1-1.2",
"http://blog.sina.com.cn/chenjianjunht",
"https://www.zhihu.com/question/20541129",
"http://www.centoscn.com/CentosServer/www/2015/0730/5944.html",
"http://www.cnblogs.com/kluan/p/4452696.html",
"http://blog.sina.com.cn/s/blog_6341be650100gl3q.html",
"http://seisman.info/linux-environment-for-seismology-research.html",
"http://www.jb51.net/os/188488.html",
"http://www.jb51.net/article/23140.htm",
"http://www.centoscn.com/image-text/install/2015/0426/5278.html",
"http://blog.163.com/hehaifeng1984@126/blog/static/6900113620148394513761/",
"http://www.thinksaas.cn/topics/0/344/344759.html",
"http://my.oschina.net/jerryhu/blog/284534",
"http://www.centoscn.com/CentosServer/www/2013/0928/1748.html",
"https://github.com/maq128/cdn-cache",
"http://www.alauda.cn/",
"http://www.alauda.cn/2016/03/23/monolith-to-microservice/",
"http://git.oschina.net/zxynk666666/cloud9",
"http://mp.weixin.qq.com/s?__biz=MzA4MzQ1NjQ5Nw==&mid=400708643&idx=1&sn=5d2fcc296cfb82b6aef5b1310d18114c&scene=21#wechat_redirect",
"http://www.alauda.cn/2016/03/23/docker-monitor/",
"http://www.alauda.cn/tutorial/",
"http://www.oschina.net/news/58585/8-ways-to-use-docker-in-the-real-world",
"https://github.com/zry656565/bulk-upload-to-UPYUN",
"http://jerryzou.com/posts/bulkUploadToUPYUN/",
"https://github.com/wwj718/qingcloud_cron",
"http://www.qcloud.com/wiki/API%E8%AF%B4%E6%98%8E%E6%96%87%E6%A1%A3",
"http://zhuanlan.zhihu.com/p/20742139",
"http://www.linuxidc.com/Linux/2014-07/104768.htm",
"http://mp.weixin.qq.com/s?__biz=MjM5NzI0Njc2MA==&mid=2664563186&idx=1&sn=2b7930e69e194c5f389f4bd7ff5f4ce8&scene=1&srcid=051215q3LAoQcGf9BpfNuUqa#wechat_redirect",
"http://www.zhihu.com/question/23655827",
"https://www.youtube.com/watch?v=ZR3Jirqk6W8",
"https://en.wikipedia.org/wiki/Lambda_calculus",
"http://wingolog.org/archives/2011/07/12/static-single-assignment-for-functional-programmers",
"http://learnyouahaskell.com/chapters",
"https://github.com/windweller/ScalaWebREPL/blob/master/views/slides.md",
"http://twitter.github.io/scala_school/zh_cn/",
"http://bluereader.org/article/93156625",
"http://cctc.csdn.net/",
"https://developer.apple.com/downloads/",
"https://developer.apple.com/library/ios/navigation/#section=Topics&topic=Xcode",
"https://developer.apple.com/library/ios/referencelibrary/GettingStarted/DevelopiOSAppsSwift/Lesson1.html#//apple_ref/doc/uid/TP40015214-CH3-SW1",
"http://open.daocloud.io/tag/python-kai-fa-zhe-de-docker-zhi-lv/",
"https://account.daocloud.io/signup",
"http://lz.book.sohu.com/serialize-id-24845.html",
"http://lz.book.sohu.com/book-14109.html",
"http://lz.book.sohu.com/book-9784.html",
"http://www.xunread.com/article/97d9261f-a337-4be3-bed9-1a76958415e6/33.shtml",
"http://blog.sina.com.cn/sunwenran",
"http://www.yedaw.com/jing/201408/598_4.html",
"http://yi-see.com/art_19882_1289.html",
"http://data.book.hexun.com/book-20536.shtml",
"http://www.duokan.com/book/91394",
"http://yuedu.baidu.com/ebook/48ba1155bb4cf7ec4bfed01e?fr=booklist",
"http://yuedu.baidu.com/ebook/e1a77bc9767f5acfa0c7cd3c?fr=aladdin&key=%E4%B8%80%E5%8F%AA%E7%8C%AB%E5%9C%A8%E4%BA%BA%E9%97%B4",
"http://stormzhang.com/android/2014/08/27/adb-over-wifi/",
"http://debug.fangbei.org/",
"http://www.freehao123.com/",
"http://www.freehao123.com/tag/mianfei-vps/",
"https://code.csdn.net/Tencent/rapidjson/tree/master",
"https://github.com/miloyip/rapidjson",
"https://dribbble.com/wenli",
"https://dribbble.com/",
"http://01org.github.io/jWebAudio/",
"http://zhangwenli.com/jCorner/",
"https://mp.weixin.qq.com/s?__biz=MjM5Mjg4NDMwMA==&mid=2652973553&idx=2&sn=0b3e94a1306ba2805ef6d94a6b2d6b9d&scene=0&key=f5c31ae61525f82e66a4e04df12c9253bb43d0a6de1357866e341374a4492e739aec6ad6622ad9fea2b3bb9d29527df7&ascene=0&uin=MTIxMjkyMDkyMg%3D%3D&devicetype=iMac+MacBookPro12%2C1+OSX+OSX+10.11.4+build(15E65)&version=11020201&pass_ticket=37T6tJX%2BZXj%2FH4gvDSpD8oDmZ%2FnuucSA%2Ft0bI2H%2FSx0IbM67ww5kQKJ1n3eLG6A3",
"http://yuedu.baidu.com/ebook/94c34998d1f34693daef3e65?fr=aladdin&key=%E5%BD%93%E4%B8%8B%E7%9A%84%E5%8A%9B%E9%87%8F",
"http://www.oschina.net/p/colorify-js",
"http://fbrctr.github.io/",
"http://yuedu.baidu.com/ebook/5bdb7ce203d8ce2f01662337?fr=aladdin&key=%E9%BA%A6%E8%82%AF%E9%94%A1%E6%96%B9%E6%B3%95",
"https://werobot.readthedocs.io/en/latest/",
"http://yuedu.baidu.com/ebook/d817967416fc700abb68fca1?fr=aladdin&key=docker%E5%85%A5%E9%97%A8%E5%AE%9E%E6%88%98",
"http://dockone.io/",
"http://spine.github.io/",
"http://yijiebuyi.com/blog/77db2532be0afae2959cd918331d9dda.html",
"http://jingyan.baidu.com/article/d5c4b52be87767da560dc5f5.html",
"http://www.cnblogs.com/jaxu/p/5193643.html",
"http://developer.android.com/sdk/index.html",
"http://my.oschina.net/joanfen/blog/145723",
"http://pan.baidu.com/s/1dDDxGyP",
"http://www.oneapm.com/",
"http://www.tudou.com/programs/view/BxDlTOW2jI8/",
"https://segmentfault.com/a/1190000000361440",
"https://gitter.im/olivernn/lunr.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge",
"http://www.ximalaya.com/20984485/sound/10282971",
"https://read.douban.com/ebook/12051836/?dcs=subject-rec&dcm=douban&dct=10549733",
"https://read.douban.com/ebook/10183064/?icn=profile-guess",
"https://github.com/feuyeux/jax-rs2-guide",
"http://m.youku.com/video/id_XODUwNzQ0Mzg4.html?x=&from=y11.3-movie-grid-1095-9921.95882.2-1",
"https://github.com/Ovilia/ThreeExample.js",
"https://github.com/lukehoban/es6features",
"https://www.cloudfoundry.org/category/developer-blog/",
"https://www.openshift.com/",
"http://wiki.ros.org/amcl",
"http://blog.sina.com.cn/s/blog_3fdab86f01019fkn.html",
"https://www.npmjs.com/package/grunt-css-sprite",
"http://www.99css.com/cssgaga/",
"http://www.wtoutiao.com/p/199oYd8.html",
"http://www.tuicool.com/articles/ENrM3aB",
"http://www.ibm.com/developerworks/cn/web/wa-mean1/",
"http://read.jd.com/8381/",
"https://tra38.gitbooks.io/essential-copying-and-pasting-from-stack-overflow/content/code_licensing.html",
"http://www.w3school.com.cn/",
"http://www.bayescafe.com/php/getting-started-with-phpunit.html",
"http://www.golaravel.com/",
"http://m.youku.com/video/id_XODUwNTU3NzI0.html?x=&from=y11.3-movie-grid-1095-9921.95882.3-1",
"http://www.doc88.com/p-1896812987112.html",
"http://url.pansoso.com/?a=url&k=cda6eeed&u=aHR0cDovL3Bhbi5iYWlkdS5jb20vd2FwL2xpbms@dWs9MTM3ODIxNDY1MiZzaGFyZWlkPTUyMDI3Njc5NCZ0aGlyZD0w&t=44CKUEhQIE1WQ!W8gOWPkeWunuaImOOAiy4o5p2O5byA5raMKS5bUERGXS5AY2tvb2sucGRmX!WFjei0uemrmOmAn!S4i!i9vXznmb7luqYgLi4u&s=cGhwK212Y!W8gOWPkeWunuaImCtwZGY=",
"http://www.jb51.net/article/63204.htm",
"http://unicode.org/",
"https://jiaoyi.yunfan.com/transaction/guide.html",
"http://www.fz49.com/thread-336-1-1.html",
"http://yuedu.baidu.com/ebook/ccfaf08bf121dd36a22d8217?fr=aladdin&key=%E5%BD%B1%E5%AD%90%E9%87%8C%E7%9A%84%E4%B8%AD%E5%9B%BD",
"http://imba.io/home#/install.imba",
"https://mp.weixin.qq.com/s?__biz=MzAxMTU0NTc4Nw==&mid=2661157110&idx=1&sn=17c74bd2ab65536354fb6feab196c1d8&scene=0&uin=MTIxMjkyMDkyMg%3D%3D&key=f5c31ae61525f82edd845e84f432766bfe085e76a609538b6b0a1ba1086f97176eaa04440717ae86327a3a7f0fe97f9b&devicetype=iMac+MacBookPro12%2C1+OSX+OSX+10.11.4+build(15E65)&version=11020201&lang=zh_CN&pass_ticket=nJimn7OCuW2HZ4AF0307AGjQ4QXtuDTKLNikYa51MhvD%2BcfMEW5%2FSaMgBPZrj8ZZ",
"https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651550790&idx=2&sn=d6335a3c91033a969effcc344d073e4f&scene=0&uin=MTIxMjkyMDkyMg%3D%3D&key=f5c31ae61525f82e3b1a099fd8cf9a8b70e3f2366789ed080662d501c01404bfe0faeb81f3c3d174e83d821ef52f10e1&devicetype=iMac+MacBookPro12%2C1+OSX+OSX+10.11.4+build(15E65)&version=11020201&lang=zh_CN&pass_ticket=nJimn7OCuW2HZ4AF0307AGjQ4QXtuDTKLNikYa51MhvD%2BcfMEW5%2FSaMgBPZrj8ZZ",
"https://mp.weixin.qq.com/s?__biz=MzAxMTEyOTQ5OQ==&mid=402170266&idx=1&sn=2c56c213f8c4ad53e3f00595cf64858a&key=f5c31ae61525f82ec0df1db443953e58426837101f87ffb6ff3ecf2aaf2289f1870478bcfacb233a993f2d0829390620&ascene=0&uin=MTIxMjkyMDkyMg%3D%3D&devicetype=iMac+MacBookPro12%2C1+OSX+OSX+10.11.4+build(15E65)&version=11020201&pass_ticket=nJimn7OCuW2HZ4AF0307AGjQ4QXtuDTKLNikYa51MhvD%2BcfMEW5%2FSaMgBPZrj8ZZ",
"http://tieba.baidu.com/f?kw=%B5%C2%B9%FA%D5%DC%D1%A7&fr=ala0&tpl=5",
"http://z.wilddog.com/web/quickstart",
"http://tech.meituan.com/",
"http://itjuzi.com/company",
"http://packages.ubuntu.com/precise/amd64/libappindicator3-1/filelist",
"http://mirrors.aliyun.com/",
"http://askubuntu.com/questions/456689/error-xdg-runtime-dir-not-set-in-the-environment-when-attempting-to-run-naut/467994#467994",
"http://blog.csdn.net/chenjh213/article/details/51541602",
"http://www.baidu.com/s?wd=openresty&s2bd=t&tn=84053098_dg&ie=utf-8",
"http://my.oschina.net/jtihj/blog/1932",
"http://www.wpdaxue.com/",
"http://www.linuxstory.org/",
"http://www.linuxstory.org/free-chinese-programming-books/",
"http://codeguide.bootcss.com/",
"http://cnodejs.org/topic/53293f1f84b838314200178f",
"https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders",
"http://little-bill.iteye.com/blog/919077",
"https://www.npmjs.com/package/fs.io",
"http://walkginkgo.com/ios/2016/05/04/Toutiao.html",
"https://github.com/WuLC/ThesaurusSpider/blob/master/BaiduTheaurusSpider/singleThreadDownload.py",
"https://www.yunpian.com/api2.0/howto.html",
"https://www.seebug.org/",
"https://github.com/liujianping/wechat/blob/master/app.go",
"http://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html",
"http://www.zhizhihu.com/html/y2011/3500.html",
"https://github.com/anvaka/VivaGraphJS",
"http://www.tuicool.com/articles/MNzM32e",
"https://github.com/ForbesLindesay/global-leak-hunter",
"http://www.yingshidaquan.cc/html/DQ18770.html",
"https://movie.douban.com/subject/26051523/",
"http://music.baidu.com/artist/177949?fm=altg_new3&autoplay=true",
"https://movie.douban.com/subject/3346365/",
"http://www.360doc.com/content/14/0908/23/179784_408032585.shtml",
"http://www.open-open.com/lib/view/open1412993492311.html",
"https://github.com/troolee/gridstack.js",
"https://github.com/desandro/draggabilly",
"http://m.youku.com/video/id_XNzM4NTIwMDk2.html?x=&from=y11.3-movie-grid-1095-9921.95832.6-1",
"http://www.mkzhan.com/48161/",
"http://www.probabilistic-robotics.org/",
"https://github.com/fatedier/frp",
"https://natapp.cn/tunnel/lists",
"https://safari-extensions.apple.com/",
"https://github.com/nodejs/node-addon-examples/tree/master/1_hello_world",
"https://github.com/foreverjs/nssocket",
"https://github.com/ibmjstart",
"http://www.open-open.com/news/view/1c3cd376",
"http://haoqiao.me/",
"http://docs.guzzlephp.org/en/latest/",
"http://www.cnblogs.com/skynet/p/4146083.html",
];


// most visit links 
var most_visited_array = [
"https://www.tmall.com/wh/tmall/fushi/act/nvzhuang",
"https://nanzhuang.tmall.com",
"http://www.tianya.cn",
"http://www.tuicool.com",
"http://codepen.io",
"http://jiankang.163.com",
"www.xueqiu.com",
"http://aosabook.org/en/index.html",
"http://www.opclass.com",
"http://haodoo.net",
"https://ocw.mit.edu/courses",
"https://dongxi.douban.com",
"http://www.appinn.com",
"http://jianggaowang.com",
"http://www.demohour.com",
"http://www.mop.com",
"https://coding.net/home.html",
"http://www.miaopai.com/miaopai/plaza",
"http://health.sina.com.cn",
];

// voice reply , the book of answer
var answer_array = 
["http://ww4.sinaimg.cn/large/006tKfTcgy1ff1m70h0jaj30ii0cigpn.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1m7hbh8jj30gs0dimyo.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1m7se17ij30c2080wh6.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1m8tf4oxj30ni0iqqjm.jpg",
"http://ww1.sinaimg.cn/large/006tNbRwgy1ffbmi6h51qj30ga0gear1.jpg",
"http://ww4.sinaimg.cn/large/006tNbRwgy1ffbmi3ulhkj30le0kc4gj.jpg",
"http://ww4.sinaimg.cn/large/006tNbRwgy1ffbmi1xhphj30ko0k0tx5.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1m9hqrbaj30qa0ms7wh.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1m9daao8j30tw0hunom.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1m98dzx6j30dk0cwtea.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1m976sbmj30bq0bwqb6.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1m95sbbwj30ia0f2tme.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1m94bpa0j30ag09u0wk.jpg",
"http://ww3.sinaimg.cn/large/006tNbRwgy1ffbmhf92mfj30je0kiwk5.jpg",
"http://ww3.sinaimg.cn/large/006tNbRwgy1ffbmherqypj30k40k0tew.jpg",
"http://ww3.sinaimg.cn/large/006tNbRwgy1ffbmhdbwppj30jc0jgdxz.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1maw8eu4j307q0c2gpw.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1mavspgdj30bo0detgk.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbmiqvqlxj30nc0mi4ol.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1mauf0omj30ha0msk59.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1mbio5umj30ca090ae1.jpg",
"http://ww4.sinaimg.cn/large/006tNbRwgy1ffbksw02roj30cm020q39.jpg",
"http://ww4.sinaimg.cn/large/006tNbRwgy1ffbksjsuq8j30ic02aaao.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbkscfa48j30k002iwf4.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1mbifokqj30b206qn0r.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1mbhmahdj30m60t6hch.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1mc6r9isj30b60a8420.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1mc5lxwij30cq0fq44u.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1mc4yw4aj30k80k0ao2.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1mcrkn52j30ke0gc7e3.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mcpp6e6j30c2080wh6.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mcpiyo0j30ga0bcn5g.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1md8qig5j30ee05cn11.jpg",
"http://ww3.sinaimg.cn/large/006tNbRwgy1ffbktipduxj30h8020q3g.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbktiuyyyj30ey02c74o.jpg",
"http://ww1.sinaimg.cn/large/006tNbRwgy1ffbktidv4nj30fi02waak.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1md76hyqj30bc0cmjxm.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1md5q8jgj30iw0ceqbf.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1mdlti7tj30ne07atd1.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1mdlfwctj30be05gdhm.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mdl5u9yj30gy07qn1b.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1meg4ecnj30bc0fcn2k.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mee9qaej30t80qonma.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1me69u20j30ti0mae6r.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff1meyluuyj30aq0am0xf.jpg",
"http://ww4.sinaimg.cn/large/006tNbRwgy1ffbktxhqmmj30k803y3z8.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbktxmt3kj30du026mxh.jpg",
"http://ww1.sinaimg.cn/large/006tNbRwgy1ffbktwyd4sj30kk03mgmi.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff1mexdpfuj30ek0cuwl2.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mevwf5rj314w0cwgt6.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff1mfd6uumj30is04mwin.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff1mfd15i9j30xa0agwlt.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbmgp6agmj30qa0owqkv.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbmgl44knj30g60es13p.jpg",
"http://ww4.sinaimg.cn/large/006tNbRwgy1ffbmgju7tej30ic0h6alu.jpg",
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
"http://ww4.sinaimg.cn/large/006tNbRwgy1ffbkuatq3cj30ic02iaaq.jpg",
"http://ww4.sinaimg.cn/large/006tNbRwgy1ffbkuamrwbj30kk03ygmd.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbkua7tc1j30km03sjsc.jpg",
"http://ww1.sinaimg.cn/large/006tNbRwgy1ffbkq0lke2j30as01wglt.jpg",
"http://ww1.sinaimg.cn/large/006tNbRwgy1ffbkq0yhoyj309y022jrl.jpg",
"http://ww4.sinaimg.cn/large/006tNbRwgy1ffbkq0nie6j30fi0260t7.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff62ut2tm0j30iu0h4q96.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff62untq8dj30h00g2wnc.jpg",
"http://ww4.sinaimg.cn/large/006tNbRwgy1ff9l7t6hfxj30gy01yt95.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff62u1o9g9j3086062myg.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff62vdhlwdj30ec0de0vl.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff62vbkuirj30ey0f4gpo.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbkuot9naj30hw02imxo.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbkuolsm4j30ic020q3l.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbkuoaffsj30ky042jsc.jpg",
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
"http://ww4.sinaimg.cn/large/006tNbRwgy1ffbkvhyrw4j30em01waae.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbmdnc9hkj30ls0iah31.jpg",
"http://ww1.sinaimg.cn/large/006tNbRwgy1ffbmdirir2j30em0i0thn.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbmdhntmnj30go0h0nc0.jpg",
"http://ww3.sinaimg.cn/large/006tNbRwgy1ffbkvi9zwuj30gs01ywf0.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbkvhmhqij30jq042t9f.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff631ybz8sj30gs0dggo9.jpg",
"http://ww3.sinaimg.cn/large/006tNbRwgy1ffbmg6tpy8j30lu0lk1hb.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbmg2mhi3j30kg0iyn9v.jpg",
"http://ww4.sinaimg.cn/large/006tNbRwgy1ffbmg0wxr5j30fy0esdtl.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff63322r3xj30ec096wgq.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff9l66z1sxj30e601wwev.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff9l66s5vqj30iw01s74u.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff9l66jq8pj309k01uwem.jpg",
"http://ww4.sinaimg.cn/large/006tNbRwgy1ff9l72uhabj30fg022jrq.jpg",
"http://ww1.sinaimg.cn/large/006tNbRwgy1ff9l72kh0cj30ie01y0tb.jpg",
"http://ww3.sinaimg.cn/large/006tNbRwgy1ff9l7278j2j30fq01wgm1.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff633133ldj30ea06cq4b.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff6330r7zlj30dw0j2ad8.jpg",
"http://ww4.sinaimg.cn/large/006tNbRwgy1ffbkvvaj8hj30jk03gjs3.jpg",
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
"http://ww2.sinaimg.cn/large/006tNbRwgy1ff9l8axznsj30gm024jru.jpg",
"http://ww1.sinaimg.cn/large/006tNbRwgy1ff9l8arr6oj30b4022t8x.jpg",
"http://ww4.sinaimg.cn/large/006tNbRwgy1ff9l8ahvz6j30g40243yx.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65mzl9cjj30c005w407.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65mz1p89j30e006ota4.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65nlu3pdj308i07egn9.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff65nlf6jyj309w046q47.jpg",
"http://ww3.sinaimg.cn/large/006tNbRwgy1ffbkqoy0khj30dw02amxj.jpg",
"http://ww1.sinaimg.cn/large/006tNbRwgy1ffbkqkvzbxj30fa022wey.jpg",
"http://ww1.sinaimg.cn/large/006tNbRwgy1ffbkqk2staj308a022dfx.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbkr5scfvj30bq01q74k.jpg",
"http://ww3.sinaimg.cn/large/006tNbRwgy1ffbkr5mmzcj30io020gm5.jpg",
"http://ww3.sinaimg.cn/large/006tNbRwgy1ffbkr5e2ldj30ck026q37.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff65nl7e4nj30ay06wdh5.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65qf8t2jj30cq08a768.jpg",
"http://ww1.sinaimg.cn/large/006tNbRwgy1ffbmfke876j30fo0eegy5.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbmfhpvmij30pq0kinl6.jpg",
"http://ww4.sinaimg.cn/large/006tNbRwgy1ffbmfe7bxfj30io0fm4f4.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff65qemhidj30es08ijum.jpg",
"http://ww3.sinaimg.cn/large/006tNbRwgy1ff9l7ste9xj30j202074x.jpg",
"http://ww1.sinaimg.cn/large/006tNbRwgy1ff9l7rxqk5j30hu0223z1.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff65qd3yp5j30ec07yq5r.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff65qr4bioj30go08kjwf.jpg",
"http://ww1.sinaimg.cn/large/006tNbRwgy1ffbkrumiw0j30bo02cweu.jpg",
"http://ww1.sinaimg.cn/large/006tNbRwgy1ffbkruhp08j30ju03omxw.jpg",
"http://ww1.sinaimg.cn/large/006tNbRwgy1ffbkru8eqij30ki04cjse.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff65qpsvl3j30c009iq4i.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65rmia1rj30cs0bk0wb.jpg",
"http://ww2.sinaimg.cn/large/006tKfTcgy1ff65rxi9m9j30ds0cw422.jpg",
"http://ww1.sinaimg.cn/large/006tKfTcgy1ff65rwlhrxj30gg07s78h.jpg",
"http://ww4.sinaimg.cn/large/006tKfTcgy1ff65rvmvjaj30hc0aa43f.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65sayaswj30fy05qjuk.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65sa2hgyj30iw08o7ah.jpg",
"http://ww3.sinaimg.cn/large/006tKfTcgy1ff65sa2hgyj30iw08o7ah.jpg",
"http://ww2.sinaimg.cn/large/006tNbRwgy1ffbmevobmpj30iy0iwk0x.jpg",
"http://ww4.sinaimg.cn/large/006tNbRwgy1ffbmetv82yj30k00jsgzc.jpg",
"http://ww3.sinaimg.cn/large/006tNbRwgy1ffbmeqz6ccj30p20lcgst.jpg",
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
  
  // special treats 
  /*
  var special_date = new Date(2017,5,14);
  var date = new Date();
  if(date.getDate() == special_date.getDate() ){
        res.reply([
        { 
          title:'祝啦啦生日快乐～～',  
          description:'愿你有一点好心情，正如这夜空一样宽广，如朝阳一般明朗～', 
          picurl: special_events[0],
          url : special_events[1]
        }]);
  }
  */
  // end of special events 

  // 不再使用 baidu ocr技术支持 
  /*
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
  */
  // end of baidu ocr

  // start of tencent youtu service



  // end of tencent youtu service



}).text(function(message, req, res, next) {
  // message为文本内容
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125035',
  // MsgType: 'text',
  // Content: 'http',
  // MsgId: '5837397576500011341' }


  // special treats 
  /*
  var special_date = new Date(2017,5,14);
  var date = new Date();
  if(date.getDate() == special_date.getDate() ){
        res.reply([
        { 
          title:'祝啦啦生日快乐～～',  
          description:'愿你有一点好心情，正如这夜空一样宽广，如朝阳一般明朗～', 
          picurl: special_events[0],
          url : special_events[1]
        }]);
  }
  */
  // end of special events 


  // store the keyword first 
  var akeyword = new keywords();
  akeyword.set('keyword', message.Content);
  akeyword.save();
  // end of save keywords .

  var keyArray = ['你好', '约吗','推送','七头牛'];
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
        // for epub ebook make 
        // convert link to ebook
        // first, get book links 
        // 加入epub生成推送功能 
        var query = new AV.Query('weblinks');
        query.include('link');
        var links = [];
        res.reply({
          type: "text",
          content: 'eBook pushed'
    	});
        query.find().then(function (books) {
		  	
		  	books.forEach(function(book) {
      			links.push(book.get('link'));
    		});

		  	// delete all then
		  	AV.Object.destroyAll(books).then(function () {
		     // 成功
		    }, function (error) {
		     // 异常处理
		    });

		    const ebook = new EpubPress({
			    title: 'ebook-today',
			    description: 'multi-articles',
			    urls: links
			});
			ebook.publish().then(() =>
				//ebook.download('epub')
			    ebook.email('workinoppo@163.com')
			).then(() => {
			    
			}).catch((error) => {
			    
			});

		}, function (error) {
			
		});

		
	    // end of ebook convert 
        // epub make end 
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
     /* 去掉多端搜索，改为学习强国
      var bookmark_bias = bookmarks_array.length-1;
      var bookmark_index = new Number(Math.random()*bookmark_bias).toFixed(0);  
      res.reply([
        {title:'Ecosia',  description:'Ecosia', picurl:'http://www.egouz.com/uploadfile/2017/0503/20170503101752862.jpg', url : 'https://www.ecosia.org/search?q='+content },
        {title:'SouGou',  description:'SouGou', picurl:'https://www.sogou.com/images/logo/new/search400x150.png', url : 'http://weixin.sogou.com/weixin?type=2&query='+content+'&ie=utf8&_sug_=n&sourceid=inttime_month' },
        {title:'qwant',  description:'qwant', picurl:'https://ws2.sinaimg.cn/large/006tNbRwgy1fwzsbst7g0j30lh0knjro.jpg', url : 'https://www.qwant.com/?q='+content },
        {title:'BiYing',  description:'BiYing', picurl:'http://cn.bing.com/sa/simg/sw_mg_l_4e_ly_cn.png', url : 'http://cn.bing.com/search?q='+content }
         ]);
      break;
      */
      var query = new AV.Query('XXQGDA');
      query.include('content');
      query.contains('content', content);
      var reply_text = '';
      var answer = '';
      query.find().then(function (answers) {
      	for (answer in answers)
      	{
      		reply_text+=answer.get('content');
    	}
    	res.reply({
		    type: "text",
		    content: reply_text
	 	});
      });
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

        // special treats 
        /*
        var special_date = new Date(2017,5,14);
        var date = new Date();
        if(date.getDate() == special_date.getDate() ){
              res.reply([
              { 
                title:'祝啦啦生日快乐～～',  
                description:'愿你有一点好心情，正如这夜空一样宽广，如朝阳一般明朗～', 
                picurl: special_events[0],
                url : special_events[1]
              }]);
        }
        */
        // end of special events 



        var bias = answer_array.length-1;
        var random_index = new Number(Math.random()*bias).toFixed(0); 

        var bias_link = most_visited_array.length-1;
        var random_index_link = new Number(Math.random()*bias_link).toFixed(0);


        res.reply([
        {	
        	title:'answer',  
        	description:'answer', 
        	picurl: answer_array[random_index],
        	url : most_visited_array[random_index_link]
        }]);
       
   

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

  	// get the root link , most visited, 
  	// for example,  http://www.baidu.com/s/27363728  ->> http://www.baidu.com
  	// 上述作为 品牌导航黄页生成方案 

  	// get the title and urls
  	var title = message.Title;
  	var link = message.Url;

  	var aweblink = new weblinks();
    aweblink.set('title', title);
    aweblink.set('link',link);
    aweblink.save();

    // reply for the first place 
    // otherwise serverside will do it again automatically
    res.reply({
        type: "text",
        content: 'eBook pushed'
    });

    // convert link to ebook
    const ebook = new EpubPress({
    title: title,
    description: '',
    urls: [
       	  	link
       	  ]
	});
	ebook.publish().then(() =>
		//ebook.download('epub')
	    ebook.email('workinoppo@163.com')
	).then(() => {
	    
	}).catch((error) => {
	    
	});

	// end of ebook convert 


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
