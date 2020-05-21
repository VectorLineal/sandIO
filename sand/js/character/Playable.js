import Atribute from "./Atribute.js";
import Character from "./Character.js";
import {randomFloat} from "../main_layer/MathUtils.js";

export default class Playable extends Character{
    constructor(name, type, race, baseStr, strGrowth, baseRes, resGrowth, baseAgi, agiGrowth, basePer, perGrowth, baseInt, intGrowth, baseDet, detGrowth, level, xpFactor, bodyArmor, weapon, spawnPoint){
        super(name, level, xpFactor, race, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, spawnPoint);
        this.type = type;
        this.xp = 0;
        if(this.level >= 25){
            this.xp = 13 * xpFactor;
            this.level = 25;
        }
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

    getRanged(){
        return this.weapon.ranged;
    }

    takeDamage(params){ //scene, amount, type, accuracy, critChance, critMultiplier, avoidable, critable, ranged
        //type 0 es puro, 1 físico y 2 mágico
        var rawDamage = params.amount;
        var crit = false;
        var finalDamage = 0;

        if(!params.avoidable){
            if(params.critable){
                if(randomFloat(101) <= params.critChance){
                    rawDamage *= this.critMultiplier;
                    crit = true;
                }
            }
            finalDamage = this.dealDamage(rawDamage, params.type);
        }else{
            var hitChance = params.accuracy - this.evasion;
            if(params.ranged){
                hitChance += 100;
            }
            if(randomFloat(101) <= hitChance){
                if(params.critable){
                    if(randomFloat(101) <= params.critChance){
                        rawDamage *= this.critMultiplier;
                        crit = true;
                    }
                }
                finalDamage = this.dealDamage(rawDamage, params.type);
            }
        }
        params.scene.events.emit('updateHealth');
        return {amount: finalDamage, isCrit: crit};
    }

    applyHealthRegen(scene){
        if(this.curHealth >= this.maxHealth){
            this.curHealth = this.maxHealth;
        }else{
            this.curHealth += (this.healthRegen / 60);
        }
        scene.events.emit('updateHealth');
    }

    spendMana(scene, amount){
        this.curMana +=  amount;
        scene.events.emit('updateMana');
    }

    applyManaRegen(scene){
        if(this.curMana >= this.maxMana){
            this.curMana = this.maxMana;
        }else{
            this.curMana += (this.manaRegen / 60);
        }
        scene.events.emit('updateMana');
    }

    levelUp(scene){
        if(this.level <= 24){
            this.level ++;
            scene.events.emit('updateLevel');
            this.fortitude += 0.3 * (this.str.change.derivate() + this.res.change.derivate());
            this.damage += 4 * this.str.change.derivate();
            scene.events.emit('updateDamage');

            this.armor += 0.6 * this.str.change.derivate();
            scene.events.emit('updateArmor');

            this.maxHealth += 20 * this.res.change.derivate();
            scene.events.emit('updateMaxHealth');

            this.curHealth += 20 * this.res.change.derivate();
            scene.events.emit('updateHealth');

            this.healthRegen += 0.2 * this.res.change.derivate();
            scene.events.emit('updateHealthRegen');

            this.speed += 0.1 * this.agi.change.derivate();
            scene.events.emit('updateSpeed');

            this.atSpeed += 8 * this.agi.change.derivate();
            scene.events.emit('updateAtSpeed');
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
            scene.events.emit('updateMaxMana');

            this.curMana += 12 * this.int.change.derivate();
            scene.events.emit('updateMana');

            this.manaRegen += 0.1 * this.int.change.derivate();
            scene.events.emit('updateManaRegen');

            this.spellPower += 0.2 * this.int.change.derivate();
            scene.events.emit('updateSpellPower');

            this.will += 0.6 * this.det.change.derivate();
            this.magicArmor += 0.6 * this.det.change.derivate();
            scene.events.emit('updateMagicArmor');

            this.concentration += 0.6 * this.det.change.derivate();
        }
    }

    gainXP(scene, amount){
        var overflow = 0;
        if(this.level <= 24){
            this.xp += amount;
            scene.events.emit('updateXP');
            if(this.xp >= this.calculateNextLevelXp()){
                overflow = this.calculateNextLevelXp() - this.xp;
                this.levelUp(scene);
                if(this.level <= 24){
                    this.xp = overflow;
                }else{
                    this.xp = 13 * this.xpFactor;
                }
                scene.events.emit('updateXP');
            }
        }
    }
}