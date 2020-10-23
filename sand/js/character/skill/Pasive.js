class Pasive extends Skill{
    constructor(name, effect, damageType, range, forEnemy){
        super(name, effect, damageType, range, forEnemy);
    }

    isAura(){
        return this.range.reach > 0;
    }
}