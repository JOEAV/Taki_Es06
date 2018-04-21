let hour,min,sec,ms,count, malt, salt, msalt;

class Stopwatch{
    constructor(){
        this.count;
    };
    stop() {
        if (this.count) {
            clearInterval(this.count);
            this.count = null;
        }
    }

    start(){
        let update = function(txt){
            let  temp = document.getElementById("timer");
            temp.firstChild.nodeValue = txt;
        }
       let pad =  function(time){
            let  temp;
            if(time < 10){
                temp = "0" + time;
            }
            else{
                temp = time;
            }
            return temp;
        }
        // if(document.getElementById("start").firstChild.nodeValue !== "Start"){
        //     document.getElementById("start").firstChild.nodeValue = "Start";
        // }
        if(!this.count){
            ms = 0;
            sec = 0;
            min = 0;
            hour = 0;
            this.count = setInterval(function(){
                if(min==60){
                    min=0;
                    hour++;
                }
                if(ms == 100){
                    ms = 0;
                    if(sec == 60){
                        sec = 0;
                        min++;
                    }
                    else{
                        sec++;
                    }
                }
                else{
                    ms++;
                }

                let halt = pad(hour);
                let malt = pad(min);
                let salt = pad(sec);
                let msalt = pad(ms);


                update( malt + ":" + salt );
            }, 10);
        }


    }

}

window.StopwatchFactory = {

    Stopwatch: Stopwatch
};