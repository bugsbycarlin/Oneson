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

    this.config = world_config["swizzle"];

    let background_color = makeBlank(this, game.width, game.height, 0, 0);
    background_color.tint = 0x82a64f;

    this.map = new PIXI.Container();
    this.addChild(this.map);

    layers["open"] = new PIXI.Container();
    this.map.addChild(layers["open"]);
    layers["filled"] = new PIXI.Container();
    this.map.addChild(layers["filled"]);
    layers["distraction"] = new PIXI.Container();
    this.map.addChild(layers["distraction"]);
    layers["death"] = new PIXI.Container();
    this.map.addChild(layers["death"]);
    layers["character"] = new PIXI.Container();
    this.map.addChild(layers["character"]);
    layers["floating"] = new PIXI.Container();
    this.map.addChild(layers["floating"]);
    layers["effect"] = new PIXI.Container();
    this.map.addChild(layers["effect"]);
    layers["display"] = new PIXI.Container();
    this.map.addChild(layers["display"]);

    // this.map.scale.set(0.8, 0.8);

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

    let test_element = makeSprite("Art/Town_Elements/composition_01.png", layers["open"], -200, -2700, 0, 0, true)
    // test_element.scale.set(0.8, 0.8);
  }


  // Read the level config file and add any preset characters.
  addCharacters() {
    let layers = this.layers;

    this.player = game.makeCharacter("black_bear");
    this.player.scale.set(0.66, 0.66);
    this.player.position.set(this.config.start[0], this.config.start[1])
    layers["character"].addChild(this.player);

    // for (let i = 0; i < this.config.characters.length; i++) {
    //   let [name, behavior, x, y] = this.config.characters[i];

    //   let character = this.makeCharacter(name);
    //   character.position.set(x, y);
    //   character.player_owned = false;
    //   layers["character"].addChild(character);
    //   character.setState(behavior);
    //   this.characters.push(character);
    // }
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
    var keymap = game.keymap;
    var player = this.player;

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

    if (player.direction != null) {
      player.move();
    }
  }



  // Update the screen to match the player position
  updateScreen() {
    let layers = this.layers;

    if (this.state == "none") return;

    const screen_acceleration = 3.5;
    const screen_max_speed = 18;
    
    for (const item of ["open", "filled", "distraction", "death", "floating", "character", "effect"]) {
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
    
    for (const item of ["open", "filled", "distraction", "death", "floating", "character", "effect"]) {
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














