let changeColorPopupContainerElement = document.getElementById('changeColorPopupContainer');
let endGamePopupContainer = document.getElementById('endGamePopupContainer');
let restartButtonElement = document.getElementById('restart-button');
let endGamePopupHeader = document.getElementsByClassName('endGamePopupHeader');
let popupHeader = document.getElementsByClassName('popupHeader');
let popupContent =document.getElementsByClassName('popupContent')[0];


function raiseEndGamePopup(){
    popupContent.style.maxHeight='500px';
    popupContent.style.minHeight='450px';
    popupContent.style.minWidth='680px';
    popupContent.style.height='50%';
    popupContent.style.width='40%';
    endGamePopupHeader[0].style.display="flex";
    popupHeader[0].style.display="none";
    changeColorPopupContainerElement.style.display="none";
    restartButtonElement.hidden=false;
    popupElement.style.display="block";
    endGamePopupContainer.style.diplay="block";
}

