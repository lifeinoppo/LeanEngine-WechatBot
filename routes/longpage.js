var router = require('express').Router();

router.use('/', function(req,res,next){
	res.send("long page received...")
});



module.exports = router;