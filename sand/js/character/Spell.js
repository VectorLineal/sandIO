class Spell extends Skill{
    constructor(name, effect, damageType, range, forEnemy, keyBinding, cooldown, castPoint, manaCost){
        super(name, effect, damageType, range, forEnemy, keyBinding);
        this.cooldown = cooldown;
        this.castPoint = castPoint;
        this.manaCost = manaCost;
    }
}