import { Room, Client, EntityMap } from "colyseus";

export class TTTRoom extends Room {
    maxClients = 2;


    // When room is initialized
    onInit (options: any) {
        this.setState({
            players: {},
            charge: 1,
        });
        console.log("JOINING ROOM");
    }

    // Checks if a new client is allowed to join. (default: `return true`)
    requestJoin (options: any, isNew: boolean) {
        return true;
    }

    // When client successfully join the room
    onJoin (client: Client, options: any) {
        // let playerOrder = 
        console.log(`client (session id : ${client.sessionId} & id : ${client.id}) SUCCESS JOINING !`);
        this.broadcast({
            client_id: client.id,
            msg: `${ client.id } joined.`,
        });

        this.state.players[ client.sessionId ] = {
            id: client.id,
            result: [],
        };

        if (this.clients.length == 2) {
            this.clock.clear();
            let countDownSec = 21.00;
            let gameTimer = this.clock.setInterval(() => {
                countDownSec-=0.1;
                this.broadcast({
                    msg: countDownSec
                });
                if (countDownSec <= 0) {
                    gameTimer.clear();
                    this.broadcast({
                        msg: `Time's Up!`
                    });
                }
            }, 100);
        }
    }

    // When a client sends a message
    onMessage (client: Client, data: any) {
        this.state.players
        console.log(client.id + ' sent a message : ' + data.msg);
        this.broadcast({
            msg: `(${ client.id }) ${ data.msg }`,
            num: data.num
        });
    }

    // When a client leaves the room
    onLeave (client: Client, consented: boolean) {
        delete this.state.players[ client.sessionId ];
        console.log(client.id + ' left.');
        this.broadcast(`${ client.id } left.`);
        this.clock.stop();
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () {
        console.log("Dispose BasicRoom");
    }
}