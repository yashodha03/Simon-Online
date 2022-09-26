// login function thats validates the user

function login(con,user,pass,next){
    const query = "SELECT username FROM Users WHERE username = "+con.escape(user)+" AND password = SHA1('"+ pass+ "')";
    con.query(query, function (err, rows, fields) {
        if (err){
            next(-1);
        }else {
            next(rows.length);
        }
    });
}
exports.login = login;

function sign(con,user,pass,next){
    const check = "SELECT username FROM Users WHERE username = "+con.escape(user);
    const insert = "INSERT INTO Users (username, password) VALUES ("+ con.escape(user)+", SHA1('"+ pass+ "'))\;";
    con.query(check, function (err, rows, fields) {
        if (rows.length == 0){
            con.query(insert, function (err, rows, fields) {
                if (err){
                    next(-1);
                }else {
                    next(1);
                }
            });
        }else {
            next(-1);
        }
    });
}
exports.sign = sign;