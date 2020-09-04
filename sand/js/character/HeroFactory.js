import Hero from "./Hero.js";
import Playable from "./Playable.js";
import CharacterFactory from "./CharacterFactory.js";
import {getInlineLinearFunction} from "../main_layer/MathUtils.js";

export default class Herofactory extends CharacterFactory {
  constructor(properties, spawnProperties, group, mask, respawnMeanTime) {
    super(properties, spawnProperties, group, mask, respawnMeanTime);
    this.playerIndex = -1;
    this.playerSpawnIndex = -1;
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
        console.log("this is not the player's Hero group");
        return {};
    }
  }

  generateLogic(propertie, spawnPoint) {
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
          propertie.character.bodyArmor,
          propertie.character.weapon,
          spawnPoint
          );
      }
  }

  generateInitialSet(scene, group, scaleRatio){
    super.generateInitialSet(scene, group, scaleRatio);
    this.setPlayerIndex(group);
    this.getPlayer(group).getData('backend').initialUpdate(scene);
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
                      friction: 1,
                      label: params.group.children.entries[i].getData('backend').name,
                      render: super.generateHitBox(propertie).render,
                    }
                  );
                  body.collisionFilter.group = this.group;
                  body.collisionFilter.mask = this.mask;
                  body.gameObject = params.group.children.entries[i];
                  params.group.children.entries[i].body = body;
                  params.group.children.entries[i].getData("backend").restoreHealth();
                  params.group.children.entries[i].getData("backend").restoreMana();
                  params.group.children.entries[i].getData("healthBar").setVisible(true);
                }
            }
        }
        this.spawnProperties[index].timer = -1;
    }

    //funciones sobre eventos
    onUpdate(scene, group, scaleRatio){
      super.onUpdate(scene, group, scaleRatio);
      if(this.getPlayer(group).getData("backend").isDead() && this.getPlayerTimer() % 60 == 0){
        scene.events.emit('updateRespawn');
      }
    }
}
