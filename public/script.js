window.onload = function(){
const player1 = document.getElementById("player1");
const top = document.getElementById("top");
const gameresult = document.getElementById("gameresult");
const topyou = document.getElementById("topyou");
const topmsg = document.getElementById("topmsg");
const topopp = document.getElementById("topopp");
const message = document.getElementById("message");
const messagediv = document.getElementById("messagediv");
const button = document.getElementById("button");
const buttondiv = document.getElementById("buttondiv");
const player2 = document.getElementById("player2");
const container = document.getElementById("container");
const container3 = document.getElementById("container3");
const container2 = document.getElementById("container2");
const loginusername = document.getElementById("loginusername");
const loginpassword = document.getElementById("loginpassword");
const loginroom = document.getElementById("loginroom");
const registername = document.getElementById("registername");
const registerusername = document.getElementById("registerusername");
const registerpassword = document.getElementById("registerpassword");
const registerform = document.getElementById("registerform");
const loginform = document.getElementById("loginform");
const title = document.getElementById("title");
const logout = document.getElementById("logout");
const gamebody = document.getElementById("gamebody");
const gamecontainer = document.getElementById("gamecontainer");
const cell = document.querySelectorAll(".cell");
var socket = io.connect("http://localhost:8000",{"sync disconnect on unload":true});
let x = title.innerText;
var startingplayer = 0;
var player1token,player2token = 0;
var id;
var player1name,player2name = "";
var areyouplayer1,areyouplayer2 = 0;
var localroomname = "";
var insidevalue = -1;
var loc = [0,1,2,3,4,5,6,7,8];
var saved = [];
const winningarray = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];

socketfunction = (socket,roomexists,username,room) => {
    if(!roomexists){
        socket.emit("createroom",{
            username: username,
            room: room 
        });
    }
    else{
        socket.emit("joinroom",{
            username: username,
            room: room
        });
    }
    socket.on("msg",(data) => {
        if(data.access == -1){
            title.innerText = data.msg;
            setTimeout(() => {
                title.innerText = x;
            },3000);
        }
        else if(data.access == 0){
            title.innerText = data.msg;
            localroomname = data.room;
            startingplayer = data.startingplayer;
            areyouplayer1 = data.areyouplayer1;
            player1token = data.player1token;
            setTimeout(() => {
                container.classList.add("none");
                container2.classList.remove("none");
                title.innerText = x;
            },1000);
        }
        else{
            title.innerText = data.msg;
            localroomname = data.room;
            setTimeout(() => {
                container.classList.add("none");
                container2.classList.remove("none");
                if(data.startgame){
                    messagediv.classList.add("none");
                    buttondiv.classList.remove("none");
                    player1.innerText = `${data.player1username} online`;
                    player2.innerText = `${data.player2username} online`;
                }
                title.innerText = x;
            },1000);
        }
    });
    socket.on("player1",(data) => {
        player1.innerText = `${data.username} online`;
        message.innerText = `waiting for other player in "${data.room}"`;
    });

    loginroom.value = "";
    loginusername.value = "";
    loginpassword.value = "";
}

socket.on("anothermsg",(data) => {
    startingplayer = data.startingplayer;
    player2token = data.player2token;
    areyouplayer2 = data.areyouplayer2;
});

socket.on("resstart",(data) => {
    topyou.innerText = `${data.player1}: ${data.player1score}`;
    player1name = data.player1;
    topopp.innerText = `${data.player2}: ${data.player2score}`;
    player2name = data.player2;
    if(data.startgamecounter != 2){
        gamecontainer.classList.add("noaccess");
        gamebody.classList.add("none");
        logout.classList.add("none");
        topmsg.innerText = "waiting";
        for(var i=0;i<cell.length;i++){
            cell[i].children[0].innerText = `${i}`;
            cell[i].classList.remove("opacity");
        }
        clickcell = (celldiv) => {
        }
    }
    else{
        gamecontainer.classList.remove("noaccess");
        gamebody.classList.remove("none");
        logout.classList.remove("none");
        topmsg.innerText = "";
        for(var i=0;i<cell.length;i++){
            cell[i].children[0].innerText = `${i}`;
            cell[i].classList.remove("opacity");
        }
        gameplay(socket,startingplayer,insidevalue,loc,player1token,player2token);
    }
});

