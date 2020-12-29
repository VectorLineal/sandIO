import {randomFloat} from "../../main_layer/MathUtils.js";
import Hero from "../Hero.js";

export default class{
    constructor(){
        //hashtable
       this.singleEffects = {
           stun: 0,
           disarm: 0,
           cripple: 0,
           mute: 0,
           sleep: 0,
           freeze: 0,
           mark: 0,
           polymorph: 0,
           decimate: 0,
           invisibility: 0,
           inmortality: 0,
           hypnosis: 0,
           fear: 0,
           CCInmune: 0,
           fly: 0,
           spellInmune: 0,
           damageInmune: 0,
           banish: 0,
           push: 0, //se usa cuando se aplique efecto de cambios de movimiento (push, pull, shuffle)
           markedForDeath: -1 //(no purgable)indica si algun personaje morira en dado tiempo (se usa sobre todo en criaturas invocadas por x tiempo) default -1
       };
       //lista
       this.buffs = []; //elementos tipo {name, attribute, amount, timer, stacks, stackable, clearAtZero} siendo los ultimos dos atributos flags que indican si el efecto es acumulable(0: no es, 1: es, cada nueva acumulación refresca su duración, 2: es, pero cada acumulación no altera el tiempo) y si se elimina cuando su atributo cambie a 0(escudo o bloqueo)
       //hastable de listas
       this.damageOnTime = {
           rawDamage: [],
           burn: [],
           bleed: [],
           poison: [],
           curse: [],
           electric: [],
           parasite: [],
           illness: []
       }; //elementos tipo {name, damageType, amount, debuffAmount, timer, stacks, stackable, caster}
    }

    //funciones de checkeo, queries, etc.
    isStunt(){
        return this.singleEffects.stun != 0;
    }
    isDisarmed(){
        return this.singleEffects.disarm != 0;
    }
    isCrppled(){
        return this.singleEffects.cripple != 0;
    }
    isMuted(){
        return this.singleEffects.mute != 0;
    }
    isSlept(){
        return this.singleEffects.sleep != 0;
    }
    isFrozen(){
        return this.singleEffects.freeze != 0;
    }
    isMarked(){
        return this.singleEffects.mark != 0;
    }
    isMorphed(){
        return this.singleEffects.polymorph != 0;
    }
    isDecimated(){
        return this.singleEffects.decimate != 0;
    }
    isInvisible(){
        return this.singleEffects.invisibility != 0;
    }
    isInmortal(){
        return this.singleEffects.inmortality != 0;
    }
    isHypnotized(){
        return this.singleEffects.hypnosis != 0;
    }
    isFeared(){
        return this.singleEffects.fear != 0;
    }
    isCCInmune(){
        return this.singleEffects.CCInmune != 0;
    }
    flies(){
        return this.singleEffects.fly != 0;
    }
    isSpellInmune(){
        return this.singleEffects.spellInmune != 0;
    }
    isDamageInmune(){
        return this.singleEffects.damageInmune != 0;
    }
    isBanished(){
        return this.singleEffects.banish != 0;
    }
    isPushed(){
        return this.singleEffects.push != 0;
    }
    isMarkedForDeath(){
        return this.singleEffects.markedForDeath != 0;
    }
    isBuffed(){
        for(var i = 0; i < this.buffs.length; i++){
            if(this.buffs[i].amount > 0){
                return true;
            }
        }
        return false;
    }
    isDebuffed(){
        for(var i = 0; i < this.buffs.length; i++){
            if(this.buffs[i].amount < 0 && this.buffs[i].attribute != "cauterize" && this.buffs[i].attribute != "damageAmplification"){
                return true;
            }
        }
        return false;
    }
    //casos especiales de debuff
    isCauterized(){
        for(var i = 0; i < this.buffs.length; i++){
            if(this.buffs[i].amount < 0 && this.buffs[i].attribute == "cauterize"){
                return true;
            }
        }
        return false;
    }
    isVulnerable(){
        for(var i = 0; i < this.buffs.length; i++){
            if(this.buffs[i].amount < 0 && this.buffs[i].attribute == "damageAmplification"){
                return true;
            }
        }
        return false;
    }
    isTakingDamage(){
        return this.damageOnTime.rawDamage.length > 0;
    }
    isBurnt(){
        return this.damageOnTime.burn.length > 0;
    }
    isBleeding(){
        return this.damageOnTime.bleed.length > 0;
    }
    isPoisoned(){
        return this.damageOnTime.poison.length > 0;
    }
    isCursed(){
        return this.damageOnTime.curse.length > 0;
    }
    isShocked(){
        return this.damageOnTime.electric.length > 0;
    }
    isParasited(){
        return this.damageOnTime.parasite.length > 0;
    }
    isIll(){
        return this.damageOnTime.illness.length > 0;
    }

