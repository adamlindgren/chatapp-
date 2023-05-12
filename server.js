// Vi inkluderar express i vårt projekt
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
let mysql = require("mysql2");
const { log } = require("console");

let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Spartans66!",
    database: "chatapp"
});

//Vi talar om var du skal hamn när någon
//surfar in till vår webbserver. I detta fall
//kommer personen hamna i en mapp som heter
//webbsidan. Där jag kommer placera html-dokumentet,
//css, bilder etc.
app.use(express.static("./webbsidan"));

app.use(bodyParser.urlencoded({extended: false}));

const dbUrl ="mongodb+srv://adam_lindgren1:Spartans66!@cluster0.cjs9jhb.mongodb.net/?retryWrites=true&w=majority"
//-----------------------------------------
//Hämta poster från databasen
connection.connect(function (err) {
    if (err) throw err;
    connection.query("SELECT * FROM chats;", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
});

app.get("/chats", (req, res) => {
    connection.query("SELECT * FROM chats", (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });   

//tar bort meddelande ur databasen
app.delete('/meddelanden/:chat_id', (req, res) => {
    console.log(req.params); // Logga ut hela objektet
    const messageId = req.params.chat_id;
    const sql = "DELETE FROM chats WHERE chat_id = ?";
    console.log(messageId)
    connection.query(sql, [messageId], function (err, result) {
      if (err) throw err;
      console.log("Ett meddelande togs bort");
      res.sendStatus(200);
    });
  });


//Lägger till en ny post i databasen
app.post("/meddelanden", (req, res) => {
    let sql = "INSERT INTO chats (namn, meddelande) VALUES (?, ?)";
    let values = [req.body.name, req.body.message];
    connection.query(sql, values, function (err, result) {
        if (err) throw err;
        console.log("Ett meddelande lades till");

        // Hämta det nya meddelandet från databasen och skicka tillbaka det som respons
        connection.query("SELECT * FROM chats WHERE chat_id = ?", [result.insertId], function (err, rows) {
            if (err) throw err;
            io.emit("message", rows[0]);
            res.status(200).json(rows[0]);
        });
    });
});


io.on("connection", (socket) => {
    console.log("Någon anslot till sidan")
})

//ansluter till chats databasen SQL
connection.connect(function (err) {
    if (err) throw err;
    console.log("Ansluten");
})

//Vi startar vår webbserverapp. När en dator
//kommunicerar sker detta vi så kallade portar.
//Vi andger att vår server skall kommunicerar på
//port 3000.
http.listen(3000, () => {
    console.log("Servern körs, besök http://localhost:3000");
});
