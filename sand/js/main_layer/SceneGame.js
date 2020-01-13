import "./phaser.js";

export default class SceneGame extends Phaser.Scene {

    constructor ()
    {
        super('GameScene');
        //muy importante para hacer escalado de forma correcta
        this.scaleRatio = window.devicePixelRatio*3;
        //objetos que se renderizan
        this.map;
        this.layer;
        this.player;
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

        //game.load.spritesheet('minotaur_warrior', 'assets/warrior_minotaur.png', 60, 76, 10);
        this.load.spritesheet('minotaur_warrior', 'assets/warrior_minotaur_test.png', {frameWidth: 60, frameHeight: 76});
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
        //13 y -34 representan la diferencia de pixeles que se pretende eliminar para poner el cuerpo fisico solo en el personaje, no el arma ni nada más
        this.player = this.matter.add.sprite(480 * this.scaleRatio, 800 * this.scaleRatio, 'minotaur_warrior', null, {
            shape: {
                type: 'rectangle',
                width: 46,
                height: 41
            },
            render:{ sprite: { xOffset:((13+(46/2))/60) - 0.5, yOffset:-((34/2)/76)}}
        });
        this.player.setScale(this.scaleRatio);
    
        //animations
        var attackSpeed=600;
    
        this.anims.create({
            key: 'attack',
            frames: this.anims.generateFrameNumbers('minotaur_warrior', { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 7, 4, 0] }),
            frameRate: (13*attackSpeed)/200
        });
    
        this.anims.create({
            key: 'spell1',
            frames: this.anims.generateFrameNumbers('minotaur_warrior', { frames: [0, 11, 12, 13, 14, 12, 0] }),
            frameRate: 10
        });
    
        this.anims.create({
            key: 'spell4',
            frames: this.anims.generateFrameNumbers('minotaur_warrior', { frames: [0, 10, 10, 10, 10, 10, 10, 0] }),
            frameRate: 10
        });
    
        this.player.on('animationcomplete', this.changeAction, this);
    
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
        this.cameras.main.startFollow(this.player, true, 1, 1);
    }
    
    update() {
        var speed = 30/this.scaleRatio;
        var pointer = this.input.activePointer;
    
        this.player.setVelocity(0);
    
        if (this.left.isDown) {
            this.player.setVelocityX(-speed);
        }
        else if (this.right.isDown) {
            this.player.setVelocityX(speed);
        }
    
        if (this.up.isDown) {
            this.player.setVelocityY(-speed);
        }else if (this.down.isDown) {
            this.player.setVelocityY(speed);
        }
    
        if(this.cancel.isDown){
            this.lastKeyPressed = "";
        }
    
        if(pointer.isDown){
            if(!this.player.anims.isPlaying){
                switch(this.lastKeyPressed){
                case "q":
                    this.player.anims.play('spell1');
                    break;
                case "r":
                    this.player.play('spell4');
                    break;
                default:
                    this.player.play('attack');
                    break;
            }
            }
        }
    
        if (this.spell1.isDown){
            this.lastKeyPressed = "q";
        } else if(this.spell4.isDown){
            this.lastKeyPressed = "r";
        }
    }
    
    changeAction(animation, frame){
        this.lastKeyPressed = "";
    }
    
    adjustPlayerRotation(pointer) {
        var camera = this.cameras.main;
        var angle = -90 + (Phaser.Math.RAD_TO_DEG * Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.x + camera.scrollX, pointer.y + camera.scrollY));
        this.player.setAngle(angle);
    }
}