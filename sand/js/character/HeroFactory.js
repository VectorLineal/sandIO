import Hero from "./Hero.js";
import Playable from "./Playable.js";
import CharacterFactory from "./CharacterFactory.js";

export default class Herofactory extends CharacterFactory {
  constructor(properties, spawnProperties, group, mask) {
    super(properties, spawnProperties, group, mask);
    this.playerIndex = -1;
  }

  setPlayerIndex(group){
      for(var index; index < group.children.entries.length; index++){
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
        console.log("this is not player's Hero group");
        return {};
    }
  }

  generateLogic(propertie, spawnPoint) {
      if(this.spriteProperties[index].player){
        return new Playable(
            propertie.character.name,
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
            0,
            propertie.character.xpFactor,
            propertie.character.bodyArmor,
            propertie.character.weapon,
            spawnPoint
          );
      }else{
        return new Hero(
            propertie.character.name,
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
            0,
            propertie.character.xpFactor,
            propertie.character.bodyArmor,
            propertie.character.weapon,
            spawnPoint
          );
      }
  }

    respawn(params, index){
        let creatureIndex = this.spawnProperties[index].spawns[0];
        for(var i = 0; i < params.group.children.entries.length; i++){
            if(params.group.children.entries[i].getData('backend').name == this.spawnProperties[index].name){
                params.group.children.entries[i].setVisible(true);
            }
        }
        this.spawnProperties[index].timer = -1;
    }
}
