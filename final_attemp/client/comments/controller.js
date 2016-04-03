String.prototype.replaceAll = function(target, replacement) {
    var string=this;
    for(var i=0;i<target.length;i++){
        string=string.split(target[i]).join(replacement[i]);
    }
  return string;
};


(function(){

	angular
		.module("Main.comments", [])
		.controller("commentsController", commentsController)
		.directive("productWidget", productWidget);

	function commentsController($scope, $http,  $sce,  commentsService){


		
        $scope.parse_log={};
        $scope.projectFiles={};

        $scope.initial = function() {


             $http.get('./data/svn_log.json')
                 .success(function (data) {

    //          save msg with _revision from svn_log in $scope.parse_log
                     var read_log = data["log"]["logentry"];
                     for (var i = 0; i < read_log.length; i++) {
                         var version = read_log[i]["_revision"];
                         var message = read_log[i]["msg"];
                         $scope.parse_log[version] = message;
                     }

    //          parse svn_list data to build projectFiles
                     $http.get('./data/svn_list.json')
                         .success(function (data) {
                             var read_list = data["lists"]["list"]["entry"];

    //                  For each file in svn_list
                             for (var i = 0; i < read_list.length; i++) {
                                 var fileName = read_list[i]["name"];
                                 var fileValue = read_list[i];

    //                      Get the projectName, will be used as key in dictionary
                                 var projectName = "";
                                 var projectNameIndex = fileName.indexOf('/');
                                 if (projectNameIndex === -1) {
                                     projectName = fileName;
                                 }
                                 else {
                                     projectName = fileName.substring(0, projectNameIndex);
                                 }

                                 var modify = fileValue["commit"];
                                 var modifyDate = fileValue["commit"]["date"];
                                 modifyDate = Date.parse(modifyDate);
                                 if (projectName in $scope.projectFiles) {
    //                          If this project exist it dictionary, check modification date
                                     var compareDate = $scope.projectFiles[projectName]["date"];
                                     compareDate = Date.parse(compareDate);
                                     if (modifyDate > compareDate) {
    //                              If this is the latest modification, update the Project info
                                         $scope.projectFiles[projectName]["author"] = modify["author"];
                                         $scope.projectFiles[projectName]["date"] = modify["date"];
                                         $scope.projectFiles[projectName]["_revision"] = modify["_revision"];
                                         $scope.projectFiles[projectName]["summary"] = $scope.parse_log[modify["_revision"]];
                                     }
                                 }
                                 else {
    //                        If this project has not been created in dictionary, create it
                                     var newProject = {};
                                     newProject["author"] = modify["author"];
                                     newProject["date"] = modify["date"];
                                     newProject["_revision"] = modify["_revision"];
                                     newProject["summary"] = $scope.parse_log[modify["_revision"]];
                                     newProject["files"] = {};
                                     newProject["newProjectName"] = projectName.replaceAll(['.', '/', '$', ' '], ['-', '_', 'v', 'z']);
                                     $scope.projectFiles[projectName] = newProject;
                                 }


    //                      deal with this file's info and it's different versions in dictionary
                                 var files = $scope.projectFiles[projectName]["files"];
                                 fileValue["versions"] = [];
                                 fileValue["commit"]["info"] = $scope.parse_log[fileValue["commit"]["_revision"]];
                                 fileValue["versions"].push(fileValue["commit"]);
                                 fileValue["newFileName"] = fileName.replaceAll(['.', '/', '$', ' '], ['-', '_', 'v', 'z']);
                                 if (fileName in files) {
                                     var compareDate2 = files[fileName]["commit"]["date"];
                                     compareDate2 = Date.parse(compareDate2);
                                     if (modifyDate > compareDate2) {
                                         var original = $scope.projectFiles[projectName]["files"][fileName];
                                         original["versions"].push(fileValue["commit"]);
                                         fileValue["versions"] = original;
                                         delete fileValue["commit"];
                                         $scope.projectFiles[projectName]["files"][fileName] = fileValue;
                                     }
                                     else {
                                         $scope.projectFiles[projectName]["files"][fileName]["versions"].push(fileValue["commit"]);
                                     }
                                 }
                                 else {
                                     delete fileValue["commit"];
                                     $scope.projectFiles[projectName]["files"][fileName] = fileValue;
                                 }
                             }

                         });
                 });
         }
        $scope.initial();
    //    set src in iframe when the button is clicked
        $scope.iframeTitle;
        $scope.customUrl;


        $scope.setURL = function (key) {
            var iframeHeight=$(window).height()*(2/3);
            $("#fileBody").css("white-space","pre-line");

            $scope.iframeTitle=key;
            var parsedURL="https://subversion.ews.illinois.edu/svn/sp16-cs242/yzeng19/"+key;
            $scope.customUrl = $sce.trustAsResourceUrl(parsedURL);


            var path='./data/yzeng19/'+key;
            commentsService.getFile(path).then(function (data){
                $scope.fileData=data;
                console.log(data);
            },function(error){

                $scope.fileData="It's not a file but a directory. Can not load the file from svn.\n" +
                    "Try to click its child files.";
            });




        };



        $scope.replacements={};
        $scope.wordsOriginal=[];
        $scope.wordsReplacement=[];
        var replaceWord = function(data){
            for (var i = 0; i < data.length; i++) {
                var word=data[i];
                $scope.replacements[word.original]=word.replace;
                $scope.wordsOriginal.push(word.original);
                $scope.wordsReplacement.push(word.replace);
            }
		};

		commentsService.getWordReplace().then(replaceWord);

        $scope.comments={};
        var modelComments = function(data){
            for (var i = 0; i < data.length; i++) {
                var comment=data[i];


                if(comment.project in $scope.comments){
                    $scope.comments[comment.project].push(data[i]);
                }
                else{
                    $scope.comments[comment.project]=[];
                    $scope.comments[comment.project].push(data[i]);
                }
            }

		};

		commentsService.getComments().then(modelComments);


        $scope.commentProject="";
        $scope.clickComment = function(project){
            $scope.commentProject=project;
            var title="Make my comment to " + project;
            $("#commentTitle").text(title);
        };



        $scope.submitComment=function(){
            var name2 = $('#name').val();
            var reply2 = $('#reply').val();
            var content2 = $('#content').val();
            var project2 = $scope.commentProject;

            content2 = content2.replaceAll($scope.wordsOriginal, $scope.wordsReplacement);


            if(!name2.trim()){
                name2 = "Anonymous";
            }
            if(reply2.trim()){
                reply2 = " reply to " + reply2;
            }
            if(!content2.trim()){
                $('#name').val("");
                $('#reply').val("");
                $('#content').val("");
                return;
            }

            // request option
            var options = {
               name : name2,
                reply: reply2,
                content: content2,
                project : project2
            };

            commentsService.postComment(options).then(function (data) {
                    var comment=data;
                    if(comment.project in $scope.comments){
                        $scope.comments[comment.project].push(data);
                    }
                    else{
                        $scope.comments[comment.project]=[];
                        $scope.comments[comment.project].push(data);
                    }
            },
            function errorCallback(response){
                alert("There's an error");
            });


            $('#name').val("");
            $('#reply').val("");
            $('#content').val("");

//            location.reload();


        };





//      Only for test
        $scope.tests=function(){
            $( "#testDiv" ).empty();


            var insertComment = function(name2,reply2,content2,project2){
                content2 = content2.replaceAll($scope.wordsOriginal, $scope.wordsReplacement);

                var options = {
                    name : name2,
                    reply: reply2,
                    content: content2,
                    project : project2
                };

                commentsService.postComment(options).then(function(){
                     commentsService.getComments().then(function(data){
                         var testData=[];
                         for (var i = 0; i < data.length; i++) {
                             var comment=data[i];
                             if(comment.project==="test"){
                                    testData.push(data[i]);
                             }
                         }
                         var testComment=testData[0];
                         if(testData.length!==1){
                             $( "#testDiv" ).append( "<p>Insert Comment Test : Fail</p>" );
                             commentsService.removeComment(testComment["_id"]).then();
                             return;
                         }
                         if(testComment.name!==name2 || testComment.reply!==reply2 || testComment.content!==content2 || testComment.project!==project2){
                             $( "#testDiv" ).append( "<p>Insert Comment Test : Fail</p>" );
                             commentsService.removeComment(testComment["_id"]).then();
                             return;
                         }
                         $( "#testDiv" ).append( "<p>Insert Comment Test : Pass</p>" );
                         commentsService.removeComment(testComment["_id"]).then();
                     });
                });


            }("name","","comment","test");


            var readComment = function(name2,reply2,content2,project2){
                commentsService.getComments().then(function(data){
                    var testData=[];
                    for (var i = 0; i < data.length; i++) {
                        var comment=data[i];
                        if(comment.project==="test"){
                            testData.push(data[i]);
                        }
                    }
                    var testComment=testData[0];
                    if(testData.length!==1){
                        $( "#testDiv" ).append( "<p>Read Comment Test : Fail</p>" );
                        commentsService.removeComment(testComment["_id"]).then();
                        return;
                    }
                    if(testComment.name!==name2 || testComment.reply!==reply2 || testComment.content!==content2 || testComment.project!==project2){
                        $( "#testDiv" ).append( "<p>Read Comment Test : Fail</p>" );
                        commentsService.removeComment(testComment["_id"]).then();
                        return;
                    }
                    $( "#testDiv" ).append( "<p>Read Comment Test : Pass</p>" );
                    commentsService.removeComment(testComment["_id"]).then();

                });
            }("name","","comment","test");


            var insertReplyComment = function(name2,reply2,content2,project2){
                if(!name2.trim()){
                    name2 = "anonymous";
                }
                if(reply2.trim()){
                    reply2 = " reply to " + reply2;
                }

                content2 = content2.replaceAll($scope.wordsOriginal, $scope.wordsReplacement);

                var options = {
                    name : name2,
                    reply: reply2,
                    content: content2,
                    project : project2
                };

                commentsService.postComment(options).then(function(){
                     commentsService.getComments().then(function(data){
                         var testData=[];
                         for (var i = 0; i < data.length; i++) {
                             var comment=data[i];
                             if(comment.project==="testReply"){
                                    testData.push(data[i]);
                             }
                         }
                         var testComment=testData[0];
                         if(testData.length!==1){
                             $( "#testDiv" ).append( "<p>Insert Reply Comment Test : Fail1</p>" );
                             commentsService.removeComment(testComment["_id"]).then();
                             return;
                         }
                         if(testComment.name!=="anonymous" || testComment.reply!==" reply to test" || testComment.content!=="comment" || testComment.project!=="testReply"){
                             $( "#testDiv" ).append( "<p>Insert Reply Comment Test : Fail2</p>" );
                             commentsService.removeComment(testComment["_id"]).then();
                             return;
                         }
                         $( "#testDiv" ).append( "<p>Insert Reply Comment Test : Pass</p>" );
                         commentsService.removeComment(testComment["_id"]).then();
                     });
                });


            }("","test","comment","testReply");


            var insertReplaceComment = function(name2,reply2,content2,project2){
                content2 = content2.replaceAll($scope.wordsOriginal, $scope.wordsReplacement);

                var options = {
                    name : name2,
                    reply: reply2,
                    content: content2,
                    project : project2
                };

                commentsService.postComment(options).then(function(){
                     commentsService.getComments().then(function(data){
                         var testData=[];
                         for (var i = 0; i < data.length; i++) {
                             var comment=data[i];
                             if(comment.project==="testReplacement"){
                                    testData.push(data[i]);
                             }
                         }
                         var testComment=testData[0];
                         if(testData.length!==1){
                             $( "#testDiv" ).append( "<p>Insert Replace Comment Test : Fail</p>" );
                             commentsService.removeComment(testComment["_id"]).then();
                             return;
                         }
                         if(testComment.name!==name2 || testComment.reply!==reply2 || testComment.content!=="comment with replace word replace" || testComment.project!==project2){
                             $( "#testDiv" ).append( "<p>Insert Replace Comment Test : Fail</p>" );
                             commentsService.removeComment(testComment["_id"]).then();
                             return;
                         }
                         $( "#testDiv" ).append( "<p>Insert Replace Comment Test : Pass</p>" );
                         commentsService.removeComment(testComment["_id"]).then();
                     });
                });


            }("name","","comment with original word original","testReplacement");


            var readReplacement = function(target,replacement){
                commentsService.getWordReplace().then(function(data){
                    if(data.length===0){
                        $( "#testDiv" ).append( "<p>Read Replacement Test : Fail</p>" );
                        return;
                    }
                    var testComment=data[0];
                    if(testComment.original!=="original" || testComment.replace!=="replace"){
                        $( "#testDiv" ).append( "<p>Read Replacement Test : Fail</p>" );
                        return;
                    }
                    $( "#testDiv" ).append( "<p>Read Replacement Test : Pass</p>" );
                });
            }("original" ,"replace" );

        };


	}




	function productWidget(){
		var widget = {
			templateUrl: "./comments/comments.widget.html",
			restrict: "E",
			controller: function($scope){
				$scope.buyme = function(product){
					console.log(product);
				}
			}
		};

		return widget;
	}




}());




