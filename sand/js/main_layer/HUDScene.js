import "./phaser.js";

export default class HUDGame extends Phaser.Scene {

    constructor () {
        super({key: 'HUDScene', active: true});
        //variables que guardan datos de HUD
        this.health = 0;
        this.maxHealth = 0;
        this.regenH = 0;
    }

    preload() {
        //this.load.spritesheet('minotaur_warrior', 'assets/warrior_minotaur_test.png', {frameWidth: 60, frameHeight: 76});
    
    }
    
    create() {
        let { width, height } = this.sys.game.canvas;
        let game = this.scene.get('GameScene');
        
        this.health = game.player1.curHealth;
        this.maxHealth = game.player1.maxHealth;
        this.regenH = game.player1.healthRegen;
        var healthText = this.add.text(14.4, 24, 'health: 0/0 + 0', { font: '48px Arial', fill: '#000000' });
        //healthText.scale = 300;

        healthText.setText('health: ' + this.fitNumber(this.health, 2) + '/' + this.fitNumber(this.maxHealth, 2) + ' + ' + this.fitNumber(this.regenH, 2));

        this.scene.bringToTop('HUDScene');

        healthText.setScrollFactor(1);

        var UnderHealthBar = this.add.rectangle(width/3, (height-(height/15)), width / 3, height / 15, 0x050505);
        var healthBar = this.add.rectangle(width/3, (height-(height/15)), (this.health/this.maxHealth) * (width / 3), height / 20, 0xff0000);

        game.events.on('updateHealth', function () {
            this.health = game.player1.curHealth;
            healthText.setText('health: ' + this.fitNumber(this.health, 2) + '/' + this.fitNumber(this.maxHealth, 2) + ' + ' + this.fitNumber(this.regenH, 2));
            healthBar.width = (this.health/this.maxHealth) * (width / 3);
        }, this);
    }

    fitNumber(num, decimals){
        let scalefactor = Math.pow(10, decimals);
        return (Math.round(num * scalefactor) / scalefactor).toFixed(decimals);
    }
    
    update() {
    }
}