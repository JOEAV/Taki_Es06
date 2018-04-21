class Player {
    constructor(name) {
        this._name = name;
        this._deck = new window.CardFactory.CardDeck();
        this._score = 0;
        this._moves = 0;
        this._avgMovesTime ={min:0,sec:0,ms:0};
        this.reachLastCard=0;
        this._totalMoves=0;
        this._totalAvgMoveTime={min:0,sec:0,ms:0};

    }

    pad(time){
        let  temp;
        if(time < 10){
            temp = "0" + time;
        }
        else{
            temp = time;
        }
        return temp;
    }

    timeToString(time){
        return this.pad(time.min)+":"+this.pad(time.sec)+":"+this.pad(time.ms);
    }

    playerStatistics()
    {
        let moves=this._moves;
        let avgMovesTime=this.timeToString(this._avgMovesTime);
        let reachLastCard=this.reachLastCard;
        let totalMoves=this._totalMoves;
        let totalAvgMoveTime=this.timeToString(this._totalAvgMoveTime);
        return {moves,avgMovesTime,reachLastCard,totalMoves,totalAvgMoveTime};
    }
    resetPlayer()
    {
        let cards=[];
        while (this._deck.size()>0) {
            cards.push(this._deck.pop())
        }
        this._score = 0;
        this._moves = 0;
        this._avgMovesTime ={min:0,sec:0,ms:0};
        this.reachLastCard=0;
        return cards;
    }

    get score() {
        return this._score;
    }

    set score(num) {
        this._score += num;
    }

    get moves() {
        return this._moves;
    }

    incMoves() {
        this._moves += 1;

    }

    get avgMovesTime() {
        return this._avgMovesTime;

    }

    get totalAvgMoveTime() {
        return this._totalAvgMoveTime;
    }

    get totalMoves() {
        return this._totalMoves;
    }

    updateAvgMovesTime(time) {
        let res = {min: 0, sec: 0, ms: 0};
        let total = this._avgMovesTime.min * 6000 + this._avgMovesTime.sec * 100 + this._avgMovesTime.ms;
        total *= this._moves;
        total += time.min * 6000 + time.sec * 100 + time.ms;

        this.incMoves();
        total /= this._moves;

        res.ms = Math.floor(total) % 100;
        res.sec = Math.floor(total / 100);
        res.min = Math.floor(total / 6000);
        this._avgMovesTime=res;
    }

    updateTotalAvgMoveTime(time) {
        let res = {min: 0, sec: 0, ms: 0};
        let total = this._totalAvgMoveTime.min * 6000 + this._totalAvgMoveTime.sec * 100 + this._totalAvgMoveTime.ms;
        total *= this._totalMoves;
        total += time.min * 6000 + time.sec * 100 + time.ms;
        ++this._totalMoves;
        total /= this._totalMoves;
        res.ms = Math.floor(total) % 100;
        res.sec = Math.floor(total / 100);
        res.min = Math.floor(total / 6000);
        this._totalAvgMoveTime=res;
    }

    addCardToDeck(card) {
        this._deck.add(card);
    }

    withdrawCardFromDeck(card) {
        return this._deck.withdrawCardFromDeck(card);

    }

    howManyCards(){
        return this._deck.size();
    }

    throwCard(card){

        return this._deck.removeCard(card);
    }

    getCardByID(id){
        try
        {
            return this._deck.getCardByID(id);
        }
        catch(error) {
            throw error;
        }
    }
}




//TODO
//how to differentiate between good +2 and bad +2


class Algo extends Player {
    constructor() {

        super('computer');
    }



    worthToThrow(card,active) {
        const rank = card.rank;
        const cardsWithSameRank = this._deck.cardsWithSameRank(card);
        const cardsWithSameColor = this._deck.cardsWithSameColor(card);
        const specialCards = this._deck.specialCards();
        if (active===true && rank === '2plus' && cardsWithSameRank.length === 0) {
            return false;
        }
        else if (specialCards.length === 0) {
            if (cardsWithSameRank.length === 0) {
                if (cardsWithSameColor.length === 0)
                    return false;
            }
        }
        return true;
    }

    swapCards(cardDeck,i,j)
    {
        let temp =  cardDeck[i];
        cardDeck[i]= cardDeck[j];
        cardDeck[j]=temp;
        return cardDeck;
    }

    findCardByIndex(cardDeck,searchedRank,searchedColor=''){
        for(let i =0; i<cardDeck.length;i++){
            if (cardDeck[i].rank === searchedRank && (searchedColor==='' || cardDeck[i].color === searchedColor ))
                return i;

        }
        return -1;

    }

    thereIsTaki(card)
    {
        const takiWithSameColor = this._deck._cardArray.filter( myCard => (myCard.color === card.color && myCard.rank === 'taki'));
        const taki=this._deck.cardsWithSameRank(card);
        return (takiWithSameColor.length > 0 || (taki.length>0 && card.rank==='taki'))
    }



    setFirstCardForThrowTaki(card)
    {
        let cardsToThrow = this._deck.cardsWithSameColor(card);
        let takiIndex = this.findCardByIndex(cardsToThrow,'taki');
        if (takiIndex > 0)
            this.swapCards(cardsToThrow,0,takiIndex);
        else if (takiIndex<0)
        {
            takiIndex=0;
            cardsToThrow = this._deck.cardsWithSameRank(card);
            cardsToThrow = this._deck.cardsWithSameColor(cardsToThrow[takiIndex]);
            takiIndex = this.findCardByIndex(cardsToThrow,'taki');
            if (takiIndex > 0)
                this.swapCards(cardsToThrow,0,takiIndex);
        }
        return cardsToThrow;
    }

