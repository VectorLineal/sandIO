import Hero from "./Hero.js";
import Playable from "./Playable.js";
import CharacterFactory from "./CharacterFactory.js";
import {getInlineLinearFunction} from "../main_layer/MathUtils.js";

export default class Herofactory extends CharacterFactory {
  constructor(properties, spawnProperties, group, mask, respawnMeanTime, classes, races) {
    super(properties, spawnProperties, group, mask, respawnMeanTime);
    this.playerIndex = -1;
    this.playerSpawnIndex = -1;
    this.classes = classes;
    this.races = races;
    for(var i = 0; i< this.spriteProperties.length; i++){
      if(this.spriteProperties[i].player){
        for(var j = 0; j< this.spawnProperties.length; j++){
          if(this.spawnProperties[j].spawns[0] == i){
            this.playerSpawnIndex = j;
            break;
          }
        }
      }
    }
  }

  getPlayerTimer(){
      if(this.playerSpawnIndex >= 0){
        return this.spawnProperties[this.playerSpawnIndex].timer;
      }
  }

  setPlayerIndex(group){
      for(var index = 0; index < group.children.entries.length; index++){
        if(group.children.entries[index].getData('backend').constructor.name == Playable.name){
            this.playerIndex = index;
            break;
        }
      }
  }

  getPlayer(group){
    if(this.playerIndex > -1){
        return group.children.entries[this.playerIndex];
    }else{
        return null;
    }
  }

  generateLogic(propertie, spawnPoint) {
    propertie.character.skills.pasives.push({
      name: propertie.character.type,
      effect: this.classes[propertie.character.type].effect,
      forEnemy: this.classes[propertie.character.type].forEnemy
    });
    propertie.character.skills.pasives.push({
      name: propertie.character.race,
      effect: this.races[propertie.character.race].effect,
      forEnemy: this.races[propertie.character.race].forEnemy
    });
      if(propertie.player){
        return new Playable(
            propertie.name,
            propertie.character.type,
            propertie.character.bountyFactor,
            propertie.character.race,
            getInlineLinearFunction(propertie.character.Str),
            getInlineLinearFunction(propertie.character.Res),
            getInlineLinearFunction(propertie.character.Agi),
            getInlineLinearFunction(propertie.character.Per),
            getInlineLinearFunction(propertie.character.Int),
            getInlineLinearFunction(propertie.character.Det),
            1,
            propertie.character.xpFactor,
            propertie.character.skills,
            propertie.character.bodyArmor,
            propertie.character.weapon,
            spawnPoint
          );
      }else{
        return new Hero(
          propertie.name,
          propertie.character.type,
          propertie.character.bountyFactor,
          propertie.character.race,
          getInlineLinearFunction(propertie.character.Str),
          getInlineLinearFunction(propertie.character.Res),
          getInlineLinearFunction(propertie.character.Agi),
          getInlineLinearFunction(propertie.character.Per),
          getInlineLinearFunction(propertie.character.Int),
          getInlineLinearFunction(propertie.character.Det),
          1,
          propertie.character.xpFactor,
          propertie.character.skills,
          propertie.character.bodyArmor,
          propertie.character.weapon,
          spawnPoint
          );
      }
  }

  generateInitialSet(scene, group, scaleRatio){
    super.generateInitialSet(scene, group, scaleRatio);
    this.setPlayerIndex(group);
    if(this.getPlayer(group) != null){
      this.getPlayer(group).getData('backend').initialUpdate(scene);
      console.log("actualizo los tats base");
    }
    
  }

    respawn(params, index){
        let creatureIndex = this.spawnProperties[index].spawns[0];
        let propertie = this.spriteProperties[creatureIndex];
        for(var i = 0; i < params.group.children.entries.length; i++){
            if(params.group.children.entries[i].getData('backend').name == this.spriteProperties[this.spawnProperties[index].spawns[0]].name){
              console.log(params.group.children.entries[i].getData('backend').name, "will respawn");
              params.group.children.entries[i].x = this.spawnProperties[index].spawnX * params.scaleRatio;
              params.group.children.entries[i].y = this.spawnProperties[index].spawnY * params.scaleRatio;
              params.group.children.entries[i].setVisible(true);

                if(!params.scene.matter.world.has(params.group.children.entries[i].body)){
                  var body = params.scene.matter.add.rectangle(params.group.children.entries[i].x, params.group.children.entries[i].y, super.generateHitBox(propertie).shape.width * params.scaleRatio, super.generateHitBox(propertie).shape.height * params.scaleRatio,
                    {
                      frictionAir: 0.1,
                      label: params.group.children.entries[i].getData('backend').name,
                      render: super.generateHitBox(propertie).render,
                    }
                  );
                  body.shape = {
                    width: super.generateHitBox(propertie).shape.width,
                    height: super.generateHitBox(propertie).shape.height
                  };
                  body.collisionFilter.group = this.group;
                  body.collisionFilter.mask = this.mask;
                  body.gameObject = params.group.children.entries[i];
                  params.group.children.entries[i].body = body;
                  //console.log(params.group.children.entries[i].getData('backend').name,"body is", params.group.children.entries[i].body);
                  params.group.children.entries[i].getData('backend').restoreHealth();
                  params.group.children.entries[i].getData('backend').restoreMana();
                  params.group.children.entries[i].getData("underBar").setVisible(true);
                  params.group.children.entries[i].getData("healthBar").setVisible(true);
                  params.group.children.entries[i].getData("shieldBar").setVisible(true);
                }
            }
        }
        this.spawnProperties[index].timer = -1;
    }

    //funciones sobre eventos
    onUpdate(scene, group, scaleRatio){
      super.onUpdate(scene, group, scaleRatio);
      group.children.each(function(entity){
        entity.getData('backend').gold += 1/60;
      });

      if(this.getPlayer(group) != null){
        if(this.getPlayer(group).getData('backend').isDead() && this.getPlayerTimer() % 60 == 0){
          scene.events.emit('updateRespawn');
        }
        if(scene.clock % 60 == 0){
          scene.events.emit('updateGold');
        }
      }
    }
}
