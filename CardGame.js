const GAME_STATE = {
  FirstCardsAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardMatchFailed',
  CardsMatched: 'CardMatched',
  GameFinished: 'GameFinished'
}


const Symbols = [
  'https://res.cloudinary.com/dqfxgtyoi/image/upload/v1636095891/cardgame/symbol-of-spade_ph6gah.png', // 黑桃
  'https://res.cloudinary.com/dqfxgtyoi/image/upload/v1636095891/cardgame/symbol-of-heart_jifvj5.png', // 愛心
  'https://res.cloudinary.com/dqfxgtyoi/image/upload/v1636095891/cardgame/symbol-of-diamond_zzvz1o.png', // 方塊
  'https://res.cloudinary.com/dqfxgtyoi/image/upload/v1636095891/cardgame/symbol-of-club_ty9tst.png' // 梅花
]

const view = {
  getCardElement(index) { // 生成卡片內容 (花色、數字)
    return `<div data-index="${index}" class="card back"></div>`
  },

  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)// index 除以13的「餘數 + 1」，卡片數字 1 - 13
    const symbol = Symbols[Math.floor(index / 13)]
    return `
        <p>${number}</p>
        <img src="${symbol}">
        <p>${number}</p>
    `
  },

  transformNumber(number) { // A J Q K 轉換
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexes) { // 選出 cards 並抽換內容
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  // flipCards(1, 2, 3, 4, 5)
  // cards = [1, 2, 3, 4, 5]
  flipCards(...cards) {
    cards.map(card => {
      // 回傳正面
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', e => {
        card.classList.remove('wrong')
      },
        {
          once: true
        }
      )
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

// Fisher-Yates Shuffle 洗牌演算法
// 解構賦值
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,
  triedTimes: 0,
}

const controller = {
  currentState: GAME_STATE.FirstCardsAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  // 依照不同的遊戲狀態，做不同行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) { // 挑出非牌背的卡牌
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardsAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)

        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore((model.score += 10))
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardsAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }

    console.log('current state:', this.currentState)
    console.log('revealed cards:', model.revealedCards.map(card => card.dataset.index))
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardsAwaits
  }
}

controller.generateCards()

// Node List
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})
