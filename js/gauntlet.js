Gauntlet = function() {

  'use strict';

  //===========================================================================
  // CONFIGURATION CONSTANTS and ENUM's
  //===========================================================================

  var VERSION  = "1.0.1",
/// allow debug mode testing - code should be removed pre-release
											DEBUGON = 1,
// debug - provide a one time start level
											initlevel = 9,
/// end debug tier
// music control - needs user interf
// this turns off the ver 1.0.0 background music when true
		NOBKGMUSIC = 1,
// set to 1 to run original code
		RUNORG = 0,
// when hitting last seq level, pick a random # between loop start and last level
// set rnd_level true to indicate running rnd levels from here on out
		loop_level = 8,
		rnd_level = 0,
// save to pointers. -> reload level parts, walls to exits, stall open doors, play sounds for those, and so on
// for some reason beyond me, setTimeout() calls only work in game.js - which has none of the game instances
// also doors / walls are stalled open from player health rot - which has none of these pointers loaded
// and could not get exit instance to pass exit to 4, 8 passed into the level load code
// if there is a non global var method of passing these class inheritance pointers around - I know it not
		reloaded, Mastercell, Masterthmp, Musicth, Mastermap, wallsprites, entsprites,
		levelplus, refpixel, shotpot, slowmonster = 1, announcepause = false,
//	custom g1 tiler on 0x00000F code of floor tiles - save last tile & last cell
// FCUSTILE is after brikover last wall cover in backgrounds.png
		ftilestr, fcellstr, FCUSTILE = 37, FDESTWALL = 38,

		 MEXHIGH = 0xFFFFF0,
		 MEXLOW = 0x00000F,
// uses exlow to select next item in set
// these are based on where items appear in TREASURES[ ]
		POWERADD = 4, LIMITEDADD = 8,

// g1 custom walls diff from main wall mapped on EXLOW
			G1WALL = [	8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26	],

// handle death potion bomb rotating score - 
//				note: NON g1, this is multiplied by score x {n} by current code!
		Deathmult, Dmmax = 7,
		Deathscore = [1000, 4000, 2000, 6000, 1000, 8000, 1000, 2000],

      FPS      = 60,
      TILE     = 32,
      STILE    = 32,
      VIEWPORT = { TW: 24, TH: 24 },
      DIR      = { UP: 0, UPRIGHT: 1, RIGHT: 2, DOWNRIGHT: 3, DOWN: 4, DOWNLEFT: 5, LEFT: 6, UPLEFT: 7 },
// teleport adjust by last player dir		- use player dir code (0 - 7) and these on teleport {x,y} to test surrounding cells
		DIRTX = [ 0, 32, 32, 32, 0, -32, -32, -32],
		DIRTY = [ -32, -32, 0, 32, 32, 32, 0, -32],
      PLAYER = {
        WARRIOR:  { sx: 0, sy: 0, frames: 3, fpf: FPS/10, health: 2000, speed: 180/FPS, damage: 50/FPS, armor: 2, magic: 16, weapon: { speed: 600/FPS, reload: 0.40*FPS, damage: 7, rotate: true,  sx: 24, sy: 0, fpf: FPS/10, player: true }, sex: "male",   name: "warrior"  }, // Thor
        VALKYRIE: { sx: 0, sy: 1, frames: 3, fpf: FPS/10, health: 2000, speed: 215/FPS, damage: 40/FPS, armor: 3, magic: 16, weapon: { speed: 620/FPS, reload: 0.35*FPS, damage: 4, rotate: false, sx: 24, sy: 1, fpf: FPS/10, player: true }, sex: "female", name: "valkyrie" }, // Thyra
        WIZARD:   { sx: 0, sy: 2, frames: 3, fpf: FPS/10, health: 2000, speed: 190/FPS, damage: 30/FPS, armor: 1, magic: 32, weapon: { speed: 640/FPS, reload: 0.30*FPS, damage: 6, rotate: false, sx: 24, sy: 2, fpf: FPS/10, player: true }, sex: "male",   name: "wizard"   }, // Merlin
        ELF:      { sx: 0, sy: 3, frames: 3, fpf: FPS/10, health: 2000, speed: 245/FPS, damage: 20/FPS, armor: 1, magic: 24, weapon: { speed: 660/FPS, reload: 0.25*FPS, damage: 4, rotate: false, sx: 24, sy: 3, fpf: FPS/10, player: true }, sex: "male",   name: "elf"      }  // Questor
      },
      MONSTER = {
        GHOST:  { sx: 0, sy: 4, frames: 3, fpf: FPS/10, score:  10, health:  4, speed: 140/FPS, damage: 100/FPS, selfharm: 30/FPS, canbeshot: true,  canbehit: false, invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health:  8, speed: 2.5*FPS, max: 40, score: 100, sx: 32, sy: 4 }, name: "ghost",  weapon: null      , help: "Player loses # health - shoot or avoid ghosts"                                                                               },
        DEMON:  { sx: 0, sy: 5, frames: 3, fpf: FPS/10, score:  20, health:  4, speed:  80/FPS, damage:  60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 16, speed: 3.0*FPS, max: 40, score: 200, sx: 32, sy: 5 }, name: "demon",  weapon: { speed: 240/FPS, reload: 2*FPS, damage: 10, sx: 24, sy: 5, fpf: FPS/10, monster: true } },
        GRUNT:  { sx: 0, sy: 6, frames: 3, fpf: FPS/10, score:  30, health:  8, speed: 120/FPS, damage:  60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 16, speed: 3.5*FPS, max: 40, score: 300, sx: 32, sy: 6 }, name: "grunt",  weapon: null                                                                                     },
        WIZARD: { sx: 0, sy: 7, frames: 3, fpf: FPS/10, score:  30, health:  8, speed: 120/FPS, damage:  60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: { on: 3*FPS, off: 6*FPS }, travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 24, speed: 4.0*FPS, max: 20, score: 400, sx: 32, sy: 7 }, name: "sorcerer", weapon: null                                                                                     },
        DEATH:  { sx: 0, sy: 8, frames: 3, fpf: FPS/10, score: 1, health: 2, speed: 180/FPS, damage: 120/FPS, selfharm: 6/FPS,  canbeshot: false, canbehit: 2, invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 16, speed: 5.0*FPS, max: 10, score: 1000, sx: 32, sy: 8 }, name: "death",  weapon: null                                                                                     },
        LOBBER: { sx: 0, sy: 9, frames: 3, fpf: FPS/10, score:  10, health:  4, speed: 60/FPS, damage:  40/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false, travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 8, speed: 2.5*FPS, max: 20, score: 100, sx: 32, sy: 7 }, name: "lobber", weapon: null                                                                                     },
// added level 2, level 1 monsters - set above is level 3
		  GHOST1:  { sx: 0, sy: 14, frames: 3, fpf: FPS/10, score:  10, health:  4, speed: 140/FPS, damage: 100/FPS, selfharm: 30/FPS, canbeshot: true,  canbehit: false, invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health:  4, speed: 2.5*FPS, max: 40, score: 50, sx: 34, sy: 4 }, name: "ghost",  weapon: null       , help: "Player loses # health - shoot or avoid ghosts"                                                                              },
        DEMON1:  { sx: 0, sy: 16, frames: 3, fpf: FPS/10, score:  20, health:  4, speed:  80/FPS, damage:  60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 16, speed: 3.0*FPS, max: 40, score: 200, sx: 34, sy: 5 }, name: "demon",  weapon: { speed: 240/FPS, reload: 2*FPS, damage: 10, sx: 24, sy: 5, fpf: FPS/10, monster: true } },
        GRUNT1:  { sx: 0, sy: 18, frames: 3, fpf: FPS/10, score:  30, health:  8, speed: 120/FPS, damage:  60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 16, speed: 3.5*FPS, max: 40, score: 300, sx: 34, sy: 6 }, name: "grunt",  weapon: null                                                                                     },
        WIZARD1: { sx: 0, sy: 20, frames: 3, fpf: FPS/10, score:  30, health:  8, speed: 120/FPS, damage:  60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: { on: 3*FPS, off: 6*FPS }, travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 24, speed: 4.0*FPS, max: 20, score: 400, sx: 34, sy: 7 }, name: "sorcerer", weapon: null                                                                                     },
        LOBBER1: { sx: 0, sy: 22, frames: 3, fpf: FPS/10, score:  10, health:  4, speed: 60/FPS, damage:  40/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false, travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 8, speed: 2.5*FPS, max: 20, score: 100, sx: 34, sy: 7 }, name: "lobber", weapon: null                                                                                     },
        GHOST2:  { sx: 0, sy: 13, frames: 3, fpf: FPS/10, score:  10, health:  4, speed: 140/FPS, damage: 100/FPS, selfharm: 30/FPS, canbeshot: true,  canbehit: false, invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health:  4, speed: 2.5*FPS, max: 40, score: 50, sx: 33, sy: 4 }, name: "ghost",  weapon: null       , help: "Player loses # health - shoot or avoid ghosts"                                                                              },
        DEMON2:  { sx: 0, sy: 15, frames: 3, fpf: FPS/10, score:  20, health:  4, speed:  80/FPS, damage:  60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 16, speed: 3.0*FPS, max: 40, score: 200, sx: 33, sy: 5 }, name: "demon",  weapon: { speed: 240/FPS, reload: 2*FPS, damage: 10, sx: 24, sy: 5, fpf: FPS/10, monster: true } },
        GRUNT2:  { sx: 0, sy: 17, frames: 3, fpf: FPS/10, score:  30, health:  8, speed: 120/FPS, damage:  60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 16, speed: 3.5*FPS, max: 40, score: 300, sx: 33, sy: 6 }, name: "grunt",  weapon: null                                                                                     },
        WIZARD2: { sx: 0, sy: 19, frames: 3, fpf: FPS/10, score:  30, health:  8, speed: 120/FPS, damage:  60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: { on: 3*FPS, off: 6*FPS }, travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 24, speed: 4.0*FPS, max: 20, score: 400, sx: 33, sy: 7 }, name: "sorcerer", weapon: null                                                                                     },
        LOBBER2: { sx: 0, sy: 21, frames: 3, fpf: FPS/10, score:  10, health:  4, speed: 60/FPS, damage:  40/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false, travelling: 0.5*FPS, thinking: 0.5*FPS, generator: { health: 8, speed: 2.5*FPS, max: 20, score: 100, sx: 33, sy: 7 }, name: "lobber", weapon: null                                                                                     }
      },

		HELPCLEAR = [ ],	// help messages only display one time or can be turned off
		helpdsf = "Some food destroyed by shots", helpsap = "Shooting a potion has a lesser effect", helpcmb = "Collect magic potion before pressing magic",
		helppois = "Shooting poison slows monsters",
		nohlpdsf = 25, nohlpsap = 26, nohlpcmb = 27, nohlppois = 28,
// dont shoot food				25
// shooting a potion			26
// collect magic before	27
		helpcleared = 0, // option - tutorial count down 
      TREASURE = {
        HEALTH:  { sx: 0, sy: 11, frames: 1, fpf: FPS/10, score:  10, health:  100, canbeshot: 2,   sound: 'collectfood', help: "Food: health increased by 100", nohlp: 2 },
        POISON:  { sx: 1, sy: 11, frames: 1, fpf: FPS/10, score:   0, damage:  50, poison: true, canbeshot: 2,   sound: 'collectpotion' },
        FOOD1:   { sx: 3, sy: 11, frames: 1, fpf: FPS/10, score:  10, health:  100,   sound: 'collectfood', help: "Food: health increased by 100" , nohlp: 2  },
        FOOD2:   { sx: 4, sy: 11, frames: 1, fpf: FPS/10, score:  10, health:  100,   sound: 'collectfood', help: "Food: health increased by 100" , nohlp: 2  },
        FOOD3:   { sx: 5, sy: 11, frames: 1, fpf: FPS/10, score:  10, health:  100,   sound: 'collectfood', help: "Food: health increased by 100", nohlp: 2   },
        KEY:     { sx: 21, sy: 10, frames: 1, fpf: FPS/10, score:  20, key:    true,  sound: 'collectkey' , help: "Save keys to open doors", nohlp: 3   },
        POTION:  { sx: 6, sy: 11, frames: 1, fpf: FPS/10, score:  50, potion: true, canbeshot: 2,  sound: 'collectpotion', help: "Save potions for later use", nohlp: 4 },
        POTIONORG:  { sx: 7, sy: 11, frames: 1, fpf: FPS/10, score:  50, potion: true, canbeshot: 0,  sound: 'collectpotion', help: "Save potions for later use", nohlp: 4  },
        GOLD:    { sx: 16, sy: 10, frames: 3, fpf: FPS/10, score: 100,  scmult : 1,              sound: 'collectgold', help: "Treasure: 100 points", nohlp: 1   },
        LOCKED:    { sx: 19, sy: 10, frames: 1, fpf: FPS/10, score: 500,  lock: true,              sound: 'collectgold', help: "Some chests are locked"   },
        BAG:    { sx: 20, sy: 10, frames: 1, fpf: FPS/10, score: 500,  scmult : 3.5,                sound: 'collectgold', help: "Treasure: 500 points", nohlp: 1   },
// teleport, trap, stun tiles as treasure objects for now -- these are animated, and operate on touch so it works
        TELEPORT:       { sx: 1, sy: 12, frames:4, speed: 1*FPS, fpf: FPS/5, teleport: true,   sound: 'teleport', help: "Transporters move you to<br> the closest transporter visible", nohlp: 6  },
        TRAP:       { sx: 23, sy: 10, frames:4, speed: 1*FPS, fpf: FPS/5, trap: true,   sound: 'trap', help: "Traps make walls disappear", nohlp: 5 },
        STUN:       { sx: 27, sy: 10, frames:4, speed: 1*FPS, fpf: FPS/4, stun: true,   sound: 'stun', help: "Some tiles stun players", nohlp: 7  },
        PUSH:       { sx: 0, sy: 12, frames:1, speed: 1*FPS, fpf: FPS/4, push: true,   sound: 'null'  },
// extra power potions
        XSPEED:       { sx: 9, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, potion: true, canbeshot: 2,   sound: 'collectpotion', help: "You got extra speed", nohlp: 10  },
        LIMINVIS:       { sx: 15, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true,   sound: 'collectpotion', help: "You now have limited invisibility", nohlp: 17  },
// shootable wall - see grid 38 of backgrounds
        SHOTWALL:       { sx: 0, sy: 38, frames:1, speed: 1*FPS, fpf: FPS/4, canbeshot: 2, health:14, wall:true,   sound: 'collectpotion' , help: "Some walls may be destroyed", nohlp: 7 },
// shotable and non-shot fake items, see grid 39 of backgrounds
        SHOTFAKER:       { sx: 0, sy: 39, frames:1, speed: 1*FPS, fpf: FPS/4, canbeshot: 2, health:14, wall:true,   sound: 'collectpotion' , help: "Fooled you!", nohlp: 29 },
        PERMFAKER:       { sx: 0, sy: 39, frames:1, speed: 1*FPS, fpf: FPS/4, canbeshot: false, wall:true,   sound: 'collectpotion' , help: "Fooled you!", nohlp: 29 },
        XSHOTPWR:       { sx: 10, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, potion: true, canbeshot: 2,   sound: 'collectpotion', help: "You got extra shot power", nohlp: 11  },
        XSHOTSPD:       { sx: 11, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, potion: true, canbeshot: 2,   sound: 'collectpotion', help: "You got extra shot speed", nohlp: 12  },
        XARMOR:       { sx: 12, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, potion: true, canbeshot: 2,   sound: 'collectpotion', help: "You got extra armor", nohlp: 13  },
        XFIGHT:       { sx: 13, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, potion: true, canbeshot: 2,   sound: 'collectpotion' , help: "You got extra fight power", nohlp: 14 },
        XMAGIC:       { sx: 14, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, potion: true, canbeshot: 2,   sound: 'collectpotion', help: "You got extra magic power", nohlp: 15  },
        LIMINVUL:       { sx: 16, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true,   sound: 'collectpotion', help: "You now have invulnerability", nohlp: 18  },
        LIMREPUL:       { sx: 17, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true,   sound: 'collectpotion', help: "You now have extra repulsiveness", nohlp: 19  },
        LIMREFLC:       { sx: 18, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true,   sound: 'collectpotion', help: "You now have reflective shots", nohlp: 20  },
        LIMSUPER:       { sx: 19, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true,   sound: 'collectpotion', help: "You now have super shots", nohlp: 21  },
        LIMTELE:       { sx: 20, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true,   sound: 'collectpotion', help: "You now have teleportability", nohlp: 22  },
        LIMANK:       { sx: 21, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true,   sound: 'collectpotion', help: "You now have the life ankh", nohlp: 23  },
        BADPOT:  { sx: 8, sy: 11, frames: 1, fpf: FPS/10, score:   0, damage:  50, poison: true, canbeshot: 2,   sound: 'collectpotion' }
      },
		TELEPORTILE = 0x0080a0,
// until target traps are coded any trap will remove these
		TRAPWALL = 0x404030,
		TRAPTRIG = 0x0080b0,
// after {n} health tics with no player move / fire, all walls are exits
/// RESTORE to 200
		WALLSTALL = 100,
// after {n} health tics with no player move / fire, all doors open
/// RESTORE to 30
		DOORSTALL = 30,
		stalling,
