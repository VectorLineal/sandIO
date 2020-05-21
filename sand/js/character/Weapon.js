export default class Weapon{
    constructor(name, onCrit, baseDamage, ranged, range, evasion, speed, atSpeed, accuracy, critMultiplier){
        this.name = name;
        this.onCrit = onCrit;
        this.baseDamage = baseDamage;
        this.ranged = ranged
        this.range = range;
        this.evasion = evasion;
        this.speed = speed;
        this.atSpeed = atSpeed;
        this.accuracy = accuracy;
        this.critMultiplier = critMultiplier;
        this.level = 1;
    }

    levelUp(){
        this.level++;
    }

    getCurrentDamage(){
        return (0.048 * this.level + 0.3) * this.baseDamage;
    }

    getDamageOnCrit(){
        return this.getCurrentDamage() * this.critMultiplier;
    }
}