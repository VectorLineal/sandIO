import {randomFloat, degToRad, getRotation, transformArmorToPercentage} from "../main_layer/MathUtils.js";
import Hero from "./Hero.js";
import StatusManager from "./skill/StatusManager.js";

export default class Entity{
    constructor(name, level, xpFactor, bountyFactor, damage, armor, evasion, maxHealth, healthRegen, atSpeed, accuracy, magicArmor, ranged, range){
        this.name = name;
        this.level = level;
        this.xpFactor = xpFactor; //en heroes se toma valor de 100, en otros representa la xp que se gana al matar a un enemigo
        this.bountyFactor = bountyFactor;
        this.lastHitBy = "none"; //sirve para referenciar a la última entidad que ha atacado para calcular la entrega de xp y oro

        //referente a poderes, buffs y debuffs
        this.pasives = [];
        this.statusManager = new StatusManager();
        
        //stats del personaje como tal
        this.damage = damage;
        this.armor = armor;
        this.evasion = evasion;
        this.maxHealth = maxHealth;
        this.curHealth = this.maxHealth;
        this.healthRegen = healthRegen;
        this.atSpeed = atSpeed;
        this.accuracy = accuracy;
        this.magicArmor = magicArmor;

        //stats adicionales de efectos, poderes o que son constantes para todos, etc.
        this.shield = 0;
        this.maxShield = 0;
        this.fov = 10;
        this.cauterize = 0; //positivo aumenta efectos curativos, negativo los disminuye [-1, inf]
        this.damageAmplification = 0; //positivo reduce el daño de todo tipo porcentualmente, negativo lo amplifica [-inf, 1]
        this.lifesteal = 0; //[0, inf]

        //character's body
        this.atFrames = [];
        this.ranged = ranged;
        this.range = range;
    }

    //funciones sobre sprites
    addAnimation(scene, animationName, frames){
        var animationSpeed = this.calculateAttackRate();
        if(animationName != "attack_" + this.name && animationName != "attack_" + this.name + "_end" && this.skills[animationName.substr(5, 1)].type != "modifier"){
            animationSpeed = this.skills[animationName.substr(5, 1)].castpoint;
        }else if(animationName == "attack_" + this.name){
            this.atFrames[0] = frames;
        }else if(animationName == "attack_" + this.name + "_end"){
            this.atFrames[1] = frames;
        }else if(this.skills[animationName.substr(5, 1)].type == "modifier" && animationName.substr(animationName.length - 3) != "end"){
            this.atFrames[2] = frames;
        }else if(this.skills[animationName.substr(5, 1)].type == "modifier" && animationName.substr(animationName.length - 3) == "end"){
            this.atFrames[3] = frames;
        }

        scene.anims.create({
            key: animationName,
            frames: scene.anims.generateFrameNumbers(this.name, { frames: frames }),
            duration: animationSpeed
        });
    }

    rebalanceAttackAnimations(scene){
        let totalFrames = this.atFrames[0].length +  this.atFrames[1].length;
        scene.anims.remove("attack_" + this.name);
        scene.anims.create({
            key: "attack_" + this.name,
            frames: scene.anims.generateFrameNumbers(this.name, { frames: this.atFrames[0] }),
            duration: this.calculateAttackRate() * this.atFrames[0].length / totalFrames
        });

        scene.anims.remove("attack_" + this.name + "_end");
        scene.anims.create({
            key: "attack_" + this.name + "_end",
            frames: scene.anims.generateFrameNumbers(this.name, { frames: this.atFrames[1] }),
            duration: this.calculateAttackRate() * this.atFrames[1].length / totalFrames
        });
        if(this.skills.e != null){
            if(this.skills.e.type == "modifier"){
                scene.anims.remove("spelle_" + this.name);
                scene.anims.create({
                    key: "spelle_" + this.name,
                    frames: scene.anims.generateFrameNumbers(this.name, { frames: this.atFrames[2] }),
                    duration: this.calculateAttackRate() * this.atFrames[2].length / totalFrames
                });
            }
        }else if(this.skills.r != null){
            if(this.skills.r.type == "modifier"){
                scene.anims.remove("spellr_" + this.name);
                scene.anims.create({
                    key: "spellr_" + this.name,
                    frames: scene.anims.generateFrameNumbers(this.name, { frames: this.atFrames[2] }),
                    duration: this.calculateAttackRate() * this.atFrames[2].length / totalFrames
                });
            }
        }
    }

