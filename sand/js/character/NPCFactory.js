import NonPlayable from "./NonPlayable.js";
import LinearFunction from "./LinearFunction.js";

export default class NPCFactory {
  constructor(
    name,
    xpFactor,
    race,
    fortitude,
    damage,
    armor,
    maxHealth,
    healthRegen,
    speed,
    atSpeed,
    evasion,
    crit,
    accuracy,
    maxMana,
    manaRegen,
    spellPower,
    will,
    magicArmor,
    concentration,
    spawnPoint, onCrit, critMultiplier, ranged, detectionRange, behavour
  ) {
    this.name = name;
    this.xpFactor = xpFactor;
    this.race = race;
    this.spawnPoint = spawnPoint;
    this.onCrit = onCrit;
    this.critMultiplier = critMultiplier;
    this.ranged = ranged;
    this.detectionRange = detectionRange;
    this.behavour = behavour
    this.fortitude = new LinearFunction(fortitude.increment, fortitude.base);
    this.damage = new LinearFunction(damage.increment, damage.base);
    this.armor = new LinearFunction(armor.increment, armor.base);
    this.maxHealth = new LinearFunction(maxHealth.increment, maxHealth.base);
    this.healthRegen = new LinearFunction(
      healthRegen.increment,
      healthRegen.base
    );
    this.speed = new LinearFunction(speed.increment, speed.base);
    this.atSpeed = new LinearFunction(atSpeed.increment, atSpeed.base);
    this.evasion = new LinearFunction(evasion.increment, evasion.base);
    this.crit = new LinearFunction(crit.increment, crit.base);
    this.accuracy = new LinearFunction(accuracy.increment, accuracy.base);
    this.maxMana = new LinearFunction(maxMana.increment, maxMana.base);
    this.manaRegen = new LinearFunction(manaRegen.increment, manaRegen.base);
    this.spellPower = new LinearFunction(spellPower.increment, spellPower.base);
    this.will = new LinearFunction(will.increment, will.base);
    this.magicArmor = new LinearFunction(magicArmor.increment, magicArmor.base);
    this.concentration = new LinearFunction(
      concentration.increment,
      concentration.base
    );
  }

  generateNPC(level) {
    return new NonPlayable(
      this.name,
      level,
      this.xpFactor,
      this.race,
      this.fortitude.calculate(level),
      this.damage.calculate(level),
      this.armor.calculate(level),
      this.maxHealth.calculate(level),
      this.healthRegen.calculate(level),
      this.speed.calculate(level),
      this.atSpeed.calculate(level),
      this.evasion.calculate(level),
      this.crit.calculate(level),
      this.accuracy.calculate(level),
      this.maxMana.calculate(level),
      this.manaRegen.calculate(level),
      this.spellPower.calculate(level),
      this.will.calculate(level),
      this.magicArmor.calculate(level),
      this.concentration.calculate(level), this.spawnPoint, this.onCrit, this.critMultiplier, this.ranged, this.detectionRange, this.behavour
    );
  }
}
