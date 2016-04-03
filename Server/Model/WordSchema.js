var mongoose = require('mongoose');

//mongoose schema for files
//mongoose schema for word filter
var filterSchema = mongoose.Schema({
    word_before: String,
    word_after: String
});


var File = mongoose.model("Words", filterSchema);

module.exports = File;
/**
 * Created by admin on 3/30/16.
 */
