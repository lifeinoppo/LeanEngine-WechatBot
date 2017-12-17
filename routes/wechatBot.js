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
"https://www.npmjs.com/package/mini-template-engine",
"https://www.npmjs.com/package/levi",
"https://github.com/RealHacker/python-gems",
"http://www.jb51.net/article/82412.htm",
"http://www.jq22.com/jquery-info438",
"https://www.npmjs.com/package/yixin",
"https://signup.heroku.com/www-home-bottom",
"http://search.bilibili.com/all?keyword=%E6%8C%91%E6%88%98%E9%80%9A%E7%81%B5%E8%80%85",
"https://www.qcloud.com/document/product/271/2812",
"http://www.server110.com/docker/201411/11105.html",
"http://tool.lu/coderunner/",
"https://console.qingcloud.com/sh1a/volumes/",
"http://www.cnblogs.com/felixzh/p/5881058.html",
"https://docs.qingcloud.com/qingstor/sdk/js/index.html",
"https://docs.qingcloud.com/guide/storm.html",
"https://mrwasabi.taobao.com/",
"https://docs.wilddog.com/quickstart/sync/rest.html",
"https://segmentfault.com/q/1010000000516470",
"https://help.aliyun.com/document_detail/32147.html?spm=5176.doc31952.6.803.ubgPDn",
"http://www.shucunwang.com/RunCode/php/",
"https://github.com/octokit/octokit.rb",
"https://developer.github.com/libraries/",
"https://hubot.github.com/docs/",
"https://segmentfault.com/a/1190000007884916",
"https://dn-droiz.qbox.me/index.html",
"http://learning.sohu.com/20161111/n472968934.shtml",
"http://m.ximalaya.com/31781373/sound/34001141",
"http://item.mi.com/product/4086.html",
"http://m.ximalaya.com/31781373/album/7397645",
"http://m.ximalaya.com/77062670/album/7283068",
"https://item.taobao.com/item.htm?spm=a230r.1.14.47.cQnRCe&id=45444368215&ns=1&abbucket=8#detail",
"https://github.com/liwenzhu/bosonnlp",
"http://bosonnlp-py.readthedocs.io/#bosonnlp",
"http://m.bilibili.com/video/av1407318.html",
"https://zhuanlan.zhihu.com/p/25191863?utm_source=tuicool&utm_medium=referral",
"http://blog.sina.com.cn/s/blog_ab45a5c90102xn7t.html",
"https://www.infoq.com/articles/erlang-dsl",
"http://gzdaily.dayoo.com/html/2014-09/20/node_1.htm",
"http://m.youku.com/video/id_XNzc4NzE3MDQ0.html?x=&from=y11.3-movie-grid-1095-9921.95832.2-1",
"http://www.readfar.com/books/52fb660c3063e10ecd00002b",
"http://mp.weixin.qq.com/s?__biz=MzA3MDExMDUzMA==&mid=200734501&idx=1&sn=b3b33f24116c472cf7acc264cd1991a6#rd",
"http://v.youku.com/v_show/id_XNzg3MTMwODc2.html?",
"http://mp.weixin.qq.com/s?__biz=MjM5MzU2ODI4NQ==&mid=200090843&idx=1&sn=191f1ca6150923ee76523b6e9792ab04&3rd=MzA3MDU4NTYzMw==&scene=6#rd",
"http://mp.weixin.qq.com/s?__biz=MjM5MzU2ODI4NQ==&mid=200093201&idx=3&sn=49ec558c44e55caf75956b4cf915586c&3rd=MzA3MDU4NTYzMw==&scene=6#rd",
"http://weixin.sogou.com/wap",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401320_1003%2Cta%40iphone_2_2.3_1_9.9/baiduid=9589A3616295F0FA05529AB0B39B60B2/w=0_10_%E5%BE%AE%E4%BF%A1%E4%BF%A1%E6%81%AF%E6%8A%93%E5%8F%96/t=iphone/l=3/tc?m=8&srd=1&dict=20&src=http%3A%2F%2Fwww.cnblogs.com%2Ftxw1958%2Farchive%2F2013%2F01%2F24%2Fweixin-if1-enable.html",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401320_1003%2Cta%40iphone_2_2.3_1_9.9/baiduid=9589A3616295F0FA05529AB0B39B60B2/w=0_10_%E5%BE%AE%E4%BF%A1%E4%BF%A1%E6%81%AF%E6%8A%93%E5%8F%96/t=iphone/l=3/tc?ref=www_iphone&lid=9488152280504319999&order=6&vit=osres&tj=www_normal_6_0_10&m=8&srd=1&cltj=cloud_title&dict=20&sec=41608&di=41d5119d57f6bf36&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxXnANedT62v3IEQGG_ytK1DK6mlrte4viZQRAVifcAS0DS9Cb9n00sqdGdS8jRjgl8w53bfcmvjJ6jS08v0iprq",
"http://www.embeddedjs.com/",
"http://guoyong.me/",
"http://www.osforce.cn/?mu=20140314215554iAc2KI9vplTpTjJh1fP7iEjw",
"http://www.openhw.org/",
"http://m.html5youxi.com/",
"http://www.zhihu.com/question/25065665/answer/29989228?utm_campaign=weekly145&utm_source=weekly-digest&utm_medium=email",
"http://www.zhihu.com/question/25082178/answer/30037086?utm_campaign=weekly145&utm_source=weekly-digest&utm_medium=email",
"http://www.zhihu.com/question/20402148/answer/16893439?utm_campaign=weekly144&utm_source=weekly-digest&utm_medium=email",
"http://www.myopenglass.com/?page_id=3126",
"http://m.it2048.cn/#m/http://it2048.cn/",
"http://sourceforge.net/projects/firmata/files/pyduino/",
"http://www.prweb.com/releases/2014/09/prweb12172668.htm",
"http://www.eclipse.org/aspectj/doc/next/adk15notebook/ataspectj.html",
"http://www.hacker-china.com/maker/1934.html#jtss-cqq",
"http://www.ifanr.com/388835",
"http://bonsaiden.github.io/JavaScript-Garden/zh/",
"https://itunes.apple.com/cn/app/guo-zu-fu-ti/id912183360?l=en&mt=8",
"http://v.youku.com/v_show/id_XNzgxNTgyNzQ4.html",
"http://www.seeedstudio.com/wiki/Seeeduino_%E4%B8%BB%E6%8E%A7%E6%9D%BF",
"http://www.seeedstudio.com/blog/tag/seeeduino/",
"https://github.com/android?tab=repositories",
"https://github.com/android",
"http://doc.owncloud.org/server/7.0/developer_manual/contents.html",
"http://m.pps.tv/play_3EROXL.html",
"http://m.pptv.com/show/w7Jk4kqwIF7BP6c.html",
"http://m.pptv.com/show/BNafHYXrW5n8euI.html",
"http://www.1905.com/vod/play/695498.shtml?__hz=dc6a6489640ca02b&site_url=baiduapply#guessYouLike",
"http://m.letv.com/vplay_1517746.html",
"http://m.pps.tv/play_31UXIZ.html?frombaidu",
"http://m.pps.tv/play_32E0WZ.html",
"https://github.com/fffaraz/awesome-cpp",
"http://m.zhihu.com/question/25333595/answer/30458347",
"http://m.zhihu.com/question/25342705/answer/30480165",
"http://m.zhihu.com/question/20158619/answer/30466783",
"http://blog.csdn.net/grhunter/article/details/5830199",
"http://www.xuebuyuan.com/1762711.html",
"http://blog.ardublock.com/2014/08/28/beta-20140828-keelen-robots-dfrobot-bluno-more-duinoedu-blocks-string-operations-scoop-other-fun-stuffs-and-bug-fixes/",
"http://tw.taobao.com/item/40989136351.htm?fromSite=main&spm=0.0.0.0.SUQvp9%2C0.0.0.0.SUQvp9&qq-pf-to=pcqq.c2c%2Cpcqq.c2c&mt=%2C",
"http://learn.linksprite.com/pcduino/lvds-screen-for-pcduino/",
"http://rt2x00.serialmonkey.com/wiki/index.php/Main_Page",
"http://wiki.openwrt.org/toh/pcduino/pcduino3",
"http://jingyan.baidu.com/m/article/ea24bc39ae02e8da62b331f3.html",
"http://wap.ganji.com/sz/fang1/?ca_source=baidusem&ca_name=6451417351&ca_id=2374414938&ca_s=sem_baidu&ca_n=6451417351",
"http://m.qfang.com/shenzhen/rent?from=baidu&utm_source=baidu&utm_medium=cpc&utm_term=WAP-SZ-rent-10761552164-%E6%B7%B1%E5%9C%B3%E7%A7%9F%E6%88%BF",
"http://www.crystalradio.cn/thread-455335-1-1.html",
"http://www.arduino.cn/thread-2436-1-1.html",
"http://learn.linksprite.com/pcduino/quick-start/how-to-check-if-pcduino-booted-from-sd-or-nand-flash-ubuntu/",
"http://www.gaclib.net/",
"http://m.zhihu.com/question/24313259",
"http://www.geekpark.net/topics/155654",
"http://m.baidu.com/tc?appui=alaxs&gid=3156071703&srd=1&src=http%3A%2F%2Fwww.qdmm.com%2FBookReader%2F1678773.aspx&ssid=0&from=2001a&uid=0&pu=usm@3,sz@1320_1003,ta@iphone_2_2.3_1_9.9&bd_page_type=1&baiduid=C227EBE93070D369BEC44F7D691F4172&tj=wise_novel_book_2_0_10_l1",
"http://zhidao.baidu.com/question/38060888.html?fr=ala&word=%E3%80%8A%E9%9B%AA%E5%9B%BD%E3%80%8B",
"http://www.offercome.com/",
"http://m.baidu.com/tc?appui=alaxs&gid=3254003299&srd=1&src=http%3A%2F%2Fwww.tadu.com%2Fbook%2F397095%2Ftoc%2F&ssid=0&from=2001a&uid=0&pu=usm@0,sz@1320_1003,ta@iphone_2_2.3_1_9.9&bd_page_type=1&baiduid=C227EBE93070D369BEC44F7D691F4172&tj=wise_novel_book_2_0_10_l1",
"http://kdweibo.com/home?utm_source=36kr&utm_medium=keyword",
"https://basecamp.com/",
"http://v.qq.com/detail/1/1tazhodkm2vds7m.html?ptag=baiduapp.tv",
"http://m.zhihu.com/",
"http://www.amazon.cn/gp/feature.html?ref_=tsm_1_si_s_kndl_nbbctr&ie=UTF8&docId=1505978",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401320_1003%2Cta%40iphone_2_2.3_1_9.9/baiduid=C227EBE93070D369BEC44F7D691F4172/w=0_10_cm%E8%AF%95%E7%8E%A9++%E5%AE%89%E5%8D%93/t=iphone/l=3/tc?ref=www_iphone&lid=8487251491103519690&order=1&vit=osres&tj=www_normal_1_0_10&m=8&srd=1&cltj=cloud_title&dict=20&sec=41330&di=4256a0c0a6829dcd&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxXnANedT62v3IJxiZRy2R2nSamkuia0rgHtkfEFX6NWyJZpPPsme_h1AYwk0bPCNmzBAxrqxpt7keznuPc4TwgBOHEtVJut9s",
"http://bbs.dospy.com/thread-16333336-1-412-1.html",
"http://www.592zn.com/thread-132535-1-1.html",
"http://bbs.gfan.com/android-6546208-1-1.html",
"http://v.youku.com/v_show/id_XNzIxNjMyMDQ0.html?x",
"http://v.youku.com/v_show/id_XNzYyMjMyNDEy.html?x&from=y11.3-travel-0703-79-10091.88938.1-4",
"http://v.youku.com/v_show/id_XNzcyMDQ4NDQ0.html?f=22626538&from=y11.3-finance-test-1041-10062.89140.3-4&x",
"http://v.youku.com/v_show/id_XNzYyNzYxOTY0.html?f=22807128&x",
"http://v.youku.com/v_show/id_XNzU3MzM2NTEy.html?x",
"http://v.youku.com/v_show/id_XNzUyMzA4MTE2.html?x",
"http://m.baidu.com/from=2001a/s?word=%E5%B8%9D%E5%9B%BD%E7%9A%84%E6%AF%81%E7%81%AD&ts=8283435&t_kt=0&sa=is_2&ss=11&rq=%E5%B8%9D%E5%9B%BD%E7%9A%84",
"http://m.zongheng.com/h5/book?bookid=219899&fr=aladin_freexx&v=1410150463659&k=a605e3",
"http://www.pcduino.com/wiki/index.php?title=Book#Tutorial_Videos",
"http://v.youku.com/v_show/id_XNjQzMzc3OTIw.html?x",
"http://v.youku.com/v_show/id_XNjQzMzQ2NTIw.html",
"http://v.youku.com/v_show/id_XNjQzNDYxODA0.html?x",
"http://v.youku.com/v_show/id_XNzM0MTIwNjIw.html?x",
"http://www.wumii.com/auto_app/home",
"http://www.arduino.cn/forum.php?mod=viewthread&tid=6947&fromuid=3",
"http://www.arduino.cn/forum.php?mod=viewthread&tid=6759&fromuid=3",
"http://developer.android.com/guide/components/processes-and-threads.html",
"https://www.kickstarter.com/projects/hippo-devices/hippo-adk-create-your-dream-gadget-with-a-smart-de",
"http://h5.m.taobao.com/awp/core/detail.htm?spm=a1z2k.6997417.0.0.5h9D4l&scm=12306.1.0.0&id=20034528836",
"http://v.youku.com/v_show/id_XNzM4OTE1ODgw.html?f=22523665&x",
"http://v.youku.com/v_show/id_XNzM4OTY2MDI0.html?f=22523665&x&from=y11.3-tech-index3-232-10183.89983.2-1",
"http://pan.baidu.com/share/link?shareid=3978013171&uk=51636053",
"http://www.makerspaces.cn/11/",
"http://unity3d.com/unite/archive/2014#rd",
"http://mp.weixin.qq.com/s?__biz=MzA3OTE3NzgzOA==&mid=200431388&idx=2&sn=b5803314738b91a52af40f1736182248&scene=2&from=timeline&isappinstalled=0#rd",
"http://bijiji.net/",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401320_1003%2Cta%40iphone_2_2.3_1_9.9/baiduid=69FC9502FE6E6F88FE079D1678C2087E/w=0_10_webapp/t=iphone/l=3/tc?m=8&srd=1&dict=20&src=http%3A%2F%2Fwww.open-open.com%2Fnews%2Fview%2F11db4b4",
"https://github.com/telerik/kendo-ui-core",
"http://mp.weixin.qq.com/s?__biz=MjM5NjAyMzcyMA==&mid=204212439&idx=2&sn=6c2e8f09f7b18ef272329ac47d87d422#rd",
"http://m.yinyuetai.com/video/2118318?from=timeline&isappinstalled=0",
"http://azure.microsoft.com/blog/2012/07/03/using-windows-azure-with-the-command-line-tools-for-mac-and-linux/",
"http://blog.sina.cn/dpool/blog/s/blog_59179f440100008a.html?",
"http://book.chaoxing.com/ebook/read_810442731fad12dae89aecd0fb3271fee932e1e4c.html",
"http://www.readfar.com/books/5269a8973063e1e41b0000b9",
"http://www.laifeng.com/room/148?ev=1&from=y11.3-idx-grid-1519-9909.86807.1-1",
"http://m.pps.tv/play_32C8DZ.html?frombaidu",
"http://mp.weixin.qq.com/s?__biz=MzA5NDExMjUwOA==&mid=200662299&idx=1&sn=b33d20ad3a5874602381399dfeba22d3#rd",
"http://bbs.coloros.com/forum.php?mod=viewthread&tid=64316&extra=page%3D1&ordertype=1&threads=thread",
"http://www.e-onsoftware.com/",
"http://www.360doc.cn/article/551980_241719553.html",
"http://zweb.clanmark.com/?p=182",
"http://www.cncalc.org/",
"http://www.cncalc.org/thread-9980-1-1.html",
"http://m.blog.csdn.net/blog/shengxiaokui/8591605",
"http://stackoverflow.com/search?q=cannot+find+config.h++nodejs",
"http://m.shangxueba.com/jingyan/1808050.html",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401320_1001%2Cta%40iphone_2_2.3_3_537/baiduid=69FC9502FE6E6F88FE079D1678C2087E/w=0_10_linux++ls%E6%8C%87%E4%BB%A4%E6%BA%90%E4%BB%A3%E7%A0%81/t=iphone/l=3/tc?ref=www_iphone&lid=9232929200290408423&order=10&vit=osres&tj=www_normal_10_0_10&m=8&srd=1&cltj=cloud_title&dict=20&sec=40615&di=80961c89e68022cf&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxXnANedT62v3IEQGG_ytK1DK6mlrte4viZQRAYSfpAifGSoCb9m3QgcVMhiGu0VAo7RF_u_9Ssmoq7Ufddunq6ROAHhAMfAFq1sL4V_",
"http://ipv6.sjtu.edu.cn/news/041231.php",
"http://m.blog.csdn.net/blog/haiyan2012/8540802",
"http://biyeah.iteye.com/blog/1299524",
"http://m.blog.csdn.net/blog/wyqlxy/6439071",
"http://www.crifan.com/node_js_after_npm_install_some_module_but_run_error_can_not_find_module/",
"https://www.kickstarter.com/projects/324283889/potato-salad/?ref=kicktraq",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401320_1001%2Cta%40iphone_2_2.3_3_537/baiduid=69FC9502FE6E6F88FE079D1678C2087E/w=0_10_nodejs%E5%90%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E6%8F%90%E4%BA%A4%E6%95%B0%E6%8D%AE/t=iphone/l=3/tc?ref=www_iphone&lid=8797697074410521217&order=2&vit=osres&tj=www_normal_2_0_10&m=8&srd=1&cltj=cloud_title&dict=30&sec=40420&di=b7b831bc9496c279&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxXnANedT62v3IEQGG_ytK1DK6mlrte4viZQRAVjf7LnyRZpPPxXCBeMZHdWGdWWQm7B2Orxppsn9hbXvggPq3gBGBGRQOfRsw4tv3",
"http://192.168.43.133:1337/?inhdddex",
"http://m.csdn.net/article/2014-07-18/2820705-Hippo-ADK?",
"https://github.com/node-modules/ndir/blob/master/lib/ndir.js",
"http://bbs.tianya.cn/m/post-1095-47627-1.shtml",
"http://zm6.sm.cn/?src=http%3A%2F%2Fwww.csdn.net%2Farticle%2F2013-02-28%2F2814290-Hackers-Conference&uid=ce29a7f50e0f5b2ee01d6d0d301a04b1&hid=8b671cd2e6914952b96fa8e515b2f44c&pos=3&cid=9&pi=480x800&di=&time=1406631835381&from=click&restype=1&pagetype=0300000000000402",
"http://www.yeeyan.org/",
"http://zm6.sm.cn/?src=http%3A%2F%2Fdy.163.com%2Farticle%2FT1378282180974%2F9TAUITH600964KCK.html&uid=ce29a7f50e0f5b2ee01d6d0d301a04b1&hid=0ae4384f58343a48af805ba76573f56a&pos=6&cid=9&pi=480x800&di=&time=1406623490262&from=click&restype=1&pagetype=0000000000000402",
"http://www.niubowang.com/",
"http://m.douban.com/book/subject/24743317/?session=29ddda2a",
"https://github.com/users/lifeinoppo/emails/9494001/confirm_verification/44622e6fc5b7be85a0624db888c1e5c6fc18f97e",
"http://www.readfar.com/books/522ffbee3063e17eb6000011",
"http://www.cnbeta.com/articles/157133.htm",
"http://www.linuxidc.com/Linux/2013-12/93430p2.htm",
"http://i.youku.com/u/UMzE0MDYyNDU2/playlists",
"http://bbs.drvsky.com/read.php?tid=9212",
"http://h5.m.taobao.com/awp/core/detail.htm?id=39312004105&sid=50d485f5b3a18e80306653a35e5ffdd7&abtest=9&rn=9c7d67cf4c5abc101f8985b0daf0b807",
"http://www.digitalwpc.com/Community/Pages/Home.aspx",
"http://www.duokan.com/r/%E7%95%85%E9%94%80%E6%A6%9C#rd",
"http://www.wasu.cn/wap/Play/show/id/3771985?refer=video.baidu.com",
"http://www.wasu.cn/wap/Play/show/id/3879021?refer=video.baidu.com",
"http://m.sp.sm.cn/s?q=%E5%85%B3%E4%BA%8E%E6%88%91%E5%A6%BB%E5%AD%90%E7%9A%84%E4%B8%80%E5%88%87&uc_param_str=dnntnwvesspipffrgibijbpreisibt&from=ucpp&qd=sframe",
"http://m.v.qq.com/page/s/c/5/s0011f4ubc5.html?ptag=v_qq_com%23v.play.adaptor%233",
"http://m.v.qq.com/page/k/g/j/k00117ccfgj.html?ptag=v_qq_com%23v.play.adaptor%233",
"http://m.v.qq.com/page/v/r/c/v0011nsudrc.html?ptag=v_qq_com%23v.play.adaptor%233",
"http://m.v.qq.com/page/u/w/s/u00117cysws.html?ptag=v_qq_com%23v.play.adaptor%233",
"http://m.v.qq.com/page/p/r/0/p001189t9r0.html?ptag=v_qq_com%23v.play.adaptor%233",
"http://m.v.qq.com/page/f/s/6/f0011bbpls6.html?ptag=v_qq_com%23v.play.adaptor%233",
"http://m.v.qq.com/page/l/j/i/l0011gomjji.html?ptag=v_qq_com%23v.play.adaptor%233",
"http://m.v.qq.com/page/i/p/l/i0011t74jpl.html?ptag=v_qq_com%23v.play.adaptor%233",
"http://v.youku.com/v_show/id_XNjYxNjgzMzE2.html?x",
"http://www.iqiyi.com/business/ckxq.html?src=focustext_24_20130410_6",
"http://bbs.chaihuo.org/forum.php",
"http://swift.sh/",
"http://weekly.manong.io/issues/33?ref=swift",
"http://learn.linksprite.com/pcduino/showcase/pcduino-enclosure-assembly-instructions/",
"https://play.google.com/store/apps/details?id=com.amazon.mShop.android&feature=md",
"http://store.linksprite.com/sata-cable-with-power-connector-for-pcduio3/",
"https://github.com/jxd001/Swift-ZhihuDaily?files=1",
"http://www.readfar.com/books/51d1285282be9c832e000017",
"http://lib.nju.edu.cn/html/index.html",
"http://v.youku.com/v_show/id_XNTU0MzA1OTI=.html?x",
"http://v.youku.com/v_show/id_XNTU0MzAxMjQ=.html?x",
"http://v.youku.com/v_show/id_XNTgyMTQ0NTY=.html?x",
"http://www.kindlemi.com/wp-login.php",
"http://www.howzhi.com/course/learnppt/",
"http://pan.baidu.com/share/link?shareid=4129182848&uk=4177729548",
"http://read.zwskw.com/modules/article/articleinfo.php?id=127293",
"http://www.openjumper.com/",
"http://refspecs.linuxbase.org/LSB_4.1.0/LSB-Core-generic/LSB-Core-generic.html",
"http://www.chinahadoop.cn/",
"http://wap.cnki.net/huiyi-JHSJ200707001087.html",
"http://download.csdn.net/detail/raymondshin/1196276",
"http://wap.cnki.net/qikan-JYRJ200505035.html",
"http://m.doc88.com/p-93441546486.html",
"http://www.360doc.cn/article/13256259_303744243.html",
"https://www.temboo.com/arduino/others/overview",
"http://www.360doc.cn/article/9518537_203305090.html",
"http://www.robopeak.com/",
"http://www.openairinterface.org/",
"http://gnuradio.microembedded.com/chinese/openbts",
"http://wk.baidu.com/view/d77ea983ec3a87c24028c47f?pcf=2#page/1/1394284730989",
"http://m.baidu.com/bd_page_type=1/pu=usm%400%2Csz%401321%5F1003%2Cta%40utouch%5F2%5F2%2E3%5F1%5F9%2E4/uid=0/t=wap/w=0_10_quagga/ssid=0/from=2001a/l=0/baiduid=9188CA5243C1728404978487596EFFB3/tc?pn=15&m=0&baiduid=9188CA5243C1728404978487596EFFB3&src=www%2Ecnki%2Ecom%2Ecn%2FArticle%2FCJFDTOTAL%2DHDZJ201007016%2Ehtm",
"http://m.baidu.com/bd_page_type=1/pu=usm%400%2Csz%401321%5F1003%2Cta%40utouch%5F2%5F2%2E3%5F1%5F9%2E4/uid=0/t=wap/w=0_10_quagga/ssid=0/from=2001a/l=0/baiduid=9188CA5243C1728404978487596EFFB3/tc?pn=15&m=0&baiduid=9188CA5243C1728404978487596EFFB3&src=www%2Ecnki%2Ecom%2Ecn%2FArticle%2FCJFDTOTAL%2DJYRJ200609041%2Ehtm",
"http://jianshu.io/",
"http://markdown.tw/",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401320_1003%2Cta%40iphone_2_2.3_1_9.6/baiduid=9188CA5243C1728404978487596EFFB3/w=0_10_%E5%A4%A7%E5%AE%B6%E6%8A%95/t=iphone/l=3/tc?ref=www_iphone&lid=11412098295583031911&order=1&vit=osres&tj=www_normal_1_0_10&m=8&srd=1&cltj=cloud_title&dict=21&sec=36866&di=ab061bb45cbc22c9&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxXnANedT62v3IEQGG_ypZ_D3viU_ixP4lZQRA",
"http://mooc.guokr.com/",
"http://linux-hotplug.sourceforge.net/",
"http://m.baidu.com/bd_page_type=1/pu=usm%400%2Csz%401321%5F1003%2Cta%40utouch%5F2%5F2%2E3%5F1%5F9%2E4/uid=0/t=wap/w=0_10_hiwifi+%E5%BC%80%E6%BA%90%E4%B8%AD%E5%9B%BD/ssid=0/from=2001a/l=0/baiduid=881391D32BFD3DB33CFE9B41FFD81A9B/tc?pn=15&m=0&baiduid=881391D32BFD3DB33CFE9B41FFD81A9B&src=www%2Eoschina%2Enet%2Fp%2Fopenwrt",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401321_1003%2Cta%40utouch_2_2.3_1_9.4/baiduid=881391D32BFD3DB33CFE9B41FFD81A9B/w=0_10_hiwifi+%E5%BC%80%E6%BA%90%E4%B8%AD%E5%9B%BD/t=wap/l=0/tc?ref=www_utouch&lid=6568411757586277740&order=1&vit=osres&tj=www_normal_1_0_10&dict=-1&sec=35816&di=89808b0709bafda9&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxXnANedT62v3IEQGG_y2H1T_8o5zthPXrZQRAUnKhVn3PFEzvvSPQptxMbS88PiR2mNAYhvc8dye",
"http://site.douban.com/spaceart/",
"http://data.book.hexun.com/book-18096.shtml",
"http://www.tsjie.cn/forum.php?mod=forumdisplay&fid=54&mobile=yes",
"http://tech2ipo.com/",
"http://www.oschina.net/p/glassfish/",
"http://www.oschina.net/p/pdfkit",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401321_1003%2Cta%40utouch_2_2.3_1_9.4/baiduid=F83BD10ABD6DB5331F5A19BD4C907DFF/w=0_10_Yaf/t=wap/l=0/tc?ref=www_utouch&lid=8865107101017876513&order=2&vit=osres&tj=www_normal_2_0_10&dict=-1&sec=36269&di=ef12f7a6daafaf8c&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxXnANedT62v3IEQGG_y2H1T_8o5zthPXrZQRAUnKhVmeOE9jkxWS",
"http://17startup.com/startup/view/1590",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401321_1003%2Cta%40utouch_2_2.3_1_9.4/baiduid=F83BD10ABD6DB5331F5A19BD4C907DFF/w=0_10_thinking+in+c%3Afoundations+for+java+and+c/t=wap/l=0/tc?ref=www_utouch&lid=6290948559439355849&order=1&vit=osres&tj=www_normal_1_0_10&dict=-1&sec=36269&di=11bd62f9aa304974&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxXnANedT62v3IIhmGKyJL1zr5nlqzhLrlJMIfEFXrL7yMH5bswCPQpsVYcSDgPi6-mgV2mq-pqmwd9nW",
"http://www.oschina.net/p/soundtouch",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401321_1003%2Cta%40utouch_2_2.3_1_9.4/baiduid=F83BD10ABD6DB5331F5A19BD4C907DFF/w=10_10_js%E6%80%8E%E4%B9%88%E6%8E%A7%E5%88%B6%E9%9F%B3%E9%87%8F/t=wap/l=3/tc?ref=www_utouch&lid=9321169796905277393&order=4&vit=osres&tj=www_normal_4_10_10&m=8&dict=21&sec=35965&di=2d7a2cc265401611&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxXnANedT62v3IEQGG_ytK1DK6mlrte4viZQRAWCDfKXWVZpPPxXCBeMZHdWGdWWQm7BBOrxppsX9hbXvlgPq3gR7BGxwLexsw4tv3",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401321_1003%2Cta%40utouch_2_2.3_1_9.4/baiduid=F83BD10ABD6DB5331F5A19BD4C907DFF/w=0_10_XORP/t=wap/l=0/tc?ref=www_utouch&lid=6092255160749530822&order=2&vit=osres&tj=www_normal_2_0_10&dict=-1&sec=36254&di=ac466ef4860b510d&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxXnANedT62v3IEQGG_zZLACb5olu5va02",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401321_1003%2Cta%40utouch_2_2.3_1_9.4/baiduid=F83BD10ABD6DB5331F5A19BD4C907DFF/w=0_10_splay+tree/t=wap/l=3/tc?ref=www_utouch&lid=7175290194211083473&order=1&vit=osres&tj=www_normal_1_0_10&m=8&dict=21&sec=36255&di=7a5555d30fa99aef&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxXnANedT62v3IEQGG_yBL1TWd95qtva02GNheZye6QH3GZpPP68_Cg2W",
"http://www.cnblogs.com/vamei/archive/2013/03/24/2976545.html",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401321_1003%2Cta%40utouch_2_2.3_1_9.4/baiduid=F83BD10ABD6DB5331F5A19BD4C907DFF/w=0_10_BEEP+protocol/t=wap/l=0/tc?ref=www_utouch&lid=6684269608546616721&order=6&vit=osres&tj=www_normal_6_0_10&dict=-1&sec=36266&di=e28e9e831774056e&bdenc=1&nsrc=3-CULQEptyoA_yixCFOxXnANedT62v3IEQGG_yVW08SxokDyqRLbJMBfXjzfNWmFHFPytyPQpsxPtXLRNzlqzBAxdL1jgi6wk7jb9bydwNG4CBZbtds50caAUDYpzK",
"http://m.geekpark.net/read/view/187885",
"http://www.oschina.net/p/kalendae/",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401321_1003%2Cta%40utouch_2_2.3_1_9.4/baiduid=F83BD10ABD6DB5331F5A19BD4C907DFF/w=0_10_Scrum/t=wap/l=3/tc?ref=www_utouch&lid=9584170392536317185&order=5&vit=osres&tj=www_normal_5_0_10&m=8&dict=20&sec=36267&di=e6b6fd2a7813534c&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxXnANedT62v3IJBaOMmBXATq5953ybrWxBdtfUT0zKXXTUS4stnKHgcFYtXLROzFii1kXbbdmpWwf8njecPy",
"http://www.linuxsir.org/bbs/thread275780.html",
"http://m.baidu.com/bd_page_type=1/pu=usm%400%2Csz%401321%5F1003%2Cta%40utouch%5F2%5F2%2E3%5F1%5F9%2E4/uid=0/t=wap/w=0_10_sqlite+%E6%BA%90%E7%A0%81/ssid=0/from=2001a/l=3/baiduid=F83BD10ABD6DB5331F5A19BD4C907DFF/tc?pn=15&anchor=bc2337494&m=8&baiduid=F83BD10ABD6DB5331F5A19BD4C907DFF&sec=36267&di=9dae5f9d153456fd&src=deepfuture%2Eiteye%2Ecom%2Fblog%2F605210%23bc2337494",
"http://blog.csdn.net/htttw/article/details/7521053",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401321_1003%2Cta%40utouch_2_2.3_1_9.4/baiduid=F83BD10ABD6DB5331F5A19BD4C907DFF/w=0_10_libpcap/t=wap/l=3/tc?ref=www_utouch&lid=9476368109302628007&order=3&vit=osres&tj=www_normal_3_0_10&m=8&dict=20&sec=36267&di=ab11115e824dce16&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxXnANedT62v3IGhuPQDYK1T_8o5yihPn8XdhfVnKhVmuTIE8xu7H0sqdTdS4yQThzmwV2mq-os7sq7Ufddunq6RO4CBZbhg2hPgSZFj1k-OHy",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401321_1003%2Cta%40utouch_2_2.3_1_9.4/baiduid=881391D32BFD3DB33CFE9B41FFD81A9B/w=10_10_uuid%2Fuuid.h%E4%B8%8D%E5%AD%98%E5%9C%A8/t=wap/l=0/tc?ref=www_utouch&lid=6189080675430072730&order=1&vit=osres&tj=www_normal_1_10_10&dict=-1&sec=35864&di=d80110000f9fa3f9&bdenc=1&nsrc=36bH0QEptyoA_yixCFOxXnANedT62v3IEQGG_ytK1DK6mlrte4viZQRAWTb6NzLFVJWbcD4QqQoDliPqKzF6ldACu_9SsGcd8XnceaSwrcm",
"http://www.ecos.sourceware.org/",
"http://www.oschina.net/p/ecos/",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401321_1003%2Cta%40utouch_2_2.3_1_9.4/baiduid=F83BD10ABD6DB5331F5A19BD4C907DFF/w=20_10_html5%E6%80%8E%E4%B9%88%E8%BF%9B%E8%A1%8Ctcp%E7%9B%91%E5%90%AC/t=wap/l=3/tc?ref=www_utouch&lid=8042287317183120602&order=1&vit=osres&tj=www_normal_1_20_10&m=8&dict=21&sec=35891&di=0338def03be01f4a&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxXnANedT62v3IEQGG_ytK1DK6mlrte4viZQRAVTL7Am_PZpPPxXCBeMZHdWGdWWQm7BFOrxposH9hbXvagPq3ghyHHxwOfxsw4tv3",
"http://m.baidu.com/from=2001a/bd_page_type=1/ssid=0/uid=0/pu=usm%400%2Csz%401321_1003%2Cta%40utouch_2_2.3_1_9.4/baiduid=F83BD10ABD6DB5331F5A19BD4C907DFF/w=0_10_socket.io%E4%B8%8B%E8%BD%BD/t=wap/l=0/tc?ref=www_utouch&lid=6375177579637618841&order=2&vit=osres&tj=www_normal_2_0_10&dict=-1&sec=35897&di=5b7befcf6221bc87&bdenc=1&nsrc=IlPT2AEptyoA_yixCFOxXnANedT62v3IFRmSLilELD367JuV",
"http://m.baidu.com/bd_page_type=1/pu=usm%400%2Csz%401321%5F1003%2Cta%40utouch%5F2%5F2%2E3%5F1%5F9%2E4/uid=0/t=wap/w=0_10_socket%2Eio/ssid=0/from=2001a/l=3/baiduid=F83BD10ABD6DB5331F5A19BD4C907DFF/tc?pn=15&m=8&baiduid=F83BD10ABD6DB5331F5A19BD4C907DFF&sec=35897&di=88b9ec9697d59791&src=www%2Edevthought%2Ecom%2F2012%2F07%2F07%2Fthe%2Drealtime%2Dengine%2F"
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
        var query = new AV.Query('weblinks');
        query.include('link');
        var links = [];
        query.find().then(function (results) {
		  for(var i=0;i<results.length;i++){
		  	links.push(results[i].link);
		  }
		}, function (error) {
		});

	    const ebook = new EpubPress({
		    title: 'ebook today',
		    description: 'multi-articles',
		    urls: links
		});
		ebook.publish().then(() =>
			//ebook.download('epub')
		    ebook.email('workinoppo@163.com')
		).then(() => {
		    res.reply({
	          type: "text",
	          content: 'eBook pushed'
	    	});
		}).catch((error) => {
		    
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
      var bookmark_bias = bookmarks_array.length-1;
      var bookmark_index = new Number(Math.random()*bookmark_bias).toFixed(0);  
      res.reply([
        {title:'Bilibili',  description:'Bilibili', picurl:'http://i1.hdslb.com/promote/d088cfcb7689f8c5d23cb88caca0c73b.jpg', url : 'http://search.bilibili.com/all?keyword='+content },
        {title:'SouGou',  description:'SouGou', picurl:'https://www.sogou.com/images/logo/new/search400x150.png', url : 'http://weixin.sogou.com/weixin?type=2&query='+content+'&ie=utf8&_sug_=n&sourceid=inttime_month' },
        {title:'Random',  description:'random', picurl:'https://assets-cdn.github.com/images/modules/about/about-header.jpg', url :  bookmarks_array[bookmark_index] },
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

  	// get the title and urls
  	var title = message.Title;
  	var link = message.Url;

  	var aweblink = new weblinks();
    aweblink.set('title', title);
    aweblink.set('link',link);
    aweblink.save();

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
	    res.reply({
          type: "text",
          content: 'eBook pushed'
    	});
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
