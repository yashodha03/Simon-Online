var i = -2;
var length = 0
var option = 0

function decode(str,key) {           // takes in the string and the key, decodes it to return the color
    var newS = "";
    for (j = 0; j < str.length; j++) {
        char = String.fromCharCode(str.charCodeAt(j) ^ key)
        newS+=char;
      }
      return newS;
  }

function showcolors(data) {
    var messages = document.getElementById("messages");   // container to display the string of colors
    var blue = document.getElementById("blue");
    var green = document.getElementById("green");
    var red = document.getElementById("red");
    var yellow = document.getElementById("yellow");
    var res = data;
    i = 0;
    length = res[0].length;

    show = setInterval(function (){              // decodes the response from the server and makes the corresponding colors flas
        if (i < res[0].length) {
            var ans = decode(res[0][i],res[1][i])
        }  
        
        if (ans == "blue") {
            blue.id = "blue_flash";
            setTimeout(function() {blue.id = "blue";}, option - 100);
        }
        
        else if (ans == "green") {
            green.id = "green_flash";
            setTimeout(function() {green.id = "green";}, option - 100);
        }
        else if (ans == "red") {
            red.id = "red_flash";
            setTimeout(function() {red.id = "red";}, option - 100);
        }
        else if (ans == "yellow") {
            yellow.id = "yellow_flash";
            setTimeout(function() {yellow.id = "yellow";}, option - 100);
        }
        else if (i >= res[0].length) {
            clearInterval(show);
            i = -1;
            return
        }  
        i += 1;
    }, option);  
}

function check(data) {                    // evaluates the resonse sent by the server to check of the user preses the correct color and calculates the score 
    var press = data[0];       
    var choice = data[1]
    var messages = document.getElementById("messages");
    var count = document.getElementById("count");

    if (press == "correct") {
        if (choice == length - 1) {
            messages.innerHTML = "Correct. Waiting for other player to finish.";
            count.innerHTML = length.toString();
            socket.emit("done")
            i = -2;
        }
        else {
            messages.innerHTML = "Continue the sequence.";
        }
    }
    else {
        messages.innerHTML = "You lost.";
        i = -2;
        document.getElementById("start").disabled = false;
    }
}

function answer(press) {                      // generates the url based on the color the user presses on the cliet 
    if (i == -1) {
        socket.emit("answer", press, socket.id)
    }
}

function change() {
    var difficulty = document.getElementById("difficulty");

    if (difficulty.value == 1600) {
        difficulty.value = 1000;
        difficulty.innerHTML = "Medium";
    }
    else if (difficulty.value == 1000) {
        difficulty.value = 400;
        difficulty.innerHTML = "Hard";
    }
    else if (difficulty.value == 400) {
        difficulty.value = 1600;
        difficulty.innerHTML = "Easy";
    }
}

var socket = io("http://localhost:8080");

function ready() {
    document.getElementById("messages").innerHTML = "Searching for Player 2.";
    document.getElementById("start").disabled = true;
    socket.emit("ready");
    socket.on("start", function(data){
        option = parseInt(document.getElementById("difficulty").value);
        document.getElementById("messages").innerHTML = "";
        document.getElementById("count").innerHTML = 0;
        showcolors(data);
    });
    socket.on("cont", function(data){
        if (option >= 1000) {
            option -= 20;
        }
        else if (option >= 400) {
            option -= 10;
        }
        else if (option >= 250) {
            option -= 5;
        }
        showcolors(data);
    });
    socket.on("check", function(data){
        check(data)
    });
    socket.on("loser", function(data){
        if (data == socket.id) {
            messages.innerHTML = "You lost.";
            i = -2;
            document.getElementById("start").disabled = false;
        }
        else {
            messages.innerHTML = "You won.";
            i = -2;
            document.getElementById("start").disabled = false;
        }
    })
}