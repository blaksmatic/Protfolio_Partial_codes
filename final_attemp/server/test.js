var mongoose = require('mongoose');
var dbname   = "angular_mongodb";

var Product  = mongoose.model("Product",{
	name     :  String,
	reply    :  String,
	content :  String,
	project  :  String
});

var Words  = mongoose.model("Words",{
	original     :  String,
	replace      :  String
});

mongoose.connect("mongodb://cs242portfolio:cs242portfolio@ds025409.mlab.com:25409/portfolio_zeng");


var db = mongoose.connection;
db.on("error"  , console.error);
db.once("open" , deleteProducts);

function deleteProducts(){
	Product.remove({project:"test"},function(err){
		if (err) 
			console.log(err);
		insertProducts();
	});
}


function insertProducts(){
	var products = new Product({
		name     :  "Yixiang",
        reply    :  "Zeng",
        content  :  "Hello",
        project  :  "project"
	});

	products.save(function(err){
		if (err) 
			console.log(err);
	});
}







