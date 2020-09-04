import {randomFloat, degToRad, getRotation, transformArmorToPercentage} from "../main_layer/MathUtils.js";
import Hero from "./Hero.js";

export default class Entity{
    constructor(name, level, xpFactor, bountyFactor, damage, armor, evasion, maxHealth, healthRegen, atSpeed, accuracy, magicArmor, ranged, range){
        this.name = name;
        this.level = level;
        this.xpFactor = xpFactor; //en heroes se toma valor de 100, en otros representa la xp que se gana al matar a un enemigo
        this.bountyFactor = bountyFactor;
        this.lastHitBy = "none"; //sirve para referenciar a la última entidad que ha atacado para calcular la entrega de xp y oro

        //referente a poderes, buffs y debuffs
        this.pasives = {};
        this.bonusStats = [];
        this.debuffs = [];
        this.CCEffects = [];
        
        //stats del personaje como tal
        this.damage = damage;
        this.armor = armor;
        this.evasion = evasion;
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
        if(animationName != "attack_" + this.name && animationName != "attack_" + this.name + "_end"){
            animationSpeed = 500/*this.skills[animationName].castPoint*/;
        }else if(animationName == "attack_" + this.name){
            this.atFrames[0] = frames;
        }else if(animationName == "attack_" + this.name + "_end"){
            this.atFrames[1] = frames;
        }

        scene.anims.create({
            key: animationName,
            frames: scene.anims.generateFrameNumbers(this.name, { frames: frames }),
            duration: animationSpeed
        });
    }

    rebalanceAttackAnimations(scene){
        let totalFrames = this.atFrames[0].length +  this.atFrames[1].length;
            scene.anims.remove("attack_" + this.name);
            scene.anims.create({
                key: "attack_" + this.name,
                frames: scene.anims.generateFrameNumbers(this.name, { frames: this.atFrames[0] }),
                duration: this.calculateAttackRate() * this.atFrames[0].length / totalFrames
            });

            scene.anims.remove("attack_" + this.name + "_end");
            scene.anims.create({
                key: "attack_" + this.name + "_end",
                frames: scene.anims.generateFrameNumbers(this.name, { frames: this.atFrames[1] }),
                duration: this.calculateAttackRate() * this.atFrames[1].length / totalFrames
            });
    }

    commitAttack(animation, frame, gameObject) {
        gameObject.scene.lastKeyPressed = "";
        if(!gameObject.getData("backend").getRanged()){
          var xc = gameObject.x;
          var yc = gameObject.y;
          var xr = -gameObject.displayWidth / 4;
          var yr = gameObject.displayHeight / 2;
          let magnitude = Math.sqrt(xr * xr + yr * yr);
          var attackBox = gameObject.scene.matter.add.rectangle(
            xc +
              magnitude *
                Math.cos(
                  getRotation(xr, yr) + degToRad(gameObject.angle)
                ),
            yc +
              magnitude *
                Math.sin(
                  getRotation(xr, yr) + degToRad(gameObject.angle)
                ),
                -xr * 0.04 * gameObject.getData("backend").getRange() * (9.84 / gameObject.scene.scaleRatio),
                gameObject.getData("backend").getRange() * (9.84 / gameObject.scene.scaleRatio),
            {
              isSensor: true,
              angle: degToRad(gameObject.angle),
              render: { visible: true, lineColor: 0x00ff00 },
            }
          );
          attackBox.label = "attackBox." + gameObject.getData("backend").name + "#" + gameObject.body.collisionFilter.group;
          if (gameObject.body.collisionFilter.group == gameObject.scene.groups[0]) {
            attackBox.collisionFilter.category = gameObject.scene.categories[0];
          } else if (gameObject.body.collisionFilter.group == gameObject.scene.groups[1]) {
            attackBox.collisionFilter.category = gameObject.scene.categories[2];
          } else if (gameObject.body.collisionFilter.group == gameObject.scene.groups[2]) {
            attackBox.collisionFilter.category = gameObject.scene.categories[4];
          }
        }else{
          //crear proyectil para ataque a distancia, pendiente creacion de clase proyectil
        }
    
        gameObject.play("attack_" + gameObject.getData("backend").name + "_end");
        console.log("bodies in world:", gameObject.scene.matter.world.getAllBodies());
      }

