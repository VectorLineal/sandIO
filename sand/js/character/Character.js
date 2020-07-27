import Entity from "./Entity.js";
export default class Character extends Entity{
    constructor(name, level, xpFactor, bountyFactor, race, fortitude, damage, armor, maxHealth, healthRegen, speed, atSpeed, evasion, crit, accuracy, maxMana, manaRegen, spellPower, will, magicArmor, concentration, spawnPoint, ranged, range){
        super(name, level, xpFactor, bountyFactor, damage, armor, evasion, maxHealth, healthRegen, atSpeed, accuracy, magicArmor, ranged, range);
        this.race = race;

        //referente a poderes, buffs y debuffs
        this.skills = {};
        this.items = [];
        
        //stats del personaje como tal
        this.fortitude = fortitude;
        this.speed = speed;
        this.crit = crit;
        this.maxMana = maxMana;
        this.curMana = this.maxMana;
        this.manaRegen = manaRegen;
        this.spellPower = spellPower;
        this.will = will;
        this.concentration = concentration;

        //character's body
        this.spawnX = spawnPoint.x;
        this.spawnY = spawnPoint.y;
    }

    //funciones sobre sprites
    moveY(sprite, direction, scale){
        if(direction){
            sprite.setVelocityY(-this.speed * scale / 6);
        }else{
            sprite.setVelocityY(this.speed * scale / 6);
        }
    }

    moveX(sprite, direction, scale){
        if(direction){
            sprite.setVelocityX(this.speed * scale / 6);
        }else{
            sprite.setVelocityX(-this.speed * scale / 6);
        }
    }

    moveDirection(sprite, direction, alteredSpeed, scale){
        //ángulo debe venir en radianes
        var deltaX = 0;
        var deltaY = 0;

        if(direction > Math.PI){
            direction -= Math.PI;
        }else if(direction < -Math.PI){
            direction += Math.PI;
        }

        if(alteredSpeed != 0){
            deltaX = alteredSpeed * Math.cos(direction);
            deltaY = alteredSpeed * Math.sin(direction);
        }else{
            deltaX = this.speed * Math.cos(direction);
            deltaY = this.speed * Math.sin(direction);
        }

        sprite.setAngle(direction * 180 / Math.PI);
        sprite.setVelocity(deltaX * scale / 6, deltaY * scale / 6);
    }
}