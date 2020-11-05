export default class Skill{
    constructor(params){
        this.name = params.name;
        this.effect = params.effect;

        if(params.isUlti == null){
            this.isUlti = false;
        }else{
            this.isUlti = params.isUlti;
        }
        if(params.damageType == null){
            this.damageType = 0;
        }else{
            this.damageType = params.damageType;
        }
        if(params.range == null || params.range < 0){
            this.range = {reach: 0};
        }else{
            this.range = params.range;
        }
        if(params.forEnemy == null){
            this.forEnemy = false;
        }else{
            this.forEnemy = params.forEnemy;
        }
        if(params.isPhysical == null){
            this.isPhysical = true;
        }else{
            this.isPhysical = params.isPhysical;
        }
    }
}