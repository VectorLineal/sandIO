import Hero from "./Hero.js";

export default class Playable extends Hero{
    constructor(name, type, bountyFactor, race, baseStr, strGrowth, baseRes, resGrowth, baseAgi, agiGrowth, basePer, perGrowth, baseInt, intGrowth, baseDet, detGrowth, level, xpFactor, bodyArmor, weapon, spawnPoint){
        super(name, type, bountyFactor, race, baseStr, strGrowth, baseRes, resGrowth, baseAgi, agiGrowth, basePer, perGrowth, baseInt, intGrowth, baseDet, detGrowth, level, xpFactor, bodyArmor, weapon, spawnPoint);
    }

    initialUpdate(scene){
        scene.events.emit('updateLevel');
        scene.events.emit('updateDamage');
        scene.events.emit('updateArmor');
        scene.events.emit('updateMaxHealth');
        scene.events.emit('updateHealth');
        scene.events.emit('updateHealthRegen');
        scene.events.emit('updateSpeed');
        scene.events.emit('updateAtSpeed');
        scene.events.emit('updateMaxMana');
        scene.events.emit('updateMana');
        scene.events.emit('updateManaRegen');
        scene.events.emit('updateSpellPower');
        scene.events.emit('updateMagicArmor');
        scene.events.emit('updateXP');
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
        scene.events.emit('updateDamage');
        scene.events.emit('updateArmor');
        scene.events.emit('updateMaxHealth');
        scene.events.emit('updateHealth');
        scene.events.emit('updateHealthRegen');
        scene.events.emit('updateSpeed');
        scene.events.emit('updateAtSpeed');
        scene.events.emit('updateMaxMana');
        scene.events.emit('updateMana');
        scene.events.emit('updateManaRegen');
        scene.events.emit('updateSpellPower');
        scene.events.emit('updateMagicArmor');
    }

    gainXP(params){
        var overflow = 0;
        if(this.level <= 24){
            this.xp += params.amount;
            params.scene.events.emit('updateXP');
            if(this.xp >= this.calculateNextLevelXp()){
                overflow = this.calculateNextLevelXp() - this.xp;
                this.levelUp(params.scene);
                if(this.level <= 24){
                    this.xp = - overflow;
                }else{
                    this.xp = 13 * this.xpFactor;
                }
                params.scene.events.emit('updateXP');
            }
        }
    }

    earnGold(params){
        super.earnGold({amount: params.amount});
        params.scene.events.emit('updateGold');
    }
}