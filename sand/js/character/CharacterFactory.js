import {randomInt} from "../main_layer/MathUtils.js";

export default class CharacterFactory{
    constructor(properties, spawnProperties, group, mask) {
        this.spriteProperties = properties; //se refiere a un arreglo de septuplas tipo {name, width, height, frameWidth, frameHeight, centerX, centerY, character}
        this.group = group;
        this.mask = mask;
        this.spawnProperties = []; //spawns se refiere a los índices del arreglo properties, indica posibles NPCs que pueden spawnear en esete punto
        for(var index = 0; index < spawnProperties.length; index++){
          this.spawnProperties.push({spawnX: spawnProperties[index].x, spawnY: spawnProperties[index].y, spawns: spawnProperties[index].spawns, timer: -1}); 
        }
    }

    searchIndex(x, y){
        for(var index = 0; index < this.spawnProperties.length; index++){
          if(this.spawnProperties[index].spawnX == x && this.spawnProperties[index].spawnY == y){
            return index;
          }
        }
    
        console.log("el elemento {", x, ",", y, "} no se encuentra en la lista de puntos de respawn.");
        return -1;
    }

    kill(spawnPoint, respawnTime, respawnTimeDelta){
        let position = this.searchIndex(spawnPoint.x, spawnPoint.y);
        if(position == -1){
          return;
        }
        this.spawnProperties[position].timer = respawnTime + randomInt(respawnTimeDelta);
    }

    generateLogic(propertie, spawnPoint) {}

    generateSprite(scene, group, scaleRatio, propertie, index){
        if(!propertie.centerX && !propertie.centerY){
          var sprite = scene.matter.add.sprite(this.spawnProperties[index].spawnX * scaleRatio, this.spawnProperties[index].spawnY * scaleRatio, propertie.name, null, {
            shape: {
              type: "rectangle",
              width: propertie.width,
              height: propertie.height,
            },
            render: {
              sprite: {
                xOffset: (propertie.frameWidth - propertie.width - 1 + propertie.width / 2) / propertie.frameWidth - 0.5,
                yOffset: -((propertie.frameHeight - propertie.height - 1) / 2 / propertie.frameHeight),
              },
            },
          });
        }else if(propertie.centerX && !propertie.centerY){
          var sprite = scene.matter.add.sprite(this.spawnProperties[index].spawnX * scaleRatio, this.spawnProperties[index].spawnY * scaleRatio, propertie.name, null, {
            shape: {
              type: "rectangle",
              width: propertie.width,
              height: propertie.height,
            },
            render: {
              sprite: {
                yOffset: -((propertie.frameHeight - propertie.height - 1) / 2 / propertie.frameHeight)
              },
            },
          });
        }else if(!propertie.centerX && propertie.centerY){
          var sprite = scene.matter.add.sprite(this.spawnProperties[index].spawnX * scaleRatio, this.spawnProperties[index].spawnY * scaleRatio, propertie.name, null, {
            shape: {
              type: "rectangle",
              width: propertie.width,
              height: propertie.height,
            },
            render: {
              sprite: {
                xOffset: (propertie.frameWidth - propertie.width - 1 + propertie.width / 2) / propertie.frameWidth - 0.5
              },
            },
          });
        }else{
          var sprite = scene.matter.add.sprite(this.spawnProperties[index].spawnX * scaleRatio, this.spawnProperties[index].spawnY * scaleRatio, propertie.name, null, {
            shape: {
              type: "rectangle",
              width: propertie.width,
              height: propertie.height,
            },
          });
        }
        sprite.setScale(scaleRatio);
        sprite.setData("backend", this.generateLogic(propertie, {x: this.spawnProperties[index].spawnX, y: this.spawnProperties[index].spawnY}));
        sprite.setData("displayDamage", scene.add.text(sprite.x, sprite.y, "", { font: '48px Arial', fill: '#eeeeee' }).setDepth(1).setData("timer", 0).setScale(0.2 * scaleRatio));
        sprite.body.label = propertie.name;
        sprite.setCollisionGroup(this.group);
        sprite.setCollidesWith(this.mask);
        sprite.setDepth(0.5);
        group.add(sprite);
    }

    generateInitialSet(scene, group, scaleRatio){
        for(var index = 0; index < this.spawnProperties.length; index++){
          let creatureIndex = randomInt(this.spawnProperties[index].spawns.length);
          this.generateSprite(scene, group, scaleRatio, this.spriteProperties[this.spawnProperties[index].spawns[creatureIndex]], index);
        }
    }

    respawn(params, index){
        let creatureIndex = randomInt(this.spawnProperties[index].spawns.length);
        this.generateSprite(params.scene, params.group, params.scaleRatio, this.spriteProperties[this.spawnProperties[index].spawns[creatureIndex]], index, creatureIndex);
        this.spawnProperties[index].timer = -1;
    }

    //funciones sobre eventos
    onUpdate(scene, group, scaleRatio){
        //se actualizna los tiempos de respawn y en tal caso de cumplirse alguno, se hace respawn
        for(var index = 0; index < this.spawnProperties.length; index++){
            if(this.spawnProperties[index].timer > 0){
                this.spawnProperties[index].timer--;
            }else if(this.spawnProperties[index].timer == 0){
                //se hace respawn del personaje
                this.respawn({scene: scene, group: group, scaleRatio: scaleRatio}, index);
            }
        }
        group.children.each(function(entity){
            //se actualiza la regeneración de salud y mana
            entity.getData('backend').applyHealthRegen({});
            entity.getData('backend').applyManaRegen({});
            
            //se actualizan los display de daño
            if(entity.getData("displayDamage").data.values.timer > 0){
                entity.getData("displayDamage").data.values.timer--;
            }else{
                entity.getData("displayDamage").setVisible(false);
            }
        });
    }
}