    //queries compuestas
    mayRotate(){
        return !(this.isStunt() || this.isSlept() || this.isFeared() || this.isHypnotized() || this.isBanished() || this.isPushed());
    }

    mayMove(){
        return !(this.isSlept() || this.isStunt() || this.isCrppled() || this.isFrozen() || this.isFeared() || this.isHypnotized() || this.isBanished() || this.isPushed());
    }
    onlyMovingForward(){
        return this.isFeared() || this.isHypnotized();
    }
    mayAttack(){
        return !(this.isSlept() || this.isStunt() || this.isFrozen() || this.isFeared() || this.isHypnotized() || this.isMorphed() || this.isDisarmed() || this.isBanished());
    }
    mayUsePasives(){
        return !(this.isDecimated() || this.isFrozen());
    }
    mayCastSpells(){
        return !(this.isSlept() || this.isStunt() || this.isMuted() || this.isMorphed() || this.isFeared() || this.isHypnotized() || this.isBanished());
    }
    mayTakeDamage(type){ //tipo 0: puro, tipo 1: fisico, tipo 2: magico
        switch(type){
            case 0:
                return !(this.isDamageInmune() || this.isBanished());
            case 1:
                return !(this.isDamageInmune() || this.isBanished());
            case 2:
                return !(this.isDamageInmune() || this.isSpellInmune() || this.isBanished());
            default:
                return !(this.isDamageInmune() || this.isBanished());
        }
    }
    mayBeDisabled(){
        return !(this.isSpellInmune() || this.isCCInmune() || this.isBanished());
    }

    getVisibility(){
        if(this.isInvisible() && !this.isMarked()){
            return 0;
        }else if(this.isInvisible() && this.isMarked()){
            return 1;
        }else{
            return 2;
        }
    }

    queryStat(entity, attribute){
        switch(attribute){
            case "damage":
                return entity.damage;
            case "armor":
                return entity.armor;
            case  "evasion":
                return entity.evasion;
            case "health":
                return entity.maxHealth;
            case "healthRegen":
                return entity.healthRegen;
            case "atSpeed":
                return entity.atSpeed;
            case "accuracy":
                return entity.accuracy;
            case "magicArmor":
                return entity.magicArmor;
            case "fortitude":
                if(entity.fortitude != null)
                    return entity.fortitude;
            case "speed":
                if(entity.speed != null)
                    return entity.speed;
            case "crit":
                if(entity.crit != null)
                    return entity.crit;
            case "mana":
                if(entity.maxMana != null)
                    return entity.maxMana;
            case "manaRegen":
                if(entity.manaRegen != null)
                    return entity.manaRegen;
            case "spellPower":
                if(entity.spellPower != null)
                    return entity.spellPower;
            case "will":
                if(entity.will != null)
                    return entity.will;
            case "concentration":
                if(entity.concentratione != null)
                    return entity.concentration;
            case "critMultiplier": //atributos no básicos
                if(entity.critMultiplier != null)
                    return entity.critMultiplier;
            case "shield":
                return entity.shield;
            case "FOV":
                return entity.fov;
            case "cauterize":
                return entity.cauterize;
            case "damageAmplification":
                return entity.damageAmplification;
            case "lifesteal":
                return entity.lifesteal;
            case "spellLifesteal":
                if(entity.spellLifesteal != null)
                    return entity.spellLifesteal;
        }
        console.log(attribute, "queried attribute not found");
        return null;
    }

