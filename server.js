// require express
var express = require("express");
// path module -- try to figure out where and why we use this
var path = require("path");
//mongoose 
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/login_db');
// create the express app
var app = express();
var bodyParser = require('body-parser');
// use it!
app.use(bodyParser.urlencoded({ extended: true }));
// bcrypt 
var bcrypt = require('bcrypt');

// MiddleWare: Session and Flash 
var session = require('express-session');
app.use(session({
	secret: 'cam_god',
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: 60000 }
}))
const flash = require('express-flash');
app.use(flash());
// static content
app.use(express.static(path.join(__dirname, "./static")));
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// // Get sockets
// const server = app.listen(8000);
// const io = require('socket.io')(server);
// var counter = 0;

// io.on('connection', function (socket) { //2
// 	  //Insert SOCKETS 
// });

// Mongoose Schema users 
var UserSchema = new mongoose.Schema({
	email: {type: String, required: [true,"Must input email"] },
	first_name: {type: String, required: [true,"Must input first name"], minlength: [2, "Input must be at least 2 characters"]},
	last_name: {type: String, required: [true,"Must input last name"], minlength: [2, "Input must be at least 2 characters"]},
	password: {type: String, required: [true,"Must input password"]},
	b_day: {type:Date, required: [true,"Must input birthday"]}
}, {timestamps: true})
mongoose.model('User', UserSchema); // We are setting this Schema in our Models as 'User'
var User = mongoose.model('User') // We are retrieving this Schema from our Models, named 'User'

// ...delete all records of the User Model
// User.deleteMany({}, function(err){
// 	// This code will run when the DB has attempted to remove all matching records to {}
//    })

// root route to render the index.ejs view
app.get('/', function(req, res) {
	res.render("index")

})
app.get('/home', function(req, res) {
	res.render('home')
})
// post route for adding a user
app.post('/reg_post', function(req, res) {
	console.log(req.body.email)
	User.find({email: req.body.email}, function(err, matches) {   //Email unique validation
		if (matches.length) {
			console.log("Email already exists")
			req.flash('email', "Email already exists!")
			res.redirect("/")
		}else {
			// console.log(req.body)
			var hash_data = req.body
			bcrypt.hash(hash_data.password, 10, function(err, hash){
				if (err) {
					console.log("Error hashing password")
				}else {
					hash_data.password = hash
					console.log(hash_data)
					User.create(hash_data, function(err, data)  {
						if (err) {
							console.log('Error creating user',err.errors)
							for (var key in err.errors) {
								req.flash(key, err.errors[key].message);
							}
							res.redirect("/")
						} else {
							console.log("Successfuly added user")
							res.redirect("/")
						}
					})
				}
			})
			
		}
	});
})
app.post('/login_post', function(req, res) {
	console.log(req.body)
	User.find({email: req.body.email}, function(err, matches) {   //Email unique validation
		if (matches.length < 1) {
			console.log("No email found")
			req.flash('login', "Login failed")
			res.redirect("/")
		}else {
			console.log("Login user found")
			console.log(matches)
			bcrypt.compare(req.body.password, matches[0].password, function(err, result){
				if (err) {
					console.log('Error comparing passwords ')
					res.redirect("/")
				}else if (result==false){
					req.flash('login', "Login failed (password is wrong)")
					res.redirect("/")
				}else {
					res.redirect("/home")
				}
			} )
		}
	});	
})

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(request, response){
	response.send("404")
});

// tell the express app to listen on port 8000
app.listen(8000, function() {
 console.log("listening on port 8000");
});