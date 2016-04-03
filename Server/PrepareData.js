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


/**
 * This function read data from files and parse them into javascripts.
 * It is asyncronized, so we need to pass a function into another function.
 */

var parseString = require('xml2js').parseString;
var fs = require('fs');

module.exports = {

    prepare_data: function () {
        fs.readFile('./Server/svn_log.xml', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }

            //parse into json
            parseString(data, function (error, data2) {
                var log_list = data2;

                fs.readFile('./Server/svn_list.xml', 'utf8', function (err, data3) {
                    if (err) {
                        return console.log(err);
                    }
                    parseString(data3, function (error, data2) {
                        var to_return = process_assignment(data2, log_list);
                        //console.log(to_return);
                        return to_return;
                    });
                });
            });
        });
    }

};

