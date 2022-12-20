//
// This file contains the File Editor which is used to define
// the ground outline of components of assets (eg "here's a tree, here's a house").
//
// Copyright 2023 Alpha Zoo LLC.
// Written by Matthew Carlin
//

let asset_directory = "../Design/Exteriors";
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
    
    this.display_layer = new PIXI.Container();
    this.addChild(this.display_layer);

    this.polygon_layer = new PIXI.Container();
    this.addChild(this.polygon_layer);

    this.images = [];
    this.image_filenames = [];

    let font_20 = {fontFamily: "Bebas Neue", fontSize: 20, fill: 0x000000, letterSpacing: 2, align: "left"};
    this.info_text = makeText("", font_20, this, 20, 20, 0, 0);

    this.temporary_text = makeText("", font_20, this, 20, 80, 0, 0);

    this.image_text = makeText("", font_20, this, 20, 40, 0, 0);

    this.loadAsset();

    this.state = "active";
  }

  loadAsset() {
    if (this.display_layer != null) this.display_layer.removeChildren();

    this.file_root = this.assets[this.file_selection];

    this.save_file_path = asset_directory + "/" + this.file_root + ".json";

    if (this.images[this.file_root] == null) {
      this.images[this.file_root] = [];
      this.image_filenames[this.file_root] = [];

      let images = this.images[this.file_root];
      let filenames = this.image_filenames[this.file_root];

      for (let i = 0; i < this.file_list.length; i++) {
        if (this.file_list[i].includes(this.file_root) && this.file_list[i].includes(".png")) {
          let image_filename = this.file_list[i];        
          filenames.push(image_filename);

          let image = makeSprite(asset_directory + "/" + image_filename, this.display_layer, 0, 0);
          image.visible = false;

          image.polygons = [];
          image.current_polygon = null;
          images.push(image);
        }
      }
    } else {
      let images = this.images[this.file_root];
      let filenames = this.image_filenames[this.file_root];
      for (let i = 0; i < images.length; i++) {
        this.display_layer.addChild(images[i]);
      }
    }

    let images = this.images[this.file_root];

    if (window.checkFile(this.save_file_path) === true) {
      let data = JSON.parse(window.readFile(this.save_file_path)).polygons;
      console.log(data);
      for (let i = 0; i < images.length; i++) {
        let polygon_list = data[i];
        let image = images[i];
        for (let j = 0; j < polygon_list.length; j++) {
          image.polygons.push(polygon_list[j].data)
        }
        console.log(image.polygons);
      }
    }

    this.info_text.text = this.file_root + "   (" + this.image_filenames[this.file_root].length + ")"
    this.image_text.text = "0";

    this.image_selection = 0;

    let image = images[this.image_selection];

    image.visible = true;
    this.drawPolygons(image);

    delay(() => {
      this.background.width = this.display_layer.children[0].width;
      this.background.height = this.display_layer.children[0].height;
      console.log(this.background.width + "," + this.background.height)
    }, 250);
  }

  // Handle keys
  keyDown(ev) {
    if (this.state == "none") return;

    let key = ev.key;
    let code = ev.code;
    let images = this.images[this.file_root];
    let image = images[this.image_selection];

    if (code.includes("Digit")) {
      this.image_selection = Number(code.replace("Digit",""));
      if (this.image_selection < images.length) {
        for (let i = 0; i < images.length; i++) {
          images[i].visible = i == this.image_selection ? true : false;
        }
        this.image_text.text = this.image_selection
        console.log(images);
        image = images[this.image_selection];
        this.drawPolygons(image);
      }
    }
    

    if (key === "[" || key === "]") {
      if (key === "[") this.file_selection = (this.file_selection + this.assets.length - 1) % this.assets.length
      if (key === "]") this.file_selection = (this.file_selection + this.assets.length + 1) % this.assets.length
    
      this.loadAsset();
    }


    if (key === "z" && image.current_polygon != null && image.current_polygon.length >= 2) {
      image.current_polygon.pop();
      image.current_polygon.pop();
      this.drawPolygons(image);
    }

    if (key === "c" && image.current_polygon != null && image.current_polygon.length >= 6) {
      image.polygons.push(image.current_polygon);
      image.current_polygon = null;
      this.drawPolygons(image);
    }

    if (key === "Backspace" && image.polygons.length > 0) {
      image.polygons.pop();
      this.drawPolygons(image);
    }


    if (key === "w" && image.current_polygon != null && image.current_polygon.length >= 2) {
      for (let j = 0; j < image.current_polygon.length; j+= 2) {
        image.current_polygon[j+1] -= 1;
      }
      this.drawPolygons(image);
    }

    if (key === "s" && image.current_polygon != null && image.current_polygon.length >= 2) {
      for (let j = 0; j < image.current_polygon.length; j+= 2) {
        image.current_polygon[j+1] += 1;
      }
      this.drawPolygons(image);
    }

    if (key === "a" && image.current_polygon != null && image.current_polygon.length >= 2) {
      for (let j = 0; j < image.current_polygon.length; j+= 2) {
        image.current_polygon[j] -= 1;
      }
      this.drawPolygons(image);
    }

    if (key === "d" && image.current_polygon != null && image.current_polygon.length >= 2) {
      for (let j = 0; j < image.current_polygon.length; j+= 2) {
        image.current_polygon[j] += 1;
      }
      this.drawPolygons(image);
    }

    if (key === "m") {
      this.saveFile();
    }

    if (key === "v") {
      images[0].visible = images[0].visible == true ? false : true;
    }

    if (key === "u") {
      game.createScreen("level_editor");
      game.popScreens(game.current_screen, "level_editor");
    }
  }


  // Mouse clickos
  mouseUp(ev) {
    // the true event is trash, use this instead
    let mouse_data = pixi.renderer.plugins.interaction.mouse.global;
    let m_x = Math.round(mouse_data.x);
    let m_y = Math.round(mouse_data.y);
    let images = this.images[this.file_root];
    let image = images[this.image_selection];

    if (image.current_polygon == null) {
      image.current_polygon = [];
    }
    image.current_polygon.push(m_x);
    image.current_polygon.push(m_y);
    this.drawPolygons(image);
  }


  saveFile() {
    let images = this.images[this.file_root];
    let output = {
      width: this.background.width,
      height: this.background.height,
      polygons: {}
    }
    for (let i = 0; i < images.length; i++) {
      output.polygons[i] = [];
      let image = images[i];
      for (let j = 0; j < image.polygons.length; j++) {
        output.polygons[i].push({type:"illegal", data:image.polygons[j]})
      }

    }
    
    let result = window.writeFile(this.save_file_path, JSON.stringify(output));

    if (result === true) {
      this.temporary_text.text = "Saved " + this.file_root + ".json";
      delay(() => {
        this.temporary_text.text = "";
      }, 2000);
    }
  }


  drawPolygons(image) {
    if (this.polygon_layer != null) this.polygon_layer.removeChildren();

    let graphics = new PIXI.Graphics();

    for (let i = 0; i < image.polygons.length; i++) {
      let polygon = image.polygons[i];

      for (let j = 0; j < polygon.length; j+= 2) {
        let x = polygon[j];
        let y = polygon[j+1];

        graphics.beginFill(0xed7014);
        graphics.drawCircle(x, y, 5);
        graphics.endFill();
      }

      graphics.beginFill(0xFFFFFF, 0.25);
      graphics.drawPolygon(polygon);
      graphics.endFill();
    }

    if (image.current_polygon != null) {
      console.log(image.current_polygon);
      let polygon = image.current_polygon;

      for (let j = 0; j < polygon.length; j+= 2) {
        let x = polygon[j];
        let y = polygon[j+1];

        graphics.beginFill(0xff1010);
        graphics.drawCircle(x, y, 5);
        graphics.endFill();
      }

      graphics.beginFill(0xFFFFFF, 0.25);
      graphics.drawPolygon(polygon);
      graphics.endFill();
    }

    this.polygon_layer.addChild(graphics);
  }


  update(diff) {
    let fractional = diff / (1000/30.0);

    shakeDamage();
    freeeeeFreeeeeFalling(fractional);

    if (this.state != "active") return;
  }
}














