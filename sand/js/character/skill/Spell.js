class Spell extends Skill{
    constructor(name, effect, damageType, range, forEnemy, cooldown, castPoint, manaCost, ranged, conic){
        super(name, effect, damageType, range, forEnemy);
        this.cooldown = cooldown;
        this.castPoint = castPoint;
        this.manaCost = manaCost;
        this.ranged = ranged;
        this.conic = conic; 
    }
}