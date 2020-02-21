import Atribute from "./Atribute.js";
import "../main_layer/phaser.js";
class Character{
    constructor(name, type, race, baseStr, strGrowth, baseRes, resGrowth, baseAgi, agiGrowth, basePer, perGrowth, baseInt, intGrowth, baseDet, detGrowth, level, bodyArmor, weapon, path){
        this.name = name;
        this.path = path;
        this.level = level;
        this.type = type;
        this.race = race;
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

        //referente a poderes, buffs y debuffs
        this.skills = {};
        this.bonusStats = [];
        this.debuffs = [];
        this.CCEffects = [];
        this.items = [];
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
        this.accuracy = this.weapon.accuracy + 100 + this.per.getStat2();
        this.maxMana = 75 + this.int.getStat1();
        this.curMana = this.maxMana;
        this.manaRegen = 0.1 + this.int.getStat2();
        this.spellPower = this.int.getStat3();
        this.will = this.det.getStat1();
        this.magicArmor = this.bodyArmor.getCurrentMagicArmor() + this.det.getStat2();
        this.concentration = this.det.getStat3();

        //character's body
        this.sprite;
    }

    preloadSprite(scene, width, height){
        scene.load.spritesheet(this.name, this.path, {frameWidth: width, frameHeight: height});
    }

    setSprite(scene, scaleRatio, width, height, frameWidth, frameHeight, positionX, positionY){
        this.sprite = scene.matter.add.sprite(positionX, positionY, this.name, null, {
            shape: {
                type: 'rectangle',
                width: width,
                height: height
            },
            render:{ sprite: { xOffset:(((frameWidth-width-1)+(width/2))/frameWidth) - 0.5, yOffset:-(((frameHeight-height-1)/2)/frameHeight)}}
        });
        this.sprite.setScale(scaleRatio);
    }

    addAnimation(scene, animationName, frames){
        var animationSpeed = this.calculateAttackRate();
        if(animationName != "attack"){
            animationSpeed = 500/*this.skills[animationName].castPoint*/;
        }

        scene.anims.create({
            key: animationName,
            frames: scene.anims.generateFrameNumbers(this.name, { frames: frames }),
            duration: animationSpeed
        });
    }

    makeIdle(){
        this.sprite.setVelocity(0);
    }

    moveY(direction){
        if(direction){
            this.sprite.setVelocityY(-this.speed);
        }else{
            this.sprite.setVelocityY(this.speed);
        }
    }

    moveX(direction){
        if(direction){
            this.sprite.setVelocityX(this.speed);
        }else{
            this.sprite.setVelocityX(-this.speed);
        }
    }

    playAnimation(animationName){
        this.sprite.play(animationName);
    }

    calculateAttackRate(){
        if(this.atSpeed < 25){
            return 8000;
        }else{
            return 200000 / this.atSpeed;
        }
    }

    takeDamage(scene, amount){
        this.curHealth +=  amount;
        scene.events.emit('updateHealth');
    }

    applyHealthRegen(scene){
        if(this.curHealth >= this.maxHealth){
            this.curHealth = this.maxHealth
        }else{
            this.curHealth += (this.healthRegen / 60);
        }
        scene.events.emit('updateHealth');
    }
}

export default Character;