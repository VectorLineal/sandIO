import Character from "./Character.js";

export default class NonPlayable extends Character{
    constructor(name, level, xpFactor, race, fortitude, damage, armor, maxHealth, healthRegen, speed, atSpeed, evasion, crit, accuracy, maxMana, manaRegen, spellPower, will, magicArmor, concentration, spawnPoint, onCrit, critMultiplier, detectionRange, behavour){
        super(name, level, xpFactor, race, fortitude, damage, armor, maxHealth, healthRegen, speed, atSpeed, evasion, crit, accuracy, maxMana, manaRegen, spellPower, will, magicArmor, concentration, spawnPoint);
        this.onCrit = onCrit;
        this.critMultiplier = critMultiplier;
        this.detectionRange = detectionRange;
        this.behavour = behavour;
        this.isChasing = false;
        this.spawnPoint = this.spawnPoint;
    }

    takeDamage(amount, type){
        //type 0 es puro, 1 físico y 2 mágico
        if(type == 0){
            this.curHealth -=  amount;
        }else if(type == 1){
            if(amount -this.armor >= amount * 0.15){
                this.curHealth -=  amount -this.armor;
            }else{
                this.curHealth -=  amount * 0.15;
            }
        }else if(type == 2){
            if(amount -this.magicArmor >= amount * 0.15){
                this.curHealth -=  amount -this.magicArmor;
            }else{
                this.curHealth -=  amount * 0.15;
            }
        }else{
            console.log("unvalid damage type, must be either 0 for pure, 1 for physic or 2 for magic")
        }
        
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