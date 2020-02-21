import "./phaser.js";
import Character from "../character/Character.js";
import Weapon from "../character/Weapon.js";
import Armor from "../character/Armor.js";

export default class SceneGame extends Phaser.Scene {

    constructor () {
        super({key: 'GameScene', active: true});
        //muy importante para hacer escalado de forma correcta
        this.scaleRatio = window.devicePixelRatio*3;
        //objetos que se renderizan
        this.map;
        this.layer;
        this.player1 = new Character('minotaur_warrior',
            'warrior',
            'minotaur',
            24, 3.8,
            20, 3.2,
            15, 1,
            12, 1.2,
            14, 1.8,
            22, 2.2,
            25,
            new Armor('bare', 0, 0, 0, 0, 0),
            new Weapon('maul', 'stun 0.2', 126, 2, -20, -15, -60, 0, 1.3),
            'assets/warrior_minotaur_test.png');
        //controles
        this.up;
        this.down;
        this.left;
        this.right;
        this.spell1;
        this.spell2;
        this.spell3;
        this.spell4;
        this.spell5;
        this.consumable1;
        this.consumable2;
        this.shop;
        this.cancel;
        
        this.lastKeyPressed = "";
    }

    preload() {

        this.player1.preloadSprite(this, 60, 76);
        //this.load.spritesheet('minotaur_warrior', 'assets/warrior_minotaur_test.png', {frameWidth: 60, frameHeight: 76});
        this.load.tilemapTiledJSON('duelMap', 'assets/duel_map.json');
        this.load.image('tiles', 'assets/maptiles.png');
    
    }
    
    create() {
    
        //map generation
        this.map = this.make.tilemap({key: 'duelMap'});
    
        var tileset = this.map.addTilesetImage('maptiles', 'tiles');
    
        this.layer = this.map.createStaticLayer("duel", tileset, 0, 0);
        this.layer.setScale(this.scaleRatio);
        this.cameras.main.setBounds(0, 0, 960 * this.scaleRatio, 1600 * this.scaleRatio);
        this.matter.world.setBounds(0, 0, 960 * this.scaleRatio, 1600 * this.scaleRatio);
        
        // The player and its settings
        //hay que asegurarse que el body quede cuadrado puesto que no se puede rotar
        this.player1.setSprite(this, this.scaleRatio, 46, 41, 60, 76, 480 * this.scaleRatio, 800 * this.scaleRatio);
    
        //animations
        this.player1.addAnimation(this, 'attack', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 7, 4, 0]);
        this.player1.addAnimation(this, 'spellq', [0, 11, 12, 13, 14, 12, 0]);
        this.player1.addAnimation(this, 'spellr', [0, 10, 10, 10, 10, 10, 10, 0]);
    
        this.player1.sprite.on('animationcomplete', this.changeAction, this);
    
        //  Our controls.
        this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spell1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.spell2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.spell3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.spell4 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.spell5 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V);
        this.consumable1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.consumable2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.shop = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        this.cancel = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);

        //input
        //this.input.mouse.disableContextMenu(); se reactiva en producción
        this.input.on('pointermove', this.adjustPlayerRotation, this);
    
        //camera
        this.cameras.main.startFollow(this.player1.sprite, true, 1, 1);
    }
    
    update() {
        this.player1.applyHealthRegen(this);
        var pointer = this.input.activePointer;
    
        this.player1.makeIdle();
    
        if (this.left.isDown) {
            this.player1.moveX(false);
        }
        else if (this.right.isDown) {
            this.player1.moveX(true);
        }
    
        if (this.up.isDown) {
            this.player1.moveY(true);
        }else if (this.down.isDown) {
            this.player1.moveY(false);
        }
    
        if(this.cancel.isDown){
            this.lastKeyPressed = "";
        }
    
        if(pointer.isDown){
            this.player1.takeDamage(this, -1);
            console.log(this.player1.curHealth, "/", this.player1.maxHealth, " + ", this.player1.healthRegen);
            if(!this.player1.sprite.anims.isPlaying){
                switch(this.lastKeyPressed){
                case "q":
                    this.player1.sprite.play('spellq');
                    break;
                case "r":
                    this.player1.sprite.play('spellr');
                    break;
                default:
                    console.log(this.player1.sprite.anims);
                    this.player1.sprite.play('attack');
                    break;
            }
            }
        }
    
        if (this.spell1.isDown){
            this.lastKeyPressed = "q";
        }else if (this.spell2.isDown){
            this.lastKeyPressed = "e";
        } else if(this.spell3.isDown){
            this.lastKeyPressed = "f";
        } else if(this.spell4.isDown){
            this.lastKeyPressed = "r";
        }
    }
    
    changeAction(animation, frame){
        this.lastKeyPressed = "";
    }
    
    adjustPlayerRotation(pointer) {
        var camera = this.cameras.main;
        var angle = -90 + (Phaser.Math.RAD_TO_DEG * Phaser.Math.Angle.Between(this.player1.sprite.x, this.player1.sprite.y, pointer.x + camera.scrollX, pointer.y + camera.scrollY));
        this.player1.sprite.setAngle(angle);
    }
}