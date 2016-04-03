(function(){

	var commentsService = function($http){

		var getComments = function(){
			return $http.get("/api/comments")
						.then(function(response){
							return response.data;
						})
		};
        var getWordReplace = function(){
			return $http.get("/api/words")
						.then(function(response){
							return response.data;
						})
		};

        var postComment = function(data){
			return $http.post("/api/comment",data)
						.then(function(response){
							return response.data;
						})
		};


        var removeComment = function(data){
			return $http.delete("/api/comment/" + data)
						.then(function(response){
							return response;
						})
		};


         var getFile = function(path){
			return $http.get(path,{headers: {
                'Authorization': "Basic " + btoa("username" + ":" + "password")}})
                .then(function(response){
                    return response.data;
                })
         };

		return {
			getComments: getComments,
            postComment: postComment,
            getWordReplace: getWordReplace,
            getFile: getFile,

            removeComment: removeComment


		}

	};

	angular
		.module("Main")
		.factory("commentsService", commentsService);

}());
