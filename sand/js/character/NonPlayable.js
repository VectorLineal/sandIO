import Character from "./Character.js";

export default class NonPlayable extends Character{
    constructor(name, level, xpFactor, bountyFactor, race, fortitude, damage, armor, maxHealth, healthRegen, speed, atSpeed, evasion, crit, accuracy, maxMana, manaRegen, spellPower, will, magicArmor, concentration, spawnPoint, critEffect, critMultiplier, ranged, range, skills, detectionRange, behavour, isBoss){
        super(name, level, xpFactor, bountyFactor, race, fortitude, damage, armor, maxHealth, healthRegen, speed, atSpeed, evasion, crit, accuracy, maxMana, manaRegen, spellPower, will, magicArmor, concentration, spawnPoint, critMultiplier, ranged, range, skills);
        this.critEffect = critEffect;
        this.ranged = ranged;
        this.detectionRange = detectionRange;
        this.behavour = behavour;
        this.isBoss = isBoss;
        this.isChasing = false;
    }

    getCritMultiplier(){
        return this.critMultiplier;
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
        params.sprite.getData("underBar").destroy();
        params.sprite.getData("healthBar").destroy();
        params.sprite.getData("shieldBar").destroy();
        params.sprite.getData("status").destroy(true);
        params.group.remove(params.sprite, true, true);
        super.onDeath(params);
    }
}