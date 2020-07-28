import NonPlayable from "./NonPlayable.js";
import CharacterFactory from "./CharacterFactory.js";

export default class NPCFactory extends CharacterFactory{
  constructor(properties, spawnProperties, group, mask) {
    super(properties, spawnProperties, group, mask);
    this.level = 0;
  }

  generateLogic(propertie, spawnPoint) {
    return new NonPlayable(
      propertie.name,
      this.level,
      propertie.character.xpFactor,
      propertie.character.bountyFactor,
      propertie.character.race,
      propertie.character.fortitude.calculate(this.level),
      propertie.character.damage.calculate(this.level),
      propertie.character.armor.calculate(this.level),
      propertie.character.maxHealth.calculate(this.level),
      propertie.character.healthRegen.calculate(this.level),
      propertie.character.speed.calculate(this.level),
      propertie.character.atSpeed.calculate(this.level),
      propertie.character.evasion.calculate(this.level),
      propertie.character.crit.calculate(this.level),
      propertie.character.accuracy.calculate(this.level),
      propertie.character.maxMana.calculate(this.level),
      propertie.character.manaRegen.calculate(this.level),
      propertie.character.spellPower.calculate(this.level),
      propertie.character.will.calculate(this.level),
      propertie.character.magicArmor.calculate(this.level),
      propertie.character.concentration.calculate(this.level), 
      spawnPoint,
      propertie.character.onCrit,
      propertie.character.critMultiplier,
      propertie.character.ranged,
      propertie.character.range,
      propertie.character.detectionRange,
      propertie.character.behavour
    );
  }

  onUpdate(scene, group, scaleRatio, clock){
    super.onUpdate(scene, group, scaleRatio);
    this.level = 1 + Math.floor(clock/2160);
  }
}
