import {randomInt} from "../main_layer/MathUtils.js";
import Hero from "./Hero.js";
import Playable from "./Playable.js";

export default class CharacterFactory{ //esta es en teoría una clase abstracta
    constructor(properties, spawnProperties, group, mask, respawnMeanTime) {
        this.spriteProperties = properties; //se refiere a un arreglo de septuplas tipo {name, width, height, frameWidth, frameHeight, centerX, centerY, character, animations}
        this.group = group;
        this.mask = mask;
        this.respawnMeanTime = respawnMeanTime;
        this.spawnProperties = []; //spawns se refiere a los índices del arreglo properties, indica posibles NPCs que pueden spawnear en esete punto
        for(var index = 0; index < spawnProperties.length; index++){
          this.spawnProperties.push({spawnX: spawnProperties[index].x, spawnY: spawnProperties[index].y, spawns: spawnProperties[index].spawns, timer: -1}); 
        }
    }

    searchIndex(x, y){
        for(var index = 0; index < this.spawnProperties.length; index++){
          if(this.spawnProperties[index].spawnX == x && this.spawnProperties[index].spawnY == y){
            return index;
          }
        }
        console.log("el elemento {", x, ",", y, "} no se encuentra en la lista de puntos de respawn.");
        return -1;
    }

    kill(spawnPoint, respawnTime, respawnTimeDelta){
        let position = this.searchIndex(spawnPoint.x, spawnPoint.y);
        if(position == -1){
          return;
        }
        this.spawnProperties[position].timer = respawnTime + randomInt(respawnTimeDelta);
    }

    generateLogic(propertie, spawnPoint) {}

    generateHitBox(propertie){
      if(!propertie.centerX && !propertie.centerY){
        return {
          shape: {
            type: "rectangle",
            width: propertie.width,
            height: propertie.height,
          },
          render: {
            sprite: {
              xOffset: (propertie.frameWidth - propertie.width / 2 - 1) / propertie.frameWidth - 0.5,
              yOffset: -((propertie.frameHeight - propertie.height - 1) / 2 / propertie.frameHeight),
            },
          },
        };
      }else if(propertie.centerX && !propertie.centerY){
        return {
          shape: {
            type: "rectangle",
            width: propertie.width,
            height: propertie.height,
          },
          render: {
            sprite: {
              yOffset: -((propertie.frameHeight - propertie.height - 1) / 2 / propertie.frameHeight)
            },
          },
        };
      }else if(!propertie.centerX && propertie.centerY){
        return {
          shape: {
            type: "rectangle",
            width: propertie.width,
            height: propertie.height,
          },
          render: {
            sprite: {
              xOffset: (propertie.frameWidth - propertie.width / 2 - 1) / propertie.frameWidth - 0.5
            },
          },
        };
      }else{
        return {
          shape: {
            type: "rectangle",
            width: propertie.width,
            height: propertie.height,
          },
          render: {
            sprite:{
              xOffset: 0,
              yOffset: 0
            }
          }
        };
      }
    }

