//
// This file contains the Walking Sim subgame which is used to test maps.
//
// Copyright 2023 Alpha Zoo LLC.
// Written by Matthew Carlin
//


class WalkingSim extends Screen {
  // Set up the game board
  initialize() {
    this.state = null;

    freefalling = [];
    shakers = [];

    this.characters = [];

    this.layers = {};
    let layers = this.layers;

    this.terrain = {};
    let terrain = this.terrain;

    this.illegal_area_polygons = [];

    this.config = world_config["swizzle"];

    let background_color = makeBlank(this, game.width, game.height, 0, 0);
    background_color.tint = 0x82a64f;

    this.map = new PIXI.Container();
    this.addChild(this.map);




    layers["ground"] = new PIXI.Container();
    this.map.addChild(layers["ground"]);
    layers["objects"] = new PIXI.Container();
    this.map.addChild(layers["objects"]);
    layers["effects"] = new PIXI.Container();
    this.map.addChild(layers["effects"]);
    layers["display"] = new PIXI.Container();
    this.map.addChild(layers["display"]);

    // this.map.scale.set(0.8, 0.8);

    this.terrain = [];

    this.addMap();
    this.addCharacters();
    this.addAnimations();

    let font_16 = {fontFamily: "Bebas Neue", fontSize: 16, fill: 0x000000, letterSpacing: 2, align: "left"};
    this.info_text = makeText("Something", font_16, layers["display"], 20, 20, 0, 0);

    this.state = "active";
    // this.state = "pre_game";

    // delay(() => {
    //   paused = false;
    //   pause_time = 0;
    //   this.start_time = markTime();
    //   this.state = "active";
    // }, 500);
  }

  // Read the level config file and add the map.
  addMap() {
    let layers = this.layers;

    this.file_list = window.fileList(asset_directory);
    this.assets = [];
    for (let i = 0; i < this.file_list.length; i++) {
      if (this.file_list[i].includes(".psd")) {
        this.assets.push(this.file_list[i].replace(".psd",""));
      }
    }

    let span = 512;
    for (let i = 0; i < this.assets.length; i++) {
      console.log("adding asset");
      let asset = this.assets[i];

      let x = span * i * 0.866;
      let y = span * i * 0.5;
      //let ground = makeSprite(asset_directory + "/" + asset + "_0.png", layers["ground"], span * i * 0.866, span * i * 0.5, 0, 0, true);
      
      let asset_path = asset_directory + "/" + asset + ".json";

      let data = null;
      if (window.checkFile(asset_path) === true) {
        console.log("reading data");
        data = JSON.parse(window.readFile(asset_path));
      }

      let polygons = data.polygons;
      console.log(data);
      makeSprite(asset_directory + "/" + asset + "_0.png", layers["ground"], x, y, 0, 0, true);
      for (const [i, value] of Object.entries(polygons)) {
        console.log("adding an object?");
        if (polygons[i].length > 0)
        {
          console.log("yes");
          let terrain_object = makeSprite(asset_directory + "/" + asset + "_" + i + ".png", layers["objects"], x, y, 0, 0, true);
          
          terrain_object.polygon = [];
          terrain_object.min_x = null;
          terrain_object.max_x = null;
          terrain_object.min_y = null;
          terrain_object.max_y = null;
          let polygon = polygons[i][0].data;

          terrain_object.name = asset + "_" + i;

          let new_illegal = [];
          for (let j = 0; j < polygon.length; j += 2) {
            terrain_object.polygon.push([polygon[j] + x, polygon[j+1] + y]);

            if (terrain_object.min_x == null || polygon[j] + x < terrain_object.min_x) terrain_object.min_x = polygon[j] + x
            if (terrain_object.max_x == null || polygon[j] + x > terrain_object.max_x) terrain_object.max_x = polygon[j] + x
            if (terrain_object.min_y == null || polygon[j+1] + y < terrain_object.min_y) terrain_object.min_y = polygon[j+1] + y
            if (terrain_object.max_y == null || polygon[j+1] + y > terrain_object.max_y) terrain_object.max_y = polygon[j+1] + y
          }

          this.terrain.push(terrain_object);
          this.illegal_area_polygons.push(terrain_object.polygon)
        }        
      }
    }

    // let test_element = makeSprite("Art/Town_Elements/composition_01.png", layers["ground"], -200, -2700, 0, 0, true)
    // test_element.scale.set(0.8, 0.8);
  }


