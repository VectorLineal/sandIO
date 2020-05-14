export default class Armor{
    constructor(name, baseMagicArmor, baseArmor, evasion, speed, atSpeed, accuracy){
        this.name = name;
        this.baseMagicArmor = baseMagicArmor;
        this.baseArmor = baseArmor;
        this.evasion = evasion;
        this.speed = speed;
        this.atSpeed = atSpeed;
        this.accuracy = accuracy;
        this.level = 1;
    }

    levelUp(){
        this.level++;
    }

    getCurrentArmor(){
        return (0.048*this.level + 0.3)*this.baseArmor;
    }

    getCurrentMagicArmor(){
        return (0.048*this.level + 0.3)*this.baseMagicArmor;
    }
}