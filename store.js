let cards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
let blueCards = []
let redCards = []
let currentIndex = 0
let playersCounter = 0
let blueStop = false
let redStop = false

function shuffle (array) {
  let size = array.length
  let temp, index
  while (size) {
    index = Math.floor(Math.random() * size--)
    temp = array[size]
    array[size] = array[index]
    array[index] = temp
  }
  return array
}

function init () {
  shuffle(cards)
  blueCards.length = 0
  redCards.length = 0
  currentIndex = 0
  blueStop = redStop = false
  getACard('blue')
  getACard('blue')
  getACard('red')
  getACard('red')
}

/**
 * 某方抽卡
 * @param {String} player
 * @return {Number}
 */
function getACard (player) {
  let card = cards[currentIndex++]
  if (player === 'blue') {
    blueCards.push(card)
  } else {
    redCards.push(card)
  }
  return card
}

/**
 * 某方停止抽卡
 * @param {String} player
 */
function stopGettingCard (player) {
  if (player === 'blue') {
    blueStop = true
  } else {
    redStop = true
  }
  if (blueStop && redStop) {
    return judge()
  } else {
    return 'playing'
  }
}

/**
 * 得到某个玩家的分数
 * @param {Number[]} playerCards
 * @return {Number}
 */
function getScore (playerCards) {
  let sum = playerCards.reduce((prev, cur) => prev + cur, 0)
  if (sum > 21) sum = 21 - sum
  return sum
}

/**
 * 判断游戏结局
 * @return {String}
 */
function judge () {
  let blueScore = getScore(blueCards)
  let redScore = getScore(redCards)
  if (blueScore > redScore) return 'blue'
  else if (blueScore < redScore) return 'red'
  else return 'draw'
}

/**
 * 获取下一个玩家
 * @return {String}
 */
function getNextPlayer () {
  if (playersCounter === 0) {
    ++playersCounter
    return 'blue'
  } else if (playersCounter === 1) {
    ++playersCounter
    return 'red'
  } else {
    return 'null'
  }
}

function reset () {
  playersCounter = 0
}

function getPlayers () {
  return playersCounter
}

function hasStopped (player) {
  if (player === 'blue') return blueStop
  return redStop
}

module.exports = {
  blueCards,
  redCards,
  hasStopped,
  getPlayers,
  getNextPlayer,
  getACard,
  stopGettingCard,
  reset,
  init
}
