import Entity from "./Entity.js";
import { degToRad, getRotation} from "../main_layer/MathUtils.js";

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

    calculateSpawnTime(){
        return ((this.level * 2.25) + 3.75) * 60
    }

    //funciones sore eventos
    onDeath(params){
        params.sprite.setVisible(false);
        params.factory.kill({x: this.spawnX, y: this.spawnY}, this.calculateSpawnTime(), 0);
        params.world.remove(params.sprite.body);
        return [this.calculateNextLevelXp(), this.calculateBounty()];
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
            35 * (9.84 / gameObject.scene.scaleRatio),
            36 * (9.84 / gameObject.scene.scaleRatio),
            {
              isSensor: true,
              angle: degToRad(gameObject.angle),
              render: { visible: true, lineColor: 0x00ff00 },
            }
          );
          attackBox.label = "attackBox." + gameObject.getData("backend").name;
          if (gameObject.body.collisionFilter.group == gameObject.scene.groups[0]) {
            attackBox.collisionFilter.category = gameObject.scene.categories[0];
          } else if (gameObject.body.collisionFilter.group == gameObject.scene.groups[1]) {
            attackBox.collisionFilter.category = gameObject.scene.categories[2];
          }
        }else{
          //crear proyectil para ataque a distancia, pendiente creacion de clase proyectil
        }
    
        gameObject.play("attack_" + gameObject.getData("backend").name + "_end");
        console.log("bodies in world:", gameObject.scene.matter.world.getAllBodies());
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