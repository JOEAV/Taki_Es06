//object instances
let gameManager = new window.GameManager();

//global dom selectors

let potElement = document.getElementsByClassName('pot')[0];
let potContainerElement = document.getElementsByClassName('potContainer')[0];
let playerCardsRow = document.getElementsByClassName('cardsRowPlayer')[0];
let algoCardsRow = document.getElementsByClassName('cardsRowAlgo')[0];
let gameDeckContainer = document.getElementsByClassName('gameDeckContainer')[0];
let gameDeckElem = document.getElementsByClassName('gameDeck')[0];
let turnIndicator = document.getElementsByClassName('turnIndicator')[0];


let initGameDeckUi = () => {
    gameManager.gameDeck.shuffle();
    gameManager.ensureFirstCardNotSpecial();
    initGameDeckUICards();
}

function initGameDeckUICards()
{
    gameManager.gameDeck._cardArray.forEach(function (card) {
        let uiCard = createUiForCard(card);
        gameDeckElem.appendChild(uiCard);
    })
    gameDeckElem.lastChild.classList.add('topCardInGameDeck');
    gameDeckElem.lastChild.addEventListener('click', handlePulledTopCardClick, true);

}


let createUiForCard = (card) => {
    let cardInner = document.createElement('span');
    let cardContainer = document.createElement('span')
    cardInner.classList.add('cardBase');
    cardContainer.classList.add('cardInsideGameDeck');
    cardContainer.style.backgroundImage = `url(./img/card_back.png)`;
    cardContainer.style.backgroundSize = "cover";
    cardContainer.style.backgroundPosition = "center center";
    cardContainer.setAttribute("rank", `${card.rank}`);
    cardContainer.setAttribute("color", `${card.color}`);
    cardContainer.setAttribute("id",`${card.id}`);
   // cardContainer.style.backgroundImage = `url(./img/${card.rank}_${card.color}.png)`;

    cardContainer.classList.add('cardWrapper');
   // cardContainer.id = `${card.rank}_${card.color}_${card.c}`;

    cardContainer.appendChild(cardInner);
    return cardContainer;
}
//Drag start handler

function showVisualDragCue(e) {
    potContainerElement.classList.add("potFadeInAnimation");
    e.dataTransfer.effectAllowed = "copy";
    if (e.target.id === null || e.target.id === "" || e.target.id === undefined) {
        e.dataTransfer.setData("Text", e.target.parentNode.id);
    }
    else {
        e.dataTransfer.setData("Text", e.target.id);
    }
}
//Drag end handler
function removeVisualDragCue(e) {
    potContainerElement.classList.remove("potFadeInAnimation");
}


function allowDrop(e) {
    e.preventDefault();
}

function drop(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    const data = event.dataTransfer.getData("Text");
    const droppedCardElement = document.getElementById(data);
    let droppedCardComp = gameManager.players[0].getCardByID(parseInt(droppedCardElement.getAttribute("id")));
    let isLegalMove = gameManager.checkMoveValidity(droppedCardComp, 'drop');


    if (isLegalMove) {

        gameManager.addDroppedCardToPot(droppedCardComp);
        gameManager.players[0].throwCard(droppedCardComp);
        setDroppedCardCssInPot(droppedCardElement);
        switch(droppedCardComp.rank){
            case 'changeColor':
                raiseColorChangePopup();
                break;
            case 'taki':
                handleTakiCardDropped(droppedCardComp.color);
                break;
            default:
                if(!gameManager.isTakiMode){
                    handleTurnEnd(toChangeTurn(droppedCardComp));
                }
                break;
        }

    }


}

function toChangeTurn(droppedCard){
    return ((droppedCard.rank !== 'stop') && (droppedCard.rank !== 'plus'))
}
function updateStatistics()
{
    let pad = function(time)
    {
        return time<10 ? '0'+time : time.toString()
    };
    let totalMovesUI = document.getElementById('totalMoves');
     let totalMoves = gameManager.totalMoves();
     let activePlayer = gameManager.activePlayer;
     gameFlowAnimationDelay(()=>{totalMovesUI.innerHTML=totalMoves;
             updateTurn(activePlayer);

         },
         null,setPlayerCardBehavior,Array.from(playerCardsRow.childNodes));
     let statistics=gameManager.players[0].playerStatistics();
    let reachLastCard = document.getElementById('reachedLastCard');
    reachLastCard.innerHTML = statistics.reachLastCard;
    let avgMoveTime = document.getElementById('avgMoveTime');
    avgMoveTime.innerHTML= statistics.avgMovesTime;
    if (gameManager.restarted===true){
        let elem = document.getElementById('totalAvgMoveTimeHeader');
        elem.innerHTML='Total avg move time<div class="topBarItemSecondRow" id="totalAvgMoveTime"></div>'
        elem = document.getElementById('totalAvgMoveTime');
        elem.innerHTML=statistics.totalAvgMoveTime;
    }

}



