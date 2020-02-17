class Skill{
    constructor(name, effect, damageType, range, forEnemy, keyBinding){
        this.name = name;
        this.effect = effect;
        this.damageType = damageType;
        this.range = range;
        this.forEnemy = forEnemy;
        this.keyBinding = keyBinding;
    }

    isUlti(){
        return this.keyBinding == "r";
    }
}