    pickCategory(gameObject, forEnemy){
        var category = gameObject.scene.categories[0];
        if(forEnemy){
            switch(gameObject.body.collisionFilter.group){
                case gameObject.scene.groups[0]:
                    return gameObject.scene.categories[0];
                case gameObject.scene.groups[1]:
                    return gameObject.scene.categories[2];
                case gameObject.scene.groups[2]:
                    return gameObject.scene.categories[4];
            }
        }else{
            switch(gameObject.body.collisionFilter.group){
                case gameObject.scene.groups[0]:
                    return gameObject.scene.categories[1];
                case gameObject.scene.groups[1]:
                    return gameObject.scene.categories[3];
                case gameObject.scene.groups[2]:
                    return gameObject.scene.categories[5];
            }
        }
        return category;
    }

    generateAttackBox(gameObject, forEnemy){
        var xc = gameObject.x;
        var yc = gameObject.y;
        var xr = -gameObject.displayWidth / 4;
        var yr = gameObject.displayHeight / 2;
        if(gameObject.body.render.sprite.xOffset == 0){
            xr = -((gameObject.displayWidth * (1 - ((gameObject.displayWidth - gameObject.body.shape.width * gameObject.scene.scaleRatio / 2 - 1) / gameObject.displayWidth - 0.5))) / 4);
        }
        if(gameObject.body.render.sprite.yOffset == 0){
            yr = (gameObject.displayHeight * (1 - ((gameObject.displayHeight - gameObject.body.shape.height * gameObject.scene.scaleRatio - 1) / 2 / gameObject.displayHeight))) / 2;
        }

        let magnitude = Math.sqrt(xr * xr + yr * yr);
        var attackBox = gameObject.scene.matter.add.rectangle(
            xc +
              magnitude *
                Math.cos(
                  getRotation(xr, yr) + degToRad(gameObject.angle)
                ),
            yc +
              magnitude *
                Math.sin(
                  getRotation(xr, yr) + degToRad(gameObject.angle)
                ),
                gameObject.getData("backend").getRange().width * (9.84 / gameObject.scene.scaleRatio),
                gameObject.getData("backend").getRange().height * (9.84 / gameObject.scene.scaleRatio),
            {
              isSensor: true,
              angle: degToRad(gameObject.angle),
              render: { visible: true, lineColor: 0x00ff00 },
            }
          );
          attackBox.label = "attackBox." + gameObject.getData("backend").name + "#" + gameObject.body.collisionFilter.group;
          attackBox.collisionFilter.category = this.pickCategory(gameObject, forEnemy);

          return attackBox;
    }

    generateProjectile(gameObject, range, forEnemy){
        //crear proyectil para ataque a distancia, pendiente creacion de clase proyectil
        var xc = gameObject.x;
        var yc = gameObject.y;
        var xr = 0;
        var yr = gameObject.displayHeight / 2;
        let magnitude = Math.sqrt(xr * xr + yr * yr);

        var shot = gameObject.scene.matter.add.image(
            xc + magnitude * Math.cos(getRotation(xr, yr) + degToRad(gameObject.angle)),
            yc + magnitude * Math.sin(getRotation(xr, yr) + degToRad(gameObject.angle)),
            range.projectile,
            null).setDepth(0.6);
    
        shot.setScale(9.84 / gameObject.scene.scaleRatio);
        shot.setAngle(gameObject.angle);
        let deltaX = range.speed * Math.cos(gameObject.rotation + (Math.PI / 2));
        let deltaY = range.speed * Math.sin(gameObject.rotation + (Math.PI / 2));
        shot.setVelocity(deltaX * (9.84 / gameObject.scene.scaleRatio) / 6, deltaY * (9.84 / gameObject.scene.scaleRatio) / 6);
        
        shot.body.isSensor = true;
        shot.body.timer = range.reach;
        shot.body.updateSpeed = range.speed;
        shot.body.label = "projectileBox." + gameObject.getData("backend").name + "#" + gameObject.body.collisionFilter.group;
        shot.body.collisionFilter.category = this.pickCategory(gameObject, forEnemy);
        return shot;
    }

