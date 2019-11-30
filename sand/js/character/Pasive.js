class Pasive{
    constructor(name, effect, damageType, range, forEnemy){
        this.name = name;
        this.effect = effect;
        this.damageType = damageType;
        this.range = range;
        this.forEnemy = forEnemy;
    }

    isAura(){
        return this.range > 0;
    }
}