  // Read the level config file and add any preset characters.
  addCharacters() {
    let layers = this.layers;

    this.player = game.makeCharacter("black_bear");
    this.player.scale.set(0.66, 0.66);
    this.player.position.set(this.config.start[0], this.config.start[1])
    layers["objects"].addChild(this.player);

    // for (let i = 0; i < this.config.characters.length; i++) {
    //   let [name, behavior, x, y] = this.config.characters[i];

    //   let character = this.makeCharacter(name);
    //   character.position.set(x, y);
    //   character.player_owned = false;
    //   layers["character"].addChild(character);
    //   character.setState(behavior);
    //   this.characters.push(character);
    // }

    this.player_ghost = game.makeCharacter("brown_bear_ghost");
    this.player_ghost.scale.set(0.66, 0.66);
    layers["effects"].addChild(this.player_ghost);

    this.updateGhost();

    this.sortObjectLayer();
  }


  // Read the level config file and add any animations, such as billboards, butterflies and cats.
  addAnimations() {
    // let terrain = this.terrain;
    // let layers = this.layers;

    // this.animations = [];

    // for (let i = 0; i < this.config.animations.length; i++) {
    //   let [name, layer, x, y, speed, delay_time] = this.config.animations[i];

    //   let animation = makeAnimatedSprite("Art/CPE/Animations/" + name + ".json", null, layers[layer], x, y);
    //   animation.name = name;
    //   if (animation.name.includes("butterfly")) {
    //     let angle = dice(358) + 1;
    //     animation.vx = Math.cos(angle * Math.PI / 180);
    //     animation.vy = Math.sin(angle * Math.PI / 180);
    //   }
    //   if (delay_time > 0) {
    //     animation.onLoop = function() {
    //       animation.stop();
    //       delay(function() {animation.play()}, delay_time);
    //     }
    //   }
    //   animation.animationSpeed = speed;
    //   animation.play();
    //   this.animations.push(animation);
    // }
  }


  // Handle keys
  keyDown(ev) {
    if (this.state == "none") return;

    let key = ev.key;

    // key pressy things like pause
  }


  // Update the player
  updatePlayer() {
    let self = this;
    let keymap = game.keymap;
    let player = this.player;

    if (keymap["ArrowUp"] && keymap["ArrowRight"]) {
      player.direction = "upright";
    } else if (keymap["ArrowUp"] && keymap["ArrowLeft"]) {
      player.direction = "upleft";
    } else if (keymap["ArrowDown"] && keymap["ArrowRight"]) {
      player.direction = "downright";
    } else if (keymap["ArrowDown"] && keymap["ArrowLeft"]) {
      player.direction = "downleft";
    } else if (keymap["ArrowDown"]) {
      player.direction = "down";
    } else if (keymap["ArrowUp"]) {
      player.direction = "up";
    } else if (keymap["ArrowLeft"]) {
      player.direction = "left";
    } else if (keymap["ArrowRight"]) {
      player.direction = "right";
    } else {
      player.direction = null;
    }

    if (player.direction != null && this.testMove(player.x, player.y, player.direction)) {
      if (player.direction != null) {
        player.move();
        this.updateGhost();

        this.sortObjectLayer();
      }
    }
  }


  updateGhost() {
    this.player_ghost.x = this.player.x;
    this.player_ghost.y = this.player.y;
    this.player_ghost.direction = this.player.direction;
    this.player_ghost.updateDirection();
    this.player_ghost.character_sprite[this.player_ghost.direction].gotoAndStop(
      this.player.character_sprite[this.player.direction].currentFrame
    );
  }


  testMove(x, y, direction) {
    let point = this.player.computeStep(x, y, direction);
    console.log(point);
    for (let i = 0; i < this.illegal_area_polygons.length; i++) {
      if (pointInsidePolygon(point, this.illegal_area_polygons[i])) return false;
    }

    return true;
  }


