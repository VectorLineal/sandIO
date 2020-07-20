import NonPlayable from "./NonPlayable.js";
import {randomInt, randomFloat} from "../main_layer/MathUtils.js";

export default class NPCFactory {
  constructor(properties, spawnProperties, group, mask) {
    this.spriteProperties = properties; //se refiere a un arreglo de septuplas tipo {name, width, height, frameWidth, frameHeight, centerX, centerY, character}
    this.level = 0;
    this.group = group;
    this.mask = mask;
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

  generateNPCLogic(index, spawnPoint) {
    return new NonPlayable(
      this.spriteProperties[index].name,
      this.level,
      this.spriteProperties[index].character.xpFactor,
      this.spriteProperties[index].character.bountyFactor,
      this.spriteProperties[index].character.race,
      this.spriteProperties[index].character.fortitude.calculate(this.level),
      this.spriteProperties[index].character.damage.calculate(this.level),
      this.spriteProperties[index].character.armor.calculate(this.level),
      this.spriteProperties[index].character.maxHealth.calculate(this.level),
      this.spriteProperties[index].character.healthRegen.calculate(this.level),
      this.spriteProperties[index].character.speed.calculate(this.level),
      this.spriteProperties[index].character.atSpeed.calculate(this.level),
      this.spriteProperties[index].character.evasion.calculate(this.level),
      this.spriteProperties[index].character.crit.calculate(this.level),
      this.spriteProperties[index].character.accuracy.calculate(this.level),
      this.spriteProperties[index].character.maxMana.calculate(this.level),
      this.spriteProperties[index].character.manaRegen.calculate(this.level),
      this.spriteProperties[index].character.spellPower.calculate(this.level),
      this.spriteProperties[index].character.will.calculate(this.level),
      this.spriteProperties[index].character.magicArmor.calculate(this.level),
      this.spriteProperties[index].character.concentration.calculate(this.level), 
      spawnPoint,
      this.spriteProperties[index].character.onCrit,
      this.spriteProperties[index].character.critMultiplier,
      this.spriteProperties[index].character.ranged,
      this.spriteProperties[index].character.range,
      this.spriteProperties[index].character.detectionRange,
      this.spriteProperties[index].character.behavour
    );
  }

  killNPC(spawnPoint, respawnTime, respawnTimeDelta){
    let position = this.searchIndex(spawnPoint.x, spawnPoint.y);
    if(position == -1){
      return;
    }
    this.spawnProperties[position].timer = respawnTime + randomInt(respawnTimeDelta);
  }

  generateSprite(scene, group, scaleRatio, propertie, index, creatureIndex){
    if(!propertie.centerX && !propertie.centerY){
      var sprite = scene.matter.add.sprite(this.spawnProperties[index].spawnX * scaleRatio, this.spawnProperties[index].spawnY * scaleRatio, propertie.name, null, {
        shape: {
          type: "rectangle",
          width: propertie.width,
          height: propertie.height,
        },
        render: {
          sprite: {
            xOffset: (propertie.frameWidth - propertie.width - 1 + propertie.width / 2) / propertie.frameWidth - 0.5,
            yOffset: -((propertie.frameHeight - propertie.height - 1) / 2 / propertie.frameHeight),
          },
        },
      });
    }else if(propertie.centerX && !propertie.centerY){
      var sprite = scene.matter.add.sprite(this.spawnProperties[index].spawnX * scaleRatio, this.spawnProperties[index].spawnY * scaleRatio, propertie.name, null, {
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
      });
    }else if(!propertie.centerX && propertie.centerY){
      var sprite = scene.matter.add.sprite(this.spawnProperties[index].spawnX * scaleRatio, this.spawnProperties[index].spawnY * scaleRatio, propertie.name, null, {
        shape: {
          type: "rectangle",
          width: propertie.width,
          height: propertie.height,
        },
        render: {
          sprite: {
            xOffset: (propertie.frameWidth - propertie.width - 1 + propertie.width / 2) / propertie.frameWidth - 0.5
          },
        },
      });
    }else{
      var sprite = scene.matter.add.sprite(this.spawnProperties[index].spawnX * scaleRatio, this.spawnProperties[index].spawnY * scaleRatio, propertie.name, null, {
        shape: {
          type: "rectangle",
          width: propertie.width,
          height: propertie.height,
        },
      });
    }
    sprite.setScale(scaleRatio);
    sprite.setData("backend", this.generateNPCLogic(this.spawnProperties[index].spawns[creatureIndex], {x: this.spawnProperties[index].spawnX, y: this.spawnProperties[index].spawnY}));
    console.log("NPC's level", this.level);
    sprite.setData("displayDamage", scene.add.text(sprite.x, sprite.y, "", { font: '48px Arial', fill: '#eeeeee' }).setDepth(1).setData("timer", 0));
    sprite.body.label = propertie.name;
    sprite.setCollisionGroup(this.group);
    sprite.setCollidesWith(this.mask);
    sprite.setDepth(0.5);
    group.add(sprite);
  }

  generateInitialSet(scene, group, scaleRatio){
    for(var index = 0; index < this.spawnProperties.length; index++){
      let creatureIndex = randomInt(this.spawnProperties[index].spawns.length);
      this.generateSprite(scene,group,scaleRatio, this.spriteProperties[this.spawnProperties[index].spawns[creatureIndex]], index, creatureIndex);
    }
  }

  //funciones sobre eventos
  onUpdate(scene, group, scaleRatio, clock){
    for(var index = 0; index < this.spawnProperties.length; index++){
      if(this.spawnProperties[index].timer > 0){
        this.spawnProperties[index].timer--;
      }else if(this.spawnProperties[index].timer == 0){
        //se hace respawn del NPC
        let creatureIndex = randomInt(this.spawnProperties[index].spawns.length);
        this.generateSprite(scene, group, scaleRatio, this.spriteProperties[this.spawnProperties[index].spawns[creatureIndex]], index, creatureIndex);
        this.spawnProperties[index].timer = -1;
      }
    }
    group.children.each(function(entity){
      if(entity.getData("displayDamage").data.values.timer > 0){
        entity.getData("displayDamage").data.values.timer--;
      }else{
        entity.getData("displayDamage").setVisible(false);
      }
    });
    this.level = 1 + Math.floor(clock/2160);
  }
}
