import { EntityMap } from "colyseus";
import { Player } from "./Player";
import { State } from "./State";

export class TTTState {

    constructor(public roomId: string){
        this.state[ this.roomId ] = new State();
    };

    state: EntityMap<State> = {};
    players: EntityMap<Player> = {};
    possibleWins: Array[] = [
        [1, 2, 3], [4, 5, 6], [7, 8, 9],
        [1, 4, 7], [2, 5, 8], [3, 6, 9],
        [1, 5, 9], [3, 5, 7]
    ];
    
    gameStateChange (state: number) {
        this.state[ this.roomId ].state = state;
    }

    addPlayer (client) {
        if (this.state[ this.roomId ].clientNum == 0) {
            this.players[ client.sessionId ] = new Player('X',[]);
        } else {
            let playersNow: Player;
            for (let x in this.players) {
                playersNow = this.players[x];
            }
            if (playersNow.role === 'X') {
                this.players[ client.sessionId ] = new Player('O',[]);
            } else {
                this.players[ client.sessionId ] = new Player('X',[]);
            }
        }
        this.resetPlayer();
        this.state[ this.roomId ].clientNum ++; 
        let clientInfo = this.players [client.sessionId];
        return {
            role: clientInfo.role
        }
    }

    removePlayer (client) {
        delete this.players[ client.sessionId ];
        this.gameStateChange(2);
    }

    movePlayer (client, num: number) {
        let playerOccpation = this.players[ client.sessionId ].occpation;
        if (this.state[ this.roomId ].gameBoard.indexOf(num) != -1) {
            console.log(num);
            console.log(this.state[ this.roomId ].gameBoard.indexOf(num));
            return {
                status: 0,
                result: null
            }
        }
        this.state[ this.roomId ].gameBoard.push(num);
        playerOccpation.push(num);
        this.state[ this.roomId ].step ++;
        if (this.state[ this.roomId ].step >= 9) {
            return {
                status: 3,
                result: null
            }
        }
        if (playerOccpation.length >= 3) {
            for (let i = 0; i < this.possibleWins.length; i++) {
                if (this.Superbag(playerOccpation, this.possibleWins[i])) {
                    return {
                        status: 2,
                        result: this.possibleWins[i]
                    }
                }
            }
        }
        return {
            status: 1,
            result: null
        };
    }

    resetPlayer () {
        let playersNow: Player;
            for (let x in this.players) {
                playersNow = this.players[x];
            }
        playersNow.occpation = [];
    }

    Superbag (sup: number[], sub: number[]) {
        sup.sort();
        sub.sort();
        let i, j;
        for (i=0,j=0; i<sup.length && j<sub.length;) {
            if (sup[i] < sub[j]) {
                ++i;
            } else if (sup[i] == sub[j]) {
                ++i; ++j;
            } else {
                // sub[j] not in sup, so sub not subbag
                return false;
            }
        }
        // make sure there are no elements left in sub
        return j == sub.length;
    }
}