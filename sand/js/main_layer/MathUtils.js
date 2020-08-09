export function randomInt(max){
    if(max < 0){
        console.log("insert a natural number as parameter");
    }{
        return Math.floor(Math.random() * max);
    }
}

export function randomFloat(max){
    if(max < 0){
        console.log("insert a postive number");
    }{
        return Math.random() * max;
    }
}

export function fitNumber(num, decimals){
    let scalefactor = Math.pow(10, decimals);
    return (Math.round(num * scalefactor) / scalefactor).toFixed(decimals);
}

export function clockFormat(num){
    var minutes = Math.floor(num / 60);
    var hours = Math.floor(minutes / 60);
    var time = "";

    minutes %= 60;

    if(hours < 10){
        time += "0" + hours;
    }else{
        time += hours;
    }

    if(minutes < 10){
        time += ":0" + minutes;
    }else{
        time += ":" + minutes;
    }

    return time;
}