socket.on("res",(data) => {
    if(data.logout){
        player1.innerText = "";
        player2.innerText = "";
        message.innerText = "";
        player1name,player2name = "";
        container2.classList.add("none");
        messagediv.classList.remove("none");
        buttondiv.classList.add("none");
        socket.disconnect();
        localroomname = "";
        startingplayer = 0;
        saved = [];
        player1token,player2token = 0;
        player1name,player2name = "";
        insidevalue = -1;
        loc = [0,1,2,3,4,5,6,7,8];
        for(var i=0;i<9;i++){
            cell[i].children[0].innerText = `${i}`;
            cell[i].classList.remove("opacity");
            cell[i].classList.remove("littleopacity");
        }
        topyou.classList.remove("topyou");
        topopp.classList.remove("topyou");
        if(id != data.id){
            gamebody.classList.add("none");
            top.style.opacity = 0;
            setTimeout(() => {
                gameresult.innerHTML = `<p>${data.user} has left`;
                gameresult.style.opacity = 1;
            },500);
            setTimeout(() => {
                gameresult.style.opacity = 0;
                socket.connect();
            }, 1500);
            setTimeout(() => {
                top.style.opacity = 1;
                container3.classList.add("none");
                container.classList.remove("none");
            },2000);
        }
        else{
            container3.classList.add("none");
            container.classList.remove("none"); 
            socket.connect();
        }
    }
});

registerform.addEventListener("submit",(e) => {
    e.preventDefault();
    axios.post("/register",{
            name: registername.value,
            username: registerusername.value,
            password: registerpassword.value
        })
        .then((res) => {
            console.log(res.data);
            let x = title.innerText;
            title.innerText = res.data;
            setTimeout(() => {
                title.innerText = x;
            }, 3000);
        }).catch(err => {
            console.log(err);
    });
    registername.value = "";
    registerusername.value = "";
    registerpassword.value = "";
});

loginform.addEventListener("submit",(e) => {
    e.preventDefault();
    axios.post("/login",{
            username: loginusername.value,
            password: loginpassword.value,
            room: loginroom.value
        })
        .then((res) => {
            title.innerText = res.data.msg;
            if(res.data.token == 0){
                setTimeout(() => {
                    title.innerText = x;
                }, 3000);
            }
            else{
                socketfunction(socket,res.data.roomexists,loginusername.value,loginroom.value);
            }
        }).catch(err => {
            console.log(err);
    });
});

button.addEventListener("click",() => {
    container2.classList.add("none");
    container3.classList.remove("none");
    socket.emit("startmsg",{room: localroomname,startgamecounter: 1});
});

logout.addEventListener("click",() => {
    socket.emit("dis",{logout: 1});
    id = socket.id;
});

window.onunload = function(){
    socket.emit("dis",{logout: 1});
    id = socket.id;
}

socket.on("scoreres",data => {
    topyou.innerText = `${player1name}: ${parseInt(data.player1score)}`;
    topopp.innerText = `${player2name}: ${parseInt(data.player2score)}`;
});

socket.on("receive",(data) => {
    loc = data.array;
    insidevalue = parseInt(data.value);
    player1token = data.player1token;
    player2token = data.player2token;
    gameplay(socket,startingplayer,insidevalue,loc,player1token,player2token);
});