    setLastCardForThrowTaki(cardsToThrow)
    {
        let ranks={};
        let color = cardsToThrow[0].color;
        ranks.stop={rank:'stop',num:0,index:0,green:0,blue:0,red:0,yellow:0};
        ranks.plus={rank:'plus',num:0,index:0,green:0,blue:0,red:0,yellow:0};
        ranks['2plus']={rank:'2plus',num:0,index:0,green:0,blue:0,red:0,yellow:0};

        for (let i =1; i<cardsToThrow.length;i++) //check if we  throw good cards
        {
            if (cardsToThrow[i].rank==='stop' || cardsToThrow[i].rank==='2plus' || cardsToThrow[i].rank==='plus') {
                ranks[`${cardsToThrow[i].rank}`].index=i;
                if (this._deck.specialCards().length>0 && cardsToThrow[i].rank!=='2plus')
                {
                    ranks[`${cardsToThrow[i].rank}`].num++;
                }
                if (cardsToThrow[i].rank==='2plus')
                    ranks['2plus'].num+=0.5;
            }
        }

        for (let i =1; i < this._deck.size() ;i++)///sums up good cards with different color
        {
            let card=this._deck.getCardAtIndex(i);
            if (card.color !== color && (card.rank ==='stop' || card.rank ==='plus' || card.rank ==='2plus')){
                ranks[`${card.rank}`].num++;
                ranks[`${card.rank}`][`${card.color}`]=1;
            }
        }

        for (let i =1; i < this._deck.size() ;i++)//check if we can throw another taki?
        {
            let card=this._deck.getCardAtIndex(i);
            if (card.color !== color && (card.rank ==='taki')){
                if (ranks.plus.index>0 && ranks.plus[`$(card.color]}`]===1) {
                    ranks.plus.num += 20;
                }
                if (ranks.stop.index>0 && ranks.stop[`$(card.color]}`]===1) {
                    ranks.stop.num += 20;
                }
            }
        }

        let maxRank=ranks.stop;
        for (let rank in ranks) {
            if (ranks[`${rank}`].index > 0 && ranks[`${rank}`].num > maxRank.num)
                maxRank = ranks[`${rank}`];
        }

        if (maxRank.index>0) {
            if (maxRank.rank==='2plus' || maxRank.num>0)
                this.swapCards(cardsToThrow, cardsToThrow.length - 1, maxRank.index);
            else
            {
                for (let i=1; i<cardsToThrow.length;i++)
                {
                    if (cardsToThrow[i].rank !== 'plus' && cardsToThrow[i].rank !== 'stop')
                    {
                        this.swapCards(cardsToThrow,cardsToThrow.length-1,i);
                        break;
                    }
                }
            }
        }
    }

    throwTaki(card) {
        let cardsToThrow=this.setFirstCardForThrowTaki(card);
        this.setLastCardForThrowTaki(cardsToThrow);
        for (let cardThrow of cardsToThrow)
        {
            this.withdrawCardFromDeck(cardThrow);
        }
        return cardsToThrow;
    }


    throwSameColor(card)
    {
        let cardsToThrow = [];
        let cardsWithSameColor = this._deck.cardsWithSameColor(card);
        for (let i=0; i<cardsWithSameColor.length; i++)
        {
            if  (cardsWithSameColor[i].rank==='stop' || cardsWithSameColor[i].rank==='plus')
            {
                cardsToThrow.push(cardsWithSameColor[i]);
                break;
            }
        }

        if (cardsToThrow.length===0)
        {
            cardsToThrow.push(cardsWithSameColor[0]);
        }

        for (let cardThrow of cardsToThrow)
        {
            this.withdrawCardFromDeck(cardThrow);
        }

        return cardsToThrow;

    }

    throwSameRank(card)
    {
        let cardsToThrow = [];
        let cardsWithSameRank= this._deck.cardsWithSameRank(card);
        cardsToThrow.push(cardsWithSameRank[0]);
        for ( let cardThrow of cardsToThrow)
        {
            if (cardThrow.rank==='changeColor')
            {
                cardThrow.color=this._deck.maxColor();
            }
            this.withdrawCardFromDeck(cardThrow);
        }

        return cardsToThrow;

    }

    throwSpecial()
    {
        let cardsToThrow = [];
        let specialCards= this._deck.specialCards();
        cardsToThrow.push(specialCards[0]);
        for (let card of cardsToThrow)
        {
            if (card.rank==='changeColor')
            {
                card.color=this._deck.maxColor();
            }
            this.withdrawCardFromDeck(card);
        }

        return cardsToThrow;

    }

    throwPlusTwo(topCardInDeck,active)
    {
        if (active===true || this._deck.cardsWithSameRank(topCardInDeck).length>0)
        {
            return this.throwSameRank(topCardInDeck);
        }
        else
            return this.throwSameColor(topCardInDeck);

    }

    play(topCardInDeck,active) {
        let card={};
        card.rank=topCardInDeck.rank;
        card.color=topCardInDeck.color;
        let cardsToThrow = [];
        if (this.worthToThrow(card,active) === true) {
            if (card.rank === '2plus') {
                return this.throwPlusTwo(card,active);
            }

            else if (this.thereIsTaki(card)===true) {
                return this.throwTaki(card);
            }

            else if ( this._deck.cardsWithSameColor(card).length>0) {
                return this.throwSameColor(card);
            }

            else if ( this._deck.cardsWithSameRank(card).length>0) {
                return this.throwSameRank(card);
            }

            else
                return this.throwSpecial()
        }
        return cardsToThrow;
    }


}

window.PlayersFactory = {

    Player:Player,
    Algo:Algo
}
