import Entity from "./Entity.js";
import Hero from "./Hero.js";
import Pasive from "./skill/Pasive.js";
import Spell from "./skill/Spell.js";
import {polarToEuclidean} from "../main_layer/MathUtils.js";

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

        this.onCrit = function(params){
            params.target.stun(true, 30 * (1 + this.getConcentration() / 100), params.sprite);
        }

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
    onCastSpell(params){ //se activa al lanzar un hechizo

    }

    onHitSpell(params){ //se activa al acertar un hechizo

    }

    onDeath(params){
        //si el último que dio el golpe es una criatura neutral, no se reparte ni xp ni oro por lo que la función termina su ejecución acá
        //se reparte oro y xp al último que dio el golpe siemre y cuando sea un heroe
        this.statusManager.onDeath(this, params.scene);
        this.destroyAura(params.scene);
        let category = super.onDeath(params);

        //se reparte oro y xp a los que estaban cerca aquien murió
        var bounty = {xp: this.calculateNextLevelXp() * 0.2, gold: 0};
        params.attacker.caster.onKill({scene: params.scene});

        if(this.constructor instanceof Hero || this.isBoss){
            bounty.gold = this.calculateBounty() * 0.2;
            params.attacker.caster.onKillMain({scene: params.scene});
        }
            

        if(category == params.scene.categories[1] || category == params.scene.categories[3]){
            let radius = 150 * params.scaleRatio;
            let box = this.generateAreaBox("bountyBox." + this.name, params.scene, params.body, category, 1, radius);
            box.bounty = bounty;
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

    moveDirection(sprite, direction, alteredSpeed, scale){
        if(this.mayMove() || this.onlyMovingForward()){
            //ángulo debe venir en radianes
            var delta = {x: 0, y: 0};

            if(alteredSpeed != 0){
                delta = polarToEuclidean(direction, alteredSpeed);
            }else{
                delta = polarToEuclidean(direction, this.getSpeed());
            }
            sprite.setVelocity(delta.x * scale / 6, delta.y * scale / 6);
        }
    }

    moveEuclidean(sprite, x, y, scale){
        if(this.mayMove()  || this.onlyMovingForward()){
            sprite.setVelocity(x * scale / 6, y * scale / 6);
        }
    }

    moveForward(sprite, scale){
        this.moveDirection(sprite, sprite.rotation + (Math.PI / 2), 0, scale);
    }

    acelerate(sprite, scale, delta){
        sprite.body.speed = delta * scale;
    }


    lookAtDirection(sprite, direction){
        sprite.setAngle(direction);
    }
    //revisa si se aplica resistencia mental o física
    ApplyStatusResistance(amount, physical){
        if(amount > 0){
            if(physical)
                return Math.ceil(amount * (1 - this.getFortitude() / 100));
            else
                return Math.ceil(amount * (1 - this.getWill() / 100));
        }else{
            return amount;
        }
    }
    //funciones sobre el statusManager
    pushBody(element, scene){
        if(this.mayBeDisabled()){
            this.statusManager.pushBody(element);
            this.ccTriggered({scene: scene});
        }
    }
    removeVelocity(code){
        this.statusManager.removePush(code);
    }
    queryPush(code){
        return this.statusManager.queryPush(code);
    }

    stun(physical, amount, sprite){
        amount = this.ApplyStatusResistance(amount, physical);
        super.stun(physical, amount, sprite);
    }
    disarm(physical, amount, sprite){
        amount = this.ApplyStatusResistance(amount, physical);
        super.disarm(physical, amount, sprite);
    }
    cripple(physical, amount, sprite){
        amount = this.ApplyStatusResistance(amount, physical);
        super.cripple(physical, amount, sprite);
    }
    mute(physical, amount, sprite){
        amount = this.ApplyStatusResistance(amount, physical);
        super.mute(physical, amount, sprite);
    }
    sleep(physical, amount, sprite){
        amount = this.ApplyStatusResistance(amount, physical);
        super.sleep(physical, amount, sprite);
    }
    freeze(physical, amount, sprite){
        amount = this.ApplyStatusResistance(amount, physical);
        super.freeze(physical, amount, sprite);
    }
    mark(physical, amount){
        amount = this.ApplyStatusResistance(amount, physical);
        super.mark(physical, amount);
    }
    morph(physical, amount, sprite){
        amount = this.ApplyStatusResistance(amount, physical);
        super.morph(physical, amount, sprite);
    }
    decimate(physical, amount, scene){
        amount = this.ApplyStatusResistance(amount, physical);
        super.decimate(physical, amount, scene);
    }
    hypnotize(physical, amount, sprite){
        amount = this.ApplyStatusResistance(amount, physical);
        super.hypnotize(physical, amount, sprite);
    }
    becomeFeared(physical, amount, sprite){
        amount = this.ApplyStatusResistance(amount, physical);
        super.becomeFeared(physical, amount, sprite);
    }
    banish(physical, amount){
        amount = this.ApplyStatusResistance(amount, physical);
        super.banish(physical, amount);
    }
    charge(amount, sprite){
        this.statusManager.charge(amount, sprite);
    }

    pushBuff(physical, element, scene){ //elementos tipo {name, attribute, amount, timer, stacks, stackable, clearAtZero}
        if(element.amount < 0)
            element.timer = this.ApplyStatusResistance(element.timer, physical);
        else
            element.timer = Math.ceil(element.timer);
        super.pushBuff(physical, element, scene);
    }
    pushDamageOnTime(physical, element, type, scene){ //elementos tipo {name, damageType, amount, debuffAmount, timer, stacks, stackable, caster}
        if(this.mayBeDebuffed){
            element.timer = this.ApplyStatusResistance(element.timer, physical);
            this.statusManager.pushDamageOnTime(this, element, type, scene);
            this.statusTriggered({scene: scene});
        }
    }

    //funciones de hechizos
    modifyCooldowns(params){
        if(params.multiplier > 1)
            params.multiplier = 1;
        
        if(this.skills["q"] != null){
            if(this.skills["q"].curCooldown > 0)
                this.skills["q"].curCooldown = Math.ceil(this.skills["q"].curCooldown * (1 - params.multiplier));
        }
        if(this.skills["e"] != null){
            if(this.skills["e"].curCooldown > 0)
                this.skills["e"].curCooldown = Math.ceil(this.skills["e"].curCooldown * (1 - params.multiplier));
        }
        if(this.skills["f"] != null){
            if(this.skills["f"].curCooldown > 0)
                this.skills["f"].curCooldown = Math.ceil(this.skills["f"].curCooldown * (1 - params.multiplier));
        }
        if(this.skills["r"] != null){
            if(this.skills["r"].curCooldown > 0)
                this.skills["r"].curCooldown = Math.ceil(this.skills["r"].curCooldown * (1 - params.multiplier));
        }
    }
    updateCooldowns(params){
        if(this.skills["q"] != null){
            if(this.skills["q"].curCooldown > 0)
                this.skills["q"].curCooldown--;
        }
        if(this.skills["e"] != null){
            if(this.skills["e"].curCooldown > 0)
                this.skills["e"].curCooldown--;
        }
        if(this.skills["f"] != null){
            if(this.skills["f"].curCooldown > 0)
                this.skills["f"].curCooldown--;
        }
        if(this.skills["r"] != null){
            if(this.skills["r"].curCooldown > 0)
                this.skills["r"].curCooldown--;
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
            this.onCastSpell({scene: scene});
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
        gameObject.getData("backend").pushBuff(true, {name: gameObject.getData("backend").name + "*" + gameObject.getData("backend").skills.q.name + "_speed", attribute: "speed", amount: 30, timer: -2, stacks: 1, stackable: 1, clearAtZero: false}, gameObject.scene);
        gameObject.getData("backend").charge(-2, gameObject);
        //let moveVector = polarToEuclidean(gameObject.rotation + (Math.PI / 2), 40);
        //gameObject.getData("backend").pushBody({name: gameObject.getData("backend").name + "*" + gameObject.getData("backend").skills.q.name, x: moveVector.x, y: moveVector.y, timer: 60 + Math.ceil(1.92 * gameObject.getData("backend").level)}, gameObject.scene);
        gameObject.setFrame(21);
        gameObject.getData("backend").onBodyCollision = function(params){
            params.sprite.setFrame(0);
            params.target.setVelocity(0);
            //gameObject.getData("backend").removeVelocity(gameObject.getData("backend").name + "*" + gameObject.getData("backend").skills.q.name);
            gameObject.getData("backend").charge(0, gameObject);
            gameObject.getData("backend").removeBuff(gameObject.getData("backend").name + "*" + gameObject.getData("backend").skills.q.name + "_speed", gameObject.scene);
            gameObject.getData("backend").onBodyCollision = function(params){}
            //daño*(1+n/25) de daño, aturdir(1+n/25, 1.3+n/50) y retroceso(1)
            if(gameObject.body.collisionFilter.mask != params.target.body.collisionFilter.mask){
                params.target.getData("backend").spellTriggered({});
                params.target.getData("backend").takeDamage({
                    scene: params.scene,
                    sprite: params.target,
                    body: params.target.body,
                    group: params.group,
                    factory: params.factory,
                    scaleRatio: params.scaleRatio,
                    attacker: {
                        isAttack: false,
                        caster: gameObject.getData("backend"),
                        type: 2,
                        avoidable: false,
                        critable: false,
                        damage: (1 + gameObject.getData("backend").getSpellPower() / 100) * ((0.04 * gameObject.getData("backend").level) + 1) * gameObject.getData("backend").getDamage(),
                    },
                    attackerLabel: gameObject.body.label + "#" + gameObject.body.collisionFilter.group
                });
                if(params.target.body != null){
                    if(params.target.body.collisionFilter.group < 4){
                        params.target.getData("backend").stun(true, (2.4 * gameObject.getData("backend").level) + 60, params.target);
                        let moveVector = {x: (params.target.x - gameObject.x) / 10, y: (params.target.y - gameObject.y) / 10};
                        console.log("velocity", moveVector);
                        params.target.getData("backend").pushBody({name: gameObject.getData("backend").name + "*" + gameObject.getData("backend").skills.q.name, x: moveVector.x, y: moveVector.y, timer: 60}, gameObject.scene);
                    }
                }
            }
        }
    }
    commitSpelle(animation, frame, gameObject) {
        gameObject.getData("backend").statusManager.makeVisible();
        let shot = gameObject.getData("backend").generateProjectile(gameObject, gameObject.getData("backend").skills.e.range, true);
        shot.body.attackParams = {
            isAttack: true,
            caster: gameObject.getData("backend"),
            type: 1,
            avoidable: true,
            critable: true,
            damage: gameObject.getData("backend").getDamage() + (2 * gameObject.getData("backend").level) + 20,
            accuracy: gameObject.getData("backend").getAccuracy(),
            crit: gameObject.getData("backend").getCrit(),
            critMultiplier: gameObject.getData("backend").getCritMultiplier()
        }
        shot.body.onHit = function(scene, targetBody, originBody, group, factory, scaleRatio){
            if(targetBody.gameObject != null)
                if(targetBody.gameObject.getData("backend").speed != null)
                    targetBody.gameObject.getData("backend").pushBuff(true, {name: gameObject.getData("backend").name + "*" + gameObject.getData("backend").skills.e.name, attribute: "speed", amount: targetBody.gameObject.getData("backend").getSpeed() * (-1 + (0.08 + originBody.attackParams.caster.level / 100)), timer: 60 * (1 + originBody.attackParams.caster.getConcentration() / 100), stacks: 1, stackable: 1, clearAtZero: false}, scene);
            targetBody.gameObject.getData("backend").takeDamage({
                scene: scene,
                sprite: targetBody.gameObject,
                body: targetBody,
                group: group,
                factory: factory,
                scaleRatio: scaleRatio,
                attacker: originBody.attackParams,
                attackerLabel: originBody.label.split(".")[1]
              });
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
        gameObject.getData("backend").pushBuff(true, {name: gameObject.getData("backend").name + "*" + gameObject.getData("backend").skills.r.name + "_damage", attribute: "damage", amount: 32 + 3 * gameObject.getData("backend").level, timer: (180 + 12 * gameObject.getData("backend").level) * (1 + gameObject.getData("backend").getConcentration() / 100), stacks: 1, stackable: 1, clearAtZero: false}, gameObject.scene);
        gameObject.getData("backend").pushBuff(true, {name: gameObject.getData("backend").name + "*" + gameObject.getData("backend").skills.r.name+ "_crit", attribute: "crit", amount: 10 + gameObject.getData("backend").level, timer: (180 + 12 * gameObject.getData("backend").level) * (1 + gameObject.getData("backend").getConcentration() / 100), stacks: 1, stackable: 1, clearAtZero: false}, gameObject.scene);
        gameObject.getData("backend").pushBuff(true, {name: gameObject.getData("backend").name + "*" + gameObject.getData("backend").skills.r.name+ "_lifesteal", attribute: "lifesteal", amount: 0.4, timer: (180 + 12 * gameObject.getData("backend").level) * (1 + gameObject.getData("backend").getConcentration() / 100), stacks: 1, stackable: 1, clearAtZero: false}, gameObject.scene);
        gameObject.getData("backend").pushBuff(true, {name: gameObject.getData("backend").name + "*" + gameObject.getData("backend").skills.r.name+ "_armor", attribute: "armor", amount: - 30 - 4 * gameObject.getData("backend").level, timer: (180 + 12 * gameObject.getData("backend").level) * (1 + gameObject.getData("backend").getConcentration() / 100), stacks: 1, stackable: 1, clearAtZero: false}, gameObject.scene);
        gameObject.getData("backend").mute(true, (180 + 12 * gameObject.getData("backend").level) * (1 + gameObject.getData("backend").getConcentration() / 100), gameObject);
        gameObject.getData("backend").decimate(true, (180 + 12 * gameObject.getData("backend").level) * (1 + gameObject.getData("backend").getConcentration() / 100), gameObject.scene);
    }
}