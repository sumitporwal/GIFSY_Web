var express=require('express');
const mongo=require('mongodb');
var router=express.Router();
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const connection=require('../dbconnection');
const path = require('path');
const cors=require('cors');
const fs=require('fs');
const multer = require("multer")
const User=require('../Models/User');
const Student=require('../Models/Student');
const Book=require('../Models/Book');
const Rent = require('../Models/Rent');
var ObjectID = require('mongodb').ObjectID;

process.env.SECRET_KEY='secret';
router.use(cors());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const path="views/assets/uploads/images";
        fs.mkdirSync(path, { recursive: true })
        cb(null, path)
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now()+".jpg")
    }
  })

  const maxSize = 1 * 1000 * 1000;
    
var upload = multer({ 
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb){
    
        // Set the filetypes, it is optional
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);
  
        var extname = filetypes.test(path.extname(
                    file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
      
        cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes);
      } 
});       

function ensureAuthenticated(req, res, next) {
    const token = req.cookies.token;
  if (!token) {
    return res.redirect('login');
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).render('pages/403');
    }
    req.userId = decoded.id;
    next();
  });
};

async function findRent(user){
    for(i=0;i<user.length;i++){
        await Student.findOne({_id:user[i].student})
        .then(student=>{
             user[i].student=student;
             console.log(user[i]);
         })
         .catch(err=>{
             console.log(err);
             res.send('error:'+ err);
         })
        await Book.findOne({_id:user[i].book})
         .then(book=>{
             user[i].book=book;
         })
         .catch(err=>{
             console.log(err);
             res.send('error:'+ err);
         })
    }
    return user;
}

async function getRent(req,res){
    var student,book;
    await Student.find({})
    .then(user=>{
        if(user.length!=0){
           student=user;
        }
        else{
           student="No Records Found";
        }
    });
    await Book.find({})
    .then(user=>{
        if(user.length!=0){
           book=user;
        }
        else{
           book="No Records Found";
        }
    });
    await Rent.find({})
.then(async user=>{
    if(user.length!=0){
        var i=0;
        var rent=await findRent(user);
        res.status(201);
        res.render('pages/rent',{rent:rent,student:student,book:book});
    }
    else{
       res.status(202);
       res.render('pages/rent',{rent:"No Records Found",student:student,book:book});
    }
})
}

router.get('/',(req,res)=>{
    console.log("Request Received");
    res.redirect('login');
});

router.get('/register',(req,res)=>{
    console.log("Request Received");
    res.render('pages/register');
});

router.get('/login',(req,res)=>{
    const token = req.cookies.token;
  if (!token) {
    return res.render('pages/login');
  }
  else{
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
          res.render('pages/login');
        }
      });
      res.redirect('student');
  }
});

router.get('/logout',(req,res)=>{
    console.log("Request Received");
    res.clearCookie('token')
    res.redirect('/login');
});

router.get('/student',ensureAuthenticated,(req,res)=>{
    Student.find({})
    .then(user=>{
        if(user.length!=0){
           res.status(201);
           res.render('pages/student',{student:user,url:req.url});
        }
        else{
           res.status(202);
           res.render('pages/student',{student:"No Records Found",url:req.url});
        }
    });
});

router.get('/student/(:id)',ensureAuthenticated,(req,res)=>{
    console.log("Request Received");
    var id=req.params.id;
    Student.findOne({_id:id})
    .then(user=>{
        if(user.length!=0){
           res.status(201);
           res.send({redirect:'/student',student:user});
        }
        else{
           res.status(202);
           res.send({redirect:'/student',err:"No Records Found"});
        }
    })
    .catch(err=>{
        console.log(err);
        res.send('error:'+ err);
    })
});

router.get('/book',ensureAuthenticated,(req,res)=>{
    console.log("Request Received");
    Book.find({})
    .then(user=>{
        if(user.length!=0){
           res.status(201);
           res.render('pages/book',{book:user});
        }
        else{
           res.status(202);
           res.render('pages/book',{book:"No Records Found"});
        }
    });
});