function updateTurn(activePlayer)
{
    let background = activePlayer=== 1 ? 'backgroundImageRobot' : 'backgroundImageBoy';
    let removedBackground = activePlayer=== 0 ? 'backgroundImageRobot' : 'backgroundImageBoy';
        turnIndicator.classList.remove(`${removedBackground}`);
    turnIndicator.classList.add(`${background}`);
}


function gameFlowAnimationDelay(animation,args,cb,cbArgs){
    gameManager.animationDelayCounter++;
    setTimeout(() => {
        animation.apply(null,args);
                 gameManager.animationDelayCounter--;
                 if(cb){
                     if(gameManager.animationDelayCounter===0){
                         cbArgs.forEach(arg=>cb.call(null,arg));
                     }
                 }

            }
        , (gameManager.animationDelayCounter) * 500);
}

function handleTurnEnd(isChangeTurn)
{
    let playerUiCardsElement = Array.from(playerCardsRow.childNodes);
    if(gameManager.activePlayer===0){
        playerUiCardsElement.forEach((card)=>removePlayerCardBehavior(card));
    }
    do {
        let cardToThrow = gameManager.changeTurn(isChangeTurn);
        updateStatistics();
        gameManager.thereIsAWinner()
        if (gameManager.winner!==0) {
            let cardUI;
            cardToThrow.forEach(cardLogic => {
                cardUI = document.getElementById(cardLogic.id.toString());
                if (cardLogic.rank === 'changeColor') {
                    cardUI.setAttribute('color', cardLogic.color);
                }
                gameManager.addDroppedCardToPot(cardLogic);
                gameFlowAnimationDelay(setDroppedCardCssInPot, [cardUI], setPlayerCardBehavior, Array.from(playerCardsRow.childNodes));
            })

            if (cardToThrow.length > 0) {
                isChangeTurn = toChangeTurn(cardToThrow[cardToThrow.length - 1]);
            }
            else {
                let topUiGameDeckCard = gameDeckElem.lastChild;
                topUiGameDeckCard.dispatchEvent(new Event('click'));
            }
        }
    } while (gameManager.activePlayer===1 && gameManager.thereIsAWinner()===false)
    if (gameManager.thereIsAWinner()===true) {
        if (gameManager.winner===1){
            gameManager.changeTurn(true);
            updateStatistics();
        }
        gameFlowAnimationDelay(exitGameIfSomeoneWon,[]);
    }
}


function setChangedColorCssInPot(color){
    let droppedCardElement = potElement.lastChild;
    droppedCardElement.setAttribute('color',`${color}`);
    droppedCardElement.style.backgroundImage = `url(./img/${droppedCardElement.getAttribute('rank')}_${droppedCardElement.getAttribute('color')}.png)`;
}

function setDroppedCardCssInPot(droppedCardElement) {
    droppedCardElement.style.backgroundImage = `url(./img/${droppedCardElement.getAttribute('rank')}_${droppedCardElement.getAttribute('color')}.png)`;
    potElement.appendChild(droppedCardElement);
    droppedCardElement.setAttribute("draggable", "false");
    droppedCardElement.removeAttribute("onmouseover");
    droppedCardElement.removeAttribute("onmousleave");
    droppedCardElement.classList.remove("cardPlayer");
    droppedCardElement.style.position = "absolute";
    droppedCardElement.style.left = "10%";
    droppedCardElement.style.bottom = "10%";
    let degree = Math.floor(Math.random() * 150);
    droppedCardElement.style.transform = `rotate(${degree}deg)`;
    droppedCardElement.classList.add('cardInsidePot');
}


function dealCardsForPlayer(index) {
    let typeOfPlayer = gameManager.players[index] instanceof Algo ? 'algo' : 'player';
    let cardsRowContainer = typeOfPlayer === 'algo' ? algoCardsRow : playerCardsRow;
    for (let i = 0; i < 8; i++) {
        gameManager.players[index].addCardToDeck(gameManager.gameDeck.pop());
        let card = pullTopCardFromGameDeck(index);
        cardsRowContainer.appendChild(card);
    }
}


