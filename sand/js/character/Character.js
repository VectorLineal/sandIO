const Atribute = require("./Atribute");

class Character{
    constructor(name, type, race, baseStr, strGrowth, baseRes, resGrowth, baseAgi, agiGrowth, basePer, perGrowth, baseInt, intGrowth, baseDet, detGrowth, level, body, lArm, rArm){
        this.name = name;
        this.level = level;
        this.type = type;
        this.race = race;
        this.str = new Atribute("stregth", baseStr, strGrowth);
        this.res = new Atribute("stregth", baseRes, resGrowth);
        this.agi = new Atribute("stregth", baseAgi, agiGrowth);
        this.per = new Atribute("stregth", basePer, perGrowth);
        this.int = new Atribute("stregth", baseInt, intGrowth);
        this.det = new Atribute("stregth", baseDet, detGrowth);
        this.str.update(level);
        this.res.update(level);
        this.agi.update(level);
        this.per.update(level);
        this.int.update(level);
        this.det.update(level);
        
        this.skills = [];
        this.bonusStats = [];
        this.debuffs = [];
        this.CCEffects = [];
        this.fortitude = this.str.getStats()
    }
}