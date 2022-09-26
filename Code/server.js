var express = require("express");             // imports the express module
var app = express();
var io = require('socket.io');
var http = require('http');
var server = http.Server(app);
var sio = io(server);
const mysql = require("mysql") ;  
var session = require('client-sessions'); 

var bp = require("body-parser")
app.use(bp.urlencoded({extended:false}));
app.use(bp.json());
const login = require("./login"); 
const dPass = require("./password.json"); 

const con = mysql.createConnection({
    "host": "localhost",
    "user": "root",
    "password": dPass.password,
    "database": "Simon",
});

app.use(session({
    cookieName: 'session',
    secret: dPass.secret,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));

var flash = []                          // array conating the encoded color 
var keys = []                           // array containig the key for decoding corresponding string
var choice = [0, 0] 
var players = []
var ready = 0;

function rndInt(min, max) {                          // returns a random number between a specific range
    return Math.floor(Math.random() * (max - min) ) + min;
}

  function decode(str,key) {
    var newS = "";
    for (i = 0; i < str.length; i++) {
        char = String.fromCharCode(str.charCodeAt(i) ^ key)
        newS+=char;
    }
    return newS;
}
  
function convert(press) {                  // asssigns a number for each color, encodes it using a random key and retuns the encoded string and the key
    var key = rndInt(65,90)
    if (press == 1) {
        var s = "blue"
        var newS = ""
        for (i = 0; i < s.length; i++) {
            char = String.fromCharCode(s.charCodeAt(i) ^ key)
            newS+=char;
        }
        return [newS,key];
    }  
    
    else if (press == 2) {
        var s = "green"
        var newS = ""
        for (i = 0; i < s.length; i++) {
            char = String.fromCharCode(s.charCodeAt(i) ^ key)
            newS+=char;
        }
        return [newS,key];
    }
    else if (press == 3) {
        var s = "red"
        var newS = ""
        for (i = 0; i < s.length; i++) {
            char = String.fromCharCode(s.charCodeAt(i) ^ key)
            newS+=char;
        }
        return [newS,key];
    }
    else if (press == 4) {
        var s = "yellow"
        var newS = ""
        for (i = 0; i < s.length; i++) {
            char = String.fromCharCode(s.charCodeAt(i) ^ key)
            newS+=char;
        }
        return [newS,key];
    }    
}

function extend() {                             // generates a random number, conberts it to a color and adds it to the list
    result = convert(Math.floor(Math.random() * 4) + 1);
    flash.push(result[0])
    keys.push(result[1])
}

sio.on('connection', function(socket) {
    socket.on("ready", function() {
        ready += 1;
        players.push(socket.id);
        if (ready >= 2) {
            flash = [];
            keys = [];
            choice = [0, 0];
            ready = 0;
            extend();
            sio.sockets.emit("start", [flash, keys]);
        }
    });
    socket.on("done", function() {
        ready += 1;
        if (ready >= 2) {
            ready = 0;
            choice = [0, 0];
            extend();
            sio.sockets.emit("cont", [flash, keys]);
        }
    });
    socket.on("answer", function(press, id){
        var r = convert(press)
        var press = decode(r[0],r[1])     
        if (id == players[0]){
            id = 0;
        }
        else {
            id = 1;
        }
    
        if (decode(flash[choice[id]],keys[choice[id]])  ==  press) {
            socket.emit("check", ["correct", choice[id]]);
            choice[id] += 1;
        }
        else {
            socket.emit("check", ["incorrect", choice[id]]);
            choice[id] = 0;
            sio.sockets.emit("loser", players[id]);
            players = [];
        }
    })
});

// Login -------------------------------------

function protect(req, res) {
    if(!req.session.user){
        req.session.msg = 'Not allowed there';
        return res.redirect('/');
    }
}

app.get('/logout', function (req, res){
    req.session.reset();
    req.session.msg = 'You logged out';
    return res.redirect('/');
});

app.post("/login",function(req,res){
    login.login(con,req.body.user, req.body.pass,function(val){
        if(val<=0){
            req.session.msg = "Invalid login";
            res.redirect("./welcome_failed");
        }
        else {
            req.session.user = req.body.user;
            res.redirect("./home.html");
        }
    });
});

app.post("/sign",function(req,res){
    login.sign(con,req.body.user, req.body.pass,function(val){
        if(val<=0){
            req.session.msg = "Invalid login";
            res.redirect("./new_failed");
        } 
        else {
            res.redirect("./");
        }
    });
});

app.get("/home.html", function (req, res) {
    protect(req, res);
    res.sendFile( __dirname + "/home.html" );
});

app.get("/", function(req, res){
    res.sendFile( __dirname + "/welcome.html" );  
});

app.get("/new", function(req, res){
    res.sendFile( __dirname + "/new.html" );
});

app.get("/new_failed", function(req, res){
    res.sendFile( __dirname + "/new_failed.html" );
});

app.get("/welcome_failed", function(req, res){
    res.sendFile( __dirname + "/welcome_failed.html" );
});

con.connect(function(err) {
    if (err) {
        console.log("Error connecting to database");
    }
    else {
        console.log("Database successfully connected");
    }
});

// server listening at port 8080 -----------------------
app.use(express.static("."));
server.listen(8080,function(){
    console.log("Server running...")
});   
