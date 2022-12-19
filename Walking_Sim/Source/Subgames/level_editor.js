//
// This file contains the Walking Sim subgame which is used to test maps.
//
// Copyright 2023 Alpha Zoo LLC.
// Written by Matthew Carlin
//


let exterior_directory = "./Art/Exteriors";
let road_directory = "../Design/Roads";
let map_directory = "../Design/Maps";
let map_name = "oneson";

class LevelEditor extends Screen {
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


    this.road_elements = [];
    this.exterior_elements = [];

    this.illegal_area_polygons = [];

    this.config = world_config["swizzle"];

    let background_color = makeBlank(this, game.width, game.height, 0, 0);
    background_color.tint = 0xA0D2A2;

    this.map = new PIXI.Container();
    this.addChild(this.map);

    layers["roads"] = new PIXI.Container();
    this.map.addChild(layers["roads"]);
    layers["ground"] = new PIXI.Container();
    this.map.addChild(layers["ground"]);
    layers["objects"] = new PIXI.Container();
    this.map.addChild(layers["objects"]);
    layers["effects"] = new PIXI.Container();
    this.map.addChild(layers["effects"]);
    
    layers["display"] = new PIXI.Container();
    this.addChild(layers["display"]);

    // this.map.scale.set(0.8, 0.8);

    this.terrain = [];

    let font_16 = {fontFamily: "Bebas Neue", fontSize: 16, fill: 0x000000, letterSpacing: 2, align: "left"};
    this.count_text = makeText("", font_16, layers["display"], 20, 20, 0, 0);
    this.info_text = makeText("Something", font_16, layers["display"], 20, 40, 0, 0);

    this.loadMap();
    this.addCharacters();

    this.road_files = window.fileList(road_directory).filter((item) => {return !item.includes("Store") && item.includes(".png")}).map((item) => {return item.replace(".png","")});
    let exteriors = window.fileList(exterior_directory).filter((item) => {return !item.includes("Store") && item.includes(".json")}).map((item) => {return item.replace(".json","")});
    this.exterior_files = [];
    for (let i = 0; i < exteriors.length; i++) {
      let name = exteriors[i];
      let found = false;
      for (let j = 0; j < this.exterior_elements.length; j++) {
        if (this.exterior_elements[j].name == name) {
          found = true;
          break;
        }
      }
      if (!found) {
        this.exterior_files.push(exteriors[i]);
      }
    }

    this.new_item = null;
    this.new_item_selection = 0;

