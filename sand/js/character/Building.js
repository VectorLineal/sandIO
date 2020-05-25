import Entity from "./Entity.js";
export default class Building extends Entity{
    constructor(name, level, xpFactor, damage, armor, maxHealth, healthRegen, atSpeed, accuracy, magicArmor, ranged, range, type, onDeath){
        super(name, level, xpFactor, damage, armor, maxHealth, healthRegen, atSpeed, accuracy, magicArmor, ranged, range);
        this.type = type; //0: estática, 1: torre, 2: puerta
        this.onDeath = onDeath; //ganar parteida en caso de destruir base, dar xp en caso de destruir torre o reaparecer un árbol tras un tiempo en caso de árbol
    }
}