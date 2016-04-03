var mongoose = require('mongoose');

//mongoose schema for comment
var commentSchema = mongoose.Schema({
    comment: String,
    id: Number,
    target: Number
});


var File = mongoose.model("Comments", commentSchema);

module.exports = File;
