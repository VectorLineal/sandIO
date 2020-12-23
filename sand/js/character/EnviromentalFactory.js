import Building from "./Building.js";

export default class EnviromentalFactory {
    constructor(params, spawnPoints, group, mask) {
      this.name = params.name;
      this.spawnPoints = spawnPoints;
      this.maxHealth = params.maxHealth;
      this.armor = params.armor;
      this.magicArmor = params.magicArmor;
      this.entityWidth = params.entityWidth;
      this.entityHeight = params.entityHeight;
      this.group = group;
      this.mask = mask;
    }
  
    generateEnviromentalElement(level) {
      return new Building(this.name, level, 10, 0, 1, this.armor, this.maxHealth, 0, 0, 0, this.magicArmor, false, 0, 0);
    }

    onUpdate(scene, group, scaleRatio){
      let width = this.entityWidth;
      let height = this.entityHeight;
      let label = this.name;
      let cGroup = this.group;
      let mask = this.mask;

      group.children.each(function(entity){
        if(entity.getData("respawnTimer").time > 0){
          entity.getData("respawnTimer").time--;
        }else if(entity.getData("respawnTimer").time == 0){ //aqui se hace respawn
          entity.setFrame(0);
          if(!scene.matter.world.has(entity.body)){
            var body = scene.matter.add.rectangle(entity.x, entity.y, width * scaleRatio, height * scaleRatio,
              {
                label: label,
                isStatic: true,
                render: { visible: true, lineColor: 0x00ff00 },
              }
            )
            body.gameObject = entity;
            entity.body = body;
            entity.getData('backend').curHealth = entity.getData('backend').getMaxHealth();
            entity.setCollisionGroup(cGroup);
            entity.setCollidesWith(mask);
            entity.setDepth(0.8);
          }
          entity.getData("respawnTimer").time = -1;
        }

        if(!entity.getData('backend').isDead()){
          entity.getData('backend').applyHealthRegen({scene: scene});
        }

        if(entity.getData("displayDamage").data.values.timer > 0){
          entity.getData("displayDamage").data.values.timer--;
        }else{
          entity.getData("displayDamage").setVisible(false);
        }
      });
    }

    generateInitialSet(scene, group, spriteKey, scaleRatio){
      for(var index = 0; index < this.spawnPoints.length; index++){
        var sprite = scene.matter.add.sprite(this.spawnPoints[index].x * scaleRatio, this.spawnPoints[index].y * scaleRatio, spriteKey, null, {
          isStatic: true,
          shape: {
            type: "rectangle",
            width: this.entityWidth,
            height: this.entityHeight,
          },
        });
        sprite.setScale(scaleRatio);
        sprite.setData("backend", this.generateEnviromentalElement(1));
        sprite.setData("respawnTimer", {time: 0});
        sprite.setData("displayDamage", scene.add.text(this.spawnPoints[index].x * scaleRatio, this.spawnPoints[index].y * scaleRatio, "", { font: '48px Arial', fill: '#eeeeee' }).setDepth(1).setData("timer", 0).setScale(0.2 * scaleRatio));
        sprite.setData("status", scene.add.group());
        sprite.body.label = this.name;
        sprite.setCollisionGroup(this.group);
        sprite.setCollidesWith(this.mask);
        sprite.setDepth(0.8);
        group.add(sprite);
      }
    }
  }
  