router.get('/book/(:id)',ensureAuthenticated,(req,res)=>{
    console.log("Request Received");
    var id=req.params.id;
    Book.findOne({_id:id})
    .then(user=>{
        if(user.length!=0){
           res.status(201);
           res.send({redirect:'/book',book:user});
        }
        else{
           res.status(202);
           res.send({redirect:'/book',err:"No Records Found"});
        }
    })
    .catch(err=>{
        console.log(err);
        res.send('error:'+ err);
    })
});

router.get('/rent',ensureAuthenticated,(req,res)=>{
    console.log("Request Received");
    var student1=[];
    var book1=[];
    getRent(req,res);  
})

router.get('/rent/(:id)',ensureAuthenticated,(req,res)=>{
    console.log("req");
    var id=req.params.id;
    Rent.findOne({_id:id})
    .then(user=>{
        if(user.length!=0){
           res.status(201);
           res.send({redirect:'/rent',rent:user});
        }
        else{
           res.status(202);
           res.send({redirect:'/rent',err:"No Records Found"});
        }
    })
    .catch(err=>{
        console.log(err);
        res.send('error:'+ err);
    })
});

router.post('/register',(req,res)=>{
console.log("Request Received");
console.log(req.body.name);
var item={
    name:req.body.name,
    email:req.body.email,
    username:req.body.username,
    password:req.body.password,
};
User.findOne({
    username:req.body.username
})
.then(user=>{
    if(!user){
        bcrypt.hash(req.body.password,10,(err,hash)=>{
            item.password=hash;
            User.create(item)
            .then(user=>{
                res.send({redirect: '/login'});
            })
            .catch(err=>{
                console.log(err);
                res.send('error:'+ err);
            })
        })
    }
    else{
        res.send({err: "User already exists"});
    }
})
});

router.post('/login',(req,res)=>{
    var item={
        username:req.body.username,
        password:req.body.password
    };
    User.findOne({
        username:req.body.username
    })
    .then(user=>{
        if(user){
            if(bcrypt.compareSync(req.body.password,user.password)){
                const payload={
                    name:user.name,
                    email:user.email,
                    password:user.password,
                    username:user.username
                }
                let token=jwt.sign(payload,process.env.SECRET_KEY,{
                    expiresIn:1440
                })
                console.log("Token:"+token);
                res.status(201);
                res.cookie("token", token, {httpOnly: true,expire: 480000 + Date.now()});
                res.send({token:token,redirect:"/student"});
            }
            else{
                res.status(202);
                res.json({err:"Invalid Username or Password"});
            }
        }
        else{
            res.json({err:"User does not exist"});
        }
    })
    .catch(err=>{
        res.send(err);
    })
})

router.post('/student/save',upload.single('photo'),(req,res)=>{
    console.log(req.file);
    var path="assets/uploads/images/"+req.file.filename;
    req.file.path=path;
        var item={
            name:req.body.name,
            class:req.body.class,
            photo:req.file,
           // video:req.body.video
        };
        console.log(item);
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                item.password=hash;
                Student.create(item)
                .then(student=>{
                    res.json({status : student.name+' Added Successfully',redirect:"/student"});
                })
                .catch(err=>{
                    res.send('error:'+ err);
                })
           })
    })
    router.post('/student/edit/(:id)',upload.single('photo'),(req,res)=>{
        var id=req.params.id;
        console.log(req.file);
        Student.find({_id:id})
.then(user=>{
    if(user){
        console.log(req.body);
        var item;
        if(req.file!=undefined){
            var path="assets/uploads/images/"+req.file.filename;
            req.file.path=path;
            item={
                $set:{
                name:req.body.name,
                class:req.body.class,
                photo:req.file
               // video:req.body.video,
                }
            };
        }
        else{
            item={
                $set:{
                name:req.body.name,
                class:req.body.class,
               // video:req.body.video,
                }
            };
        }
        Student.updateOne({_id:id},item)
        .then(user=>{
            res.status(201);
            res.send({redirect:"/student"});
        })
        .catch(err=>{
            res.send('error:'+ err);
        })
    }
    else{
        res.status(202)
        res.send("Student not found");
    }
})
.catch(err=>{
    res.send(err);
})
})
router.post('/student/delete/(:id)',(req,res)=>{
    var id=new ObjectID(req.params.id);
    Student.find({_id:id})
    .then(user=>{
        if(user){
            Student.deleteOne({_id:req.params.id})
            .then(user=>{
                res.status(201);
                res.send({redirect:"/student"});
            })
            .catch(err=>{
                res.send({redirect:'/student',err:"'error:'+ err"});
            })
        }
        else{
            res.status(202)
            res.send({redirect:'/student',err:"Student does not exists"});
        }
    })
    .catch(err=>{
        res.send(err);
    })
})
router.post('/book/save',(req,res)=>{
    console.log("Request Received");
    var item={
        name:req.body.name,
        author:req.body.author,
        publication:req.body.publication,
        year:req.body.year
    };
    console.log(item);
    Book.findOne({
        name:req.body.name,
        author:req.body.author
    })
    .then(book=>{
        if(!book){
                Book.create(item)
                .then(book=>{
                    res.json({status : book.name+' Added Successfully',redirect:"/book"});
                })
                .catch(err=>{
                    res.send('error:'+ err);
                })
        }
        else{
            res.json({error: "Book already exists"});
        }
    })
    });
