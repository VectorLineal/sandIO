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
      spawnPoint,
      0,
      false,
      0
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
      this.weapon.speed + this.bodyArmor.speed + 20 + this.agi.getStat1();
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
    return this.weapon.critMultiplier + this.critMultiplier;
  }

  getRange() {
    return this.weapon.range;
  }

  getRanged() {
    return this.weapon.ranged;
  }

  takeDamage(params){
    let damageStatus = super.takeDamage(params);
    //se actualizan las puntuaciones
    let punctuation = params.scene.getPunctuationByHeroAndGroup(this.name, params.body.collisionFilter.group);
    if(punctuation != null){
      punctuation.damageTaken += damageStatus.amount;
    }
    return damageStatus;
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
      this.speed += 0.02 * this.agi.change.derivate();
      this.atSpeed += 2 * this.agi.change.derivate();

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

  calculateSpawnTime(respawnMeanTime){
    return ((this.level * respawnMeanTime * 0.375) + (respawnMeanTime * 0.625));
  }

  //funciones sobre eventos
  onDeath(params){
    //limpiar todas las alteraciones de stats y cambios de estado
    this.shield = 0;
    
    //resetear animaciones a estado idle
    params.sprite.anims.stopOnFrame(0);
    params.sprite.setVisible(false);
    params.sprite.getData("underBar").setVisible(false);
    params.sprite.getData("healthBar").setVisible(false);
    params.sprite.getData("shieldBar").setVisible(false);
    this.statusManager.purge(this, true, params.scene);
    this.statusManager.purge(this, false, params.scene);
    params.factory.kill({x: this.spawnX, y: this.spawnY}, this.calculateSpawnTime(params.factory.respawnMeanTime), 0);
    params.scene.matter.world.remove(params.sprite.body);
    this.curHealth = 0;
    let category = super.onDeath(params);
    if(category == params.scene.categories[1]){
      for(var i = 0; i < params.scene.teamASprites.children.getArray().length; i++){
        if(params.scene.teamASprites.children.getArray()[i].getData("backend").name == this.lastHitBy.split("#")[0] && (params.scene.teamASprites.children.getArray()[i].getData("backend") instanceof Hero)){
          let punctuation = params.scene.getPunctuationByHeroAndGroup(this.lastHitBy.split("#")[0] ,parseInt(this.lastHitBy.split("#")[1]));
          punctuation.kills++;
          let localPunctuation = params.scene.getPunctuationByHeroAndGroup(this.name , params.body.collisionFilter.group);
          if(localPunctuation != null){
            localPunctuation.deaths++;
          }
        }
      }
    }else if(category == params.scene.categories[3]){
      for(var i = 0; i < params.scene.teamBSprites.children.getArray().length; i++){
        if(params.scene.teamBSprites.children.getArray()[i].getData("backend").name == this.lastHitBy.split("#")[0] && (params.scene.teamBSprites.children.getArray()[i].getData("backend") instanceof Hero)){
          let punctuation = params.scene.getPunctuationByHeroAndGroup(this.lastHitBy.split("#")[0] ,parseInt(this.lastHitBy.split("#")[1]));
          punctuation.kills++;
          let localPunctuation = params.scene.getPunctuationByHeroAndGroup(this.name , params.body.collisionFilter.group);
          if(localPunctuation != null){
            localPunctuation.deaths++;
          }
        }
      }
    }
    
  }
}
