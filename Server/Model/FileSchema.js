var mongoose = require('mongoose');

//mongoose schema for files
var fileSchema = mongoose.Schema({
    name: String,
    id: Number,
    revision: Number,
    author: String,
    Size: String,
    commit_history: Object,
    genre: Object,
    last_date: String,
    last_commit: String
});


var File = mongoose.model("Files", fileSchema);

module.exports = File;