    alterStat(entity, attribute, amount, scene){
        let percentualChange = 0;
        switch(attribute){
            case "damage":
                entity.damage += amount;
                break;
            case "armor":
                entity.armor += amount;
                break;
            case  "evasion":
                entity.evasion += amount;
                break;
            case "health":
                percentualChange = amount / entity.maxHealth;
                entity.maxHealth += amount;
                entity.curHealth += entity.curHealth * percentualChange;
                if(entity.maxHealth < entity.curHealth){
                    entity.curHealth = entity.maxHealth;
                }
                break;
            case "healthRegen":
                entity.healthRegen += amount;
                break;
            case "atSpeed":
                entity.atSpeed += amount;
                entity.rebalanceAttackAnimations(scene);
                break;
            case "accuracy":
                entity.accuracy += amount;
                break;
            case "magicArmor":
                entity.magicArmor += amount;
                break;
            case "fortitude":
                if(entity.fortitude != null)
                    entity.fortitude += amount;
                break;
            case "speed":
                if(entity.speed != null)
                    entity.speed += amount;
                break;
            case "crit":
                if(entity.crit != null)
                    entity.crit += amount;
                break;
            case "mana":
                if(entity.maxMana != null){
                    percentualChange = amount / entity.maxMana;
                    entity.maxMana += amount;
                    entity.curMana += entity.curMana * percentualChange;
                    if(entity.maxMana < entity.curMana){
                        entity.curMana = entity.maxMana;
                    }
                }
                break;
            case "manaRegen":
                if(entity.manaRegen != null)
                    entity.manaRegen += amount;
                break;
            case "spellPower":
                if(entity.spellPower != null)
                    entity.spellPower += amount;
                break;
            case "will":
                if(entity.will != null)
                    entity.will += amount;
                break;
            case "concentration":
                if(entity.concentration != null)
                    entity.concentration += amount;
                break;
            case "critMultiplier": //atributos no básicos
                if(entity.critMultiplier != null)
                    entity.critMultiplier += amount;
                break;
            case "shield":
                entity.maxShield += amount;
                if(amount > 0){
                    entity.shield += amount;
                }
                if(entity.maxHealth < entity.curHealth){
                    entity.curHealth = entity.maxHealth;
                }
                break;
            case "FOV":
                entity.fov += amount;
                break;
            case "cauterize":
                entity.cauterize += amount;
                break;
            case "damageAmplification":
                entity.damageAmplification += amount;
                break;
            case "lifesteal":
                entity.lifesteal += amount;
                break;
            case "spellLifesteal":
                if(entity.spellLifesteal != null)
                    entity.spellLifesteal += amount;
                break;
        }
        if(entity instanceof Hero){
            scene.events.emit('updateStats');
            scene.events.emit('updateMaxHealth');
            scene.events.emit('updateHealth');
            scene.events.emit('updateHealthRegen');
            scene.events.emit('updateMaxMana');
            scene.events.emit('updateMana');
            scene.events.emit('updateManaRegen');
        }
    }

    //funciones para añadir o remover cambios de estado
    awake(){
        this.singleEffects.sleep = 0;
    }
    makeVisible(){
        this.singleEffects.invisibility = 0;
    }

    purge(entity, positive, scene){
        if(positive){
            this.singleEffects.invisibility = 0;
            this.singleEffects.inmortality = 0;
            this.singleEffects.CCInmune = 0;
            this.singleEffects.banish = 0;
            this.singleEffects.fly = 0;
            this.singleEffects.spellInmune = 0;
            this.singleEffects.damageInmune = 0;

            for(var i = this.buffs.length - 1; i >= 0; i--){
                if(this.buffs[i].amount >= 0 && this.buffs[i].timer >= 0){
                    let buff = this.buffs.splice(i, 1);
                    this.alterStat(entity, buff[0].attribute, -buff[0].amount, scene);
                }
            }
        }else{
            this.singleEffects.stun = 0;
            this.singleEffects.disarm = 0;
            this.singleEffects.cripple = 0;
            this.singleEffects.mute = 0;
            this.singleEffects.sleep = 0;
            this.singleEffects.freeze = 0;
            this.singleEffects.mark = 0;
            this.singleEffects.polymorph = 0;
            this.singleEffects.decimate = 0;
            this.singleEffects.hypnosis = 0;
            this.singleEffects.fear = 0;
            this.singleEffects.banish = 0;
            this.singleEffects.push = 0;

            for(var i = this.buffs.length - 1; i >= 0; i--){
                if(this.buffs[i].amount <= 0 && this.buffs[i].timer >= 0){
                    let buff = this.buffs.splice(i, 1);
                    this.alterStat(entity, buff[0].attribute, -buff[0].amount, scene);
                }
            }

            this.damageOnTime.rawDamage = [];
            this.damageOnTime.electric = [];
            this.damageOnTime.parasite = [];

            for(var i = this.damageOnTime.burn.length - 1; i >= 0; i--){
                var status = this.damageOnTime.burn.splice(i, 1);
                this.alterStat(entity, "armor", -status[0].debuffAmount, scene);
            }
            for(var i = this.damageOnTime.bleed.length - 1; i >= 0; i--){
                var status = this.damageOnTime.bleed.splice(i, 1);
                this.alterStat(entity, "cauterize", -status[0].debuffAmount, scene);
            }
            for(var i = this.damageOnTime.poison.length - 1; i >= 0; i--){
                var status = this.damageOnTime.poison.splice(i, 1);
                this.alterStat(entity, "speed", -status[0].debuffAmount, scene);
            }
            for(var i = this.damageOnTime.curse.length - 1; i >= 0; i--){
                var status = this.damageOnTime.curse.splice(i, 1);
                this.alterStat(entity, "magicArmor", -status[0].debuffAmount, scene);
            }
            for(var i = this.damageOnTime.illness.length - 1; i >= 0; i--){
                var status = this.damageOnTime.illness.splice(i, 1);
                this.alterStat(entity, "atSpeed", -status[0].debuffAmount, scene);
            }
        }
    }

