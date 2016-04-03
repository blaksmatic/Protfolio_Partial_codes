// Initialize the express framework
var express 	 	= require('express');
var path            = require('path');
var mongoose        = require('mongoose');
// Initialize the body-parser
// in order to receive the request body
// in POST, PUT and DELETE
var	bodyParser		= require('body-parser');

var databaseName    = 'angular_mongodb';
// Express setup
var app = express();
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname,'../client')));




// Routes set up
var router 	= express.Router();
var comment = require('./controllers/api/comment');
var word = require('./controllers/api/words');

// Get all comments
router.get('/api/comments', comment.getAll);
router.get('/api/words', word.getAll);

// Create a comment
router.post('/api/comment', comment.create);
router.route('/api/comment/deleteAll').delete(comment.deleteAll);
router.post('/api/word', word.create);

// Get one comment, update one comment, delete one comment
router.route('/api/comment/:id')
	.get(comment.read)
	.put(comment.update)
	.delete(comment.delete);
router.route('/api/word/:id')
	.get(word.read)
	.put(word.update)
	.delete(word.delete);
// Register the routing
app.use('/', router);

mongoose.connect('mongodb://cs242portfolio:cs242portfolio@ds025409.mlab.com:25409/portfolio_zeng');

var db = mongoose.connection;
db.on('error', console.error);
db.once('open',startServer);

function startServer(){
	// Start up the server
	var server = app.listen(3000, function(){
		var port = server.address().port;
		console.log('Listening on port ' + port);
	})
}