// doors open counter-clockwise and stop opening in a clockwise dir when hitting corners & Ts
		doorstop = [ 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0 ],
      DOOR = {
        HORIZONTAL: { sx: 10, sy: 10, speed: 0.05*FPS, horizontal: true,  vertical: false, dx: 2, dy: 0 },
        VERTICAL:   { sx: 5, sy: 10, speed: 0.05*FPS, horizontal: false, vertical: true,  dx: 0, dy: 8 },
        EXIT:       { sx: 9, sy: 12, speed: 3*FPS, fpf: FPS/30 },
// added "exit to {n}", moving and fake exits
        EXIT4:       { sx: 10, sy: 12, speed: 3*FPS, fpf: FPS/30, lvlp: 4 },
        EXIT8:       { sx: 11, sy: 12, speed: 3*FPS, fpf: FPS/30, lvlp: 8 },
        EXIT6:       { sx: 12, sy: 12, speed: 3*FPS, fpf: FPS/30, lvlp: 6 },
        EXITMOVE:       { sx: 13, sy: 12, speed: 3*FPS, fpf: FPS/30 },
        EXITNONE:       { sx: 9, sy: 12, speed: 1*FPS, fpf: FPS/30 }
      },
      FX = {
        GENERATOR_DEATH: { sx: 17, sy: 12, frames: 6, fpf: FPS/10 },
        MONSTER_DEATH:   { sx: 17, sy: 12, frames: 6, fpf: FPS/20 },
        WEAPON_HIT:      { sx: 23, sy: 12, frames: 2, fpf: FPS/20 },
        PLAYER_GLOW:     { frames: FPS/2, border: 5 }
      },
      PLAYERS   = [ PLAYER.WARRIOR, PLAYER.VALKYRIE, PLAYER.WIZARD, PLAYER.ELF ],
      MONSTERS  = [ MONSTER.GHOST, MONSTER.DEMON, MONSTER.GRUNT, MONSTER.WIZARD, MONSTER.DEATH, MONSTER.LOBBER, MONSTER.GHOST1, MONSTER.DEMON1, MONSTER.GRUNT1, MONSTER.WIZARD1, MONSTER.LOBBER1, MONSTER.GHOST2, MONSTER.DEMON2, MONSTER.GRUNT2, MONSTER.WIZARD2, MONSTER.LOBBER2 ],
      TREASURES = [ TREASURE.HEALTH, TREASURE.POISON, TREASURE.FOOD1, TREASURE.FOOD2, TREASURE.FOOD3, TREASURE.KEY, TREASURE.POTION, TREASURE.GOLD, 
											TREASURE.LOCKED, TREASURE.BAG, TREASURE.TELEPORT, TREASURE.TRAP, TREASURE.STUN, TREASURE.PUSH,
											TREASURE.XSPEED, TREASURE.LIMINVIS, TREASURE.SHOTWALL, TREASURE.SHOTFAKER, TREASURE.PERMFAKER, 
											TREASURE.XSHOTPWR, TREASURE.XSHOTSPD, TREASURE.XARMOR, TREASURE.XFIGHT, TREASURE.XMAGIC,
											TREASURE.LIMINVUL, TREASURE.LIMREPUL, TREASURE.LIMREFLC, TREASURE.LIMSUPER, TREASURE.LIMTELE, TREASURE.LIMANK,
											TREASURE.POTIONORG, TREASURE.BADBOT ],
      CBOX = {
        FULL:    { x: 0,      y: 0,      w: TILE,   h: TILE          },
        PLAYER:  { x: TILE/4, y: TILE/4, w: TILE/2, h: TILE - TILE/4 },
        WEAPON:  { x: TILE/3, y: TILE/3, w: TILE-30, h: TILE-30        },		// w,h tile-30 mostly gives shot thru diagonal gap
        MONSTER: { x: 1,      y: 1,      w: TILE-2, h: TILE-2        }, // give monsters 1px wiggle room to get through tight corridors
      },
      PIXEL = {
        NOTHING:        0x000000, // BLACK
        DOOR:           0xC0C000, // YELLOW
        WALL:           0x404000, // DARK YELLOW
        GENERATOR:      0xF00000, // RED
        MONSTER:        0x400000, // DARK RED
        START:          0x00F000, // GREEN
        TREASURE:       0x008000, // MEDIUM GREEN
        EXIT:           0x004000, // DARK GREEN
        MASK: {
          TYPE:         0xFFF000,
          EXHIGH:       0x000FF0,
          EXLOW:        0x00000F
        }
      },