    generateSprite(scene, group, scaleRatio, propertie, index){
        var sprite = scene.matter.add.sprite(this.spawnProperties[index].spawnX * scaleRatio, this.spawnProperties[index].spawnY * scaleRatio, propertie.name, null, this.generateHitBox(propertie));
        
        sprite.setScale(scaleRatio);
        sprite.setData("backend", this.generateLogic(propertie, {x: this.spawnProperties[index].spawnX, y: this.spawnProperties[index].spawnY}));
        //se decide el color de la barra de vida, diferente para jugadores y npcs
        var color = 0;
        var underColor = 0;
        /*if(sprite.getData("backend") instanceof Playable){
          color = 0x0000ff;
          underColor = 0xffff00;
        }else */if(sprite.getData("backend") instanceof Hero){
          color = 0x00ff00;
          underColor = 0xff00ff;
        }else{
          color = 0xff0000;
          underColor = 0x00ffff;
        }
        sprite.setData("underBar", scene.add.rectangle(sprite.x, sprite.y, sprite.body.shape.width * scaleRatio, 6 * scaleRatio, underColor).setDepth(1).setAlpha(0.2));
        sprite.setData("healthBar", scene.add.rectangle(sprite.x, sprite.y, (sprite.getData("backend").curHealth / sprite.getData("backend").maxHealth * sprite.body.shape.width) * scaleRatio, 6 * scaleRatio, color).setDepth(1).setAlpha(0.4));
        sprite.setData("shieldBar", scene.add.rectangle(sprite.x + sprite.getData("healthBar").width, sprite.y, sprite.getData("healthBar").width, 6 * scaleRatio, 0xaaaaaa).setDepth(1).setAlpha(0.4));
        sprite.setData("displayDamage", scene.add.text(sprite.x, sprite.y, "", { font: '48px Arial', fill: '#eeeeee' }).setDepth(1).setData("timer", 0).setScale(0.2 * scaleRatio));
        sprite.body.label = propertie.name;
        sprite.body.frictionAir = 0.1;
        sprite.setCollisionGroup(this.group);
        sprite.setCollidesWith(this.mask);
        sprite.setDepth(0.5);
        sprite.getData("backend").addAnimation(scene, "attack_" + sprite.getData("backend").name, propertie.animations.attack);
        sprite.getData("backend").addAnimation(scene, "attack_" + sprite.getData("backend").name + "_end", propertie.animations.attackEnd);
        sprite.on("animationcomplete-attack_" + sprite.getData("backend").name, sprite.getData("backend").commitAttack, this);

        if(propertie.animations.q != null){
          sprite.getData("backend").addAnimation(scene, "spellq_" + sprite.getData("backend").name, propertie.animations.q);
          sprite.on("animationcomplete-spellq_" + sprite.getData("backend").name, sprite.getData("backend").commitSpellq, this);
        }
        if(propertie.animations.e != null){
          sprite.getData("backend").addAnimation(scene, "spelle_" + sprite.getData("backend").name, propertie.animations.e);
          sprite.on("animationcomplete-spelle_" + sprite.getData("backend").name, sprite.getData("backend").commitSpelle, this);
        }
        if(propertie.animations.f != null){
          sprite.getData("backend").addAnimation(scene, "spellf_" + sprite.getData("backend").name, propertie.animations.f);
          sprite.on("animationcomplete-spellf_" + sprite.getData("backend").name, sprite.getData("backend").commitSpellf, this);
        }
        if(propertie.animations.r != null){
          sprite.getData("backend").addAnimation(scene, "spellr_" + sprite.getData("backend").name, propertie.animations.r);
          sprite.on("animationcomplete-spellr_" + sprite.getData("backend").name, sprite.getData("backend").commitSpellr, this);
        }
        sprite.getData("backend").rebalanceAttackAnimations(scene);
        group.add(sprite);
    }

    generateInitialSet(scene, group, scaleRatio){
        for(var index = 0; index < this.spawnProperties.length; index++){
          let creatureIndex = randomInt(this.spawnProperties[index].spawns.length);
          this.generateSprite(scene, group, scaleRatio, this.spriteProperties[this.spawnProperties[index].spawns[creatureIndex]], index);
        }
    }

    respawn(params, index){
        let creatureIndex = randomInt(this.spawnProperties[index].spawns.length);
        this.generateSprite(params.scene, params.group, params.scaleRatio, this.spriteProperties[this.spawnProperties[index].spawns[creatureIndex]], index, creatureIndex);
        this.spawnProperties[index].timer = -1;
    }

    //funciones sobre eventos
    onUpdate(scene, group, scaleRatio){
        //se actualizna los tiempos de respawn y en tal caso de cumplirse alguno, se hace respawn
        for(var index = 0; index < this.spawnProperties.length; index++){
            if(this.spawnProperties[index].timer > 0){
                this.spawnProperties[index].timer--;
            }else if(this.spawnProperties[index].timer == 0){
                //se hace respawn del personaje
                this.respawn({scene: scene, group: group, scaleRatio: scaleRatio}, index);
            }
        }
        group.children.each(function(entity){
            //se actualiza la regeneración de salud y mana
            if(!entity.getData('backend').isDead()){
              entity.getData('backend').applyHealthRegen({scene: scene});
              entity.getData('backend').applyManaRegen({scene: scene});
              entity.getData('underBar').x = entity.x;
              entity.getData('underBar').y = entity.y;
              entity.getData('healthBar').x = entity.x;
              entity.getData('healthBar').y = entity.y;
              entity.getData('healthBar').width = (entity.getData("backend").curHealth / (entity.getData("backend").maxHealth + entity.getData("backend").shield)) * entity.body.shape.width * scaleRatio;
              entity.getData('shieldBar').x = entity.x + entity.getData('healthBar').width;
              entity.getData('shieldBar').y = entity.y;
              entity.getData('shieldBar').width = (entity.getData("backend").shield / (entity.getData("backend").maxHealth + entity.getData("backend").shield)) * entity.body.shape.width * scaleRatio;;
              
            }
            
            //entity.setVelocity(0);
            
            //se actualizan los display de daño
            if(entity.getData("displayDamage").data.values.timer > 0){
                entity.getData("displayDamage").data.values.timer--;
            }else{
                entity.getData("displayDamage").setVisible(false);
            }
        });
    }
}