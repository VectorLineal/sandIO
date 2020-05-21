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