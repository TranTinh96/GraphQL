var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.send({
      name : " Tran Tinh"
    })
});

module.exports = router;
