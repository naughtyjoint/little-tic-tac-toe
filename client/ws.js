
var host = window.document.location.host.replace(/:.*/, '');

var client = new Colyseus.Client('ws://localhost:2567');
var room = client.join("tic_tac_toe", { id: client.id });
room.onJoin.add(function () {
    document.getElementById('banner').innerHTML = 'Welcome, waiting for your opponent.';
});

// room.onStateChange.addOnce(function(state) {
// console.log("initial room state:", state);
// });

// // new room state
// room.onStateChange.add(function(state) {
// // this signal is triggered on each patch
// });

// // listen to patches coming from the server
room.onMessage.add(function(message) {
    console.log(message);
});

room.onError.add(function(err) {
    console.log("oops, error ocurred:");
    console.log(err);
  });

function tictac() {
    
    num = document.getElementById('num').value;
    console.log(`${num}, tic tac`);

    room.send({
        client_id: client.id,
        msg: `tic tac from ${client.id}`,
        num: num,
    })
}
