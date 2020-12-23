import Entity from "./Entity.js";
import Hero from "./Hero.js";
import Pasive from "./skill/Pasive.js";
import Spell from "./skill/Spell.js";

export default class Character extends Entity{
    constructor(name, level, xpFactor, bountyFactor, race, fortitude, damage, armor, maxHealth, healthRegen, speed, atSpeed, evasion, crit, accuracy, maxMana, manaRegen, spellPower, will, magicArmor, concentration, spawnPoint, critMultiplier, ranged, range, skills){
        super(name, level, xpFactor, bountyFactor, damage, armor, evasion, maxHealth, healthRegen, atSpeed, accuracy, magicArmor, ranged, range);
        this.race = race;
        this.isBoss = false;
        this.curKey = "";

        //referente a poderes e items
        for(var i = 0; i < skills.pasives.length; i++){
            this.pasives.push(new Pasive(skills.pasives[i]));
        }
        this.skills = {};
        if(skills.spells["q"] != null){
            this.skills.q = new Spell(skills.spells["q"]);
        }
        if(skills.spells["e"] != null){
            this.skills.e = new Spell(skills.spells["e"]);
        }
        if(skills.spells["f"] != null){
            this.skills.f = new Spell(skills.spells["f"]);
        }
        if(skills.spells["r"] != null){
            this.skills.r = new Spell(skills.spells["r"]);
        }
        this.items = [];
        
        //stats del personaje como tal
        this.fortitude = fortitude;
        this.speed = speed;
        this.crit = crit;
        this.maxMana = maxMana;
        this.curMana = this.maxMana;
        this.manaRegen = manaRegen;
        this.spellPower = spellPower;
        this.will = will;
        this.concentration = concentration;
        this.critMultiplier = critMultiplier;
        this.spellLifesteal = 0; //[0, inf]

        //character's body
        this.spawnX = spawnPoint.x;
        this.spawnY = spawnPoint.y;
    }

    //getter y setter
    getFortitude(){
        if(this.fortitude >= 100){
            return 100;
        }else{
            return this.fortitude;
        }
    }
    getSpeed(){
        if(this.speed <= 0){
            return 0;
        }else{
            return this.speed;
        }
    }
    getCrit(){
        return this.crit;
    }
    getCritMultiplier() {
        return this.critMultiplier;
    }
    getMaxMana(){
        if(this.maxMana <= 1){
            return 1;
        }else{
            return this.maxMana;
        }
    }
    getCurMana(){
        if(this.curMana <= 0){
            return 0;
        }else{
            return this.curMana;
        }
    }
    getManaRegen(){
        if(this.manaRegen <= 0){
            return 0;
        }else{
            return this.manaRegen;
        }
    }
    getSpellPower(){
        if(this.spellPower <= -100){
            return -100;
        }else{
            return this.spellPower;
        }
    }
    getWill(){
        if(this.will >= 100){
            return 100;
        }else{
            return this.will;
        }
    }
    getConcentration(){
        if(this.concentration <= -100){
            return -100;
        }else{
            return this.concentration;
        }
    }
    getSpellLifesteal(){
        if(this.spellLifesteal <= 0){
            return 0;
        }else{
            return this.spellLifesteal;
        }
    }

    getSkillsAmount(){
        var amount = this.pasives.length;
        if(this.skills["q"] != null)
            amount++;
        if(this.skills["e"] != null)
            amount++;
        if(this.skills["f"] != null)
            amount++;
        if(this.skills["r"] != null)
            amount++;
           
        return amount - 2;
    }

    //funciones no gráficas
    spendMana(params){
      this.curMana += params.amount;
      if(this.curMana < 0){
        this.curMana = 0;
      }
    }

    applyManaRegen(params){
      if(this.curMana >= this.getMaxMana()){
          this.curMana = this.getMaxMana();
      }else{
          this.curMana += (this.getManaRegen() / 60);
      }
    }

    restoreMana(){
      this.curMana = this.getMaxMana();
    }



