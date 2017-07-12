export enum PlayerRole {
  Blue,
  Red
}

export class Player {
    cards: number[] = [];
    ready = false;
    stopped = false;
    constructor(public role: PlayerRole) {
    }
    /**
     * 初始化
     */
    reset(): void {
        this.cards.length = 0;
        this.stopped = this.ready = false;
    }
    /**
     * 抽一张牌
     * @param card 抽取的牌
     */
    draw(card: number): void {
        this.cards.push(card);
    }
    /**
     * 计算得分
     */
    getScore(): number {
        let sum = this.cards.reduce((prev, cur) => prev + cur, 0);
        if (sum > 21) sum = 21 - sum;
        return sum;
    }
}
