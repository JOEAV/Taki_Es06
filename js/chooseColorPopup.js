
//add event listeners for the colored sqaures

let colorOptionSquares = document.getElementsByClassName('colorOption');
let popupElement = document.getElementById('popup');

function handleColorChoosed(event){
    let choosedColor= event.target.getAttribute('color');
    popupElement.style.display ="none";
    gameManager.pot.getTopCardValue().color=choosedColor;
    setChangedColorCssInPot(choosedColor);
    handleTurnEnd(true);

}


for(let color of colorOptionSquares){
    color.addEventListener('click',()=>{handleColorChoosed(event)},true);
}

function raiseColorChangePopup(){
    popupElement.style.display="block";
}

