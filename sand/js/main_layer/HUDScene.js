import "./phaser.js";

export default class HUDGame extends Phaser.Scene {

    constructor () {
        super({key: 'HUDScene', active: true});
        //variables que guardan datos de HUD
        this.health = 0;
        this.maxHealth = 0;
        this.regenH = 0;
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
    }

    preload() {
        this.load.spritesheet('hud', 'assets/HUDicons.png', {frameWidth: 16, frameHeight: 16});
    
    }
    
    create() {
        let { width, height } = this.sys.game.canvas;
        let scaleRatio = width / height;
        let game = this.scene.get('GameScene');
        
        //elementos dinámincos
        this.health = game.initialData.curHealth;
        this.maxHealth = game.initialData.maxHealth;
        this.regenH = game.initialData.healthRegen;
        this.mana = game.initialData.curMana;
        this.maxMana = game.initialData.maxMana;
        this.regenM = game.initialData.manaRegen;
        this.damage = game.initialData.damage;
        this.spellPower = game.initialData.spellPower;
        this.magicArm = game.initialData.magicArmor;
        this.arm = game.initialData.armor;
        this.vel = game.initialData.speed;
        this.atS = game.initialData.atSpeed;
        this.level = game.initialData.level;
        this.xp = game.initialData.xp;
        this.xpNext = game.initialData.calculateNextLevelXp();
        
        //elementos gráficos estáticos
        var UnderBar = this.add.rectangle(3 * width / 8, (height - (height / 12)), 2 * width / 3, height / 6, 0x090909);
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
                x: scaleRatio / 3,
                y: scaleRatio / 3
            }
        });

        //elementos gráficos dinámicos
        var healthBar = this.add.rectangle(width / 2, (height - (3 * height / 28)), (this.health / this.maxHealth) * (width / 3), height / 20, 0xff0000);
        var manaBar = this.add.rectangle(width / 2, (height - (height / 28)), (this.health / this.maxHealth) * (width / 3), height / 20, 0x0000ff);
        var xpBar = this.add.rectangle(3 * width / 14, (height - (height / 7)), (this.xp / this.xpNext) * (width / 12), height / 60, 0xdddddd);
        
        //elementos de texto dinámicos
        var healthText = this.add.text(width / 3, (height - (67 * height / 560)), '0/0 + 0', { font: '48px Arial', fill: '#eeeeee' });
        var manaText = this.add.text(width / 3, (height - (27 * height / 560)), '0/0 + 0', { font: '48px Arial', fill: '#eeeeee' });
        var statsText = this.add.text(width / 10, (height - (height / 6.3)), '0', { font: '48px Arial', fill: '#eeeeee' });
        var levelText = this.add.text(width / 7, (height - (67 * height / 420)), 'level: 1', { font: '48px Arial', fill: '#eeeeee' });

        healthText.setText(this.fitNumber(this.health, 2) + '/' + this.fitNumber(this.maxHealth, 2) + ' + ' + this.fitNumber(this.regenH, 2));
        manaText.setText(this.fitNumber(this.mana, 2) + '/' + this.fitNumber(this.maxMana, 2) + ' + ' + this.fitNumber(this.regenM, 2));
        statsText.setText(this.fitNumber(this.damage, 2) + '\n' + this.fitNumber(this.spellPower / 100, 2) + '%\n' + this.fitNumber(this.arm, 0) + '\n' + this.fitNumber(this.magicArm, 0) + '\n' + this.fitNumber(this.vel, 0) + '\n' + this.fitNumber(this.atS, 0));

        healthText.setScale(0.6);
        manaText.setScale(0.6);
        statsText.setScale(0.45);
        levelText.setScale(0.6);

        healthText.setScrollFactor(1);
        statsText.setScrollFactor(1);
        levelText.setScrollFactor(1);

        //eventos de modificación de valores HUD
        game.events.on('updateLevel', function () {
            this.level = game.player1.getData('backend').level;
            levelText.setText('level: ' + this.fitNumber(this.level, 0));
        }, this);

        game.events.on('updateXP', function () {
            this.xp = game.player1.getData('backend').xp;
            this.xpNext = game.player1.getData('backend').calculateNextLevelXp();
            xpBar.width = (this.xp / this.xpNext) * (width / 12);
        }, this);

        game.events.on('updateDamage', function () {
            this.damage = game.player1.getData('backend').damage;
            statsText.setText(this.fitNumber(this.damage, 2) + '\n' + this.fitNumber(this.spellPower, 2) + '%\n' + this.fitNumber(this.arm, 0) + '\n' + this.fitNumber(this.magicArm, 0) + '\n' + this.fitNumber(this.vel, 0) + '\n' + this.fitNumber(this.atS, 0));
        }, this);

        game.events.on('updateSpellPower', function () {
            this.spellPower = game.player1.getData('backend').spellPower;
            statsText.setText(this.fitNumber(this.damage, 2) + '\n' + this.fitNumber(this.spellPower, 2) + '%\n' + this.fitNumber(this.arm, 0) + '\n' + this.fitNumber(this.magicArm, 0) + '\n' + this.fitNumber(this.vel, 0) + '\n' + this.fitNumber(this.atS, 0));
        }, this);

        game.events.on('updateArmor', function () {
            this.arm = game.player1.getData('backend').armor;
            statsText.setText(this.fitNumber(this.damage, 2) + '\n' + this.fitNumber(this.spellPower, 2) + '%\n' + this.fitNumber(this.arm, 0) + '\n' + this.fitNumber(this.magicArm, 0) + '\n' + this.fitNumber(this.vel, 0) + '\n' + this.fitNumber(this.atS, 0));
        }, this);

        game.events.on('updateMagicArmor', function () {
            this.magicArm = game.player1.getData('backend').magicArmor;
            this.level = game.player1.getData('backend').level;
            statsText.setText(this.fitNumber(this.damage, 2) + '\n' + this.fitNumber(this.spellPower, 2) + '%\n' + this.fitNumber(this.arm, 0) + '\n' + this.fitNumber(this.magicArm, 0) + '\n' + this.fitNumber(this.vel, 0) + '\n' + this.fitNumber(this.atS, 0));
        }, this);

        game.events.on('updateSpeed', function () {
            this.vel = game.player1.getData('backend').speed;
            statsText.setText(this.fitNumber(this.damage, 2) + '\n' + this.fitNumber(this.spellPower, 2) + '%\n' + this.fitNumber(this.arm, 0) + '\n' + this.fitNumber(this.magicArm, 0) + '\n' + this.fitNumber(this.vel, 0) + '\n' + this.fitNumber(this.atS, 0));
        }, this);

        game.events.on('updateAtSpeed', function () {
            this.atS = game.player1.getData('backend').atSpeed;
            statsText.setText(this.fitNumber(this.damage, 2) + '\n' + this.fitNumber(this.spellPower, 2) + '%\n' + this.fitNumber(this.arm, 0) + '\n' + this.fitNumber(this.magicArm, 0) + '\n' + this.fitNumber(this.vel, 0) + '\n' + this.fitNumber(this.atS, 0));
        }, this);

        game.events.on('updateHealth', function () {
            this.health = game.player1.getData('backend').curHealth;
            healthText.setText(this.fitNumber(this.health, 2) + '/' + this.fitNumber(this.maxHealth, 2) + ' + ' + this.fitNumber(this.regenH, 2));
            healthBar.width = (this.health/this.maxHealth) * (width / 3);
        }, this);

        game.events.on('updateMaxHealth', function () {
            this.maxHealth = game.player1.getData('backend').maxHealth;
            healthText.setText(this.fitNumber(this.health, 2) + '/' + this.fitNumber(this.maxHealth, 2) + ' + ' + this.fitNumber(this.regenH, 2));
            healthBar.width = (this.health/this.maxHealth) * (width / 3);
        }, this);

        game.events.on('updateHealthRegen', function () {
            this.regenH = game.player1.getData('backend').healthRegen;
            healthText.setText(this.fitNumber(this.health, 2) + '/' + this.fitNumber(this.maxHealth, 2) + ' + ' + this.fitNumber(this.regenH, 2));
        }, this);

        game.events.on('updateMana', function () {
            this.mana = game.player1.getData('backend').curMana;
            manaText.setText(this.fitNumber(this.mana, 2) + '/' + this.fitNumber(this.maxMana, 2) + ' + ' + this.fitNumber(this.regenM, 2));
            manaBar.width = (this.mana/this.maxMana) * (width / 3);
        }, this);

        game.events.on('updateMaxMana', function () {
            this.maxMana = game.player1.getData('backend').maxMana;
            manaText.setText(this.fitNumber(this.mana, 2) + '/' + this.fitNumber(this.maxMana, 2) + ' + ' + this.fitNumber(this.regenM, 2));
            manaBar.width = (this.mana/this.maxMana) * (width / 3);
        }, this);

        game.events.on('updateManaRegen', function () {
            this.regenM = game.player1.getData('backend').manaRegen;
            manaText.setText(this.fitNumber(this.mana, 2) + '/' + this.fitNumber(this.maxMana, 2) + ' + ' + this.fitNumber(this.regenM, 2));
        }, this);

        this.scene.bringToTop('HUDScene');
    }

    fitNumber(num, decimals){
        let scalefactor = Math.pow(10, decimals);
        return (Math.round(num * scalefactor) / scalefactor).toFixed(decimals);
    }
    
    update() {
    }
}