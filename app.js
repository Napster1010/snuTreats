
var express = require("express");
var app = express();
//var mysql = require('mysql')
var bcrypt = require('bcrypt')
var bodyParser = require("body-parser");

//Connecting to postgreSQL database
var pg = require('pg');
var connectionString = "postgres://postgres:1010@localhost:5432/snuTreats";
var client = new pg.Client(connectionString);
client.connect();

/*
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'snuTreats'
});*/




var saltRounds = 5;

app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended:true}));


//connection.connect()



//------------------------------------------------------USER ROUTES----------------------------------------------------------------

//Return all the shops
app.get("/shops",function(req,res){
			client.query('SELECT * FROM shops ', function (error, results, fields) {
				if(error){
					console.log(error);
					res.status(500).send({message: error});
				}else{
					console.log(results);
					res.status(200).send(results['rows']);
				}
			});

		//	res.send("King Kushagr")
});


//Return the menu of particular shop
app.get("/shops/:id",function(req,res){
	var id = req.params.id;
	client.query('SELECT * FROM menu_items WHERE shop_id =$1',[id],function(error,results,fields) {
		if(error){
			console.log(error);
			res.status(500).send({message: error});
		}else{
			res.status(200).send(results['rows']);
		}
	})
});


//individual item details
app.get("/shops/item/:id",function(req,res){
	var id = req.params.id;

	client.query('SELECT * FROM menu_items WHERE id =$1',[id],function(error,results,fields) {
		if(error){
			console.log(results);
			res.status(500).send({message: error});
		}else{
			res.status(200).send(results['rows']);
		}
	});

});


//login route
app.post("/login",function(req,res){
		
		var uname = req.body.username;
		var passd = req.body.password;
		//console.log(req.body);
		var flag = 0;
		      connection.query(`SELECT * FROM users WHERE username = $1`, [uname], function (error, results) {
	    if (error){
			res.status(500).send({message: error});
		}

	    if (results.length === 0) {
	        res.status(400).send({message: "details incorrect"})
	    }

	    bcrypt.compare(passd, results[0].password)
	        .then(boolean => {
	            if(!boolean){
	                res.send({message: "details incorrect"})
	            }

	            res.status(200).send({user: {username: results[0].username}})
	        }).catch(error => {res.status(400).send({message: error})});
	});
			//res.send("No match found");
});


//register route
app.post("/register",function(req,res){
		
		
		var uname = req.body.username;
		var passd = req.body.password;
		//console.log(req.body);
		bcrypt.hash(passd,saltRounds,function(err,hash){
			if(err){
				console.log(err);
				res.status(400).send({message: `Couldn't hash the password`});
			}
			client.query('INSERT INTO users(username, password) VALUES ($1, $2)',[uname, hash],function (error, results, fields) {
				if(error){
					console.log(error);
					res.status(500).send({message: error});
				}else{
					res.status(200).send({message: "User registered successfully"});
				}
			});
		});
});



//------------------------------------------------------VENDOR ROUTES----------------------------------------------------------------

//Add a new item to the shop
app.post('/shops/:id', function(req, res){
	var shopId = req.params.id;
	var name = req.body.name;
	var price = req.body.price;
	client.query('insert into menu_items(shop_id, item_name, price, is_available) values($1, $2, $3, $4)',[shopId, name, price, true], function(error, result){
		if(error){
			console.log(error);
			res.status(500).send({message: error});
		}else{
			res.status(200).send({message: "Menu Item added successfully"});
		}
	});	
});

//Update a menu item
app.put('/shops/item/:id', function(req, res){
	var id = req.params.id;
	var name = req.body.name;
	var price = req.body.price;
	var isAvailable = req.body.is_available;

	client.query('update menu_items set item_name=$1, price=$2, is_available=$3 where id=$4',[name, price, isAvailable, id], function(error, results){
		if(error){
			console.log(error);
			res.status(500).send({message: error});
		}else{
			res.status(200).send({message: "Item details updated successfully"});
		}
	});
});

//------------------------------------------------------ADMIN ROUTES----------------------------------------------------------------

//Add new vendor/shop
app.post('/shops', function(req, res){
	var vendorUsername = req.body.username;
	var password = req.body.password;
	var name = req.body.name;

	bcrypt.hash(password, saltRounds, function(err, hash){
		if(err){
			console.log(err);
			res.status(400).send({message: `Couldn't hash the password`});
		}
		client.query('insert into shops(name, vendor_uname, password, is_open) values($1, $2, $3, false)',[name, vendorUsername, hash], function(error, result){
			if(error){
				console.log(error);
				res.status(500).send({message: error});
			}else{
				res.status(200).send({message: "User registered successfully"});
			}
		});
	});
});





//Start the application on port 3000
app.listen(3000,function(){
	console.log("Server started on port 3000");
});