callthis = (st,array,a,play1,play2) => {
    startingplayer = st;
    console.log(`starting value for sending ${startingplayer}`);
    loc = array;
    insidevalue = a;
    player1token = play1;
    player2token = play2;
    console.log(`insidevalue ${insidevalue}`);
    console.log(`loc ${loc}`);
    console.log(`player1token ${player1token}`);
    console.log(`player2token ${player2token}`);
    gameplay(socket,startingplayer,insidevalue,loc,player1token,player2token);
}


gameplay = (socket,startingplayer,insidevalue,loc,player1token,player2token) => {

    check = () => {
        for(var i=0;i<winningarray.length;i++){
            if(cell[winningarray[i][0]].children[0].innerText == "X" && cell[winningarray[i][1]].children[0].innerText == "X" && cell[winningarray[i][2]].children[0].innerText == "X"){
                saved = winningarray[i];
                return 1;
            }
            if(cell[winningarray[i][0]].children[0].innerText == "O" && cell[winningarray[i][1]].children[0].innerText == "O" && cell[winningarray[i][2]].children[0].innerText == "O"){
                saved = winningarray[i];
                return 2;
            }
        }
        if(loc.length == 0){
            return -1;
        }
    }

    clickfunc = (a,player1token,player2token) => {
        if(player1token){ 
            loc.splice(loc.indexOf(parseInt(a)),1);
            if(check() == -1 && loc.length == 0){
                noonewins();
            }
            socket.emit("send",{
                room: localroomname,
                value: a,
                array: loc,
                player1token: 0,
                player2token: 1
            });
        }
        if(player2token){
            loc.splice(loc.indexOf(parseInt(a)),1);
            if(check() == -1 && loc.length == 0){
                noonewins();
            }
            socket.emit("send",{
                room: localroomname,
                value: a,
                array: loc,
                player1token: 1,
                player2token: 0
            });
        }
    }

    if(startingplayer){
        if(player1token){
            if(areyouplayer1){
                topyou.classList.add("topyou");
                topopp.classList.remove("topyou");
                topmsg.innerText = "your turn";
            }
            if(areyouplayer2){
                topyou.classList.remove("topyou");
                topopp.classList.add("topyou");
                topmsg.innerText = "your turn";
            }
            gamebody.classList.remove("none");
            if(insidevalue > -1){
                if(startingplayer){
                    cell[insidevalue].children[0].innerText = "O";
                }
                else{
                    cell[insidevalue].children[0].innerText = "X";
                }
                cell[insidevalue].classList.add("opacity");
            }
            if(check() == 1 || check() == 2){
                if(check() == 1){
                    console.log("X wins");
                    xwin();
                }
                else{
                    console.log("O wins");
                    owin();
                }
            }
            else{
                clickcell = (celldiv) => {
                    if(celldiv.children[0].innerText == "X" || celldiv.children[0].innerText == "O"){
                    }
                    else{
                        insidevalue = celldiv.children[0].innerText;
                        celldiv.children[0].innerText = "X";
                        celldiv.classList.add("opacity");
                        if(check() == 1 || check() == 2){
                            if(check() == 1){
                                console.log("X wins");
                                xwin();
                            }
                            else{
                                console.log("O wins");
                                owin();
                            }
                        }
                        clickfunc(insidevalue,player1token,player2token);
                    }
                }
                if(check() == -1 && loc.length == 0){
                    noonewins();
                }
            }          
        }
        else{
            clickcell = (celldiv) => {}
            if(areyouplayer1){
                topyou.classList.remove("topyou");
                topopp.classList.add("topyou");
                topmsg.innerText = "waiting for your turn";
            }
            if(areyouplayer2){
                topyou.classList.add("topyou");
                topopp.classList.remove("topyou");
                topmsg.innerText = "waiting for your turn";
            }
            gamebody.classList.add("none");
        }  
    }
    else{
        if(player2token){
            if(areyouplayer2){
                topopp.classList.add("topyou");
                topyou.classList.remove("topyou");
                topmsg.innerText = "your turn";
            }
            if(areyouplayer1){
                topopp.classList.remove("topyou");
                topyou.classList.add("topyou");
                topmsg.innerText = "your turn";
            }
            gamebody.classList.remove("none");
            if(insidevalue > -1){
                if(startingplayer){
                    cell[insidevalue].children[0].innerText = "O";
                }
                else{
                    cell[insidevalue].children[0].innerText = "X";
                }
                cell[insidevalue].classList.add("opacity");
            }
            if(check() == 1 || check() == 2){
                if(check() == 1){
                    console.log("X wins");
                    xwin();
                }
                else{
                    console.log("O wins");
                    owin();
                }
            }
            else{
                clickcell = (celldiv) => {
                    if(celldiv.children[0].innerText == "X" || celldiv.children[0].innerText == "O"){}
                    else{
                        insidevalue = celldiv.children[0].innerText;
                        celldiv.children[0].innerText = "O";
                        celldiv.classList.add("opacity");
                        if(check() == 1 || check() == 2){
                            if(check() == 1){
                                console.log("X wins");
                                xwin();
                            }
                            else{
                                console.log("O wins");
                                owin();
                            }
                        }
                        clickfunc(insidevalue,player1token,player2token);
                    }
                }
                if(check() == -1 && loc.length == 0){
                    noonewins();
                }
            }
        }
        else{
            gamebody.classList.add("none");
            clickcell = (celldiv) => {}
            if(areyouplayer2){
                topopp.classList.remove("topyou");
                topyou.classList.add("topyou");
                topmsg.innerText = "waiting for your turn";
            }
            if(areyouplayer1){
                topopp.classList.add("topyou");
                topyou.classList.remove("topyou");
                topmsg.innerText = "waiting for your turn";
            }
        }
    }

    xwin = () => {
        gamebody.classList.add("none");
        topyou.classList.remove("topyou");
        topopp.classList.remove("topyou");
        for(var i=0;i<9;i++){
            if(i != saved[0] && i != saved[1] && i != saved[2]){
                if(cell[i].children[0].innerText == "X" || cell[i].children[0].innerText == "O"){
                    cell[i].classList.remove("opacity");
                    cell[i].classList.add("littleopacity");
                }
            }
        }
        if(startingplayer){
            top.style.opacity = 0;
            setTimeout(() => {
                gameresult.classList.add("win");
                gameresult.innerHTML = "<p>you won</p>";
                gameresult.style.opacity = 1;
            },500);
            setTimeout(() => {
                gameresult.style.opacity = 0;
                gameresult.classList.remove("win");
            },3000);
            setTimeout(() => {
                top.style.opacity = 1;
            },3500);
            if(areyouplayer1){
                socket.emit("sendscore",{
                    room: localroomname,
                    player1score: 1,
                    player2score: 0
                });
            }
            if(areyouplayer2){
                socket.emit("sendscore",{
                    room: localroomname,
                    player1score: 0,
                    player2score: 1
                });
            }
        }
        else{
            top.style.opacity = 0;
            setTimeout(() => {
                gameresult.classList.add("lose");
                gameresult.innerHTML = "<p>you lose</p>";
                gameresult.style.opacity = 1;
            },500);
            setTimeout(() => {
                gameresult.style.opacity = 0;
                gameresult.classList.remove("lose");
            },3000);
            setTimeout(() => {
                top.style.opacity = 1;
            },3500);
        }
        setTimeout(() => {
            loc = [0,1,2,3,4,5,6,7,8];
            insidevalue = -1;
            saved = [];
            player1token = 1;
            player2token = 0;
            if(startingplayer){
                callthis(0,loc,insidevalue,player1token,player2token);
            }
            else{
                callthis(1,loc,insidevalue,player1token,player2token);
            }
        },2000);
        setTimeout(() => {
            gamebody.classList.add("none");
            for(var i=0;i<9;i++){
                cell[i].classList.remove("opacity");
                cell[i].classList.remove("littleopacity");
            }
            for(var i=0;i<9;i++){
                cell[i].children[0].innerText = `${i}`;
            }
        },3500);
    }
    owin = () => {
        gamebody.classList.add("none");
        topyou.classList.remove("topyou");
        topopp.classList.remove("topyou");
        for(var i=0;i<9;i++){
            if(i != saved[0] && i != saved[1] && i != saved[2]){
                if(cell[i].children[0].innerText == "X" || cell[i].children[0].innerText == "O"){
                    cell[i].classList.remove("opacity");
                    cell[i].classList.add("littleopacity");
                }
            }
        }
        if(startingplayer){
            top.style.opacity = 0;
            setTimeout(() => {
                gameresult.classList.add("lose");
                gameresult.innerHTML = "<p>you lose</p>";
                gameresult.style.opacity = 1;
            },500);
            setTimeout(() => {
                gameresult.style.opacity = 0;
                gameresult.classList.remove("lose");
            },3000);
            setTimeout(() => {
                top.style.opacity = 1;
            },3500);
            if(areyouplayer1){
                socket.emit("sendscore",{
                    room: localroomname,
                    player1score: 0,
                    player2score: 1
                });
            }
            if(areyouplayer2){
                socket.emit("sendscore",{
                    room: localroomname,
                    player1score: 1,
                    player2score: 0
                });
            } 
        }
        else{
            top.style.opacity = 0;
            setTimeout(() => {
                gameresult.classList.add("win");
                gameresult.innerHTML = "<p>you win</p>";
                gameresult.style.opacity = 1;
            },500);
            setTimeout(() => {
                gameresult.style.opacity = 0;
                gameresult.classList.remove("win");
            },3000);
            setTimeout(() => {
                top.style.opacity = 1;
            },3500);
        }
        setTimeout(() => {
            loc = [0,1,2,3,4,5,6,7,8];
            insidevalue = -1;
            player1token = 1;
            player2token = 0;
            saved = [];
            if(startingplayer){
                callthis(0,loc,insidevalue,player1token,player2token);
            }
            else{
                callthis(1,loc,insidevalue,player1token,player2token);
            }
        },2000);
        setTimeout(() => {
            gamebody.classList.add("none");
            for(var i=0;i<9;i++){
                cell[i].classList.remove("opacity");
                cell[i].classList.remove("littleopacity");
            }
            for(var i=0;i<9;i++){
                cell[i].children[0].innerText = `${i}`;
            }
        },3500);
    }
    noonewins = () => {
        gamebody.classList.add("none");
        topyou.classList.remove("topyou");
        topopp.classList.remove("topyou");
        for(var i = 0;i<9;i++){
            cell[i].classList.remove("opacity");
            cell[i].classList.add("littleopacity");
        }
        top.style.opacity = 0;
        setTimeout(() => {
            gameresult.classList.add("draw");
            gameresult.innerHTML = "<p>it's a draw</p>";
            gameresult.style.opacity = 1;
        },500);
        setTimeout(() => {
            gameresult.style.opacity = 0;
            gameresult.classList.remove("draw");
        },3000);
        setTimeout(() => {
            top.style.opacity = 1;
        },3500);
        setTimeout(() => {
            loc = [0,1,2,3,4,5,6,7,8];
            insidevalue = -1;
            player1token = 1;
            player2token = 0;
            saved = [];
            if(startingplayer){
                callthis(0,loc,insidevalue,player1token,player2token);
            }
            else{
                callthis(1,loc,insidevalue,player1token,player2token);
            }
        },2000); 
        setTimeout(() => {
            gamebody.classList.add("none");
            for(var i=0;i<9;i++){
                cell[i].classList.remove("opacity");
                cell[i].classList.remove("littleopacity");
            }
            for(var i=0;i<9;i++){
                cell[i].children[0].innerText = `${i}`;
            }
        },3500);
    }
}




}