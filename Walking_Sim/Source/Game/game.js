//
// This file contains the root game class for Oneson. This is the starting point.
//
// Copyright 2023 Alpha Zoo LLC.
// Written by Matthew Carlin
//

'use strict';

var log_performance = true;
var performance_result = null;

// var first_screen = "intro";
// var first_screen = "title";
var first_screen = "walking_sim";
// var first_screen = "file_editor";

var subgames = ["walking_sim", "file_editor"];

var pixi = null;
var game = null;

function initialize() {
  game = new Game();
}

// WebFont.load({
//   google: {
//     families: ['Bebas Neue', 'Press Start 2P', 'Bangers']
//   }
// });

class Game {
  constructor() {
    this.tracking = {};

    this.basicInit();

    this.keymap = {};

    // Useful place to load config, such as the map
    // this.cpe_level_count = Object.keys(cpe_level_config).length;

    document.addEventListener("keydown", (ev) => {this.handleKeyDown(ev)}, false);
    document.addEventListener("keyup", (ev) => {this.handleKeyUp(ev)}, false);
    document.addEventListener("mousemove", (ev) => {this.handleMouseMove(ev)}, false);
    document.addEventListener("mousedown", (ev) => {this.handleMouseDown(ev)}, false);
    document.addEventListener("mouseup", (ev) => {this.handleMouseUp(ev)}, false);

    window.onfocus = (ev) => {
      if (this.keymap != null) {
        this.keymap["ArrowDown"] = null;
        this.keymap["ArrowUp"] = null;
        this.keymap["ArrowLeft"] = null;
        this.keymap["ArrowRight"] = null;
      }
    };
    window.onblur = (ev) => {
      if (this.keymap != null) {
        this.keymap["ArrowDown"] = null;
        this.keymap["ArrowUp"] = null;
        this.keymap["ArrowLeft"] = null;
        this.keymap["ArrowRight"] = null;
      }
    };

    this.freefalling = [];
    this.shakers = [];

    this.gravity = 3.8;
    this.gentle_drop = 0.05;
    this.gentle_limit = 6;

    use_music = localStorage.getItem("oneson_use_music") == "false" ? false : true;
    use_sound = localStorage.getItem("oneson_use_sound") == "false" ? false : true;;

    // if you're going to do cutscenes and story, this is where you need to do it.
    // this.initializeFlows();

    this.preloadAnimations(() => {
      this.initializeScreens();
    });
  }


  basicInit() {
    this.width = 1664;
    this.height = 960;

    // Create the pixi application
    pixi = new PIXI.Application(this.width, this.height, {antialias: true});
    this.renderer = pixi.renderer;
    document.getElementById("mainDiv").appendChild(pixi.view);
    pixi.renderer.backgroundColor = 0xFFFFFF;
    pixi.renderer.resize(this.width,this.height);
    pixi.renderer.backgroundColor = 0x000000;

    // Set up rendering and tweening loop
    let ticker = PIXI.Ticker.shared;
    ticker.autoStart = false;
    ticker.stop();

    let fps_counter = 0;
    let last_frame = 0;
    let last_performance_update = 0;

    let animate = now => {
      
      fps_counter += 1;
      let diff = now - last_frame;
      last_frame = now

      if (!this.paused == true) {
        this.trackStart("tween");
        TWEEN.update(now);
        this.trackStop("tween");

        this.trackStart("update");
        this.update(diff);
        this.trackStop("update");

        this.trackStart("animate");
        ticker.update(now);
        pixi.renderer.render(pixi.stage);
        this.trackStop("animate");

        if (now - last_performance_update > 3000 && log_performance) {
          //There were 3000 milliseconds, so divide fps_counter by 3
          // console.log("FPS: " + fps_counter / 3);
          // this.trackPrint(["update", "tween", "animate"]);
          fps_counter = 0;
          last_performance_update = now;
        }
      }

      requestAnimationFrame(animate);
    }
    animate(0);
  }


  //
  // Tracking functions, useful for testing the timing of things.
  //
  trackStart(label) {
    if (!(label in this.tracking)) {
      this.tracking[label] = {
        start: 0,
        total: 0
      }
    }
    this.tracking[label].start = Date.now();
  }


  trackStop(label) {
    if (this.tracking[label].start == -1) {
      console.log("ERROR! Tracking for " + label + " stopped without having started.")
    }
    this.tracking[label].total += Date.now() - this.tracking[label].start;
    this.tracking[label].start = -1
  }


  trackPrint(labels) {
    var sum_of_totals = 0;
    for (var label of labels) {
      sum_of_totals += this.tracking[label].total;
    }
    for (var label of labels) {
      var fraction = this.tracking[label].total / sum_of_totals;
      console.log(label + ": " + Math.round(fraction * 100).toFixed(2) + "%");
    }
  }


  preloadAnimations(and_then) {
    PIXI.Loader.shared
      .add("Art/Animated_Effects/explosion.json")
      .add("Art/Animated_Effects/electric.json")
      .add("Art/Animated_Effects/fireworks_blue.json")
      .add("Art/Animated_Effects/fireworks_orange.json")
      .add("Art/Animated_Effects/pop.json")
      .add("Art/Animated_Effects/puff.json")
      .add("Art/Animated_Effects/smoke.json")
      .add("Art/Animated_Effects/steam.json")
      .add("Art/Characters/polar_bear.json")
      .add("Art/Characters/black_bear.json")
      .add("Art/Characters/brown_bear.json")
      .add("Art/Characters/brown_bear_ghost.json")
      .load(function() {
        and_then();
      });
  }


  handleMouseMove(ev) {
    if (this.screens != null
      && this.current_screen != null
      && this.screens[this.current_screen].mouseMove != null) {
      this.screens[this.current_screen].mouseMove(ev);
    }
  }


  handleMouseDown(ev) {
    if (this.screens != null
      && this.current_screen != null
      && this.screens[this.current_screen].mouseDown != null) {
      this.screens[this.current_screen].mouseDown(ev);
    }
  }


  handleMouseUp(ev) {
    console.log("le clicks")
    if (this.screens != null
      && this.current_screen != null
      && this.screens[this.current_screen].mouseUp != null) {
      this.screens[this.current_screen].mouseUp(ev);
    }
  }


  handleKeyUp(ev) {
    ev.preventDefault();

    this.keymap[ev.key] = null;

    if (this.screens != null
      && this.current_screen != null
      && this.screens[this.current_screen].keyUp != null) {
      this.screens[this.current_screen].keyUp(ev);
    }
  }


  handleKeyDown(ev) {
    if (ev.key === "Tab") {
      ev.preventDefault();
    }

    this.keymap[ev.key] = true;

    if (this.screens != null
      && this.current_screen != null
      && this.screens[this.current_screen].keyDown != null) {
      this.screens[this.current_screen].keyDown(ev);
    }
  }


  update(diff) {
    if (this.screens != null && this.current_screen != null) {
      this.screens[this.current_screen].update(diff);
    }
  }
}
