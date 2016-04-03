/**
 * Created by admin on 3/8/16.
 */

/**
 * Main controller that controlls the main page as well as the list page
 */
app.controller('mainController', ['$scope', '$http', 'socket', '$routeParams', function ($scope, $http, socket, $routeParams) {

    //test data
    $scope.errorData = "YesYes";
    $scope.Hisname = "My Name";

    //This is the filter given to the selection, such as assignment1.0, and so on.
    $scope.this_filter = $routeParams.filters;
    //this is the first connection, and will receive all the data.
    socket.on("connect", function () {
        socket.emit('data_recevied_by_front', "received the first part of data");

    });

    //emit this signal and refresh the filters and filtering result.
    socket.emit("refresh_data");
    socket.on("receive_refresh_list", function (data) {
        socket.emit('data_recevied_by_front', "data_received");
        $scope.assignment_all = data;
        $scope.assignment_filter = man_filter(data, $scope.this_filter);
    });
}]);

function man_filter(assignment, filter) {
    var to_return = [];
    for (element in assignment) {
        if (assignment[element].name.indexOf(filter) > -1) {
            to_return.push(assignment[element]);
            console.log(assignment[element].name);
        }
    }
    return to_return;
}

/**
 * This is the controller for the detail page.
 */
app.controller('detailController', ['$scope', '$http', 'socket', '$routeParams', function ($scope, $http, socket, $routeParams) {
    $scope.errorData = "YesYes";
    $scope.Hisname = "My Name";

    //from the web browser
    $scope.id = parseInt($routeParams.id);
    $scope.assignment = "Assignment1.0";

    //firtly get the data
    socket.on("connect", function () {
        socket.emit('data_recevied_by_front', "received the first part of data");
    });

    $("p").css("color", "white");

    $scope.current_comment = "Some Comments?";

    //transmit back the comments
    socket.emit("refresh_data");
    socket.on("receive_refresh_list", function (data) {
        socket.emit('data_recevied_by_front', "data_received_first");
        $scope.assignment_all = data;
        $scope.this_assignment = data[$scope.id];
        $scope.length = data.length;
        socket.emit('getSVN', $scope.this_assignment.name);
    });

    socket.on("receive_svn_data", function (data) {
        $scope.Code_Data = data;
    });

    //get the filter
    socket.emit("get_filter_word");
    socket.on("receive_filter_word", function (data) {
        $scope.filter_word = data;
    });

    //data binding.
    $scope.save_comments = function () {
        for (var elements in $scope.filter_word) {

            console.log($scope.filter_word);
            element = $scope.filter_word[elements];
            $scope.current_comment = $scope.current_comment.replace(element["before"], element["after"]);
        }

        if ($scope.current_comment.charAt(0) == "@")
            target = $scope.current_comment.charAt(1);
        else target = 0;

        var new_comment = {"comment": $scope.current_comment, "target": target};
        console.log(new_comment);

        $scope.this_assignment.comments.push(new_comment);
        $scope.assignment_all[$scope.id] = $scope.this_assignment;
        $scope.current_comment = " ";
        socket.emit('update_comments', $scope.assignment_all);
        socket.emit('update_database', $scope.assignment_all);

    };


}
])
;