    //funciones sobre eventos
    onDeath(params){
        //si el último que dio el golpe es una criatura neutral, no se reparte ni xp ni oro por lo que la función termina su ejecución acá
        //se reparte oro y xp al último que dio el golpe siemre y cuando sea un heroe
        let category = super.onDeath(params);

        //se reparte oro y xp a los que estaban cerca aquien murió
        var givesGold = "0";
        var bounty=[this.calculateNextLevelXp() * 0.2, 0];

        if(this.constructor instanceof Hero || this.isBoss){
            givesGold = "1";
            bounty[1] = this.calculateBounty() * 0.2;
        }

        if(category == params.scene.categories[1] || category == params.scene.categories[3]){
            let box = params.scene.matter.add.circle(params.body.position.x, params.body.position.y, 150 * params.scaleRatio, {
                collisionFilter:{
                    category: category
                },
                label: "bountyBox." + this.name + "#" + givesGold,
                isSensor: true,
                onCollideEndCallback: function(event, bodyA, bodyB){
                    return bounty;
                }
            });
            box.timer = 1;
        }
        return category;
    }

    //funciones sobre sprites
    stop(sprite, direction){
        if(direction == "y"){
            sprite.setVelocityY(0);
        }else if(direction == "x"){
            sprite.setVelocityX(0);
        }else{
            sprite.setVelocity(0);
        }
    }
    moveY(sprite, direction, scale){
        if(this.mayMove()){
            if(direction){
                sprite.setVelocityY(-this.getSpeed() * scale / 6);
            }else{
                sprite.setVelocityY(this.getSpeed() * scale / 6);
            }
        }
    }

    moveX(sprite, direction, scale){
        if(this.mayMove()){
            if(direction){
                sprite.setVelocityX(this.getSpeed() * scale / 6);
            }else{
                sprite.setVelocityX(-this.getSpeed() * scale / 6);
            }
        }
    }

    moveDirection(sprite, direction, alteredSpeed, scale, induced){
        if(this.mayMove() || (!this.mayMove() && induced)){
            //ángulo debe venir en radianes
            var deltaX = 0;
            var deltaY = 0;

            if(alteredSpeed != 0){
                deltaX = alteredSpeed * Math.cos(direction);
                deltaY = alteredSpeed * Math.sin(direction);
            }else{
                deltaX = this.getSpeed() * Math.cos(direction);
                deltaY = this.getSpeed() * Math.sin(direction);
            }
            sprite.setVelocity(deltaX * scale / 6, deltaY * scale / 6);
        }
    }

    moveForward(sprite, scale, induced){
        this.moveDirection(sprite, sprite.rotation + (Math.PI / 2), 0, scale, induced);
    }

    lookAtDirection(sprite, direction){
        sprite.setAngle(direction);
    }
    //revisa si se aplica resistencia mental o física
    ApplyStatusResistance(amount, physical){
        if(physical)
            return Math.ceil(amount * (1 - this.getFortitude() / 100));
        else
            return Math.ceil(amount * (1 - this.getWill() / 100));
    }
    //funciones sobre el statusManager
    push(physical, amount, sprite, direction, speed){
        if(this.mayBeDisabled){
            amount = this.ApplyStatusResistance(amount, physical);
            this.moveDirection(sprite, direction, speed, scale, true);
            this.statusManager.pushBody(amount);
        }
    }
    shuffle(physical, amount, sprite, speed){
        this.push(physical, amount, sprite, randomFloat(Math.PI * 2), speed);
    }

