import "./phaser.js";
import {fitNumber, clockFormat, transformArmorToPercentage, generateSet} from "./MathUtils.js";

export default class HUDGame extends Phaser.Scene {

    constructor () {
        super({key: 'HUDScene', active: false});
        //variables que guardan datos de HUD
        this.userData;
        this.clock = 0;
        this.respawnTime = 0;
        this.percentual = false;
        this.displayData = false;

        //elementos gráficos estáticos
        this.punctuationTable;
        this.dataTable;

        //elementos gráficos dinámicos
        this.namesTable;
        this.heroesTable;
        this.killsTable;
        this.deathsTable;
        this.assistsTable;
        this.damageTable;
        this.damageTakenTable;
        this.healingTable;
        this.GPMTable;
        this.XPMTable;
        this.lstHitsTable;
        this.userStats;

        //elementos auxiliares
        this.spellCodes = [];
    }

    preload() {
        let game = this.scene.get('GameScene');
        let name = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').name;
        this.load.spritesheet('skill', 'assets/' + name + '_spells.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('hud', 'assets/HUDicons.png', {frameWidth: 16, frameHeight: 16});
    
    }
    
    create() {
        let { width, height } = this.sys.game.canvas;
        let scaleRatio = (1.5 * width) / height;
        let game = this.scene.get('GameScene');
        
        //elementos dinámincos
        this.userData = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').getUserData();
        this.clock = game.clock;
        
        //elementos gráficos estáticos
        this.punctuationTable = this.add.rectangle(width / 2, height / 2, 3 * width / 4, height / 2, 0x28195c).setAlpha(0.4).setVisible(false);
        this.dataTable = this.add.rectangle(width / 7, 5 * height / 12, width / 4, 5 * height / 6, 0x28348d).setAlpha(0.4).setVisible(false);
        var UnderBar = this.add.rectangle(width / 2, (height - (height / 12)), width, height / 6, 0x090909);
        let levelFrame = this.add.rectangle(5 * width / 28, (height - (height / 7)), width / 14, height / 30, 0xefb810);
        var hudIcons = this.add.group();

        hudIcons.createMultiple({
            key: 'hud',
            frame:[0, 1, 2, 3, 4, 5],
            setXY: {
                x: width / 10.5,
                y: (height - (height / 6.9)),
                stepY: (height / 39)
            },
            setScale: { 
                x: 3.28 / scaleRatio,
                y: 3.28 / scaleRatio
            }
        });

        hudIcons.createMultiple({
            key: 'hud',
            frame:[6, 7],
            setXY: {
                x: width / 6.8,
                y: (height - (height / 8.6)),
                stepY: (height / 39)
                },
            setScale: { 
                x: 3.28 / scaleRatio,
                y: 3.28 / scaleRatio
            }
        });

        //HUD sobre hechizos
        var skillsIcons = this.add.group();
        let frames = generateSet(game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').getSkillsAmount());
        for(var i = 0; i < frames.length; i++){
            let underSquare = this.add.rectangle((2 * width / 3) + (305 * (i + 1) / scaleRatio), height - (height / 20), 305 / scaleRatio, 305 / scaleRatio, 0x298d4a);
            skillsIcons.add(underSquare);
        }
        skillsIcons.createMultiple({
            key: 'skill',
            frame: frames,
            setXY: {
                x: (2 * width / 3) + (305 / scaleRatio),
                y: height - (height / 20),
                stepX: 305 / scaleRatio
            },
            setScale: { 
                x: 6.56 / scaleRatio,
                y: 6.56 / scaleRatio
            }
        });
        for(var i = 0; i < frames.length; i++){
            let underSquare = this.add.rectangle((2 * width / 3) + (305 * (i + 1) / scaleRatio), height - (height / 20), 210 / scaleRatio, 210 / scaleRatio, 0x222222).setAlpha(0.4);
            if(i != 3)
                underSquare.height = 0;
            skillsIcons.add(underSquare);
        }
        for(var i = 0; i < frames.length; i++){
            var key = 'pasive';
            var message = '';
            var color = '#0000ee';
            switch(i){
                case 0:
                    key = 'q';
                    break;
                case 1:
                    key = 'e';
                    break;
                case 2:
                    if(frames.length == 5 || this.userData.skills.f != null)
                        key = 'f';
                    else if(this.userData.skills.r != null)
                        key = 'r';
                    break;
                case 3:
                    if(frames.length == 5 || this.userData.skills.r != null)
                        key = 'r';
                    break;
            }
            if( key == 'pasive'){
                message = key;
            }
            else{
                this.spellCodes.push(key);
                message = key + ": " + fitNumber(this.userData.skills[key].mana, 0);
                if(this.userData.skills[key].mana > this.userData.mana)
                    color = '#ee0000';
            }
            let spellText = this.add.text((2 * width / 3) + ((190 + (305 * i)) / scaleRatio), height - (height / 20) - (165 / scaleRatio), message, { font: '48px Arial', fill: color }).setScale(1.35 / scaleRatio);
            skillsIcons.add(spellText);
        }

        //elementos gráficos dinámicos
        var healthBar = this.add.rectangle(width / 2, (height - (3 * height / 28)), (this.userData.health / (this.userData.maxHealth + this.userData.shield)) * (width / 3), height / 20, 0xff0000);
        var shieldBar = this.add.rectangle((width / 2) + healthBar.width, (height - (3 * height / 28)), (this.userData.shield / (this.userData.maxHealth + this.userData.shield)) * (width / 3), height / 20, 0xaaaaaa);
        var manaBar = this.add.rectangle(width / 2, (height - (height / 28)), (this.userData.health / this.userData.maxHealth) * (width / 3), height / 20, 0x0000ff);
        var xpBar = this.add.rectangle(3 * width / 14, (height - (height / 7)), (this.userData.xp / this.userData.xpNext) * (width / 12), height / 60, 0xdddddd);
        
        //elementos de texto dinámicos
        this.namesTable = this.add.text(width / 8, (height / 3), 'player\n\n', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.35 / scaleRatio).setScrollFactor(1).setVisible(false).setAlpha(0.4);
        this.heroesTable = this.add.text(27 * width / 88, (height / 3), 'hero\n\n', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.35 / scaleRatio).setScrollFactor(1).setVisible(false).setAlpha(0.4);
        this.killsTable = this.add.text(39 * width / 88, (height / 3), 'kills\n\n', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.35 / scaleRatio).setScrollFactor(1).setVisible(false).setAlpha(0.4);
        this.deathsTable = this.add.text(43 * width / 88, (height / 3), 'deaths\n\n', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.35 / scaleRatio).setScrollFactor(1).setVisible(false).setAlpha(0.4);
        this.assistsTable = this.add.text(47 * width / 88, (height / 3), 'assist\n\n', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.35 / scaleRatio).setScrollFactor(1).setVisible(false).setAlpha(0.4);
        this.damageTable = this.add.text(51 * width / 88, (height / 3), 'damage\n\n', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.35 / scaleRatio).setScrollFactor(1).setVisible(false).setAlpha(0.4);
        this.damageTakenTable = this.add.text(55 * width / 88, (height / 3), 'taken\n\n', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.35 / scaleRatio).setScrollFactor(1).setVisible(false).setAlpha(0.4);
        this.healingTable = this.add.text(59 * width / 88, (height / 3), 'healed\n\n', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.35 / scaleRatio).setScrollFactor(1).setVisible(false).setAlpha(0.4);
        this.GPMTable = this.add.text(63 * width / 88, (height / 3), 'GPM\n\n', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.35 / scaleRatio).setScrollFactor(1).setVisible(false).setAlpha(0.4);
        this.XPMTable = this.add.text(67 * width / 88, (height / 3), 'XPM\n\n', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.35 / scaleRatio).setScrollFactor(1).setVisible(false).setAlpha(0.4);
        this.lstHitsTable= this.add.text(71 * width / 88, (height / 3), 'LH\n\n', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.35 / scaleRatio).setScrollFactor(1).setVisible(false).setAlpha(0.4);

        var healthText = this.add.text(width / 3, (height - (67 * height / 560)), '0/0 + 0', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.8 / scaleRatio).setScrollFactor(1);
        var manaText = this.add.text(width / 3, (height - (27 * height / 560)), '0/0 + 0', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.8 / scaleRatio).setScrollFactor(1);
        var statsText = this.add.text(width / 10, (height - (height / 6.3)), '0', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.35 / scaleRatio).setScrollFactor(1);
        var levelText = this.add.text(width / 7, (height - (67 * height / 420)), 'level: 1', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.8 / scaleRatio).setScrollFactor(1);
        var envinromentText = this.add.text(width / 6.5, (height - (height / 7.8)), '0\n00:00', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.35 / scaleRatio).setScrollFactor(1);
        var respawnText = this.add.text(width / 2, height / 8, 'respawning in... 0 seconds', { font: '48px Arial', fill: '#eeeeee' }).setScale(2.4 / scaleRatio).setScrollFactor(1).setVisible(false);
        var userDataText = this.add.text(width / 20, height / 16, 'Level: 1\n\nOFENSIVE\n\tDamage: 36\n\tAttack Speed: 100, Time per Attack: 2s\n\tAccuracy: 100%\n\tCritical Chance: 0%\n\tCritical Multiplier: 0%\nMAGICAL\n\tSpell Power: 0%\n\tConcentration: 0%\nDEFENSIVE\n\tMagic Armor: 0%\n\tArmor: 0%\n\tSpeed: 28\n\tevasion: 0%\n\tFortitude 0%\n\tWill: 0%', { font: '48px Arial', fill: '#eeeeee' }).setScale(1.35 / scaleRatio).setScrollFactor(1).setVisible(false).setAlpha(0.75);

        healthText.setText(fitNumber(this.userData.health, 2) + '/' + fitNumber(this.userData.maxHealth, 2) + ' + ' + fitNumber(this.userData.regenH, 2));
        manaText.setText(fitNumber(this.userData.mana, 2) + '/' + fitNumber(this.userData.maxMana, 2) + ' + ' + fitNumber(this.userData.regenM, 2));
        statsText.setText(fitNumber(this.userData.damage, 2) + '\n' + fitNumber(this.userData.spellPower / 100, 2) + '%\n' + fitNumber(this.userData.arm, 0) + '\n' + fitNumber(this.userData.magicArm, 0) + '\n' + fitNumber(this.userData.vel, 0) + '\n' + fitNumber(this.userData.atS, 0));
        envinromentText.setText(fitNumber(this.userData.gold, 0) + '\n' + clockFormat(this.clock));
        respawnText.setText('respawning in... ' + fitNumber(this.respawnTime / 60, 0) + ' seconds');

        //eventos de modificación de valores HUD
        game.events.on('updateRespawn', function () {
            this.respawnTime = game.teamAHeroManager.getPlayerTimer();
            respawnText.setText('respawning in... ' + fitNumber(this.respawnTime / 60, 0) + ' seconds');
            if(!respawnText.visible && this.respawnTime > 0){
                respawnText.setVisible(true);
            }else if(respawnText.visible && this.respawnTime <= 0){
                respawnText.setVisible(false);
            }
        }, this);

        game.events.on('updateLevel', function () {
            this.userData = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').getUserData();
            userDataText.setText(this.totalStatsFormatedText());
            levelText.setText('level: ' + fitNumber(this.userData.level, 0));
            //update mana costs in spells and descriptions
            var counter = 0;
            for(var i = 3 * Math.floor(skillsIcons.children.entries.length / 4); i < skillsIcons.children.entries.length; i++){
                var key = 'pasive';
                var message = '';
                var color = '#0000ee';
                if(counter < this.spellCodes.length){
                    key = this.spellCodes[counter];
                }

                if( key == 'pasive'){
                    message = key;
                }
                else{
                    message = key + ": " + fitNumber(this.userData.skills[key].mana, 0);
                    if(this.userData.skills[key].mana > this.userData.mana)
                        color = '#ee0000';
                }
                skillsIcons.children.entries[i].setText(message);
                skillsIcons.children.entries[i].setColor(color);
                counter++;
            }
            if(this.userData.level == 10){
                skillsIcons.children.entries[Math.floor(skillsIcons.children.entries.length / 2) + 3].height = 0;
            }
        }, this);

        game.events.on('updateXP', function () {
            this.userData = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').getUserData();
            xpBar.width = (this.userData.xp / this.userData.xpNext) * (width / 12);
        }, this);

        game.events.on('updateCooldowns', function () {
            this.userData = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').getUserData();
            var counter = 0;
            for(var i = Math.floor(skillsIcons.children.entries.length / 2); i < Math.floor(3 * skillsIcons.children.entries.length / 4); i++){
                var key = 'pasive';
                if(counter < this.spellCodes.length)
                    key = this.spellCodes[counter];

                if(key != 'pasive')
                    skillsIcons.children.entries[i].height = (210 * this.userData.skills[key].curCooldown) / (scaleRatio * this.userData.skills[key].cooldown);
                
                counter++;
            }
            counter = 0;
            for(var i = 0; i < Math.floor(skillsIcons.children.entries.length / 4); i++){
                var key = 'pasive';
                if(counter < this.spellCodes.length)
                    key = this.spellCodes[counter];
                if(key == this.userData.key){
                    //if(skillsIcons.children.entries[i].fillColor == 0x298d4a)
                        skillsIcons.children.entries[i].setFillStyle(0xad8d10);
                }else{
                    //if(skillsIcons.children.entries[i].fillColor == 0xad8d10)
                        skillsIcons.children.entries[i].setFillStyle(0x298d4a);
                }
                counter++;
            }
        }, this);

        game.events.on('updateStats', function () {
            this.userData = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').getUserData();
            userDataText.setText(this.totalStatsFormatedText());
            statsText.setText(this.statsFormatedText());
        }, this);

        game.events.on('updateHealth', function () {
            this.userData = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').getUserData();
            healthText.setText(this.healthFormatedText());
            healthBar.width = (this.userData.health / (this.userData.maxHealth + this.userData.shield)) * (width / 3);
            shieldBar.x = (2 * healthBar.width) + (((this.userData.shield / (this.userData.maxHealth + this.userData.shield)) * (width / 3)));
            shieldBar.width = (this.userData.shield / (this.userData.maxHealth + this.userData.shield)) * (width / 3);
        }, this);

        game.events.on('updateMaxHealth', function () {
            this.userData = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').getUserData();
            healthText.setText(this.healthFormatedText());
            healthBar.width = (this.userData.health / (this.userData.maxHealth + this.userData.shield)) * (width / 3);
            shieldBar.x = (2 * healthBar.width) + (((this.userData.shield / (this.userData.maxHealth + this.userData.shield)) * (width / 3)));
            shieldBar.width = (this.userData.shield / (this.userData.maxHealth + this.userData.shield)) * (width / 3);
        }, this);

        game.events.on('updateHealthRegen', function () {
            this.userData = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').getUserData();
            healthText.setText(this.healthFormatedText());
        }, this);

        game.events.on('updateMana', function () {
            this.userData = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').getUserData();
            manaText.setText(this.manaFormatedText());
            manaBar.width = (this.userData.mana / this.userData.maxMana) * (width / 3);
            //actualizar colores en costos de hechizos indicando si hay suficiente mana
            var counter = 0;
            for(var i = 3 * Math.floor(skillsIcons.children.entries.length / 4); i < skillsIcons.children.entries.length; i++){
                var key = 'pasive';
                var color = '#0000ee';
                if(counter < this.spellCodes.length)
                    key = this.spellCodes[counter];
                else
                    break;
                if(key != "pasive")
                    if(this.userData.skills[key].mana > this.userData.mana)
                        color = '#ee0000';

                skillsIcons.children.entries[i].setColor(color);
                counter++;
            }
        }, this);

        game.events.on('updateMaxMana', function () {
            this.userData = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').getUserData();
            manaText.setText(this.manaFormatedText());
            manaBar.width = (this.userData.mana / this.userData.maxMana) * (width / 3);
        }, this);

        game.events.on('updateManaRegen', function () {
            this.userData = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').getUserData();
            manaText.setText(this.manaFormatedText());
        }, this);

        game.events.on('updateGold', function () {
            this.userData = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').getUserData();
            envinromentText.setText(this.clockText());
        }, this);

        game.events.on('updateClock', function () {
            this.clock = game.clock;
            envinromentText.setText(this.clockText());
            this.updatePuntuations();
        }, this);

        game.events.on('updateScore', this.updatePuntuations, this);

        this.scene.bringToTop('HUDScene');

        //our controls
        this.input.keyboard.on('keydown-SPACE', function(event){
            this.percentual = !this.percentual;
            statsText.setText(this.statsFormatedText());
        }, this);
        this.input.keyboard.on('keydown-I', function(event){
            this.dataTable.setVisible(!this.dataTable.visible);
            userDataText.setVisible(!userDataText.visible);
            userDataText.setText(this.totalStatsFormatedText());
            statsText.setText(this.statsFormatedText());
        }, this);
        this.input.keyboard.on('keydown-P', function(event){
            this.setTableVisible(true);
        }, this);
        this.input.keyboard.on('keyup-P', function(event){
            this.setTableVisible(false);
        }, this);
        this.input.keyboard.addCapture('SPACE');
        this.input.keyboard.addCapture('TAB');
    }
    
    update() {
    }
    
    //funciones no heredadas de escena
    updatePuntuations(){
        let punctuations = this.scene.get('GameScene').punctuations;
        this.namesTable.setText('player\n\nteam A\n' + this.getPunctuationParam(punctuations, "name", 0) + "\nteam B\n" + this.getPunctuationParam(punctuations, "name", 1));
        this.heroesTable.setText('hero\n\n\n' + this.getPunctuationParam(punctuations, "hero", 0) + "\n\n" + this.getPunctuationParam(punctuations, "hero", 1));
        this.killsTable.setText('kills\n\n\n'+ this.getPunctuationParam(punctuations, "kills", 0) + "\n\n" + this.getPunctuationParam(punctuations, "kills", 1));
        this.deathsTable.setText('deaths\n\n\n'+ this.getPunctuationParam(punctuations, "deaths", 0) + "\n\n" + this.getPunctuationParam(punctuations, "deaths", 1));
        this.assistsTable.setText('assists\n\n\n'+ this.getPunctuationParam(punctuations, "assists", 0) + "\n\n" + this.getPunctuationParam(punctuations, "assists", 1));
        this.damageTable.setText('damage\n\n\n'+ this.getPunctuationParam(punctuations, "damage", 0) + "\n\n" + this.getPunctuationParam(punctuations, "damage", 1));
        this.damageTakenTable.setText('taken\n\n\n'+ this.getPunctuationParam(punctuations, "damageTaken", 0) + "\n\n" + this.getPunctuationParam(punctuations, "damageTaken", 1));
        this.healingTable.setText('healing\n\n\n'+ this.getPunctuationParam(punctuations, "healing", 0) + "\n\n" + this.getPunctuationParam(punctuations, "healing", 1));
        this.GPMTable.setText('GPM\n\n\n'+ this.getPunctuationParam(punctuations, "GPM", 0) + "\n\n" + this.getPunctuationParam(punctuations, "GPM", 1));
        this.XPMTable.setText('XPM\n\n\n'+ this.getPunctuationParam(punctuations, "XPM", 0) + "\n\n" + this.getPunctuationParam(punctuations, "XPM", 1));
        this.lstHitsTable.setText('LH\n\n\n'+ this.getPunctuationParam(punctuations, "lastHits", 0) + "\n\n" + this.getPunctuationParam(punctuations, "lastHits", 1));
    }

    setTableVisible(visible){
        this.punctuationTable.setVisible(visible);
        this.namesTable.setVisible(visible);
        this.heroesTable.setVisible(visible);
        this.killsTable.setVisible(visible);
        this.deathsTable.setVisible(visible);
        this.assistsTable.setVisible(visible);
        this.damageTable.setVisible(visible);
        this.damageTakenTable.setVisible(visible);
        this.healingTable.setVisible(visible);
        this.GPMTable.setVisible(visible);
        this.XPMTable.setVisible(visible);
        this.lstHitsTable.setVisible(visible);
    }

    getPunctuationParam(punctuations, param, team){
        var message = "";
        if(team == 0){
            for(var i = 0; i < punctuations.teamA.length; i++){
                if(param == "XPM" || param == "GPM"){
                    message += fitNumber(punctuations.teamA[i][param] * 3600 / this.clock, 0) + "\n";
                }else if(param == "name" || param == "hero"){
                    message += punctuations.teamA[i][param] + "\n";
                }else{
                    message += fitNumber(punctuations.teamA[i][param], 0) + "\n";
                }
                
            }
        }else{
            for(var i = 0; i < punctuations.teamB.length; i++){
                if(param == "XPM" || param == "GPM"){
                    message += fitNumber(punctuations.teamB[i][param] * 3600 / this.clock, 0) + "\n";
                }else if(param == "name" || param == "hero"){
                    message += punctuations.teamB[i][param] + "\n";
                }else{
                    message += fitNumber(punctuations.teamB[i][param], 0) + "\n";
                }
                
            }
        }

        return message;
    }

    totalStatsFormatedText(){
        return 'Level: ' + this.userData.level + '\n\n\nOFENSIVE\n\tDamage: ' + fitNumber(this.userData.damage, 2) + '\n\tAttack Speed: ' + fitNumber(this.userData.atS, 0) + ', Time per Attack: ' + fitNumber(this.userData.atRate, 4) + 's\n\tAccuracy: ' + fitNumber(this.userData.acc, 1) + '%\n\tCritical Chance: ' + fitNumber(this.userData.crit, 2) + '%\n\tCritical Multiplier: ' + fitNumber(this.userData.critMultiplier, 2) + '\n\nMAGICAL\n\tSpell Power: ' + fitNumber(this.userData.spellPower, 2) + '%\n\tConcentration: ' + fitNumber(this.userData.concentration, 2) + '%\n\nDEFENSIVE\n\tMagic Armor: ' + fitNumber(transformArmorToPercentage(this.userData.magicArm) * 100, 2) + '%\n\tArmor: ' + fitNumber(transformArmorToPercentage(this.userData.arm) * 100, 2) + '%\n\tSpeed: ' + fitNumber(this.userData.vel, 0) + '\n\tevasion: ' + fitNumber(this.userData.evasion, 1) + '%\n\tFortitude ' + fitNumber(this.userData.fortitude, 2) + '%\n\tWill: ' + fitNumber(this.userData.will, 2) + '%';
    }

    statsFormatedText(){
        if(!this.percentual){
            return fitNumber(this.userData.damage, 2) + '\n' + fitNumber(this.userData.spellPower, 2) + '%\n' + fitNumber(this.userData.arm, 0) + '\n' + fitNumber(this.userData.magicArm, 0) + '\n' + fitNumber(this.userData.vel, 0) + '\n' + fitNumber(this.userData.atS, 0);
        }else{
            return fitNumber(this.userData.damage, 2) + '\n' + fitNumber(this.userData.spellPower, 2) + '%\n' + fitNumber(transformArmorToPercentage(this.userData.arm) * 100, 2) + '%\n' + fitNumber(transformArmorToPercentage(this.userData.magicArm) * 100, 2) + '%\n' + fitNumber(this.userData.vel, 0) + '\n' + fitNumber(this.userData.atS, 0);
        }
    }

    healthFormatedText(){
        var shield = ""
        if(this.userData.shield > 0){
            shield = "+" + fitNumber(this.userData.shield, 0);
        }
        return fitNumber(this.userData.health, 0) + shield + '/' + fitNumber(this.userData.maxHealth + this.userData.shield, 0) + ' + ' + fitNumber(this.userData.regenH, 2)
    }

    manaFormatedText(){
        return fitNumber(this.userData.mana, 0) + '/' + fitNumber(this.userData.maxMana, 0) + ' + ' + fitNumber(this.userData.regenM, 2)
    }

    clockText(){
        return fitNumber(this.userData.gold, 0) + '\n' + clockFormat(this.clock);
    }
}