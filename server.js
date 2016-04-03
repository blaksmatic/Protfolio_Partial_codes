/**
 * Created by admin on 3/16/16.
 */
//set up the server using express
var express = require('express');
app = express();

//require http and creat the server
var server = require('http').createServer(app);

//use socket to link the web
var io = require('socket.io')(server);

//use a built-in file reader
fs = require('fs');

//preparing paring the data
var parseString = require('xml2js').parseString;

//Preparing the log list and assignment list.
var log_list = [];


//preparing the mongoose
var mongoose = require('mongoose');

//serve the static directory
app.use(express.static(__dirname + '/public'));

//start mongo client
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var prepare = require('./Server/PrepareData.js');
var assignment_list = prepare.prepare_data();



// Connection URL
var url = 'mongodb://cs242portfolio:cs242@ds025409.mlab.com:25409/portfolio_zeng';
mongoose.connect(url);

//mongoose schema for comment
var commentSchema = mongoose.Schema({
    comment: String,
    id: Number,
    target: Number
});

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

//mongoose schema for word filter
var filterSchema = mongoose.Schema({
    word_before: String,
    word_after: String
});

//initialize schemas
var Comments = mongoose.model('Comments', commentSchema, "mongoose_storage");
var FileSystem = mongoose.model('FileSystem', fileSchema, "mongoose_storage_file");
var wordSchema = mongoose.model('wordSchema', filterSchema, "mongoose_storage_filter");

// Use connect method to connect to the Server
var database;
MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    database = db;
});

//create filters
var filter_words = [];
filter_words.push(new Filter({before: "fuck", after: "ck"}));
filter_words.push(new Filter({before: "bad", after: "good"}));
filter_words.push(new Filter({before: "love", after: "hate"}));

/**
 * This function read data from files and parse them into javascripts.
 * It is asyncronized, so we need to pass a function into another function.
 */
function prepare_data(callback) {

    fs.readFile('./Server/svn_log.xml', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        //parse into json
        parseString(data, function (error, data2) {
            log_list = data2;

            fs.readFile('./Server/svn_list.xml', 'utf8', function (err, data3) {
                if (err) {
                    return console.log(err);
                }
                parseString(data3, function (error, data2) {
                    assignment_list = process_assignment(data2, log_list);
                });
            });
        });
    });
}



/**
 * This function pre-processing the files and parse them into assignment_list
 * @param list_json the json file containning the list of SVN
 * @param log_json the json file containning the log of the SVN
 * @returns {{}} Return assignment_list
 */
function process_assignment(list_json, log_json) {

    var authur_name = "/yzeng19/";
    var output = {};
    //this is the dictionary that contains the words that I don't want in my list
    var dict = [".idea", ".tex", ".jar", "out/production", "1.2/html", "vendor/", ".git"];
    list_json = list_json.lists.list[0].entry;

    //loop1 get all the list variables
    loop1:
        for (var i = 0; i < list_json.length; i++) {
            var element = list_json[i];
            var name_to_check = element.name[0];
            loop2:
                for (var ind = 0; ind < dict.length; ind++) {
                    if (name_to_check.indexOf(dict[ind]) > -1)
                        continue loop1;
                }

            //the info package passing to make an object.
            var info = {
                kind: get_type(element.name[0]),
                name: element.name[0],
                genre: element.name[0].substring(0, 13),
                size: (element.$.kind == "file" ? element.size[0] : "undefined"),
                commit_revision: parseInt(element.commit[0].$.revision),
                commit_author: element.commit[0].author[0],
                commit_date: element.commit[0].date[0].split("T")[0],
                index: i
            };
            // console.log(element.name[0].substring(0, 13));

            var new_assignment = new File(info);
            output[i] = new File(info);
        }

    //console.log("ff");
    log_json = log_json.log.logentry;
    for (each_key in output) {

        //look for the log files that have the same name as this assignment
        var current_name = authur_name.concat(output[each_key].name).trim();

        for (var k = 0; k < log_json.length; k++) {

            //make another package and pack this log file
            element = log_json[k];
            info = {
                revision: element.$.revision,
                author: element.author[0],
                date: element.date[0].split("T")[0],
                msg: element.msg[0],
            };

            //give this log to assignment.
            temp_log = new Log(info);
            var path = element.paths[0].path;
            for (var num = 0; num < path.length; num++) {
                var temp_path = path[num]._.trim();
                //console.log(temp_path);
                if (temp_path.valueOf() == current_name.valueOf()) {
                    output[each_key].commit_history[info.revision] = temp_log;
                }
            }
        }
    }

    //console.dir(output);
    console.log(Object.keys(output).length);
    return output;
}

