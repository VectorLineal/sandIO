import Entity from "./Entity.js";
import Hero from "./Hero.js";

export default class Character extends Entity{
    constructor(name, level, xpFactor, bountyFactor, race, fortitude, damage, armor, maxHealth, healthRegen, speed, atSpeed, evasion, crit, accuracy, maxMana, manaRegen, spellPower, will, magicArmor, concentration, spawnPoint, ranged, range){
        super(name, level, xpFactor, bountyFactor, damage, armor, evasion, maxHealth, healthRegen, atSpeed, accuracy, magicArmor, ranged, range);
        this.race = race;
        this.isBoss = false;

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

    //funciones no gráficas
    spendMana(params){
      this.curMana += params.amount;
    }

    applyManaRegen(params){
      if(this.curMana >= this.maxMana){
          this.curMana = this.maxMana;
      }else{
          this.curMana += (this.manaRegen / 60);
      }
    }

    restoreMana(){
      this.curMana = this.maxMana;
    }

    //funciones sobre eventos
    onDeath(params){
        //si el último que dio el golpe es una criatura neutral, no se reparte ni xp ni oro por lo que la función termina su ejecución acá
        //se reparte oro y xp al último que dio el golpe siemre y cuando sea un heroe
        var category = 0;
        if(parseInt(this.lastHitBy.split("#")[1]) == params.scene.groups[1] || parseInt(this.lastHitBy.split("#")[1]) == params.scene.groups[4]){
            category = params.scene.categories[3];
            if(parseInt(this.lastHitBy.split("#")[1]) != params.scene.groups[4]){
            for(var i = 0; i < VREyeParameters.scene.teamBSprites.children.getArray().length; i++){
                if(params.scene.teamASprites.children.getArray()[i].getData("backend").name == this.lastHitBy.split("#")[0] && (params.scene.teamASprites.children.getArray()[i].getData("backend") instanceof Hero)){
                params.scene.teamASprites.children.getArray()[i].getData("backend").gainXP({scene: params.scene, amount: this.calculateNextLevelXp() * 0.8});
                params.scene.teamASprites.children.getArray()[i].getData("backend").earnGold({scene: params.scene, amount: this.calculateBounty() * 0.8});
                }
            }
            }
        }else if(parseInt(this.lastHitBy.split("#")[1]) == params.scene.groups[0] || parseInt(this.lastHitBy.split("#")[1]) == params.scene.groups[4]){
            category = params.scene.categories[1];
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

        //se reparte oro y xp a los que estaban cerca aquien murió
        var givesGold = "0";
        var bounty=[this.calculateNextLevelXp() * 0.2, 0];

        if(this.constructor instanceof Hero || this.isBoss){
            givesGold = "1";
            bounty[1] = this.calculateBounty() * 0.2;
        }

        params.scene.matter.add.circle(params.body.position.x, params.body.position.y, 150 * params.scaleRatio, {
        collisionFilter:{
            category: category
        },
        label: "bountyBox." + this.name + "#" + givesGold,
        isSensor: true,
        onCollideEndCallback: function(event, bodyA, bodyB){
            return bounty;
        }
        });
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

    commitSpellq(animation, frame, gameObject) {
        gameObject.scene.lastKeyPressed = "";
    }
    commitSpelle(animation, frame, gameObject) {
        gameObject.scene.lastKeyPressed = "";
    }
    commitSpellf(animation, frame, gameObject) {
        gameObject.scene.lastKeyPressed = "";
    }
    commitSpellr(animation, frame, gameObject) {
        gameObject.scene.lastKeyPressed = "";
    }
}