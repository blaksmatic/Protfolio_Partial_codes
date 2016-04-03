var Comments = require('../../models/comments');

// Wrap all the methods in an object

var comment = {
  read: function(req, res, next){
    Comments.findById(req.params.id,function(err,data){
      if (err)
        res.send(err);
      res.json(data);
    });
  },
  create: function(req, res, next){

    var comments = new Comments();
    comments.name=req.body.name;
    comments.reply=req.body.reply;
    comments.content=req.body.content;
    comments.project=req.body.project;

    comments.save(function(err,data){
      if (err) 
        console.log(err);
      res.send(data);
    });
      
  },
  update: function(req, res, next){
      Comments.findByIdAndUpdate(req.params.id, {
        $set: { 
          name     : req.body.name,
          reply    : req.body.reply,
          content : req.body.content,
          project  : req.body.project
        }
        }, 
        {upsert:true}, function () {
          res.json({message:'Comments is updated in the database!'});
        }
      );

  },
  delete: function(req, res, next){
    Comments.findByIdAndRemove(req.params.id,function(err,llama){
      if (err)
        res.send(err);
      res.json({message:'Comments deleted from the database!'});
    });
  },
  deleteAll: function(req, res, next){
    Comments.remove({},function(err,llama){
      if (err)
        res.send(err);
      res.json({message:'Comments deleted from the database!'});
    });
  },
  getAll: function(req, res, next){
    Comments.find(function(err,data){
      if (err) 
        console.error;
      res.json(data);
    });
   
  } 
}

// Return the object
module.exports = comment;
