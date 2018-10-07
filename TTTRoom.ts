import { Room, Client, EntityMap } from "colyseus";
import { TTTState } from "./TTTState";
import { getHeapStatistics } from "v8";

export class TTTRoom extends Room<TTTState> {
    maxClients = 2;


    // When room is initialized
    onInit (options: any) {
        this.setState(new TTTState(this.roomId));
        console.log("JOINING ROOM");

    }

    // Checks if a new client is allowed to join. (default: `return true`)
    requestJoin (options: any, isNew: boolean) {
        if(this.state.state[this.roomId].clientNum >= 2){
            return false;
        }else{
            return true;
        }
    }

    // When client successfully join the room
    onJoin (client: Client, options: any) {
        let role = this.state.addPlayer(client).role;
        console.log(`client (session id : ${client.sessionId} & id : ${client.id}) "${role}" SUCCESS JOINING !`);
        
        this.broadcast({
            type: 'join',
            client_id: client.id,
            msg: `${role} joined.`,
            role: role
        });

        if (this.clients.length == 2) {
            this.broadcast({
                type: 'ready'
            });
            this.state.gameStateChange(1);
            this.clock.clear();
        //     let countDownSec = 21.00;
            let myTimer = setInterval(() => {
                let d = new Date();
                // let startTime = d.getTime() / 1000;
                // this.state.state[ this.roomId ].countdown = (d.getSeconds() + ( d.getMilliseconds() * 0.001 ));
                this.state.state[ this.roomId ].countdown -= .001;
                // this.broadcast({
                //     msg: this.state.state[ this.roomId ].countdown
                // });
                if (this.state.state[ this.roomId ].countdown <= 0) {
                    // gameTimer.clear();
                    clearInterval(myTimer);
                    this.broadcast({
                        msg: `Time's Up!`
                    });
                }
            }, 1);
        }
    }

    // When a client sends a message
    onMessage (client: Client, data: any) {
        let time = this.state.state[ this.roomId ].countdown;
        let state = this.state.state[ this.roomId ];
        let player = this.state.players[ client.sessionId ];
        if (state.state != 1) {
            return null;
        }
        if (data.type == 'tic') {
            if (state.order[state.step] != player.role) {
                return ;
            }
            let result: any = this.state.movePlayer(client, data.num);
            console.log(player);
            switch (result.status) {
                case 0:
                    break;
                
                case 1:
                    this.broadcast({
                        clientId: data.client_id,
                        type: data.type,
                        msg: data.msg,
                        num: data.num,
                        role: player.role,
                        time: time 
                    });
                    break;

                case 2:
                    console.log(player.role + ' wins the game ! Game over !');
                    state.state = 2;
                    this.broadcast({
                        clientId: data.client_id,
                        type: 'win',
                        msg: `${data.client_id} wins the game!`,
                        num: data.num,
                        role: player.role,
                        result: result.result
                    });
                    break;
                
                case 3:
                    console.log(`No winner , game over !`)
                    state.state = 2;
                    this.broadcast({
                        clientId: data.client_id,
                        type: 'tie',
                        msg: `It's a tie game ! Try again`,
                        num: data.num,
                    });
                    break;
            }
        }
    }

    // When a client leaves the room
    onLeave (client: Client, consented: boolean) {
        this.state.removePlayer(client);
        this.state.state[ this.roomId ].clientNum -= 1;
        this.state.state[ this.roomId ].gameBoard = [];
        this.state.state[ this.roomId ].step = 0;
        this.state.state[ this.roomId ].countdown = 60;
        console.log(client.id + ' left.');
        this.broadcast(`${ client.id } left.`);
        this.clock.stop();
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () {
        console.log("Dispose BasicRoom");
    }
}