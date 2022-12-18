
//
// This file contains the class for characters (player and NPC) and has methods
// for making them move around.
//
// Copyright 2023 Alpha Zoo LLC.
// Written by Matthew Carlin
//

var default_walk_speed = 5;
var walk_frame_time = 105;

var history_length = 8;

var character_sprites = ["down", "left", "up", "right", "downleft", "upleft", "downright", "upright"]

Game.prototype.makeCharacter = function(character_name, subtype = "normal") {
  let character = new PIXI.Container();
  character.position.set(0,0);

  character.type = "character";
  character.character_name = character_name;

  character.red_circle = new PIXI.Sprite(PIXI.Texture.from("Art/Miscellaneous/red_circle.png"));
  character.red_circle.anchor.set(0.5,0.78125);
  character.red_circle.position.set(0,0);
  character.red_circle.visible = false;
  character.addChild(character.red_circle);

  character.sprite_count = character_sprites.length;

  character.history = [];

  character.speed_boost = 1.0;

  let path = "Art/Characters/" + character_name + ".json";
  character.character_sprite = {};
  for(let i = 0; i < character.sprite_count; i++) {
    character.character_sprite[character_sprites[i]] = makeAnimatedSprite(path, character_sprites[i], character, 0, 0, 0.5, 0.78125)
    character.character_sprite[character_sprites[i]].visible = false;
  }

  character.shirt = null;
  character.glasses = null;
  character.hat = null;
  character.scooter = null;

  character.scooter_last_puff = markTime();
  character.scooter_next_puff = 200 + 150 * Math.random();
  character.scooter_last_puff_sound = markTime();

  character.shirt_layer = new PIXI.Container();
  character.addChild(character.shirt_layer);
  character.glasses_layer = new PIXI.Container();
  character.addChild(character.glasses_layer);
  character.hat_layer = new PIXI.Container();
  character.addChild(character.hat_layer);
  character.scooter_layer = new PIXI.Container();
  character.addChild(character.scooter_layer);

  character.direction = "down";
  character.character_sprite["down"].visible = true;

  character.walk_frame_time = walk_frame_time;
  character.last_image_time = null;
  character.walk_speed = default_walk_speed;

  character.move = function() {
    if (character.direction != null) {
      character.history.push([character.x, character.y, character.direction]);
      if (character.history.length > history_length) {
        character.history.shift();
      }
    }

    [character.x, character.y] = this.computeStep(character.x, character.y, character.direction);

    // let step = character.walk_speed * character.speed_boost;
    // let step_x = 0.866 * step;
    // let step_y = 0.5 * step;

    // if (character.direction == "upright") {
    //   character.y -= step_y;
    //   character.x += step_x; 
    // } else if (character.direction == "upleft") {
    //   character.y -= step_y;
    //   character.x -= step_x;
    // } else if (character.direction == "downright") {
    //   character.y += step_y;
    //   character.x += step_x;
    // } else if (character.direction == "downleft") {
    //   character.y += step_y;
    //   character.x -= step_x;
    // } else if (character.direction == "down") {
    //   character.y += step;
    // } else if (character.direction == "up") {
    //   character.y -= step;
    // } else if (character.direction == "left") {
    //   character.x -= step;
    // } else if (character.direction == "right") {
    //   character.x += step;
    // }

    if (character.direction != null) {
      character.walkAnimation();
    }
  }


  character.computeStep = function(x, y, direction) {
    let step = character.walk_speed * character.speed_boost;
    let step_x = 0.866 * step;
    let step_y = 0.5 * step;

    if (direction == "upright") {
      return [x + step_x, y - step_y];
    } else if (direction == "upleft") {
      return [x - step_x, y - step_y];
    } else if (direction == "downright") {
      return [x + step_x, y + step_y];
    } else if (direction == "downleft") {
      return [x - step_x, y + step_y];
    } else if (direction == "down") {
      return [x, y + step];
    } else if (direction == "up") {
      return [x, y - step];
    } else if (direction == "left") {
      return [x - step, y];
    } else if (direction == "right") {
      return [x + step, y];
    }
  }


  character.walkAnimation = function() {
    for(let i = 0; i < character.sprite_count; i++) {
      if (character_sprites[i] == character.direction) {
        character.character_sprite[character_sprites[i]].visible = true;
        if (character.shirt != null) character.shirt[character_sprites[i]].visible = true;
        if (character.glasses != null) character.glasses[character_sprites[i]].visible = true;
        if (character.hat != null) character.hat[character_sprites[i]].visible = true;
        if (character.scooter != null) character.scooter[character_sprites[i]].visible = true;
      } else {
        character.character_sprite[character_sprites[i]].visible = false;
        if (character.shirt != null) character.shirt[character_sprites[i]].visible = false;
        if (character.glasses != null) character.glasses[character_sprites[i]].visible = false;
        if (character.hat != null) character.hat[character_sprites[i]].visible = false;
        if (character.scooter != null) character.scooter[character_sprites[i]].visible = false;
      }
    }

    if (character.scooter == null) {
      var f0 = character.direction + "_0";
      var f1 = character.direction + "_1";
      if (character.current_image != f0 && character.current_image != f1) {
        character.current_image = f0
        character.last_image_time = Date.now();
      } else if (character.last_image_time == null) {
        character.last_image_time = Date.now();
      } else if (Date.now() - character.last_image_time > character.walk_frame_time) {
        if (character.current_image == f0) {
          character.current_image = f1;
        } else {
          character.current_image = f0;
        }
        character.last_image_time = Date.now();
      }

      if (character.character_sprite[character.direction].currentFrame == 0 && character.current_image == f1) {
        character.character_sprite[character.direction].gotoAndStop(1);
        if (character.shirt != null) character.shirt[character.direction].gotoAndStop(1);
        if (character.glasses != null) character.glasses[character.direction].gotoAndStop(1);
        if (character.hat != null) character.hat[character.direction].gotoAndStop(1);
      } else if (character.character_sprite[character.direction].currentFrame == 1 && character.current_image == f0) {
        character.character_sprite[character.direction].gotoAndStop(0);
        if (character.shirt != null) character.shirt[character.direction].gotoAndStop(0);
        if (character.glasses != null) character.glasses[character.direction].gotoAndStop(0);
        if (character.hat != null) character.hat[character.direction].gotoAndStop(0);
      }
    } else {
      character.character_sprite[character.direction].gotoAndStop(0);
      if (character.shirt != null) character.shirt[character.direction].gotoAndStop(0);
      if (character.glasses != null) character.glasses[character.direction].gotoAndStop(0);
      if (character.hat != null) character.hat[character.direction].gotoAndStop(0);
      character.scooter[character.direction].gotoAndStop(0);

      if (character.direction == "upright" || character.direction == "upleft") {
        character.character_sprite[character.direction].gotoAndStop(1);
        if (character.shirt != null) character.shirt[character.direction].gotoAndStop(1);
        if (character.glasses != null) character.glasses[character.direction].gotoAndStop(1);
        if (character.hat != null) character.hat[character.direction].gotoAndStop(1);
        character.scooter[character.direction].gotoAndStop(1);
      }

      if (timeSince(character.scooter_last_puff) > character.scooter_next_puff
        && character.history.length > 2) {
        character.scooter_last_puff = markTime();
        character.scooter_next_puff = 100 + 200 * Math.random();
        // character.scooter_next_puff = 120 + 50 * Math.random();
        let scale = 0.5 + 0.2 * Math.random();
        let px = character.history[character.history.length - 1][0];
        let py = character.history[character.history.length - 1][1];


        
        if (character.scooter_scene == "gift_shop") {
          let puff = game.makePuff(game.gift_shop_object_layer, px - 5 + 10 * Math.random(), py - 5 + Math.random() * 10, scale, scale);
          game.gift_shop_objects.push(puff);
        } else if (character.scooter_scene == "zoo") {
          let puff = game.makePuff(game.map.decoration_layer, px - 5 + 10 * Math.random(), py - 5 + Math.random() * 10, scale, scale);
          game.decorations.push(puff);
        }
      }

      if (timeSince(character.scooter_last_puff_sound) > 226) {
        soundEffect("puff");
        character.scooter_last_puff_sound = markTime();
      }

      
    }
  }


  character.updateDirection = function() {
    if (character.direction == null) return;

    for(let i = 0; i < 8; i++) {
      if (character_sprites[i] == character.direction) {
        character.character_sprite[character_sprites[i]].visible = true;
        if (character.shirt != null) character.shirt[character_sprites[i]].visible = true;
        if (character.glasses != null) character.glasses[character_sprites[i]].visible = true;
        if (character.hat != null) character.hat[character_sprites[i]].visible = true;
        if (character.scooter != null) character.scooter[character_sprites[i]].visible = true;
      } else {
        character.character_sprite[character_sprites[i]].visible = false;
        if (character.shirt != null) character.shirt[character_sprites[i]].visible = false;
        if (character.glasses != null) character.glasses[character_sprites[i]].visible = false;
        if (character.hat != null) character.hat[character_sprites[i]].visible = false;
        if (character.scooter != null) character.scooter[character_sprites[i]].visible = false;
      }
    }

    character.character_sprite[character.direction].gotoAndStop(0);
    if (character.shirt != null) character.shirt[character.direction].gotoAndStop(0);
    if (character.glasses != null) character.glasses[character.direction].gotoAndStop(0);
    if (character.hat != null) character.hat[character.direction].gotoAndStop(0);
    if (character.scooter != null) character.scooter[character.direction].gotoAndStop(0);

    if (character.scooter != null && 
      (character.direction == "upright" || character.direction == "upleft")) {
        character.character_sprite[character.direction].gotoAndStop(1);
      if (character.shirt != null) character.shirt[character.direction].gotoAndStop(1);
      if (character.glasses != null) character.glasses[character.direction].gotoAndStop(1);
      if (character.hat != null) character.hat[character.direction].gotoAndStop(1);
      character.scooter[character.direction].gotoAndStop(1);
    }
  }


  character.follow = function(follow_character) {
    if (follow_character.history.length >= history_length) {
      var element = follow_character.history[0];
      character.x = element[0];
      character.y = element[1];
      character.direction = element[2];
      if (follow_character.direction != null) {
        if (character.direction != null) {
          character.history.push([element[0], element[1], element[2]]);
          if (character.history.length > history_length) {
            character.history.shift();
          }
        }

        character.walkAnimation();
      }
    }
  }


  character.addShirt = function(shirt_color) {
    if (character.shirt != null) {
      for(let i = 0; i < character.sprite_count; i++) {
        character.shirt_layer.removeChild(character.shirt[character_sprites[i]]);
        character.shirt[character_sprites[i]].destroy();
      }
    }

    let sheet = PIXI.Loader.shared.resources["Art/Characters/" + character_name + "_shirt.json"].spritesheet;
    character.shirt = {};
    character.shirt_color = shirt_color;
    for(let i = 0; i < character.sprite_count; i++) {
      character.shirt[character_sprites[i]] = new PIXI.AnimatedSprite(sheet.animations[character_sprites[i]]);
      character.shirt[character_sprites[i]].anchor.set(0.5,0.78125);
      character.shirt[character_sprites[i]].position.set(0, 0);
      character.shirt_layer.addChild(character.shirt[character_sprites[i]]);
      character.shirt[character_sprites[i]].tint = shirt_color
      character.shirt[character_sprites[i]].visible = false;
    }

    character.updateDirection();

    game.makeSmoke(character, 0, 0, 1.8, 1.8);
  }


  character.addGlasses = function(glasses_type) {
    if (character.glasses != null) {
      for(let i = 0; i < character.sprite_count; i++) {
        character.glasses_layer.removeChild(character.glasses[character_sprites[i]]);
        character.glasses[character_sprites[i]].destroy();
      }
    }

    character.glasses_type = glasses_type;

    if (glasses_type == "no_glasses") {
      character.glasses = null;
    } else {
      let sheet = PIXI.Loader.shared.resources["Art/Characters/" + character_name + "_" + glasses_type + ".json"].spritesheet;
      character.glasses = {};
      character.glasses_type = glasses_type;
      for(let i = 0; i < character.sprite_count; i++) {
        character.glasses[character_sprites[i]] = new PIXI.AnimatedSprite(sheet.animations[character_sprites[i]]);
        character.glasses[character_sprites[i]].anchor.set(0.5,0.78125);
        character.glasses[character_sprites[i]].position.set(0, 0);
        character.glasses_layer.addChild(character.glasses[character_sprites[i]]);
        character.glasses[character_sprites[i]].visible = false;
      }

      character.updateDirection();

      game.makeSmoke(character, 0, 0, 1.8, 1.8);
    }
  }


  character.addHat = function(hat_type) {
    if (character.hat != null) {
      for(let i = 0; i < character.sprite_count; i++) {
        character.hat_layer.removeChild(character.hat[character_sprites[i]]);
        character.hat[character_sprites[i]].destroy();
      }
    }

    character.hat_type = hat_type;

    if (hat_type == "no_hat") {
      character.hat = null;
    } else {
      let sheet = PIXI.Loader.shared.resources["Art/Characters/" + character_name + "_" + hat_type + ".json"].spritesheet;
      character.hat = {};
      character.hat_type = hat_type;
      for(let i = 0; i < character.sprite_count; i++) {
        character.hat[character_sprites[i]] = new PIXI.AnimatedSprite(sheet.animations[character_sprites[i]]);
        character.hat[character_sprites[i]].anchor.set(0.5,0.78125);
        character.hat[character_sprites[i]].position.set(0, 0);
        if (hat_type == "witch_hat") character.hat[character_sprites[i]].position.set(0, -32); // witch hat is tall and needs adjustment to fit the sprite sheet.
        if (hat_type == "top_hat") character.hat[character_sprites[i]].position.set(0, -32); // top hat is tall and needs adjustment to fit the sprite sheet.
        if (hat_type == "beanie") character.hat[character_sprites[i]].position.set(0, -32); // beanie is tall and needs adjustment to fit the sprite sheet.
        character.hat_layer.addChild(character.hat[character_sprites[i]]);
        character.hat[character_sprites[i]].visible = false;
      }

      character.updateDirection();

      game.makeSmoke(character, 0, 0, 1.8, 1.8);
    }
  }


  character.addScooter = function(scooter_type, scooter_scene) {
    if (character.scooter != null) {
      for(let i = 0; i < character.sprite_count; i++) {
        character.scooter_layer.removeChild(character.scooter[character_sprites[i]]);
        character.scooter[character_sprites[i]].destroy();
      }
    }

    character.scooter_scene = scooter_scene;

    if (scooter_type == "no_scooter") {
      character.scooter = null;
      character.speed_boost = 1.0;
    } else {
      character.speed_boost = 1.3;

      let sheet = PIXI.Loader.shared.resources["Art/Characters/" + character_name + "_scooter.json"].spritesheet;
      character.scooter = {};
      character.scooter_type = scooter_type;
      for(let i = 0; i < character.sprite_count; i++) {
        character.scooter[character_sprites[i]] = new PIXI.AnimatedSprite(sheet.animations[character_sprites[i]]);
        character.scooter[character_sprites[i]].anchor.set(0.5,0.78125);
        character.scooter[character_sprites[i]].position.set(0, 0);
        character.scooter_layer.addChild(character.scooter[character_sprites[i]]);
        character.scooter[character_sprites[i]].visible = false;
      }

      character.updateDirection();

      game.makeSmoke(character, 0, 0, 1.8, 1.8);
    }
  }


  character.hideScooter = function() {
    character.scooter_layer.visible = false;
  }


  character.showScooter = function() {
    character.scooter_layer.visible = true;
  }


  return character;
}
