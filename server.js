const express = require("express");
const app = express();
const http = require("http");
const socket = require("socket.io");
const mongoose = require("mongoose");
const User = require("./Models/Users");
const Room = require("./Models/Rooms");
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);
const io = socket(server);

app.use(express.static("public"));
app.use(express.json());


//connect to mongo here
mongoose.connect("<your mongodb uri",
{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false } );
mongoose.connection.once("open",() => {
    console.log("Actual database connected");
}).on("error",() => {
    console.log("Database connection issue");
});

roomremover = () => {
    Room.deleteMany({player1: "", player2: ""})
    .then((result) => {})
    .catch(err => {
        console.log();
    }); 
}

io.on("connection",(socket) => {

    socket.on("createroom",(data) => {
        var newroom = new Room({
            roomname: data.room,
            player1username: data.username,
            player1: socket.id
        });
        newroom.save().then(() => {
            io.to(data.room).emit("player1",{username: data.username,room: data.room});
            socket.emit("msg",{
                access: 0,
                msg: "room created",
                room: data.room,
                startingplayer: 1,
                areyouplayer1: 1,
                player1token: 1
            });
        }).catch((err) => {
            console.log(err);
        });
        socket.join(data.room);
    });

    socket.on("joinroom",(data) => {
        var roomusers = io.sockets.adapter.rooms[data.room];
        if(roomusers.length == 1){
            socket.join(data.room);
            Room.findOneAndUpdate({roomname: data.room},{player2username: data.username, player2: socket.id},{new:true})
            .then((result) => {
                io.to(result.roomname).emit("msg",{
                    access: 1,
                    msg: "room joined",
                    startgame: 1,
                    player1username: result.player1username,
                    player2username: result.player2username,
                    room: result.roomname
                });
                socket.emit("anothermsg",{ startingplayer: 0,areyouplayer2: 1, player2token: 0});
            })
            .catch(err => {
                console.log(err);
            });
        }
        else{
            socket.emit("msg",{access: -1,msg: "room full"});
        }
    });

    socket.on("startmsg",(data) => {
        Room.findOne({roomname: data.room}).then((result) => {
            sum = result.startcounter + data.startgamecounter;
            Room.findOneAndUpdate({roomname: data.room},{startcounter: sum},{new:true})
            .then((result) => {
                io.to(data.room).emit("resstart",{
                    startgamecounter: result.startcounter,
                    player1: result.player1username,
                    player2: result.player2username,
                    player1score: result.player1score,
                    player2score: result.player2score
                });
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    });

    socket.on("dis",(data) => {
        if(data.logout){
            Room.findOne({player1: socket.id}).then((result) => {
                if(result != null){
                    io.to(result.roomname).emit("res",{
                        logout: 1,
                        id: socket.id,
                        user: result.player1username
                    });
                }
            });
            Room.findOne({player2: socket.id}).then((result) => {
                if(result != null){
                    io.to(result.roomname).emit("res",{
                        logout: 1,
                        id: socket.id,
                        user: result.player2username
                    });
                }
            });
        }
    });

    socket.on("send",(data) => {
        io.to(data.room).emit("receive",{
            value: data.value,
            array: data.array,
            player1token: data.player1token,
            player2token: data.player2token
        });
    });

    socket.on("sendscore",data => {
        Room.findOne({roomname: data.room}).then((result) => {
            newplayer1score = result.player1score + parseInt(data.player1score);
            newplayer2score = result.player2score + parseInt(data.player2score);
            Room.findOneAndUpdate({roomname: data.room},{
                player1score: newplayer1score,
                player2score: newplayer2score
            },{new: true}).then((res) => {
                io.to(res.roomname).emit("scoreres",{
                    player1score: res.player1score,
                    player2score: res.player2score
                });
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    });

    socket.on("disconnect",() => {
        Room.findOne({player1: socket.id}).then((result) => {
            if(result != null){
                Room.findOneAndUpdate({player1: socket.id},{player1: ""},{new:true})
                .then((result) => {})
                .catch(err => {
                    console.log("error removing player1");
                });
            }  
            roomremover();
        }).catch(err => {
            console.log(err);
        });
        Room.findOne({player2: socket.id}).then((result) => {
            if(result != null){
                Room.findOneAndUpdate({player2: socket.id},{player2: ""},{new:true})
                .then((result) => {})
                .catch(err => {
                    console.log("error removing player2");
                });
            }
            roomremover();
        }).catch(err => {
            console.log(err);
        });   
    });
});

app.post("/login",(req,res) => {
    User.findOne({username: req.body.username}).then((result) => {
        if(result == null){
            res.send({ token: 0,msg: "user not found"});
        }
        else if(result.password != req.body.password){
            res.send({token: 0,msg: "invalid"});
        }
        else{
            Room.findOne({roomname: req.body.room}).then((result) => {
                if(result == null){
                    res.send({token: 1,roomexists: 0});
                }
                else{
                    res.send({token: 1,roomexists: 1});
                }
            }).catch((err) => {
                console.log(err);
            });
        }
    }).catch((err) => {
        console.log(err);
    });
});

app.post("/register",(req,res) => {
    if(req.body.username){
        User.findOne({username: req.body.username}).then((result) => {
            if(result == null){ 
                var user = new User({
                    name: req.body.name,
                    username: req.body.username,
                    password: req.body.password
                });
                user.save().then((obj) => {
                    res.send("registered");
                });
            }
            else{ 
                res.send("already exists");
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`);
});