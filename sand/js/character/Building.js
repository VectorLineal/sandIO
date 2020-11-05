import Entity from "./Entity.js";
import Hero from "./Hero.js";
import { randomInt } from "../main_layer/MathUtils.js";

export default class Building extends Entity {
  constructor(
    name,
    level,
    xpFactor,
    bountyFactor,
    damage,
    armor,
    maxHealth,
    healthRegen,
    atSpeed,
    accuracy,
    magicArmor,
    ranged,
    range,
    type
  ) {
    super(
      name,
      level,
      xpFactor,
      bountyFactor,
      damage,
      armor,
      0,
      maxHealth,
      healthRegen,
      atSpeed,
      accuracy,
      magicArmor,
      ranged,
      range
    );
    this.type = type; //0: enviromental element (árboles, piedras, etc), renovable, 1: torres o demás edificios no renovables, 2: puerta, elemento no renovable e interactivo, 3: objetivo del juego
    console.log("type", type);
    switch (type) {
      case 0:
        this.onDeath = function (params) {
          params.sprite.setFrame(1);
          params.sprite.setDepth(0.2);
          params.sprite.getData("respawnTimer").time = 1800 + randomInt(5400);
          params.scene.matter.world.remove(params.sprite.body);
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
        };
        break;
      case (1, 2):
        this.onDeath = function (params) {
          //params.sprite.getData("healthBar").destroy();
          params.sprite.getData("displayDamage").destroy();
          params.group.remove(params.sprite, true, true);
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
        };
        break;
      case 3:
        this.onDeath = function (params) {
          params.sprite.setFrame(1);
          params.sprite.setDepth(0.2);
          params.scene.matter.world.remove(params.sprite.body);
          //end game somehow
        };
        break;
      default:
        console.log(
          type,
          " is not a valid type, 0: envirometal elemnts, 1: static structures, 2: static interactable structures, 3: game objective"
        );
        this.onDeath = function (params) {
          //params.sprite.getData("healthBar").destroy();
          params.sprite.getData("displayDamage").destroy();
          params.group.remove(params.sprite, true, true);
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
        };
        break;
    }
  }
}