    this.state = "roads";
  }


  // Read the level config file and add any preset characters.
  addCharacters() {
    let layers = this.layers;

    this.player = game.makeCharacter("black_bear");
    this.player.scale.set(0.66, 0.66);
    this.player.position.set(this.config.start[0], this.config.start[1])
    layers["objects"].addChild(this.player);

    this.player_ghost = game.makeCharacter("brown_bear_ghost");
    this.player_ghost.scale.set(0.66, 0.66);
    layers["effects"].addChild(this.player_ghost);

    this.updateGhost();

    this.sortObjectLayer();
  }


  addExteriorObjects(name, reverse, x, y) {
    //add the tops and such
    let layers = this.layers;
    let player = this.player;
    let asset_path = exterior_directory + "/" + name + ".json";

    let data = null;
    if (window.checkFile(asset_path) === true) {
      console.log("reading data");
      data = JSON.parse(window.readFile(asset_path));
    }
    console.log(data);

    let polygons = data.polygons;
    let terrain_width = data.width;
    let terrain_height = data.height;

    let return_objects = [];

    for (const [j, value] of Object.entries(polygons)) {
      if (j > 0 && polygons[j].length > 0)
      {
        let terrain_object = makeSprite(asset_directory + "/" + name + "_" + j + ".png", layers["objects"], x, y, 0.5, 0.5, true);
        
        if (reverse) terrain_object.scale.set(-1, 1);

        terrain_object.polygon = [];
        terrain_object.flat_polygon = [];
        terrain_object.min_x = null;
        terrain_object.max_x = null;
        terrain_object.min_y = null;
        terrain_object.max_y = null;
        let polygon = polygons[j][0].data;

        terrain_object.name = name + "_" + j;

        let new_illegal = [];
        for (let k = 0; k < polygon.length; k += 2) {
          let n_x = polygon[k] - terrain_width/2 + x;
          let n_y = polygon[k+1] - terrain_height/2 + y;
          if (reverse) {
            n_x = terrain_width/2 + x - polygon[k];
            n_y = polygon[k+1] - terrain_height/2 + y;
          }
          terrain_object.polygon.push([n_x, n_y]);
          terrain_object.flat_polygon.push(n_x);
          terrain_object.flat_polygon.push(n_y);

          if (terrain_object.min_x == null || n_x < terrain_object.min_x) terrain_object.min_x = n_x
          if (terrain_object.max_x == null || n_x > terrain_object.max_x) terrain_object.max_x = n_x
          if (terrain_object.min_y == null || n_y < terrain_object.min_y) terrain_object.min_y = n_y
          if (terrain_object.max_y == null || n_y > terrain_object.max_y) terrain_object.max_y = n_y
        }

        let draw_first_polygon = false;
        if (draw_first_polygon == true && j == 1) {
          let graphics = new PIXI.Graphics();
          graphics.beginFill(0xFFFFFF, 0.25);
          graphics.drawPolygon(terrain_object.flat_polygon);
          graphics.endFill();
          layers["effects"].addChild(graphics);
        }

        return_objects.push(terrain_object);
        this.terrain.push(terrain_object);
        this.illegal_area_polygons.push(terrain_object.polygon)
      }        
    }

    return return_objects;
  }


  // Handle keys
  keyDown(ev) {
    if (this.state == "none") return;

    let player = this.player;
    let layers = this.layers;
    let key = ev.key;

    // key pressy things like pause

    let files = this.road_files;
    let length = files.length;
    let layer = layers["roads"];
    let directory = road_directory;
    let elements = this.road_elements;
    if (this.state == "exteriors") {
      files = this.exterior_files;
      length = files.length
      layer = layers["ground"];
      directory = exterior_directory;
      elements = this.exterior_elements;
    }

    if (key === " ") {
      let item = files[this.new_item_selection];
      let name = directory + "/" + item + ".png";
      if (this.state == "exteriors") name = directory + "/" + item + "_0.png"
      this.new_item = makeSprite(name, layer, player.x, player.y, 0.5, 0.5, false);
      this.new_item.name = item;
      this.new_item.reversed = false;
    }

    if (this.new_item != null && (key === "[" || key === "]")) {
      if (key === "[") this.new_item_selection = (this.new_item_selection + length - 1) % length;
      if (key === "]") this.new_item_selection = (this.new_item_selection + length + 1) % length;
  
      layer.removeChild(this.new_item);
      let item = files[this.new_item_selection];
      let name = directory + "/" + item + ".png"
      if (this.state == "exteriors") name = directory + "/" + item + "_0.png"
      this.new_item = makeSprite(name, layer, player.x, player.y, 0.5, 0.5, false);
      this.new_item.name = item;
      this.new_item.reversed = false;
    }

    if (this.new_item != null && key === "r") {
      this.new_item.scale.x *= -1;
      this.new_item.reversed = (this.new_item.scale.x < 0);
    }

    if (key === "p") {
      this.state = (this.state == "roads") ? "exteriors" : "roads";

      this.info_text.text = "Switching to " + this.state;
      delay(() => {
        this.info_text.text = "";
      }, 2000);
    }

    if (key === "m") {
      this.saveMap();
    }


    if (key === "Escape" && this.selected_element != null) {
      this.info_text.text = "Deselected " + this.selected_element.name;
      delay(() => {
        this.info_text.text = "";
      }, 2000);

      this.selected_element = null;
      this.sortLayer(this.road_elements, "roads");
      this.sortLayer(this.exterior_elements, "ground", true);
      this.sortObjectLayer();
    }


    // if (this.selected_element == null && elements.length > 0) {
    //   if (key === "Backspace") {
    //     let x = elements.pop();
    //     layer.removeChild(x);
    //   }

    //   if (key === "w") {
    //     elements[elements.length - 1].y -= 1;
    //   }

    //   if (key === "s") {
    //     elements[elements.length - 1].y += 1;
    //   }

    //   if (key === "a") {
    //     elements[elements.length - 1].x -= 1;
    //   }

    //   if (key === "d") {
    //     elements[elements.length - 1].x += 1;
    //   }
    // }

    if (this.selected_element != null) {
      if (key === "w") {
        this.selected_element.y -= 1;
      }

      if (key === "s") {
        this.selected_element.y += 1;
      }

      if (key === "a") {
        this.selected_element.x -= 1;
      }

      if (key === "d") {
        this.selected_element.x += 1;
      }

      // if (key === "d" || key === "w" || key === "a" || key === "s") {
      //   this.sortLayer(this.road_elements, "roads");
      //   this.sortLayer(this.exterior_elements, "ground", true);
      //   this.sortObjectLayer();
      // }
    }


    if (key === "h") {
      if (this.map.scale.x < 0.5) {
        this.map.scale.set(1,1);
      } else {
        this.map.scale.set(0.2, 0.2);
      }
    }
  }


  // Moving the asset
  mouseMove(ev) {
    // the true event is trash, use this instead
    let mouse_data = pixi.renderer.plugins.interaction.mouse.global;
    let m_x = Math.round(mouse_data.x);
    let m_y = Math.round(mouse_data.y);

    if (this.new_item != null) {
      this.new_item.x = m_x + this.player.x - game.width/2 
      this.new_item.y = m_y + this.player.y - game.height/2
    }
  }


  // Mouse clickos
  mouseUp(ev) {
    // the true event is trash, use this instead
    let mouse_data = pixi.renderer.plugins.interaction.mouse.global;
    let m_x = Math.round(mouse_data.x);
    let m_y = Math.round(mouse_data.y);
    let player = this.player;
    let layers = this.layers;

    if (this.new_item == null) {
      let selection = null;
      let min_distance = 500;

      let w_x = m_x + player.x - game.width/2 
      let w_y = m_y + player.y - game.height/2
      console.log(w_x + "," + w_y)

      for (let i = 0; i < this.road_elements.length; i++) {
        let d = distance(this.road_elements[i].x, this.road_elements[i].y, w_x, w_y);
        console.log(d);
        if (d < min_distance) {
          min_distance = d;
          selection = this.road_elements[i];
        }
      }
      for (let i = 0; i < this.exterior_elements.length; i++) {
        let d = distance(this.exterior_elements[i].x, this.exterior_elements[i].y, w_x, w_y);
        if (d < min_distance) {
          min_distance = d;
          selection = this.exterior_elements[i];
        }
      }

      if (selection != null) {
        this.selected_element = selection;

        this.info_text.text = "Selected " + this.selected_element.name;
        delay(() => {
          this.info_text.text = "";
        }, 2000);
      }
    }
    
    // Road version
    if (this.new_item != null && this.state === "roads") {
      this.road_elements.push(this.new_item);
      this.new_item = null;

      this.sortLayer(this.road_elements, "roads");
      this.selected_element = null;
    } else if (this.new_item != null && this.state === "exteriors") {
      this.exterior_elements.push(this.new_item);

      this.new_item.exterior_objects = this.addExteriorObjects(this.new_item.name, this.new_item.reverse, this.new_item.x, this.new_item.y);

      this.new_item = null;

      this.sortLayer(this.exterior_elements, "ground", true);
      this.sortObjectLayer();
      this.selected_element = null;
    } 
  }


  loadMap() {
    let existing_map_files = window.fileList(map_directory).filter((item) => {return item.includes(map_name) && item.includes(".json")});
    

    let max_file_number = -1;
    for (let i = 0; i < existing_map_files.length; i++) {
      let number = Number(existing_map_files[i].replace(map_name + "_","").replace(".json",""));
      if (number > max_file_number) max_file_number = number;
    }


    let input_filename = map_name + "_" + String(max_file_number).padStart(3, "0") + ".json";
    let input_path = map_directory + "/" + input_filename;

    let data = null;
    if (window.checkFile(input_path) === true) {
      console.log("reading data");
      data = JSON.parse(window.readFile(input_path));
    }

    console.log(data);
    if (data != null) {

      for (let i = 0; i < data["roads"].length; i++) {
        let item = data["roads"][i];
        console.log(item);
        let element = makeSprite(road_directory + "/" + item.type + ".png", this.layers["roads"], item.x, item.y, 0.5, 0.5, false);
        element.name = item.type;
        if (item.reversed) {
          element.reversed = true;
          element.scale.x = -1;
        }

        this.road_elements.push(element);
      }

      for (let i = 0; i < data["exteriors"].length; i++) {
        let item = data["exteriors"][i];
        console.log(item);
        let element = makeSprite(exterior_directory + "/" + item.type + "_0.png", this.layers["ground"], item.x, item.y, 0.5, 0.5, false);
        element.name = item.type;
        if (item.reversed) {
          element.reversed = true;
          element.scale.x = -1;
        }

        this.exterior_elements.push(element);

        element.exterior_objects = this.addExteriorObjects(element.name, element.reversed, element.x, element.y)
      }

      this.sortLayer(this.road_elements, "roads");
      this.sortLayer(this.exterior_elements, "ground", true);
      // this.sortObjectLayer();
    }
  }


  saveMap() {
    let existing_map_files = window.fileList(map_directory).filter((item) => {return item.includes(map_name) && item.includes(".json")});
    let max_file_number = -1;
    for (let i = 0; i < existing_map_files.length; i++) {
      let number = Number(existing_map_files[i].replace(map_name + "_","").replace(".json",""));
      if (number > max_file_number) max_file_number = number;
    }
    max_file_number += 1;

    let output_filename = map_name + "_" + String(max_file_number).padStart(3, "0") + ".json";

    let output_data = {
      "roads": [],
      "exteriors": []
    }

    for (let i = 0; i < this.road_elements.length; i++) {
      let element = this.road_elements[i];
      output_data["roads"].push({
        "x": element.x,
        "y": element.y,
        "type": element.name,
        "reversed": element.reversed
      })
    }

    for (let i = 0; i < this.exterior_elements.length; i++) {
      let element = this.exterior_elements[i];
      output_data["exteriors"].push({
        "x": element.x,
        "y": element.y,
        "type": element.name,
        "reversed": element.reversed
      })
    }

    let result = window.writeFile(map_directory + "/" + output_filename, JSON.stringify(output_data));

    if (result === true) {
      this.info_text.text = "Saved " + output_filename;
      delay(() => {
        this.info_text.text = "";
      }, 2000);
    }
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


  sortLayer(elements, layer_name, sort_terrain = false) {
    let layer = this.layers[layer_name];
    layer.removeChildren();

    let draw_elements = [...elements].sort((a,b) => {return a.y - b.y});

    for (let i = 0; i < draw_elements.length; i++) {
      layer.addChild(draw_elements[i]);
    }

    // very hacky place to put this
    if (sort_terrain) {
      let new_terrain = [];
      let count = 0;
      for (let i = 0; i < draw_elements.length; i++) {
        for (let j = 0; j < draw_elements[i].exterior_objects.length; j++) {
          new_terrain.push(draw_elements[i].exterior_objects[j])
        }
        count += 1;
      }
      this.terrain = new_terrain;
      this.count_text.text = count + " exteriors"
    }
  }


  sortObjectLayer() {
    let layers = this.layers;
    let player = this.player;

    layers["objects"].removeChildren();

    // layers["objects"].addChild(player);

    let added_character = false;

    console.log(this.terrain);

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
          // test the polygon with downward rays until out of range. if one is inside the polygon,
          // the character is behind, so add character and then terrain.
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
    
    if (this.map.scale.x > 0.5) {
      for (const item of ["roads", "ground", "objects", "effects"]) {
        layers[item].x = (game.width/2 - this.player.x)
        layers[item].y = (game.height/2 - this.player.y)
      }
    } else {
      for (const item of ["roads", "ground", "objects", "effects"]) {
        layers[item].x = (game.width*2 - this.player.x)
        layers[item].y = (game.height*2 - this.player.y)
      }
    }
  }


  update(diff) {
    let fractional = diff / (1000/30.0);

    shakeDamage();
    freeeeeFreeeeeFalling(fractional);

    if (this.state != "roads" && this.state != "exteriors") return;

    this.updatePlayer();
    this.updateScreen();
  }
}