router.post('/book/edit/(:id)',(req,res)=>{
        var id=req.params.id;
        Book.find({_id:id})
.then(user=>{
    if(user){
        console.log(req.body);
        var item={
            $set:{
            name:req.body.name,
            author:req.body.author,
            publication:req.body.publication,
            year:req.body.year,
            }
        };
        Book.updateOne({_id:id},item)
        .then(user=>{
            res.status(201);
            res.send({redirect:"/book"});
        })
        .catch(err=>{
            res.send('error:'+ err);
        })
    }
    else{
        res.status(202)
        res.send("Book does not exists");
    }
})
.catch(err=>{
    res.send(err);
})
})
router.post('/book/delete/(:id)',(req,res)=>{
    var id=new ObjectID(req.params.id);
Book.find({_id:id})
.then(user=>{
    if(user){
        console.log(user);
        Book.deleteOne({_id:req.params.id})
        .then(user=>{
            res.status(201);
            console.log(user);
            res.send({redirect:"/book"});
        })
        .catch(err=>{
            res.send({redirect:'/book',err:"'error:'+ err"});
        })
    }
    else{
        res.status(202)
        res.send({redirect:'/book',err:"Book does not exists"});
    }
})
.catch(err=>{
    res.send(err);
})
})
router.post('/rent/save',(req,res)=>{
    console.log("Request Received");
    var item={
        student:req.body.student,
        book:req.body.book,
        start_date:req.body.start_date,
        due_date:req.body.due_date,
    };
    console.log(item);
    Rent.findOne({
        student:req.body.student,
        book:req.body.book,
        start_date:req.body.start_date,
        due_date:req.body.due_date,
    })
    .then(rent=>{
        if(!rent){
            console.log(rent);            
                Rent.create(item)
                .then(rent=>{
                    console.log(item);
                    res.json({status : 'rent Added Successfully',redirect:"/rent"});
                })
                .catch(err=>{
                    res.send('error:'+ err);
                })
        }
        else{
            res.json({error: "Record already exists"});
        }
    })
    });
router.post('/rent/edit/(:id)',(req,res)=>{
        var id=req.params.id;
        Rent.find({_id:id})
.then(user=>{
    if(user){
        console.log(req.body);
        var item={
            $set:{
            student:req.body.student,
            book:req.body.book,
            start_date:req.body.start_date,
            due_date:req.body.due_date,
            }
        };
        Rent.updateOne({_id:id},item)
        .then(user=>{
            res.status(201);
            res.send({redirect:"/rent"});
        })
        .catch(err=>{
            res.send('error:'+ err);
        })
    }
    else{
        res.status(202)
        res.send("Record does not exists");
    }
})
.catch(err=>{
    res.send(err);
})
})
router.post('/rent/delete/(:id)',(req,res)=>{
    var id=new ObjectID(req.params.id);
    console.log(id);
Rent.find({_id:id})
.then(user=>{
    if(user){
        Rent.deleteOne({_id:req.params.id})
        .then(user=>{
            res.status(201);
            console.log("user");
            res.send({redirect:"/rent"});
        })
        .catch(err=>{
            res.send({redirect:'/rent',err:"'error:'+ err"});
        })
    }
    else{
        res.status(202)
        res.send({redirect:'/rent',err:"Record does not exists"});
    }
})
.catch(err=>{
    res.send(err);
})
})
module.exports=router;