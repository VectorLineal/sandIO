import "./phaser.js";
import Hero from "../character/Hero.js";
import NonPlayable from "../character/NonPlayable.js";
import Building from "../character/Building.js";
import NPCFactory from "../character/NPCFactory.js";
import HeroFactory from "../character/HeroFactory.js";
import EnviromentalFactory from "../character/EnviromentalFactory.js";

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

    //factories y managers de entidades del juego
    this.jungleFactory;
    this.forestManager;
    this.teamAHeroManager;
    this.teamANPCManager;
    this.teamBHeroManager;
    this.teamBNPCManager;

    //gameObject groups
    this.enviromentSprites;
    this.buildingSprites;
    this.neutralSprites;
    this.teamASprites;
    this.teamBSprites;

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
    this.load.image("wall", "assets/walls.png");
    this.load.image("gate", "assets/gate.png");
    this.load.image("tower", "assets/tower.png");
    this.load.image("fort", "assets/fort.png");

    this.load.tilemapTiledJSON("duelMap", "assets/duel_map.json");
    this.load.image("tiles", "assets/maptiles.png");

    //carga de datos
    this.load.json("mapEnvironment", "assets/duel_map_environment.json");
    this.load.json("entities", "assets/entities.json");
  }

  create() {
    let { width, height } = this.sys.game.canvas;
    let scaleRatio = (1.5 * width) / height;
    this.scaleRatio = scaleRatio;

    //map generation
    this.map = this.make.tilemap({ key: "duelMap" });

    var tileset = this.map.addTilesetImage("maptiles", "tiles");

    this.layer = this.map.createStaticLayer("duel", tileset, 0, 0);
    this.layer.setScale(9.84 / this.scaleRatio);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.width * this.map.tileWidth * (9.84 / scaleRatio),
      this.map.height * this.map.tileHeight * (9.84 / scaleRatio)
    );
    this.matter.world.setBounds(
      0,
      0,
      this.map.width * this.map.tileWidth * (9.84 / scaleRatio),
      this.map.height * this.map.tileHeight * (9.84 / scaleRatio)
    );

    //sprite groups
    this.enviromentSprites = this.add.group();
    this.neutralSprites = this.add.group();
    this.buildingSprites = this.add.group();
    this.teamASprites = this.add.group();
    this.teamBSprites = this.add.group();

    //categories and groups
    for (var index = 0; index < 5; index++) {
      this.groups.push(this.matter.world.nextGroup());
    }

    for (var index = 0; index < 6; index++) {
      this.categories.push(this.matter.world.nextCategory());
    }

    //npcs
    this.jungleFactory = new NPCFactory(
      [
        this.cache.json.get("entities").npc["chimera"]
      ],
      [
        {
          x: this.cache.json.get("mapEnvironment").neutral.spawnPoints[0].x,
          y: this.cache.json.get("mapEnvironment").neutral.spawnPoints[0].y,
          spawns: [0],
        },
      ],
      this.groups[2],
      this.categories[0] ^ this.categories[2] ^ this.categories[5] ^ 1
    );
    this.jungleFactory.generateInitialSet(
      this,
      this.neutralSprites,
      9.84 / scaleRatio
    );

    // The player and its settings
    this.teamAHeroManager = new HeroFactory(
      [
        this.cache.json.get("entities").hero["minotaur_warrior"]
      ],
      [{ x: this.cache.json.get("mapEnvironment").team1.spawnPoints[0].x, y: this.cache.json.get("mapEnvironment").team1.spawnPoints[0].y, spawns: [0] }],
      this.groups[0],
      this.categories[1] ^ this.categories[2] ^ this.categories[4] ^ 1
    );
    this.teamAHeroManager.generateInitialSet(
      this,
      this.teamASprites,
      9.84 / scaleRatio
    );

    //enviromental elements
    this.forestManager = new EnviromentalFactory(
      this.cache.json.get("entities").enviromental["tree"],
      this.cache.json.get("mapEnvironment").neutral.trees,
      this.groups[3],
      this.categories[0] ^ this.categories[2] ^ this.categories[5] ^ 1 //4294967295
    );
    this.forestManager.generateInitialSet(this, this.enviromentSprites, "tree1", 9.84 / this.scaleRatio);

    //buildings and alike
    //team 1
    let wallsCoords = this.cache.json.get("mapEnvironment").team1.walls;
    let gatesCoords = this.cache.json.get("mapEnvironment").team1.gates;
    let towersCoords = this.cache.json.get("mapEnvironment").team1.towers;
    let fortsCoords = this.cache.json.get("mapEnvironment").team1.forts;
    let objectiveCoords = this.cache.json.get("mapEnvironment").team1.objective;
    for (var index = 0; index < wallsCoords.length; index++) {
      this.setBuildingSprite(
        this.cache.json.get("entities").building["wall"],
        this.groups[4],
        1,
        this.categories[1] ^ this.categories[2] ^ this.categories[4] ^ 1,
        wallsCoords[index]
      );
    }
    for (var index = 0; index < gatesCoords.length; index++) {
      this.setBuildingSprite(
        this.cache.json.get("entities").building["gate"],
        this.groups[4],
        this.categories[0],
        this.categories[1] ^ this.categories[2] ^ this.categories[4] ^ 1,
        gatesCoords[index]
      );
    }
    for (var index = 0; index < towersCoords.length; index++) {
      this.setBuildingSprite(
        this.cache.json.get("entities").building["tower"],
        this.groups[4],
        1,
        this.categories[1] ^ this.categories[2] ^ this.categories[4] ^ 1,
        towersCoords[index]
      );
    }
    for (var index = 0; index < fortsCoords.length; index++) {
      this.setBuildingSprite(
        this.cache.json.get("entities").building["fort"],
        this.groups[4],
        1,
        this.categories[1] ^ this.categories[2] ^ this.categories[4] ^ 1,
        fortsCoords[index]
      );
    }
    //team 2
    wallsCoords = this.cache.json.get("mapEnvironment").team2.walls;
    gatesCoords = this.cache.json.get("mapEnvironment").team2.gates;
    towersCoords = this.cache.json.get("mapEnvironment").team2.towers;
    fortsCoords = this.cache.json.get("mapEnvironment").team2.forts;
    objectiveCoords = this.cache.json.get("mapEnvironment").team2.objective;
    for (var index = 0; index < wallsCoords.length; index++) {
      this.setBuildingSprite(
        this.cache.json.get("entities").building["wall"],
        this.groups[4],
        1,
        this.categories[0] ^ this.categories[3] ^ this.categories[4] ^ 1,
        wallsCoords[index]
      );
    }
    for (var index = 0; index < gatesCoords.length; index++) {
      this.setBuildingSprite(
        this.cache.json.get("entities").building["gate"],
        this.groups[4],
        this.categories[2],
        this.categories[0] ^ this.categories[3] ^ this.categories[4] ^ 1,
        gatesCoords[index]
      );
    }
    for (var index = 0; index < towersCoords.length; index++) {
      this.setBuildingSprite(
        this.cache.json.get("entities").building["tower"],
        this.groups[4],
        1,
        this.categories[0] ^ this.categories[3] ^ this.categories[4] ^ 1,
        towersCoords[index]
      );
    }
    for (var index = 0; index < fortsCoords.length; index++) {
      this.setBuildingSprite(
        this.cache.json.get("entities").building["fort"],
        this.groups[4],
        1,
        this.categories[0] ^ this.categories[3] ^ this.categories[4] ^ 1,
        fortsCoords[index]
      );
    }

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
    this.input.mouse.disableContextMenu(); //se reactiva en producción
    this.input.on("pointermove", this.adjustPlayerRotation, this);

    //camera
    this.cameras.main.startFollow(this.teamAHeroManager.getPlayer(this.teamASprites), true, 1, 1);
    this.cameras.main.roundPixels = true;
    this.matter.world.on("collisionstart", this.dealDamage, this);
  }

  update() {
    var pointer = this.input.activePointer;

    //se actualizan todas las entidades
    this.teamAHeroManager.onUpdate(this, this.teamASprites, 9.84 / this.scaleRatio);
    this.forestManager.onUpdate(
      this,
      this.enviromentSprites,
      9.84 / this.scaleRatio
    );
    this.jungleFactory.onUpdate(
      this,
      this.neutralSprites,
      9.84 / this.scaleRatio,
      this.clock
    );
    this.onBuildingsUpdate();

    if (this.left.isDown) {
      this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend")
        .moveX(this.teamAHeroManager.getPlayer(this.teamASprites), false, 9.84 / this.scaleRatio);
    } else if (this.right.isDown) {
      this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend")
        .moveX(this.teamAHeroManager.getPlayer(this.teamASprites), true, 9.84 / this.scaleRatio);
    }

    if (this.up.isDown) {
      this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend")
        .moveY(this.teamAHeroManager.getPlayer(this.teamASprites), true, 9.84 / this.scaleRatio);
    } else if (this.down.isDown) {
      this.teamAHeroManager.getPlayer(this.teamASprites)
        .getData("backend")
        .moveY(this.teamAHeroManager.getPlayer(this.teamASprites), false, 9.84 / this.scaleRatio);
    }

    if (this.cancel.isDown) {
      this.lastKeyPressed = "";
    }

    if (pointer.isDown) {
      if (!this.teamAHeroManager.getPlayer(this.teamASprites).anims.isPlaying) {
        switch (this.lastKeyPressed) {
          case "q":
            if (
              this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").curMana >=
              30 + 2 * this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").level
            ) {
              this.teamAHeroManager.getPlayer(this.teamASprites).play(
                "spellq_" + this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").name
              );
              this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").spendMana({
                scene: this,
                amount: -30 - 2 * this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").level,
              });
            } else {
              this.lastKeyPressed = "";
            }
            break;
          case "e":
            if (
              this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").curMana >=
              45 + 7 * this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").level
            ) {
              this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").spendMana({
                scene: this,
                amount: -45 - 7 * this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").level,
              });
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
              this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").curMana >=
              45 + 5 * this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").level
            ) {
              this.teamAHeroManager.getPlayer(this.teamASprites).play(
                "spellr_" + this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").name
              );
              this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").spendMana({
                scene: this,
                amount: -45 - 5 * this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").level,
              });
            } else {
              this.lastKeyPressed = "";
            }
            break;
          default:
            this.teamAHeroManager.getPlayer(this.teamASprites).play("attack_" + this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").name);
            break;
        }
        for(var i = 0; i< this.neutralSprites.children.getArray().length; i++){
          this.neutralSprites.children.getArray()[i].play("attack_" + this.neutralSprites.children.getArray()[i].getData("backend").name);
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
      let labelReader = RegExp(/^(used|attack|projectile)Box\.\w+(\#\d+)?$/);
      if (labelReader.test(this.matter.world.getAllBodies()[index].label)) {
        this.matter.world.remove(this.matter.world.getAllBodies()[index]);
      }
    }

    //se actualza el tiempo transcurrido del juego
    this.clock++;
    this.events.emit("updateClock");
  }

  //funciones no heredadas de la escena

  initialData(){
    return {curHealth: 200,
      maxHealth: 200,
      healthRegen: 0.2,
      curMana: 75,
      maxMana: 75, 
      manaRegen: 0.1,
      damage: 36,
      spellPower: 0,
      magicArmor: 0,
      armor: 0,
      speed: 28,
      atSpeed: 100,
      level: 0,
      xp: 0,
      xpNext: 100,
      gold: 0
    }
  }

  dealDamage(event, bodyA, bodyB) {
    var dealtDamage = { amount: 0, isCrit: false };
    let labelReader = RegExp(/^(bounty|attack|projectile|aoe)Box\.\w+(\#\d+)?$/);

    if (labelReader.test(bodyA.label) && !labelReader.test(bodyB.label)) {
      switch(bodyB.label.split(".")[0]){
        case "attackBox":
          let factory = this.getRelatedFactory(bodyB.collisionFilter.group, bodyB.gameObject.getData("backend") instanceof Hero);
      dealtDamage = bodyB.gameObject.getData("backend").takeDamage({
        scene: this,
        sprite: bodyB.gameObject,
        body: bodyB,
        group: this.getRelatedGroup(bodyB.collisionFilter.group),
        factory: factory,
        scaleRatio: 9.84 / this.scaleRatio,
        amount: this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").damage,
        type: 1,
        accuracy: this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").accuracy,
        critChance: this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").crit,
        critMultiplier: this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").getCritMultiplier(),
        avoidable: true,
        critable: true,
        ranged: this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").getRanged(),
        attacker: bodyA.label.split(".")[1],
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
          break;
        case "bountyBox":
          console.log("colisionaron:");
          for(var i = 0; i < event.pairs.length; i++){
            console.log(event.pairs[i].bodyB);
            if(event.pairs[i].bodyB.gameObject.getData("backend") instanceof Hero){
              event.pairs[i].bodyB.gameObject.getData("backend").gainXP({scene: this, amount: event.pairs[i].bodyA.onCollideEndCallback(0, 0, 0)[0]});
              if(event.pairs[i].bodyA.label.split("#")[1] == "1"){
                event.pairs[i].bodyB.gameObject.getData("backend").earnGold({scene: this, amount: event.pairs[i].bodyA.onCollideEndCallback(0, 0, 0)[1]});
              }
            }
          }
          bodyA.label = "usedBox." + bodyA.label.split(".")[1];
          break;
        case "aoeBox":
          break;
        case "projectileBox":
          break;
      }
    } else if (labelReader.test(bodyB.label) && !labelReader.test(bodyA.label)) {
      switch(bodyB.label.split(".")[0]){
        case "attackBox":
          let factory = this.getRelatedFactory(bodyA.collisionFilter.group, bodyA.gameObject.getData("backend") instanceof Hero);
          dealtDamage = bodyA.gameObject.getData("backend").takeDamage({
            scene: this,
            sprite: bodyA.gameObject,
            body: bodyA,
            group: this.getRelatedGroup(bodyA.collisionFilter.group),
            factory: factory,
            scaleRatio: 9.84 / this.scaleRatio,
            amount: this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").damage,
            type: 1,
            accuracy: this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").accuracy,
            critChance: this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").crit,
            critMultiplier: this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").getCritMultiplier(),
            avoidable: true,
            critable: true,
            ranged: this.teamAHeroManager.getPlayer(this.teamASprites).getData("backend").getRanged(),
            attacker: bodyB.label.split(".")[1],
          });
          //mostrar texto de daño
          if(bodyA.gameObject != null){
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
            console.log(
              bodyA.gameObject.getData("backend").name,
              "got hit by",
              bodyA.gameObject.getData("backend").lastHitBy
            );
          }
          this.matter.world.remove(bodyB);
          break;
        case "bountyBox":
          console.log("colisionaron:");
          for(var i = 0; i < event.pairs.length; i++){
            console.log(event.pairs[i].bodyA);
            if(event.pairs[i].bodyA.gameObject.getData("backend") instanceof Hero){
              event.pairs[i].bodyA.gameObject.getData("backend").gainXP({scene: this, amount: event.pairs[i].bodyB.onCollideEndCallback(0, 0, 0)[0]});
              if(event.pairs[i].bodyB.label.split("#")[1] == "1"){
                event.pairs[i].bodyA.gameObject.getData("backend").earnGold({scene: this, amount: event.pairs[i].bodyB.onCollideEndCallback(0, 0, 0)[1]});
              }
            }
          }
          bodyB.label = "usedBox." + bodyB.label.split(".")[1];
          break;
        case "aoeBox":
          break;
        case "projectileBox":
          break;
      }
      
    }
    console.log("body A:", bodyA.label, ", body B:", bodyB.label);
  }

  getRelatedGroup(group){
    switch(group){
      case this.groups[0]:
        return this.teamASprites;
      case this.groups[1]:
        return this.teamBSprites;
      case this.groups[2]:
        return this.neutralSprites;
      case this.groups[3]:
        return this.enviromentSprites;
      case this.groups[4]:
        return this.buildingSprites;
    }
  }

  getRelatedFactory(group, isHero){
    switch(group){
      case this.groups[0]:
        if(isHero){
          return this.teamAHeroManager;
        }else{
          return this.teamANPCManager
        }
      case this.groups[1]:
        if(isHero){
          return this.teamBHeroManager;
        }else{
          return this.teamBNPCManager
        }
      case this.groups[2]:
        return this.jungleFactory;
      case this.groups[3]:
        return this.EnviromentalFactory;
      case this.groups[4]:
        return null;
    }
  }

  adjustPlayerRotation(pointer) {
    var camera = this.cameras.main;
    var angle =
      -90 +
      Phaser.Math.RAD_TO_DEG *
        Phaser.Math.Angle.Between(
          this.teamAHeroManager.getPlayer(this.teamASprites).x,
          this.teamAHeroManager.getPlayer(this.teamASprites).y,
          pointer.x + camera.scrollX,
          pointer.y + camera.scrollY
        );
        this.teamAHeroManager.getPlayer(this.teamASprites).setAngle(angle);
  }

  setBuildingSprite(params, group, category, mask, coords) {
    var sprite = this.matter.add.sprite(
      coords.x * (9.84 / this.scaleRatio),
      coords.y * (9.84 / this.scaleRatio),
      params.name,
      null,
      {
        isStatic: true,
        shape: {
          type: "rectangle",
          width: params.width,
          height: params.heigth,
        },
      }
    );
    sprite.setScale(9.84 / this.scaleRatio);
    sprite.setData(
      "backend",
      new Building(
        params.name,
        1,
        params.xpFactor,
        params.bountyFactor,
        params.damage,
        params.armor,
        params.health,
        params.healthRegen,
        params.atSpeed,
        params.accuracy,
        params.magicArmor,
        params.ranged,
        params.range,
        1
      )
    );
    sprite.setData(
      "displayDamage",
      this.add
        .text(
          coords.x * (9.84 / this.scaleRatio),
          coords.y * (9.84 / this.scaleRatio),
          "",
          { font: "48px Arial", fill: "#eeeeee" }
        )
        .setDepth(1)
        .setData("timer", 0)
        .setScale(0.2 * (9.84 / this.scaleRatio))
    );
    sprite.body.label = "building";
    sprite.setCollisionGroup(group);
    sprite.setCollisionCategory(category);
    sprite.setCollidesWith(mask);
    sprite.setDepth(0.8);
    sprite.setAngle(coords.rotation);
    this.buildingSprites.add(sprite);
  }

  onBuildingsUpdate() {
    this.buildingSprites.children.each(function (entity) {
      if (entity.getData("displayDamage").data.values.timer > 0) {
        entity.getData("displayDamage").data.values.timer--;
      } else {
        entity.getData("displayDamage").setVisible(false);
      }
    });
  }
}