// jvsg floors - g1 floors are handled in a seperate gfx file as they tile (currently) 256 x 256 (4 x 4 cells) over the map due to diff design per tile
      FLOOR = { 	BROWN_BOARDS: 1, LIGHBROWN_BOARDS: 2, GREEN_BOARDS: 3, GREY_BOARDS: 4, WOOD: 5, LIGHT_STONE: 6, DARK_STONE: 7, BROWN_LAMINATE: 8, 
									PURPLE_LAMINATE: 9, RND: 10,
									MIN: 1, MAX: 9 },
      WALL  = { 	INVIS: 1, BLUE: 2, BLUE_BRICK: 3, PURPLE_TILE: 4, BLUE_COBBLE: 5, PURPLE_COBBLE: 6, CONCRETE: 7, 
// g1 wall codes - these are in backgrounds.png
								G2DARKSEC: 8, GRAY7: 9, MAUVE20: 10, 
								BROWN1: 11, BROWN24: 12, RED5: 13, ORANG9: 14, ORANG31: 15, YELLOW10: 16,
								PINK34: 17, PURPLE77: 18, PURPLE30: 19,  
								BLUE8: 20, BLUE25:21, BLUE28: 22, 
								GREEN3: 23, GREEN16: 24, GREEN50: 25, G2GREEN99: 26, 
									G1BRICKL: 27, G1BRICKD: 28, BRICK2L: 29, BRICK2D: 30, ASYML: 31, ASYMD: 32, XBRIKL: 33, XBRIKD: 34, G5COBRIK: 35, DESTBRIK: 36,
									MIN: 1, MAX: 25 },
      EVENT = {
        START_LEVEL:         0,
        PLAYER_JOIN:         1,
        PLAYER_LEAVE:        2,
        PLAYER_EXITING:      3,
        PLAYER_EXIT:         4,
        PLAYER_DEATH:        5,
        PLAYER_NUKE:         6,
        PLAYER_FIRE:         7,
        PLAYER_HURT:         8,
        PLAYER_HEAL:         9,
        MONSTER_DEATH:      10,
        MONSTER_FIRE:       11,
        GENERATOR_DEATH:    12,
        DOOR_OPENING:       13,
        DOOR_OPEN:          14,
        TREASURE_COLLECTED: 15,
        PLAYER_COLLIDE:     16,
        MONSTER_COLLIDE:    17,
        WEAPON_COLLIDE:     18,
        FX_FINISHED:        19,
        HIGH_SCORE:         20
      },
      STORAGE = {
        VERSION: "gauntlet.version",
        NLEVEL:  "gauntlet.nlevel",
        SCORE:   "gauntlet.score",
        WHO:     "gauntlet.who"
      },
      DEBUG = {
        RESET:      Game.qsBool("reset"),
        GRID:       Game.qsBool("grid"),
/// RESTORE !
        NOMONSTERS: Game.qsBool("nomonsters"),
//        NOMONSTERS: 1, //: Game.qsBool("nomonsters"),
        NODAMAGE:   Game.qsBool("nodamage"),
        NOAUTOHURT: Game.qsBool("noautohurt"),
        POTIONS:    Game.qsNumber("potions"),
        KEYS:       Game.qsNumber("keys"),
        LEVEL:      Game.qsNumber("level"),
        PLAYER:     (Game.qsValue("player") || "warrior").toUpperCase(),
        WALL:       Game.qsNumber("wall"),
        FLOOR:      Game.qsNumber("floor"),
        MUSIC:      Game.qsValue("music"),
        HEAP:       Game.qsBool("heap")
      };

  //---------------------------------------------------------------------------

  var PREFERRED_DIRECTIONS = {};
  PREFERRED_DIRECTIONS[DIR.UPLEFT]    = [ DIR.UPLEFT,    DIR.LEFT,     DIR.UP,        DIR.UPRIGHT,  DIR.DOWNLEFT  ];
  PREFERRED_DIRECTIONS[DIR.UPRIGHT]   = [ DIR.UPRIGHT,   DIR.RIGHT,    DIR.UP,        DIR.UPLEFT,   DIR.DOWNRIGHT ];
  PREFERRED_DIRECTIONS[DIR.DOWNLEFT]  = [ DIR.DOWNLEFT,  DIR.LEFT,     DIR.DOWN,      DIR.UPLEFT,   DIR.DOWNRIGHT ];
  PREFERRED_DIRECTIONS[DIR.DOWNRIGHT] = [ DIR.DOWNRIGHT, DIR.RIGHT,    DIR.DOWN,      DIR.DOWNLEFT, DIR.UPRIGHT   ];
  PREFERRED_DIRECTIONS[DIR.UP]        = [ DIR.UP,        DIR.UPLEFT,   DIR.UPRIGHT,   DIR.LEFT,     DIR.RIGHT     ];
  PREFERRED_DIRECTIONS[DIR.DOWN]      = [ DIR.DOWN,      DIR.DOWNLEFT, DIR.DOWNRIGHT, DIR.LEFT,     DIR.RIGHT     ];
  PREFERRED_DIRECTIONS[DIR.LEFT]      = [ DIR.LEFT,      DIR.UPLEFT,   DIR.DOWNLEFT,  DIR.UP,       DIR.DOWN      ];
  PREFERRED_DIRECTIONS[DIR.RIGHT]     = [ DIR.RIGHT,     DIR.UPRIGHT,  DIR.DOWNRIGHT, DIR.UP,       DIR.DOWN      ];

  var SLIDE_DIRECTIONS = {};
  SLIDE_DIRECTIONS[DIR.UPLEFT]    = [ DIR.UPLEFT,    DIR.UP,   DIR.LEFT  ];
  SLIDE_DIRECTIONS[DIR.UPRIGHT]   = [ DIR.UPRIGHT,   DIR.UP,   DIR.RIGHT ];
  SLIDE_DIRECTIONS[DIR.DOWNLEFT]  = [ DIR.DOWNLEFT,  DIR.DOWN, DIR.LEFT  ];
  SLIDE_DIRECTIONS[DIR.DOWNRIGHT] = [ DIR.DOWNRIGHT, DIR.DOWN, DIR.RIGHT ];
  SLIDE_DIRECTIONS[DIR.UP]        = [ DIR.UP    ];
  SLIDE_DIRECTIONS[DIR.DOWN]      = [ DIR.DOWN  ];
  SLIDE_DIRECTIONS[DIR.LEFT]      = [ DIR.LEFT  ];
  SLIDE_DIRECTIONS[DIR.RIGHT]     = [ DIR.RIGHT ];

  //===========================================================================
  // CONFIGURATION
  //===========================================================================

  var cfg = {

// cataboligne - note: set stats to false to turn off fps and timing update stats lower right
    runner: {
      fps:   FPS,
      stats: true
    },

    state: {
      initial: 'booting',
      events: [
        { name: 'ready',  from: 'booting',               to: 'menu'     }, // initial page loads images and sounds then transitions to 'menu'
        { name: 'start',  from: 'menu',                  to: 'starting' }, // start a new game from the menu
        { name: 'load',   from: ['starting', 'playing'], to: 'loading'  }, // start loading a new level (either to start a new game, or next level while playing)
        { name: 'play',   from: 'loading',               to: 'playing'  }, // play the level after loading it
        { name: 'help',   from: ['loading', 'playing'],  to: 'help'     }, // pause the game to show a help topic
        { name: 'tween',   from: 'playing',  to: 'tween'     }, // between level screen
        { name: 'resume', from: ['help', 'tween' ] ,     to: 'playing'  }, // resume playing after showing a help topic
        { name: 'lose',   from: 'playing',               to: 'lost'     }, // player died
        { name: 'quit',   from: 'playing',               to: 'lost'     }, // player quit
        { name: 'win',    from: 'playing',               to: 'won'      }, // player won
        { name: 'finish', from: ['won', 'lost'],         to: 'menu'     }  // back to menu
      ]
    },

    pubsub: [
      { event: EVENT.MONSTER_DEATH,      action: function(monster, by, nuke) { this.onMonsterDeath(monster, by, nuke);     } },
      { event: EVENT.GENERATOR_DEATH,    action: function(generator, by)     { this.onGeneratorDeath(generator, by);       } },
      { event: EVENT.DOOR_OPENING,       action: function(door, speed)       { this.onDoorOpening(door, speed);            } },
      { event: EVENT.DOOR_OPEN,          action: function(door)              { this.onDoorOpen(door);                      } },
      { event: EVENT.TREASURE_COLLECTED, action: function(treasure, player)  { this.onTreasureCollected(treasure, player); } },
      { event: EVENT.WEAPON_COLLIDE,     action: function(weapon, entity)    { this.onWeaponCollide(weapon, entity);       } },
      { event: EVENT.PLAYER_COLLIDE,     action: function(player, entity)    { this.onPlayerCollide(player, entity);       } },
      { event: EVENT.MONSTER_COLLIDE,    action: function(monster, entity)   { this.onMonsterCollide(monster, entity);     } },
      { event: EVENT.PLAYER_NUKE,        action: function(player)            { this.onPlayerNuke(player);                  } },
      { event: EVENT.PLAYER_FIRE,        action: function(player)            { this.onPlayerFire(player);                  } },
      { event: EVENT.MONSTER_FIRE,       action: function(monster)           { this.onMonsterFire(monster);                } },
      { event: EVENT.PLAYER_EXITING,     action: function(player, exit)      { this.onPlayerExiting(player, exit);         } },
      { event: EVENT.PLAYER_EXIT,        action: function(player)            { this.onPlayerExit(player);                  } },
      { event: EVENT.FX_FINISHED,        action: function(fx)                { this.onFxFinished(fx);                      } },
      { event: EVENT.PLAYER_DEATH,       action: function(player)            { this.onPlayerDeath(player);                 } }
    ],

    images: [
      { id: 'backgrounds', url: "images/backgrounds.png" }, // http://opengameart.org/content/gauntlet-like-tiles
      { id: 'entities',    url: "images/entities.png"    }  // http://opengameart.org/forumtopic/request-for-tileset-spritesheet-similar-to-gauntlet-ii 
    ],

    sounds: [
/// RESTORE!
//      { id: 'gtitle',      name: 'sounds/music.title',      formats: ['mp3', 'ogg'], volume: 1.0, loop: false             },
      { id: 'gtitle',      name: 'sounds/music.4sec',      formats: ['mp3', 'ogg'], volume: 1.0, loop: false             },
      { id: 'g4sec',      name: 'sounds/music.4sec',      formats: ['mp3', 'ogg'], volume: 1.0, loop: false             },
      { id: 'lostcorridors',   name: 'sounds/music.lostcorridors',   formats: ['mp3', 'ogg'], volume: 0.5, loop: true             }, // http://luckylionstudios.com/
      { id: 'bloodyhalo',      name: 'sounds/music.bloodyhalo',      formats: ['mp3', 'ogg'], volume: 0.25, loop: true             }, // (ditto)
      { id: 'citrinitas',      name: 'sounds/music.citrinitas',      formats: ['mp3', 'ogg'], volume: 0.25, loop: true             }, //
      { id: 'fleshandsteel',   name: 'sounds/music.fleshandsteel',   formats: ['mp3', 'ogg'], volume: 0.25, loop: true             }, //
      { id: 'mountingassault', name: 'sounds/music.mountingassault', formats: ['mp3', 'ogg'], volume: 0.25, loop: true             }, //
      { id: 'phantomdrone',    name: 'sounds/music.phantomdrone',    formats: ['mp3', 'ogg'], volume: 0.25, loop: true             }, //
      { id: 'thebeginning',    name: 'sounds/music.thebeginning',    formats: ['mp3', 'ogg'], volume: 0.25, loop: true             }, //
      { id: 'warbringer',      name: 'sounds/music.warbringer',      formats: ['mp3', 'ogg'], volume: 0.25, loop: true             }, //
      { id: 'gameover',        name: 'sounds/gameover',              formats: ['mp3', 'ogg'], volume: 0.3                         }, //
      { id: 'victory',         name: 'sounds/victory',               formats: ['mp3', 'ogg'], volume: 1.0                         }, //
      { id: 'femalepain1',     name: 'sounds/femalepain1',           formats: ['mp3', 'ogg'], volume: 0.3                         }, // http://www.premiumbeat.com/sfx/
      { id: 'femalepain2',     name: 'sounds/femalepain2',           formats: ['mp3', 'ogg'], volume: 0.3                         }, // (ditto)
      { id: 'malepain1',       name: 'sounds/malepain1',             formats: ['mp3', 'ogg'], volume: 0.3                         }, //
      { id: 'malepain2',       name: 'sounds/malepain2',             formats: ['mp3', 'ogg'], volume: 0.3                         }, //
      { id: 'exitlevel',       name: 'sounds/g1_exit',             formats: ['mp3', 'ogg'], volume: 1.0,                        }, //
      { id: 'highscore',       name: 'sounds/highscore',             formats: ['mp3', 'ogg'], volume: 1.0,                        }, //
      { id: 'firewarrior',     name: 'sounds/g1fire_war',           formats: ['mp3', 'ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 4 }, //   NOTE: ie has limit of 40 <audio> so be careful with pool amounts
      { id: 'firevalkyrie',    name: 'sounds/g1fire_val',          formats: ['mp3', 'ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'firewizard',      name: 'sounds/g1fire_wiz',            formats: ['mp3', 'ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'fireelf',         name: 'sounds/g1fire_elf',               formats: ['mp3', 'ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'collectgold',     name: 'sounds/g1_treaspick',           formats: ['mp3', 'ogg'], volume: 0.5, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'collectpotion',   name: 'sounds/g1_potionpick',         formats: ['mp3', 'ogg'], volume: 0.5, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'collectkey',      name: 'sounds/g1_key',            formats: ['mp3', 'ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'collectfood',     name: 'sounds/g1_foodsnrf',           formats: ['mp3', 'ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'potionbang',  name: 'sounds/g1_potionboom',        formats: ['mp3', 'ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'generatordeath',  name: 'sounds/generatordeath',        formats: ['mp3', 'ogg'], volume: 0.3, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'monsterdeath1',   name: 'sounds/monsterdeath1',         formats: ['mp3', 'ogg'], volume: 0.3, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'monsterdeath2',   name: 'sounds/monsterdeath2',         formats: ['mp3', 'ogg'], volume: 0.3, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'monsterdeath3',   name: 'sounds/monsterdeath3',         formats: ['mp3', 'ogg'], volume: 0.3, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'teleport',        name: 'sounds/g1_teleport',              formats: ['mp3', 'ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'trap',        name: 'sounds/g1_wallexit',              formats: ['mp3', 'ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'stun',        name: 'sounds/g1_stun',              formats: ['mp3', 'ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'wallexit',        name: 'sounds/g1_wallexit',              formats: ['mp3', 'ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'dtouch',        name: 'sounds/g1_deathtouch',              formats: ['mp3', 'ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'infosnd',        name: 'sounds/g1_info',              formats: ['mp3', 'ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'healthcnt',        name: 'sounds/g1_healthcount',              formats: ['mp3', 'ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 4 }, //
      { id: 'opendoor',        name: 'sounds/g1_door',              formats: ['mp3', 'ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 4 } //
    ],

// added gauntlet 1 levels as g1level{n}
// gflr is gfx file for floor tiles
    levels: [
      { name: 'Demo',     url: "levels/glevel0.png", floor: FLOOR.LIGHT_STONE,      wall: WALL.BROWN1,   gflr: "gfx/g1floor0.jpg",      music: 'bloodyhalo',      score:  1000, help: null }, 
      { name: 'Level 1',       url: "levels/glevel1.png",  floor: FLOOR.LIGHT_STONE,      wall: WALL.BROWN1,   gflr: "gfx/g1floor1.jpg",      music: 'bloodyhalo',      score:  1000, help: null },
      { name: 'Level 2',       url: "levels/glevel2.png",  floor: FLOOR.BROWN_LAMINATE,      wall: WALL.BROWN1,   gflr: "gfx/g1floor2.jpg",      music: 'bloodyhalo',      score:  1000, help: null },
      { name: 'Level 3',       url: "levels/glevel3.png",  floor: FLOOR.DARK_STONE,      wall: WALL.GREEN3,    gflr: "gfx/g1floor3.jpg",      music: 'bloodyhalo',      score:  1000, help: null },
      { name: 'Level 4',       url: "levels/glevel4.png",  floor: FLOOR.WOOD,      wall: WALL.GRAY7,    gflr: "gfx/g1floor4.jpg",      music: 'bloodyhalo',      score:  1000, help: null },
      { name: 'Level 5',       url: "levels/glevel5.png",  floor: FLOOR.PURPLE_LAMINATE,      wall: WALL.RED5,    gflr: "gfx/g1floor5.jpg",      music: 'bloodyhalo',      score:  1000, help: null },
      { name: 'Level 6',       url: "levels/glevel6.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.GREEN3,   brikovr:  WALL.G1BRICKD,   gflr: "gfx/g1floor6.jpg",   music: 'bloodyhalo',      score:  1000, help: null },
      { name: 'Level 7',       url: "levels/glevel7.png",  floor: FLOOR.GREY_BOARDS,      wall: WALL.GRAY7,    gflr: "gfx/g1floor7.jpg",      music: 'bloodyhalo',      score:  1000, help: null },
      { name: 'Research Z',     url: "levels/glevelZ.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,    brikovr:  WALL.DESTBRIK,		gflr: "gfx/g1floor0z.jpg",      music: 'mountingassault',      score:  1000, help: null },
      { name: 'Research 1',     url: "levels/glevel1r.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,    gflr: "gfx/g1floor0.jpg",      music: 'mountingassault',      score:  1000, help: 'welcome to ERR0R' },
		{ name: 'Research X',     url: "levels/glevel114.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,   brikovr:  WALL.XBRIKD,    gflr: "gfx/g1floor6.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel113.png",  floor: FLOOR.RND,      wall: WALL.PINK34,    gflr: "gfx/g1floor113.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel112.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,    gflr: "gfx/g1floor112.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel111.png",  floor: FLOOR.RND,      wall: WALL.PINK34,    gflr: "gfx/g1floor111.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel110.png",  floor: FLOOR.RND,      wall: WALL.PURPLE30,    gflr: "gfx/g1floor6.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel109.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,    gflr: "gfx/g1floor109.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel108.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,    gflr: "gfx/g1floor71.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel107.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,    gflr: "gfx/g1floor107.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel106.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,    gflr: "gfx/g1floor1.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel105.png",  floor: FLOOR.RND,      wall: WALL.GRAY7,    gflr: "gfx/g1floor44.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel104.png",  floor: FLOOR.RND,      wall: WALL.BLUE28,    gflr: "gfx/g1floor104.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel103.png",  floor: FLOOR.RND,      wall: WALL.BROWN24,    gflr: "gfx/g1floor103.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel102.png",  floor: FLOOR.RND,      wall: WALL.BLUE25,    gflr: "gfx/g1floor102.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel101.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,    gflr: "gfx/g1floor28.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel100.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,    gflr: "gfx/g1floor67.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel99.png",  floor: FLOOR.RND,      wall: WALL.GRAY7,    gflr: "gfx/g1floor50.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel98.png",  floor: FLOOR.RND,      wall: WALL.PINK34,      gflr: "gfx/g1floor93.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel97.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor86.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel96.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor96.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel95.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor1.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel94.png",  floor: FLOOR.RND,      wall: WALL.BROWN24,      gflr: "gfx/g1floor76.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel93.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor93.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel92.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor41.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel91.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor78.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel90.png",  floor: FLOOR.RND,      wall: WALL.YELLOW10,      gflr: "gfx/g1floor90.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel89.png",  floor: FLOOR.RND,      wall: WALL.PINK34,      gflr: "gfx/g1floor6.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel88.png",  floor: FLOOR.RND,      wall: WALL.GRAY7,      gflr: "gfx/g1floor54.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel87.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor23.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel86.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,      gflr: "gfx/g1floor86.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel85.png",  floor: FLOOR.RND,      wall: WALL.MAUVE20,      gflr: "gfx/g1floor73.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel84.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor84.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel83.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor52.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel82.png",  floor: FLOOR.RND,      wall: WALL.BLUE8,      gflr: "gfx/g1floor43.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel81.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor81.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel80.png",  floor: FLOOR.RND,      wall: WALL.GRAY7,      gflr: "gfx/g1floor80.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel79.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor28.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel78.png",  floor: FLOOR.RND,      wall: WALL.PURPLE30,      gflr: "gfx/g1floor78.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel77.png",  floor: FLOOR.RND,      wall: WALL.PURPLE77,      gflr: "gfx/g1floor77.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel76.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor76.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel75.png",  floor: FLOOR.RND,      wall: WALL.YELLOW10,      gflr: "gfx/g1floor28.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel74.png",  floor: FLOOR.RND,      wall: WALL.PURPLE30,      gflr: "gfx/g1floor74.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel73.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor73.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel72.png",  floor: FLOOR.RND,      wall: WALL.BROWN24,      gflr: "gfx/g1floor72.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel71.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor71.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel70.png",  floor: FLOOR.RND,      wall: WALL.BLUE25,      gflr: "gfx/g1floor70.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel69.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor65.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel68.png",  floor: FLOOR.RND,      wall: WALL.PINK34,      gflr: "gfx/g1floor4.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel67.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor67.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel66.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,      gflr: "gfx/g1floor65.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel65.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor65.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel64.png",  floor: FLOOR.RND,      wall: WALL.RED5,      gflr: "gfx/g1floor13.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel63.png",  floor: FLOOR.RND,      wall: WALL.BLUE8,      gflr: "gfx/g1floor63.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel62.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,      gflr: "gfx/g1floor62.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel61.png",  floor: FLOOR.RND,      wall: WALL.BROWN24,      gflr: "gfx/g1floor61.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel60.png",  floor: FLOOR.RND,      wall: WALL.BLUE25,      gflr: "gfx/g1floor60.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel59.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor59.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel58.png",  floor: FLOOR.RND,      wall: WALL.MAUVE20,      gflr: "gfx/g1floor26.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel57.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,      gflr: "gfx/g1floor50.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel56.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor8.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel55.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor55.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel54.png",  floor: FLOOR.RND,      wall: WALL.BLUE28,      gflr: "gfx/g1floor54.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel53.png",  floor: FLOOR.RND,      wall: WALL.YELLOW10,      gflr: "gfx/g1floor28.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel52.png",  floor: FLOOR.RND,      wall: WALL.BLUE25,      gflr: "gfx/g1floor52.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel51.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor28.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel50.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,      gflr: "gfx/g1floor50.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel49.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor49.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel48.png",  floor: FLOOR.RND,      wall: WALL.MAUVE20,      gflr: "gfx/g1floor48.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel47.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor47.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel46.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor34.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel45.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor45.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel44.png",  floor: FLOOR.RND,      wall: WALL.GRAY7,      gflr: "gfx/g1floor44.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel43.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor43.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel42.png",  floor: FLOOR.RND,      wall: WALL.PINK34,      gflr: "gfx/g1floor42.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel41.png",  floor: FLOOR.RND,      wall: WALL.BLUE25,      gflr: "gfx/g1floor41.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel40.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor23.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel39.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor39.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel38.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor38.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel37.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor13.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel36.png",  floor: FLOOR.RND,      wall: WALL.PINK34,      gflr: "gfx/g1floor36.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel35.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor35.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel34.png",  floor: FLOOR.RND,      wall: WALL.PINK34,      gflr: "gfx/g1floor34.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel33.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor33.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel32.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor32.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel31.png",  floor: FLOOR.RND,      wall: WALL.ORANG31,      gflr: "gfx/g1floor31.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel30.png",  floor: FLOOR.RND,      wall: WALL.PURPLE30,      gflr: "gfx/g1floor30.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel29.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor29.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel28.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor28.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel27.png",  floor: FLOOR.RND,      wall: WALL.YELLOW10,      gflr: "gfx/g1floor27.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel26.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor26.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel25.png",  floor: FLOOR.RND,      wall: WALL.BLUE25,      gflr: "gfx/g1floor24.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel24.png",  floor: FLOOR.RND,      wall: WALL.BROWN24,      gflr: "gfx/g1floor24.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel23.png",  floor: FLOOR.RND,      wall: WALL.BLUE28,      gflr: "gfx/g1floor23.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel22.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor3.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel21.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor1.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel20.png",  floor: FLOOR.RND,      wall: WALL.MAUVE20,      gflr: "gfx/g1floor7.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel19.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,      gflr: "gfx/g1floor19.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel18.png",  floor: FLOOR.RND,      wall: WALL.PURPLE77,      gflr: "gfx/g1floor8.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel17.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor17.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel16.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor1.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel15.png",  floor: FLOOR.RND,      wall: WALL.PURPLE30,      gflr: "gfx/g1floor6.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel14.png",  floor: FLOOR.RND,      wall: WALL.RED5,      gflr: "gfx/g1floor14.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel13.png",  floor: FLOOR.RND,      wall: WALL.PINK34,      gflr: "gfx/g1floor13.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel12.png",  floor: FLOOR.RND,      wall: WALL.RED5,      gflr: "gfx/g1floor9.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel11.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,      gflr: "gfx/g1floor7.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel10.png",  floor: FLOOR.RND,      wall: WALL.YELLOW10,      gflr: "gfx/g1floor10.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel9.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor9.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel8.png",  floor: FLOOR.RND,      wall: WALL.BLUE8,      gflr: "gfx/g1floor8.jpg",      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Treasure ',     url: "levels/glevel115.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Treasure ',     url: "levels/glevel116.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Treasure ',     url: "levels/glevel117.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Treasure ',     url: "levels/glevel118.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Treasure ',     url: "levels/glevel119.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Treasure ',     url: "levels/glevel120.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Treasure ',     url: "levels/glevel121.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Treasure ',     url: "levels/glevel122.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Treasure ',     url: "levels/glevel123.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,      music: 'mountingassault',      score:  1000, help: null },
      { name: 'Treasure ',     url: "levels/glevel124.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,      music: 'mountingassault',      score:  1000, help: null },
      { name: 'Treasure ',     url: "levels/glevel125.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,      music: 'mountingassault',      score:  1000, help: null },
		{ name: 'Training',       url: "levels/trainer1.png",  floor: FLOOR.LIGHT_STONE,      wall: WALL.BLUE_COBBLE,      music: 'bloodyhalo',      score:  1000, help: "Shoot ghosts and find the exit" },
//      { name: 'Training Two',   url: "levels/trainer2.png",  floor: FLOOR.LIGHT_STONE,      wall: WALL.BLUE_COBBLE,      music: 'bloodyhalo',      score:  1000, help: "Watch out for demon fire" },
//      { name: 'Training Three', url: "levels/trainer3.png",  floor: FLOOR.LIGHT_STONE,      wall: WALL.BLUE_COBBLE,      music: 'bloodyhalo',      score:  1000, help: "Find keys to open doors" },
//      { name: 'Training Four',  url: "levels/trainer4.png",  floor: FLOOR.LIGHT_STONE,      wall: WALL.BLUE_COBBLE,      music: 'bloodyhalo',      score:  1000, help: "Eat and drink to restore health" },
//      { name: 'Training Five',  url: "levels/trainer5.png",  floor: FLOOR.LIGHT_STONE,      wall: WALL.BLUE_COBBLE,      music: 'bloodyhalo',      score:  1000, help: "Collect treasure for high score" },
//      { name: 'Training Six',   url: "levels/trainer6.png",  floor: FLOOR.LIGHT_STONE,      wall: WALL.BLUE_COBBLE,      music: 'bloodyhalo',      score:  1000, help: "Destroy monster generators" },
//      { name: 'Training Seven', url: "levels/trainer7.png",  floor: FLOOR.LIGHT_STONE,      wall: WALL.BLUE_COBBLE,      music: 'bloodyhalo',      score:  1000, help: "Use potions to destroy all monsters" },
//      { name: 'Dungeon One',    url: "levels/level1.png",    floor: FLOOR.WOOD,             wall: WALL.CONCRETE,         music: 'citrinitas',      score:  1000, help: "Training is over!<br><br> Welcome to the Dungeon!" },
      { name: 'Dungeon One',    url: "levels/level1.png",    floor: FLOOR.WOOD,             wall: WALL.CONCRETE,         music: 'citrinitas',      score:  1000, help: null },
      { name: 'Dungeon Two',    url: "levels/level2.png",    floor: FLOOR.WOOD,             wall: WALL.CONCRETE,         music: 'citrinitas',      score:  2000, help: null },
      { name: 'Dungeon Three',  url: "levels/level3.png",    floor: FLOOR.DARK_STONE,       wall: WALL.BLUE,             music: 'fleshandsteel',   score:  3000, help: null },
      { name: 'Dungeon Four',   url: "levels/level4.png",    floor: FLOOR.DARK_STONE,       wall: WALL.BLUE,             music: 'fleshandsteel',   score:  4000, help: null },
      { name: 'Dungeon Five',   url: "levels/level5.png",    floor: FLOOR.BROWN_LAMINATE,   wall: WALL.CONCRETE,         music: 'phantomdrone',    score:  5000, help: null },
      { name: 'Dungeon Six',    url: "levels/level6.png",    floor: FLOOR.BROWN_LAMINATE,   wall: WALL.CONCRETE,         music: 'phantomdrone',    score:  6000, help: null },
      { name: 'Dungeon Seven',  url: "levels/level7.png",    floor: FLOOR.PURPLE_LAMINATE,  wall: WALL.PURPLE_COBBLE,    music: 'thebeginning',    score:  7000, help: null },
      { name: 'Dungeon Eight',  url: "levels/level8.png",    floor: FLOOR.WOOD,             wall: WALL.BLUE_BRICK,       music: 'mountingassault', score:  8000, help: null },
      { name: 'Dungeon Nine',   url: "levels/level9.png",    floor: FLOOR.PURPLE_LAMINATE,  wall: WALL.CONCRETE,         music: 'fleshandsteel',   score:  9000, help: null },
      { name: 'Dungeon Ten',    url: "levels/level10.png",   floor: FLOOR.WOOD,             wall: WALL.BLUE_BRICK,       music: 'warbringer',      score: 10000, help: null },
      { name: 'Dungeon Eleven',    url: "levels/level11.png",   floor: FLOOR.LIGHT_STONE,             wall: WALL.CONCRETE,       music: 'warbringer',      score: 11000, help: null },
      { name: 'Test Level',     url: "levels/testlevel.png", floor: FLOOR.LIGHT_STONE,      wall: WALL.BLUE_COBBLE,      music: 'bloodyhalo',      score:  1000, help: null }
    ],

    keys: [
      { key: Game.Key.ONE,    mode: 'up',   state: 'menu',    action: function()    { this.start(PLAYER.WARRIOR);      } },
      { key: Game.Key.TWO,    mode: 'up',   state: 'menu',    action: function()    { this.start(PLAYER.VALKYRIE);     } },
      { key: Game.Key.THREE,  mode: 'up',   state: 'menu',    action: function()    { this.start(PLAYER.WIZARD);       } },
      { key: Game.Key.FOUR,   mode: 'up',   state: 'menu',    action: function()    { this.start(PLAYER.ELF);          } },
      { key: Game.Key.ESC,    mode: 'up',   state: 'playing', action: function()    { this.quit();                     } },
      { key: Game.Key.LEFT,   mode: 'down', state: 'playing', action: function()    { this.player.moveLeft(true);      } },
      { key: Game.Key.RIGHT,  mode: 'down', state: 'playing', action: function()    { this.player.moveRight(true);     } },
      { key: Game.Key.UP,     mode: 'down', state: 'playing', action: function()    { this.player.moveUp(true);        } },
      { key: Game.Key.DOWN,   mode: 'down', state: 'playing', action: function()    { this.player.moveDown(true);      } },
      { key: Game.Key.LEFT,   mode: 'up',   state: 'playing', action: function()    { this.player.moveLeft(false);     } },
      { key: Game.Key.RIGHT,  mode: 'up',   state: 'playing', action: function()    { this.player.moveRight(false);    } },
      { key: Game.Key.UP,     mode: 'up',   state: 'playing', action: function()    { this.player.moveUp(false);       } },
      { key: Game.Key.DOWN,   mode: 'up',   state: 'playing', action: function()    { this.player.moveDown(false);     } },
      { key: Game.Key.SPACE,  mode: 'down', state: 'playing', action: function()    { this.player.fire(true);          } },
      { key: Game.Key.SPACE,  mode: 'up',   state: 'playing', action: function()    { this.player.fire(false);         } },
      { key: Game.Key.RETURN, mode: 'up',   state: 'playing', action: function()    { this.player.nuke();              } },
      { key: Game.Key.ESC,    mode: 'up',   state: 'help',    action: function()    { this.resume();                   } },
      { key: Game.Key.RETURN, mode: 'up',   state: 'help',    action: function()    { this.resume();                   } },
      { key: Game.Key.SPACE,  mode: 'up',   state: 'help',    action: function()    { this.resume();                   } },
      { key: Game.Key.ESC,    mode: 'up',   state: 'tween',    action: function()    { this.resume();                   } },
      { key: Game.Key.RETURN, mode: 'up',   state: 'tween',    action: function()    { this.resume();                   } },
      { key: Game.Key.SPACE,  mode: 'up',   state: 'tween',    action: function()    { this.resume();                   } }
    ]

  };

  //===========================================================================
  // UTILITY METHODS
  //===========================================================================

  function publish()   { game.publish.apply(game, arguments);   } // cosmetic short-hand
  function subscribe() { game.subscribe.apply(game, arguments); } // cosmetic short-hand

  function p2t(n) { return Math.floor(n/TILE); }; // pixel-to-tile conversion
  function t2p(n) { return (n * TILE);         }; // tile-to-pixel conversion

  function countdown(n, dn)  { return n ? Math.max(0, n - (dn || 1)) : 0; } // decrement by 1, but always stop at zero, even for floating point numbers

  function isUp(dir)         { return (dir === DIR.UP)     || (dir === DIR.UPLEFT)   || (dir === DIR.UPRIGHT);   };
  function isDown(dir)       { return (dir === DIR.DOWN)   || (dir === DIR.DOWNLEFT) || (dir === DIR.DOWNRIGHT); };
  function isLeft(dir)       { return (dir === DIR.LEFT)   || (dir === DIR.UPLEFT)   || (dir === DIR.DOWNLEFT);  };
  function isRight(dir)      { return (dir === DIR.RIGHT)  || (dir === DIR.UPRIGHT)  || (dir === DIR.DOWNRIGHT); };
  function isHorizontal(dir) { return (dir === DIR.LEFT)   || (dir === DIR.RIGHT);                               };
  function isVertical(dir)   { return (dir === DIR.UP)     || (dir === DIR.DOWN);                                };
  function isDiagonal(dir)   { return (dir === DIR.UPLEFT) || (dir === DIR.UPRIGHT) || (dir === DIR.DOWNLEFT) || (dir === DIR.DOWNRIGHT); };

  function animate(frame, fpf, frames) { return Math.round(frame/fpf)%frames; }

  function overlapEntity(x, y, w, h, entity) {
    return Game.Math.overlap(x, y, w, h, entity.x + entity.cbox.x,
                                         entity.y + entity.cbox.y,
                                         entity.cbox.w,
                                         entity.cbox.h);
  }

  function timestamp() { return new Date().getTime(); }

  //=========================================================================
  // PERFORMANCE - using arrays for (small) sets
  //=========================================================================

  function set_contains(arr, entity) { return arr.indexOf(entity) >= 0;    }
  function set_add(arr, entity)      { arr.push(entity);                   }
  function set_remove(arr, entity)   { arr.splice(arr.indexOf(entity), 1); }
  function set_clear(arr)            { arr.length = 0;                     }
  function set_copy(arr, source) {
    set_clear(arr);
    for(var n = 0, max = source.length ; n < max ; n++)
      arr.push(source[n]);
  }

  //=========================================================================
  // MINIMIZE GARBAGE COLLECTION
  //  - as long as its either self contained within a single method, or the
  //    caller doesn't hold onto a reference, we can re-use the same array
  //    repeatedly for the results of frequently called helper methods
  //=========================================================================

  var _overlappingCells = { cells:   [], getcells:   function() { set_clear(this.cells);   return this.cells;   } },
      _occupied         = { checked: [], getchecked: function() { set_clear(this.checked); return this.checked; } };

  //===========================================================================
  // THE GAME ENGINE
  //===========================================================================

  var game = {

    cfg: cfg,

    run: function(runner) {

      StateMachine.create(cfg.state, this);
      Game.PubSub.enable(cfg.pubsub, this);
      Game.Key.map(cfg.keys, this);

      Game.loadResources(cfg.images, cfg.sounds, function(resources) {
        this.runner      = runner;
        this.storage     = this.clean(Game.storage());
        this.images      = resources.images;
        this.player      = new Player();
        this.viewport    = new Viewport();
        this.scoreboard  = new Scoreboard(cfg.levels[this.loadLevel()], this.loadHighScore(), this.loadHighWho());
        this.render      = new Render(resources.images);
        this.sounds      = new Sounds(resources.sounds);
        this.ready();
      }.bind(this));

		// make sure floor loader is hidden
		 var img = document.getElementById("gfloor");
		img.style.visibility = "hidden";

    },

    //---------------------------
    // STATE MACHINE TRANSITIONS
    //---------------------------

    onready: function() {
      $('booting').hide();
      this.runner.start();
      if (Game.Math.between(DEBUG.LEVEL, 0, cfg.levels.length-1))
        this.start(PLAYER[DEBUG.PLAYER], DEBUG.LEVEL); 
    },

    onmenu: function(event, previous, current) {
// used to play lostcorridors - now plays title music once at init - no loop
      this.sounds.playMenuMusic();
			setTimeout('splashrot()',19500);
    },

    onstart: function(event, previous, current, type, nlevel) {
      this.player.join(type);
      this.load(to.number(nlevel, this.loadLevel()));
    },

    onload: function(event, previous, current, nlevel) {
/// debug code - remove pre-release
			if (DEBUGON)
			if (initlevel > 0)
		 {
			 		nlevel = initlevel;
					initlevel = 0;
		 }

//					nlevel = 17;
/// debug tier
      var level    = cfg.levels[nlevel],
          self     = this,
          onloaded = function() { $('booting').hide(); self.play(new Map(nlevel)); };
      if (level.source) {
        onloaded();
      }
      else { 
        $('booting').show();
				document.getElementById("gfloor") .src = level.gflr;		// set this here so its ready on map build
        level.source = Game.createImage(level.url + "?cachebuster=" + VERSION , { onload: onloaded });
			{
					$('tween').update("<br>LEVEL:&nbsp&nbsp "+nlevel).show(); 
					setTimeout(game.onleavetween.bind(this), 2000); 
					announcepause = true;
					if (level.help)
					{
							var img = document.getElementById("tweenmsg");
							img.style.visibility = "visible";
							img.innerHTML = level.help;
					}
			}
      }
    },

    onplay: function(event, previous, current, map) {
		 Masterthmp = this;	// why do we need this and Mastermap ??
      this.map = map;
      this.saveLevel(map.nlevel);
      this.saveHighScore(); // a convenient place to save in-progress high scores without writing to local storage at 60fps
      publish(EVENT.START_LEVEL, map);
//      if (map.level.help)		// moved to tween msg
//        this.help(map.level.help);
// stop intro loop
		var spl = document.getElementById("splash");
		spl.style.visibility = "hidden";
    },

    onwin:  function(event, previous, current) { this.winlosefade(15000); this.saveLevel(8); },
    onlose: function(event, previous, current) { this.winlosefade(10000); },

    winlosefade: function(duration) {
      var finish   = function()      { game.runner.canvas.fade(1);  game.finish(); },
          animate  = function(value) { game.runner.canvas.fade(1 - value);         },
          animator = new Animator({ duration: duration, transition: Animator.tx.easeOut, onComplete: finish }).addSubject(animate);
      animator.play();
      game.viewport.zoomout(true);
    },

    onbeforequit: function(event, previous, current) {
      if (!confirm('Quit Game?'))
        return false;
    },

    onquit: function(event, previous, current) {
      this.finish();
    },

    onfinish: function(event, previous, current) {
      this.saveHighScore();
      this.player.leave();

// restart intros
		var spl = document.getElementById("splash");
		spl.style.visibility = "visible";
    },

    onenterhelp: function(event, previous, current, msg) { $('help').update(msg).show(); setTimeout(this.autoresume.bind(this), 2000); },
    onleavehelp: function(event, previous, current)      { $('help').hide();  announcepause = false;                                                         },

    onentertween: function(event, previous, current, msg) { $('tween').update(msg).show(); setTimeout(this.onleavetween.bind(this), 2500); announcepause = true; },
    onleavetween: function(event, previous, current)      { $('tween').hide();  announcepause = false; var img = document.getElementById("tweenmsg"); img.style.visibility = "hidden"; },

    autoresume: function() {
      if (this.is('help'))
        this.resume();
    },

    onenterstate: function(event, previous, current) {
      $('gauntlet').setClassName(current); // allow css switching based on FSM state
      this.canUpdate = this.is('playing') || this.is('lost') || this.is('won');
      this.canDraw   = this.is('playing') || this.is('lost') || this.is('won') || this.is('help');
    },

    //-----------------------
    // UPDATE/DRAW GAME LOOP
    //-----------------------

    update: function(frame) {
		 if (!announcepause)		// when announcer talks, flashes message we pause - tried to do with setting state, no effect
      if (this.canUpdate) {
        this.player.update(   frame, this.player, this.map, this.viewport);
        this.map.update(      frame, this.player, this.map, this.viewport);
        this.viewport.update( frame, this.player, this.map, this.viewport);
      }
    },

    draw: function(ctx, frame) {
      if (this.canDraw) {
        this.render.map(     ctx, frame, this.viewport, this.map);
        this.render.entities(ctx, frame, this.viewport, this.map.entities);
        this.render.player(  ctx, frame, this.viewport, this.player);
        this.scoreboard.refreshPlayer(this.player);
      }
      this.debugHeap(frame);
    },

    //------------------------
    // PUB/SUB EVENT HANDLING
    //------------------------

    onPlayerDeath:  function()       { this.lose(); },
    onPlayerNuke:   function(player) { this.map.nuke(this.viewport, player); },
    onFxFinished:   function(fx)     { this.map.remove(fx); },

    onPlayerFire: function(player) {
      this.map.addWeapon(player.x, player.y, player.type.weapon, player.dir, player);
    },

    onMonsterFire: function(monster) {
      this.map.addWeapon(monster.x, monster.y, monster.type.weapon, monster.dir, monster);
    },

    onPlayerExiting: function(player, exit) {
		 if (RUNORG)		// only do if running original code - that will end game on last seq level
		 {
				player.addscore(this.map.level.score);
				if (this.map.last)
				  this.win();
		 }
    },

    onPlayerExit: function(player) {
		 if (RUNORG)
		 {
			if (!this.map.last)
				this.nextLevel();
		 }
		else
		{
			if (this.map.last) rnd_level = 1;
			this.nextLevel();
		}
    },

    onDoorOpening: function(door, speed) {
      var nextdoor;
      if (nextdoor = this.map.door(door.x-TILE, door.y))
        nextdoor.open(speed);
      if (nextdoor = this.map.door(door.x+TILE, door.y))
        nextdoor.open(speed);
      if (nextdoor = this.map.door(door.x, door.y-TILE))
        nextdoor.open(speed);
      if (nextdoor = this.map.door(door.x, door.y+TILE))
        nextdoor.open(speed);
    },

    onDoorOpen: function(door) {
      this.map.remove(door);
    },

    onTreasureCollected: function(treasure, player) {
      this.map.remove(treasure);
    },

    onWeaponCollide: function(weapon, entity) {
      var x = weapon.x + (entity.x ? (entity.x - weapon.x)/2 : 0),
          y = weapon.y + (entity.y ? (entity.y - weapon.y)/2 : 0);

      if (weapon.type.player && (entity.monster || entity.generator || entity.treasure ))
        entity.hurt(weapon.type.damage, weapon);
      else if (weapon.type.monster && entity.player)
        entity.hurt(weapon.type.damage, weapon);
      else if (weapon.type.monster && entity.monster)
        entity.hurt(1, weapon);

      this.map.addFx(x, y, FX.WEAPON_HIT);
      this.map.remove(weapon);
    },

    onPlayerCollide: function(player, entity) {
      if (entity.monster || entity.generator)
        entity.hurt(player.type.damage, player);
      else if (entity.treasure)
		 {
			if (entity.type.lock && !player.keys) return;		/// need 1st message - need all messages
        player.collect(entity);
		 }
      else if (entity.door)
		 {
				var cell, cells  = reloaded.cells;
				var c, nc = cells.length;
				for(c = 0 ; c < nc ; c++) 	// clear all door stop links
				{
					  cell = cells[c];
						if (cell.ptr)
						if (cell.ptr.door) cell.ptr.door.stop = false;
				}
				entity.counterclock(entity); // set door stops so door only opens counterclockwise
				if (player.keys && entity.open())
			 {
					player.keys--;
			 }
		 }
      else if (entity.exit)
        player.exit(entity);
    },

    onMonsterCollide: function(monster, entity) {
      if (entity.player) {
        entity.hurt(monster.type.damage, monster);
        if (monster.type.selfharm)
          monster.hurt(monster.type.selfharm, monster);
      }
    },

    onMonsterDeath: function(monster, by, nuke) {
      if (by)
        by.addscore(monster.type.score);
      this.map.addMultipleFx(3, monster, FX.MONSTER_DEATH, TILE/2, nuke ? FPS/2 : FPS/6);
      this.map.remove(monster);
    },

    onGeneratorDeath: function(generator, by) {
      if (by)
        by.addscore(generator.type.score);
      this.map.addMultipleFx(20, generator, FX.GENERATOR_DEATH, TILE, FPS/2);
      this.map.remove(generator);
    },

    //------
    // MISC
    //------

    saveLevel: function(nlevel) { this.storage[STORAGE.NLEVEL] = nlevel;             },
    loadLevel: function()       { return to.number(this.storage[STORAGE.NLEVEL], 1); },
    prevLevel: function()       { var n = this.map.nlevel - 1; this.load(n <= 0                 ? cfg.levels.length - 1 : n); },
    nextLevel: function()       
	 { 
		 var n = this.map.nlevel + 1;
		 if (rnd_level) n = Game.Math.randomInt(loop_level, cfg.levels.length-1);
// exit to {4, 8, 6} code - levelplus set when exit type detected on touching exit
		 if (levelplus)
		 {
			 if (levelplus > 8) levelplus = 6;
			 if (this.map.nlevel < 7) n = levelplus;
			 else n = this.map.nlevel + levelplus;		// beyond level 7, exit to {n} value will be added to level #
		 }

		 levelplus = 0;
		 this.load(n >= cfg.levels.length ? 1                     : n); 
		},

    loadHighScore: function() { return to.number(this.storage[STORAGE.SCORE], 10000); },
    loadHighWho:   function() { return this.storage[STORAGE.WHO];                     },

    saveHighScore: function() {
      if (this.player.score > this.loadHighScore()) {
        this.storage[STORAGE.SCORE] = this.player.score;
        this.storage[STORAGE.WHO]   = this.player.type.name;
      }
    },

    debugWall:  function(back) { DEBUG.WALL  = (DEBUG.WALL  || this.map.level.wall)  + (back ? -1 : 1); if (DEBUG.WALL  > WALL.MAX)  DEBUG.WALL  = WALL.MIN;  if (DEBUG.WALL  < WALL.MIN)  DEBUG.WALL  = WALL.MAX;  console.log("WALL = "  + DEBUG.WALL);  this.map.background = null; },
    debugFloor: function(back) { DEBUG.FLOOR = (DEBUG.FLOOR || this.map.level.floor) + (back ? -1 : 1); if (DEBUG.FLOOR > FLOOR.MAX) DEBUG.FLOOR = FLOOR.MIN; if (DEBUG.FLOOR < FLOOR.MIN) DEBUG.FLOOR = FLOOR.MAX; console.log("FLOOR = " + DEBUG.FLOOR); this.map.background = null; },
    debugGrid:  function()     { DEBUG.GRID = !DEBUG.GRID;  this.map.background = null; },

    debugHeap: function(frame) {
      if (DEBUG.HEAP && window.performance && window.performance.memory && window.performance.memory.usedJSHeapSize) {
        var mb = Math.round(window.performance.memory.usedJSHeapSize/(1024*1024));
        if (mb < this.lastmb) {
          console.log("garbage collected from " + this.lastmb + " to " + mb + " = " + (this.lastmb - mb) + " MB in " + (frame - (this.lastgb||0)) + " frames");
          this.lastgb = frame;
        }
        this.lastmb = mb;
      }
    },

    clean: function(storage) {
      if (DEBUG.RESET || (storage[STORAGE.VERSION] != VERSION)) {
        for(var key in STORAGE)
          delete storage[STORAGE[key]];
        storage[STORAGE.VERSION] = VERSION;
      }
      return storage;
    }

  };

  //===========================================================================
  // THE MAP
  //===========================================================================

  var Map = Class.create({

    initialize: function(nlevel) {
      this.setupLevel(nlevel);
    },

    cell: function(x, y) {
      return this.cells[p2t(x) + (p2t(y) * this.tw)];
    },

    door: function(x, y) {
      var obj = this.cell(x,y).occupied[0];  // optimization - we know doors will always be first (and only) entity in a cell
      return obj && obj.door ? obj : null;
    },

    tpos: { }, // a persistent intermediate object to avoid GC allocations (caller is responsible for using result immediately and not hanging on to a reference)

    trymove: function(entity, dir, speed, ignore, dryrun) {
      var collision;
      this.tpos.x = entity.x + (isLeft(dir) ? -speed : isRight(dir) ? speed : 0);
      this.tpos.y = entity.y + (isUp(dir)   ? -speed : isDown(dir)  ? speed : 0);
      collision = this.occupied(this.tpos.x + entity.cbox.x, this.tpos.y + entity.cbox.y, entity.cbox.w, entity.cbox.h, ignore || entity);
      if (!collision.player && entity.weapon && collision.exit) collision = undefined;
      if (!collision && !dryrun) {
        this.occupy(this.tpos.x, this.tpos.y, entity);
      }
      return collision;
    },

    canmove: function(entity, dir, speed, ignore) {
      if (false === this.trymove(entity, dir, speed, ignore, true))
        return this.tpos; // caller is responsible for using result immediately and NOT holding a reference to the object
      else
        return false;
    },

    occupy: function(x, y, obj) {

      // always move, assume caller took care to avoid collisions
      obj.x = x;
      obj.y = y;

      // for temporal objects (weapons, fx, etc) that dont need collision detection we're done.
      if (obj.temporal)
        return;

      var c, max, cell, before = obj.cells, after = this.overlappingCells(x, y, TILE, TILE);

      // optimization - if overlapping cells are same as they were before then bail out early
      if ((before.length === after.length)                  && 
          (                       (before[0] === after[0])) &&
          ((before.length < 2) || (before[1] === after[1])) &&
          ((before.length < 3) || (before[2] === after[2])) &&
          ((before.length < 4) || (before[3] === after[3]))) {
        return;
      }

// test dest before move - otherwise "here be exceptions" can kill the engine
// so far this is only the case in unwalled areas and walking / shooting top of screen undef area
      for(c = 0, max = after.length ; c < max ; c++) {
        cell = after[c];
        if (!set_contains(before, cell))
				if (cell == undefined) return;
      }

      // otherwise remove object from previous cells that are no longer occupied
      for(c = 0, max = before.length ; c < max ; c++) {
        cell = before[c];
        if (!set_contains(after, cell))
          set_remove(cell.occupied, obj);
      }

      // and add object to new cells that were not previously occupied
      for(c = 0, max = after.length ; c < max ; c++) {
        cell = after[c];
        if (!set_contains(before, cell))
          set_add(cell.occupied, obj);
      }

      // and remember for next time
      set_copy(before, after);

      return obj;
    },

    overlappingCells: function(x, y, w, h) {

      var cells = _overlappingCells.getcells();

      if ((x === null) || (y === null))
        return cells;

      x = Math.floor(x); // ensure working in integer math in this function to avoid floating point errors giving us the wrong cells
      y = Math.floor(y);

      var nx = ((x%TILE) + w) > TILE ? 1 : 0,
          ny = ((y%TILE) + h) > TILE ? 1 : 0;

      set_add(cells,   this.cell(x,        y));
      if (nx > 0)
        set_add(cells, this.cell(x + TILE, y));
      if (ny > 0)
        set_add(cells, this.cell(x,        y + TILE));
      if ((nx > 0) && (ny > 0))
        set_add(cells, this.cell(x + TILE, y + TILE));

      return cells;

    },

    occupied: function(x, y, w, h, ignore) {

      var cells   = this.overlappingCells(x, y, w, h),
          checked = _occupied.getchecked(), // avoid checking against the same item multiple times (if that item spans multiple cells)
          cell, item,
          c, nc = cells.length,
          i, ni;

      // have to check for any player FIRST, so even if player is near a wall or other monster he will still get hit (otherwise its possible to use monsters as semi-shields against other monsters)
      if ((game.player != ignore) && overlapEntity(x, y, w, h, game.player))
        return game.player;

      // now loop again checking for walls and other entities
      for(c = 0 ; c < nc ; c++) {
        cell = cells[c];
// since edje walls can become exits, make sure shots expire at edge
			if (cell == undefined) return true;

        if (cell.wall !== undefined && cell.wall !== null)				// walls to exits sets null  
			  return true;

        for(i = 0, ni = cell.occupied.length ; i < ni ; i++) {
          item = cell.occupied[i];
          if ((item != ignore) && !set_contains(checked, item)) {
            set_add(checked, item);
            if (overlapEntity(x, y, w, h, item))
              return item;
          }
        }
      }

      return false;
    },

    //-------------------------------------------------------------------------

    nuke: function(viewport, player) {
      var rp, n, max, entity, distance, limit = TILE*player.type.magic;
      for(n = 0, max = this.entities.length ; n < max ; n++) {
        entity = this.entities[n];
        if (entity.monster && entity.active) {
          distance = Math.max(Math.abs(player.x - entity.x), Math.abs(player.y - entity.y)); // rough, but fast, approximation for slower, sqrt(x*x + y*y)
          if (distance < limit)
            entity.hurt(player.type.magic * (1 - distance/limit) * shotpot, player, true);
        }
// cataboligne - add damage to generators
// rp - re plot dmg, only wiz could kill gens with potion, elf with extra magic power
        if (entity.generator && entity.active) {
          distance = Math.max(Math.abs(player.x - entity.x), Math.abs(player.y - entity.y)); // rough, but fast, approximation for slower, sqrt(x*x + y*y)
// hacky calc for now
			  rp = player.type.magic;
			  if (player.type.magic < 32) rp = player.type.magic / 3;
          if (distance < limit)
            entity.hurt(rp * (1 - distance/limit) * shotpot, player, true);
        }
// end mod
      }
    },

    //-------------------------------------------------------------------------

    update: function(frame, player, map, viewport) {
      var n, max, entity;
      for(n = 0, max = this.entities.length ; n < max ; n++) {
        entity = this.entities[n];
        if (entity.active && entity.update)
          entity.update(frame, player, map, viewport);
      }
    },

    //-------------------------------------------------------------------------

    setupLevel: function(nlevel) {

      var level  = cfg.levels[nlevel],
          source = level.source,
          tw     = source.width,
          th     = source.height,
          self   = this;

      self.nlevel   = nlevel;
      self.level    = level;
      self.last     = nlevel === (cfg.levels.length-1);
      self.tw       = tw;
      self.th       = th;
      self.w        = tw * TILE;
      self.h        = th * TILE;
      self.start    = null;
      self.cells    = [];
      self.entities = [];
      self.pool     = { weapons: [], monsters: [], fx: [] }

      function is(pixel, type) { return ((pixel & PIXEL.MASK.TYPE) === type); };
      function type(pixel)     { return  (pixel & PIXEL.MASK.EXHIGH) >> 4;    };

      function isnothing(pixel)      { return is(pixel, PIXEL.NOTHING);   };
      function iswall(pixel)         { return is(pixel, PIXEL.WALL);      };
      function isstart(pixel)        { return is(pixel, PIXEL.START);     };
      function isdoor(pixel)         { return is(pixel, PIXEL.DOOR);      }; 
      function isexit(pixel)         { return is(pixel, PIXEL.EXIT);      };
      function isgenerator(pixel)    { return is(pixel, PIXEL.GENERATOR); };
      function ismonster(pixel)      { return is(pixel, PIXEL.MONSTER);   };
      function istreasure(pixel)     { return is(pixel, PIXEL.TREASURE);  };
      function walltype0(tx,ty,map)   { return (iswall(map.pixel(tx,   ty-1)) ? 1 : 0) | (iswall(map.pixel(tx+1, ty))   ? 2 : 0) | (iswall(map.pixel(tx,   ty+1)) ? 4 : 0) | (iswall(map.pixel(tx-1, ty))   ? 8 : 0); };
      function shadowtype0(tx,ty,map) { return (iswall(map.pixel(tx-1, ty))   ? 1 : 0) | (iswall(map.pixel(tx-1, ty+1)) ? 2 : 0) | (iswall(map.pixel(tx,   ty+1)) ? 4 : 0); };
      function doortype0(tx,ty,map)   { return (isdoor(map.pixel(tx,   ty-1)) ? 1 : 0) | (isdoor(map.pixel(tx+1, ty))   ? 2 : 0) | (isdoor(map.pixel(tx,   ty+1)) ? 4 : 0) | (isdoor(map.pixel(tx-1, ty))   ? 8 : 0); };
// mirror Y
      function walltypeYM(tx,ty,map)   {  ty = (th - 1) - ty; return (iswall(map.pixel(tx,   ty+1)) ? 1 : 0) | (iswall(map.pixel(tx+1, ty))   ? 2 : 0) | (iswall(map.pixel(tx,   ty-1)) ? 4 : 0) | (iswall(map.pixel(tx-1, ty))   ? 8 : 0); };
      function shadowtypeYM(tx,ty,map) { ty = (th - 1) - ty; return (iswall(map.pixel(tx-1, ty))   ? 1 : 0) | (iswall(map.pixel(tx-1, ty-1)) ? 2 : 0) | (iswall(map.pixel(tx,   ty-1)) ? 4 : 0); };
      function doortypeYM(tx,ty,map)   { ty = (th - 1) - ty; return (isdoor(map.pixel(tx,   ty+1)) ? 1 : 0) | (isdoor(map.pixel(tx+1, ty))   ? 2 : 0) | (isdoor(map.pixel(tx,   ty-1)) ? 4 : 0) | (isdoor(map.pixel(tx-1, ty))   ? 8 : 0); };
// mirror X
      function walltypeXM(tx,ty,map)   { tx = (tw - 1) - tx; return (iswall(map.pixel(tx,   ty-1)) ? 1 : 0) | (iswall(map.pixel(tx-1, ty))   ? 2 : 0) | (iswall(map.pixel(tx,   ty+1)) ? 4 : 0) | (iswall(map.pixel(tx+1, ty))   ? 8 : 0); };
      function shadowtypeXM(tx,ty,map) { tx = (tw - 1) - tx; return (iswall(map.pixel(tx+1, ty))   ? 1 : 0) | (iswall(map.pixel(tx+1, ty+1)) ? 2 : 0) | (iswall(map.pixel(tx,   ty+1)) ? 4 : 0); };
      function doortypeXM(tx,ty,map)   { tx = (tw - 1) - tx; return (isdoor(map.pixel(tx,   ty-1)) ? 1 : 0) | (isdoor(map.pixel(tx-1, ty))   ? 2 : 0) | (isdoor(map.pixel(tx,   ty+1)) ? 4 : 0) | (isdoor(map.pixel(tx+1, ty))   ? 8 : 0); };
// 180
      function walltype180(tx,ty,map)   { tx = (tw - 1) - tx; ty = (th - 1) - ty; return (iswall(map.pixel(tx,   ty+1)) ? 1 : 0) | (iswall(map.pixel(tx-1, ty))   ? 2 : 0) | (iswall(map.pixel(tx,   ty-1)) ? 4 : 0) | (iswall(map.pixel(tx+1, ty))   ? 8 : 0); };
      function shadowtype180(tx,ty,map) { tx = (tw - 1) - tx; ty = (th - 1) - ty; return (iswall(map.pixel(tx+1, ty))   ? 1 : 0) | (iswall(map.pixel(tx+1, ty-1)) ? 2 : 0) | (iswall(map.pixel(tx,   ty-1)) ? 4 : 0); };
      function doortype180(tx,ty,map)   { tx = (tw - 1) - tx; ty = (th - 1) - ty; return (isdoor(map.pixel(tx,   ty+1)) ? 1 : 0) | (isdoor(map.pixel(tx-1, ty))   ? 2 : 0) | (isdoor(map.pixel(tx,   ty-1)) ? 4 : 0) | (isdoor(map.pixel(tx+1, ty))   ? 8 : 0); };

var ymir = false, xmir = false;

		var walltype = walltype0;
		var shadowtype = shadowtype0;
		var doortype = doortype0;

		if (xmir) {
				walltype = walltypeXM;
				shadowtype = shadowtypeXM;
				doortype = doortypeXM;
		}
		if (ymir) {
				walltype = walltypeYM;
				shadowtype = shadowtypeYM;
				doortype = doortypeYM;
		}
		if (xmir && ymir) {
				walltype = walltype180;
				shadowtype = shadowtype180;
				doortype = doortype180;
		}

// make sure mults is not undefed - later load deathmult from cooky
		if (Deathmult == undefined) Deathmult = 0;
		if (Masterot == undefined) Masterot = 0;
		shotpot = 1;

      Game.parseImage(source, function(tx, ty, pixel, map) {

			if (xmir) tx = (tw - 1) - tx;
			if (ymir) ty = (th - 1) - ty;

        var cell, x = t2p(tx),
                  y = t2p(ty),
                  n = tx + (ty * tw);

        self.cells[n] = cell = { occupied: [] };

/// do stuff so we can modify cells later
//		  pcell = self.cells[n];
		  reloaded = self;
		  Mastercell = self.cells[n];
//		  alert("cell x,y,n ="+tx+", "+ty+", "+self.cells[n]);
		  self.cells[n].x = x; // used by walls -> exits
		  self.cells[n].y = y;
		  self.cells[n].tx = tx; // used by trap: walls -> floor
		  self.cells[n].ty = ty;
		  self.cells[n].pixel = pixel;
		  refpixel = pixel;
// make some floor tiles appear slightlyt different - a "GPS" out of complex mazes
// this is built into the map file as color code #a08080
		  self.cells[n].mapcht = ((pixel & 0xa08080) == 0xa08080);
//		  alert("cell x,y,n ="+self.cells[n].x+", "+self.cells[n].y+", "+n);
/// do stuff tier

		  if (isstart(pixel))
			 self.start = { x: x, y: y }

		  if (iswall(pixel))
			 cell.wall = walltype(tx, ty, map);
		  else if (isnothing(pixel))
			 cell.nothing = true;
		  else
			 cell.shadow = shadowtype(tx, ty, map);

		  if (isexit(pixel))
			 {
				 switch(type(pixel)) {
					case 0: self.addExit(x, y, DOOR.EXIT);
							break;
					case 1: self.addExit(x, y, DOOR.EXIT4);
							break;
					case 2: self.addExit(x, y, DOOR.EXIT8);
							break;
					case 3: self.addExit(x, y, DOOR.EXIT6);
							break;
					case 4: self.addExit(x, y, DOOR.EXITMOVE);
							break;
				 }
			 }
		  else if (isdoor(pixel))
			{
					self.addDoor(x, y, DOOR.HORIZONTAL);
					Mastercell.ptr.sx = doortype(tx,ty,map);
//				alert(Mastercell.ptr.sx);
			}
		  else if (isgenerator(pixel))
			 self.addGenerator(x, y, MONSTERS[type(pixel) < MONSTERS.length ? type(pixel) : 0]);
		  else if (istreasure(pixel))
			 {
				 var ad = TREASURES[type(pixel) < TREASURES.length ? type(pixel) : 0];
// some treasures operate from sub pixels
				 var sb = MEXLOW & pixel;
				 if (ad == TREASURE.POTION && (sb == 1)) ad = TREASURE.POTIONORG;
				 if (ad == TREASURE.POISON && (sb == 2)) ad = TREASURE.BADPOT;
				 if (ad == TREASURE.XSPEED && (sb > 0)) ad =  TREASURES[type(pixel) + sb + POWERADD];
				 if (ad == TREASURE.LIMINVIS && (sb > 0)) ad =  TREASURES[type(pixel) + sb + LIMITEDADD];
				self.addTreasure(x, y, ad);
				 if (ad == TREASURE.SHOTWALL) Mastercell.ptr.sx = pixel & MEXLOW;
			 }
		  else if (ismonster(pixel))
			 self.addMonster(x, y, MONSTERS[type(pixel) < MONSTERS.length ? type(pixel) : 0]);
      });

    },

    //-------------------------------------------------------------------------

    addGenerator: function(x, y, type)             { return DEBUG.NOGENERATORS ? null : this.add(x, y, Generator, null,               type);             },
    addTreasure:  function(x, y, type)             { return DEBUG.NOTREASURE   ? null : this.add(x, y, Treasure,  null,               type);             },
    addDoor:      function(x, y, type)             { return DEBUG.NODOORS      ? null : this.add(x, y, Door,      null,               type);             },
    addExit:      function(x, y, type)             { return DEBUG.NOEXITS      ? null : this.add(x, y, Exit,      null,               type);             },
    addWeapon:    function(x, y, type, dir, owner) { return DEBUG.NOWEAPONS    ? null : this.add(x, y, Weapon,    this.pool.weapons,  type, dir, owner); },
    addMonster:   function(x, y, type, generator)  { return DEBUG.NOMONSTERS   ? null : this.add(x, y, Monster,   this.pool.monsters, type, generator);  },
    addFx:        function(x, y, type, delay)      { return DEBUG.NOFX         ? null : this.add(x, y, Fx,        this.pool.fx,       type, delay);      },

    add: function(x, y, klass, pool) {
      var cfunc, entity, args = [].slice.call(arguments, 4);
      if (pool && pool.length) {
        entity = pool.pop();
        entity.initialize.apply(entity, args);
      }
      else {
        cfunc  = klass.bind.apply(klass, [null].concat(args)); // sneaky way to use Function.apply(args) on a constructor
        entity = new cfunc();
        entity.pool  = pool;           // entities track which pool they belong to (if any)
        entity.cells = [];             // entities track which cells they currently occupy
			entity.pixel = refpixel;
        this.entities.push(entity);
			Mastercell.ptr = entity;
      }
      this.occupy(x, y, entity);
      entity.active = true;
      return entity;
    },

    remove: function(obj) {
      obj.active = false;
      this.occupy(null, null, obj);
      if (obj.pool)
        obj.pool.push(obj);
    },

    addMultipleFx: function(count, target, type, d, dt) {
      var n, x, y, collision;
      this.addFx(target.x, target.y, type);
      for(n = 0 ; n < 1000 ; n++) {
        x = target.x + Game.Math.randomInt(-d, d);
        y = target.y + Game.Math.randomInt(-d, d);
        collision = this.occupied(x, y, TILE, TILE, target);
        if (collision !== true) { // allow it unless its explicitly a wall
          this.addFx(x, y, type, Game.Math.randomInt(0, dt));
          if (--count === 0)
            break;
        }
      }
    }

  }); // Map

  //===========================================================================
  // MONSTERS
  //===========================================================================

  var Monster = Class.create({

    initialize: function(type, generator) {
      this.generator  = generator;
      this.type       = type;
      this.dir        = Game.Math.randomInt(0, 7); // start off in random direction, will quickly target player instead
      this.health     = type.health;
      this.thinking   = 0;
      this.travelling = 0;
      this.reloading  = 0;
      this.dx         = Game.Math.randomInt(-2, 2);  // a little random offset to break up lines of monsters
      this.dy         = Game.Math.randomInt(-4, 0);  // (ditto)
      this.df         = Game.Math.randomInt(0, 100); // a little random frame offset to keep monster animations out-of-sync
    },

    monster: true,
    cbox:    CBOX.MONSTER,

    update: function(frame, player, map, viewport) {

      // monsters dont move offscreen g1 / g2 - difficulty option
      if (viewport.outside(this.x - viewport.w, this.y - viewport.h, viewport.w * 1.07, viewport.h  * 1.07))
        return;

      // keep reloading (if applicable)
      this.reloading = countdown(this.reloading);

      // dont bother trying to update a monster that is still 'thinking'
      if (this.thinking && --this.thinking)
        return;

      // am i going towards a live player, or AWAY from a dead one, if away, my speed should be slow (the player is dead, I'm no longer interested in him)
      var away  = !player.active(), speed;
		 if (player.linvis) away = true;
		 
		speed = away ? 1 : this.type.speed;

      // let travelling monsters travel
      if (this.travelling > 0)
        return this.step(map, player, this.dir, speed, countdown(this.travelling), !away);

      // otherwise find a new direction
      var dirs, n, max;
      dirs = PREFERRED_DIRECTIONS[this.directionTo(player, away)];
      for(n = 0, max = dirs.length ; n < max ; n++) {
        if (this.step(map, player, dirs[n], speed, n < 2 ? 0 : this.type.travelling * (n-2), !away))
          return;
      }

    },

    step: function(map, player, dir, speed, travelling, allowfire) {
      var collision = map.trymove(this, dir, speed * slowmonster);
      if (!collision) {
        this.dir = dir;
        if (allowfire && this.type.weapon && this.fire(map, player)) {
          this.thinking   = this.type.thinking;
          this.travelling = 0;
        }
        else {
          this.thinking   = 0;
          this.travelling = travelling;
        }
        return true;
      }
      else if (collision.player) {
        publish(EVENT.MONSTER_COLLIDE, this, collision);
        return true;
      }

      // if we couldn't move in that direction at full speed, try a baby step before giving up
      if (speed > 1)
        return this.step(map, player, dir, 1, travelling, allowfire);

      this.thinking   = this.type.thinking;
      this.travelling = 0;
      return false;
    },

    fire: function(map, player) {
      var dx, dy, dd;
      if (this.type.weapon) {
        if (!this.reloading) {
          dx = Math.abs(p2t(this.x) - p2t(player.x));
          dy = Math.abs(p2t(this.y) - p2t(player.y));
          dd = Math.abs(dx-dy);
          if (((dx < 2) && isVertical(this.dir))   ||
              ((dy < 2) && isHorizontal(this.dir)) ||
              ((dd < 2) && isDiagonal(this.dir))) {
            this.reloading = this.type.weapon.reload;
            publish(EVENT.MONSTER_FIRE, this);
            return true;
          }
        }
      }
      return false;
    },

    hurt: function(damage, by, nuke) {
      if (by.weapon && this.type.canbehit == 2 && !by.owner.monster) // death shot
		 {
				by.owner.addscore(1);
				Deathmult = Deathmult + 1;
				if (Deathmult > Dmmax) Deathmult = 0;
				document.getElementById('scrmult3').innerHTML = Deathscore[Deathmult]+"- Score";
				return;
		 }
      if (nuke && this.type.canbehit == 2) // death nuked
		 {
				this.health = Math.max(0, this.health - damage);
				if (this.health > 0) return;
				this.die(by.player ? by : by.weapon && by.type.player ? by.owner : null, nuke);
				by.addscore(Math.floor( (Deathscore[Deathmult] - 1) /  (by.scmult > 1 ? 1.33333 : 1) ) );
				return;
		 }
      if ((by.weapon && this.type.canbeshot) || (by.player && this.type.canbehit) || (by == this) || nuke) {
        this.health = Math.max(0, this.health - damage);
        if (this.health === 0)
          this.die(by.player ? by : by.weapon && by.type.player ? by.owner : null, nuke);
      }
    },

    die: function(by, nuke) {
      if (this.generator)
        this.generator.remove(this);
      publish(EVENT.MONSTER_DEATH, this, by, nuke);
    },

    directionTo: function(target, away) {

      var up    = target.y < this.y - this.type.speed,
          down  = target.y > this.y + this.type.speed,
          left  = target.x < this.x - this.type.speed,
          right = target.x > this.x + this.type.speed;

      if (up && left)
        return away ? DIR.DOWNRIGHT : DIR.UPLEFT;
      else if (up && right)
        return away ? DIR.DOWNLEFT : DIR.UPRIGHT;
      else if (down && left)
        return away ? DIR.UPRIGHT : DIR.DOWNLEFT;
      else if (down && right)
        return away ? DIR.UPLEFT : DIR.DOWNRIGHT;
      else if (up)
        return away ? DIR.DOWN : DIR.UP;
      else if (down)
        return away ? DIR.UP : DIR.DOWN;
      else if (left)
        return away ? DIR.RIGHT : DIR.LEFT;
      else if (right)
        return away ? DIR.LEFT : DIR.RIGHT;
      else
        return this.dir;
    },

    onrender: function(frame) {
      if (this.type.invisibility && ((frame+this.df)%(this.type.invisibility.on + this.type.invisibility.off) < this.type.invisibility.on))
        return false;

      this.frame = this.dir + (8 * animate(frame + this.df, this.type.fpf, this.type.frames));
    }

  });

  //===========================================================================
  // GENERATORS
  //===========================================================================

  var Generator = Class.create({

    initialize: function(mtype) {
      this.mtype   = mtype;
      this.type    = mtype.generator;
      this.health  = this.type.health;
      this.pending = 0;
      this.count   = 0;
    },

    generator: true,
    cbox:      CBOX.FULL,

    update: function(frame, player, map, viewport) {

      // generators dont offscreen g1 / g2 - difficulty option
      if (viewport.outside(this.x - viewport.w, this.y - viewport.h, viewport.w+5, viewport.h+5))
        return;

      var pos;
      if ((this.count < this.type.max) && (--this.pending <= 0)) {
        pos = map.canmove(this, Game.Math.randomInt(0,7), TILE);
        if (pos) {
          map.addMonster(pos.x, pos.y, this.mtype, this);
          this.count++;
          this.pending = Game.Math.randomInt(1, this.type.speed);
        }
      }
    },

    hurt: function(damage, by) {
      this.health = Math.max(0, this.health - damage);
      if (this.health === 0)
        this.die(by.player ? by : by.weapon && by.type.player ? by.owner : null);
    },

    die: function(by) {
      publish(EVENT.GENERATOR_DEATH, this, by);
    },

    remove: function(monster) {
      this.count--;
    },

    onrender: function(frame) {
      this.frame = (2 - Math.floor(3 * (this.health / (this.type.health + 1))));
    }

  });

  //===========================================================================
  // WEAPONS
  //===========================================================================

  var Weapon = Class.create({

    initialize: function(type, dir, owner) {
      this.type  = type;
      this.dir   = dir;
      this.owner = owner;
    },

    weapon:   true,
    temporal: true,
    cbox:     CBOX.WEAPON,

    update: function(frame, player, map, viewport) {
      var collision = map.trymove(this, this.dir, this.type.speed, this.owner);
      if (collision) {
        this.owner.reloading = countdown(this.owner.reloading, this.type.reload/2); // speed up reloading process if previous weapon hit something, makes player feel powerful
        publish(EVENT.WEAPON_COLLIDE, this, collision);
      }
    },

    onrender: function(frame) {
      this.frame = this.type.rotate ? animate(frame, this.type.fpf, 8) : this.dir;
    }

  });

  //===========================================================================
  // TREASURE
  //===========================================================================

  var Treasure = Class.create({

    initialize: function(type) {
      this.type = type;
    },

    treasure: true,
    cbox: CBOX.FULL,

// not living shootables
/// message - "dont shoot the {x}"
    hurt: function(damage, by, nuke) {
		 if (by.weapon && this.type.canbeshot == 2 && !nuke) {
			 shotpot = 0.8;	// shot potions are weaker
				if (this.type.wall)
				{
						if (this.type.nohlp != undefined)
						if (HELPCLEAR[this.type.nohlp])
						{
								HELPCLEAR[this.type.nohlp] = helpcleared;
								if (this.type.help != undefined) {$('help').update(this.type.help).show(); setTimeout(game.onleavehelp.bind(this), 2000); announcepause = true;}
						}
						 if (this.health == undefined) this.health = this.type.health;
						 this.health = Math.max(0, this.health - damage);
						 if (this.health > 0) return;
				}
				else
				if (this.type.health)
				{
						if (HELPCLEAR[nohlpdsf])
						{
								HELPCLEAR[nohlpdsf] = helpcleared;
								{$('help').update(helpdsf).show(); setTimeout(game.onleavehelp.bind(this), 2000); announcepause = true;}
						}
				}
				if (this.type.potion)
				{
						if (HELPCLEAR[nohlpsap])
						{
								HELPCLEAR[nohlpsap] = helpcleared;
								{$('help').update(helpsap).show(); setTimeout(game.onleavehelp.bind(this), 2000); announcepause = true;}
						}
						Mastermap.nuke(null, by.owner);
						Musicth.play(Musicth.sounds.nuke);
				}
				if (this.type.poison)
				{
						slowmonster = 0.5;
						if (HELPCLEAR[nohlppois])
						{
								HELPCLEAR[nohlppois] = helpcleared;
								{$('help').update(helppois).show(); setTimeout(game.onleavehelp.bind(this), 2000); announcepause = true;}
						}
				}
				shotpot = 1;
				Mastermap.remove(this);
				return;
		 }
    },

    onrender: function(frame) {
      this.frame = animate(frame, this.type.fpf, this.type.frames);
    }

  });

  //===========================================================================
  // DOOR
  //===========================================================================

  var Door = Class.create({

    initialize: function(type) {
      this.type =  type;
      this.dx   = -type.dx;
      this.dy   = -type.dy;
      this.dw   =  type.dx*3;
      this.dh   =  type.dy;
    },

    door:  true,
    cbox:  CBOX.FULL,

    update: function(frame, player, map, viewport) {
      if (this.opening && (--this.opening === 0)) {
        publish(EVENT.DOOR_OPEN, this);
      }
    },

    open: function(speed) {
		 if (this.stop) return false;
      if (!this.opening) {
        this.opening = (speed || 0) + this.type.speed;
        publish(EVENT.DOOR_OPENING, this, this.opening);
        return true;
      }
    },

// trace back clockwise on all doors on first touch
// place a stop at - corners, Ts
	counterclock: function(door) {
			var nextdoor;
			if (nextdoor = Mastermap.door(door.x+TILE, door.y))
			if (doorstop[ nextdoor.sx ])
			  nextdoor.counterclock(nextdoor);
			else nextdoor.stop = true;
			if (nextdoor = Mastermap.door(door.x, door.y-TILE))
			if (doorstop[ nextdoor.sx ])
			  nextdoor.counterclock(nextdoor);
			else nextdoor.stop = true;
		}

  });

  //===========================================================================
  // EXIT
  //===========================================================================

  var Exit = Class.create({

    initialize: function(type) {
      this.type = type;
    },

    exit: true,
    cbox: CBOX.FULL

  });

  //===========================================================================
  // FX
  //===========================================================================

  var Fx = Class.create({

    initialize: function(type, delay) {
      this.type  = type;
      this.start = null;
      this.delay = delay || 0;
    },

    fx:       true,
    temporal: true,

    update: function(frame, player, map, viewport) {
      if (this.delay && --this.delay)
        return;
      this.start = this.start || frame; 
      this.frame = animate(frame - this.start, this.type.fpf, this.type.frames + 1);
      if (this.frame === this.type.frames)
        publish(EVENT.FX_FINISHED, this);
    },

    onrender: function(frame) {
      if (this.delay)
        return false;
    }

  });


  //===========================================================================
  // THE PLAYER
  //===========================================================================

  var Player = Class.create({

    initialize: function() {
      subscribe(EVENT.START_LEVEL, this.onStartLevel.bind(this));

      this.canvas = Game.createCanvas(STILE + 2*FX.PLAYER_GLOW.border, STILE + 2*FX.PLAYER_GLOW.border);
      this.ctx    = this.canvas.getContext('2d');
      this.cells  = []; // entities track which cells they currently occupy

// init some control code
		this.stun = 0;
		 stalling = 0;
    },

    player: true,
    cbox:   CBOX.PLAYER,

    active: function() { return !this.dead && !this.exiting; },

    join: function(type) {
      this.type      = type;
      this.dead      = false;
      this.exiting   = false;
      this.firing    = false;
      this.moving    = {};
      this.reloading = 0;
      this.hurting   = 0;
      this.healing   = 0;
      this.keys      = DEBUG.KEYS    || 0;
      this.potions   = DEBUG.POTIONS || 0;
// powers potions
		this.xspeed = 0;
		this.xshotpwr = 0;
		this.xshotspd = 0;
		this.xarmor = 0;
		this.xfight = 0;
		this.xmagic = 0;
// limited powers
		this.linvis = 0;
		this.linvuln = 0;
		this.lrepuls = 0;
		this.lreflect = 0;
		this.lsuper = 0;
		this.ltele = 0;
		this.lank = 0;
      this.score     = 0;
      this.scmult     = 1;
		Mastermult = 1;
      this.dir       = Game.Math.randomInt(0, 7);
      this.health    = type.health;
      publish(EVENT.PLAYER_JOIN, this);

// clear video - in case it was playing, this is a seperate element that needs turned off
			var vid = document.getElementById("introvid");
			vid.load();
			vid.pause();
			vid.style.visibility = "hidden";
			for (var c = 0; c < 50; c++) HELPCLEAR[c] = 1;	// option here would zero to turn off tutorial msgs
/// debug code - remove pre-release
				if (DEBUGON)
				{
					HELPCLEAR[0] = 0;
					HELPCLEAR[1] = 0;
					HELPCLEAR[2] = 0;
					HELPCLEAR[3] = 0;
					HELPCLEAR[4] = 0;
				}

/// debug tier
    },

    leave: function() {
      publish(EVENT.PLAYER_LEAVE, this);
    },

    onStartLevel: function(map) {
      map.occupy(map.start.x, map.start.y, this);
// original code cleared keys every level - set PLAYMODE detect here
//      this.keys    = DEBUG.KEYS || 0;
      this.dead    = false;
      this.exiting = false;
		Mastermap = map; // for teleport reposition
// turn off these limited items
		this.lreflect = 0;
		this.ltele = 0;
		this.linvuln = 0;
    },

    update: function(frame, player, map, viewport) {

      if (this.dead)
        return;

      if (this.exiting) {
        if (--this.exiting.count === 0)
          publish(EVENT.PLAYER_EXIT, this);
        return;
      }

      this.autohurt(frame);

      this.hurting   = countdown(this.hurting);
      this.healing   = countdown(this.healing);
      this.reloading = countdown(this.reloading);

      if (this.stun > 0) return;

      if (this.firing) {
        if (!this.reloading) {
          this.reloading = this.type.weapon.reload;
          publish(EVENT.PLAYER_FIRE, this);
        }
			stalling = 0; // reset on player fire
			return; // can't fire and move at same time
      }

      if (is.invalid(this.moving.dir))
        return;

		stalling = 0; // reset on player move

      var d, dmax, dir, collision,
          directions = SLIDE_DIRECTIONS[this.moving.dir];

      for(d = 0, dmax = directions.length ; d < dmax ; d++) {
        dir = directions[d];
        collision = map.trymove(this, dir, this.type.speed + (this.xspeed * 30)/FPS);
        if (collision)
          publish(EVENT.PLAYER_COLLIDE, this, collision); // if we collided with something, publish event and then try next available direction...
        else
          return; // ... otherwise we moved, so we're done trying
      }

    },

    collect: function(treasure) {

      if (treasure.type.wall) return; //shot wall, go back

      this.addscore(treasure.type.score);

		if (treasure.type.nohlp != undefined)
		if (HELPCLEAR[treasure.type.nohlp])
		{
				HELPCLEAR[treasure.type.nohlp] = helpcleared;
				if (treasure.type.help != undefined) {$('help').update(treasure.type.help).show(); setTimeout(game.onleavehelp.bind(this), 2000); announcepause = true;}
		}

		if (treasure.type.scmult)
		 {
				this.scmult = Mastermult + treasure.type.scmult;
				if (this.scmult >= 5) this.scmult = 4;
				Mastermult = this.scmult;
				if (Masterot < 1) setTimeout('multrot()',1000);
				Masterot = 60
				if (this.scmult > 2) Masterot = 30;
				if (this.scmult > 3) Masterot = 15;
				document.getElementById('scrmult1').innerHTML = Masterot +":" + Mastermult + "x Score";
				document.getElementById('scrmult2').innerHTML = Masterot +":" + Mastermult + "x Score";
				document.getElementById('scrmult3').innerHTML = Masterot +":" + Mastermult + "x Score";
				document.getElementById('scrmult4').innerHTML = Masterot +":" + Mastermult + "x Score";
		 }

		 if (treasure.type.stun)
			this.stun = 4;

		 if (treasure.type.teleport) {
				var cells   = reloaded.cells,
					 walled, cell, c, nc = cells.length, tdist = 100000, cdist, destcell, ldestcell,
					mxdir = 7, tdir, ddir = this.moving.dir;

//alert("x: "+this.x+" y:"+this.y);
//alert("x: "+treasure.x+" y:"+treasure.y);
				if (ddir < 0 || ddir > 7) ddir = 0;

				// now loop checking for all teleporters
				for(c = 0 ; c < nc ; c++) {
						cell = cells[c];
						if (cell.pixel == TELEPORTILE)
						if (Math.abs(treasure.x - cell.x) > 33 ||  Math.abs(treasure.y - cell.y) > 33)		// find closest teleport not origin
//					  if (cell.x != 0 &&  cell.y != 0)
						{
							cdist = distance(cell.x,cell.y,treasure.x,treasure.y);
							if (cdist < tdist)
							{
									tdist = cdist;
									ldestcell = destcell;
									destcell = cell;
							}
						}
				}
						if (tdist < 100000)
						{
									tdir = ddir;
									var px = destcell.x + DIRTX[ddir];
									var py = destcell.y + DIRTY[ddir];
									var blokt, tcell = cells[p2t(px) + p2t(py) *  Mastermap.tw];
									if (tcell == undefined) blokt = true;
									else	
									{
											blokt = is.valid(tcell.wall);
											if (Mastermap.door(px,py) && !this.keys) blokt = true;
									}
// make sure it isnt a wall - telefrag monsters / death
/// note: if one teleport is blocked by walls, we should re-check others, putting a no-flag on the blocked
								 while (blokt)
								{
									ddir++;
									if (ddir > mxdir) ddir = 0;	// loop to 0 at dir array max
									if (ddir == tdir) // dont need to test orig dir - see if we have other cells
									if (ldestcell == undefined || ldestcell == destcell) return;
									else destcell == ldestcell; // try another close teleport

									px = destcell.x + DIRTX[ddir];
									py = destcell.y + DIRTY[ddir];
									tcell = cells[p2t(px) + p2t(py) *  Mastermap.tw];
									if (tcell == undefined) blokt = true;
									else	
									{
											blokt = is.valid(tcell.wall);
											if (Mastermap.door(px,py) && !this.keys) blokt = true;
									}
								}
								Mastermap.occupy(px, py, this);

								if (!walled) Musicth.play(Musicth.sounds.teleport);
								walled = true;
						}
				return;
		 }

		 if (treasure.type.trap) {
				var cells   = reloaded.cells,
					 walled, cell, c, nc = cells.length;

				// now loop again checking for all trap walls
				for(c = 0 ; c < nc ; c++) {
					  cell = cells[c];
					  if (cell.wall !== undefined && cell.wall !== null)
					 {
							  if ((cell.pixel & MEXHIGH) == TRAPWALL && ((cell.pixel & MEXLOW) == (treasure.pixel & MEXLOW))) // || cell.pixel == TRAPTRIG)
//					  if (cell.x != 0 &&  cell.y != 0)
								{
										if (!walled) Musicth.play(Musicth.sounds.wallexit);
										if (Mastermap.level.gflr)
										{
												var gimg = document.getElementById("gfloor");
												cell.ctx.drawImage(gimg, 0, 0, STILE, STILE, cell.tx * TILE, cell.ty * TILE, TILE, TILE);
										}
										else
											cell.tileptr.tile(cell.ctx, cell.sprites, Mastermap.level.floor, 0, cell.tx, cell.ty);
//								cell.wall = 17;//walltype(cell.tx, cell.ty, map);
//								reloaded.addExit(cell.x, cell.y, DOOR.EXIT);
										cell.wall = null;	// so we dont fire these wall segs again
										walled = true;
								}
					 }
					  if (cell.pixel == treasure.pixel)		// remove matching trap
					 {
						 if (cell.ptr);
							Mastermap.remove(cell.ptr);
					 }
				}
		 }

		var powerp = 0;
      if (treasure.type.powers)		// special power potions, limited items
		 {

				if (treasure.type == TREASURE.XSPEED && !this.xspeed) {this.xspeed++; powerp++;}
				if (treasure.type == TREASURE.XSHOTPWR && !this.xshotpwr) {this.xshotpwr++; powerp++;}
				if (treasure.type == TREASURE.XSHOTSPD && !this.xshotspd) {this.xshotspd++; powerp++;}
				if (treasure.type == TREASURE.XARMOR && !this.xarmor) {this.xarmor++; powerp++;}
				if (treasure.type == TREASURE.XFIGHT && !this.xfight) {this.xfight++; powerp++;}
				if (treasure.type == TREASURE.XMAGIC && !this.xmagic) {this.xmagic++; powerp++;}

// plan: these need either put in type or somehow made code adjustable or both
				if (treasure.type == TREASURE.LIMINVIS) {this.linvis = this.linvis + 30;}
				if (treasure.type == TREASURE.LIMINVUL) {this.linvuln  = this.linvuln + 30;}
				if (treasure.type == TREASURE.LIMREPUL) {this.lrepuls = this.lrepuls + 30;}
				if (treasure.type == TREASURE.LIMREFLC) {this.lreflect++;}
				if (treasure.type == TREASURE.LIMSUPER) {this.lsuper = this.lsuper + 10;}
				if (treasure.type == TREASURE.LIMTELE) {this.ltele++;}
				if (treasure.type == TREASURE.LIMANK) {this.lank = this.lank + 60;}

		 }
      if (treasure.type.potion && powerp < 1)
        this.potions++;
      else if (treasure.type.key)
        this.keys++;
      else if (treasure.type.health)
        this.heal(treasure.type.health);
      else if (treasure.type.damage)
        this.hurt(treasure.type.damage);
      publish(EVENT.TREASURE_COLLECTED, treasure, this);
    },

    exit: function(exit) {
      if (!this.exiting) {
        this.health  = this.health + (this.health < this.type.health ? 100 : 0);		/// RUNORG - gauntlet no do this
        this.exiting = { max: exit.type.speed, count: exit.type.speed, fpf: exit.type.fpf, dx: (exit.x - this.x), dy: (exit.y - this.y) };
			levelplus = exit.type.lvlp;
        publish(EVENT.PLAYER_EXITING, this, exit);
      }
    },

    fire:      function(on) { this.firing       = on;   },
    moveUp:    function(on) { this.moving.up    = on;  this.setDir(); },
    moveDown:  function(on) { this.moving.down  = on;  this.setDir(); },
    moveLeft:  function(on) { this.moving.left  = on;  this.setDir(); },
    moveRight: function(on) { this.moving.right = on;  this.setDir(); },

    setDir: function() {
      if (this.moving.up && this.moving.left)
        this.dir = this.moving.dir = DIR.UPLEFT;
      else if (this.moving.up && this.moving.right)
        this.dir = this.moving.dir = DIR.UPRIGHT;
      else if (this.moving.down && this.moving.left)
        this.dir = this.moving.dir = DIR.DOWNLEFT;
      else if (this.moving.down && this.moving.right)
        this.dir = this.moving.dir = DIR.DOWNRIGHT;
      else if (this.moving.up)
        this.dir = this.moving.dir = DIR.UP;
      else if (this.moving.down)
        this.dir = this.moving.dir = DIR.DOWN;
      else if (this.moving.left)
        this.dir = this.moving.dir = DIR.LEFT;
      else if (this.moving.right)
        this.dir = this.moving.dir = DIR.RIGHT;
      else
        this.moving.dir = null; // no moving.dir, but still facing this.dir
    },

    addscore: function(n) { this.score = this.score + (n||0) * Mastermult; },

    heal: function(health) {
      this.health  = this.health + health;
      this.healing = FX.PLAYER_GLOW.frames;
      publish(EVENT.PLAYER_HEAL, this, health);
    },

    hurt: function(damage, by, automatic) {
      if (this.active() && !DEBUG.NODAMAGE) {
        damage = automatic ? damage : damage/this.type.armor;
        this.health = Math.max(0, this.health - damage);
        if (!automatic) {
          this.hurting = FX.PLAYER_GLOW.frames;
          publish(EVENT.PLAYER_HURT, this, damage);
        }
        if (this.health === 0)
          this.die();
      }
    },

    autohurt: function(frame) {
      if ((frame % (FPS/2)) === 0) {
// players automatically lose 1 health every 1/2 second
			if (this.lank > 0)
				this.heal(1);
			else
			if (!DEBUG.NOAUTOHURT)
				this.hurt(1, this, true);

// count down temps - may want a setTimeout fn for these and stalling
			if ((frame % (FPS)) === 0) 
			{
					if (this.lank > 0) this.lank--;
					if (this.lrepuls > 0) this.lrepuls--;
					if (this.linvis > 0) this.linvis--;
					if (this.linvuln > 0) this.linvuln--;
			}
// count down stun
			if (this.stun > 0) this.stun--;
// count health tics for stalling
			stalling = stalling + 1;
			if (stalling == DOORSTALL) {

				var cells   = reloaded.cells,
					 opendr = 0, cell, c, nc = cells.length;

				// now loop again checking for walls and other entities - doors
				for(c = 0 ; c < nc ; c++) {
					  cell = cells[c];
						if (cell.ptr)
						if (cell.ptr.door)
						{
//								alert("door cell: x, y "+c+": "+cell.x+", "+cell.y);
								if (!opendr) Musicth.play(Musicth.sounds.opendoor);
								cell.ptr.door = null;
								Masterthmp.map.remove(cell.ptr);
								opendr = true;
						}
				}
			} 	// end doorstall

			if (stalling == WALLSTALL) {

				var cells   = reloaded.cells,
					 walled, cell, c, nc = cells.length;

				// now loop again checking for walls and other entities
				for(c = 0 ; c < nc ; c++) {
					  cell = cells[c];
					  if (cell.wall !== undefined && cell.wall !== null)
					  if (cell.x != 0 &&  cell.y != 0)
						{
//							if (cell.y == 1 || cell.y == 2)
//								alert("cell: x, y "+cell.wall+": "+cell.x+", "+cell.y);
								if (!walled) Musicth.play(Musicth.sounds.wallexit);
								reloaded.addExit(cell.x, cell.y, DOOR.EXIT);
								cell.wall = null;	// so we dont fire these wall segs again
								walled = true;
						}
				}

			}	// end wallstall

		}
    },

    weak: function() {
      return this.health < 100;
    },

    die: function() {
      this.dead = true;
      publish(EVENT.PLAYER_DEATH, this);
    },

    nuke: function() {
      if (this.potions) {
        this.potions--;
/// debug code - remove pre-release
			if (DEBUGON)
					this.potions = 3;
/// debug tier
        publish(EVENT.PLAYER_NUKE, this);
      }
    },

    onrender: function(frame) {
      if (this.dead)
        this.frame = 32;
      else if (this.exiting)
        this.frame = this.type.sx + animate(this.exiting.count, this.exiting.fpf, 8);
      else if (is.valid(this.moving.dir) || this.firing)
        this.frame = this.type.sx + this.dir + (8 * animate(frame, this.type.fpf, this.type.frames));
      else
        this.frame = this.type.sx + this.dir;
// invisible status - last 10 secs flicker slows down
		 if (this.linvis > 10 || (timestamp() & 0x200))
		 if (this.linvis && (timestamp() & 0x80)) this.frame = 33;
    }

  });

  //===========================================================================
  // THE SCOREBOARD
  //===========================================================================

  var Scoreboard = Class.create({

    active: "active",

    initialize: function(level, score, who) {

      subscribe(EVENT.PLAYER_JOIN,  this.onPlayerJoin.bind(this));
      subscribe(EVENT.PLAYER_LEAVE, this.onPlayerLeave.bind(this));
      subscribe(EVENT.START_LEVEL,  this.onStartLevel.bind(this));

      this.dom      = $('scoreboard');
      this.level    = this.dom.down('.level');
      this.warrior  = this.playerDom(PLAYER.WARRIOR,  $('warrior'));
      this.valkyrie = this.playerDom(PLAYER.VALKYRIE, $('valkyrie')),
      this.wizard   = this.playerDom(PLAYER.WIZARD,   $('wizard')),
      this.elf      = this.playerDom(PLAYER.ELF,      $('elf'))
      this.high     = { dom: this.highScoreDom() };

      var p1 = this.warrior.down('.press b'),
          p2 = this.valkyrie.down('.press b'),
          p3 = this.wizard.down('.press b'),
          p4 = this.elf.down('.press b'),
          pressN = new Animator({ repeat: 'toggle', duration: 500 }).addSubject(function(value) {
            p1.fade(value);
            p2.fade(value);
            p3.fade(value);
            p4.fade(value);
          });
      pressN.play();

      this.refreshHighScore(score, who);
      this.refreshLevel(level);

    },

    playerDom: function(type, root) {
      type.dom = {
        root:    root,
        score:   root.down('.score .value'),
        health:  root.down('.health .value'),
        keys:    root.select('.treasure .key'),
        potions: root.select('.treasure .potion'),
        weak:    new Animator({ repeat: 'toggle', duration: 500, onComplete: function() { root.removeAttribute('style'); } }).addSubject(new CSSStyleSubject(root, "weak", "background-color: #000000; border-color: #000000;"))
      }
      return root;
    },

    highScoreDom: function() {
      var score = this.dom.down('.high .value'),
          who   = this.dom.down('.high'),
          flash = new Animator({ repeat: 'toggle', duration: 500, onComplete: function() { who.fade(1); } }).addSubject(function(value) { who.fade(1 - value*0.8); });
      return { score: score, who: who, flash: flash };
    },

    onStartLevel: function(map) {
      this.refreshLevel(map.level);
    },

    onPlayerJoin: function(player) {
      player.vhealth = player.vweak = player.vscore = player.vkeys = player.vpotions = null; // reset any cached 'visual' values
      player.type.dom.root.toggleClassName(this.active, true);
      player.type.dom.score.update(this.formatScore(0));
      player.type.dom.health.update(this.formatHealth(0));
      this.refreshTreasure(player.type.dom.keys, 0);
      this.refreshTreasure(player.type.dom.potions, 0);
    },

    onPlayerLeave: function(player) {
      player.type.dom.root.toggleClassName(this.active, false);
      player.type.dom.weak.stop();
      this.deactivateHighScore();
    },

    formatHealth: function(n) { return to.string(Math.floor(n)); },
    formatScore:  function(n) { return ("00000" + Math.floor(n)).slice(-8); },

    inc: function(previous, current) {
      previous = previous || 0;
      return (current > previous) ?
        Math.min(current, previous + Math.ceil((current - previous)/10)) :
        Math.max(current, previous + Math.floor((current - previous)/10));
    },

    refreshLevel: function(level) {
      this.level.update(level.name);
    },

    refreshHighScore: function(score, who) {
      if (score != this.high.score)
        this.high.dom.score.update(this.formatScore(this.high.score = score));
      if (who != this.high.who)
        this.high.dom.who.setClassName("high " + (this.high.who = who));
    },

    activateHighScore:   function() { this.high.active = true;  this.high.dom.flash.play(); },
    deactivateHighScore: function() { this.high.active = false; this.high.dom.flash.stop(); },

    refreshPlayer: function(player) {
      this.refreshPlayerHealth(player);
      this.refreshPlayerWeak(player);
      this.refreshPlayerScore(player);
      this.refreshPlayerKeys(player);
      this.refreshPlayerPotions(player);
      this.refreshPlayerPowers(player);
    },

    refreshPlayerScore: function(player) {
      if (player.score != player.vscore) {
        player.type.dom.score.update(this.formatScore(player.vscore = this.inc(player.vscore, player.score)));
        if (player.vscore > this.high.score) {
          this.refreshHighScore(player.vscore, player.type.name);
          if (!this.high.active) {
            this.activateHighScore();
            publish(EVENT.HIGH_SCORE, player);
          }
        }
      }
    },

    refreshPlayerHealth: function(player) {
      if (player.health != player.vhealth)
        player.type.dom.health.update(this.formatHealth(player.vhealth = this.inc(player.vhealth, player.health)));
    },

    refreshPlayerWeak: function(player) {
      if (player.weak() != player.vweak) {
        if (player.vweak = player.weak())
          player.type.dom.weak.play();
        else
          player.type.dom.weak.stop();
      }
    },

    refreshPlayerKeys: function(player) {
      if (player.keys != player.vkeys)
        this.refreshTreasure(player.type.dom.keys, player.vkeys = player.keys);
    },

    refreshPlayerPowers: function(player) {

		document.getElementById(player.type.name+"xspeed").style.visibility = player.xspeed ? "visible" : "hidden";
		document.getElementById(player.type.name+"xshotpwr").style.visibility = player.xshotpwr ? "visible" : "hidden";
		document.getElementById(player.type.name+"xshotspd").style.visibility = player.xshotspd ? "visible" : "hidden";
		document.getElementById(player.type.name+"xarmor").style.visibility = player.xarmor ? "visible" : "hidden";
		document.getElementById(player.type.name+"xfight").style.visibility = player.xfight ? "visible" : "hidden";
		document.getElementById(player.type.name+"xmagic").style.visibility = player.xmagic ? "visible" : "hidden";

		document.getElementById(player.type.name+"linvis").style.visibility = player.linvis ? "visible" : "hidden";
		document.getElementById(player.type.name+"linvuln").style.visibility = player.linvuln ? "visible" : "hidden";
		document.getElementById(player.type.name+"lrepuls").style.visibility = player.lrepuls ? "visible" : "hidden";
		document.getElementById(player.type.name+"lreflect").style.visibility = player.lreflect ? "visible" : "hidden";
		document.getElementById(player.type.name+"lsuper").style.visibility = player.lsuper ? "visible" : "hidden";
		document.getElementById(player.type.name+"ltele").style.visibility = player.ltele ? "visible" : "hidden";
		document.getElementById(player.type.name+"lank").style.visibility = player.lank ? "visible" : "hidden";

    },

    refreshPlayerPotions: function(player) {
      if (player.potions != player.vpotions)
        this.refreshTreasure(player.type.dom.potions, player.vpotions = player.potions);
    },

    refreshTreasure: function(elements, n) {
      var k, max;
      for(k = 0, max = elements.length ; k < max ; k++)
        elements[k].showIf(k < n);
    }

  });

  //===========================================================================
  // THE VIEWPORT
  //===========================================================================

  var Viewport = Class.create({

    initialize: function() {
      subscribe(EVENT.START_LEVEL, this.onStartLevel.bind(this));
    },

    onStartLevel: function(map) {
      this.size(VIEWPORT.TW, map);
      this.center(map.start, map);
      this.zoomingout = false;
    },

    outside: function(x, y, w, h) {
      return !Game.Math.overlap(x, y, w, h, this.x, this.y, this.w, this.h);
    },

    center: function(pos, map) {
      this.move(pos.x - this.w/2, pos.y - this.h/2, map);
    },

    move: function(x, y, map) {
      this.x = Game.Math.minmax(x, 0, map.w - this.w - 1);
      this.y = Game.Math.minmax(y, 0, map.h - this.h - 1);
    },

    size: function(tw, map) {
      this.tw = Game.Math.minmax(tw, 18, map.th < map.tw ? map.tw : map.th * (VIEWPORT.TW/VIEWPORT.TH));
      this.th = this.tw * (VIEWPORT.TH / VIEWPORT.TW);
      this.w  = this.tw * TILE;
      this.h  = this.th * TILE;
      game.runner.setSize(this.w, this.h);
    },

    zoom: function(tx, pos, map) {
      this.size(this.tw + tx, map);
      this.center(pos, map);
    },

    zoomout: function(on) {
      this.zoomingout = on
    },

    update: function(frame, player, map, viewport) {
      this.center(player, map);
      if (this.zoomingout)
        this.zoom(1/TILE, player, map);
    }

  });

  //===========================================================================
  // RENDERING CODE
  //===========================================================================

  var Render = Class.create({

    initialize: function(sprites) {
      this.sprites = sprites;
    },

    sprite: function(ctx, sprites, viewport, sx, sy, x, y, w, h) {
      ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, x - viewport.x, y - viewport.y, w || TILE, h || TILE);
    },

    tile: function(ctx, sprites, sx, sy, tx, ty) {
      ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, tx * TILE, ty * TILE, TILE, TILE);
    },

    map: function(ctx, frame, viewport, map) {
      var w = Math.min(map.w, viewport.w),
          h = Math.min(map.h, viewport.h);
      map.background = map.background || Game.renderToCanvas(map.w, map.h, this.maptiles.bind(this, map));
      ctx.drawImage(map.background, viewport.x, viewport.y, w, h, 0, 0, w, h);
    },

    maptiles: function(map, ctx) {
      var n, cell, tx, ty, tw, th, sprites = this.sprites.backgrounds;
		 if (wallsprites == undefined) wallsprites = sprites;
		if (map.level.gflr)
		 {
			var gimg = document.getElementById("gfloor");
			for(ty = 0, th = map.th ; ty < th ; ty=ty+8) {
			  for(tx = 0, tw = map.tw ; tx < tw ; tx=tx+8) {
						ctx.drawImage(gimg, 0, 0, STILE * 8, STILE * 8, tx * TILE, ty * TILE, TILE * 8, TILE * 8);
//						this.tile(ctx, gimg, 0, 0, tx, ty);
				  }
				}
		 }
		 fcellstr = map.cell(0, 0); // preload so no undefine
		 ftilestr = 0;
      for(ty = 0, th = map.th ; ty < th ; ty++) {
        for(tx = 0, tw = map.tw ; tx < tw ; tx++) {
          cell = map.cell(tx * TILE, ty * TILE);
          if (is.valid(cell.wall))
			  {
				  if (map.level.wall != WALL.INVIS){ 		// dont load wall tile for invis walls
					  if ((cell.pixel & MEXLOW) && (cell.pixel & MEXHIGH) == 0x404000)  // diff walls by low nibble
						this.tile(ctx, sprites, cell.wall, G1WALL[cell.pixel & MEXLOW], tx, ty);
					  else
						this.tile(ctx, sprites, cell.wall, DEBUG.WALL || map.level.wall, tx, ty);
						if (map.level.brikovr) this.tile(ctx, sprites, cell.wall, map.level.brikovr, tx, ty);
				  }
				  cell.ctx = ctx;						// for traps turning walls to floor, stalling walls to exits
				  cell.sprites = sprites;		//		shootable walls, g2 shot walls, g2 random walls, and so
				  cell.tileptr = this;
				  cell.map = map;
			  }
          else if (cell.nothing)
            this.tile(ctx, sprites, 0, 0, tx, ty);
          else
			  if (cell.pixel & MEXLOW)		// special diff floor tiles - up to 15 as of now
			  {
				  var nfl = cell.pixel & MEXLOW;
				  if ((cell.pixel & MEXHIGH) == 0xA08060)
						this.tile(ctx, sprites, nfl, FCUSTILE, tx, ty);
				  else if (((fcellstr.pixel & MEXHIGH) == 0xA08060) && (fcellstr.pixel & MEXLOW))
						this.tile(ctx, sprites, ftilestr, FCUSTILE, tx, ty);
				  ftilestr = nfl; // store for non floor content tests
			  }
			  else
			  if (!map.level.gflr)
            this.tile(ctx, sprites, DEBUG.FLOOR || map.level.floor, 0, tx, ty);
			if (map.level.wall == WALL.INVIS)				// do floor tile for invis walls
			{
				if (!map.level.gflr)
						this.tile(ctx, sprites, DEBUG.FLOOR || map.level.floor, 0, tx, ty);
			}
			else
			if (cell.shadow)		// dont shadow for invis walls
            this.tile(ctx, sprites, cell.shadow, WALL.INVIS, tx, ty);
// added a maze cheat - floor tile can be a subtle shift from std tile
// task: option this
			  if (cell.mapcht) this.tile(ctx, sprites, DEBUG.FLOOR || map.level.floor + 1, 0, tx, ty);
				fcellstr = cell;
        }
      }
      if (DEBUG.GRID)
        this.grid(ctx, map);
    },

    grid: function(ctx, map) {
      var tx, ty, tw, th;
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      for(ty = 0, th = map.th ; ty < th ; ty++) {
        ctx.moveTo( 0,     ty * TILE);
        ctx.lineTo( map.w, ty * TILE);
      }
      for(tx = 0, tw = map.tw ; tx < tw ; tx++) {
        ctx.moveTo( tx * TILE, 0     );
        ctx.lineTo( tx * TILE, map.h );
      }
      ctx.stroke();
    },

    player: function(ctx, frame, viewport, player) {

      if (player.onrender(frame) !== false) {

        var sprites = this.sprites.entities,
            sx      = player.type.sx + player.frame,
            sy      = player.type.sy,
            x       = player.x,
            y       = player.y - 2, // wiggle, wiggle, wiggle
            exiting = player.exiting ? (player.exiting.max - player.exiting.count) / player.exiting.max : 0,
            dx      = player.exiting ? (exiting * 2 * player.exiting.dx) : 0,
            dy      = player.exiting ? (exiting * 2 * player.exiting.dy) : 0,
            shrink  = player.exiting ? (exiting * 2 * TILE)              : 0,
            weak    = player.weak(),
            hurt    = player.hurting,
            heal    = player.healing,
            border  = 0,
            maxglow = FX.PLAYER_GLOW.border;

		 if (entsprites == undefined) entsprites = sprites;

			if (exiting > 0.5) // player is 'gone' once halfway through exit
          return;

        if (hurt || heal) {
          border = Math.ceil(maxglow * ((hurt || heal) / FX.PLAYER_GLOW.frames));
          player.ctx.fillStyle = hurt ? 'red' : 'green';
          player.ctx.fillRect(0, 0, player.canvas.width, player.canvas.height);
          player.ctx.globalCompositeOperation = 'destination-in';
          player.ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, maxglow - border, maxglow - border, STILE + 2*border, STILE + 2*border);
          player.ctx.globalCompositeOperation = 'source-over';
        }
        else {
          player.ctx.clearRect(0, 0, player.canvas.width, player.canvas.height);
        }

        player.ctx.globalAlpha = 1 - (weak ? player.type.dom.weak.state*0.9 : 0); // piggy back the DOM scoreboard animator (but dont go completely transparent)
        player.ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, maxglow, maxglow, STILE, STILE);

        ctx.drawImage(player.canvas, 0, 0, STILE + 2*maxglow, STILE + 2*maxglow, x + dx - maxglow + shrink/2 - viewport.x, y + dy - maxglow + shrink/2 - viewport.y, TILE + 2*maxglow - shrink, TILE + 2*maxglow - shrink);
      }
    },

    entities: function(ctx, frame, viewport, entities) {
      var n, max, entity, sf, sprites = this.sprites.entities;
      for(n = 0, max = entities.length ; n < max ; n++) {
        entity = entities[n];
        if (entity.active && (!entity.onrender || entity.onrender(frame) !== false) && !viewport.outside(entity.x, entity.y, TILE, TILE)) {
// note: RUNORG
				if (entity.type.wall)
						this.sprite(ctx, wallsprites, viewport, entity.sx + (entity.frame || 0), entity.type.sy, entity.x + (entity.dx || 0), entity.y + (entity.dy || 0), TILE + (entity.dw || 0), TILE + (entity.dh || 0));
				else if (entity.door)
						this.sprite(ctx, sprites, viewport, entity.sx + (entity.frame || 0), entity.type.sy, entity.x + (entity.dx || 0), entity.y + (entity.dy || 0), TILE + (entity.dw || 0), TILE + (entity.dh || 0));
				else
						this.sprite(ctx, sprites, viewport, entity.type.sx + (entity.frame || 0), entity.type.sy, entity.x + (entity.dx || 0), entity.y + (entity.dy || 0), TILE + (entity.dw || 0), TILE + (entity.dh || 0));
        }
      }
    }

  });

  //===========================================================================
  // SOUND FX and MUSIC
  //===========================================================================

  var Sounds = Class.create({

    initialize: function(sounds) {
      this.sounds      = sounds;
//      this.sounds.menu = this.sounds.lostcorridors;
      this.sounds.menu = this.sounds.gtitle;
      this.sounds.game = this.sounds.thebeginning;
      this.sounds.fire = this.sounds.firewizard;     // re-use wizard firing sound for monster (demon) fire
      this.sounds.nuke = this.sounds.potionbang; // TODO: find a big bang explosion
      this.toggleMute(this.isMute());

      $('sound').on('click', this.onClickMute.bind(this)).show();

      subscribe(EVENT.START_LEVEL,        this.onStartLevel.bind(this));
      subscribe(EVENT.PLAYER_FIRE,        this.onPlayerFire.bind(this));
      subscribe(EVENT.MONSTER_FIRE,       this.onMonsterFire.bind(this));
      subscribe(EVENT.PLAYER_EXITING,     this.onPlayerExiting.bind(this));
      subscribe(EVENT.PLAYER_HURT,        this.onPlayerHurt.bind(this));
      subscribe(EVENT.PLAYER_NUKE,        this.onPlayerNuke.bind(this));
      subscribe(EVENT.DOOR_OPEN,          this.onDoorOpen.bind(this));
      subscribe(EVENT.TREASURE_COLLECTED, this.onTreasureCollected.bind(this));
      subscribe(EVENT.MONSTER_DEATH,      this.onMonsterDeath.bind(this));
      subscribe(EVENT.GENERATOR_DEATH,    this.onGeneratorDeath.bind(this));
      subscribe(EVENT.HIGH_SCORE,         this.onHighScore.bind(this));
      subscribe(EVENT.PLAYER_DEATH,       this.onPlayerDeath.bind(this));
    },

    onStartLevel:        function(map)               { if (!NOBKGMUSIC) this.playGameMusic(this.sounds[DEBUG.MUSIC || map.level.music]); this.nlevel = map.nlevel;             },
    onPlayerFire:        function(player)            { this.play(this.sounds["fire" + player.type.name]);                                                     },
    onMonsterFire:       function(monster)           { this.play(this.sounds.fire);                                                                           },
    onDoorOpen:          function(door)              { this.play(this.sounds.opendoor);                                                                       },
    onTreasureCollected: function(treasure, player)  { this.play(this.sounds[treasure.type.sound]);                                               },
    onMonsterDeath:      function(monster, by, nuke) { this.play(nuke ? this.sounds.generatordeath : this.sounds["monsterdeath" + Game.Math.randomInt(1,3)]); },
    onGeneratorDeath:    function(generator, by)     { this.play(this.sounds.generatordeath);                                                                 },
    onHighScore:         function(player)            { this.play(this.sounds.highscore);                                                                      },
    onPlayerNuke:        function(player)            { this.play(this.sounds.nuke);                                                                           },
    onPlayerDeath:       function(player)            { this.stopAllMusic(); this.play(this.sounds.gameover); },

    onPlayerExiting: function(player, exit) {
      this.play(this.sounds.exitlevel);
		 if (RUNORG)
		 {
				if (this.nlevel === (cfg.levels.length-1)) {
				  this.sounds.game.stop();
				  this.play(this.sounds.victory);
				}
				else if (cfg.levels[this.nlevel].music != cfg.levels[this.nlevel+1].music) {
				  this.sounds.game.fade(3000);
				}
      }
		else
		{
			this.sounds.game.fade(3000);
		}
    },

    onPlayerHurt: function(player, damage) {
      if (!player.hurtSound || player.hurtSound.ended) // only play 1 at a time
        player.hurtSound = this.play(this.sounds[player.type.sex + "pain" + Game.Math.randomInt(1,2)]);
    },

    onClickMute: function(event) {
      this.toggleMute(this.isNotMute());
      this.toggleMusic();
    },

    toggleMute: function(on) {
      AudioFX.mute = game.storage.mute = on;
      $('sound').setClassName(AudioFX.mute ? 'off' : 'on');
    },

    toggleMusic: function() {
      if (AudioFX.mute)
        this.stopAllMusic();
      else if (game.is('menu'))
        this.playMenuMusic();
      else if (game.is('loading') || game.is('playing') || game.is('lost'))
        this.playGameMusic();
    },

    isMute:    function()  { return to.bool(game.storage.mute);     },
    isNotMute: function()  { return !this.isMute();                 },
    play:      function(s) { if (this.isNotMute()) return s.play(); },

    stopAllMusic: function() {
      this.sounds.menu.stop();
      this.sounds.game.stop();
    },

    playMenuMusic: function() {
      this.stopAllMusic();
/// DEBUG - restore
//      this.play(this.sounds.menu);
		Musicth = this;
    },

    playGameMusic: function(sound) {
      if (!sound || (sound !== this.sounds.game) || sound.audio.ended || sound.audio.paused) { // skip if specified game sound is already playing (leave it playing, dont restart it)
        this.stopAllMusic();
        this.play(this.sounds.game = sound || this.sounds.game);
      }
    }

  });

  //===========================================================================
  // FINALLY, return the game to the Game.Runner
  //===========================================================================

  return game;

  //===========================================================================

}

