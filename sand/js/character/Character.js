import Entity from "./Entity.js";
import Hero from "./Hero.js";

export default class Character extends Entity{
    constructor(name, level, xpFactor, bountyFactor, race, fortitude, damage, armor, maxHealth, healthRegen, speed, atSpeed, evasion, crit, accuracy, maxMana, manaRegen, spellPower, will, magicArmor, concentration, spawnPoint, critMultiplier, ranged, range, skills){
        super(name, level, xpFactor, bountyFactor, damage, armor, evasion, maxHealth, healthRegen, atSpeed, accuracy, magicArmor, ranged, range);
        this.race = race;
        this.isBoss = false;

        //referente a poderes e items
        this.pasives = skills.pasives;
        this.skills = skills.spells;
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
    getSpellPower(){
        if(this.concentration <= -100){
            return -100;
        }else{
            return this.concentration;
        }
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

    commitSpellq(animation, frame, gameObject) {
        gameObject.scene.lastKeyPressed = "";
    }
    commitSpelle(animation, frame, gameObject) {
        gameObject.scene.lastKeyPressed = "";
    }
    commitSpellf(animation, frame, gameObject) {
        gameObject.scene.lastKeyPressed = "";
    }
    commitSpellr(animation, frame, gameObject) {
        gameObject.scene.lastKeyPressed = "";
    }
}