    stun(sprite, amount){
        if(sprite.anims.isPlaying)
            sprite.anims.stop();
        this.singleEffects.stun = Math.max(this.singleEffects.stun, amount);
    }
    disarm(sprite, amount){
        if(sprite.anims.isPlaying && sprite.anims.key == "attack_" + this.name)
            sprite.anims.stop();
        this.singleEffects.disarm = Math.max(this.singleEffects.disarm, amount);
    }
    cripple(sprite, amount){
        this.singleEffects.cripple = Math.max(this.singleEffects.cripple, amount);
        sprite.setVelocity(0);
    }
    mute(sprite, amount){
        if(sprite.anims.isPlaying && sprite.anims.key != "attack_" + this.name)
            sprite.anims.stop();
        this.singleEffects.mute = Math.max(this.singleEffects.mute, amount);
    }
    sleep(sprite, amount){
        if(sprite.anims.isPlaying)
            sprite.anims.stop();
        this.singleEffects.sleep = Math.max(this.singleEffects.sleep, amount);
    }
    freeze(sprite, amount){
        if(sprite.anims.isPlaying && sprite.anims.key == "attack_" + this.name)
            sprite.anims.stop();
        this.singleEffects.freeze = Math.max(this.singleEffects.freeze, amount);
        if(this.singleEffects.freeze > 0)
            this.clearPasives(entity);
    }
    mark(amount){
        this.singleEffects.mark = Math.max(this.singleEffects.mark, amount);
    }
    morph(sprite, amount){
        if(sprite.anims.isPlaying)
            sprite.anims.stop();
        this.singleEffects.polymorph = Math.max(this.singleEffects.polymorph, amount);
    }
    decimate(entity, amount){
        this.singleEffects.decimate = Math.max(this.singleEffects.decimate, amount);
        if(this.singleEffects.decimate > 0)
            this.clearPasives(entity);
    }
    becomeInvisible(amount){
        this.singleEffects.invisibility = Math.max(this.singleEffects.invisibility, amount);
    }
    becomeInmortal(amount){
        this.singleEffects.inmortality = Math.max(this.singleEffects.inmortality, amount);
    }
    hypnotize(sprite, amount){
        if(sprite.anims.isPlaying)
            sprite.anims.stop();
        this.singleEffects.hypnosis = Math.max(this.singleEffects.hypnosis, amount);
    }
    becomeFeared(sprite, amount){
        sprite.setAngle(randomFloat(360));
        if(sprite.anims.isPlaying)
            sprite.anims.stop();
        this.singleEffects.fear= Math.max(this.singleEffects.fear, amount);
    }
    becomeCCInmune(amount){
        this.singleEffects.CCInmune = Math.max(this.singleEffects.CCInmune, amount);
    }
    fly(amount){
        this.singleEffects.fly = Math.max(this.singleEffects.fly, amount);
    }
    becomeSpellInmune(amount){
        this.singleEffects.spellInmune = Math.max(this.singleEffects.spellInmune, amount);
    }
    becomeDamageInmune(amount){
        this.singleEffects.damageInmune = Math.max(this.singleEffects.damageInmune, amount);
    }
    banish(sprite, amount){
        if(sprite.anims.isPlaying)
            sprite.anims.stop();
        this.singleEffects.banish = Math.max(this.singleEffects.banish, amount);
    }
    pushBody(amount){
        this.singleEffects.push = Math.max(this.singleEffects.push, amount);
    }
    markForDeath(amount){
        this.singleEffects.markedForDeath = Math.max(this.singleEffects.markedForDeath, amount);
    }

