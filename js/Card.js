
const CARD_COLORS = ['green', 'blue', 'red', 'yellow', 'colorful'];
const CARD_RANKS = ['1', '3', '4', '5', '6', '7', '8', '9', 'taki', 'changeColor', 'stop', 'plus'];
class Card {

    constructor(color, rank,id) {
        if (CARD_COLORS.indexOf(color) === -1) {
            throw new Error('Unrecognized color');
        }

        if (CARD_RANKS.indexOf(rank) === -1) {
            throw new Error('Unrecognized rank');
        }

        this.id=id;
        this._color = color;
        this._rank = rank;
    }

    get color() {
        return this._color;
    }

    set color(color){
        if(CARD_COLORS.indexOf(color)!== -1){
            return this._color=color;
        } else{
            throw new Error ('Color requested is not a legal color !');
        }

    }
    get rank() {
        return this._rank;
    }

    toString(){
        return `${this._color} ${this._rank}`;
    }
}
class CardDeck {

    constructor(isMainDeck) {
        this._cardArray = [];
        if(isMainDeck) {
            this.initDeck();
        }
    }

    initDeck() {
        let n = 0;
        let id =0;
        CARD_COLORS.forEach((color) => {
            CARD_RANKS.forEach((rank) => {
                if ((color != "colorful") && (!isNaN(parseInt(rank)) || rank === 'stop' || rank === 'taki' || rank === 'plus' || rank === '2plus'))
                    n = 2;
                else if (color == "colorful" && rank === "changeColor")
                    n = 4;
                else
                    n = 0;
                for (let i = 0; i < n; i++) {
                    this._cardArray.push(new Card(color, rank,id++));
                }
            });
        })

        this.shuffle();
    }


    /**
     *
     * const seed = Math.floor(Math.random() * this.cardArray.legnth);
     if (remove) {
            return this.cardArray.splice(seed, 1);
        }
     */

    getTopCardValue() {
        return this._cardArray[this._cardArray.length - 1];

    }

    shuffle() {
        this._cardArray = this._cardArray
            .map(card =>{
                if (card.rank==='changeColor') {
                    card.color='colorful';
                }
                return [Math.random(), card];})
            .sort((card, random) => card[0] - random[0])
            .map(card => card[1]);
    }

    removeCard(card)
    {
        let index=this._cardArray.indexOf(card);
        return this.remove(index);
    }

    remove(index) {

        let card =  this._cardArray.splice(index, 1);
        return card[0];
    }

    pop() {
        return this.remove(this._cardArray.length - 1);
    }

    add(card) {
        this._cardArray.push(card);
    }

    withdrawCardFromDeck(card) {
        let cardIndex = this._cardArray.indexOf(card);
        if (cardIndex == -1) {
            throw new Error('no such card in players card deck')
        }
        else {
            return this._cardArray.splice(cardIndex, 1);

        }

    }

    cardsWithSameRank(card) {
        const rank = card.rank;
        return this._cardArray.filter(myCard => myCard.rank === rank);
    }

    cardsWithSameColor(card) {
        const color = card.color;
        return this._cardArray.filter(myCard => myCard.color === color);
    }

    specialCards() {
        return this._cardArray.filter(myCard => myCard.color === "colorful");
    }

    swapCards(i, j) {
        let temp = this._cardArray[i];
        this._cardArray[i] = this._cardArray[j];
        this._cardArray[j] = temp;
    }

    size(){
        return this._cardArray.length;
    }

    getCardAtIndex(index){
        if(index<0 || index>=this._cardArray.length)
        {
            throw new Error("No such index in players deck");
        }
        else{
            return this._cardArray[index];
        }
    }

    getCardByID(id){
        for (let card of this._cardArray)
        {
            if (card.id===id) {
                return card;
            }
        }
    }

    maxColor()
    {
        let colors={};
        colors.green={color:'green',num:0};
        colors.red={color:'red',num:0};
        colors.yellow={color:'yellow',num:0};
        colors.blue={color:'blue',num:0};
        for (let i=0;i<this.size();i++)
        {
            let color=this.getCardAtIndex(i).color;
            if (color!=='colorful') {
                colors[`${color}`].num++;
            }
        }

        let maxColor=colors.green;
        for (let color in colors){
            if (colors[`${color}`].num>maxColor.num)
                maxColor=colors[`${color}`];
        }

        return maxColor.color;

    }
}


window.CardFactory = {
    CARD_COLORS: ['green', 'blue', 'red', 'yellow', 'colorful'],

    CARD_RANKS: ['1', '3', '4', '5', '6', '7', '8', '9', 'taki', 'changeColor', 'stop', 'plus', '2plus'],

    Card: Card ,
    CardDeck: CardDeck

}
