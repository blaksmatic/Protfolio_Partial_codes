var Words = require('../../models/words');

// Wrap all the methods in an object

var word = {
  read: function(req, res, next){
    Words.findById(req.params.id,function(err,data){
      if (err)
        res.send(err);
      res.json(data);
    });
  },
  create: function(req, res, next){

    var word = new Words();
    word.original=req.body.original;
    word.replace=req.body.replace;

    word.save(function(err,data){
      if (err) 
        console.log(err);
      res.send(data);
    });
      
  },
  update: function(req, res, next){
      Words.findByIdAndUpdate(req.params.id, {
        $set: { 
          original     : req.body.original,
          replace    : req.body.replace,
        }
        }, 
        {upsert:true}, function () {
          res.json({message:'Comments is updated in the database!'});
        }
      );

  },
  delete: function(req, res, next){
    Words.findByIdAndRemove(req.params.id,function(err,llama){
      if (err)
        res.send(err);
      res.json({message:'Comments deleted from the database!'});
    });
  },
  getAll: function(req, res, next){
    Words.find(function(err,data){
      if (err) 
        console.error;
      res.json(data);
    });
   
  } 
}

// Return the object
module.exports = word;
