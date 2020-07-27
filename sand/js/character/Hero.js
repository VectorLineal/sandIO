import Atribute from "./Atribute.js";
import Character from "./Character.js";

export default class Hero extends Character{
    constructor(name, type, bountyFactor, race, baseStr, strGrowth, baseRes, resGrowth, baseAgi, agiGrowth, basePer, perGrowth, baseInt, intGrowth, baseDet, detGrowth, level, xpFactor, bodyArmor, weapon, spawnPoint){
        super(name, level, xpFactor, bountyFactor, race, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, spawnPoint);
        this.type = type;
        this.xp = 0;
        if(this.level >= 25){
            this.xp = 13 * xpFactor;
            this.level = 25;
        }
        this.gold = 0;
        //referente a atributos del personaje
        this.str = new Atribute("stregth", baseStr, strGrowth);
        this.res = new Atribute("resistance", baseRes, resGrowth);
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

        //equipamento del personaje
        this.weapon = weapon;
        this.bodyArmor = bodyArmor;
        
        //stats del personaje como tal
        this.fortitude = this.str.getStat1() + this.res.getStat3();
        this.damage = 36 + weapon.getCurrentDamage() + this.str.getStat2();
        this.armor = this.bodyArmor.getCurrentArmor() + this.str.getStat3();
        this.maxHealth = 200 + this.res.getStat1();
        this.curHealth = this.maxHealth;
        this.healthRegen = 0.1 + this.res.getStat2();
        this.speed = this.weapon.speed + this.bodyArmor.speed + 28 + this.agi.getStat1();
        this.atSpeed = this.weapon.atSpeed + this.bodyArmor.atSpeed + 100 + this.agi.getStat2();
        this.evasion = this.weapon.evasion + this.bodyArmor.evasion + this.agi.getStat3() + this.per.getStat3();
        this.crit = this.per.getStat1();
        this.accuracy = this.bodyArmor.accuracy + this.weapon.accuracy + 100 + this.per.getStat2();
        this.maxMana = 75 + this.int.getStat1();
        this.curMana = this.maxMana;
        this.manaRegen = 0.1 + this.int.getStat2();
        this.spellPower = this.int.getStat3();
        this.will = this.det.getStat1();
        this.magicArmor = this.bodyArmor.getCurrentMagicArmor() + this.det.getStat2();
        this.concentration = this.det.getStat3();
    }
    
    //funciones no gráficas
    getOnCrit(){
        return this.weapon.onCrit;
    }

    getCritMultiplier(){
        return this.weapon.critMultiplier;
    }

    getRange(){
        return this.weapon.range;
    }


    getRanged(){
        return this.weapon.ranged;
    }

    levelUp(scene){
        if(this.level <= 24){
            this.level ++;
            this.fortitude += 0.3 * (this.str.change.derivate() + this.res.change.derivate());
            this.damage += 2 * this.str.change.derivate();
            this.armor += 0.6 * this.str.change.derivate();
            this.maxHealth += 20 * this.res.change.derivate();
            this.curHealth += 20 * this.res.change.derivate();
            this.healthRegen += 0.2 * this.res.change.derivate();
            this.speed += 0.1 * this.agi.change.derivate();
            this.atSpeed += 4 * this.agi.change.derivate();

            //se tiene que actualizar la animación para que vaya acorde a la velocidad de ataque
            scene.anims.remove("attack_" + this.name);
            scene.anims.create({
                key: "attack_" + this.name,
                frames: scene.anims.generateFrameNumbers(this.name, { frames: this.atFrames }),
                duration: this.calculateAttackRate()
            });

            this.evasion += 0.3 * (this.agi.change.derivate() + this.per.change.derivate());
            this.crit += 0.3 * this.per.change.derivate();
            this.accuracy += 0.4 * this.per.change.derivate();
            this.maxMana += 12 * this.int.change.derivate();
            this.curMana += 12 * this.int.change.derivate();
            this.manaRegen += 0.1 * this.int.change.derivate();
            this.spellPower += 0.2 * this.int.change.derivate();
            this.will += 0.6 * this.det.change.derivate();
            this.magicArmor += 0.6 * this.det.change.derivate();
            this.concentration += 0.6 * this.det.change.derivate();
        }
    }

    gainXP(params){
        var overflow = 0;
        if(this.level <= 24){
            this.xp += params.amount;
            if(this.xp >= this.calculateNextLevelXp()){
                overflow = this.calculateNextLevelXp() - this.xp;
                this.levelUp(params.scene);
                if(this.level <= 24){
                    this.xp = - overflow;
                }else{
                    this.xp = 13 * this.xpFactor;
                }
            }
        }
    }

    earnGold(params){
        this.gold += params.amount;
    }
}