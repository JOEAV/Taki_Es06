turnIndicator.style.zIndex='100';


let containers = [playerCardsRow,potContainerElement,algoCardsRow,gameDeckContainer];

let changeContainersZIndex = (val) => {
    containers.forEach((container) => {
        container.style.zIndex = val
    });
}

let isPlayerTurnAfterTaki = () =>{
    let topPotCardRank = gameManager.pot.getTopCardValue().rank;
    return turnIndicatorBackgroundImage = topPotCardRank==='stop' || topPotCardRank==='plus' ? 'backgroundImageBoy' : 'backgroundImageRobot'
};

let takiButtonClicked =(event)=>{
    let color = event.color;
    color =  color.toUpperCase();
    takiCircle.classList.remove(`scaleColorAnimation${color}`);
    turnIndicator.classList.remove('turnIndicatorTakiOn');
    turnIndicator.classList.add('turnIndicator',isPlayerTurnAfterTaki());
    turnIndicator.removeEventListener('click',clickEventListener);
    event.nonColorCards.forEach((card)=>{setPlayerCardBehaviourOnlyEvents(card)});
    changeContainersZIndex(0);
    gameManager.isTakiMode=false;
    handleTurnEnd(toChangeTurn(gameManager.pot.getTopCardValue()));


}

function clickEventListener(event){
    let colorUpperCase = gameManager.pot.getTopCardValue().color.toUpperCase();
    let playerCardsElems = Array.from(playerCardsRow.childNodes);
    let playerCardsDifferentColor = playerCardsElems.filter(card=>card.getAttribute('color')!==colorUpperCase.toLowerCase())
    event.color = colorUpperCase;
    event.nonColorCards = playerCardsDifferentColor;
    takiButtonClicked(event)
}
let takiCircle = document.getElementsByClassName('takiInteractionActive')[0];
let handleTakiCardDropped = (color)=>{
    gameManager.isTakiMode = true;
    changeContainersZIndex(100);
    turnIndicator.addEventListener('click',clickEventListener)
    let playerCardsElems = Array.from(playerCardsRow.childNodes);
    let colorUpperCase = gameManager.pot.getTopCardValue().color.toUpperCase();
    let playerCardsDifferentColor = playerCardsElems.filter(card=>card.getAttribute('color')!==colorUpperCase.toLowerCase())

    takiCircle.classList.add(`scaleColorAnimation${colorUpperCase}`);
    turnIndicator.classList.remove('turnIndicator','backgroundImageBoy');
    turnIndicator.classList.add('turnIndicatorTakiOn');

    playerCardsDifferentColor.forEach((card)=>{
        removePlayerCardBehavior(card)
    });
}




let mainContent = document.getElementById('mainContent');

