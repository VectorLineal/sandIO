class Skill{
    constructor(name, effect, damageType, range, forEnemy){
        this.name = name;
        this.effect = effect;
        this.damageType = damageType;
        this.range = range;
        this.forEnemy = forEnemy;
    }

    isUlti(){
        return this.keyBinding == "r";
    }
}