
const NoWinner=-1;
class GameManager{

    constructor(){
        this.gameDeck = new window.CardFactory.CardDeck(true);
        this.players =  [];
        this.pot = new window.CardFactory.CardDeck();
        this.activePlayer = 0;
        this.players[0] = new Player('player');
        this.players[1] = new Algo();
        this.timerElapsed = new window.StopwatchFactory.Stopwatch();
        this.howMany2Plus=0;
        this.lastTime={ ms :0, sec :0, min : 0};
        this.nowTime={ ms :0, sec :0, min : 0};
        this.animationDelayCounter=0;
        this._isTakiMode=false;
        this._winner=NoWinner;
        this.restarted=false;
    }

    addDroppedCardToPot(droppedCard){

        this.howMany2Plus= droppedCard.rank==='2plus' ? this.howMany2Plus+1 :0;
        this.pot.add(droppedCard);
    }

    set isTakiMode(mode){
        this._isTakiMode=mode;
    }

    get isTakiMode(){
        return this._isTakiMode
    }

    get winner(){
        return this._winner;
    }
    set winner(index){
        this._winner=index;
    }

    flushShuffledPotToGameDeck(){
        let lastCard=this.pot.pop();
        this.pot.shuffle();
        while  (this.pot.size()>0) {

            this.gameDeck.add(this.pot.pop());
        }
        this.pot.add(lastCard);

    }
    totalMoves()
    {
        let res=0;
        for (let i=0; i<this.players.length;i++)
        {
            res+=this.players[i].moves;
        }
        return res;
    }
    checkMoveValidity(droppedCard) {
        if (this.activePlayer===0) {
            let topPotCard = this.pot.getTopCardValue();
            let droppedColor = droppedCard.color;
            let droppedRank = droppedCard.rank;
            if (this.howMany2Plus > 0) {
                return (droppedCard.rank === '2plus');
            }
            if (droppedColor === 'colorful' || droppedColor === topPotCard.color || droppedRank === topPotCard.rank) {
                return true;
            } else {
                return false;
            }
        }
        else
            return false;
    }

    ensureFirstCardNotSpecial()
    {
        let rank=this.gameDeck.getCardAtIndex(gameManager.gameDeck.size()-1).rank;
        if (rank==='taki' || rank==='plus' || rank==='2plus' || rank==='changeColor' || rank==='stop') {
            for (let i = 0; i < this.gameDeck.size(); i++) {
                let rank=this.gameDeck.getCardAtIndex(i).rank;
                if (rank!=='taki' && rank!=='plus' && rank!=='2plus' && rank!=='changeColor' && rank!=='stop') {
                    this.gameDeck.swapCards(i,this.gameDeck.size()-1);
                    break;
                }
            }
        }
    }

    onCardHover(event){
        let target = event.target.id !== "" ? event.target : event.target.parentNode;
        let islegalMove =  this.checkMoveValidity({rank:target.getAttribute('rank'),color:target.getAttribute('color')},'hover');
        if(islegalMove){
            target.classList.add('cardAllowedCue')
        }else{
            target.classList.add('cardNotAllowedCue')

        }
    }

    onCardHoverEnd(event){
        let target = event.target.id !== "" ? event.target : event.target.parentNode;
        target.classList.remove('cardAllowedCue','cardNotAllowedCue')
    }

    timeDiff(){
        let time={ms:0,sec:0,min:0};
        time.ms=this.nowTime.ms;
        time.sec=this.nowTime.sec;
        time.min=this.nowTime.min;
        if (time.sec<this.lastTime.sec)
        {
            time.min--;
            time.sec+=60;
        }
        if (this.nowTime.ms< this.lastTime.ms)
        {
            time.sec--;
            time.ms+=100;
        }
        time.ms=time.ms-this.lastTime.ms;
        time.min=time.min-this.lastTime.min;
        time.sec=time.sec-this.lastTime.sec;
        return time;
    }

    changeTurn(isChangeTurn){
        let cards = [];
        this.nowTime.ms = ms;
        this.nowTime.min = min;
        this.nowTime.sec = sec;
        let time = this.timeDiff();
        this.lastTime.ms = this.nowTime.ms;
        this.lastTime.min = this.nowTime.min;
        this.lastTime.sec = this.nowTime.sec;
        this.players[this.activePlayer].updateAvgMovesTime(time);
        this.players[this.activePlayer].updateTotalAvgMoveTime(time);
        if (this.players[this.activePlayer].howManyCards() === 1)
            this.players[this.activePlayer].reachLastCard++;
        if (isChangeTurn) {
            this.activePlayer = 1 - this.activePlayer;
        }

        if (this.activePlayer === 1 && this._winner===NoWinner) {
            return this.players[1].play(this.pot.getTopCardValue(), this.howMany2Plus > 0);
        }
        else {
            return cards;
        }

    }

    resetPlayersPotAndGameDeck()
    {
        let cards=[];
        this.players.forEach(player=>{
            cards=player.resetPlayer();
            cards.forEach(card=>{
                this.gameDeck.add(card);
            })
        })
        while (this.pot.size()>0){
            this.gameDeck.add(this.pot.pop());
        }
        this.gameDeck.shuffle();
    }

    resetGame()
    {
        this.resetPlayersPotAndGameDeck();
        this.activePlayer = 0;
        this.timerElapsed.stop();
        this.howMany2Plus=0;
        this.lastTime={ ms :0, sec :0, min : 0};
        this.nowTime={ ms :0, sec :0, min : 0};
        this.animationDelayCounter=0;
        this._isTakiMode=false;
        this._winner=NoWinner;
        this.restarted=true;
    }

    gameStatistics()
    {
        this.timerElapsed.stop();
        let statistics={whoWon:NoWinner,totalTime:{min,sec},players:[]};
        statistics.whoWon=this._winner;
        this.players.forEach(player=>{
                            statistics.players.push(player.playerStatistics());})
        console.log(statistics);
        return statistics;
    }



    thereIsAWinner()
    {
        if (this._winner !== NoWinner) {
            return true;
        }
        for (let i=0; i<this.players.length; i++){
            if (this.players[i].howManyCards()===0) {
                this._winner = i;
                return true;
            }
        }
        return false;
    }
}


window.GameManager = GameManager;

