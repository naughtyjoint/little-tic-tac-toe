export class State {
    constructor(
        public state: number = 0,
        public gameBoard: number[] = [],
        public step: number = 0,
        public order: string[] = ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X'],
        public clientNum: number = 0,
        public countdown: number = 60
    )
    {
      
    };
  }