import "./phaser.js";
import {fitNumber, clockFormat, transformArmorToPercentage} from "./MathUtils.js";

export default class HUDGame extends Phaser.Scene {

    constructor () {
        super({key: 'HUDScene', active: true});
        //variables que guardan datos de HUD
        this.health = 0;
        this.maxHealth = 0;
        this.regenH = 0;
        this.shield = 0;
        this.mana = 0;
        this.maxMana = 0;
        this.regenM = 0;
        this.damage = 0;
        this.spellPower = 0;
        this.magicArm = 0;
        this.arm = 0;
        this.vel = 0;
        this.atS = 0;
        this.level = 1;
        this.xp = 0;
        this.xpNext = 0;
        this.clock = 0;
        this.gold = 0;
        this.respawnTime = 0;
        this.percentual = false;

        //elementos gráficos
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
    }

    preload() {
        this.load.spritesheet('hud', 'assets/HUDicons.png', {frameWidth: 16, frameHeight: 16});
    
    }
    
    create() {
        let { width, height } = this.sys.game.canvas;
        let scaleRatio = (1.5 * width) / height;
        let game = this.scene.get('GameScene');
        
        //elementos dinámincos
        this.health = game.initialData().curHealth;
        this.maxHealth = game.initialData().maxHealth;
        this.regenH = game.initialData().healthRegen;
        this.mana = game.initialData().curMana;
        this.maxMana = game.initialData().maxMana;
        this.regenM = game.initialData().manaRegen;
        this.damage = game.initialData().damage;
        this.spellPower = game.initialData().spellPower;
        this.magicArm = game.initialData().magicArmor;
        this.arm = game.initialData().armor;
        this.vel = game.initialData().speed;
        this.atS = game.initialData().atSpeed;
        this.level = game.initialData().level;
        this.xp = game.initialData().xp;
        this.xpNext = game.initialData().xpNext;
        this.clock = game.clock;
        this.gold = game.initialData().gold;
        
        //elementos gráficos estáticos
        this.punctuationTable = this.add.rectangle(width / 2, height / 2, 3 * width / 4, height / 2, 0x28195c).setAlpha(0.4).setVisible(false);
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

        //elementos gráficos dinámicos
        var healthBar = this.add.rectangle(width / 2, (height - (3 * height / 28)), (this.health / (this.maxHealth + this.shield)) * (width / 3), height / 20, 0xff0000);
        var shieldBar = this.add.rectangle((width / 2) + healthBar.width, (height - (3 * height / 28)), (this.shield / (this.maxHealth + this.shield)) * (width / 3), height / 20, 0xaaaaaa);
        var manaBar = this.add.rectangle(width / 2, (height - (height / 28)), (this.health / this.maxHealth) * (width / 3), height / 20, 0x0000ff);
        var xpBar = this.add.rectangle(3 * width / 14, (height - (height / 7)), (this.xp / this.xpNext) * (width / 12), height / 60, 0xdddddd);
        
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

        var healthText = this.add.text(width / 3, (height - (67 * height / 560)), '0/0 + 0', { font: '48px Arial', fill: '#eeeeee' });
        var manaText = this.add.text(width / 3, (height - (27 * height / 560)), '0/0 + 0', { font: '48px Arial', fill: '#eeeeee' });
        var statsText = this.add.text(width / 10, (height - (height / 6.3)), '0', { font: '48px Arial', fill: '#eeeeee' });
        var levelText = this.add.text(width / 7, (height - (67 * height / 420)), 'level: 1', { font: '48px Arial', fill: '#eeeeee' });
        var envinromentText = this.add.text(width / 6.5, (height - (height / 7.8)), '0\n00:00', { font: '48px Arial', fill: '#eeeeee' });
        var respawnText = this.add.text(width / 2, height / 8, 'respawning in... 0 seconds', { font: '48px Arial', fill: '#eeeeee' });

        healthText.setText(fitNumber(this.health, 2) + '/' + fitNumber(this.maxHealth, 2) + ' + ' + fitNumber(this.regenH, 2));
        manaText.setText(fitNumber(this.mana, 2) + '/' + fitNumber(this.maxMana, 2) + ' + ' + fitNumber(this.regenM, 2));
        statsText.setText(fitNumber(this.damage, 2) + '\n' + fitNumber(this.spellPower / 100, 2) + '%\n' + fitNumber(this.arm, 0) + '\n' + fitNumber(this.magicArm, 0) + '\n' + fitNumber(this.vel, 0) + '\n' + fitNumber(this.atS, 0));
        envinromentText.setText(fitNumber(this.gold, 0) + '\n' + clockFormat(this.clock));
        respawnText.setText('respawning in... ' + fitNumber(this.respawnTime / 60, 0) + ' seconds');
        
        healthText.setScale(1.8 / scaleRatio);
        manaText.setScale(1.8 / scaleRatio);
        statsText.setScale(1.35 / scaleRatio);
        levelText.setScale(1.8 / scaleRatio);
        envinromentText.setScale(1.35 / scaleRatio);
        respawnText.setScale(2.4 / scaleRatio);

        healthText.setScrollFactor(1);
        statsText.setScrollFactor(1);
        levelText.setScrollFactor(1);
        envinromentText.setScrollFactor(1);
        respawnText.setScrollFactor(1);

        respawnText.setVisible(false);

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
            this.level = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').level;
            levelText.setText('level: ' + fitNumber(this.level, 0));
        }, this);

        game.events.on('updateXP', function () {
            this.xp = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').xp;
            this.xpNext = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').calculateNextLevelXp();
            xpBar.width = (this.xp / this.xpNext) * (width / 12);
        }, this);

        game.events.on('updateStats', function () {
            this.damage = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').damage;
            this.spellPower = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').spellPower;
            this.magicArm = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').magicArmor;
            this.arm = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').armor;
            this.vel = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').speed;
            this.atS = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').atSpeed;
            statsText.setText(this.statsFormatedText());
        }, this);

        game.events.on('updateHealth', function () {
            this.health = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').curHealth;
            this.shield = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').shield;
            healthText.setText(this.healthFormatedText());
            healthBar.width = (this.health / (this.maxHealth + this.shield)) * (width / 3);
            shieldBar.x = (2 * healthBar.width) + (((this.shield / (this.maxHealth + this.shield)) * (width / 3)));
            shieldBar.width = (this.shield / (this.maxHealth + this.shield)) * (width / 3);
        }, this);

        game.events.on('updateMaxHealth', function () {
            this.maxHealth = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').maxHealth;
            this.shield = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').shield;
            healthText.setText(this.healthFormatedText());
            healthBar.width = (this.health / (this.maxHealth + this.shield)) * (width / 3);
            shieldBar.x = (2 * healthBar.width) + (((this.shield / (this.maxHealth + this.shield)) * (width / 3)));
            shieldBar.width = (this.shield / (this.maxHealth + this.shield)) * (width / 3)
        }, this);

        game.events.on('updateHealthRegen', function () {
            this.regenH = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').healthRegen;
            this.shield = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').shield;
            healthText.setText(this.healthFormatedText());
        }, this);

        game.events.on('updateMana', function () {
            this.mana = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').curMana;
            manaText.setText(this.manaFormatedText());
            manaBar.width = (this.mana/this.maxMana) * (width / 3);
        }, this);

        game.events.on('updateMaxMana', function () {
            this.maxMana = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').maxMana;
            manaText.setText(this.manaFormatedText());
            manaBar.width = (this.mana/this.maxMana) * (width / 3);
        }, this);

        game.events.on('updateManaRegen', function () {
            this.regenM = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').manaRegen;
            manaText.setText(this.manaFormatedText());
        }, this);

        game.events.on('updateGold', function () {
            this.gold = game.teamAHeroManager.getPlayer(game.teamASprites).getData('backend').gold;
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

    statsFormatedText(){
        if(!this.percentual){
            return fitNumber(this.damage, 2) + '\n' + fitNumber(this.spellPower, 2) + '%\n' + fitNumber(this.arm, 0) + '\n' + fitNumber(this.magicArm, 0) + '\n' + fitNumber(this.vel, 0) + '\n' + fitNumber(this.atS, 0);
        }else{
            return fitNumber(this.damage, 2) + '\n' + fitNumber(this.spellPower, 2) + '%\n' + fitNumber(transformArmorToPercentage(this.arm) * 100, 2) + '%\n' + fitNumber(transformArmorToPercentage(this.magicArm) * 100, 2) + '%\n' + fitNumber(this.vel, 0) + '\n' + fitNumber(this.atS, 0);
        }
    }

    healthFormatedText(){
        var shield = ""
        if(this.shield > 0){
            shield = "+" + fitNumber(this.shield, 0);
        }
        return fitNumber(this.health, 0) + shield + '/' + fitNumber(this.maxHealth + this.shield, 0) + ' + ' + fitNumber(this.regenH, 2)
    }

    manaFormatedText(){
        return fitNumber(this.mana, 0) + '/' + fitNumber(this.maxMana, 0) + ' + ' + fitNumber(this.regenM, 2)
    }

    clockText(){
        return fitNumber(this.gold, 0) + '\n' + clockFormat(this.clock);
    }
}