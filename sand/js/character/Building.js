import Entity from "./Entity.js";
import {randomInt, randomFloat} from "../main_layer/MathUtils.js";

export default class Building extends Entity{
    constructor(name, level, xpFactor, damage, armor, maxHealth, healthRegen, atSpeed, accuracy, magicArmor, ranged, range, type){
        super(name, level, xpFactor, damage, armor, maxHealth, healthRegen, atSpeed, accuracy, magicArmor, ranged, range);
        this.type = type; //0: enviromental element (árboles, piedras, etc), renovable, 1: torres o demás edificios no renovables, 2: puerta, elemento no renovable e interactivo, 3: objetivo del juego
        switch(type){
            case 0:
                this.onDeath = function(params){
                    params.sprite.setFrame(1);
                    params.sprite.setDepth(0.2);
                    params.sprite.getData("respawnTimer").time = 1800 + randomInt(5400);
                    params.world.remove(params.sprite.body);
                    return this.calculateNextLevelXp();
                }
                break;
            case 1, 2:
                this.onDeath = function(params){
                    return this.calculateNextLevelXp();
                }
                break;
            case 3:
                this.onDeath = function(params){
                    //end game somehow
                    return this.calculateNextLevelXp();
                }
                break;
            default:
                console.log(type, " is not a valid type, 0: envirometal elemnts, 1: static structures, 2: static interactable structures, 3: game objective");
                this.onDeath = function(params){
                    return this.calculateNextLevelXp();
                }
                break;
        }
    }

    takeDamage(params){ //amount, type, accuracy, critChance, critMultiplier, avoidable, critable, ranged
        //type 0 es puro, 1 físico y 2 mágico
        var rawDamage = params.amount;
        var crit = false;
        var finalDamage = 0;
        if(params.critable){
            if(randomFloat(101) <= params.critChance){
                rawDamage *= params.critMultiplier;
                crit = true;
            }
        }
        finalDamage = this.dealDamage(rawDamage, params.type);
        return {amount: finalDamage, isCrit: crit};
    }
}