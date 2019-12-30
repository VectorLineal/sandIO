const Atribute = require("./Atribute");
const Weapon = require("./Weapon");
const Armor = require("./Armor");

class Character{
    constructor(name, type, race, baseStr, strGrowth, baseRes, resGrowth, baseAgi, agiGrowth, basePer, perGrowth, baseInt, intGrowth, baseDet, detGrowth, level, bodyArmor, weapon){
        this.name = name;
        this.level = level;
        this.type = type;
        this.race = race;
        //referente a atributos del personaje
        this.str = new Atribute("stregth", baseStr, strGrowth);
        this.res = new Atribute("resitance", baseRes, resGrowth);
        this.agi = new Atribute("agility", baseAgi, agiGrowth);
        this.per = new Atribute("perception", basePer, perGrowth);
        this.int = new Atribute("intelligence", baseInt, intGrowth);
        this.det = new Atribute("determination", baseDet, detGrowth);
        this.str.update(level);
        this.res.update(level);
        this.agi.update(level);
        this.per.update(level);
        this.int.update(level);
        this.det.update(level);

        //referente a poderes, buffs y debuffs
        this.skills = [];
        this.bonusStats = [];
        this.debuffs = [];
        this.CCEffects = [];
        this.items = [];
        this.weapon = weapon;
        this.bodyArmor = bodyArmor;
        
        //stats del personaje como tal
        this.fortitude = this.str.getStats()[0] + this.res.getStats()[2];
        this.damage = 36 + weapon.getCurrentDamage() + this.str.getStats()[1];
        this.armor = this.bodyArmor.getCurrentArmor() + this.str.getStats()[2];
        this.maxHealth = 200 + this.res.getStats()[0];
        this.curhealth = this.maxHealth;
        this.healthRegen = 0.1 + this.res.getStats()[1];
        this.speed = this.weapon.speed + this.bodyArmor.speed + 280 + this.agi.getStats()[0];
        this.atSpeed = this.weapon.atSpeed + this.bodyArmor.atSpeed + 100 + this.agi.getStats()[1];
        this.evasion = this.weapon.evasion + this.bodyArmor.evasion + this.agi.getStats()[2] + this.per.getStats()[2];
        this.crit = this.per.getStats()[0];
        this.accuracy = this.weapon.accuracy + 100 + this.per.getStats()[1];
        this.maxMana = 75 + this.int.getStats()[0];
        this.curMana = maxMana;
        this.manaRegen = 0.1 + this.int.getStats()[1];
        this.spellPower = this.int.getStats()[2];
        this.will = this.det.getStats()[0];
        this.magicArmor = this.bodyArmor.getCurrentMagicArmor() + this.det.getStats()[1];
        this.concentration = this.det.getStats()[2];
    }
}