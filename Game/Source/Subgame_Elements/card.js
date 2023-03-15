
//
// This file contains the class for characters (player and NPC) and has methods
// for making them move around.
//
// Copyright 2023 Alpha Zoo LLC.
// Written by Matthew Carlin
//

let card_directory = "Art/Cards/";
let cardstock_loaded = false;
let cardstock_dictionary = {}

let card_scale = 0.6;
let card_flip_duration = 100;

load_cardstock = function() {
  let  card_files = window.fileList(card_directory).filter((item) => {return item.includes(".png")}).map((item) => {return item.replace(".png","")});
  console.log(card_files);  

  for (let i = 0; i < card_files.length; i++) {
    let chunks = card_files[i].split("_");
    let name = card_files[i];
    if (parseInt(chunks[chunks.length - 1]) != NaN) {
      name = chunks.slice(0,chunks.length-1).join("_");
    }
    if (!(name in cardstock_dictionary)) {
      cardstock_dictionary[name] = [];
    }
    cardstock_dictionary[name].push(card_files[i])
  }

  cardstock_loaded = true;
}

choose_card_path = function(card_name) {
  if (!(card_name in cardstock_dictionary)) return null;

  return card_directory + pick(cardstock_dictionary[card_name]) + ".png";  
}

Game.prototype.makeCard = function(card_name) {
  let card = new PIXI.Container();

  card.card_name = card_name
  card.original_card_name = card.card_name

  if (!cardstock_loaded) {
    load_cardstock();
  }

  card.card_path = choose_card_path(card_name);
  card.original_card_path = card.card_path;

  card.image = makeSprite(card.card_path, card, 0, 0, 0.5, 0, false);
  card.image.scale.set(card_scale, card_scale);
  card.backing = makeSprite(card_directory + "card_backing.png", card, 0, 0, 0.5, 0, false);
  card.backing.scale.set(card_scale, card_scale);
  card.backing.visible = false;

  card.face_up = true;
  card.flipping = false;

  card.flip = function() {
    card.flipping = true;
    if (card.face_up === true) {
      card.face_up = false;

      new TWEEN.Tween(card.image.scale)
          .to({x: 0.05})
          .duration(card_flip_duration)
          .start()
          .easing(TWEEN.Easing.Quartic.Out)
          .onComplete(function() {
            card.image.visible = false;
            card.image.scale.x = card_scale;

            card.backing.scale.x = 0.05;
            card.backing.visible = true;
            new TWEEN.Tween(card.backing.scale)
              .to({x: card_scale})
              .duration(card_flip_duration)
              .start()
              .easing(TWEEN.Easing.Quartic.Out)
              .onComplete(function() {
                card.flipping = false;
              })
          })
    } else {
      card.face_up = true;

      new TWEEN.Tween(card.backing.scale)
          .to({x: 0.05})
          .duration(card_flip_duration)
          .start()
          .easing(TWEEN.Easing.Quartic.Out)
          .onComplete(function() {
            card.backing.visible = false;
            card.backing.scale.x = card_scale;

            card.image.scale.x = 0.05;
            card.image.visible = true;
            new TWEEN.Tween(card.image.scale)
              .to({x: card_scale})
              .duration(card_flip_duration)
              .start()
              .easing(TWEEN.Easing.Quartic.Out)
              .onComplete(function() {
                card.flipping = false;
              })
          })
    }
  }


  // character.computeStep = function(x, y, direction) {
  //   let step = character.walk_speed * character.speed_boost;
  //   let step_x = 0.866 * step;
  //   let step_y = 0.5 * step;

  //   if (direction == "upright") {
  //     return [x + step_x, y - step_y];
  //   } else if (direction == "upleft") {
  //     return [x - step_x, y - step_y];
  //   } else if (direction == "downright") {
  //     return [x + step_x, y + step_y];
  //   } else if (direction == "downleft") {
  //     return [x - step_x, y + step_y];
  //   } else if (direction == "down") {
  //     return [x, y + step];
  //   } else if (direction == "up") {
  //     return [x, y - step];
  //   } else if (direction == "left") {
  //     return [x - step, y];
  //   } else if (direction == "right") {
  //     return [x + step, y];
  //   }
  // }


  return card;
}
