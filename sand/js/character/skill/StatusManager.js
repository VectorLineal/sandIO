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
    isMarkedForDeath(){
        return this.singleEffects.markedForDeath != 0;
    }

    //queries compuestas
    mayRotate(){
        return !(this.isStunt() || this.isSlept() || this.isFeared() || this.isHypnotized());
    }

    mayMove(){
        return !(this.isSlept() || this.isStunt() || this.isCrppled() || this.isFrozen() || this.isFeared() || this.isHypnotized());
    }
    onlyMovingForward(){
        return this.isFeared() || this.isHypnotized();
    }
    mayAttack(){
        return !(this.isSlept() || this.isStunt() || this.isFrozen() || this.isFeared() || this.isHypnotized() || this.isMorphed() || this.isDisarmed());
    }
    mayUsePasives(){
        return !(this.isDecimated() || this.isFrozen());
    }
    mayCastSpells(){
        return !(this.isSlept() || this.isStunt() || this.isMuted() || this.isMorphed() || this.isFeared() || this.isHypnotized());
    }
    mayTakeDamage(type){ //tipo 0: puro, tipo 1: fisico, tipo 2: magico
        switch(type){
            case 0:
                return !this.isDamageInmune();
            case 1:
                return !this.isDamageInmune();
            case 2:
                return !(this.isDamageInmune() || this.isSpellInmune());
            default:
                return !this.isDamageInmune();
        }
    }
    mayBeDisabled(){
        return !(this.isSpellInmune() || this.isCCInmune());
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
                return entity.fortitude;
            case "speed":
                return entity.speed;
            case "crit":
                return entity.crit;
            case "maxMana":
                return entity.maxMana;
            case "manaRegen":
                return entity.manaRegen;
            case "spellPower":
                return entity.spellPower;
            case "will":
                return entity.will;
            case "concentration":
                return entity.concentration;
            case "critMultiplier": //atributos no básicos
                return entity.critMultiplier;
            case "shield":
                return entity.shield;
            case "FOV":
                return entity.fov;
            case "cauterize":
                return entity.cauterize;
        }
    }

    alterStat(entity, attribute, amount){
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
                let percentualChange = amount / entity.maxHealth;
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
                break;
            case "accuracy":
                entity.accuracy += amount;
                break;
            case "magicArmor":
                entity.magicArmor += amount;
                break;
            case "fortitude":
                entity.fortitude += amount;
                break;
            case "speed":
                entity.speed += amount;
                break;
            case "crit":
                entity.crit += amount;
                break;
            case "maxMana":
                let percentualChange = amount / entity.maxMana;
                entity.maxMana += amount;
                entity.curMana += entity.curMana * percentualChange;
                if(entity.maxMana < entity.curMana){
                    entity.curMana = entity.maxMana;
                }
                break;
            case "manaRegen":
                entity.manaRegen += amount;
                break;
            case "spellPower":
                entity.spellPower += amount;
                break;
            case "will":
                entity.will += amount;
                break;
            case "concentration":
                entity.concentration += amount;
                break;
            case "critMultiplier": //atributos no básicos
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
        }
    }

    //funciones para añadir o remover cambios de estado
    awake(){
        this.singleEffects.sleep = 0;
    }
    makeVisible(){
        this.singleEffects.invisibility = 0;
    }

    purge(entity, positive){
        if(positive){
            this.singleEffects.invisibility = 0;
            this.singleEffects.inmortality = 0;
            this.singleEffects.CCInmune = 0;
            this.singleEffects.fly = 0;
            this.singleEffects.spellInmune = 0;
            this.singleEffects.damageInmune = 0;

            for(var i = this.buffs.length; i >= 0; i--){
                if(this.buffs[i].amount >= 0 && this.buffs[i].timer > 0){
                    buff = this.buffs.splice(i, 1);
                    this.alterStat(entity, buff[0].attribute, -buff[0].amount);
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

            for(var i = this.buffs.length; i >= 0; i--){
                if(this.buffs[i].amount <= 0 && this.buffs[i].timer > 0){
                    buff = this.buffs.splice(i, 1);
                    this.alterStat(entity, buff[0].attribute, -buff[0].amount);
                }
            }

            this.damageOnTime.rawDamage = [];
            this.damageOnTime.electric = [];
            this.damageOnTime.parasite = [];

            for(var i = this.damageOnTime.burn.length - 1; i >= 0; i--){
                var status = this.damageOnTime.burn.length.splice(i, 1);
                this.alterStat(entity, "armor", -status[0].debuffAmount);
            }
            for(var i = this.damageOnTime.bleed.length - 1; i >= 0; i--){
                var status = this.damageOnTime.bleed.length.splice(i, 1);
                this.alterStat(entity, "cauterize", -status[0].debuffAmount);
            }
            for(var i = this.damageOnTime.poison.length - 1; i >= 0; i--){
                var status = this.damageOnTime.poison.length.splice(i, 1);
                this.alterStat(entity, "speed", -status[0].debuffAmount);
            }
            for(var i = this.damageOnTime.curse.length - 1; i >= 0; i--){
                var status = this.damageOnTime.curse.length.splice(i, 1);
                this.alterStat(entity, "magicArmor", -status[0].debuffAmount);
            }
            for(var i = this.damageOnTime.illness.length - 1; i >= 0; i--){
                var status = this.damageOnTime.illness.length.splice(i, 1);
                this.alterStat(entity, "atSpeed", -status[0].debuffAmount);
            }
        }
    }

    stun(amount){
        this.singleEffects.stun = Math.max(this.singleEffects.stun, amount);
    }
    disarm(amount){
        this.singleEffects.disarm = Math.max(this.singleEffects.disarm, amount);
    }
    cripple(amount){
        this.singleEffects.cripple = Math.max(this.singleEffects.cripple, amount);
    }
    mute(amount){
        this.singleEffects.mute = Math.max(this.singleEffects.mute, amount);
    }
    sleep(amount){
        this.singleEffects.sleep = Math.max(this.singleEffects.sleep, amount);
    }
    freeze(amount){
        this.singleEffects.freeze = Math.max(this.singleEffects.freeze, amount);
    }
    mark(amount){
        this.singleEffects.mark = Math.max(this.singleEffects.mark, amount);
    }
    morph(amount){
        this.singleEffects.polymorph = Math.max(this.singleEffects.polymorph, amount);
    }
    decimate(amount){
        this.singleEffects.decimate = Math.max(this.singleEffects.decimate, amount);
    }
    becomeInvisible(amount){
        this.singleEffects.invisibility = Math.max(this.singleEffects.invisibility, amount);
    }
    becomeInmortal(amount){
        this.singleEffects.inmortality = Math.max(this.singleEffects.inmortality, amount);
    }
    hypnotize(amount){
        this.singleEffects.hypnosis = Math.max(this.singleEffects.hypnosis, amount);
    }
    becomeFeared(amount){
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

    pushBuff(entity, element){ //elementos tipo {name, attribute, amount, timer, stacks, stackable, clearAtZero}
        let posibleIndex = this.getListIndex(this.buffs, element.name);
        if(posibleIndex != -1){
            if(this.buffs[posibleIndex].stackable > this.buffs[posibleIndex].stacks){
                this.buffs[posibleIndex].stacks++;
                this.alterStat(entity, element.attribute, element.amount);
            }else{
                this.buffs[posibleIndex].timer = Math.max(this.buffs[posibleIndex].timer, element.timer);
            }
        }else{
            this.buffs.push(element);
            this.alterStat(entity, element.attribute, element.amount);
        }
    }
    
    pushDamageOnTime(entity, element, type){ //elementos tipo {name, damageType, amount, debuffAmount, timer, stacks, stackable, caster} donde caster es un puntero al lanzador del hechizo
        let posibleIndex = this.getListIndex(this.damageOnTime[type], element.name);
        if(posibleIndex != -1){
            if(this.damageOnTime[type][posibleIndex].stackable > this.damageOnTime[type][posibleIndex].stacks){
                this.damageOnTime[type][posibleIndex].stacks++;
                switch(type){
                    case "burn":
                        this.alterStat(entity, "armor", element.debuffAmount);
                        this.damageOnTime[type][posibleIndex].debuffAmount += element.debuffAmount;
                        break;
                    case "bleed":
                        this.alterStat(entity, "cauterize", element.debuffAmount);
                        this.damageOnTime[type][posibleIndex].debuffAmount += element.debuffAmount;
                        break;
                    case "poison":
                        this.alterStat(entity, "speed", element.debuffAmount);
                        this.damageOnTime[type][posibleIndex].debuffAmount += element.debuffAmount;
                        break;
                    case "curse":
                        this.alterStat(entity, "magicArmor", element.debuffAmount);
                        this.damageOnTime[type][posibleIndex].debuffAmount += element.debuffAmount;
                        break;
                    case "illness":
                        this.alterStat(entity, "atSpeed", element.debuffAmount);
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
                    this.alterStat(entity, "armor", element.debuffAmount);
                    break;
                case "bleed":
                    this.alterStat(entity, "cauterize", element.debuffAmount);
                    break;
                case "poison":
                    this.alterStat(entity, "speed", element.debuffAmount);
                    break;
                case "curse":
                    this.alterStat(entity, "magicArmor", element.debuffAmount);
                    break;
                case "illness":
                    this.alterStat(entity, "atSpeed", element.debuffAmount);
                    break;
                default:
                    break;
            }
        }
    }

    //funciones sobre eventos
    onUpdate(scene, entity, sprite, scaleRatio){
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
        if(this.singleEffects.markedForDeath > 0){
            this.singleEffects.markedForDeath--;
        }

        //se actualizan contadores de buffs y debuffs
        for(var i = this.buffs.length - 1; i >= 0; i--){
            this.buffs[i].timer--;
            //se limpian los debuffs cuyo tiempo haya expirado
            if(this.buffs[i].timer == 0 || (this.buffs[i].clearAtZero && this.queryStat(entity, this.buffs[i].attribute) == 0) || this.buffs[i].amount == 0){
                buff = this.buffs.splice(i, 1);
                this.alterStat(entity, buff[0].attribute, -buff[0].amount);
            }
        }

        //se actualizan contadores de quemadura
        for(var i = this.damageOnTime.rawDamage.length - 1; i >= 0 ; i--){
            this.damageOnTime.rawDamage[i].timer --;
            entity.dealDamage(this.damageOnTime.rawDamage[i].amount * this.damageOnTime.rawDamage[i].stacks, this.damageOnTime.rawDamage[i].damageType);
            if(this.damageOnTime.rawDamage.length[i].amount == 0){
                this.damageOnTime.rawDamage.length.splice(i, 1);
            }
        }
        for(var i = this.damageOnTime.burn.length - 1; i >= 0; i--){
            this.damageOnTime.burn[i].timer --;
            entity.dealDamage(this.damageOnTime.burn[i].amount * this.damageOnTime.burn[i].stacks, this.damageOnTime.burn[i].damageType);
            if(this.damageOnTime.burn.length[i].amount == 0){
                var status = this.damageOnTime.burn.length.splice(i, 1);
                this.alterStat(entity, "armor", -status[0].debuffAmount); //para evitar inconsistencias con daños porcentuales, cada vez que se sume un stack, la cantidad e debuff se suma en dicha variable.
            }
        }
        for(var i = this.damageOnTime.bleed.length - 1; i >= 0; i--){
            this.damageOnTime.bleed[i].timer --;
            entity.dealDamage(this.damageOnTime.bleed[i].amount * this.damageOnTime.bleed[i].stacks, this.damageOnTime.bleed[i].damageType);
            if(this.damageOnTime.bleed.length[i].amount == 0){
                var status = this.damageOnTime.bleed.length.splice(i, 1);
                this.alterStat(entity, "cauterize", -status[0].debuffAmount); 
            }
        }
        for(var i = this.damageOnTime.poison.length - 1; i >= 0; i--){
            this.damageOnTime.poison[i].timer --;
            entity.dealDamage(this.damageOnTime.poison[i].amount * this.damageOnTime.poison[i].stacks, this.damageOnTime.poison[i].damageType);
            if(this.damageOnTime.poison.length[i].amount == 0){
                var status = this.damageOnTime.poison.length.splice(i, 1);
                this.alterStat(entity, "speed", -status[0].debuffAmount);
            }
        }
        for(var i = this.damageOnTime.curse.length - 1; i >= 0; i--){
            this.damageOnTime.curse[i].timer --;
            entity.dealDamage(this.damageOnTime.curse[i].amount * this.damageOnTime.curse[i].stacks, this.damageOnTime.curse[i].damageType);
            if(this.damageOnTime.curse.length[i].amount == 0){
                var status = this.damageOnTime.curse.length.splice(i, 1);
                this.alterStat(entity, "magicArmor", -status[0].debuffAmount); 
            }
        }
        for(var i = this.damageOnTime.electric.length - 1; i >= 0; i--){
            this.damageOnTime.electric[i].timer --;
            entity.spendMana({scene: scene, amount: 0.25 * entity.dealDamage(this.damageOnTime.electric[i].amount * this.damageOnTime.electric[i].stacks, this.damageOnTime.electric[i].damageType)});
            if(this.damageOnTime.electric.length[i].amount == 0){
                this.damageOnTime.electric.length.splice(i, 1);
            }
        }
        for(var i = this.damageOnTime.parasite.length - 1; i >= 0; i--){
            this.damageOnTime.parasite[i].timer --;
            this.damageOnTime.parasite[i].caster.heal(entity.dealDamage(this.damageOnTime.parasite[i].amount * this.damageOnTime.parasite[i].stacks, this.damageOnTime.parasite[i].damageType));
            if(this.damageOnTime.parasite.length[i].amount == 0){
                this.damageOnTime.parasite.length.splice(i, 1);
            }
        }
        for(var i = this.damageOnTime.illness.length - 1; i >= 0; i--){
            this.damageOnTime.illness[i].timer --;
            entity.dealDamage(this.damageOnTime.illness[i].amount * this.damageOnTime.illness[i].stacks, this.damageOnTime.illness[i].damageType);
            if(this.damageOnTime.illness.length[i].amount == 0){
                var status = this.damageOnTime.illness.length.splice(i, 1);
                this.alterStat(entity, "atSpeed", -status[0].debuffAmount);
            }
        }

        //se ejecutan condiciones especiales de los cambios de estado
        if(this.onlyMovingForward()){
            entity.moveForward(sprite, scaleRatio, true);
          }

          switch(this.getVisibility()){
            case 0:
              /*if(entity instanceof Playable){
                if(sprite.alpha != 0.6){
                  sprite.setAlpha(0.6);
                }
              }else{*/
                if(sprite.alpha != 0){
                  sprite.setAlpha(0);
                }
              //}
              break;
            case 1:
              if(sprite.alpha != 0.6){
                sprite.setAlpha(0.6);
              }
              break;
            case 2:
              if(sprite.alpha != 1){
                sprite.setAlpha(1);
              }
              break;
            default:
              sprite.setAlpha(1);
              break;
          }
    }
}