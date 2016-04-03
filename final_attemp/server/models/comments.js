var mongoose = require('mongoose');

var schema = {
	name     :  String,
	reply    :  String,
	content :  String,
	project  :  String
};


var Comments = mongoose.model("Comments",schema);

module.exports = Comments;
