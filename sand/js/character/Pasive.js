class Pasive extends Skill{
    constructor(name, effect, damageType, range, forEnemy, keyBinding){
        super(name, effect, damageType, range, forEnemy, keyBinding);
    }

    isAura(){
        return this.range > 0;
    }
}