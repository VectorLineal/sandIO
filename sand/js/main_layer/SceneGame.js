import "./phaser.js";
import Playable from "../character/Playable.js";
import NPCFactory from "../character/NPCFactory.js";
import EnviromentalFactory from "../character/EnviromentalFactory.js";
import Weapon from "../character/Weapon.js";
import Armor from "../character/Armor.js";
import LinearFunction from "../character/LinearFunction.js";

export default class SceneGame extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene", active: true });
    this.clock = 0;
    //muy importante para hacer escalado de forma correcta
    this.scaleRatio = 3;
    //categorias y grupos de colisión
    this.groups = [];
    this.categories = [];
    //objetos que se renderizan
    this.map;
    this.layer;

    this.jungleFactory;
    this.forestManager = new EnviromentalFactory(
      "tree",
      100,
      500,
      50,
      [],
      24,
      24,
      3,
      4294967295
    );
    this.player1;

    this.enviromentSprites;
    this.neutralSprites;
    this.teamASprites;
    this.teamBSprites;
    this.initialData = new Playable(
      "minotaur_warrior",
      "warrior",
      30,
      "minotaur",
      24,
      3.8,
      20,
      3.2,
      15,
      1,
      12,
      1.2,
      14,
      1.8,
      22,
      2.2,
      1,
      100,
      new Armor("broncePlate", 27, 115.1, -11, 1.9, -18.5, 20),
      new Weapon("maul", "stun 0.2", 126, false, 35, -15, -11.2, -60, 10, 1.3),
      { x: 10, y: 10 }
    );

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
    this.load.spritesheet(
      "minotaur_warrior",
      "assets/warrior_minotaur_test.png",
      { frameWidth: 60, frameHeight: 76 }
    );
    this.load.spritesheet("chimera", "assets/chimera_sheet.png", {
      frameWidth: 92,
      frameHeight: 149,
    });
    this.load.spritesheet("tree1", "assets/tree_sheet_1.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.tilemapTiledJSON("duelMap", "assets/duel_map.json");
    this.load.json("mapEnvironment", "assets/duel_map_environment.json");
    this.load.image("tiles", "assets/maptiles.png");
  }

  create() {
    let { width, height } = this.sys.game.canvas;
    let scaleRatio = (1.5 * width) / height;
    this.scaleRatio = scaleRatio;
    this.forestManager.spawnPoints = this.cache.json.get(
      "mapEnvironment"
    ).neutral.trees;

    let test = this.cache.json.get("mapEnvironment").neutral.spawnPoints[0];
    console.log("test version:", test);
    //map generation
    this.map = this.make.tilemap({ key: "duelMap" });

    var tileset = this.map.addTilesetImage("maptiles", "tiles");

    this.layer = this.map.createStaticLayer("duel", tileset, 0, 0);
    this.layer.setScale(scaleRatio);
    this.cameras.main.setBounds(0, 0, 960 * scaleRatio, 1600 * scaleRatio);
    this.matter.world.setBounds(0, 0, 960 * scaleRatio, 1600 * scaleRatio);

    //sprite groups
    this.enviromentSprites = this.add.group();
    this.neutralSprites = this.add.group();

    //categories and groups
    for (var index = 0; index < 4; index++) {
      this.groups.push(this.matter.world.nextGroup());
    }

    for (var index = 0; index < 6; index++) {
      this.categories.push(this.matter.world.nextCategory());
    }

    //npcs
    this.jungleFactory = new NPCFactory(
      [
        {
          name: "chimera",
          width: 46,
          height: 136,
          frameWidth: 92,
          frameHeight: 149,
          centerX: true,
          centerY: false,
          character: {
            xpFactor: 80,
            bountyFactor: 30,
            race: "beast",
            fortitude: new LinearFunction(2, 14),
            damage: new LinearFunction(33, 105),
            armor: new LinearFunction(5.3, 33),
            maxHealth: new LinearFunction(175, 2400),
            healthRegen: new LinearFunction(2, 18),
            speed: new LinearFunction(0.1, 40),
            atSpeed: new LinearFunction(6, 160),
            evasion: new LinearFunction(0.8, 10),
            crit: new LinearFunction(0.6, 5),
            accuracy: new LinearFunction(2, 125),
            maxMana: new LinearFunction(14, 300),
            manaRegen: new LinearFunction(0.8, 1.2),
            spellPower: new LinearFunction(0.5, 0.5),
            will: new LinearFunction(1.2, 3),
            magicArmor: new LinearFunction(9.6, 60),
            concentration: new LinearFunction(0.5, 0.5),
            onCrit: "bleed 18+3x",
            critMultiplier: 1.65,
            ranged: false,
            range: 15,
            detectionRange: 300,
            behavour: 2 
          }
        }
      ],
      [
        {
          x: this.cache.json.get("mapEnvironment").neutral.spawnPoints[0].x,
          y: this.cache.json.get("mapEnvironment").neutral.spawnPoints[0].y,
          spawns: [0],
        },
      ],
      this.groups[2],
      this.categories[0] ^ this.categories[3] ^ this.categories[4] ^ 1
    );
    this.jungleFactory.generateInitialSet(this, this.neutralSprites, scaleRatio);

    // The player and its settings
    //hay que asegurarse que el body quede cuadrado puesto que no se puede rotar
    this.player1 = this.setSprite(
      46,
      41,
      60,
      76,
      this.cache.json.get("mapEnvironment").team1.spawnPoints[0].x * scaleRatio,
      this.cache.json.get("mapEnvironment").team1.spawnPoints[0].y * scaleRatio,
      "minotaur_warrior",
      false,
      false
    );
    this.initialData.spawnX =
      this.cache.json.get("mapEnvironment").team1.spawnPoints[0].x * scaleRatio;
    this.initialData.spawnY =
      this.cache.json.get("mapEnvironment").team1.spawnPoints[0].y * scaleRatio;
    this.player1.setScale(scaleRatio);
    this.player1.setData("backend", this.initialData);
    this.player1.setData("respawnTimer", { time: 0 });
    this.player1.setData(
      "displayDamage",
      this.add
        .text(this.player1.x, this.player1.y, "", {
          font: "48px Arial",
          fill: "#eeeeee",
        })
        .setDepth(1)
        .setData("timer", 0)
    );
    this.player1.body.label = "minotaur_warrior";
    this.player1.setCollisionGroup(this.groups[0]);
    this.player1.setCollidesWith(
      this.categories[1] ^ this.categories[2] ^ this.categories[4] ^ 1
    );
    this.player1.setDepth(0.5);

    //animations
    this.player1
      .getData("backend")
      .addAnimation(this, "attack_minotaur_warrior", [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        7,
        4,
        0,
      ]);
    this.player1
      .getData("backend")
      .addAnimation(this, "spellq_minotaur_warrior", [
        0,
        11,
        12,
        13,
        14,
        12,
        0,
      ]);
    this.player1
      .getData("backend")
      .addAnimation(this, "spellr_minotaur_warrior", [
        0,
        10,
        10,
        10,
        10,
        10,
        10,
        0,
      ]);

    this.player1.on("animationcomplete", this.changeAction, this);

    //enviromental elements
    this.forestManager.group = this.groups[3];
    this.forestManager.mask =
      this.categories[0] ^ this.categories[2] ^ this.categories[5] ^ 1;
    this.forestManager.generateInitialSet(
      this,
      this.enviromentSprites,
      "tree1",
      this.scaleRatio
    );
    console.log(
      "group:",
      this.forestManager.group,
      "mask:",
      this.forestManager.mask
    );
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
    this.consumable1 = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ONE
    );
    this.consumable2 = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.TWO
    );
    this.shop = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.cancel = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);

    //input
    //this.input.mouse.disableContextMenu(); se reactiva en producción
    this.input.on("pointermove", this.adjustPlayerRotation, this);

    //camera
    this.cameras.main.startFollow(this.player1, true, 1, 1);
    this.cameras.main.roundPixels = true;
    this.matter.world.on("collisionstart", this.dealDamage, this);
  }

  update() {
    /*for(var index = 0; index < this.damageDisplay.children.getArray().lenght; index++){
      this.damageDisplay.children.getArray()[index].data.values.timer--;
    }

    for(var index = 0; index < this.damageDisplay.children.getArray().lenght; index++){
      if(this.damageDisplay.children.getArray()[index].data.values.timer <= 0){
        //this.damageDisplay.remove(this.damageDisplay.children.getArray()[index], true, true);
        this.damageDisplay.clear();
        break;
      }
    }*/

    this.player1.getData("backend").applyHealthRegen(this);
    this.player1.getData("backend").applyManaRegen(this);
    var pointer = this.input.activePointer;

    this.player1.setVelocity(0);

    this.forestManager.onUpdate(this, this.enviromentSprites, this.scaleRatio);
    this.jungleFactory.onUpdate(this, this.neutralSprites, this.scaleRatio, this.clock);

    if (this.left.isDown) {
      this.player1
        .getData("backend")
        .moveX(this.player1, false, this.scaleRatio);
    } else if (this.right.isDown) {
      this.player1
        .getData("backend")
        .moveX(this.player1, true, this.scaleRatio);
    }

    if (this.up.isDown) {
      this.player1
        .getData("backend")
        .moveY(this.player1, true, this.scaleRatio);
    } else if (this.down.isDown) {
      this.player1
        .getData("backend")
        .moveY(this.player1, false, this.scaleRatio);
    }

    if (this.cancel.isDown) {
      this.lastKeyPressed = "";
    }

    if (pointer.isDown) {
      if (!this.player1.anims.isPlaying) {
        switch (this.lastKeyPressed) {
          case "q":
            if (
              this.player1.getData("backend").curMana >=
              30 + 2 * this.player1.getData("backend").level
            ) {
              this.player1.play(
                "spellq_" + this.player1.getData("backend").name
              );
              this.player1
                .getData("backend")
                .spendMana(
                  this,
                  -30 - 2 * this.player1.getData("backend").level
                );
            } else {
              this.lastKeyPressed = "";
            }
            break;
          case "e":
            if (
              this.player1.getData("backend").curMana >=
              45 + 7 * this.player1.getData("backend").level
            ) {
              this.player1
                .getData("backend")
                .spendMana(
                  this,
                  -45 - 7 * this.player1.getData("backend").level
                );
              this.lastKeyPressed = "";
            } else {
              this.lastKeyPressed = "";
            }
            break;
          case "f":
            //es una pasiva, no hace nada
            this.lastKeyPressed = "";
            break;
          case "r":
            if (
              this.player1.getData("backend").curMana >=
              45 + 5 * this.player1.getData("backend").level
            ) {
              this.player1.play(
                "spellr_" + this.player1.getData("backend").name
              );
              this.player1
                .getData("backend")
                .spendMana(
                  this,
                  -45 - 5 * this.player1.getData("backend").level
                );
            } else {
              this.lastKeyPressed = "";
            }
            break;
          default:
            this.player1.play("attack_" + this.player1.getData("backend").name);
            break;
        }
      }
    }

    if (this.spell1.isDown) {
      this.lastKeyPressed = "q";
    } else if (this.spell2.isDown) {
      this.lastKeyPressed = "e";
    } else if (this.spell3.isDown) {
      this.lastKeyPressed = "f";
    } else if (this.spell4.isDown) {
      this.lastKeyPressed = "r";
    }

    //se limpian los collision box inutiles
    for (
      var index = 0;
      index < this.matter.world.getAllBodies().length;
      index++
    ) {
      if (this.matter.world.getAllBodies()[index].label === "attackBox") {
        console.log("index:", index);
        this.matter.world.remove(this.matter.world.getAllBodies()[index]);
      }
    }

    //se actualza el tiempo transcurrido del juego
    this.clock++;
  }

  //funciones no heredadas de la escena

  changeAction(animation, frame) {
    this.player1
      .getData("backend")
      .takeDamage({
        scene: this,
        amount: 10,
        type: 0,
        avoidable: false,
        critable: false,
      });
    this.lastKeyPressed = "";
    if (animation.key == "attack_" + this.player1.getData("backend").name) {
      var xc = this.player1.x;
      var yc = this.player1.y;
      var xr = -this.player1.displayWidth / 4;
      var yr = this.player1.displayHeight / 2;
      let magnitude = Math.sqrt(xr * xr + yr * yr);
      var attackBox = this.matter.add.rectangle(
        xc +
          magnitude *
            Math.cos(
              this.getRotation(xr, yr) + this.degToRad(this.player1.angle)
            ),
        yc +
          magnitude *
            Math.sin(
              this.getRotation(xr, yr) + this.degToRad(this.player1.angle)
            ),
        35 * this.scaleRatio,
        36 * this.scaleRatio,
        {
          isSensor: true,
          angle: this.degToRad(this.player1.angle),
          render: { visible: true, lineColor: 0x00ff00 },
        }
      );
      attackBox.label = "attackBox";
      if (this.player1.body.collisionFilter.group == this.groups[0]) {
        attackBox.collisionFilter.category = this.categories[0];
      } else if (this.player1.body.collisionFilter.group == this.groups[1]) {
        attackBox.collisionFilter.category = this.categories[2];
      }
    }
    console.log("bodies in world:", this.matter.world.getAllBodies());
  }

  dealDamage(event, bodyA, bodyB) {
    var dealtDamage = { amount: 0, isCrit: false };
    let initialHealth = 0;

    if (bodyA.label === "attackBox" && bodyB.label !== "attackBox") {
      initialHealth = bodyB.gameObject.getData("backend").curHealth;
      dealtDamage = bodyB.gameObject
        .getData("backend")
        .takeDamage({
          amount: this.player1.getData("backend").damage,
          type: 1,
          accuracy: this.player1.getData("backend").accuracy,
          critChance: this.player1.getData("backend").crit,
          critMultiplier: this.player1.getData("backend").getCritMultiplier(),
          avoidable: true,
          critable: true,
          ranged: this.player1.getData("backend").getRanged(),
        });
      //mostrar texto de daño
      var damageMessage = "";
      var color = "#eeeeee";
      if (dealtDamage.amount == 0) {
        damageMessage = "missed";
      } else {
        damageMessage = dealtDamage.amount.toString();
      }
      if (dealtDamage.isCrit) {
        color = "#ff0808";
      }
      bodyB.gameObject.getData("displayDamage").x = bodyB.gameObject.x;
      bodyB.gameObject.getData("displayDamage").y = bodyB.gameObject.y;
      bodyB.gameObject.getData("displayDamage").data.values.timer = 40;
      bodyB.gameObject.getData("displayDamage").setText(damageMessage);
      bodyB.gameObject.getData("displayDamage").setColor(color);
      bodyB.gameObject.getData("displayDamage").setVisible(true);

      this.matter.world.remove(bodyA);

      if (initialHealth > 0 && bodyB.gameObject.getData("backend").curHealth <= 0) {
        switch(bodyB.collisionFilter.group){
          case this.groups[0]:
            this.player1.getData("backend").gainXP(
              this,
              bodyB.gameObject.getData("backend").onDeath({ world: this.matter.world, sprite: bodyB.gameObject, group: this.teamASprites, factory: this.jungleFactory})
            );
            break;
          case this.groups[1]:
            this.player1.getData("backend").gainXP(
              this,
              bodyB.gameObject.getData("backend").onDeath({ world: this.matter.world, sprite: bodyB.gameObject, group: this.teamBSprites, factory: this.jungleFactory})
            );
            break;
          case this.groups[2]:
            this.player1.getData("backend").gainXP(
              this,
              bodyB.gameObject.getData("backend").onDeath({ world: this.matter.world, sprite: bodyB.gameObject, group: this.neutralSprites, factory: this.jungleFactory})
            );
            break;
          case this.groups[3]:
            this.player1.getData("backend").gainXP(
              this,
              bodyB.gameObject.getData("backend").onDeath({ world: this.matter.world, sprite: bodyB.gameObject, group: this.enviromentSprites, factory: this.jungleFactory})
            );
            break;
        }
      }
    } else if (bodyB.label === "attackBox" && bodyA.label !== "attackBox") {
      initialHealth = bodyA.gameObject.getData("backend").curHealth;
      dealtDamage = bodyA.gameObject
        .getData("backend")
        .takeDamage({
          amount: this.player1.getData("backend").damage,
          type: 1,
          accuracy: this.player1.getData("backend").accuracy,
          critChance: this.player1.getData("backend").crit,
          critMultiplier: this.player1.getData("backend").getCritMultiplier(),
          avoidable: true,
          critable: true,
          ranged: this.player1.getData("backend").getRanged(),
        });
      //mostrar texto de daño
      var damageMessage = "";
      var color = "#eeeeee";
      if (dealtDamage.amount == 0) {
        damageMessage = "missed";
      } else {
        damageMessage = dealtDamage.amount.toString();
      }
      if (dealtDamage.isCrit) {
        color = "#ff0808";
      }
      bodyA.gameObject.getData("displayDamage").x = bodyA.gameObject.x;
      bodyA.gameObject.getData("displayDamage").y = bodyA.gameObject.y;
      bodyA.gameObject.getData("displayDamage").data.values.timer = 40;
      bodyA.gameObject.getData("displayDamage").setText(damageMessage);
      bodyA.gameObject.getData("displayDamage").setColor(color);
      bodyA.gameObject.getData("displayDamage").setVisible(true);

      this.matter.world.remove(bodyB);
      if (initialHealth > 0 && bodyA.gameObject.getData("backend").curHealth <= 0) {
        switch(bodyA.collisionFilter.group){
          case this.groups[0]:
            this.player1.getData("backend").gainXP(
              this,
              bodyA.gameObject.getData("backend").onDeath({ world: this.matter.world, sprite: bodyA.gameObject, group: this.teamASprites, factory: this.jungleFactory})
            );
            break;
          case this.groups[1]:
            this.player1.getData("backend").gainXP(
              this,
              bodyA.gameObject.getData("backend").onDeath({ world: this.matter.world, sprite: bodyA.gameObject, group: this.teamBSprites, factory: this.jungleFactory})
            );
            break;
          case this.groups[2]:
            this.player1.getData("backend").gainXP(
              this,
              bodyA.gameObject.getData("backend").onDeath({ world: this.matter.world, sprite: bodyA.gameObject, group: this.neutralSprites, factory: this.jungleFactory})
            );
            break;
          case this.groups[3]:
            this.player1.getData("backend").gainXP(
              this,
              bodyA.gameObject.getData("backend").onDeath({ world: this.matter.world, sprite: bodyA.gameObject, group: this.enviromentSprites, factory: this.jungleFactory})
            );
            break;
        }
      }
    }
    console.log("body A:", bodyA.label, ", body B:", bodyB.label);
  }

  degToRad(angle) {
    return (angle * Math.PI) / 180;
  }

  getRotation(x, y) {
    var result = 0;
    if (x > 0) {
      result = Math.atan(y / x);
    } else if (x == 0 && y > 0) {
      result = Math.PI / 2;
    } else if (x == 0 && y < 0) {
      result = -Math.PI / 2;
    } else if (x < 0 && y == 0) {
      return Math.PI;
    } else {
      result = Math.atan(y / x) + Math.PI;
    }

    if (result > Math.PI) {
      result -= Math.PI;
    }

    return result;
  }

  getRotationAround(xc, yc, xr, yr) {
    return this.getRotation(xc - xr, yc - yr);
  }

  adjustPlayerRotation(pointer) {
    var camera = this.cameras.main;
    var angle =
      -90 +
      Phaser.Math.RAD_TO_DEG *
        Phaser.Math.Angle.Between(
          this.player1.x,
          this.player1.y,
          pointer.x + camera.scrollX,
          pointer.y + camera.scrollY
        );
    this.player1.setAngle(angle);
  }

  setSprite(
    width,
    height,
    frameWidth,
    frameHeight,
    positionX,
    positionY,
    name,
    centerX,
    centerY
  ) {
    if (!centerX && !centerY) {
      return this.matter.add.sprite(positionX, positionY, name, null, {
        shape: {
          type: "rectangle",
          width: width,
          height: height,
        },
        render: {
          sprite: {
            xOffset: (frameWidth - width - 1 + width / 2) / frameWidth - 0.5,
            yOffset: -((frameHeight - height - 1) / 2 / frameHeight),
          },
        },
      });
    } else if (centerX && !centerY) {
      return this.matter.add.sprite(positionX, positionY, name, null, {
        shape: {
          type: "rectangle",
          width: width,
          height: height,
        },
        render: {
          sprite: {
            yOffset: -((frameHeight - height - 1) / 2 / frameHeight),
          },
        },
      });
    } else if (!centerX && centerY) {
      return this.matter.add.sprite(positionX, positionY, name, null, {
        shape: {
          type: "rectangle",
          width: width,
          height: height,
        },
        render: {
          sprite: {
            xOffset: (frameWidth - width - 1 + width / 2) / frameWidth - 0.5,
          },
        },
      });
    } else {
      return this.matter.add.sprite(positionX, positionY, name, null, {
        shape: {
          type: "rectangle",
          width: width,
          height: height,
        },
      });
    }
  }
}
