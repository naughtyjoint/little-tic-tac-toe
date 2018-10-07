function tictac(num) {
    numMap = {
        one: 1, two: 2, three: 3,
        four: 4, five: 5, six: 6,
        seven: 7, eight: 8, nine: 9
    }
    room.send({
        client_id: client.id,
        type: `tic`,
        msg: `tic tac from ${client.id}`,
        num: numMap[num],
    })
}