  sortObjectLayer() {
    let layers = this.layers;
    let player = this.player;

    layers["objects"].removeChildren();

    // layers["objects"].addChild(player);

    let added_character = false;

    for (let i = 0; i < this.terrain.length; i++) {
      let terrain = this.terrain[i];

      if (!added_character) {

        if (player.y < terrain.min_y) {
          added_character = true;
          console.log("adding character because above min for " + terrain.name)
          layers["objects"].addChild(player);
          layers["objects"].addChild(terrain);
        } else if (player.y > terrain.max_y || player.x < terrain.min_x || player.x > terrain.max_x) {
          layers["objects"].addChild(terrain);
        } else {
          // test the polygon up and down a few steps

          // for (let d = 10; d <= 70; d += 10) {
          //   let p1 = [player.x, player.y - d];
          //   if (pointInsidePolygon(p1, terrain.polygon)) {
          //     layers["objects"].addChild(terrain);
          //     break;
          //   }
          //   let p2 = [player.x, player.y + d];
          //   if (pointInsidePolygon(p2, terrain.polygon)) {
          //     added_character = true;
          //     console.log("adding character because ray cast into polygon for " + terrain.name)
          //     layers["objects"].addChild(player);
          //     layers["objects"].addChild(terrain);
          //     break;
          //   }
          // }

          let added_terrain = false;
          for (let d = player.y + 10; d <= terrain.max_y; d += 10) {
            let p2 = [player.x, d];
            if (pointInsidePolygon(p2, terrain.polygon)) {
              added_character = true;
              console.log("adding character because ray cast into polygon for " + terrain.name)
              layers["objects"].addChild(player);
              layers["objects"].addChild(terrain);
              added_terrain = true;
              break;
            }
          }

          if (!added_terrain) layers["objects"].addChild(terrain);
        }
      } else {
        layers["objects"].addChild(terrain)   
      }      
    }

    if (!added_character) {
      console.log("adding character at the end by default")
      layers["objects"].addChild(player);
    }

    console.log("Terrain layer length is " + layers["objects"].children.length)
  }



  // Update the screen to match the player position
  updateScreen() {
    let layers = this.layers;

    if (this.state == "none") return;

    const screen_acceleration = 3.5;
    const screen_max_speed = 18;
    
    for (const item of ["ground", "objects", "effects", "display"]) {
      layers[item].x = (game.width/2 - this.player.x)
      layers[item].y = (game.height/2 - this.player.y)
    }
  }


  // // Move the screen according to the arrow keys.
  // // By moving the layers, it appears as though we're moving around the level.
  moveScreen(fractional) {
    let keymap = game.keymap;
    let layers = this.layers;

    if (this.state == "none") return;

    const screen_acceleration = 3.5;
    const screen_max_speed = 18;

    if (keymap["ArrowRight"]) {
      this.screen_vx += screen_acceleration;
      if (this.screen_vx > screen_max_speed) this.screen_vx = screen_max_speed;
    }
    if (keymap["ArrowLeft"]) {
      this.screen_vx -= screen_acceleration;
      if (this.screen_vx < -screen_max_speed) this.screen_vx = -screen_max_speed;
    }
    if (keymap["ArrowUp"]) {
      this.screen_vy -= screen_acceleration;
      if (this.screen_vy < -screen_max_speed) this.screen_vy = -screen_max_speed;
    }
    if (keymap["ArrowDown"]) {
      this.screen_vy += screen_acceleration;
      if (this.screen_vy > screen_max_speed) this.screen_vy = screen_max_speed;
    }
    
    for (const item of ["ground", "objects", "effects", "display"]) {
      layers[item].x -= this.screen_vx * fractional;
      layers[item].y -= this.screen_vy * fractional;

      if (layers[item].x < 2 * (game.width/2 - this.level_width)) {
        layers[item].x = 2 * (game.width/2 - this.level_width);
      }
      if (layers[item].x > 0) {
        layers[item].x = 0;
      }

      if (layers[item].y < 2 * (game.height/2 - this.level_height)) {
        layers[item].y = 2 * (game.height/2 - this.level_height);
      }
      if (layers[item].y > 0) {
        layers[item].y = 0;
      }
    }

    this.screen_vx *= 0.93;
    this.screen_vy *= 0.93;
  }


  update(diff) {
    let fractional = diff / (1000/30.0);

    shakeDamage();
    freeeeeFreeeeeFalling(fractional);

    if (this.state != "active") return;

    this.updatePlayer();
    this.updateScreen();
  }
}














