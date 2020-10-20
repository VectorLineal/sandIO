export default class StatusManager{
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

    //funciones no gráficas
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
            case "armor":
                entity.armor += amount;
            case  "evasion":
                entity.evasion += amount;
            case "health":
                entity.maxHealth += amount;
            case "healthRegen":
                entity.healthRegen += amount;
            case "atSpeed":
                entity.atSpeed += amount;
            case "accuracy":
                entity.accuracy += amount;
            case "magicArmor":
                entity.magicArmor += amount;
            case "fortitude":
                entity.fortitude += amount;
            case "speed":
                entity.speed += amount;
            case "crit":
                entity.crit += amount;
            case "maxMana":
                entity.maxMana += amount;
            case "manaRegen":
                entity.manaRegen += amount;
            case "spellPower":
                entity.spellPower += amount;
            case "will":
                entity.will += amount;
            case "concentration":
                entity.concentration += amount;
            case "critMultiplier": //atributos no básicos
                entity.critMultiplier += amount;
            case "shield":
                entity.shield += amount;
            case "FOV":
                entity.fov += amount;
            case "cauterize":
                entity.cauterize += amount;
        }
    }

    purge(positive){
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

    //funciones sobre eventos
    onUpdate(scene, entity){
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
            if(this.buffs[i].timer == 0 || (this.buffs[i].clearAtZero && this.queryStat(entity, this.buffs[i].attribute) == 0)){
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
    }
}