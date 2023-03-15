//
// This file contains the Cooking Battle subgame.
//
// Copyright 2023 Alpha Zoo LLC.
// Written by Matthew Carlin
//


class CookingBattle extends Screen {
  // Set up the game board
  initialize() {
    this.state = null;

    freefalling = [];
    shakers = [];

    this.layers = {};
    let layers = this.layers;

    let background_color = makeSprite("Art/Miscellaneous/slate_texture.jpg", this, 0, 0, 0, 0, false);

    layers["hand"] = new PIXI.Container();
    this.addChild(layers["hand"]);
    layers["display"] = new PIXI.Container();
    this.addChild(layers["display"]);

    let font_16 = {fontFamily: "Bebas Neue", fontSize: 16, fill: 0xFCFCFC, letterSpacing: 2, align: "left"};
    this.info_text = makeText("34/34", font_16, layers["display"], 20, 20, 0, 0);

    this.card_A = game.makeCard("ingredient_chocolate");
    this.card_A.position.set(250, 100);
    this.layers["hand"].addChild(this.card_A);

    this.card_B = game.makeCard("action_clutter");
    this.card_B.position.set(1050, 100);
    this.layers["hand"].addChild(this.card_B);

    this.state = "active";
    // this.state = "pre_game";

    // delay(() => {
    //   paused = false;
    //   pause_time = 0;
    //   this.start_time = markTime();
    //   this.state = "active";
    // }, 500);
  }



  // Handle keys
  keyDown(ev) {
    if (this.state == "none") return;

    let key = ev.key;

    if (key.toLowerCase() === "a") {
      if (dice(10) < 5) {
        this.card_A.flip();
      } else {
        this.card_B.flip();
      }
    }

    // key pressy things like pause
  }


  update(diff) {
    let fractional = diff / (1000/30.0);

    shakeDamage();
    freeeeeFreeeeeFalling(fractional);

    if (this.state != "active") return;
  }
}














