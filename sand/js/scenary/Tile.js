export default class Tile{
    constructor(speedMod, effect){
        this.speedMod = speedMod;
        if(effect == "burn"){
            this.onStep = function(params){
                params.sprite.statusChange();
            }
        }
    }
}