function setPlayerCardBehavior(card) {
    card.style.backgroundImage = `url(./img/${card.getAttribute('rank')}_${card.getAttribute('color')}.png)`;

    if(gameManager.totalMoves()!== 0) {
        card.classList.add('cardInsideCardRowAfterSpread');
    }else{
        card.classList.add('cardInsideCardRow');

    }
    card.classList.remove('cardInsideGameDeck');
    card.classList.add('cardPlayer');
    card.setAttribute("ondragstart", "showVisualDragCue(event)");
    card.setAttribute("ondragend", "removeVisualDragCue(event)");
    card.setAttribute("onmouseover", "gameManager.onCardHover(event)");
    card.setAttribute("onmouseleave", "gameManager.onCardHoverEnd(event)");
    card.setAttribute("draggable", "true");
}

function setPlayerCardBehaviourOnlyEvents(card){
    card.classList.add('cardPlayer');
    card.setAttribute("ondragstart", "showVisualDragCue(event)");
    card.setAttribute("ondragend", "removeVisualDragCue(event)");
    card.setAttribute("onmouseover", "gameManager.onCardHover(event)");
    card.setAttribute("onmouseleave", "gameManager.onCardHoverEnd(event)");
    card.setAttribute("draggable", "true");
}
function removePlayerCardBehavior(card){

    card.classList.remove('cardPlayer');
    card.setAttribute("ondragstart", null);
    card.setAttribute("ondragend", null);
    card.setAttribute("onmouseover", null);
    card.setAttribute("onmouseleave", null);
    card.setAttribute("draggable", "false");
}

function spreadCardsAnimation() {
    let playersUiCards = Array.from(playerCardsRow.childNodes);
    let algoUiCards = Array.from(algoCardsRow.childNodes);
    playersUiCards.forEach((uiCard)=>{uiCard.classList.remove('cardInsideCardRow')})
    playersUiCards.forEach((uiCard)=>{uiCard.classList.add('cardInsideCardRowAfterSpread')});
    algoUiCards.forEach((uiCard)=>{uiCard.classList.remove('cardInsideCardRow')})
    algoUiCards.forEach((uiCard)=>{uiCard.classList.add('cardInsideCardRowAfterSpread')});
    // classList.remove('cardInsideCardRow');
    // algoCardsRow.classList.remove('cardInsideCardRow');
    // playerCardsRow.classList.add('cardInsideCardRowAfterSpread');
    // algoCardsRow.classList.add('cardInsideCardRowAfterSpread');
    // document.styleSheets[2].cssRules[0].cssRules[17].style['marginRight'] = "0px";
}


function initBeforeRender() {
    updateTurn(gameManager.activePlayer);
    initGameDeckUi();
}

function initOnRender() {
    pullTopCardFromGameDeck(-1);
    gameManager.players.forEach((player, index) => {
        dealCardsForPlayer(index)
        setTimeout(() => {
        }, 1000)
    });

    setTimeout(() => {
        spreadCardsAnimation()
    }, 500);

    gameManager.timerElapsed.start();
}
function isPlayerHasLegitCardToThrow(){
    let playerCardsUi = Array.from(playerCardsRow.childNodes);

    return playerCardsUi.some((cardUi)=>{
        let cardComp = gameManager.players[0].getCardByID(parseInt(cardUi.getAttribute("id")));
        return gameManager.checkMoveValidity(cardComp);
    });
}
function handlePulledTopCardClick(event) {
    let isPlayer = event.isTrusted;
    if(!gameManager.isTakiMode && !isPlayerHasLegitCardToThrow() && (gameManager.animationDelayCounter===0 || !isPlayer)){
        let cardsRowContainer = isPlayer ? playerCardsRow : algoCardsRow ;

        if(( isPlayer && gameManager.activePlayer === 0) || (!isPlayer && gameManager.activePlayer===1 )){
            let numberOFCardsToTake= gameManager.howMany2Plus===0 ? 1 : gameManager.howMany2Plus*2;
            gameManager.howMany2Plus=0;
            for (let i=0; i<numberOFCardsToTake; i++) {
                gameManager.players[gameManager.activePlayer].addCardToDeck(gameManager.gameDeck.pop());
                let card = pullTopCardFromGameDeck(gameManager.activePlayer);
                gameFlowAnimationDelay((card)=>{cardsRowContainer.appendChild(card)},[card],setPlayerCardBehavior,Array.from(playerCardsRow.childNodes));
            }
            handleTurnEnd(true);
        }

    }
}

function flushShuffledPotToGameDeck()
{
    gameManager.flushShuffledPotToGameDeck();
    while(potElement.firstChild!==potElement.lastChild){
        potElement.removeChild(potElement.firstChild);
    }
    initGameDeckUICards();

}

