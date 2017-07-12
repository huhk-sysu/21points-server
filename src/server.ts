import * as http from 'http'
import * as express from 'express';
import * as socketIO from 'socket.io';
import { GameManager } from './GameManager'

let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let gameManager = new GameManager();
let bluePlayer = gameManager.players[0];
let redPlayer = gameManager.players[1];
let blueCards = bluePlayer.cards;
let redCards = redPlayer.cards;

io.on('connection', function (socket) {
  console.log('a new player connected!')
  socket.on('ready', function () {
    if (!bluePlayer.ready) {
      socket.join('blue');
      socket.emit('player', 'blue');
      bluePlayer.ready = true;
    } else if (!redPlayer.ready) {
      socket.join('red');
      socket.emit('player', 'red');
      redPlayer.ready = true;
    } else {
      socket.emit('hasError', { msg: '玩家人数已满！' });
      return;
    }
    if (bluePlayer.ready && redPlayer.ready) {
      console.log('game start!')
      gameManager.reset();
      console.log('blue: ' + blueCards);
      console.log('red: ' + redCards);
      io.to('blue').to('red').emit('updateCards', { blueCards, redCards });
      io.to('blue').to('red').emit('begin');
      io.to('blue').emit('turn');
    }
  })
  socket.on('getCard', function () {
    gameManager.draw();
    console.log('===new round===')
    console.log('blue: ' + blueCards);
    console.log('red: ' + redCards);
    console.log('======')
    io.to('blue').to('red').emit('updateCards', { blueCards, redCards });
    io.to(gameManager.currentPlayerName).emit('turn');
  })
  socket.on('stop', function (player: string) {
    console.log(player + ' stop!');
    socket.leave(player);
    gameManager.stop(player);
    if (bluePlayer.stopped && redPlayer.stopped) {
      const result = gameManager.judge();
      console.log('===result===')
      console.log('blue: ' + blueCards)
      console.log('red: ' + redCards)
      console.log('gameover! result:' + result);
      console.log('======')
      io.emit('finish', { status: result, blueCards, redCards });
      gameManager.reset();
    } else {
      io.to(gameManager.currentPlayerName).emit('turn');
    }
  })
  socket.on('disconnect', function () {
    console.log('some one has disconnected!');
    io.emit('hasError', { msg: '你的对手断开了连接！' });
    gameManager.reset();
  })
})

server.listen(3000, function () {
  console.log('the server is running...');
})