    distributeXp(scene, group){

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

    getArmorMultiplier(magic){
        if(magic){
            return transformArmorToPercentage(this.magicArmor);
        }else{
            return transformArmorToPercentage(this.armor);
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

    calculateBounty(){
        if(this.level >= 1 && this.level <= 24){
            return (1 + (this.level * 0.5)) * this.bountyFactor;
        }else if(this.level < 1){
            return this.bountyFactor
        }else{
            return 13 * this.bountyFactor;
        }
    }

    isDead(){
        return this.curHealth <= 0;
    }

    dealDamage(amount, type){ //tipo 0: puro, tipo 1: fisico, tipo 2: magico
        if(type == 0){
            this.curHealth -=  amount;
            return amount;
        }else if(type == 1){
            this.curHealth -=  amount * (1 - this.getArmorMultiplier(false));
            return amount * (1 - this.getArmorMultiplier(false));
        }else if(type == 2){
            this.curHealth -=  amount * (1 - this.getArmorMultiplier(true));
            return amount * (1 - this.getArmorMultiplier(true));
        }else{
            console.log("unvalid damage type, must be either 0 for pure, 1 for physic or 2 for magic")
        }
    }

    heal(amount){
        this.dealDamage(-amount, 0);
    }

    takeDamage(params){ //scene, sprite, group, factory, scaleRatio, amount, type, accuracy, critChance, critMultiplier, avoidable, critable, ranged
        //type 0 es puro, 1 físico y 2 mágico
        var rawDamage = params.amount;
        var crit = false;
        var finalDamage = 0;

        if(!params.avoidable){
            if(params.critable){
                if(randomFloat(101) <= params.critChance){
                    rawDamage *= params.critMultiplier;
                    crit = true;
                }
            }
            this.lastHitBy = params.attacker;
            finalDamage = this.dealDamage(rawDamage, params.type);
            if(this.curHealth <= 0){
                this.onDeath(params);
            }
        }else{
            var hitChance = params.accuracy - this.evasion;
            if(params.ranged){
                hitChance += 100;
            }
            if(randomFloat(101) <= hitChance){
                if(params.critable){
                    if(randomFloat(101) <= params.critChance){
                        rawDamage *= params.critMultiplier;
                        crit = true;
                    }
                }
                this.lastHitBy = params.attacker;
                finalDamage = this.dealDamage(rawDamage, params.type);
                if(this.curHealth <= 0){
                    this.onDeath(params);
                }
            }
        }
        return {amount: finalDamage, isCrit: crit};
    }

    applyHealthRegen(params){
        if(this.curHealth >= this.maxHealth){
            this.curHealth = this.maxHealth;
        }else{
            this.curHealth += (this.healthRegen / 60);
        }
    }
    
    restoreHealth(){
        this.curHealth = this.maxHealth;
    }

    //funciones sobre eventos
    onDeath(params){
        if(parseInt(this.lastHitBy.split("#")[1]) == params.scene.groups[1] || parseInt(this.lastHitBy.split("#")[1]) == params.scene.groups[4]){
            if(parseInt(this.lastHitBy.split("#")[1]) != params.scene.groups[4]){
            for(var i = 0; i < VREyeParameters.scene.teamBSprites.children.getArray().length; i++){
                if(params.scene.teamASprites.children.getArray()[i].getData("backend").name == this.lastHitBy.split("#")[0] && (params.scene.teamASprites.children.getArray()[i].getData("backend") instanceof Hero)){
                params.scene.teamASprites.children.getArray()[i].getData("backend").gainXP({scene: params.scene, amount: this.calculateNextLevelXp() * 0.8});
                params.scene.teamASprites.children.getArray()[i].getData("backend").earnGold({scene: params.scene, amount: this.calculateBounty() * 0.8});
                }
            }
            }
        }else if(parseInt(this.lastHitBy.split("#")[1]) == params.scene.groups[0] || parseInt(this.lastHitBy.split("#")[1]) == params.scene.groups[4]){
            if(parseInt(this.lastHitBy.split("#")[1]) != params.scene.groups[4]){
            for(var i = 0; i < params.scene.teamASprites.children.getArray().length; i++){
                if(params.scene.teamASprites.children.getArray()[i].getData("backend").name == this.lastHitBy.split("#")[0] && (params.scene.teamASprites.children.getArray()[i].getData("backend") instanceof Hero)){
                    params.scene.teamASprites.children.getArray()[i].getData("backend").gainXP({scene: params.scene, amount: this.calculateNextLevelXp() * 0.8});
                    params.scene.teamASprites.children.getArray()[i].getData("backend").earnGold({scene: params.scene, amount: this.calculateBounty() * 0.8});
                }
            }
            }
        }else{
            return;
        }
    }
}