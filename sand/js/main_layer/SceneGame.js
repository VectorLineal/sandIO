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
        this.player1;
        this.initialData =new Character(
            'minotaur_warrior',
            'warrior',
            'minotaur',
            24, 3.8,
            20, 3.2,
            15, 1,
            12, 1.2,
            14, 1.8,
            22, 2.2,
            1,
            100,
            new Armor('broncePlate', 18, 104.5, -11, 1.9, 1.5),
            new Weapon('maul', 'stun 0.2', 126, 2, -20, -15, -60, 0, 1.3));
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
        //scene.load.spritesheet(name, path, {frameWidth: width, frameHeight: height});
        this.load.spritesheet('minotaur_warrior', 'assets/warrior_minotaur_test.png', {frameWidth: 60, frameHeight: 76});
        this.load.tilemapTiledJSON('duelMap', 'assets/duel_map.json');
        this.load.image('tiles', 'assets/maptiles.png');
    
    }
    
    create() {
        let { width, height } = this.sys.game.canvas;
        let scaleRatio = 1.5 * width / height;
    
        //map generation
        this.map = this.make.tilemap({key: 'duelMap'});
    
        var tileset = this.map.addTilesetImage('maptiles', 'tiles');
    
        this.layer = this.map.createStaticLayer("duel", tileset, 0, 0);
        this.layer.setScale(scaleRatio);
        this.cameras.main.setBounds(0, 0, 960 * scaleRatio, 1600 * scaleRatio);
        this.matter.world.setBounds(0, 0, 960 * scaleRatio, 1600 * scaleRatio);
        
        // The player and its settings
        //hay que asegurarse que el body quede cuadrado puesto que no se puede rotar
        this.player1 = this.setSprite(46, 41, 60, 76, 480 * scaleRatio, 800 * scaleRatio, 'minotaur_warrior');
        this.player1.setScale(scaleRatio);
        this.player1.setData('backend', this.initialData);
    
        //animations
        this.player1.getData('backend').addAnimation(this, 'attack_minotaur_warrior', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 7, 4, 0]);
        this.player1.getData('backend').addAnimation(this, 'spellq_minotaur_warrior', [0, 11, 12, 13, 14, 12, 0]);
        this.player1.getData('backend').addAnimation(this, 'spellr_minotaur_warrior', [0, 10, 10, 10, 10, 10, 10, 0]);
    
        this.player1.on('animationcomplete', this.changeAction, this);
    
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
        this.cameras.main.startFollow(this.player1, true, 1, 1);
    }
    
    update() {
        this.player1.getData('backend').applyHealthRegen(this);
        this.player1.getData('backend').applyManaRegen(this);
        var pointer = this.input.activePointer;
    
        this.player1.setVelocity(0);
    
        if (this.left.isDown) {
            this.player1.getData('backend').moveX(this.player1, false);
        }
        else if (this.right.isDown) {
            this.player1.getData('backend').moveX(this.player1, true);
        }
    
        if (this.up.isDown) {
            this.player1.getData('backend').moveY(this.player1, true);
        }else if (this.down.isDown) {
            this.player1.getData('backend').moveY(this.player1, false);
        }
    
        if(this.cancel.isDown){
            this.lastKeyPressed = "";
        }
    
        if(pointer.isDown){
            this.player1.getData('backend').takeDamage(this, -1);
            this.player1.getData('backend').gainXP(this, 1.5);
            if(!this.player1.anims.isPlaying){
                switch(this.lastKeyPressed){
                case "q":
                    if(this.player1.getData('backend').curMana >= 30 + (2 * this.player1.getData('backend').level)){
                        this.player1.play('spellq_' + this.player1.getData('backend').name);
                        this.player1.getData('backend').spendMana(this, -30 - (2 * this.player1.getData('backend').level));
                    }else{
                        this.lastKeyPressed = "";
                    }
                    break;
                case "e":
                    if(this.player1.getData('backend').curMana >= 45 + (7 * this.player1.getData('backend').level)){
                        this.player1.getData('backend').spendMana(this, -45 - (7 * this.player1.getData('backend').level));
                        this.lastKeyPressed = "";
                    }else{
                        this.lastKeyPressed = "";
                    }
                    break;
                case "f":
                    //es una pasiva, no hace nada
                    this.lastKeyPressed = "";
                    break;
                case "r":
                    if(this.player1.getData('backend').curMana >= 45 + (5 * this.player1.getData('backend').level)){
                        this.player1.play('spellr_' + this.player1.getData('backend').name);
                        this.player1.getData('backend').spendMana(this, -45 - (5 * this.player1.getData('backend').level));
                    }else{
                        this.lastKeyPressed = "";
                    }
                    break;
                default:
                    console.log(this.player1.anims);
                    this.player1.play("attack_" + this.player1.getData('backend').name);
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

    //funciones no heredadas de la escena
    
    changeAction(animation, frame){
        this.lastKeyPressed = "";
    }
    
    adjustPlayerRotation(pointer) {
        var camera = this.cameras.main;
        var angle = -90 + (Phaser.Math.RAD_TO_DEG * Phaser.Math.Angle.Between(this.player1.x, this.player1.y, pointer.x + camera.scrollX, pointer.y + camera.scrollY));
        this.player1.setAngle(angle);
    }

    setSprite(width, height, frameWidth, frameHeight, positionX, positionY, name){
        return this.matter.add.sprite(positionX, positionY, name, null, {
            shape: {
                type: 'rectangle',
                width: width,
                height: height
            },
            render:{ sprite: { xOffset:(((frameWidth-width-1)+(width/2))/frameWidth) - 0.5, yOffset:-(((frameHeight-height-1)/2)/frameHeight)}}
        });
    }
}