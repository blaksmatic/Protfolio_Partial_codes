var mongoose = require('mongoose');

var schema = {
	original     :  String,
	replace      :  String
};


var Words = mongoose.model("Words",schema);

module.exports = Words;
