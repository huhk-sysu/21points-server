let app = require('express')()
let server = require('http').Server(app)
let io = require('socket.io')(server)
let store = require('./store')

io.on('connection', function (socket) {
  console.log('a new player connected!')
  socket.on('ready', function () {
    let nextPlayer = store.getNextPlayer()
    if (nextPlayer === 'null') {
      socket.emit('hasError', { msg: '玩家人数已满！' })
    } else {
      console.log(nextPlayer + ' ready!')
      socket.join(nextPlayer)
      socket.emit('player', nextPlayer)
      if (store.getPlayers() === 2) {
        console.log('game start!')
        store.init()
        let {blueCards, redCards} = store
        let blueCards_ = [...blueCards]
        let redCards_ = [...redCards]
        console.log('blue: ' + blueCards)
        console.log('red: ' + redCards)
        blueCards_[0] = 0
        io.to('red').emit('initCards', {blueCards: blueCards_, redCards: redCards_})
        blueCards_[0] = blueCards[0]
        redCards_[0] = 0
        io.to('blue').emit('initCards', {blueCards: blueCards_, redCards: redCards_})
        io.to('blue').emit('turn')
        console.log('init done!')
      }
    }
  })
  socket.on('getCard', function (player) {
    let newCard = store.getACard(player)
    console.log(player + ' get a card: ' + newCard)
    io.emit('newCard', {player, newCard})
    let anotherPlayer = player === 'blue' ? 'red' : 'blue'
    if (store.hasStopped(anotherPlayer)) {
      io.to(player).emit('turn')
    } else {
      io.to(anotherPlayer).emit('turn')
    }
  })
  socket.on('stop', function (player) {
    console.log(player + ' stop!')
    let gameStatus = store.stopGettingCard(player)
    socket.leave('blue')
    socket.leave('red')
    if (gameStatus !== 'playing') {
      console.log('blue: ' + store.blueCards)
      console.log('red: ' + store.redCards)
      console.log('gameover! ' + gameStatus)
      io.emit('finish', {status: gameStatus, blueCards: store.blueCards, redCards: store.redCards})
      store.reset()
    } else {
      let anotherPlayer = player === 'blue' ? 'red' : 'blue'
      io.to(anotherPlayer).emit('turn')
    }
  })
  socket.on('disconnect', function () {
    console.log('some one has disconnected!')
    io.emit('hasError', { msg: '你的对手断开了连接！' })
    store.reset()
  })
})

server.listen(3000, function () {
  console.log('running')
})