function resetPopup(){
    elem=document.getElementById("winner").innerHTML="";
    document.getElementById("myTotalMoves").innerHTML="";
    document.getElementById("myAvgMoveTime").innerHTML="";
    document.getElementById("myReachedLast").innerHTML="";
    document.getElementById("myTotalAvgMoveTime").innerHTML="";
    document.getElementById("algoTotalAvgMoveTime").innerHTML="";
    document.getElementById("algoAvgMoveTime").innerHTML="";
    document.getElementById("algoReachedLast").innerHTML="";
    document.getElementById("algoTotalMoves").innerHTML="";
    popupContent.style.width='20%';
    popupContent.style.maxHeight='300px';
    popupContent.style.minHeight='300px';
    popupContent.style.minWidth='300px';
    popupContent.style.height='25%';
    endGamePopupHeader[0].style.display="none";
    popupHeader[0].style.display="flex";
    changeColorPopupContainerElement.style.display="flex";
    restartButtonElement.hidden=true;
    endGamePopupContainer.style.diplay="none";
    popupElement.style.display="none";
}

function clearCards(){
    while (gameDeckElem.firstChild){
        gameDeckElem.removeChild(gameDeckElem.firstChild);
    }
    while (potElement.firstChild){
        potElement.removeChild(potElement.firstChild);
    }
    while (playerCardsRow.firstChild){
        playerCardsRow.removeChild(playerCardsRow.firstChild);
    }
    while (algoCardsRow.firstChild){
        algoCardsRow.removeChild(algoCardsRow.firstChild);
    }
}

function restartGame(event){
    resetPopup();
    gameManager.resetGame();
    updateStatistics();
    clearCards();
    initBeforeRender();
    initOnRender();

}


function surrender(event){
    gameManager.winner=1;
    exitGameIfSomeoneWon();
}

function exitGameIfSomeoneWon(){

    if (gameManager.thereIsAWinner()===true) {
        setEndGameStatistics();
        raiseEndGamePopup();
    }
}

function setEndGameStatistics() {
    let statistics;
    let elem;
    statistics = gameManager.gameStatistics();
    elem=document.getElementById("winner");
    elem.innerHTML = statistics.whoWon===0? "You Won!" : "You Loose!";
    document.getElementById("myAvgMoveTime").innerHTML="Avg. Move Time: " + statistics.players[0].avgMovesTime;
    document.getElementById("myReachedLast").innerHTML="Last Card: "+ statistics.players[0].reachLastCard;
    document.getElementById("myTotalMoves").innerHTML="Num Of Moves : "+ statistics.players[0].moves;
    document.getElementById("algoAvgMoveTime").innerHTML="Avg. Move Time: "+ statistics.players[1].avgMovesTime;
    document.getElementById("algoReachedLast").innerHTML="Last Card: "+ statistics.players[1].reachLastCard;
    document.getElementById("algoTotalMoves").innerHTML="Num Of Moves : "+ statistics.players[1].moves;
    if (gameManager.restarted===true)
    {
        document.getElementById("myTotalAvgMoveTime").innerHTML="Total Avg. Move Time: " + statistics.players[0].totalAvgMoveTime;
        document.getElementById("algoTotalAvgMoveTime").innerHTML="Total Avg. Move Time: " + statistics.players[1].totalAvgMoveTime;

    }
}

function pullTopCardFromGameDeck(index) {

    let initiator;
    if (index == -1) {
        initiator = 'pot';
    } else {
        initiator = gameManager.players[index] instanceof Algo ? 'algo' : 'player';
    }
    if (gameDeckElem.childNodes.length > 0) {
        //removes card from the game deck
        let topPulledCard = gameDeckElem.lastChild;
        topPulledCard.classList.remove('topCardInGameDeck', 'cardInsideGameDeck');
        topPulledCard.removeEventListener("click", handlePulledTopCardClick, true);

        gameDeckElem.removeChild(topPulledCard);

        let nextTopCard = gameDeckElem.lastChild;

        if (nextTopCard !== null) {

            nextTopCard.classList.add('topCardInGameDeck');
            nextTopCard.addEventListener("click", handlePulledTopCardClick, true);

        } else{
            flushShuffledPotToGameDeck();
        }

        if (initiator === 'player') {
            setPlayerCardBehavior(topPulledCard);
            return topPulledCard

        } else if (initiator === 'pot') {
            gameManager.addDroppedCardToPot(gameManager.gameDeck.pop());
            setDroppedCardCssInPot(topPulledCard);
        }
        else {
            if(gameManager.totalMoves()!==0){
                topPulledCard.classList.add('cardInsideCardRowAfterSpread');

            }else{
                topPulledCard.classList.add('cardInsideCardRow');

            }
            return topPulledCard
        }


    }
}




initBeforeRender()
window.addEventListener('load', initOnRender)