    getListIndex(list, id){
        for(var i = 0; i < list.length; i++){
            if(list[i].name == id){
                return i;
            }
        }
        return -1; //en caso que el elemento no esté en la lista
    }

    clearPasives(entity){
        for(var i = this.buffs.length - 1; i >= 0; i--){
            if(this.buffs[i].timer == -3){
                let buff = this.buffs.splice(i, 1);
                this.alterStat(entity, buff[0].attribute, -buff[0].amount, scene);
            }
        }
    }

    pushBuff(entity, element, scene){ //elementos tipo {name, attribute, amount, timer, stacks, stackable, clearAtZero}
        let posibleIndex = this.getListIndex(this.buffs, element.name);
        if(posibleIndex != -1){
            if(this.buffs[posibleIndex].stackable > this.buffs[posibleIndex].stacks){
                this.buffs[posibleIndex].stacks++;
                this.buffs[posibleIndex].amount += element.amount;
                this.alterStat(entity, this.buffs[posibleIndex].attribute, element.amount, scene);
            }else if(this.buffs[posibleIndex].stackable > 1){
                this.buffs[posibleIndex].timer = Math.max(this.buffs[posibleIndex].timer, element.timer);
            }else{
                if(this.buffs[posibleIndex].amount < 0)
                    this.buffs[posibleIndex].amount = Math.min(this.buffs[posibleIndex].amount, element.amount);
                else if(this.buffs[posibleIndex].amount > 0)
                    this.buffs[posibleIndex].amount = Math.max(this.buffs[posibleIndex].amount, element.amount);
                else{
                    if(element.amount < 0)
                        this.buffs[posibleIndex].amount = Math.min(this.buffs[posibleIndex].amount, element.amount);
                    else
                        this.buffs[posibleIndex].amount = Math.max(this.buffs[posibleIndex].amount, element.amount);
                }
                this.buffs[posibleIndex].timer = Math.max(this.buffs[posibleIndex].timer, element.timer);
            }
        }else{
            this.buffs.push(element);
            this.alterStat(entity, element.attribute, element.amount, scene);
        }
    }
    
    pushDamageOnTime(entity, element, type, scene){ //elementos tipo {name, damageType, amount, debuffAmount, timer, stacks, stackable, caster} donde caster es un puntero al lanzador del hechizo
        let posibleIndex = this.getListIndex(this.damageOnTime[type], element.name);
        if(posibleIndex != -1){
            if(this.damageOnTime[type][posibleIndex].stackable > this.damageOnTime[type][posibleIndex].stacks){
                this.damageOnTime[type][posibleIndex].stacks++;
                switch(type){
                    case "burn":
                        this.alterStat(entity, "armor", element.debuffAmount, scene);
                        this.damageOnTime[type][posibleIndex].debuffAmount += element.debuffAmount;
                        break;
                    case "bleed":
                        this.alterStat(entity, "cauterize", element.debuffAmount, scene);
                        this.damageOnTime[type][posibleIndex].debuffAmount += element.debuffAmount;
                        break;
                    case "poison":
                        this.alterStat(entity, "speed", element.debuffAmount, scene);
                        this.damageOnTime[type][posibleIndex].debuffAmount += element.debuffAmount;
                        break;
                    case "curse":
                        this.alterStat(entity, "magicArmor", element.debuffAmount, scene);
                        this.damageOnTime[type][posibleIndex].debuffAmount += element.debuffAmount;
                        break;
                    case "illness":
                        this.alterStat(entity, "atSpeed", element.debuffAmount, scene);
                        this.damageOnTime[type][posibleIndex].debuffAmount += element.debuffAmount;
                        break;
                    default:
                        break;
                }
            }else{
                this.damageOnTime[type][posibleIndex].timer = Math.max(this.damageOnTime[type][posibleIndex].timer, element.timer);
            }
        }else{
            this.damageOnTime[type].push(element);
            switch(type){
                case "burn":
                    this.alterStat(entity, "armor", element.debuffAmount, scene);
                    break;
                case "bleed":
                    this.alterStat(entity, "cauterize", element.debuffAmount, scene);
                    break;
                case "poison":
                    this.alterStat(entity, "speed", element.debuffAmount, scene);
                    break;
                case "curse":
                    this.alterStat(entity, "magicArmor", element.debuffAmount, scene);
                    break;
                case "illness":
                    this.alterStat(entity, "atSpeed", element.debuffAmount, scene);
                    break;
                default:
                    break;
            }
        }
    }