    generateAreaBox(type, scene, entity, body, category, timer, scaleRatio){
        let box = scene.matter.add.circle(body.position.x, body.position.y, 150 * scaleRatio, {
            collisionFilter:{
                category: category
            },
            label: type + entity.name,
            isSensor: true
        });
        box.timer = timer;

        return box;
    }

    commitAttack(animation, frame, gameObject) {
        gameObject.getData("backend").statusManager.makeVisible();
        if(!gameObject.getData("backend").getRanged()){
            let box = gameObject.getData("backend").generateAttackBox(gameObject, true);
            box.attackParams = {
                isAttack: true,
                caster: gameObject.getData("backend"),
                type: 1,
                avoidable: true,
                critable: true,
                damage: gameObject.getData("backend").getDamage(),
                accuracy: gameObject.getData("backend").getAccuracy(),
                crit: gameObject.getData("backend").getCrit(),
                critMultiplier: gameObject.getData("backend").getCritMultiplier()
            }
            box.onHit = function(scene, targetBody, originBody, group, factory, scaleRatio){
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
        }else{
            let projectile = gameObject.getData("backend").generateProjectile(gameObject, gameObject.getData("backend").getRange(), true);
            projectile.body.attackParams = {
                isAttack: true,
                caster: gameObject.getData("backend"),
                type: 1,
                avoidable: true,
                critable: true,
                damage: gameObject.getData("backend").getDamage(),
                accuracy: gameObject.getData("backend").getAccuracy(),
                crit: gameObject.getData("backend").getCrit(),
                critMultiplier: gameObject.getData("backend").getCritMultiplier()
            }
            projectile.body.onHit = function(scene, targetBody, originBody, group, factory, scaleRatio){
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
        }
        
        gameObject.play("attack_" + gameObject.getData("backend").name + "_end");
        console.log("bodies in world:", gameObject.scene.matter.world.getAllBodies());
    }

    distributeXp(scene, group){

    }

    castAttack(sprite){
        if(this.mayAttack() && !sprite.anims.isPlaying)
            sprite.play("attack_" + this.name);
    }

    //getter y setter
    getDamage(){
        if(this.damage <= 0){
            return 0;
        }else{
            return this.damage;
        }
    }
    getArmor(){
        return this.armor;
    }
    getEvasion(){
        return this.evasion;
    }
    getMaxHealth(){
        if(this.maxhealth <= 1){
            return 1;
        }else{
            return this.maxHealth;
        }
    }
    getCurHealth(){
        if(this.curHealth <= 0){
            return 0;
        }else{
            return this.curHealth;
        }
    }
    getHealthRegen(){
        if(this.healthRegen <= 0){
            return 0;
        }else{
            return this.healthRegen;
        }
    }
    getAtSpeed(){
        if(this.atSpeed <= 0){
            return 0;
        }else{
            return this.atSpeed;
        }
    }
    getAccuracy(){
        return this.accuracy;
    }
    getMagicArmor(){
        return this.magicArmor;
    }
    //stats adicionales.
    getShield(){
        return this.shield;
    }
    getFOV(){
        if(this.fov <= 1){
            return 1;
        }else{
            return this.fov;
        }
    }
    getCauterize(){
        if(this.cauterize <= -1){
            return -1;
        }else{
            return this.cauterize;
        }
    }
    getDamageAmp(){
        if(this.damageAmplification <= -1){
            return -1;
        }else{
            return this.damageAmplification;
        }
    }
    getLifesteal(){
        if(this.lifesteal <= 0){
            return 0;
        }else{
            return this.lifesteal;
        }
    }
        
    getRange(){
        return this.range;
    }

    getRanged(){
        return this.ranged;
    }

    calculateAttackRate(){
        if(this.atSpeed < 25){
            return 8000;
        }else{
            return 200000 / this.atSpeed;
        }
    }

    getArmorMultiplier(magic){
        if(magic){
            return transformArmorToPercentage(this.magicArmor);
        }else{
            return transformArmorToPercentage(this.armor);
        }
    }
    //funciones no gráficas
    calculateNextLevelXp(){
        if(this.level >= 1 && this.level <= 24){
            return (1 + (this.level * 0.5)) * this.xpFactor;
        }else if(this.level < 1){
            return this.xpFactor;
        }else{
            return 13 * this.xpFactor;
        }
    }

    calculateBounty(){
        if(this.level >= 1 && this.level <= 24){
            return (1 + (this.level * 0.5)) * this.bountyFactor;
        }else if(this.level < 1){
            return this.bountyFactor
        }else{
            return 13 * this.bountyFactor;
        }
    }

    isDead(){
        return this.curHealth <= 0;
    }

    //funciones que indican posibilidad de ejecutar acciones según cambios de estado
    mayRotate(){
        return this.statusManager.mayRotate();
    }
    mayMove(){
        return this.statusManager.mayMove();
    }
    onlyMovingForward(){
        return this.statusManager.onlyMovingForward();
    }
    mayAttack(){
        return this.statusManager.mayAttack();
    }
    mayUsePasives(){ //implementación parcial
        return this.statusManager.mayUsePasives();
    }
    mayCastSpells(){
        return this.statusManager.mayCastSpells();
    }
    mayTakeDamage(type){ //tipo 0: puro, tipo 1: fisico, tipo 2: magico
        return this.statusManager.mayTakeDamage(type);
    }
    mayBeDisabled(){
        return this.statusManager.mayBeDisabled();
    }
    mayBeDebuffed(){
        return !this.statusManager.isSpellInmune();
    }
    isMarked(){ //implementación parcial
        return this.statusManager.isMarked();
    }
    isInmortal(){
        return this.statusManager.isInmortal();
    }
    flies(){ //pendiente implementación
        return this.statusManager.flies();
    }

    getVisibility(){
        return this.statusManager.getVisibility();
    }

    //funciones sobre el statusManager
    purge(positive, scene){
        this.statusManager.purge(this, positive, scene);
    }
    stun(physical, amount, sprite){
        if(this.mayBeDisabled())
            this.statusManager.stun(sprite, amount);
    }
    disarm(physical, amount, sprite){
        this.statusManager.disarm(sprite, amount);
    }
    cripple(physical, amount, sprite){
        if(this.mayBeDisabled())
            this.statusManager.cripple(sprite, amount);
    }
    mute(physical, amount, sprite){
        if(this.mayBeDisabled())
            this.statusManager.mute(sprite, amount);
    }
    sleep(physical, amount, sprite){
        if(this.mayBeDisabled())
            this.statusManager.sleep(sprite, amount);
    }
    freeze(physical, amount, sprite){
        if(this.mayBeDisabled())
            this.statusManager.freeze(sprite, amount);
    }
    mark(physical, amount){
        this.statusManager.mark(amount);
    }
    morph(physical, amount, sprite){
        if(this.mayBeDisabled())
            this.statusManager.morph(sprite, amount);
    }
    decimate(physical, amount){
        if(this.mayBeDisabled())
            this.statusManager.decimate(this, amount);
    }
    becomeInvisible(amount){
        this.statusManager.becomeInvisible(amount);
    }
    becomeInmortal(amount){
        this.statusManager.becomeInmortal(amount);
    }
    hypnotize(physical, amount, sprite){
        if(this.mayBeDisabled())
            this.statusManager.hypnotize(sprite, amount);
    }
    becomeFeared(physical, amount, sprite){
        if(this.mayBeDisabled())
            this.statusManager.becomeFeared(amount, sprite);
    }
    becomeCCInmune(amount){
        this.statusManager.becomeCCInmune(amount);
    }
    fly(amount){
        this.StatusManager.fly(amount);
    }
    becomeSpellInmune(amount){
        this.statusManager.becomeSpellInmune(amount);
    }
    becomeDamageInmune(amount){
        this.statusManager.becomeDamageInmune(amount);
    }
    banish(physical, amount){
        if(this.mayBeDisabled())
            this.StatusManager.banish(amount);
    }
    markForDeath(amount){
        this.statusManager.markForDeath(amount);
    }

    pushBuff(physical, element, scene){ //elementos tipo {name, attribute, amount, timer, stacks, stackable, clearAtZero}
        if(this.mayBeDebuffed() || element.amount > 0)
            this.statusManager.pushBuff(this, element, scene);
    }

    pushDamageOnTime(physical, element, type, scene){ //elementos tipo {name, damageType, amount, debuffAmount, timer, stacks, stackable, caster}
        if((type == "rawDamage" || type == "burn" || type == "curse" || type == "parasite") && this.mayBeDebuffed())    
            this.statusManager.pushDamageOnTime(this, element, type, scene);
    }

    shieldDamage(amount){
        var overflow = amount;
        if(this.shield <= 0 || amount <= 0){
            return overflow;
        }else if(this.shield < amount){
            overflow = amount - this.shield;
            this.shield = 0;
        }else{
            this.shield -= amount;
            overflow = 0;
        }
        return overflow;
    }

    dealDamage(amount, type){ //tipo 0: puro, tipo 1: fisico, tipo 2: magico
        var fixedAmount = amount * (1 - this.getDamageAmp());
        if(!this.mayTakeDamage(type)){
            return 0;
        }else{
            var totalDamage = 0;
            switch(type){
                case 0:
                    this.curHealth -=  this.shieldDamage(fixedAmount);
                    totalDamage = fixedAmount;
                    break;
                case 1:
                    this.curHealth -=  this.shieldDamage(fixedAmount * (1 - this.getArmorMultiplier(false)));
                    totalDamage = fixedAmount * (1 - this.getArmorMultiplier(false));
                    break;
                case 2:
                    this.curHealth -=  this.shieldDamage(fixedAmount * (1 - this.getArmorMultiplier(true)));
                    totalDamage = fixedAmount * (1 - this.getArmorMultiplier(true));
                    break;
                default:
                    console.log("unvalid damage type, must be either 0 for pure, 1 for physic or 2 for magic");
                    break;
            }
            if(this.isInmortal() && this.curHealth <= 0){
                this.curHealth = 1;
            }
            return totalDamage;
        }
    }

    heal(amount){
        this.curHealth += amount * (1 + this.getCauterize());
        if(this.getCurHealth() > this.getMaxHealth()){
            this.curHealth = this.getMaxHealth();
        }
    }
    
    takeDamage(params){ //scene, sprite, body, group, factory, scaleRatio, attacker:{caster, type, avoidable, critable, damage, crit, accuracy, critMultiplier}, attackerLabel
        //type 0 es puro, 1 físico y 2 mágico
        var rawDamage = params.attacker.damage;
        var crit = false;
        var finalDamage = 0;

        if(!params.attacker.avoidable){
            if(params.attacker.critable){
                if(randomFloat(101) <= params.attacker.crit){
                    rawDamage *= params.attacker.critMultiplier;
                    crit = true;
                    params.attacker.caster.onCrit({sprite: params.sprite, target: this});
                }
            }
            this.lastHitBy = params.attackerLabel;
            finalDamage = this.dealDamage(rawDamage, params.attacker.type);
            if(params.attackerLabel.split("#")[1] == params.scene.groups[0] || params.attackerLabel.split("#")[1] == params.scene.groups[1]){
                let punctuation = params.scene.getPunctuationByHeroAndGroup(params.attackerLabel.split("#")[0], parseInt(params.attackerLabel.split("#")[1]));
                if(punctuation != null){
                    punctuation.damage += finalDamage;
                }
            }
            if(this.curHealth <= 0){
                this.onDeath(params);
            }
        }else{
            var hitChance = params.attacker.accuracy - this.getEvasion();
            if(hitChance >= 100 || randomFloat(101) <= hitChance){
                if(params.attacker.critable){
                    if(randomFloat(101) <= params.attacker.crit){
                        rawDamage *= params.attacker.critMultiplier;
                        crit = true;
                        console.log("attacker", params.attacker);
                        params.attacker.caster.onCrit({sprite: params.sprite, target: this});
                    }
                }
                this.lastHitBy = params.attackerLabel;
                finalDamage = this.dealDamage(rawDamage, params.attacker.type);
                //se suma el daño hecho a la puntuacion de los jugadores si el atacante es un heroe
                if(params.attackerLabel.split("#")[1] == params.scene.groups[0] || params.attackerLabel.split("#")[1] == params.scene.groups[1]){
                    let punctuation = params.scene.getPunctuationByHeroAndGroup(params.attackerLabel.split("#")[0], parseInt(params.attackerLabel.split("#")[1]));
                    if(punctuation != null){
                        punctuation.damage += finalDamage;
                    }
                }
                if(this.curHealth <= 0){
                    this.onDeath(params);
                }
            }
        }
        //robo de vida
        if(finalDamage > 0 && params.attacker.type == 1 && params.attacker.caster.getLifesteal() > 0)
            params.attacker.caster.heal(finalDamage * params.attacker.caster.getLifesteal());
        else if(finalDamage > 0 && params.attacker.type == 2 && params.attacker.caster.getSpellLifesteal() > 0)
            params.attacker.caster.heal(finalDamage * params.attacker.caster.getSpellLifesteal());

        //mostrar texto de daño
        if(params.sprite != null && params.sprite.body != null){
            var damageMessage = "";
            var color = "#eeeeee";
            if (finalDamage == 0) {
              damageMessage = "missed";
              if(!this.mayTakeDamage(params.attacker.type)){
                damageMessage = "blocked";
              }
            }else{
              damageMessage = finalDamage.toString();
            }
            if (crit) {
              color = "#ff0808";
            }
            params.sprite.getData("displayDamage").x = params.sprite.x;
            params.sprite.getData("displayDamage").y = params.sprite.y;
            params.sprite.getData("displayDamage").data.values.timer = 40;
            params.sprite.getData("displayDamage").setText(damageMessage);
            params.sprite.getData("displayDamage").setColor(color);
            params.sprite.getData("displayDamage").setVisible(true);
            console.log(this.name, "got hit by", this.lastHitBy);
        }
        if(finalDamage > 0){
            this.statusManager.awake();
        }
        return {amount: finalDamage, isCrit: crit};
    }

    applyHealthRegen(params){
        this.heal(this.getHealthRegen() / 60);
    }
    
    restoreHealth(){
        this.curHealth = this.getMaxHealth();
    }

    //funciones sobre pasivas
    buildStatsPasives(scene){ //funciona para crear pasivas que solo suman stats, esta funciçon se llama al restaurar los efectos de las pasivas cuando s epierden por el status Decimate
        //se debe hacer la traducción de SDL y sumer stats mediante el status manager con código -3 en el timer
    }

    buildTriggerPasives(){ //funciona para crear pasivas que otorgan funcionaldades condicionadas
        //aquí se debe hacer la traducción de SDL y generar las habilidades pasivas
    }

    //funciones sobre eventos
    onKillMain(params){ //se activa al matar heroes o jefes

    }

    onKill(params){ //se activa al matar cualquier entidad

    }

    onAttack(params){ //se activa al lanzar un ataque

    }

    onAttackHit(params){ //se activa al acertar un ataque

    }

    onCrit(params){ //se activa al acertar un ataque crítico

    }

    onBodyCollision(params){ //se activa cuando el usuario colisiona con otro

    }

    aura(reach, params){ //genera un aura pasiva que afecta a los que esten dentro de dicha area

    }

    debuffTriggered(params){ //se activa cuando el usuario recibe un debuff

    }

    statusTriggered(params){ //se activa al acertar un ataque

    }

    healthTriggered(treshold, sign, params){ //se activa cuando el usuario obtiene cierto porcentaje de salud (0: =, 1: <, 2: <=, 3: >, 4: >=)

    }

    critTriggered(params){ //se activa cuando se recibe un crítico

    }

    attackTriggered(params){ //se activa cuando el usuario recibe un ataque

    }

    backstabTriggered(params){ //se activa al cuando se recibe un backstab

    }

    spellTriggered(params){ //se activa cuando el usuario es victima de un hechizo

    }

    ccTriggered(params){ //se activa acuando el usuario recibe un efecto d eperdida de control

    }

    onDeath(params){ //scene, body
        if(parseInt(this.lastHitBy.split("#")[1]) == params.scene.groups[1] || parseInt(this.lastHitBy.split("#")[1]) == params.scene.groups[4]){
            if(parseInt(this.lastHitBy.split("#")[1]) != params.scene.groups[4]){
                for(var i = 0; i < params.scene.teamBSprites.children.getArray().length; i++){
                    if(params.scene.teamASprites.children.getArray()[i].getData("backend").name == this.lastHitBy.split("#")[0] && (params.scene.teamASprites.children.getArray()[i].getData("backend") instanceof Hero)){
                        let punctuation = params.scene.getPunctuationByHeroAndGroup(this.lastHitBy.split("#")[0] ,parseInt(this.lastHitBy.split("#")[1]));
                        params.scene.teamASprites.children.getArray()[i].getData("backend").gainXP({scene: params.scene, amount: this.calculateNextLevelXp() * 0.8});
                        params.scene.teamASprites.children.getArray()[i].getData("backend").earnGold({scene: params.scene, amount: this.calculateBounty() * 0.8});
                        punctuation.GPM += this.calculateBounty() * 0.8;
                        punctuation.XPM += this.calculateNextLevelXp() * 0.8;
                        punctuation.lastHits++;
                        if(this.constructor instanceof Hero){
                            punctuation.kills++;
                            let localPunctuation = params.scene.getPunctuationByHeroAndGroup(this.name , params.body.collisionFilter.group);
                            if(localPunctuation != null){
                                localPunctuation.deaths++;
                            }
                        }
                        break;
                    }
                }
            }
            return params.scene.categories[3];
        }else if(parseInt(this.lastHitBy.split("#")[1]) == params.scene.groups[0] || parseInt(this.lastHitBy.split("#")[1]) == params.scene.groups[4]){
            if(parseInt(this.lastHitBy.split("#")[1]) != params.scene.groups[4]){
                for(var i = 0; i < params.scene.teamASprites.children.getArray().length; i++){
                    if(params.scene.teamASprites.children.getArray()[i].getData("backend").name == this.lastHitBy.split("#")[0] && (params.scene.teamASprites.children.getArray()[i].getData("backend") instanceof Hero)){
                        let punctuation = params.scene.getPunctuationByHeroAndGroup(this.lastHitBy.split("#")[0] ,parseInt(this.lastHitBy.split("#")[1]));
                        params.scene.teamASprites.children.getArray()[i].getData("backend").gainXP({scene: params.scene, amount: this.calculateNextLevelXp() * 0.8});
                        params.scene.teamASprites.children.getArray()[i].getData("backend").earnGold({scene: params.scene, amount: this.calculateBounty() * 0.8});
                        punctuation.GPM += this.calculateBounty() * 0.8;
                        punctuation.XPM += this.calculateNextLevelXp() * 0.8;
                        punctuation.lastHits++;
                        break;
                    }
                }
            }
            return params.scene.categories[1];
        }else{
            return 0;
        }
    }
}