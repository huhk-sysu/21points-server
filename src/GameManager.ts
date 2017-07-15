import { Player, PlayerRole } from "./Player";

export class GameManager {
    cards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    players: Player[];
    currentPlayer: number;
    currentIndex: number;
    get currentPlayerName(): string {
        return this.currentPlayer === 0 ? "blue" : "red";
    }
    set currentPlayerName(name: string) {
        this.currentPlayer = name === "blue" ? 0 : 1;
    }
    constructor() {
        this.players = [];
        this.players[0] = new Player(PlayerRole.Blue);
        this.players[1] = new Player(PlayerRole.Red);
        this.restart();
    }
    /**
     * 初始化
     */
    restart(): void {
        this.currentPlayer = 0;
        this.currentIndex = 0;
        this.players[0].reset();
        this.players[1].reset();
        this.shuffle();
        for (let i = 0; i < 4; ++i)
            this.draw();
    }
    /**
     * 使牌乱序
     */
    shuffle(): void {
        let size = this.cards.length;
        let temp, index;
        while (size) {
            index = Math.floor(Math.random() * size--);
            temp = this.cards[size];
            this.cards[size] = this.cards[index];
            this.cards[index] = temp;
        }
    }
    /**
     * 某方抽牌
     */
    draw(): void {
        const card = this.cards[this.currentIndex++];
        this.players[this.currentPlayer].draw(card);
        if (this.currentPlayer === PlayerRole.Blue) {
            this.currentPlayer = this.players[1].stopped ? PlayerRole.Blue : PlayerRole.Red;
        } else {
            this.currentPlayer = this.players[0].stopped ? PlayerRole.Red : PlayerRole.Blue;
        }
    }
    /**
     * 计算结果
     */
    judge(): string {
        const blueScore = this.players[0].getScore();
        const redScore = this.players[1].getScore();
        if (blueScore > redScore) return "blue";
        else if (blueScore < redScore) return "red";
        else return "draw";
    }
    /**
     * 某方停止
     */
    stop(player: string): void {
        if (player === "blue") {
            this.players[0].stopped = true;
            this.currentPlayerName = "red";
        } else {
            this.players[1].stopped = true;
            this.currentPlayerName = "blue";
        }
    }
}