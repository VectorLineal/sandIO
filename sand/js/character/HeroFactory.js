import Hero from "./Hero.js";
import Playable from "./Playable.js";
import CharacterFactory from "./CharacterFactory.js";

export default class Herofactory extends CharacterFactory {
  constructor(properties, spawnProperties, group, mask) {
    super(properties, spawnProperties, group, mask);
    this.playerIndex = -1;
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
            propertie.character.baseStr,
            propertie.character.strGrowth,
            propertie.character.baseRes,
            propertie.character.resGrowth,
            propertie.character.baseAgi,
            propertie.character.agiGrowth,
            propertie.character.basePer,
            propertie.character.perGrowth,
            propertie.character.baseInt,
            propertie.character.intGrowth,
            propertie.character.baseDet,
            propertie.character.detGrowth,
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
            propertie.character.baseStr,
            propertie.character.strGrowth,
            propertie.character.baseRes,
            propertie.character.resGrowth,
            propertie.character.baseAgi,
            propertie.character.agiGrowth,
            propertie.character.basePer,
            propertie.character.perGrowth,
            propertie.character.baseInt,
            propertie.character.intGrowth,
            propertie.character.baseDet,
            propertie.character.detGrowth,
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
          console.log(params.group.children.entries[i].getData('backend').name, "will respawn?");
          console.log("meant to respawn:", this.spriteProperties[this.spawnProperties[index].spawns[0]].name);
            if(params.group.children.entries[i].getData('backend').name == this.spriteProperties[this.spawnProperties[index].spawns[0]].name){
              console.log(params.group.children.entries[i].getData('backend').name, "will respawn");
              params.group.children.entries[i].x = this.spawnProperties[index].spawnX * params.scaleRatio;
              params.group.children.entries[i].y = this.spawnProperties[index].spawnY * params.scaleRatio;
              params.group.children.entries[i].setVisible(true);

                if(!params.scene.matter.world.has(params.group.children.entries[i].body)){
                  var body = params.scene.matter.add.rectangle(params.group.children.entries[i].x, params.group.children.entries[i].y, super.generateHitBox(propertie).shape.width * params.scaleRatio, super.generateHitBox(propertie).shape.height * params.scaleRatio,
                    {
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
                }
            }
        }
        this.spawnProperties[index].timer = -1;
    }
}