    stun(physical, amount){
        amount = this.ApplyStatusResistance(amount, physical);
        super.stun(physical, amount);
    }
    disarm(physical, amount){
        amount = this.ApplyStatusResistance(amount, physical);
        super.disarm(physical, amount);
    }
    cripple(physical, amount){
        amount = this.ApplyStatusResistance(amount, physical);
        super.cripple(physical, amount);
    }
    mute(physical, amount){
        amount = this.ApplyStatusResistance(amount, physical);
        super.mute(physical, amount);
    }
    sleep(physical, amount){
        amount = this.ApplyStatusResistance(amount, physical);
        super.sleep(physical, amount);
    }
    freeze(physical, amount){
        amount = this.ApplyStatusResistance(amount, physical);
        super.freeze(physical, amount);
    }
    mark(physical, amount){
        amount = this.ApplyStatusResistance(amount, physical);
        super.mark(physical, amount);
    }
    morph(physical, amount){
        amount = this.ApplyStatusResistance(amount, physical);
        super.morph(physical, amount);
    }
    decimate(physical, amount){
        amount = this.ApplyStatusResistance(amount, physical);
        super.decimate(physical, amount);
    }
    hypnotize(physical, amount){
        amount = this.ApplyStatusResistance(amount, physical);
        super.hypnotize(physical, amount);
    }
    becomeFeared(physical, amount, sprite){
        amount = this.ApplyStatusResistance(amount, physical);
        super.becomeFeared(physical, amount, sprite);
    }
    banish(physical, amount){
        amount = this.ApplyStatusResistance(amount, physical);
        super.banish(physical, amount);
    }

    pushBuff(physical, element, scene){ //elementos tipo {name, attribute, amount, timer, stacks, stackable, clearAtZero}
        element.timer = this.ApplyStatusResistance(element.timer, physical);
        super.pushBuff(physical, element, scene);
    }
    pushDamageOnTime(physical, element, type, scene){ //elementos tipo {name, damageType, amount, debuffAmount, timer, stacks, stackable, caster}
        if(this.mayBeDebuffed){
            element.timer = this.ApplyStatusResistance(element.timer, physical);
            this.statusManager.pushDamageOnTime(this, element, type, scene);
        }
    }

    //funciones de hechizos
    updateCooldowns(params){
        if(this.skills["q"] != null){
            if(this.skills["q"].curCooldown > 0){
                this.skills["q"].curCooldown--;
            }
        }
        if(this.skills["e"] != null){
            if(this.skills["e"].curCooldown > 0){
                this.skills["e"].curCooldown--;
            }
        }
        if(this.skills["f"] != null){
            if(this.skills["f"].curCooldown > 0){
                this.skills["f"].curCooldown--;
            }
        }
        if(this.skills["r"] != null){
            if(this.skills["r"].curCooldown > 0){
                this.skills["r"].curCooldown--;
            }
        }
    }

    checkCooldown(key){
        if(this.skills[key] == null){
            return false;
        }else{
            return this.skills[key].curCooldown == 0;
        }
    }

    mayCastSpell(key){
        if(this.skills[key] == null){
            return false;
        }else{
            return this.checkCooldown(key) && this.mayCastSpells() && this.skills[key].getManaCost(this.level) <= this.curMana;
        }
    }

    setUpSpell(scene, sprite, key){//self, projectile, conic_projectile, modifier, area, area_point, direction
        //se supone que para este punto ya se ha checkeado si el hechizo existe por lo que se omite checkeo
        if(this.skills[key].type == "self" || this.skills[key].type == "direction" || this.skills[key].type == "area"){
            this.curKey = key;
            this.castSpell(scene, sprite);
        }else if(this.curKey == key){
            this.curKey = "";
        }else{
            this.curKey = key;
        }
    }

    castSpell(scene, sprite){
        //se supone que para este punto ya se ha checkeado si el hechizo existe por lo que se omite checkeo
        if (this.getCurMana() >= this.skills[this.curKey].getManaCost(this.level)) {
            this.spendMana({scene: scene, amount: - this.skills[this.curKey].getManaCost(this.level)});
            sprite.play("spell" + this.curKey + "_" + this.name);
            this.skills[this.curKey].curCooldown = this.skills[this.curKey].getCooldown(this.level);
        }else{
            console.log("not enough mana");
        }
        if(this.skills[this.curKey].type != "modifier")
            this.curKey = "";
    }

    willCastAttack(){
        return this.curKey == "" || this.skills[this.curKey].getManaCost(this.level) > this.curMana || (this.curKey != "" && this.skills[this.curKey].type == "modifier" && this.skills[this.curKey].curCooldown > 0);
    }

