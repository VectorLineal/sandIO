import NonPlayable from "./NonPlayable.js";
import CharacterFactory from "./CharacterFactory.js";
import {calculateInlineLinearFunction} from "../main_layer/MathUtils.js";

export default class NPCFactory extends CharacterFactory{
  constructor(properties, spawnProperties, group, mask, respawnMeanTime) {
    super(properties, spawnProperties, group, mask, respawnMeanTime);
    this.level = 0;
  }

  generateLogic(propertie, spawnPoint) {
    return new NonPlayable(
      propertie.name,
      this.level,
      propertie.character.xpFactor,
      propertie.character.bountyFactor,
      propertie.character.race,
      propertie.character.fortitude,
      calculateInlineLinearFunction(propertie.character.damage, this.level),
      calculateInlineLinearFunction(propertie.character.armor, this.level),
      calculateInlineLinearFunction(propertie.character.maxHealth, this.level),
      calculateInlineLinearFunction(propertie.character.healthRegen, this.level),
      calculateInlineLinearFunction(propertie.character.speed, this.level),
      calculateInlineLinearFunction(propertie.character.atSpeed, this.level),
      calculateInlineLinearFunction(propertie.character.evasion, this.level),
      calculateInlineLinearFunction(propertie.character.crit, this.level),
      calculateInlineLinearFunction(propertie.character.accuracy, this.level),
      calculateInlineLinearFunction(propertie.character.maxMana, this.level),
      calculateInlineLinearFunction(propertie.character.manaRegen, this.level),
      calculateInlineLinearFunction(propertie.character.spellPower, this.level),
      calculateInlineLinearFunction(propertie.character.will, this.level),
      calculateInlineLinearFunction(propertie.character.magicArmor, this.level),
      calculateInlineLinearFunction(propertie.character.concentration, this.level), 
      spawnPoint,
      propertie.character.onCrit,
      propertie.character.critMultiplier,
      propertie.character.ranged,
      propertie.character.range,
      propertie.character.detectionRange,
      propertie.character.behavour,
      propertie.character.isBoss
    );
  }

  onUpdate(scene, group, scaleRatio, clock){
    super.onUpdate(scene, group, scaleRatio);
    this.level = 1 + Math.floor(clock/2160);
  }
}
