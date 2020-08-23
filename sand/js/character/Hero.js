import Atribute from "./Atribute.js";
import Character from "./Character.js";
import Armor from "./Armor.js";
import Weapon from "./Weapon.js";

export default class Hero extends Character {
  constructor(
    name,
    type,
    bountyFactor,
    race,Str, Res, Agi, Per, Int, Det,
    level,
    xpFactor,
    bodyArmor,
    weapon,
    spawnPoint
  ) {
    super(
      name,
      level,
      xpFactor,
      bountyFactor,
      race,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      spawnPoint
    );
    this.type = type;
    this.xp = 0;
    if (this.level >= 25) {
      this.xp = 13 * xpFactor;
      this.level = 25;
    }
    this.gold = 0;
    //referente a atributos del personaje
    this.str = new Atribute({name: "stregth", inline: Str});
    this.res = new Atribute({name: "resistance", inline: Res});
    this.agi = new Atribute({name: "agility", inline: Agi});
    this.per = new Atribute({name: "perception", inline: Per});
    this.int = new Atribute({name: "intelligence", inline: Int});
    this.det = new Atribute({name: "determination", inline: Det});
    this.str.update(level);
    this.res.update(level);
    this.agi.update(level);
    this.per.update(level);
    this.int.update(level);
    this.det.update(level);

    //equipamento del personaje
    this.weapon = new Weapon(
      weapon.name,
      weapon.onCrit,
      weapon.baseDamage,
      weapon.ranged,
      weapon.range,
      weapon.evasion,
      weapon.speed,
      weapon.atSpeed,
      weapon.accuracy,
      weapon.critMultiplier
    );
    this.bodyArmor = new Armor(
      bodyArmor.baseMagicArmor,
      bodyArmor.baseArmor,
      bodyArmor.evasion,
      bodyArmor.speed,
      bodyArmor.atSpeed,
      bodyArmor.accuracy
    );

    //stats del personaje como tal
    this.fortitude = this.str.getStat1() + this.res.getStat3();
    this.damage = 36 + this.weapon.getCurrentDamage() + this.str.getStat2();
    this.armor = this.bodyArmor.getCurrentArmor() + this.str.getStat3();
    this.maxHealth = 200 + this.res.getStat1();
    this.curHealth = this.maxHealth;
    this.healthRegen = 0.1 + this.res.getStat2();
    this.speed =
      this.weapon.speed + this.bodyArmor.speed + 28 + this.agi.getStat1();
    this.atSpeed =
      this.weapon.atSpeed + this.bodyArmor.atSpeed + 100 + this.agi.getStat2();
    this.evasion =
      this.weapon.evasion +
      this.bodyArmor.evasion +
      this.agi.getStat3() +
      this.per.getStat3();
    this.crit = this.per.getStat1();
    this.accuracy =
      this.bodyArmor.accuracy +
      this.weapon.accuracy +
      100 +
      this.per.getStat2();
    this.maxMana = 75 + this.int.getStat1();
    this.curMana = this.maxMana;
    this.manaRegen = 0.1 + this.int.getStat2();
    this.spellPower = this.int.getStat3();
    this.will = this.det.getStat1();
    this.magicArmor =
      this.bodyArmor.getCurrentMagicArmor() + this.det.getStat2();
    this.concentration = this.det.getStat3();
  }

  //funciones no gráficas
  getOnCrit() {
    return this.weapon.onCrit;
  }

  getCritMultiplier() {
    return this.weapon.critMultiplier;
  }

  getRange() {
    return this.weapon.range;
  }

  getRanged() {
    return this.weapon.ranged;
  }

  levelUp(scene) {
    this.str.update(this.level);
    this.res.update(this.level);
    this.agi.update(this.level);
    this.per.update(this.level);
    this.int.update(this.level);
    this.det.update(this.level);
    if (this.level <= 24) {
      this.level++;
      this.fortitude += 0.3 * (this.str.change.derivate() + this.res.change.derivate());
      this.damage += 2 * this.str.change.derivate();
      this.armor += 0.6 * this.str.change.derivate();
      this.maxHealth += 20 * this.res.change.derivate();
      this.curHealth += 20 * this.res.change.derivate();
      this.healthRegen += 0.2 * this.res.change.derivate();
      this.speed += 0.1 * this.agi.change.derivate();
      this.atSpeed += 4 * this.agi.change.derivate();

      //se tiene que actualizar la animación para que vaya acorde a la velocidad de ataque
      this.rebalanceAttackAnimations(scene);

      this.evasion += 0.3 * (this.agi.change.derivate() + this.per.change.derivate());
      this.crit += 0.15 * this.per.change.derivate();
      this.accuracy += 0.4 * this.per.change.derivate();
      this.maxMana += 12 * this.int.change.derivate();
      this.curMana += 12 * this.int.change.derivate();
      this.manaRegen += 0.1 * this.int.change.derivate();
      this.spellPower += 0.2 * this.int.change.derivate();
      this.will += 0.6 * this.det.change.derivate();
      this.magicArmor += 0.6 * this.det.change.derivate();
      this.concentration += 0.6 * this.det.change.derivate();
    }
  }

  balanceXp(scene){
    var overflow = 0;
    if (this.xp >= this.calculateNextLevelXp()) {
      overflow = this.xp - this.calculateNextLevelXp();
      this.levelUp(scene);
      if (this.level <= 24) {
        this.xp = overflow;
        return this.balanceXp(scene);
      } else {
        this.xp = 13 * this.xpFactor;
        return;
      }
    }else{
      return;
    }
  }

  gainXP(params) {
    if (this.level <= 24) {
      this.xp += params.amount;
      this.balanceXp(params.scene);
    }
  }

  earnGold(params) {
    this.gold += params.amount;
  }

  calculateSpawnTime(){
    return ((this.level * 2.25) + 3.75) * 60
  }

  //funciones sobre eventos
  onDeath(params){
    params.sprite.anims.stopOnFrame(0);
    params.sprite.setVisible(false);
    params.factory.kill({x: this.spawnX, y: this.spawnY}, this.calculateSpawnTime(), 0);
    params.scene.matter.world.remove(params.sprite.body);
    this.curHealth = 0;
    super.onDeath(params);
  }
}
