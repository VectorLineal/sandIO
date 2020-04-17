export default class Character{
    constructor(name, level, xpFactor, race, fortitude, damage, armor, maxHealth, healthRegen, speed, atSpeed, evasion, crit, accuracy, maxMana, manaRegen, spellPower, will, magicArmor, concentration, spawnPoint){
        this.name = name;
        this.level = level;
        this.xpFactor = xpFactor; //en heroes se toma valor de 100, en otros representa la xp que se gana al matar a un enemigo
        this.race = race;

        //referente a poderes, buffs y debuffs
        this.skills = {};
        this.bonusStats = [];
        this.debuffs = [];
        this.CCEffects = [];
        this.items = [];
        
        //stats del personaje como tal
        this.fortitude = fortitude;
        this.damage = damage;
        this.armor = armor;
        this.maxHealth = maxHealth;
        this.curHealth = this.maxHealth;
        this.healthRegen = healthRegen;
        this.speed = speed;
        this.atSpeed = atSpeed;
        this.evasion = evasion;
        this.crit = crit;
        this.accuracy = accuracy;
        this.maxMana = maxMana;
        this.curMana = this.maxMana;
        this.manaRegen = manaRegen;
        this.spellPower = spellPower;
        this.will = will;
        this.magicArmor = magicArmor;
        this.concentration = concentration;

        //character's body
        this.atFrames = [];
        this.spawnX = spawnPoint.x;
        this.spawnY = spawnPoint.y;
    }

    //funciones sobre sprites
    addAnimation(scene, animationName, frames){
        var animationSpeed = this.calculateAttackRate();
        if(animationName != "attack_" + this.name){
            animationSpeed = 500/*this.skills[animationName].castPoint*/;
        }else{
            this.atFrames = frames;
        }

        scene.anims.create({
            key: animationName,
            frames: scene.anims.generateFrameNumbers(this.name, { frames: frames }),
            duration: animationSpeed
        });
    }

    moveY(sprite, direction, scale){
        if(direction){
            sprite.setVelocityY(-this.speed / scale);
        }else{
            sprite.setVelocityY(this.speed / scale);
        }
    }

    moveX(sprite, direction, scale){
        if(direction){
            sprite.setVelocityX(this.speed / scale);
        }else{
            sprite.setVelocityX(-this.speed / scale);
        }
    }

    moveDirection(sprite, direction, alteredSpeed){
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

        sprite.setAngle(direction);
        sprite.setVelocity(deltaX, deltaY);
    }

    //funciones no gráficas
    calculateAttackRate(){
        if(this.atSpeed < 25){
            return 8000;
        }else{
            return 200000 / this.atSpeed;
        }
    }
    
    calculateNextLevelXp(){
        if(this.level >= 1 && this.level <= 24){
            return (1 + (this.level * 0.5)) * this.xpFactor;
        }else if(this.level < 1){
            return this.xpFactor;
        }else{
            return 13 * this.xpFactor;
        }
    }
}