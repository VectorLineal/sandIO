import Building from "./Building.js";

export default class EnviromentalFactory {
    constructor(name, armor, maxHealth, magicArmor, spawnPoints, entityWidth, entityHeight) {
      this.name = name;
      this.spawnPoints = spawnPoints;
      this.maxHealth = maxHealth;
      this.armor = armor;
      this.magicArmor = magicArmor;
      this.entityWidth = entityWidth;
      this.entityHeight = entityHeight;
    }
  
    generateEnviromentalElement(level) {
      return new Building(this.name, level, 10, 1, this.armor, this.maxHealth, 0, 0, 0, this.magicArmor, false, 0, 0);
    }

    setRespawn(time, position){
      this.spawnPoints[position].time = time;
    }

    onUpdate(scene, group, scaleRatio){
      let width = this.entityWidth;
      let height = this.entityHeight;
      let label = this.name;

      group.children.each(function(entity){
        if(entity.getData("respawnTimer").time > 0){
          entity.getData("respawnTimer").time--;
        }else{
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
            entity.getData("backend").curHealth = entity.getData("backend").maxHealth;
          }
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
        var sprite = scene.matter.add.sprite(this.spawnPoints[index].x, this.spawnPoints[index].y, spriteKey, null, {
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
        sprite.setData("displayDamage", scene.add.text(this.spawnPoints[index].x, this.spawnPoints[index].y, "", { font: '48px Arial', fill: '#eeeeee' }).setData("timer", 0));
        sprite.body.label = this.name;
        group.add(sprite);
      }
    }
  }
  