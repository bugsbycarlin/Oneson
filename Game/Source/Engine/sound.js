//
// This file contains general sound effect and music utilities based on Howl.js.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

var use_music = true;
var use_sound = true;

let music_volume = 0.4;
let sound_volume = 0.4;
let current_music = null;
let old_music = null;

let sound_files = [
  // ["negative", "negative.wav"],
  // ["negative_1", "negative_1.mp3"],
  // ["rocket", "rocket.wav"],
  // ["explosion_1", "explosion_1.wav"],
  // ["explosion_2", "explosion_2.wav"],
  // ["explosion_3", "explosion_3.wav"],
  // ["game_over", "game_over.wav"],
  // ["victory", "victory.wav"],
  // ["victory_3", "victory_3.mp3"],
  // ["yablochko", "yablochko_placeholder.mp3"],
  // ["fireworks", "fireworks.mp3"],
  // ["alarm_clock", "alarm_clock.wav"],
  // ["keyboard_click_1", "keyboard_click_1.wav"],
  // ["keyboard_click_2", "keyboard_click_2.wav"],
  // ["keyboard_click_3", "keyboard_click_3.wav"],
  // ["keyboard_click_4", "keyboard_click_4.wav"],
  // ["keyboard_click_5", "keyboard_click_5.wav"],
  // ["swipe", "swipe.wav"],
  // ["move", "move.wav"],
  // ["descending_plinks", "descending_plinks.mp3"],
  // ["build", "build.wav"],
  // ["multibuild", "multibuild.wav"],
  // ["button_accept", "button_accept.wav"],
  // ["switch_option", "switch_option.wav"],
  // ["button_chirp", "button_chirp.wav"],
  // ["door", "door.wav"],
  // ["accept", "accept.wav"],
  // ["listen", "listen.wav"],
  // ["grunt", "grunt.wav"],
  // ["hurt", "hurt.wav"],
  // ["hyah_1", "hyah_1.wav"],
  // ["hyah_2", "hyah_2.wav"],
  // ["hyah_3", "hyah_3.wav"],
  // ["hyah_4", "hyah_4.wav"],
  // ["hey", "hey.wav"],
  // ["success", "success.wav"],
  // ["toot", "toot.wav"],
  // ["big_rocket", "big_rocket.mp3"],
  // ["academic_mumble_1", "academic_mumble_1.wav"],
  // ["academic_mumble_2", "academic_mumble_2.wav"],
  // ["academic_mumble_3", "academic_mumble_3.wav"],
  // ["academic_mumble_4", "academic_mumble_4.wav"],
  // ["Chant_1", "Chant_1.wav"],
  // ["Chant_2", "Chant_2.wav"],
  // ["Chant_3", "Chant_3.wav"],
  // ["Chant_4", "Chant_4.wav"],
  // ["huh", "huh.wav"],
  // ["slap_1", "slap_1.wav"],
  // ["slap_2", "slap_2.wav"],
  // ["slap_3", "slap_3.wav"],
  // ["slap_4", "slap_4.wav"],
  // ["jump_1", "jump_1.wav"],
  // ["jump_2", "jump_2.wav"],
  // ["jump_3", "jump_3.wav"],
  // ["countdown", "countdown.mp3"],
  // ["ding_ding_ding", "ding_ding_ding.mp3"],
  // ["intro", "intro.mp3"],
  // ["action_song_1", "David_Fesliyan_Retro_Platforming.mp3"],
  // ["action_song_2", "David_Renda_Retro_Funk.mp3"],
  // ["action_song_3", "Abstraction_Ludum_Dare_28_Track_Eight.mp3"],
  // ["title_song", "Nene_Boss_Battle_6_cc0.mp3"],
  // ["cutscene_song", "Abstraction_Ludum_Dare_28_Track_Three.mp3"],
  // ["putzen_song", "Suez_Crisis.mp3"],
  // ["final_song", "Nene_Count_Down_cc0.mp3"],
  // ["marche_slav", "marche_slav.mp3"],
]


let sound_data = [];
for (let i = 0; i < sound_files.length; i++) {
  file = sound_files[i];
  sound_data[file[0]] = new Howl({preload: true, src: ["Sound/" + file[1]]})
}


soundEffect = function(effect_name, volume=sound_volume) {
  if (use_sound && volume > 0) {
    var sound_effect = sound_data[effect_name];
    if (sound_effect != null) {
      sound_effect.volume(volume);
      sound_effect.play();
    }
  }
}


stopSoundEffect = function(effect_name) {
  if (sound_volume > 0) {
    var sound_effect = sound_data[effect_name];
    if (sound_effect != null) {
      sound_effect.stop();
    }
  }
}


stopAllSound = function() {
  for (const [key, value] of Object.entries(sound_data)) {
    sound_data[key].stop();
  }
}


pauseSoundEffect = function(effect_name) {
  if (sound_data[effect_name].playing() == true) {
    sound_data[effect_name].hold_up = true;
    sound_data[effect_name].pause();
  }
}


resumeSoundEffect = function(effect_name) {
  if (sound_data[effect_name] != null && sound_data[effect_name].hold_up == true) {
    sound_data[effect_name].hold_up = null;
    sound_data[effect_name].play();
  }
}


setMusic = function(music_name, loop = true) {
  if (use_music && music_volume > 0) {
    if (current_music != null && current_music.name == music_name) {
      return;
    }

    let crossfade = false;
    if (current_music != null && current_music.name != music_name) {
      crossfade = true;
      fadeMusic(500);
    }

    current_music = sound_data[music_name];
    if (current_music != null) {
      current_music.name = music_name;
      current_music.loop(loop);
      current_music.volume(music_volume);
      current_music.play();

      if (crossfade) {
        for (let i = 0; i < 14; i++) {
          delay(function() {
            current_music.volume(i / 20);
          }, 50 * i);
        }
      } else {
        current_music.volume(0.6);
      }
    }
  }
}


stopMusic = function() {
  if (current_music != null) {
    current_music.stop();
    current_music = null;
  }
}


fadeMusic = function(delay_time = 0) {
  if (current_music != null) {
    old_music = current_music;
    current_music = null;
    for (let i = 0; i < 14; i++) {
      delay(function() {
        old_music.volume((13 - i) / 20);
      }, delay_time + 50 * i);
    }
    setTimeout(function() {
      // TO DO
      // DELETE OLD MUSIC
      old_music = null;
    }, 1500);
  }
}


toggleMusic = function(song = null) {
  use_music = !use_music;
  if (use_music == false) {
    stopMusic();
  } else if (song != null) {
    setMusic(song);
  }
  localStorage.setItem("oneson_use_music", use_music);
}


toggleSound = function() {
  use_sound = !use_sound;
  localStorage.setItem("oneson_use_sound", use_sound);
}


keySound = function(key, volume=1.0) {
  let click_sound = "keyboard_click_" + ((key.charCodeAt(0) % 5)+1).toString();
  soundEffect(click_sound, volume);
}