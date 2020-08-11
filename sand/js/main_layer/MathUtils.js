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

export function degToRad(angle) {
    return (angle * Math.PI) / 180;
}
export function getRotation(x, y) {
    var result = 0;
    if (x > 0) {
      result = Math.atan(y / x);
    } else if (x == 0 && y > 0) {
      result = Math.PI / 2;
    } else if (x == 0 && y < 0) {
      result = -Math.PI / 2;
    } else if (x < 0 && y == 0) {
      return Math.PI;
    } else {
      result = Math.atan(y / x) + Math.PI;
    }

    if (result > Math.PI) {
      result -= Math.PI;
    }

    return result;
  }

export function getRotationAround(xc, yc, xr, yr) {
    return getRotation(xc - xr, yc - yr);
  }