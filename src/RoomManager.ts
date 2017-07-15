import { GameManager } from "./GameManager";

export class RoomManager extends GameManager {
    blueSocket: string;
    redSocket: string;
    leftCounter: number;
    constructor(public name: string) {
        super();
        this.leftCounter = 0;
    }
    get currentPlayerSocket(): string {
        return this.currentPlayerName === "blue" ? this.blueSocket : this.redSocket;
    }
    getplayers() {
        const bluePlayer = this.players[0];
        const redPlayer = this.players[1];
        return { bluePlayer, redPlayer };
    }
    getCards() {
        const { bluePlayer, redPlayer } = this.getplayers();
        return { blueCards: bluePlayer.cards, redCards: redPlayer.cards };
    }
    isBothStop(): boolean {
        const { bluePlayer, redPlayer } = this.getplayers();
        return bluePlayer.stopped && redPlayer.stopped;
    }
    someoneLeave(): void {
        ++this.leftCounter;
        if (this.leftCounter === 2) {
            this.leftCounter = 0;
            this.restart();
        }
    }
}