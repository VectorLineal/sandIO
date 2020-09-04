import Character from "./Character.js";

export default class NonPlayable extends Character{
    constructor(name, level, xpFactor, bountyFactor, race, fortitude, damage, armor, maxHealth, healthRegen, speed, atSpeed, evasion, crit, accuracy, maxMana, manaRegen, spellPower, will, magicArmor, concentration, spawnPoint, onCrit, critMultiplier, ranged, range, detectionRange, behavour, isBoss){
        super(name, level, xpFactor, bountyFactor, race, fortitude, damage, armor, maxHealth, healthRegen, speed, atSpeed, evasion, crit, accuracy, maxMana, manaRegen, spellPower, will, magicArmor, concentration, spawnPoint, ranged, range);
        this.onCrit = onCrit;
        this.critMultiplier = critMultiplier;
        this.ranged = ranged;
        this.detectionRange = detectionRange;
        this.behavour = behavour;
        this.isBoss = isBoss;
        this.isChasing = false;
    }

    getOnCrit(){
        return this.onCrit;
    }

    getCritMultiplier(){
        return this.critMultiplier;
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

    //funciones sobre eventos

    onDeath(params){
        params.factory.kill({x: this.spawnX, y: this.spawnY}, params.factory.respawnMeanTime, params.factory.respawnMeanTime / 2);
        params.sprite.getData("displayDamage").destroy();
        params.sprite.getData("healthBar").destroy();
        params.group.remove(params.sprite, true, true);
        super.onDeath(params);
    }
}