
var host = window.document.location.host.replace(/:.*/, '');

var client = new Colyseus.Client(location.protocol.replace("http", "ws") + host + (location.port ? ':' + location.port : ''));
var room = client.join("tic_tac_toe");
var role = '';
var players = {};

room.onJoin.add(function () {
    document.getElementById('banner').innerHTML = 'Welcome, waiting for your opponent.';
});

// // listen to patches coming from the server
room.onMessage.add(function(message) {
    console.log(message);
    var numMap = [
        'one', 'two', 'three', 
        'four', 'five', 'six', 
        'seven', 'eight', 'nine'
    ];

    if (message.type == 'join') {
        if (!role) {
            role = message.role;
        }
    }
    if (message.type == 'ready') {
        document.getElementById('banner').innerHTML = (role === 'X') 
            ? `Game Starts! You are "${role}", you go first`
            : `Game Starts! You are "${role}"`;
        
        numMap.forEach((value) => {
            document.getElementById(value).innerHTML = "";
        })
    }
    if (message.type == 'tic' || message.type == 'win' || message.type == 'tie') {
        document.getElementById(numMap[message.num - 1]).innerHTML = message.role;
        document.getElementById('banner').innerHTML = `Game Starts! You are "${role}"`;
    }
    if (message.type == 'win') {
        document.getElementById('banner').innerHTML = `Player ${message.role} wins this game!`;
        message.result.forEach((value, index) => {
            document.getElementById(numMap[value - 1]).style.color = 'red';
        });
    }
    if (message.type == 'tie') {
        document.getElementById('banner').innerHTML = message.msg;
    }
});


room.listen("players/:id", (change) => {
    if (change.operation === "add") {
        console.log(change);
        players[change.path.id] = change.value.role;
    } else if (change.operation === "remove") {
        console.log(change);
        document.getElementById('banner').innerHTML = `${players[change.path.id]} left, you won!`;
        delete players[change.path.id];
    } else if (change.operation === "replace") {
        console.log(change);
    }
});

room.listen("state/:id/:attribute", (change) => {
    if (change.operation === "add") {
        console.log(change);
    } else if (change.operation === "remove") {
        console.log(change);
    } else if (change.operation === "replace") {
        console.log(change);
        switch (change.path.attribute) {
            case 'countdown' :
                document.getElementById("timer").innerHTML = change.value;
                break;

            case 'step' :
                document.getElementById('state').innerHTML = 
                (room.state.state[room.id].order[room.state.state[room.id].step] == role)
                ? `It's your turn!` : '';
                break;
        }
    }
});

room.onError.add(function(err) {
    console.log("oops, error ocurred:");
    console.log(err);
  });