//prepare the data before the outside link has come in.


function get_type(file_name) {
    if (file_name.indexOf("java") > -1) {
        return "Java";
    }
    else if (file_name.indexOf("rb") > -1) {
        return "Ruby";
    }
    else if (file_name.indexOf("png") > -1 || file_name.indexOf("jpg") > -1) {
        return "Picture";
    }
    else if (file_name.indexOf("html") > -1 || file_name.indexOf("php") > -1) {
        return "Web";
    }
    else if (file_name.indexOf("js") > -1 || file_name.indexOf("css") > -1) {
        return "Web Style";
    }
    else {
        return "File";
    }
}
prepare_data();
//wait for the connection and connect the sources.
io.on("connection", function (socket) {

    console.log("Socket linked!");

    console.log("Start Parsing Data!");

    socket.emit("initial_data_send");

    //This is called when required to send all the data to the front end
    socket.on('refresh_data', function () {
        socket.emit('receive_refresh_list', assignment_list);
    });

    //This is called when checking whether the data is correctly transmitted
    socket.on('data_recevied_by_front', function (message) {
        console.log(message);
    });


    //This is called when updating the comments into the database.
    socket.on('update_comments', function (message) {
        assignment_list = message;
        for (var i = 0; i < assignment_list.length; i++) {
            var comm = assignment_list[i].comments;
            //use the mongoose databse and update my comments.
            for (var j = 0; j < comm.length; j++) {
                var new_comment = new Commments({
                    comment: comm[i].comment,
                    id: i,
                    target: comm[i].target
                });
                //save the comments
                new_comment.save(function (err) {
                    if (err) throw err;
                });
            }
        }
    });

    //This is called when required to store everything into database.
    socket.on('update_database', function (message) {
        assignment_list = message;
        for (var i = 0; i < assignment_list.length; i++) {
            var new_assignment = new FileSystem({
                name: assignment_list[i].name,
                id: assignment_list[i].id,
                revision: assignment_list[i].revision,
                author: assignment_list[i].author,
                Size: assignment_list[i].size,
                commit_history: assignment_list[i].commit_history,
                genre: assignment_list[i].genre,
                last_date: assignment_list[i].last_date,
                last_commit: assignment_list[i].name.last_commit

            });
            new_assignment.save(function (err) {
                if (err) throw err;
            });
        }
    });

    socket.on('load_everything', function () {
        var new_list = [];
        var query = database.find({}, function (err, data) {

        });
        console.log(query);

        socket.emit('everything_here', new_list);
    });

    //This is called when asked to pass the filters.
    socket.on('get_filter_word', function () {
        socket.emit('receive_filter_word', filter_words);
    });

    //Storing the data into the databse.
    for (element in filter_words) {
        element = filter_words[element];
        var new_filter = new wordSchema({
            before: element["before"],
            after: element["after"]
        });
        new_filter.save(function (err) {
            if (err) throw err;
        });
    }

    socket.on('getSVN', function (data) {
        console.log("get svn request");
        var path = "./public/data/assignments/" + data;
        console.log(path);
        var svndata = "not a file";
        var contents = fs.readFileSync(path, 'utf8');
        socket.emit("receive_svn_data",contents);
    });
});


//This is the log object.
function Log(info) {
    this.revision_number = info.revision;
    this.author = info.author;
    this.date = info.date;
    this.message = info.msg;
}

//This is the file object
function File(info) {
    this.name = info.name;
    this.kind = info.kind;
    this.genre = info.genre;
    this.size = info.size;
    this.last_revision = info.commit_revision;
    this.author = info.commit_author;
    this.last_date = info.commit_date;
    this.id = info.index;
    this.commit_history = {};
    this.comments = [];
}

//This is the filter obejct.
function Filter(info) {
    this.before = info.before;
    this.after = info.after;
}

server.listen(3000);
console.log("Server listen to 3000");