import Entity from "./Entity.js";
import {randomInt} from "../main_layer/MathUtils.js";

export default class Building extends Entity{
    constructor(name, level, xpFactor, bountyFactor, damage, armor, maxHealth, healthRegen, atSpeed, accuracy, magicArmor, ranged, range, type){
        super(name, level, xpFactor, bountyFactor, damage, armor, 0, maxHealth, healthRegen, atSpeed, accuracy, magicArmor, ranged, range);
        this.type = type; //0: enviromental element (árboles, piedras, etc), renovable, 1: torres o demás edificios no renovables, 2: puerta, elemento no renovable e interactivo, 3: objetivo del juego
        switch(type){
            case 0:
                this.onDeath = function(params){
                    params.sprite.setFrame(1);
                    params.sprite.setDepth(0.2);
                    params.sprite.getData("respawnTimer").time = 1800 + randomInt(5400);
                    params.world.remove(params.sprite.body);
                    return [this.calculateNextLevelXp(), this.calculateBounty()];
                }
                break;
            case 1, 2:
                this.onDeath = function(params){
                    params.sprite.getData("displayDamage").destroy();
                    params.group.remove(params.sprite, true, true);
                    return [this.calculateNextLevelXp(), this.calculateBounty()];
                }
                break;
            case 3:
                this.onDeath = function(params){
                    params.sprite.setFrame(1);
                    params.sprite.setDepth(0.2);
                    params.world.remove(params.sprite.body);
                    //end game somehow
                    return [0, 0];
                }
                break;
            default:
                console.log(type, " is not a valid type, 0: envirometal elemnts, 1: static structures, 2: static interactable structures, 3: game objective");
                this.onDeath = function(params){
                    params.sprite.getData("displayDamage").destroy();
                    params.group.remove(params.sprite, true, true);
                    return [this.calculateNextLevelXp(), this.calculateBounty()];
                }
                break;
        }
    }
}