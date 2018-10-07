import { Server } from "colyseus";
import { createServer } from "http";
import * as express from 'express';

import {TTTRoom} from './TTTRoom';

const port = Number(process.env.PORT || 2567);
const app = express();
const gameServer = new Server({
  server: createServer(app)
});

app.use(express.static('client'));

app.get('/tictactoe', function(req, res) {
  res.sendFile('client/tic-tac-toe.html', {root: __dirname })
});


gameServer.register('tic_tac_toe', TTTRoom).
    on('create', (room) => console.log(`room created: ${ room.roomId }`));

gameServer.onShutdown(function(){
  console.log(`game server is going down.`);
});

gameServer.listen(port);
console.log(`Listening on http://localhost:${ port }`);