    //funciones de utilidades
    groupFrameIndex(group, frameCode){
        for(var i = 0; i < group.children.entries.length; i++){
            if(parseInt(group.children.entries[i].frame.name) == frameCode){
                return i;
            }
        }
        return -1;
    }

    //funciones sobre eventos
    onDeath(entity, scene){
        //se limpian cambios de estado
        this.purge(entity, true, scene);
        this.purge(entity, false, scene);

        //se elminan condiciones que se pierden al morir
        for(var i = this.buffs.length - 1; i >= 0; i--){
            if(this.buffs[i].timer == -2){
                let buff = this.buffs.splice(i, 1);
                this.alterStat(entity, buff[0].attribute, -buff[0].amount, scene);
            }
        }
    }
    onUpdate(params){
        //se actualizan timers de todos los efectos de un solo parametro
        if(this.singleEffects.stun > 0){
            this.singleEffects.stun--;
        }
        if(this.singleEffects.disarm > 0){
            this.singleEffects.disarm--;
        }
        if(this.singleEffects.cripple > 0){
            this.singleEffects.cripple--;
        }
        if(this.singleEffects.mute > 0){
            this.singleEffects.mute--;
        }
        if(this.singleEffects.sleep > 0){
            this.singleEffects.sleep--;
        }
        if(this.singleEffects.freeze > 0){
            this.singleEffects.freeze--;
        }
        if(this.singleEffects.mark > 0){
            this.singleEffects.mark--;
        }
        if(this.singleEffects.polymorph > 0){
            this.singleEffects.polymorph--;
        }
        if(this.singleEffects.decimate > 0){
            this.singleEffects.decimate--;
            if(this.singleEffects.decimate == 0)
                params.entity.buildStatsPasives(params.scene);
        }
        if(this.singleEffects.invisibility > 0){
            this.singleEffects.invisibility--;
        }
        if(this.singleEffects.inmortality > 0){
            this.singleEffects.inmortality--;
        }
        if(this.singleEffects.hypnosis > 0){
            this.singleEffects.hypnosis--;
        }
        if(this.singleEffects.fear > 0){
            this.singleEffects.fear--;
        }
        if(this.singleEffects.CCInmune > 0){
            this.singleEffects.CCInmune--;
        }
        if(this.singleEffects.fly > 0){
            this.singleEffects.fly--;
        }
        if(this.singleEffects.spellInmune > 0){
            this.singleEffects.spellInmune--;
        }
        if(this.singleEffects.damageInmune > 0){
            this.singleEffects.damageInmune--;
        }
        if(this.singleEffects.banish > 0){
            this.singleEffects.banish--;
        }
        if(this.singleEffects.markedForDeath > 0){
            this.singleEffects.markedForDeath--;
        }

        //se actualizan contadores de buffs y debuffs
        for(var i = this.buffs.length - 1; i >= 0; i--){
            this.buffs[i].timer--;
            //se limpian los debuffs cuyo tiempo haya expirado
            if(this.buffs[i].timer == 0 || (this.buffs[i].clearAtZero && this.queryStat(params.entity, this.buffs[i].attribute) == 0) || this.buffs[i].amount == 0){
                let buff = this.buffs.splice(i, 1);
                this.alterStat(params.entity, buff[0].attribute, -buff[0].amount, params.scene);
            }
        }

        //se actualizan contadores de quemadura
        for(var i = this.damageOnTime.rawDamage.length - 1; i >= 0 ; i--){
            this.damageOnTime.rawDamage[i].timer --;
            params.entity.dealDamage(this.damageOnTime.rawDamage[i].amount * this.damageOnTime.rawDamage[i].stacks, this.damageOnTime.rawDamage[i].damageType);
            if(params.entity.curHealth <= 0){
                params.entity.onDeath(params);
                return;
            }
            if(this.damageOnTime.rawDamage[i].timer == 0){
                this.damageOnTime.rawDamage.splice(i, 1);
            }
        }
        for(var i = this.damageOnTime.burn.length - 1; i >= 0; i--){
            this.damageOnTime.burn[i].timer --;
            params.entity.dealDamage(this.damageOnTime.burn[i].amount * this.damageOnTime.burn[i].stacks, this.damageOnTime.burn[i].damageType);
            if(params.entity.curHealth <= 0){
                params.entity.onDeath(params);
                return;
            }
            if(this.damageOnTime.burn[i].timer == 0){
                var status = this.damageOnTime.burn.splice(i, 1);
                this.alterStat(params.entity, "armor", -status[0].debuffAmount, params.scene); //para evitar inconsistencias con daños porcentuales, cada vez que se sume un stack, la cantidad e debuff se suma en dicha variable.
            }
        }
        for(var i = this.damageOnTime.bleed.length - 1; i >= 0; i--){
            this.damageOnTime.bleed[i].timer --;
            params.entity.dealDamage(this.damageOnTime.bleed[i].amount * this.damageOnTime.bleed[i].stacks, this.damageOnTime.bleed[i].damageType);
            if(params.entity.curHealth <= 0){
                params.entity.onDeath(params);
                return;
            }
            if(this.damageOnTime.bleed[i].timer == 0){
                var status = this.damageOnTime.bleed.splice(i, 1);
                this.alterStat(params.entity, "cauterize", -status[0].debuffAmount, params.scene); 
            }
        }
        for(var i = this.damageOnTime.poison.length - 1; i >= 0; i--){
            this.damageOnTime.poison[i].timer --;
            params.entity.dealDamage(this.damageOnTime.poison[i].amount * this.damageOnTime.poison[i].stacks, this.damageOnTime.poison[i].damageType);
            if(params.entity.curHealth <= 0){
                params.entity.onDeath(params);
                return;
            }
            if(this.damageOnTime.poison[i].timer == 0){
                var status = this.damageOnTime.poison.splice(i, 1);
                this.alterStat(params.entity, "speed", -status[0].debuffAmount, params.scene);
            }
        }
        for(var i = this.damageOnTime.curse.length - 1; i >= 0; i--){
            this.damageOnTime.curse[i].timer --;
            params.entity.dealDamage(this.damageOnTime.curse[i].amount * this.damageOnTime.curse[i].stacks, this.damageOnTime.curse[i].damageType);
            if(params.entity.curHealth <= 0){
                params.entity.onDeath(params);
                return;
            }
            if(this.damageOnTime.curse[i].timer == 0){
                var status = this.damageOnTime.curse.splice(i, 1);
                this.alterStat(params.entity, "magicArmor", -status[0].debuffAmount, params.scene); 
            }
        }
        for(var i = this.damageOnTime.electric.length - 1; i >= 0; i--){
            this.damageOnTime.electric[i].timer --;
            params.entity.spendMana({scene: params.scene, amount: -0.25 * params.entity.dealDamage(this.damageOnTime.electric[i].amount * this.damageOnTime.electric[i].stacks, this.damageOnTime.electric[i].damageType)});
            if(params.entity.curHealth <= 0){
                params.entity.onDeath(params);
                return;
            }
            if(this.damageOnTime.electric[i].timer == 0){
                this.damageOnTime.electric.splice(i, 1);
            }
        }
        for(var i = this.damageOnTime.parasite.length - 1; i >= 0; i--){
            this.damageOnTime.parasite[i].timer --;
            this.damageOnTime.parasite[i].caster.heal(params.entity.dealDamage(this.damageOnTime.parasite[i].amount * this.damageOnTime.parasite[i].stacks, this.damageOnTime.parasite[i].damageType));
            if(params.entity.curHealth <= 0){
                params.entity.onDeath(params);
                return;
            }
            if(this.damageOnTime.parasite[i].timer == 0){
                this.damageOnTime.parasite.splice(i, 1);
            }
        }
        for(var i = this.damageOnTime.illness.length - 1; i >= 0; i--){
            this.damageOnTime.illness[i].timer --;
            params.entity.dealDamage(this.damageOnTime.illness[i].amount * this.damageOnTime.illness[i].stacks, this.damageOnTime.illness[i].damageType);
            if(params.entity.curHealth <= 0){
                params.entity.onDeath(params);
                return;
            }
            if(this.damageOnTime.illness[i].timer == 0){
                var status = this.damageOnTime.illness.splice(i, 1);
                this.alterStat(params.entity, "atSpeed", -status[0].debuffAmount, params.scene);
            }
        }
        //se maneja el dibujado de iconos de cambios de estado
        let zeroX = params.sprite.getData("underBar").x - (params.sprite.getData("underBar").width / 2);
        let zeroY = params.sprite.getData("underBar").y + (6 * params.scaleRatio);
        let conditions = [
            {value: this.isStunt(), code: 16},
            {value: this.isDisarmed(), code: 10},
            {value: this.isCrppled(), code: 13},
            {value: this.isMuted(), code: 14},
            {value: this.isSlept(), code: 12},
            {value: this.isFrozen(), code: 15},
            {value: this.isMarked(), code: 11},
            {value: this.isMorphed(), code: 17},
            {value: this.isDecimated(), code: 22},
            {value: this.isInmortal(), code: 25},
            {value: this.isHypnotized(), code: 21},
            {value: this.isFeared(), code: 19},
            {value: this.isCCInmune(), code: 28},
            {value: this.flies(), code: 3},
            {value: this.isSpellInmune(), code: 24},
            {value: this.isDamageInmune(), code: 26},
            {value: this.isBuffed(), code: 0},
            {value: this.isDebuffed(), code: 1},
            {value: this.isCauterized(), code: 2},
            {value: this.isVulnerable(), code: 23},
            {value: this.isBurnt(), code: 4},
            {value: this.isBleeding(), code: 7},
            {value: this.isPoisoned(), code: 5},
            {value: this.isCursed(), code: 6},
            {value: this.isShocked(), code: 8},
            {value: this.isParasited(), code: 20},
            {value: this.isIll(), code: 9}];
        
        for(var i = 0; i < conditions.length; i++){
            let currentIndex = this.groupFrameIndex(params.sprite.getData("status"), conditions[i].code);
            if(conditions[i].value && currentIndex == -1){
                var image = params.scene.add.image(zeroX + (params.sprite.getData("status").children.size * 6 * params.scaleRatio), zeroY, "status_icons", conditions[i].code).setScale(params.scaleRatio / 3).setDepth(1);
                params.sprite.getData("status").add(image);
            }else if(!conditions[i].value && currentIndex != -1){
                params.sprite.getData("status").remove(params.sprite.getData("status").children.entries[currentIndex], true, true);
                for(var i = currentIndex; i < params.sprite.getData("status").children.size; i++){
                    params.sprite.getData("status").children.entries[i].x -= 6 * params.scaleRatio;
                }
            }
        }

        //se ejecutan condiciones especiales de los cambios de estado
        if(this.onlyMovingForward()){
            params.entity.moveForward(params.sprite, params.scaleRatio, true);
          }

          if(this.isBanished()){
              if(!params.sprite.isTinted){
                params.sprite.setTintFill(0xd4af37);
              }
          }else{
            if(params.sprite.isTinted){
                params.sprite.clearTint();
            }
          }
          var alpha = 1;
          switch(this.getVisibility()){
            case 0:
              alpha = 0;
              break;
            case 1:
              alpha = 0.6;
              break;
            case 2:
            default:
              alpha = 1;
              break;
          }
          if(params.sprite.alpha != alpha){
            params.sprite.setAlpha(alpha);
            params.sprite.getData("status").setAlpha(alpha);
            if(params.sprite.getData("underBar") != null && params.sprite.getData("healthBar") != null && params.sprite.getData("shieldBar")){
                params.sprite.getData("underBar").setAlpha(0.2 * alpha);
                params.sprite.getData("healthBar").setAlpha(0.4 * alpha);
                params.sprite.getData("shieldBar").setAlpha(0.4 * alpha);
            }
          }
            
          //actualizar pocisiones de los iconos
          for(var i = 0; i < params.sprite.getData("status").children.size; i++){
            params.sprite.getData("status").children.entries[i].x = zeroX + (i * 6 * params.scaleRatio);
            params.sprite.getData("status").children.entries[i].y = zeroY;
          }
    }
}