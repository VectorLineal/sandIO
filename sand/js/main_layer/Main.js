import "./phaser.js";
import SceneGame from "./SceneGame.js";
import HUDScene from "./HUDScene.js";

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

var config = {
    type: Phaser.AUTO,
    parent: '',
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
    backgroundColor: '#fbf0e4',
    physics: {
        default: 'matter',
        matter: {
            debug: true,
            gravity:{
                x: 0,
                y:0
            }
        }
    },
    scene: [SceneGame, HUDScene],
    title: 'sand',
    pixelArt: true
};

let game = new Phaser.Game(config);