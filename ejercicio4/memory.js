class Card {
    constructor(name, img) {
        this.name = name;
        this.img = img;
        this.isFlipped = false; // Inicialmente están volteadas
        this.element = this.#createCardElement();
    }

    #createCardElement() {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card', 'flipped'); // Inicialmente están volteadas
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                    <img src="img/${this.img}" alt="${this.name}">
                </div>
            </div>
        `;
        return cardElement;
    }

    toggleFlip() {
        this.isFlipped = !this.isFlipped;
        this.element.classList.toggle('flipped');
    }

    matches(otherCard) {
        return this.name === otherCard.name;
    }
}

class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridElement = document.querySelector(".fixed-grid");
        this.gameBoardElement = document.getElementById("game-board");
    }

    #calculateColumns() {
        return Math.floor(Math.sqrt(this.cards.length));
    }

    #setGridColumns(columns) {
        this.gameBoardElement.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    render() {
        this.gameBoardElement.innerHTML = '';
        this.cards.forEach(card => {
            this.gameBoardElement.appendChild(card.element);
        });
    }

    shuffleCards() {
        this.cards.sort(() => Math.random() - 0.5);
    }

    flipDownAllCards() {
        this.cards.forEach(card => {
            if (card.isFlipped) {
                card.toggleFlip();
            }
        });
    }

    flipUpAllCards() {
        this.cards.forEach(card => {
            if (!card.isFlipped) {
                card.toggleFlip();
            }
        });
    }

    reset() {
        this.shuffleCards();
        this.flipDownAllCards();
        this.#setGridColumns(this.#calculateColumns());
        this.render();
    }

    onCardClicked(callback) {
        this.gameBoardElement.addEventListener('click', (event) => {
            const cardElement = event.target.closest('.card');
            if (!cardElement) return;
            const card = this.cards.find(c => c.element === cardElement);
            callback(card);
        });
    }
}

class MemoryGame {
    constructor(board, flipDuration = 500) {
        this.board = board;
        this.flippedCards = [];
        this.matchedCards = [];
        this.moves = 0;
        this.flipDuration = Math.max(350, Math.min(flipDuration, 3000));
        this.board.onCardClicked(this.#handleCardClick.bind(this));
        this.board.reset();

        document.getElementById('restart-button').addEventListener('click', () => {
            this.resetGame();
        });

        this.showAllCardsTemporarily();
    }

    #handleCardClick(card) {
        if (this.flippedCards.length >= 2 || card.isFlipped || this.matchedCards.includes(card)) {
            return;
        }

        card.toggleFlip();
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.checkForMatch();
        }
    }

    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        if (card1.matches(card2)) {
            this.matchedCards.push(card1, card2);
            this.flippedCards = [];

            if (this.matchedCards.length === this.board.cards.length) {
                setTimeout(() => {
                    alert(`¡Has ganado! Movimientos: ${this.moves}`);
                    this.resetGame();
                }, this.flipDuration);
            }
        } else {
            setTimeout(() => {
                card1.toggleFlip();
                card2.toggleFlip();
                this.flippedCards = [];
            }, this.flipDuration);
        }
    }

    resetGame() {
        this.flippedCards = [];
        this.matchedCards = [];
        this.moves = 0;
        this.board.reset();
        this.showAllCardsTemporarily();
    }

    showAllCardsTemporarily() {
        this.board.flipUpAllCards();
        setTimeout(() => {
            this.board.flipDownAllCards();
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cardImages = ['CSharp.svg', 'Go.svg', 'Java.svg', 'JS.svg', 'Python.svg', 'Ruby.svg'];
    const cards = cardImages.concat(cardImages).map((img, index) => new Card(`card-${index % cardImages.length}`, img));
    const board = new Board(cards);
    new MemoryGame(board);
});