    commitSpellq(animation, frame, gameObject) {
        gameObject.getData("backend").curKey = "";
        gameObject.getData("backend").statusManager.makeVisible();
        //debe reemplazarse por una función que interprete el effect a código js
        gameObject.getData("backend").becomeDamageInmune(60 + Math.ceil(1.92 * gameObject.getData("backend").level));
    }
    commitSpelle(animation, frame, gameObject) {
        gameObject.getData("backend").statusManager.makeVisible();
        gameObject.getData("backend").pushBuff(gameObject.getData("backend"),{
            name: gameObject.getData("backend").name + "*" + gameObject.getData("backend").skills.e.name,
            attribute: "damage",
            amount: gameObject.getData("backend").damage * (0.02 * gameObject.getData("backend").level + 0.15),
            timer: 1,
            stacks: 1,
            stackable: 1,
            clearAtZero: false
        }, gameObject.scene);
        let shot = gameObject.getData("backend").generateProjectile(gameObject, gameObject.getData("backend").skills.e.range);
        shot.body.attackParams = {
            caster: gameObject.getData("backend"),
            type: 1,
            avoidable: true,
            critable: true,
            damage: gameObject.getData("backend").getDamage(),
            accuracy: gameObject.getData("backend").getAccuracy(),
            crit: gameObject.getData("backend").getCrit(),
            critMultiplier: gameObject.getData("backend").getCritMultiplier()
        }
        gameObject.play("attack_" + gameObject.getData("backend").name + "_end");
    }
    commitSpellf(animation, frame, gameObject) {
        gameObject.getData("backend").statusManager.makeVisible();
        gameObject.getData("backend").curKey = "";
        gameObject.getData("backend").becomeInvisible((300 + 24 * gameObject.getData("backend").level) * (1 + gameObject.getData("backend").getConcentration()));
    }
    commitSpellr(animation, frame, gameObject) {
        gameObject.getData("backend").statusManager.makeVisible();
        gameObject.getData("backend").curKey = "";
        gameObject.getData("backend").dealDamage((0.3 * gameObject.getData("backend").getCurHealth())* (1 + gameObject.getData("backend").getSpellPower() / 100), 0);
        // damageChange(3x+32, 12x+180) critChange(x+10, 12x+180) lifestealChange(0.4, 12x+180) armorChange(-4x-30, 12x+180) mute(12x+180)
        gameObject.getData("backend").pushBuff(true, {name: "demon_hunter_r1", attribute: "damage", amount: 32 + 3 * gameObject.getData("backend").level, timer: (180 + 12 * gameObject.getData("backend").level) * (1 + gameObject.getData("backend").getConcentration() / 100), stacks: 1, stackable: false, clearAtZero: false}, gameObject.scene);
        gameObject.getData("backend").pushBuff(true, {name: "demon_hunter_r2", attribute: "crit", amount: 10 + gameObject.getData("backend").level, timer: (180 + 12 * gameObject.getData("backend").level) * (1 + gameObject.getData("backend").getConcentration() / 100), stacks: 1, stackable: false, clearAtZero: false}, gameObject.scene);
        gameObject.getData("backend").pushBuff(true, {name: "demon_hunter_r3", attribute: "lifesteal", amount: 0.4, timer: (180 + 12 * gameObject.getData("backend").level) * (1 + gameObject.getData("backend").getConcentration() / 100), stacks: 1, stackable: false, clearAtZero: false}, gameObject.scene);
        gameObject.getData("backend").pushBuff(true, {name: "demon_hunter_r4", attribute: "armor", amount: - 30 - 4 * gameObject.getData("backend").level, timer: (180 + 12 * gameObject.getData("backend").level) * (1 + gameObject.getData("backend").getConcentration() / 100), stacks: 1, stackable: false, clearAtZero: false}, gameObject.scene);
        gameObject.getData("backend").mute(true, (180 + 12 * gameObject.getData("backend").level) * (1 + gameObject.getData("backend").getConcentration() / 100));
    }
}