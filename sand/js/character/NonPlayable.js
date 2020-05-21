import Character from "./Character.js";
import {randomFloat} from "../main_layer/MathUtils.js";

export default class NonPlayable extends Character{
    constructor(name, level, xpFactor, race, fortitude, damage, armor, maxHealth, healthRegen, speed, atSpeed, evasion, crit, accuracy, maxMana, manaRegen, spellPower, will, magicArmor, concentration, spawnPoint, onCrit, critMultiplier, ranged, detectionRange, behavour){
        super(name, level, xpFactor, race, fortitude, damage, armor, maxHealth, healthRegen, speed, atSpeed, evasion, crit, accuracy, maxMana, manaRegen, spellPower, will, magicArmor, concentration, spawnPoint);
        this.onCrit = onCrit;
        this.critMultiplier = critMultiplier;
        this.ranged = ranged;
        this.detectionRange = detectionRange;
        this.behavour = behavour;
        this.isChasing = false;
        this.spawnPoint = this.spawnPoint;
    }

    getOnCrit(){
        return this.onCrit;
    }

    getCritMultiplier(){
        return this.critMultiplier;
    }

    getRanged(){
        return this.ranged;
    }

    takeDamage(params){ //amount, type, accuracy, critChance, critMultiplier, avoidable, critable, ranged
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
            let generator = randomFloat(101);
            console.log("generated rand:", generator, "hit chance", hitChance, "accuracy", params.accuracy, "evasion", this.evasion);
            if(generator <= hitChance){
                if(params.critable){
                    if(randomFloat(101) <= params.critChance){
                        rawDamage *= this.critMultiplier;
                        crit = true;
                    }
                }
                finalDamage = this.dealDamage(rawDamage, params.type);
            }
        }
        return {amount: finalDamage, isCrit: crit};
    }

    applyHealthRegen(){
        if(this.curHealth >= this.maxHealth){
            this.curHealth = this.maxHealth;
        }else{
            this.curHealth += (this.healthRegen / 60);
        }
    }

    spendMana(amount){
        this.curMana +=  amount;
    }

    applyManaRegen(){
        if(this.curMana >= this.maxMana){
            this.curMana = this.maxMana;
        }else{
            this.curMana += (this.manaRegen / 60);
        }
    }

    noticePlayer(sprite, playerSprite){
        var angle =  -90 + Phaser.Math.RAD_TO_DEG * Phaser.Math.Angle.Between(
          sprite.x,
          sprite.y,
          playerSprite.x,
          playerSprite.y
        );
        sprite.setAngle(angle);
    }
}