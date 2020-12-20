import Hero from "./Hero.js";

export default class Playable extends Hero{
    constructor(name, type, bountyFactor, race, baseStr, strGrowth, baseRes, resGrowth, baseAgi, agiGrowth, basePer, perGrowth, baseInt, intGrowth, baseDet, detGrowth, level, xpFactor, skills, bodyArmor, weapon, spawnPoint){
        super(name, type, bountyFactor, race, baseStr, strGrowth, baseRes, resGrowth, baseAgi, agiGrowth, basePer, perGrowth, baseInt, intGrowth, baseDet, detGrowth, level, xpFactor, skills, bodyArmor, weapon, spawnPoint);
    }

    initialUpdate(scene){
        scene.events.emit('updateLevel');
        scene.events.emit('updateStats');
        scene.events.emit('updateMaxHealth');
        scene.events.emit('updateHealth');
        scene.events.emit('updateHealthRegen');
        scene.events.emit('updateMaxMana');
        scene.events.emit('updateMana');
        scene.events.emit('updateManaRegen');
        scene.events.emit('updateCooldowns');
    }

    updateCooldowns(params){
        super.updateCooldowns(params);
        params.scene.events.emit('updateCooldowns');
    }

    takeDamage(params){ //scene, amount, type, accuracy, critChance, critMultiplier, avoidable, critable, ranged
        let result = super.takeDamage(params);
        params.scene.events.emit('updateHealth');
        return result;
    }

    applyHealthRegen(params){
        super.applyHealthRegen({});
        params.scene.events.emit('updateHealth');
    }

    spendMana(params){
        super.spendMana({amount: params.amount});
        params.scene.events.emit('updateMana');
    }

    applyManaRegen(params){
        super.applyManaRegen({});
        params.scene.events.emit('updateMana');
    }

    levelUp(scene){
        super.levelUp(scene);
        scene.events.emit('updateLevel');
        scene.events.emit('updateStats');
        scene.events.emit('updateMaxHealth');
        scene.events.emit('updateHealth');
        scene.events.emit('updateHealthRegen');
        scene.events.emit('updateMaxMana');
        scene.events.emit('updateMana');
        scene.events.emit('updateManaRegen');
    }

    gainXP(params){
        super.gainXP(params);
        params.scene.events.emit('updateXP');
    }

    earnGold(params){
        super.earnGold({amount: params.amount});
        params.scene.events.emit('updateGold');
    }

    //funciones sobre eventos
    onDeath(params){
        super.onDeath(params);
        params.scene.events.emit('updateRespawn');
    }
}