//
// This file contains the File Editor which is used to define
// the ground outline of components of assets (eg "here's a tree, here's a house").
//
// Copyright 2023 Alpha Zoo LLC.
// Written by Matthew Carlin
//

let asset_directory = "../Art/Post Processed Assets";
let file_editor_background = 0x9bccda;

class FileEditor extends Screen {
  // Set up the game board
  initialize() {
    this.state = null;

    freefalling = [];
    shakers = [];

    this.file_list = window.fileList(asset_directory);
    this.assets = [];
    for (let i = 0; i < this.file_list.length; i++) {
      if (this.file_list[i].includes(".psd")) {
        this.assets.push(this.file_list[i].replace(".psd",""));
      }
    }

    let screen_color = makeBlank(this, game.width, game.height, 0, 0);
    screen_color.tint = 0xf0f0f0;

    this.background = makeBlank(this, 0, 0, 0, 0);
    this.background.tint = file_editor_background;

    this.file_selection = 0;
    
    this.images = new PIXI.Container();
    this.addChild(this.images);

    let font_20 = {fontFamily: "Bebas Neue", fontSize: 20, fill: 0x000000, letterSpacing: 2, align: "left"};
    this.info_text = makeText("", font_20, this, 20, 20, 0, 0);

    this.loadAsset();

    this.state = "active";
  }

  loadAsset() {
    if (this.images != null) this.images.removeChildren();

    this.file_root = this.assets[this.file_selection];
    console.log(this.file_root);

    this.image_filenames = [];
    this.image_list = [];

    for (let i = 0; i < this.file_list.length; i++) {
      if (this.file_list[i].includes(this.file_root) && this.file_list[i].includes(".png")) {
        let image_filename = this.file_list[i];        
        this.image_filenames.push(image_filename);

        let image = makeSprite(asset_directory + "/" + image_filename, this.images, 0, 0);
        image.visible = false;
        this.image_list.push(image);
      }
    }

    this.info_text.text = this.file_root + "   (" + this.image_filenames.length + ")"

    this.image_selection = 0;
    this.image_list[this.image_selection].visible = true;


    delay(() => {
      this.background.width = this.images.children[0].width;
      this.background.height = this.images.children[0].height;
    }, 250);
  }

  // Handle keys
  keyDown(ev) {
    if (this.state == "none") return;

    let key = ev.key;
    let code = ev.code;

    if (code.includes("Digit")) {
      this.image_selection = Number(code.replace("Digit",""));
      if (this.image_selection < this.image_list.length) {
        for (let i = 0; i < this.image_list.length; i++) {
          this.image_list[i].visible = i == this.image_selection ? true : false;
        }
      }
    }
    

    if (key === "ArrowUp" || key === "ArrowDown") {
      if (key === "ArrowUp") this.file_selection = (this.file_selection + this.assets.length - 1) % this.assets.length
      if (key === "ArrowDown") this.file_selection = (this.file_selection + this.assets.length + 1) % this.assets.length
    
      console.log(this.file_selection);
      this.loadAsset();
      console.log("hok");
    }
  }


  update(diff) {
    let fractional = diff / (1000/30.0);

    shakeDamage();
    freeeeeFreeeeeFalling(fractional);

    if (this.state != "active") return;
  }
}














