import {getInlineLinearFunction} from "../../main_layer/MathUtils.js";
import Skill from "./Skill.js";

/*plantilla: {
                    "name": "",
                    "effect": "",
                    "isUlti": false,
                    "damageType": 0,
                    "range":{},
                    "forEnemy": false,
                    "isPhysical": true,
                    "cooldown": 0,
                    "castpoint": 0,
                    "manaCost": 0,
                    "type": "self"
                  }, */
export default class Spell extends Skill{
    constructor(params){
        super({name: params.name, effect: params.effect, damageType: params.damageType, range: params.range, forEnemy: params.forEnemy, isPhysical: params.isPhysical});
        this.cooldown = getInlineLinearFunction(params.cooldown);
        this.curCooldown = 0;
        this.castpoint = params.castpoint;
        this.manaCost = getInlineLinearFunction(params.manaCost);
        this.type = params.type;
        this.isActive = false;
        //self: el hechizo se aplica a si mismo, projectile: crea un proyectil en la dirección, conic_projectile: lo mismo, pero el area crece, melee: crea un attackBox, modifier: usa como castPoint atSpeed y agrega efectos onAttackHit, area: crea un area a su alrededor, area_point: crea un area en el punto escogido, direction: capta la dirección actual y la usa para su funcionalidad
    }
    
    getManaCost(level){
        return this.manaCost.calculate(level);
    }
    getCooldown(level){
        return this.cooldown.calculate(level);
    }
}