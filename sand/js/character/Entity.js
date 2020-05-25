export default class Entity{
    constructor(name, level, xpFactor, damage, armor, maxHealth, healthRegen, atSpeed, accuracy, magicArmor, ranged, range){
        this.name = name;
        this.level = level;
        this.xpFactor = xpFactor; //en heroes se toma valor de 100, en otros representa la xp que se gana al matar a un enemigo

        //referente a poderes, buffs y debuffs
        this.pasives = {};
        this.bonusStats = [];
        this.debuffs = [];
        this.CCEffects = [];
        
        //stats del personaje como tal
        this.damage = damage;
        this.armor = armor;
        this.maxHealth = maxHealth;
        this.curHealth = this.maxHealth;
        this.healthRegen = healthRegen;
        this.atSpeed = atSpeed;
        this.accuracy = accuracy;
        this.magicArmor = magicArmor;

        //character's body
        this.atFrames = [];
        this.ranged = ranged;
        this.range = range;
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

    //funciones no gráficas
    getRange(){
        return this.range;
    }

    getRanged(){
        return this.ranged;
    }

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

    dealDamage(amount, type){ //tipo 0: puro, tipo 1: fisico, tipo 2: magico
        if(type == 0){
            this.curHealth -=  amount;
            return amount;
        }else if(type == 1){
            if(amount - this.armor >= amount * 0.15){
                this.curHealth -=  amount -this.armor;
                return amount -this.armor;
            }else{
                this.curHealth -=  amount * 0.15;
                return amount * 0.15;
            }
        }else if(type == 2){
            if(amount - this.magicArmor >= amount * 0.15){
                this.curHealth -=  amount -this.magicArmor;
                return amount -this.magicArmor;
            }else{
                this.curHealth -=  amount * 0.15;
                return amount * 0.15;
            }
        }else{
            console.log("unvalid damage type, must be either 0 for pure, 1 for physic or 2 for magic")
        }
    }
}