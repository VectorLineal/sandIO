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
        this.cauterize = 0;

        //character's body
        this.atFrames = [];
        this.ranged = ranged;
        this.range = range;
    }

    //funciones sobre sprites
    addAnimation(scene, animationName, frames){
        var animationSpeed = this.calculateAttackRate();
        if(animationName != "attack_" + this.name && animationName != "attack_" + this.name + "_end"){
            animationSpeed = 500/*this.skills[animationName].castPoint*/;
        }else if(animationName == "attack_" + this.name){
            this.atFrames[0] = frames;
        }else if(animationName == "attack_" + this.name + "_end"){
            this.atFrames[1] = frames;
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
    }

    commitAttack(animation, frame, gameObject) {
        gameObject.scene.lastKeyPressed = "";
        if(!gameObject.getData("backend").getRanged()){
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
          if (gameObject.body.collisionFilter.group == gameObject.scene.groups[0]) {
            attackBox.collisionFilter.category = gameObject.scene.categories[0];
          } else if (gameObject.body.collisionFilter.group == gameObject.scene.groups[1]) {
            attackBox.collisionFilter.category = gameObject.scene.categories[2];
          } else if (gameObject.body.collisionFilter.group == gameObject.scene.groups[2]) {
            attackBox.collisionFilter.category = gameObject.scene.categories[4];
          }
        }else{
          //crear proyectil para ataque a distancia, pendiente creacion de clase proyectil
        }
    
        gameObject.play("attack_" + gameObject.getData("backend").name + "_end");
        console.log("bodies in world:", gameObject.scene.matter.world.getAllBodies());
    }

    distributeXp(scene, group){

    }

    castAttack(sprite){
        if(this.mayAttack() && !sprite.anims.isPlaying){
            sprite.play("attack_" + this.name);
            this.statusManager.makeVisible();
        }
    }

    //funciones no gráficas
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
        if(!this.mayTakeDamage(type)){
            return 0;
        }else{
            var totalDamage = 0;
            switch(type){
                case 0:
                    this.curHealth -=  this.shieldDamage(amount);
                    totalDamage = amount;
                case 1:
                    this.curHealth -=  this.shieldDamage(amount * (1 - this.getArmorMultiplier(false)));
                    totalDamage = amount * (1 - this.getArmorMultiplier(false));
                case 2:
                    this.curHealth -=  this.shieldDamage(amount * (1 - this.getArmorMultiplier(true)));
                    totalDamage = amount * (1 - this.getArmorMultiplier(true));
                default:
                    console.log("unvalid damage type, must be either 0 for pure, 1 for physic or 2 for magic");
            }
            if(this.isInmortal() && this.curHealth <= 0){
                this.curHealth = 1;
            }
            return totalDamage;
        }
    }

    heal(amount){
        this.curHealth += amount;
        if(this.curHealth >= this.maxHealth){
            this.curHealth = this.maxHealth;
        }
    }
    
    takeDamage(params){ //scene, sprite, body, group, factory, scaleRatio, type, avoidable, critable, attacker, attackerLabel
        //type 0 es puro, 1 físico y 2 mágico
        var rawDamage = params.attacker.damage;
        var crit = false;
        var finalDamage = 0;

        if(!params.avoidable){
            if(params.critable){
                if(randomFloat(101) <= params.attacker.crit){
                    rawDamage *= params.attacker.getCritMultiplier();
                    crit = true;
                }
            }
            this.lastHitBy = params.attackerLabel;
            finalDamage = this.dealDamage(rawDamage, params.type);
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
            var hitChance = params.attacker.accuracy - this.evasion;
            if(randomFloat(101) <= hitChance){
                if(params.critable){
                    if(randomFloat(101) <= params.attacker.crit){
                        rawDamage *= params.attacker.getCritMultiplier();
                        crit = true;
                    }
                }
                this.lastHitBy = params.attackerLabel;
                finalDamage = this.dealDamage(rawDamage, params.type);
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
        //mostrar texto de daño
        if(params.sprite != null && params.sprite.body != null){
            var damageMessage = "";
            var color = "#eeeeee";
            if (finalDamage == 0) {
              damageMessage = "missed";
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
        this.heal(this.healthRegen / 60);
    }
    
    restoreHealth(){
        this.curHealth = this.maxHealth;
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
    mayUsePasives(){ //pendiente implementación
        return this.statusManager.mayUsePasives();
    }
    mayCastSpells(){ //pendiente implementación
        return this.statusManager.mayCastSpells();
    }
    mayTakeDamage(type){ //tipo 0: puro, tipo 1: fisico, tipo 2: magico
        return this.statusManager.mayTakeDamage(type);
    }
    mayBeDisabled(){ //pendiente implementación
        return this.statusManager.mayBeDisabled();
    }
    mayBeDebuffed(){ //pendiente implementación
        return !this.statusManager.isSpellInmune();
    }
    isMarked(){ //pendiente implementación
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

    //funciones sobre eventos
    onDeath(params){
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