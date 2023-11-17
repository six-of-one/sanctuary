Gauntlet = function() {

//  'use strict';

  //===========================================================================
  // CONFIGURATION CONSTANTS and ENUM's
  //===========================================================================

  var VERSION  = "1.0.2b",
/// allow debug mode testing - code should be removed pre-release
											DEBUGON = 0,
// debug - provide a one time start level
											initlevel = 0,
	vardbg = 0, dent, d1, d2, bb = 0,
/// end debug tier
// music control - needs user interf
// this turns off the ver 1.0.0 background music when true
/// before restoring music load must be cleaned up !
		NOBKGMUSIC = 0,
// set to 1 to run original code - this needs to be removed, as this will never function as intended now
		RUNORG = 0,
// when hitting last seq level, pick a random # between loop start and last level
// set rnd_level true to indicate running rnd levels from here on out
		loop_level = 8,
		rnd_level = 0,
// 30% chance to play g4sec short intro
		g4rc = 0.3,
// save to pointers. -> reload level parts, walls to exits, stall open doors, play sounds for those, and so on
// for some reason beyond me, setTimeout() calls only work in game.js - which has none of the game instances
// also doors / walls are stalled open from player health rot - which has none of these pointers loaded
// and could not get exit instance to pass exit to 4, 8 passed into the level load code
// above a specified level all levels will have unpinned corners, unless blocked
// if there is a non global var method of passing these class inheritance pointers around - I know it not
		reloaded, Mastercell, Masterthmp, Musicth, Mastermap, Mtw, Mth,
		Munpinx = false, Munpiny = false, Munhx, Munlx = 1, Munhy, Munly = 1, Mirx = false, Miry = false, Mrot = false,
		Mapdata, Huedata, Movexit, lastmex = 0, Movit = null, Phasewal, lastphas = 0, pwalled, altphas = 0, tilerend, Vx, Vy, mtm,
		levelplus, refpixel, shotpot, slowmonster = 1, slowmonstertime = 0, announcepause = false,
//	custom g1 tiler on 0x00000F code of floor tiles - save last tile & last cell
// FCUSTILE is after brikover last wall cover in backgrounds.png
		ftilestr, fcellstr, FCUSTILE = 37, FCUSTIL2 = 0, FDESTWALL = 38, FAKES = 29, HINTIV = 40, INVWALSY = 1, INVWALA = 0,

		 MEXHIGH = 0xF0FFF0,
		 MEXLOW = 0x00000F,
// special because some colors are not properly discerned by parseImag
// bit 16 is shifted to exlow
// this should be stable as most codes using 0x10 also use more bits masked with 0xE0
// having said, this has a bug watch and a reminder to look for odd behavior for all ops with low bits of MEXHIGH
		 MEXHIGB = 0xF0FFE0,
		 MEXLOB = 0x00001F,

// highscores
	scoredex = 0, dpstim = 0, dpsacc = 0,
	HSCORE = [ 0, "Names", "character" ],
// g1 custom walls diff from main wall mapped on EXLOB (special handle)
// invisible wall & shotable invisible are in INVWALSY, item 0 = INVWALA (0 shadow)
			G1WALL = [	0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 26	],

// handle death potion bomb rotating score -
//				note: NON g1, this is multiplied by score x {n} by current code!
		Deathmult, Dmmax = 7,
		Deathscore = [1000, 4000, 2000, 6000, 1000, 8000, 1000, 2000],
// give notice after potion burst of death pts
		Deathnote = [0, 2, 1, 3, 0, 4, 0, 1 ],
// 5 = 100, 6 = 500 for treasure pts & keys
		tp100 = 5, tp500 = 6,

      FPS      = 60,
      TILE     = 32,
      STILE    = 32,
      VIEWPORT = { TW: 24, TH: 24 },		// size of viewing map - arcade is closer to 16 x 16, tho setitng smaller sizes seems to have no effect
      DIR      = { UP: 0, UPRIGHT: 1, RIGHT: 2, DOWNRIGHT: 3, DOWN: 4, DOWNLEFT: 5, LEFT: 6, UPLEFT: 7 },
// teleport adjust by last player dir		- use player dir code (0 - 7) and these on teleport {x,y} to test surrounding cells
		DIRTX = [ 0, 32, 32, 32, 0, -32, -32, -32],
		DIRTY = [ -32, -32, 0, 32, 32, 32, 0, -32],
// point spawned theif in the dir his path indicates
		THFDIR = [
					[ 7, 0, 1 ],
					[ 6, 4, 2 ],
					[ 5, 4, 3 ],
							],
		wto = 3,		// shots timeout in 3 secs
// abiility & power potion enhance
		ppotmax = 2,
		abshotpot = -3,
		ABILIND = [ 10, 0, 10, 10, 0, 10, 10, 10, 30, 30, 20, 30, 30, 30, 30, 30, 30, 30, 30, 10, 20, 20, 10, 20, 20, 20, 30, 30, 10, 20, 20, 20, 30, 30, 0.15, 0, 0, 0.3, 0, 0, 1, 0.8, 0.65, 1, 1, 0.85 ],
		ABILRNG = [ 0, 0, 0, 10.25, 0, 0, 10.25, 0, 0, 0, 0, 0, 0, 0, 0, 5.25, 0, 0, 5.25, 0, 0, 10.25, 0, 0, 5.2, 0, 0, 5.2, 10.5, 10.5, 10.85, 10.4, 0, 5.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
      PLAYER = {
        WARRIOR:  { sx: 0, sy: 0, frames: 3, fpf: FPS/10, coins: 3, health: 2000, speed: 180/FPS, gluesp: 1, damage: 50/FPS, armor: 2, magic: 10, mind:10, mindg:4, weapon: { speed: 600/FPS, reload: 1.15*FPS, damage: 20, wind:10, rotate: true,  sx: 24, sy: 0, fpf: FPS/10, player: true }, sex: "male",   name: "warrior", helo: 'hlowar1', annc: 'ancwar1', blip: 'blipwarrior', fcol: "<font color=red>" }, // Thor
        VALKYRIE: { sx: 0, sy: 1, frames: 3, fpf: FPS/10, coins: 3, health: 2000, speed: 215/FPS, gluesp: 1, damage: 40/FPS, armor: 3, magic: 10, mind:10, mindg:4, weapon: { speed: 620/FPS, reload: 1*FPS, damage: 10, wind:19, rotate: false, sx: 24, sy: 1, fpf: FPS/10, player: true }, sex: "female", name: "valkyrie", helo: 'hloval1', annc: 'ancval1', blip: 'blipvalkyrie', fcol: "<font color=blue>" }, // Thyra
        WIZARD:   { sx: 0, sy: 2, frames: 3, fpf: FPS/10, coins: 3, health: 2000, speed: 190/FPS, gluesp: 1, damage: 30/FPS, armor: 1, magic: 30, mind:16, mindg:13, weapon: { speed: 640/FPS, reload: 1.1*FPS, damage: 10,  wind:28, rotate: false, sx: 24, sy: 2, fpf: FPS/10, player: true }, sex: "male",   name: "wizard", helo: 'hlowiz1', annc: 'ancwiz1', blip: 'blipwizard', fcol: "<font color=yellow>"   }, // Merlin
        ELF:      { sx: 0, sy: 3, frames: 3, fpf: FPS/10, coins: 3, health: 2000, speed: 245/FPS, gluesp: 1, damage: 20/FPS, armor: 1, magic: 30, mind:16, mindg:25, weapon: { speed: 660/FPS, reload: 1*FPS, damage: 10, wind:22, rotate: false, sx: 24, sy: 3, fpf: FPS/10, player: true }, sex: "male",   name: "elf", helo: 'hloelf1', annc: 'ancelf1', blip: 'blipelf', fcol: "<font color=green>"      }  // Questor
      },
      MONSTER = {
        GHOST:  { sx: 0, sy: 4, frames: 3, fpf: FPS/10, score:  10, health:  30, speed: 120/FPS, damage: 30, selfharm: 300, canbeshot: true,  canbehit: false, notfot: true, invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 11, 11, 6, 0 ], generator: { glvl: [ 11, 11, 6, 0 ], health:  30, speed: 3.5*FPS, max: 40, score: 100, sx: 32, sy: 4 }, name: "ghost",  weapon: null ,  hits: 'hitghost',     nohlp: 41   },
        DEMON:  { sx: 0, sy: 5, frames: 3, fpf: FPS/10, score:  20, health:  30, speed: 120/FPS, damage: 60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true, invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 12, 12, 7, 1 ], generator: { glvl: [ 12, 12, 7, 1 ], health: 30, speed: 3.5*FPS, max: 40, score: 200, sx: 32, sy: 5 }, name: "demon",  weapon: { speed: 240/FPS, reload: 2*FPS, damage: 10, sx: 24, sy: 5, fpf: FPS/10, monster: true } , hits: 'hithump',    nohlp: 43 },
        GRUNT:  { sx: 0, sy: 6, frames: 3, fpf: FPS/10, score:  30, health:  30, speed: 110/FPS, damage: 60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 13, 13, 8, 2 ], generator: { glvl: [ 13, 13, 8, 2 ], health: 30, speed: 3.5*FPS, max: 40, score: 300, sx: 32, sy: 6 }, name: "grunt",  weapon: null ,  hits: 'hithump',     nohlp: 42            },
        WIZARD: { sx: 0, sy: 7, frames: 3, fpf: FPS/10, score:  30, health:  30, speed: 120/FPS, damage: 60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: { on: 3*FPS, off: 6*FPS }, travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 14, 14, 9, 3 ], generator: { glvl: [ 14, 14, 9, 3 ], health: 30, speed: 4.0*FPS, max: 20, score: 400, sx: 32, sy: 6 }, name: "sorcerer", weapon: null , hits: 'hithump',     nohlp: 44               },
        DEATH:  { sx: 0, sy: 8, frames: 3, fpf: FPS/10, score:  1,  health:  20, speed: 125/FPS, damage: 59.2/FPS, selfharm: 6/FPS,  canbeshot: false, canbehit: 2, notfot: true, invisibility: false,							travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 4, 4, 4, 4 ], generator: { glvl: [ 4, 4, 4, 4 ], health: 30, speed: 5.0*FPS, max: 14, score: 1000, sx: 32, sy: 8 }, name: "death",  weapon: null,     nohlp: 60		},
        LOBBER: { sx: 0, sy: 9, frames: 3, fpf: FPS/10, score:  10, health:  30, speed: 80/FPS,  damage: 0/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false, travelling: 0.3*FPS, thinking: 0.5*FPS, mlvl: [ 15, 15, 10, 5 ], generator: { glvl: [ 15, 15, 10, 5 ], health: 30, speed: 3.5*FPS, max: 20, score: 100, sx: 32, sy: 6 }, name: "lobber", weapon: { speed: 180/FPS, reload: 1.9*FPS, damage: 10, sx: 24, sy: 9, fpf: FPS/10, monster: true, lobsht: true, foir: 'firelob' }    ,     nohlp: 45                },
// added level 2, level 1 monsters - set above is level 3
        GHOST2:  { sx: 0, sy: 13, frames: 3, fpf: FPS/10, score:  10, health:  20, speed: 120/FPS, damage: 20, selfharm: 300, canbeshot: true,  canbehit: false, notfot: true, invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 11, 11, 6, 0 ], generator: { glvl: [ 11, 11, 6, 0 ], health:  20, speed: 3.5*FPS, max: 42, score: 50, sx: 32, sy: 4 }, name: "ghost",  weapon: null  , hits: 'hitghost',     nohlp: 41        },
        DEMON2:  { sx: 0, sy: 15, frames: 3, fpf: FPS/10, score:  20, health:  20, speed: 100/FPS, damage: 60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 12, 12, 7, 1 ], generator: { glvl: [ 12, 12, 7, 1 ], health: 20, speed: 3.5*FPS, max: 42, score: 200, sx: 32, sy: 5 }, name: "demon",  weapon: { speed: 240/FPS, reload: 2.2*FPS, damage: 10, sx: 24, sy: 5, fpf: FPS/10, monster: true } ,  hits: 'hithump',    nohlp: 43 },
        GRUNT2:  { sx: 0, sy: 17, frames: 3, fpf: FPS/10, score:  30, health:  20, speed: 100/FPS, damage: 60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 13, 13, 8, 2 ], generator: { glvl: [ 13, 13, 8, 2 ], health: 20, speed: 3.5*FPS, max: 42, score: 300, sx: 32, sy: 6 }, name: "grunt",  weapon: null , hits: 'hithump',     nohlp: 42               },
        WIZARD2: { sx: 0, sy: 19, frames: 3, fpf: FPS/10, score:  30, health:  20, speed: 120/FPS, damage: 60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: { on: 3*FPS, off: 6*FPS }, travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 14, 14, 9, 3 ], generator: { glvl: [ 14, 14, 9, 3 ], health: 20, speed: 4.0*FPS, max: 24, score: 400, sx: 32, sy: 6 }, name: "sorcerer", weapon: null , hits: 'hithump',     nohlp: 44            },
        LOBBER2: { sx: 0, sy: 21, frames: 3, fpf: FPS/10, score:  10, health:  20, speed: 80/FPS,  damage: 40/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false, travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 15, 15, 10, 5 ], generator: { glvl: [ 15, 15, 10, 5 ], health: 20, speed: 3.5*FPS, max: 26, score: 100, sx: 32, sy: 6 }, name: "lobber", weapon: { speed: 180/FPS, reload: 1.9*FPS, damage: 10, sx: 24, sy: 9, fpf: FPS/10, monster: true, lobsht: true, foir: 'firelob' }  ,     nohlp: 45               },
		  GHOST1:  { sx: 0, sy: 14, frames: 3, fpf: FPS/10, score:  10, health:  10, speed: 120/FPS, damage: 10, selfharm: 300, canbeshot: true,  canbehit: false, notfot: true, invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 11, 11, 6, 0 ], generator: { glvl: [ 11, 11, 6, 0 ], health:  10, speed: 3.5*FPS, max: 44, score: 50, sx: 32, sy: 4 }, name: "ghost",  weapon: null  , hits: 'hitghost',     nohlp: 41        },
        DEMON1:  { sx: 0, sy: 16, frames: 3, fpf: FPS/10, score:  20, health:  10, speed: 100/FPS, damage: 60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 12, 12, 7, 1 ], generator: { glvl: [ 12, 12, 7, 1 ], health: 10, speed: 3.5*FPS, max: 44, score: 200, sx: 32, sy: 5 }, name: "demon",  weapon: { speed: 240/FPS, reload: 2.5*FPS, damage: 10, sx: 24, sy: 5, fpf: FPS/10, monster: true } , hits: 'hithump',     nohlp: 43},
        GRUNT1:  { sx: 0, sy: 18, frames: 3, fpf: FPS/10, score:  30, health:  10, speed: 100/FPS, damage: 60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false,                     travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 13, 13, 8, 2 ], generator: { glvl: [ 13, 13, 8, 2 ], health: 10, speed: 3.5*FPS, max: 44, score: 300, sx: 32, sy: 6 }, name: "grunt",  weapon: null , hits: 'hithump',     nohlp: 42              },
        WIZARD1: { sx: 0, sy: 20, frames: 3, fpf: FPS/10, score:  30, health:  10, speed: 110/FPS, damage: 60/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: { on: 3*FPS, off: 6*FPS }, travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 14, 14, 9, 3 ], generator: { glvl: [ 14, 14, 9, 3 ], health: 10, speed: 4.0*FPS, max: 28, score: 400, sx: 32, sy: 6 }, name: "sorcerer", weapon: null , hits: 'hithump',     nohlp: 44            },
        LOBBER1: { sx: 0, sy: 22, frames: 3, fpf: FPS/10, score:  10, health:  10, speed: 80/FPS,  damage: 40/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false, travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 15, 15, 10, 5 ], generator: { glvl: [ 15, 15, 10, 5 ], health: 10, speed: 3.5*FPS, max: 32, score: 100, sx: 32, sy: 6 }, name: "lobber", weapon: { speed: 180/FPS, reload: 1.9*FPS, damage: 10, sx: 24, sy: 9, fpf: FPS/10, monster: true, lobsht: true, foir: 'firelob' }   ,     nohlp: 45                 },
// theif speed: 220/FPS is speed of elf+xspd
        THIEF:   { sx: 0, sy: 23, frames: 3, fpf: FPS/10, score:  50, health:  10, speed: 225/FPS, damage: 20/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false, travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 16, 16, 16, 16 ], generator: { glvl: [ 16, 16, 16, 16 ], health: 10, speed: 5.5*FPS, max: 14, score: 100, sx: 32, sy: 6, theif: 4 }, theif: true, name: "thief", weapon: null,  steal: 500, bsound: 'hitheif',   nohlp: 39               },
        MUGGER:  { sx: 0, sy: 24, frames: 3, fpf: FPS/10, score:  50, health:  10, speed: 233/FPS, damage: 0, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false, travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 17, 17, 17, 17 ], generator: { glvl: [ 17, 17, 17, 17 ], health: 10, speed: 5.5*FPS, max: 16, score: 100, sx: 32, sy: 6, theif: 4 }, theif: true, name: "mugger", weapon: null , steal: 100, bsound: 'himug',    nohlp: 62               },
// g2 calls this the acid blob - it looks like an angry pickle...
        PICKLE:  { sx: 0, sy:  25, frames: 3, fpf: FPS/10, score:  1000, health:  60, speed: 40/FPS, damage:  60, selfharm: 300,      canbeshot: false,  canbehit: false, notfot: true, invisibility: false, travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 18, 18, 18, 18 ], generator: { glvl: [ 18, 18, 18, 18 ], health: 10, speed: 1.5*FPS, max: 20, score: 500, sx: 32, sy: 8 }, scorefx: 0, twopot: 1, name: "Acid blob", weapon: null  ,  hits: 'hitpickle',   nohlp: 63               },
		 SUPERSOC: { sx: 0, sy: 7,  frames: 3, fpf: FPS/10, score: 100, health:  10, speed: 1/FPS, damage: 120/FPS, selfharm: 0,      canbeshot: true,  canbehit: true,  invisibility: false, travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 19, 19, 19, 19 ], generator: { glvl: [ 19, 19, 19, 19 ], health: 40, speed: 1.0*FPS, max: 6, score: 1000, sx: 32, sy: 8 }, scorefx: 5, twopot: 1, name: "Super sorcerer", weapon: { speed: 240/FPS, reload: 3*FPS, damage: 50, sx: 24, sy: 7, fpf: FPS/10, monster: true } , hits: 'hithump',     nohlp: 69          },
            IT:  { sx: 24, sy: 23, frames: 7, fpf: FPS/10, score: 6000, health: 600, speed: 140/FPS, damage:  0, selfharm: 660,      canbeshot: true,  canbehit: false, notfot: true, invisibility: false, travelling: 0.5*FPS, thinking: 0.5*FPS, mlvl: [ 20, 20, 20, 20 ], generator: { glvl: [ 20, 20, 20, 20 ], health: 50, speed: 1.5*FPS, max: 2, score: 500, sx: 32, sy: 8 }, scorefx: 3, twopot: 2, name: "IT", weapon: null  ,  hits: 'hithump',   nohlp: 70             }
      },
// track a potential "richest" player path - (really have to track them all...)
		THIEFTRX = [ ], THIEFTRY = [ ], thieftrack = 0, one_theif = 0, theif_ad = 0x400100, mug_ad = 0x400110, thf_mug_bal = 0.2, stolen_load = 0, NOSPAWNTHF = 4, nohlpkth = 39, nohlpinl = 40, thieftim = 0, thiefrnd = 0.35, thieftotim = 25, thiefexit = false,
		THFTALK = [  'thfycc1',  'thfycc2', 'thfheh1', 'thfheh2', 'thfheh3', 'thflau1', 'thflau2' ],
// list of tutorial and help messages to display
		HELPDIS = [
									"Null 0 entry - no usable",
// ops
									"You now have extra speed",																						// 1
									"You now have extra shot power",
									"You now have extra shot speed",
									"You now have extra armor",
									"You now have extra fight power",																				// 5
									"You now have extra magic power",
									"You now have limited invisibility",
// lvl notification
									"<font color=yellow>Find the hidden potion</font>",
									"<font color=red>You have # seconds to collect treasures</font>",
									"<font color=yellow>You must exit to receive bonus points</font>",									// 10
									"Player shots now stun other players",
									"Player shots now hurt other players",
									"Players can now go off screen",
// help only
									"Treasure: 100 points",
									"Treasure: 500 points",																								// 15
									"Food: health increased by #",
									"Food: health increased by RND",
// help items & rnd lvl messages
									"Save keys to open doors",
									"Save potions for later use",
									"Traps make walls disappear",																						// 20
									"Some food destroyed by shots",
//									"Shooting magic potions has a lesser effect",							// g IV dialog
									"Shooting a potion has a lesser effect",
									"Magic potions work differently for each player",
									"Magic potions affect everything on screen",
									"Transporters move you to<br> the closest transporter visible",										// 25
									"Some walls may be destroyed",
									"Stalling will cause doors to open",
									"Find exit to next level",
									"Get bonus multiplier by collecting treasure",
									"More players allow higher bonus multiplier",																// 30
									"Add more players for greater fire power",
									"Have friends join in",
// lvl messages 2, 3, 4, 5, 6, 7
									"Ghosts must be shot",
									"Some food can be destroyed",
									"Fight hand to hand by running into grunts",																	// 35
									"Beware the demons which shoot you",
									"Sorcerers may be invisible",
									"Use magic to kill death",
// thief msg
									"Kill thief to recover stolen item",
									"Item on next level",																								// 40
// ply action only
									"Player loses # health<br>Shoot or avoid ghosts",
									"Player loses # health<br>Shoot or fight grunts",
									"Player loses # health<br>Shoot or fight demons",
									"Player loses # health<br>Shoot or fight sorcerers",
									"Player loses # health<br>Shoot or fight lobbers",															// 45

									"Collect magic potion before pressing magic",
									"You are full of bombs and/or keys",
									"Shots do not hurt other players yet",
// gII
									"Some tiles stun players",
									"Shooting poison slows monsters",																				// 50
									"You now have invulnerability",
									"You now have extra repulsiveness",
									"You now have reflective shots",
									"You now have super shots",
									"You now have teleportability",																					// 55
//									"Some chests are locked",
//									"Some treasure requires keys",
									"Use key to open treasure chest",
//									"Some walls may be pushed",
									"Push movable walls",																								// 57
// expanded
									"Fooled you!  Some items may be fake",
									"You now have the healing ankh",
									"Player loses # health<br>use magic to kill death",														// 60
// g2 messages start here
// g2 also reverses monster hit msg, to say player loses {N} health second, as here
									"Avoid force fields<br>Player loses # health",																// 61

// mugger msg
									"Kill mugger to recover stolen health",
									"Avoid acid puddles<br>Player loses # health",
									"Acid puddles move randomly",																						// 64
									"Some walls can be shot and turn into good or bad",
// use if g2 mode is active, when getting a key
									"Save keys to open doors or chests",
									"There can be more than one trap",
//									"Death 'dies' after taking<br>up to 200 health",
// alt idea, sounds better
									"Death disappears after<br>taking up to 200 health",
									"Shoot super sorceror<br>Player loses # health",
// this is g2 msg, diff from g1 msg
//									"Have friends join in any time",
									"You are now IT",																										// 70
//									"Monsters follow player<br>who is IT",
									"Tag, you're IT",
									"Some walls move randomly",
//									"Monsters may move differently",

/// --------------------------------------------------------------------------------------
// extended tut for new items & significant points of previous items not already declared
									"Some fake items can be shot",																					// 73 - these may seem like g2, but they are extended
									"Food: # health<br>Some food provides variable health",
// placeholders for expansion
									"You now have the healing ankh",
									"Walls may be invisible",
									"help # 77",
									"Some invisible walls can be shot",
									"Pushwalls can be destroyed",
									"Poisoned: you are dizzy<br>Player loses # health",
									"Cycle walls keep shifting",

// expanded - liquids - all help after this makes a nonsolid item that can be walked through, damage still occurs
									"Water slows you down",																								// 82
									"Lava is very dangerous<br>Avoid lava or take # damage",
									"Toxic ooze is dangerous<br>Avoid slime or take # damage",


//									"Level 4+ grunts can throw clubs",
//									"Heavy death can shoot to drain life",
//									"",

// these are in the g1 intro, but not coded in
//									"Shoot ghosts",
//									"Shoot ghost generators",
//									"Some ghosts take more shots",
//									"Fight grunts",
									"Your goal: find exit"

									],
		HELPANNC = [ ], // announcer help tie ins
		HELPCLEAR = [ ],	// help messages only display one time or can be turned off
//		helpdsf = "Some food destroyed by shots", helpsap = "Shooting a potion has a lesser effect", helpcmb = "Collect magic potion before pressing magic",
//		helppois = "Shooting poison slows monsters",
		nohlpdsf = 21, nohlpsap = 22, nohlpcmb = 46, nohlppois = 50, nohlpmagaff = 24, nohlptr = 9, nohlpmstex = 10,
		nohlplvl = 18, nohlplvlend = 38, haseatenplay = 0.05, haseatenall = 0, whohaseaten = [ ],
// dont shoot food				25
// shooting a potion			26
// collect magic before	27
		helpcleared = 0, // option - tutorial count down
// easy way to detect non shootables - via help codes
		FFHLP = 61, TRPHLP = 20, STNHLP = 49, PCKLHLP = 63, FITCH = 58, FICBS = 73, RNDHLP = 74, PSWDHLP = 79, WTHLP = 82,
// help message ranges for tutorial exclusion
		G1HLP = 48, G2HLP = 72,
		MOVEX = 0x4040,
// special help for (diff from "all walls are invisible") invisible walls
		INVSWALCD = 0x811F, INVWALCD = 0x812F, IVWHLP = 76, IVWSHLP = 78,
		PUSHWAL = 0x80D0, PWALLSPD = 0.6, pmvx, pmvy,

      TREASURE = {
        HEALTH:  { sx: 0, sy: 11, frames: 1, fpf: FPS/10, score:  10, health:  100, canbeshot: 2,   sound: 'collectfood', nohlp: 16 },
        HEALRND: { sx: 2, sy: 11, frames: 1, fpf: FPS/10, score:  10, health:  200, canbeshot: 2,   sound: 'collectfood',  nohlp: 74   },
        FOOD1:   { sx: 3, sy: 11, frames: 1, fpf: FPS/10, score:  10, health:  100, canbeshot: 3,   sound: 'collectfood',  nohlp: 16  },
        FOOD2:   { sx: 4, sy: 11, frames: 1, fpf: FPS/10, score:  10, health:  100, canbeshot: 3,   sound: 'collectfood',  nohlp: 16  },
        FOOD3:   { sx: 5, sy: 11, frames: 1, fpf: FPS/10, score:  10, health:  100, canbeshot: 3,   sound: 'collectfood',  nohlp: 16   },
        POISON:  { sx: 1, sy: 11, frames: 1, fpf: FPS/10, score:   0, damage:  50, poison: true, canbeshot: 2,   sound: 'collectpotion',  nohlp: 80 },
        KEY:     { sx: 21, sy: 10, frames: 1, fpf: FPS/10, score:  100, key:    true,  sound: 'collectkey' , nohlp: 18   },
        POTION:  { sx: 6, sy: 11, frames: 1, fpf: FPS/10, score:  50, potion: true, canbeshot: 2,  sound: 'collectpotion', nohlp: 19 },
        POTIONORG:  { sx: 7, sy: 11, frames: 1, fpf: FPS/10, score:  50, potion: true, canbeshot: 0,  sound: 'collectpotion', nohlp: 19  },
        BADPOT:  { sx: 8, sy: 11, frames: 1, fpf: FPS/10, score:   0, damage:  50, poison: true, canbeshot: 2,   sound: 'collectpotion',  nohlp: 80 },
        GOLD:    { sx: 16, sy: 10, frames: 3, fpf: FPS/10, score: 100, canbeshot: 3,  scmult : 1, troom: 1,             sound: 'collectgold', nohlp: 14, blkhlp: 15   },
        LOCKED:  { sx: 19, sy: 10, frames: 1, fpf: FPS/10, score: 500,  lock: true, gud: 1, sound: 'unlkches', nohlp:   56 },
        BAG:     { sx: 20, sy: 10, frames: 1, fpf: FPS/10, score: 500, canbeshot: 3,  scmult : 3.5, troom: 1,                sound: 'collectgold', nohlp: 15, blkhlp: 14   },
// teleport, trap, stun, force field tiles as treasure objects for now -- these are animated, and operate on touch so it works
        TELEPORT:       { sx: 1, sy: 12, frames:4, speed: 1*FPS, fpf: FPS/5, teleport: true,   sound: 'teleport',  nohlp: 25  },
        TRAP:       { sx: 23, sy: 10, frames:4, speed: 1*FPS, fpf: FPS/5, trap: true,   sound: 'trap', nohlp: 20 },
        STUN:       { sx: 27, sy: 10, frames:4, speed: 1*FPS, fpf: FPS/4, stun: true,   sound: 'stun', nohlp: 49  },
        PUSH:       { sx: 0, sy: 12, frames:1, speed: 1*FPS, fpf: FPS/4, health:270, canbeshot: 2, pushwal: 6,   sound: 'null', nohlp: 57  },
// extra power potions
        XSPEED:     { sx: 9, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, potion: true, canbeshot: 2, annc: 'ancxspd',  sound: 'collectpotion', nohlp: 1  },
        XSHOTPWR:   { sx: 10, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, potion: true, canbeshot: 2, annc: 'ancxshtpwr',   sound: 'collectpotion',  nohlp: 2  },
        XSHOTSPD:   { sx: 11, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, potion: true, canbeshot: 2, annc: 'ancxshtspd',   sound: 'collectpotion', nohlp: 3  },
        XARMOR:     { sx: 12, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, potion: true, canbeshot: 2, annc: 'ancxarm',   sound: 'collectpotion', nohlp: 4  },
        XFIGHT:     { sx: 13, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, potion: true, canbeshot: 2, annc: 'ancxft',   sound: 'collectpotion' , nohlp: 5 },
        XMAGIC:     { sx: 14, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, potion: true, canbeshot: 2, annc: 'ancxmag',   sound: 'collectpotion', nohlp: 6  },
// limited (temporary) powers
        LIMINVIS:       { sx: 15, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, annc: 'ancinvis',   sound: 'collectpotion', nohlp: 7  },
        LIMINVUL:       { sx: 16, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true,   sound: 'collectpotion',  nohlp: 51 },
        LIMREPUL:       { sx: 17, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, annc: 'g2anrep',   sound: 'collectpotion',  nohlp: 52  },
        LIMREFLC:       { sx: 18, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, annc: 'g2anrefls',   sound: 'collectpotion', nohlp: 53  },
        LIMSUPER:       { sx: 19, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true,  sound: 'collectpotion', nohlp: 54  },
        LIMTELE:       { sx: 20, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true, annc: 'g2antt',   sound: 'collectpotion',  nohlp: 55  },
        LIMANK:       { sx: 21, sy: 11, frames:1, speed: 1*FPS, fpf: FPS/4, powers: true,   sound: 'collectpotion',  nohlp: 75  },
// shootable wall - see grid 38 of backgrounds
		  FAKEENTR:			{ sx: 0, sy: 38, frames:1, speed: 1*FPS, fpf: FPS/4, canbeshot: 2, health:30, wall:true,   sound: 'null' ,  nohlp: 26}, // fake entry to hold slot of old shotwall
        SHOTWALL:       { sx: 0, sy: 2, frames:1, speed: 1*FPS, fpf: FPS/4, canbeshot: 2, health:30, wall:true,   sound: 'null' ,  nohlp: 26},	// new shotwalls, have wall form with rubble instaed of the single square of unformed rubble
        SHOTWALL2:       { sx: 0, sy: 16, frames:1, speed: 1*FPS, fpf: FPS/4, canbeshot: 2, health:30, wall:true,   sound: 'null' ,  nohlp: 26},
// shotable and non-shot fake items, see grid 39 of backgrounds
        SHOTFAKER:       { sx: 8, sy: 29, frames:1, speed: 1*FPS, fpf: FPS/4, score:  50, canbeshot: 2, health:16, wall:true,   sound: 'null' , nohlp: 58 },
        PERMFAKER:       { sx: 8, sy: 29, frames:1, speed: 1*FPS, fpf: FPS/4, canbeshot: 3, wall:true,   sound: 'null' , nohlp: 58 },
// this is the red wall pillar thingy code:0x8130 with [ inward ] facing up, down, left, right by MEXLOW bits 0, 1, 2, 3
        FFIELDUNIT:       { sx: 0, sy: 27, frames:4, speed: 1*FPS, fpf: FPS/5, damage: 0, sound: 'null'  },
        FFIELDUNITD:       { sx: 4, sy: 27, frames:4, speed: 1*FPS, fpf: FPS/5, damage: 0, sound: 'null'  },
        FFIELDUNITL:       { sx: 8, sy: 27, frames:4, speed: 1*FPS, fpf: FPS/5, damage: 0, sound: 'null'  },
        FFIELDUNITR:       { sx: 12, sy: 27, frames:4, speed: 1*FPS, fpf: FPS/5, damage: 0, sound: 'null'  },
// this is the power field down - specced by MEXLOW bit 4 of FFIELDUNIT = 0x8130
        FFIELDDIM:       { sx: 27, sy: 25, frames:1, speed: 1*FPS, fpf: FPS/5, damage: 0, sound: 'null',  nohlp: 61  },
// this is the field power that damages, this is toggled on by ffieldpulse ops
        FFIELDPOW:       { sx: 28, sy: 25, frames:8, speed: 1*FPS, fpf: FPS/2, damage: 3, sound: 'ffield',  nohlp: 61  },
// animated floor items
        WATER:      { sx: 0, sy: 26, frames:4, speed: 1*FPS, fpf: FPS/5, gluesp: 0.5, damage: 0, sound: 'null', nohlp: 82  },
// series of water boundary blocks code: 0x8140, with a pool wall appearing top, center and right, selected by MEXLOW 1, 2, 3
        WATERT:     { sx: 4, sy: 26, frames:4, speed: 1*FPS, fpf: FPS/5, gluesp: 0.5, damage: 0, sound: 'null', nohlp: 82  },
        WATERC:     { sx: 8, sy: 26, frames:4, speed: 1*FPS, fpf: FPS/5, gluesp: 0.5, damage: 0, sound: 'null', nohlp: 82  },
        WATERR:     { sx: 12 , sy: 26, frames:4, speed: 1*FPS, fpf: FPS/5, gluesp: 0.5, damage: 0, sound: 'null', nohlp: 82  },
// series of lava blocks code: 0x8150. with MEXLOW as water
        LAVA:       { sx: 16, sy: 26, frames:4, speed: 1*FPS, fpf: FPS/5, gluesp: 0.8, damage: 10, sound: 'null', nohlp: 83  },
        LAVAT:      { sx: 20, sy: 26, frames:4, speed: 1*FPS, fpf: FPS/5, gluesp: 0.8, damage: 10, sound: 'null', nohlp: 83  },
        LAVAC:      { sx: 24, sy: 26, frames:4, speed: 1*FPS, fpf: FPS/5, gluesp: 0.8, damage: 10, sound: 'null', nohlp: 83  },
        LAVAR:      { sx: 28, sy: 26, frames:4, speed: 1*FPS, fpf: FPS/5, gluesp: 0.8, damage: 10, sound: 'null', nohlp: 83  },
        NWASTE:     { sx: 16, sy: 27, frames:3, speed: 1*FPS, fpf: FPS/5, gluesp: 0.7, damage: 1, sound: 'null', nohlp: 84  },
        NWASTET:    { sx: 19, sy: 27, frames:3, speed: 1*FPS, fpf: FPS/5, gluesp: 0.7, damage: 1, sound: 'null', nohlp: 84  },
        NWASTEC:    { sx: 22, sy: 27, frames:3, speed: 1*FPS, fpf: FPS/5, gluesp: 0.7, damage: 1, sound: 'null', nohlp: 84  },
        NWASTER:    { sx: 25, sy: 27, frames:3, speed: 1*FPS, fpf: FPS/5, gluesp: 0.7, damage: 1, sound: 'null', nohlp: 84  },
        FIRESTK:    { sx: 32, sy: 26, frames:4, speed: 1*FPS, fpf: FPS/5, gluesp: 0.7, damage: 0, sound: 'null', nohlp: 999  },
        PFLOOR1:    { sx: 28, sy: 27, frames:8, speed: 1*FPS, fpf: FPS/2, damage: 0, sound: 'null', nohlp: 999  },
// other "wall" ents
        WALLGUD:       { sx: 0, sy: 1, frames:1, speed: 1*FPS, fpf: FPS/4, canbeshot: 2, health:10, wall:true, gud: 3,   sound: 'shotwall',  nohlp: 65 },
        WALLGUD2:       { sx: 0, sy: 17, frames:1, speed: 1*FPS, fpf: FPS/4, canbeshot: 2, health:10, wall:true, gud: 3,   sound: 'shotwall',  nohlp: 65 },
        WALLPASS:       { sx: 0, sy: 1, frames:1, speed: 1*FPS, fpf: FPS/4, wall:true,   sound: 'null',  nohlp: 999 },
        WALLPASS2:       { sx: 0, sy: 17, frames:1, speed: 1*FPS, fpf: FPS/4, wall:true,   sound: 'null',  nohlp: 999 },
        WALLRND:       { sx: 0, sy: 1, frames:1, speed: 1*FPS, fpf: FPS/4, wall:3,  sound: 'null',  nohlp: 72 },
        WALLRND2:       { sx: 0, sy: 17, frames:1, speed: 1*FPS, fpf: FPS/4, wall:3,  sound: 'null',  nohlp: 72 },
        WALLPHS:       { sx: 0, sy: 1, frames:1, speed: 1*FPS, fpf: FPS/4, wall:4,  bsound: 'wallphase',  nohlp: 81 },
        WALLPHS2:       { sx: 0, sy: 17, frames:1, speed: 1*FPS, fpf: FPS/4, wall:4,  bsound: 'wallphase',  nohlp: 81 },

// note on this: FPS/1 is slower than FPS/5 -- speed is for moving ents
// note: when you add to TREASURE list, you MUST add to 'TREASURES = [' below
      },
		TROOMCNT = [ ], TROOMSUP = [ ], RNGLOAD = [ ],
		TREASUREROOM = [ ], tlevel = 0, troomfin, timerupd,	treasurerc = 0, leveldisp, levelhelp, lastrt, trtauntrnd = 0.45,
		spotionlv = 0, spotionloop = 0, spotionct = 0, spotionmax = 5, spotionrnd = 0.17, SPOTION = [ ], 		// hidden potion set
		reflectcnt = 4, wallcoll, 			// reflective shot, count of reflections
		TELEWAL = [ 1, 1, 2, 0, 4, 5, 0, 0, 8, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], // can limited teleport thru these
		POISONTM = 15,		// 10 secs of poison (muddle controls from dizzy effect)
		POISONDIZ = 0.2,	// chance dizzy condition will confuse player
		SUPERSHTFR = 10,	// super shot proj frame
		LOBBERFUSE = 27,	// distance from target lobber shots go "hot"
		TELEPORTILE = 0x0080a0,
		FFIELDTILE = 0x008130,
// until target traps are coded any trap will remove these
		TRAPWALL = 0x404030,
		TRAPTRIG = 0x0080b0,
// special "treasure" walls
		PXWALSHT = 0x8100,
		PXWALGUD = 0x8190,
		PXWALPASS = 0x81CF,
		PXWALRND = 0x81D0,
		PXWALPHAS = 0x820F,
// tell load a start was found - if not randomly add one to prevent load fail
		fndstart = 0,
// after {n} health tics with no player move / fire, all walls are exits
/// RESTORE to 188 for g1 arcade mode cbx -- 328 for g2 mode
		WALLSTALL = 100,
// after {n} health tics with no player move / fire, all doors open -- G2 adds 5 to door stall times, g1 wallstall 188, g2 wallstall 328
		DOORSTALL = 15, KEYSTALL = 34, doorstalled,
		stalling,
		ffieldpulse,
		heartbeet = 0,
// doors open counter-clockwise and stop opening in a clockwise dir when hitting corners & Ts
		doorstop = [ 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0 ],
      DOOR = {
        HORIZONTAL:  { sx: 10, sy: 10, speed: 0.05*FPS, horizontal: true,  vertical: false, dx: 2, dy: 0 },
        VERTICAL:    { sx: 5,  sy: 10, speed: 0.05*FPS, horizontal: false, vertical: true,  dx: 0, dy: 8 },
        EXIT:        { sx: 13, sy: 12, speed: 3*FPS, fpf: FPS/30 },
// added "exit to {n}", moving and fake exits
        EXIT4:       { sx: 14, sy: 12, speed: 3*FPS, fpf: FPS/30, lvlp: 4  },
        EXIT8:       { sx: 15, sy: 12, speed: 3*FPS, fpf: FPS/30, lvlp: 8  },
        EXIT6:       { sx: 16, sy: 12, speed: 3*FPS, fpf: FPS/30, lvlp: 6  },
        EXITMOVE:    { sx: 9,  sy: 12, speed: 3*FPS, fpf: FPS/5, hbtim: 3, bsound: 'movexit' },
//        EXITCLOS:    { sx: 23, sy: 11, speed: 3*FPS, fpf: FPS/2, frames: 6 },
        EXITNONE:    { sx: 13, sy: 12, speed: 1*FPS, fpf: FPS/30 }
      },
      FX = {
        GENERATOR_DEATH: { sx: 17, sy: 12, frames: 6, fpf: FPS/10 },
        MONSTER_DEATH:   { sx: 17, sy: 12, frames: 6, fpf: FPS/20 },
        WEAPON_HIT:      { sx: 23, sy: 12, frames: 2, fpf: FPS/20 },
        PLAYER_GLOW:     { frames: FPS/2, border: 5 },
        NUMER:           { sx: 24, sy: 13, frames:7, fpf: FPS/3  }
      },
      PLAYERS   = [ PLAYER.WARRIOR, PLAYER.VALKYRIE, PLAYER.WIZARD, PLAYER.ELF ],
// the order of these lists follows the numeric code of pixels under the main entry, adding hex 10 each time
// --- excepting items which are set by MEXLOW bit and not MEXHIGH main code
      MONSTERS  = [ MONSTER.GHOST, MONSTER.DEMON, MONSTER.GRUNT, MONSTER.WIZARD, MONSTER.DEATH, MONSTER.LOBBER,
											MONSTER.GHOST2, MONSTER.DEMON2, MONSTER.GRUNT2, MONSTER.WIZARD2, MONSTER.LOBBER2,
											MONSTER.GHOST1, MONSTER.DEMON1, MONSTER.GRUNT1, MONSTER.WIZARD1, MONSTER.LOBBER1,
											MONSTER.THIEF, MONSTER.MUGGER, MONSTER.PICKLE, MONSTER.SUPERSOC, MONSTER.IT
						],
      TREASURES = [ TREASURE.HEALTH, TREASURE.HEALRND, TREASURE.FOOD1, TREASURE.FOOD2, TREASURE.FOOD3, TREASURE.KEY, TREASURE.POTION, TREASURE.GOLD,
											TREASURE.LOCKED, TREASURE.BAG, TREASURE.TELEPORT, TREASURE.TRAP, TREASURE.STUN, TREASURE.PUSH,
											TREASURE.XSPEED, TREASURE.LIMINVIS, TREASURE.FAKEENTR, TREASURE.SHOTFAKER, TREASURE.PERMFAKER, TREASURE.FFIELDUNIT, TREASURE.WATER, TREASURE.LAVA, TREASURE.NWASTE,
											TREASURE.FIRESTK, TREASURE.PFLOOR1, TREASURE.WALLGUD, TREASURE.WALLGUD2, TREASURE.WALLPASS, TREASURE.WALLPASS2, TREASURE.WALLRND, TREASURE.WALLRND2, TREASURE.WALLPHS, TREASURE.WALLPHS2,
											TREASURE.SHOTWALL, TREASURE.SHOTWALL2,
// these are selected by MEXLOW case {}, or other code
											TREASURE.XSHOTPWR, TREASURE.XSHOTSPD, TREASURE.XARMOR, TREASURE.XFIGHT, TREASURE.XMAGIC,
											TREASURE.LIMINVUL, TREASURE.LIMREPUL, TREASURE.LIMREFLC, TREASURE.LIMSUPER, TREASURE.LIMTELE, TREASURE.LIMANK,
											TREASURE.POTIONORG, TREASURE.BADBOT, TREASURE.POISON, TREASURE.WATERT, TREASURE.WATERC, TREASURE.WATERR, TREASURE.LAVAT, TREASURE.LAVAC, TREASURE.LAVAR,
											TREASURE.NWASTET, TREASURE.NWASTEC, TREASURE.NWASTER,
											TREASURE.FFIELDUNITD, TREASURE.FFIELDUNITL, TREASURE.FFIELDUNITR
						],
      CBOX = {
        FULL:    { x: 0,      y: 0,      w: TILE,    h: TILE          },
        PLAYER:  { x: TILE/4, y: TILE/4, w: TILE/2,  h: TILE - TILE/4 },
        WEAPON:  { x: TILE/2.285, y: TILE/2.285, w: TILE-30, h: TILE-30       },		// w,h tile-30 mostly gives shot thru diagonal gap
        MONSTER: { x: 1,      y: 1,      w: TILE-2,  h: TILE-2        }, // give monsters 1px wiggle room to get through tight corridors
        EXIT:    { x: 4,      y: 12,     w: TILE-12, h: TILE-6        }			 // exit touch is too easy on exit maze wall level
      },
// test masks for 1 px units of level.png files
      PIXEL = {
        NOTHING:        0x000000, // BLACK
        DOOR:           0xC0C000, // YELLOW
        WALL:           0x404000, // DARK YELLOW
        GENERATOR:      0xF00000, // RED
        MONSTER:        0x400000, // DARK RED
        START:          0x00F000, // GREEN
        TREASURE:       0x008000, // MEDIUM GREEN
        EXIT:           0x004000, // DARK GREEN
        FLOOR:			   0xA08000, // LT BROWN
        MASK: {
          TYPE:         0xF0F000,
          EXHIGH:       0x000FF0,
          EXLOW:        0x00000F,
          ALTGR:			0x0F0000  // alternate gfx nybble - up to 15 diff floors/ walls and ents, on load fail, default back to std
        }
      },
// jvsg floors - 1 tile per map cell - 32 x 32 px per each stored 0th row of backgrounds.png
// --- g1 floors are handled in a seperate gfx file as they tile (currently) 256 x 256 px (4 x 4 map cells) over the map due to diff design per tile
      FLOOR = { 	BROWN_BOARDS: 1, LIGHBROWN_BOARDS: 2, GREEN_BOARDS: 3, GREY_BOARDS: 4, WOOD: 5, LIGHT_STONE: 6, DARK_STONE: 7, BROWN_LAMINATE: 8,
									PURPLE_LAMINATE: 9, PURPLEPHASE: 10, MULTIC: 11, BEES: 12, BOOK: 13, MTILE: 14, YELLOWBR: 15, RND: 16,
									MIN: 1, MAX: 14 }, FLVLRND = null,
// jvsg walls - 32 x 32 px per each wall "unit" - rows 1 - 7 of backgrounds.png
      WALL  = { 	INVIS: 1, BLUE: 2, BLUE_BRICK: 3, PURPLE_TILE: 4, BLUE_COBBLE: 5, PURPLE_COBBLE: 6, CONCRETE: 7,
// g1 wall codes - rows 8 - 36 in backgrounds.png
// --- rows 27 - 36 are overlay patterns with the previous walls all being solid colors
// --- these consist of 2 versions same pattern x 4 - a "light" and a "dark", not precise opposites but optimized
// --- and a 5th pattern of rubble topped walls and destroyable (shootable) walls
								G2DARKSEC: 8, GRAY7: 9, MAUVE20: 10,
								BROWN1: 11, BROWN24: 12, RED5: 13, ORANG9: 14, ORANG31: 15, YELLOW10: 16,
								PINK34: 17, PURPLE77: 18, PURPLE30: 19,
								BLUE8: 20, BLUE25:21, BLUE28: 22,
								GREEN3: 23, GREEN16: 24, GREEN50: 25, G2GREEN99: 26,
									G1BRICKL: 27, G1BRICKD: 28, BRICK2L: 29, BRICK2D: 30, ASYML: 31, ASYMD: 32, XBRIKL: 33, XBRIKD: 34, G5COBRIK: 35, DESTBRIK: 36,
									MIN: 1, MAX: 36 },
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
        WHO:     "gauntlet.who",
        COINS:   "gauntlet.coins"
      },
// chest & wall goody/bady profiles
		rllock = 11, rlswall = 12, swloop = 38,
// rnd load profiles
		rlloop = 33,
		rlline = 9,
	RLPROF = [
[	0x008090,  1,  0,  0,  0,  0,  0,  0,  2,  1,  0,  1,  1	],
[	0x008050,  1,  1,  1,  0,  3,  1,  0,  1,  2,  0,  1,  0	],
[	0x008061,  0,  0,  1,  2,  2,  0,  1,  0,  0,  0,  0,  1	],
[	0x008060,  2,  2,  0,  3,  1,  2,  0,  1,  0,  1,  1,  0	],
[	0x008070, 13, 20, 13, 20, 17, 14,  3, 11,  0,  0,  0,  0	],
[	0x008000,  4,  4,  6,  4,  6,  8,  2,  2,  5,  2,  1,  0	],
[	0x008020,  1,  0,  2,  2,  1,  0,  0,  1,  5,  0,  0,  1	],
[	0x008040,  1,  1,  0,  2,  3,  0,  1,  1,  5,  0,  0,  0	],
[	0x0080F0,  1,  0,  0,  1,  1,  0,  0,  0,  0,  0,  0,  0	],
[	0x0080D0,  1,  1,  2,  0,  3,  0,  1,  0, 16,  5,  0,  1	],
[	0x0080C0,  3,  0,  0,  4,  0,  4,  8, 44,  5, 10,  0,  0	],
[	0x004000,  1,  1,  0,  2,  1,  2,  1,  3,  2,  2,  0,  0	],
[	0x0080A0,  1,  0,  3,  2,  6,  2,  0,  8, 10,  5,  0,  1	],
[	0xF00000,  3,  5,  3,  5,  3,  0,  0,  0,  0,  0,  0,  0	],
[	0xF00010,  2,  0,  0,  3,  3, 10,  0,  0,  0,  0,  0,  0	],
[	0xF00020,  7,  0,  3,  7,  7,  0, 12,  0,  0,  0,  0,  0	],
[	0xF00030,  0,  0,  0,  0,  5,  0,  6,  0,  0,  0,  0,  0	],
[	0xF00050,  0,  0,  0,  2,  4,  0,  0,  0,  0,  0,  0,  0	],
[	0xF00060,  3,  7, 11, 10, 10,  0,  0,  0,  0,  0,  0,  1	],
[	0xF00070,  0,  0,  0,  5,  5, 10,  0,  0,  0,  0,  0,  0	],
[	0xF00080,  3,  0, 11, 12, 12,  0,  8,  0,  0,  0,  0,  0	],
[	0xF00090,  2,  0,  0,  0,  8,  0,  5,  0,  0,  0,  0,  0	],
[	0xF000A0,  0,  0,  0,  1,  5,  0,  4,  0,  0,  0,  0,  0	],
[	0xF000B0,  3, 15,  5,  2,  2,  0,  0,  0,  0,  0,  0,  0	],
[	0xF000C0,  2,  0,  0, 10, 10, 10,  0,  0,  0,  0,  0,  0	],
[	0xF000D0,  4,  0,  8,  5,  5,  0,  5,  9,  0,  0,  0,  0	],
[	0xF000E0,  0,  0,  0,  0,  8,  0,  8,  0,  0,  0,  0,  0	],
[	0xF000F0,  0,  0,  0,  3,  2,  0,  0,  0,  0,  0,  0,  0	],
[	0x400040,  2,  0,  1,  2,  0,  0,  0,  1, 24,  0,  0,  1	],
[	0x400000,  0,  6,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1	],
[	0x400010,  0,  0,  0,  0, 12,  7,  0,  0,  0,  0,  0,  0	],
[	0x400020, 10,  0, 22,  0,  0,  0,  8,  0,  0,  0,  0,  0	],
[	0x400030,  0,  0,  0, 20,  0,  0, 12,  0,  0,  0,  0,  0	],
[	0x400050,  0,  0,  6,  0,  0,  0,  0, 15,  0,  0,  0,  0	],
// line 10, 11 extras
[	0x400120,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1	],
[	0x0080F4,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1	],
[	0x0080E3,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1	],
[	0x008150,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1	],
[	0x008118,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1	]
      ],

		RLOAD = [0],
// difficulty level for rnd load profile
		diff_level = 1, def_diff = 7,

	DEBUG = {
        RESET:      Game.qsBool("reset"),
        GRID:       Game.qsBool("grid"),
        NOMONSTERS: Game.qsBool("nomonsters"),
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
// monster across an unpinned wall/ edge
  var RV_PREFERRED_DIRECTIONS = {};
  RV_PREFERRED_DIRECTIONS[DIR.DOWNRIGHT]  = [ DIR.UPLEFT,    DIR.LEFT,     DIR.UP,        DIR.UPRIGHT,  DIR.DOWNLEFT  ];
  RV_PREFERRED_DIRECTIONS[DIR.DOWNLEFT]   = [ DIR.UPRIGHT,   DIR.RIGHT,    DIR.UP,        DIR.UPLEFT,   DIR.DOWNRIGHT ];
  RV_PREFERRED_DIRECTIONS[DIR.UPRIGHT]    = [ DIR.DOWNLEFT,  DIR.LEFT,     DIR.DOWN,      DIR.UPLEFT,   DIR.DOWNRIGHT ];
  RV_PREFERRED_DIRECTIONS[DIR.UPLEFT]     = [ DIR.DOWNRIGHT, DIR.RIGHT,    DIR.DOWN,      DIR.DOWNLEFT, DIR.UPRIGHT   ];
  RV_PREFERRED_DIRECTIONS[DIR.DOWN]       = [ DIR.UP,        DIR.UPLEFT,   DIR.UPRIGHT,   DIR.LEFT,     DIR.RIGHT     ];
  RV_PREFERRED_DIRECTIONS[DIR.UP]         = [ DIR.DOWN,      DIR.DOWNLEFT, DIR.DOWNRIGHT, DIR.LEFT,     DIR.RIGHT     ];
  RV_PREFERRED_DIRECTIONS[DIR.RIGHT]      = [ DIR.LEFT,      DIR.UPLEFT,   DIR.DOWNLEFT,  DIR.UP,       DIR.DOWN      ];
  RV_PREFERRED_DIRECTIONS[DIR.LEFT]       = [ DIR.RIGHT,     DIR.UPRIGHT,  DIR.DOWNRIGHT, DIR.UP,       DIR.DOWN      ];

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
        { name: 'tween',  from: 'playing',               to: 'tween'    }, // between level screen
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
      { id: 'entities',    url: "images/entities.png"    },  // http://opengameart.org/forumtopic/request-for-tileset-spritesheet-similar-to-gauntlet-ii
      { id: 'shotwalls',   url: "images/shotwalls.png"   }
    ],

    sounds: [
      { id: 'gtitle',      name: 'sounds/music.title',      formats: ['ogg'], volume: 1.0, loop: false             },
      { id: 'g4sec',      name: 'sounds/music.4sec',      formats: ['ogg'], volume: 1.0, loop: false             },
// org fx
      { id: 'highscore',       name: 'sounds/highscore',             formats: ['ogg'], volume: 0.5,                        },
//      { id: 'generatordeath',  name: 'sounds/generatordeath',        formats: ['ogg'], volume: 0.3, pool:  },

// correspond to lvl 1 - 7 messages
      { id: 'ancbeware',       name: 'sounds/g1an_beware',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },	// announcer messages
      { id: 'ancsorc',       name: 'sounds/g1an_sorc',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancdeath',       name: 'sounds/g1an_usemag',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
// other single display msgs
      { id: 'anctrs',       	name: 'sounds/g1an_treas',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anckeys',       name: 'sounds/g1an_svkey',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancpots',       name: 'sounds/g1an_svpot',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anctraps',       name: 'sounds/g1an_traps',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancwaldes',      name: 'sounds/g1an_waldes',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
// poss multi-use annc
      { id: 'infosnd',        name: 'sounds/g1_info',              formats: ['ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancfoodsh',       name: 'sounds/g1an_dsf',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancpotsh',       name: 'sounds/g1an_dstp',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancfindex',       name: 'sounds/g1an_fex',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancfooled',       name: 'sounds/g1an_fooled',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anchidpot',       name: 'sounds/g1an_hidden',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6  },
      { id: 'anckilthf',      name: 'sounds/g1an_kilthf',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancthislvl',      name: 'sounds/g1an_thislvl',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anctryfind',      name: 'sounds/g1an_tryfind',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
// taunts
      { id: 'ancletsee',      name: 'sounds/g1an_letsee',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancgcoop',      name: 'sounds/g1an_gcoop',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancghero',      name: 'sounds/g1an_heroic',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancivnot',      name: 'sounds/g1an_ivenot',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancssfood',      name: 'sounds/g1an_ssfood',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancfrnds',      name: 'sounds/g1an_frnds',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancdsyf',      name: 'sounds/g1an_dsyf',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancyssop',      name: 'sounds/g1an_yssop',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancyshop',      name: 'sounds/g1an_yshop',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancploff',      name: 'sounds/g1an_ploff',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancyjsp',      name: 'sounds/g1an_yjsp',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anceyf',      name: 'sounds/g1an_eyf',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancstf',      name: 'sounds/g1an_stf',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },		// 		- delay so char precedes
      { id: 'ancstp',      name: 'sounds/g1an_stp',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },		// 		- delay so char precedes
      { id: 'anchasetn',      name: 'sounds/g1an_hasetn',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },		// 		- delay so char precedes

// treasure room annc
      { id: 'ancftreas',      name: 'sounds/g1an_ftreas',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancwtreas',      name: 'sounds/g1an_wtreas',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anc0',      name: 'sounds/g1an_0',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anc1',      name: 'sounds/g1an_1',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anc2',      name: 'sounds/g1an_2',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anc3',      name: 'sounds/g1an_3',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anc4',      name: 'sounds/g1an_4',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anc5',      name: 'sounds/g1an_5',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anc6',      name: 'sounds/g1an_6',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anc7',      name: 'sounds/g1an_7',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anc8',      name: 'sounds/g1an_8',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anc9',      name: 'sounds/g1an_9',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anc10',      name: 'sounds/g1an_10',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'must21',      name: 'sounds/g1_must21',             formats: ['ogg'], volume: 0.7 },		// faster troom music - 21 secs
      { id: 'must25',      name: 'sounds/g1_must25',             formats: ['ogg'], volume: 0.7 },		// 25 secs
      { id: 'must30',      name: 'sounds/g1_must30',             formats: ['ogg'], volume: 0.7 },		// 30 secs
      { id: 'must60',      name: 'sounds/g1_must60',             formats: ['ogg'], volume: 0.7 },		// 60 secs
// troom taunts
      { id: 'ancbetr',      name: 'sounds/g1an_better',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancymi',      name: 'sounds/g1an_cymi',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anchurry',      name: 'sounds/g1an_hurry',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anckid',      name: 'sounds/g1an_kidding',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anctimes',      name: 'sounds/g1an_times',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anctoms',      name: 'sounds/g1an_toms',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anculoose',      name: 'sounds/g1an_uloose',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },

// multi part annc - these are combined into a single msg...which might need to be recorded seperately
// char into hello - has 1.5 sec celay
      { id: 'hlowar1',      name: 'sounds/g1an_hlowar1',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'hloelf1',      name: 'sounds/g1an_hloelf1',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'hlowiz1',      name: 'sounds/g1an_hlowiz1',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'hloval1',      name: 'sounds/g1an_hloval1',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
// char positive id
      { id: 'ancwar1',      name: 'sounds/g1an_war0',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancelf1',      name: 'sounds/g1an_elf1',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancwiz1',      name: 'sounds/g1an_wiz1',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancval1',      name: 'sounds/g1an_valk1',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
// char abt to die - xclude warrior, he only has 1
      { id: 'ancwiz2',      name: 'sounds/g1an_wiz2',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancval2',      name: 'sounds/g1an_val2',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancelf2',      name: 'sounds/g1an_elf2',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
// 3rd wiz, not sure
      { id: 'ancwiz3',      	name: 'sounds/g1an_wiz3',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
// powers		- delay so "{char} now has" precedes
      { id: 'ancxspd',    	  name: 'sounds/g1an_xspd',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancxshtpwr',      name: 'sounds/g1an_shtpwr',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancxshtspd',      name: 'sounds/g1an_shtspd',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancxarm',      name: 'sounds/g1an_xarm',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancxft',    		  name: 'sounds/g1an_xft',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancxmag',      name: 'sounds/g1an_xmag',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancinvis',      name: 'sounds/g1an_invis',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
// bld dialog
      { id: 'ancnhs',      name: 'sounds/g1an_nowhas',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },		// 		- delay so char precedes - "elf now has"
      { id: 'ancwelc',      name: 'sounds/g1an_welcome',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
// nearing death		- delay so char precedes
      { id: 'ancpwrl',      name: 'sounds/g1an_pwrlost',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancruno',      name: 'sounds/g1an_runout',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'ancndsfd',      name: 'sounds/g1an_needsfood',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'anc2die',      name: 'sounds/g1an_abt2die',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },

// blip intro
      { id: 'blipwarrior',     name: 'sounds/g1intr_war',           formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 }, //   NOTE: ie has limit of 40 <audio> so be careful with pool amounts
      { id: 'blipvalkyrie',    name: 'sounds/g1intr_val',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'blipwizard',      name: 'sounds/g1intr_wiz',            formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'blipelf',         		name: 'sounds/g1intr_elf',               formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
// shots
      { id: 'firewarrior',     name: 'sounds/g1fire_war',           formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 }, //   NOTE: ie has limit of 40 <audio> so be careful with pool amounts
      { id: 'firevalkyrie',    name: 'sounds/g1fire_val',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'firewizard',      name: 'sounds/g1fire_wiz',            formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'fireelf',         		name: 'sounds/g1fire_elf',               formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'potionbang',  	name: 'sounds/g1_potionboom',        formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'firelob',         		name: 'sounds/g2_lobshot',               formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'hitghost',         		name: 'sounds/g1hit_ghost',               formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'hithump',         		name: 'sounds/g1hit_grunt',               formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
// theif
      { id: 'hitheif',         		name: 'sounds/g2thf_appr',               formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'thflau1',         		name: 'sounds/g1thf_lau1',               formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'thflau2',         		name: 'sounds/g1thf_lau2',               formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'thfycc1',         		name: 'sounds/g1thf_yccm',               formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'thfycc2',         		name: 'sounds/g1thf_ycc2',               formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'thfheh1',         		name: 'sounds/g1thf_hehe1',               formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'thfheh2',         		name: 'sounds/g1thf_hehe2',               formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'thfheh3',         		name: 'sounds/g1thf_hehe3',               formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
// aches / pains
      { id: 'warriorpain1',    name: 'sounds/g1pain_war1',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'warriorpain2',    name: 'sounds/g1pain_war2',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'warriorpain3',    name: 'sounds/g1pain_war3',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'warriorpain4',    name: 'sounds/g1pain_war4',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'warriorpain5',    name: 'sounds/g1pain_war5',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'warriorpain6',    name: 'sounds/g1pain_war6',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'warriorpain7',    name: 'sounds/g1pain_war7',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'warriorpain8',    name: 'sounds/g1pain_war8',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'warriorpain9',    name: 'sounds/g1pain_war9',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'wizardpain1',    name: 'sounds/g1pain_wiz1',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'wizardpain2',    name: 'sounds/g1pain_wiz2',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'wizardpain3',    name: 'sounds/g1pain_wiz3',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'wizardpain4',    name: 'sounds/g1pain_wiz4',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'wizardpain5',    name: 'sounds/g1pain_wiz5',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'wizardpain6',    name: 'sounds/g1pain_wiz6',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'wizardpain7',    name: 'sounds/g1pain_wiz7',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'wizardpain8',    name: 'sounds/g1pain_wiz8',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'wizardpain9',    name: 'sounds/g1pain_wiz9',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'elfpain1',    name: 'sounds/g1pain_elf1',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'elfpain2',    name: 'sounds/g1pain_elf2',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'elfpain3',    name: 'sounds/g1pain_elf3',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'elfpain4',    name: 'sounds/g1pain_elf4',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'elfpain5',    name: 'sounds/g1pain_elf5',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'elfpain6',    name: 'sounds/g1pain_elf6',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'elfpain7',    name: 'sounds/g1pain_elf7',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'elfpain8',    name: 'sounds/g1pain_elf8',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'elfpain9',    name: 'sounds/g1pain_elf9',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'valkyriepain1',    name: 'sounds/g1pain_val1',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'valkyriepain2',    name: 'sounds/g1pain_val2',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'valkyriepain3',    name: 'sounds/g1pain_val3',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'valkyriepain4',    name: 'sounds/g1pain_val4',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'valkyriepain5',    name: 'sounds/g1pain_val5',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'valkyriepain6',    name: 'sounds/g1pain_val6',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'valkyriepain7',    name: 'sounds/g1pain_val7',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'valkyriepain8',    name: 'sounds/g1pain_val8',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'valkyriepain9',    name: 'sounds/g1pain_val9',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
// hurts - nominally more serious pain			- as yet unused
/*
      { id: 'wizardhurt',    name: 'sounds/g1hurt_wiz',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'elfhurt',    name: 'sounds/g1hurt_elf',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'valkyriehurt',    name: 'sounds/g1hurt_val',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'valkyriehurt2',    name: 'sounds/g1hurt_val2',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'warriorhurt',    name: 'sounds/g1hurt_war',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
*/
// died
      { id: 'wizarddie1',    name: 'sounds/g1die_wiz1',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'wizarddie2',    name: 'sounds/g1die_wiz2',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'elfdie1',    name: 'sounds/g1die_elf1',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'elfdie2',    name: 'sounds/g1die_elf2',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'valkyriedie1',    name: 'sounds/g1die_val1',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'valkyriedie2',    name: 'sounds/g1die_val2',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'warriordie1',    name: 'sounds/g1die_war1',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'warriordie2',    name: 'sounds/g1die_war2',          formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },

// std sound fx group
      { id: 'exitlevel',       name: 'sounds/g1_exit',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'collectgold',     name: 'sounds/g1_treaspick',           formats: ['ogg'], volume: 0.5, pool: ua.is.ie ? 2 : 6 },
      { id: 'collectpotion',   name: 'sounds/g1_potionpick',         formats: ['ogg'], volume: 0.5, pool: ua.is.ie ? 2 : 6 },
      { id: 'collectkey',      name: 'sounds/g1_key',            formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'collectfood',     name: 'sounds/g1_foodsnrf',           formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'opendoor',        name: 'sounds/g1_door',              formats: ['ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 6 },
      { id: 'teleport',        	name: 'sounds/g1_teleport',              formats: ['ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 6 },
      { id: 'ffield',        	name: 'sounds/g2_ffield',              formats: ['ogg'], volume: 0.6, pool: ua.is.ie ? 2 : 6 },
      { id: 'trap',        			name: 'sounds/g1_trap',              formats: ['ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 6 },
      { id: 'stun',      		  name: 'sounds/g1_stun',              formats: ['ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 6 },
      { id: 'wallexit',        name: 'sounds/g2_wallexit',              formats: ['ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 6 },
      { id: 'dtouch',        name: 'sounds/g1_deathtouch',              formats: ['ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 6 },
      { id: 'healthcnt',      name: 'sounds/g1_healthcount',              formats: ['ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 6 },
      { id: 'sbuzz',      		  name: 'sounds/g1_buzz',              formats: ['ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 6 },
      { id: 'coindrp',      		  name: 'sounds/g1_coindrop',              formats: ['ogg'], volume: 0.8, pool: ua.is.ie ? 2 : 6 },
// gII sounds
      { id: 'himug',      name: 'sounds/g2mug_appr',            formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'g2hitheif',      name: 'sounds/g2thf_appr',            formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'unlkches',      name: 'sounds/g2_unlkchest',            formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'movexit',      name: 'sounds/g2_movexit',            formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'shotwall',      name: 'sounds/g2_shotwall',            formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'g2_wallexit',      name: 'sounds/g2_wallexit',            formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'wallphase',      name: 'sounds/g2_wallphase',            formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'slopoisn',      name: 'sounds/g2_slopoisn',            formats: ['ogg'], volume: 0.7, pool: ua.is.ie ? 2 : 6 },
      { id: 'bouncshot',      name: 'sounds/g2_bouncshot',            formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'hitpickle',         		name: 'sounds/g2_pickle',               formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'dragror',         		name: 'sounds/g2_drag',               formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
// g2 annc
      { id: 'g2antrlok',      name: 'sounds/g2an_trlok',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'g2aninvw',      name: 'sounds/g2an_invwal',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'g2anmovx',      name: 'sounds/g2an_movex',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'g2anrefls',      name: 'sounds/g2an_reflsh',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'g2antt',      name: 'sounds/g2an_ttrn',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'g2anrep',      name: 'sounds/g2an_rep',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'g2anist',      name: 'sounds/g2an_isit',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },
      { id: 'g2annwit',      name: 'sounds/g2an_nwit',             formats: ['ogg'], volume: 1.0, pool: ua.is.ie ? 2 : 6 },

      { id: 'g4sec2',      name: 'sounds/music.g2.4sec',      formats: ['ogg'], volume: 1.0, loop: false             },

// let levels not have music
      { id: 'nullm',      		  name: 'sounds/null',              formats: ['ogg'], volume: 0.8 }
    ],

// added gauntlet 1 levels as g1level{n}
// gflr is gfx file for floor tiles
    levels: [
//      { name: 'intro',     url: "levels/7level.png",  floor: FLOOR.MULTIC,      wall: WALL.GREEN3,    gflr: "gfx/floor016.jpg",         music: 'nullm',   nornd: 1,	 	score:  1000, help: "welcome to ERR0R" },
      { name: 'Research 6',     url: "levels/glevel1r.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,    gflr: "gfx/xfloor4.png",      music: 'nullm',   nornd: 1,	unpinx: 1, unpiny: 1,	score:  1000, help: "welcome to ERR0R" },
//      { name: 'Demo',     url: "levels/glevel0.png", floor: FLOOR.LIGHT_STONE,      wall: WALL.BROWN1,   gflr: "gfx/g1floor0.jpg",    music: 'nullm',   nornd: 1,      score:  1000, help: null },
      { name: 'Level 1',       url: "levels/g2level1.png",  floor: FLOOR.LIGHT_STONE,      wall: WALL.BROWN1,   gflr: "gfx/g1floor1.jpg",      music: 'nullm',   nornd: 1,      score:  1000, help: null },
      { name: 'Level 2',       url: "levels/g2level2.png",  floor: FLOOR.BROWN_LAMINATE,      wall: WALL.BROWN1,   gflr: "gfx/g1floor2.jpg",      music: 'nullm',   nornd: 1,      score:  1000, help: "Ghosts must be shot" },
      { name: 'Level 3',       url: "levels/glevel3.png",  floor: FLOOR.DARK_STONE,      wall: WALL.GREEN3,    gflr: "gfx/g1floor3.jpg",      music: 'nullm',   nornd: 1,      score:  1000, help: "Some food can be destroyed" },
      { name: 'Level 4',       url: "levels/glevel4.png",  floor: FLOOR.WOOD,      wall: WALL.GRAY7,    gflr: "gfx/g1floor4.jpg",      music: 'nullm',   nornd: 1,      score:  1000, help: "Fight hand to hand by running into grunts" },
      { name: 'Level 5',       url: "levels/glevel5.png",  floor: FLOOR.PURPLE_LAMINATE,      wall: WALL.RED5,    gflr: "gfx/g1floor5.jpg",      music: 'nullm',   nornd: 1,      score:  1000, help: "Beware the demons which shoot you" },
      { name: 'Level 6',       url: "levels/glevel6.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.GREEN3,   brikovr:  WALL.G1BRICKD,   gflr: "gfx/g1floor6.jpg",   music: 'nullm',   nornd: 1,      score:  1000, help: "Sorcerers may be invisible" },
      { name: 'Level 7',       url: "levels/glevel7.png",  floor: FLOOR.GREY_BOARDS,      wall: WALL.GRAY7,    gflr: "gfx/g1floor7.jpg",      music: 'nullm',   nornd: 1,      score:  1000, help: "Use magic to kill death" },
		{ name: 'Research X',     url: "levels/glevel114.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,   brikovr:  WALL.XBRIKD,    gflr: "gfx/g1floor6.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel113.png",  floor: FLOOR.RND,      wall: WALL.PINK34,    gflr: "gfx/g1floor113.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel112.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,    gflr: "gfx/g1floor112.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel111.png",  floor: FLOOR.RND,      wall: WALL.PINK34,    gflr: "gfx/g1floor111.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel110.png",  floor: FLOOR.RND,      wall: WALL.PURPLE30,    gflr: "gfx/g1floor6.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel109.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,    gflr: "gfx/g1floor109.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel108.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,    gflr: "gfx/g1floor71.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel107.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,    gflr: "gfx/g1floor107.jpg",      music: 'nullm',	unpinx: 1,      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel106.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,    gflr: "gfx/g1floor1.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel105.png",  floor: FLOOR.RND,      wall: WALL.GRAY7,    gflr: "gfx/g1floor44.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel104.png",  floor: FLOOR.RND,      wall: WALL.BLUE28,    gflr: "gfx/g1floor104.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel103.png",  floor: FLOOR.RND,      wall: WALL.BROWN24,    gflr: "gfx/g1floor103.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel102.png",  floor: FLOOR.RND,      wall: WALL.BLUE25,    gflr: "gfx/g1floor102.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel101.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,    gflr: "gfx/g1floor28.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel100.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,    gflr: "gfx/g1floor67.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel99.png",  floor: FLOOR.RND,      wall: WALL.GRAY7,    gflr: "gfx/g1floor50.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel98.png",  floor: FLOOR.RND,      wall: WALL.PINK34,      gflr: "gfx/g1floor93.jpg",      music: 'nullm',	unpinx: 1,      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel97.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor86.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel96.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor96.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel95.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor1.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel94.png",  floor: FLOOR.RND,      wall: WALL.BROWN24,      gflr: "gfx/g1floor76.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel93.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor93.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel92.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor41.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel91.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor78.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel90.png",  floor: FLOOR.RND,      wall: WALL.YELLOW10,      gflr: "gfx/g1floor90.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel89.png",  floor: FLOOR.RND,      wall: WALL.PINK34,      gflr: "gfx/g1floor6.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel88.png",  floor: FLOOR.RND,      wall: WALL.GRAY7,      gflr: "gfx/g1floor54.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel87.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor23.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel86.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,      gflr: "gfx/g1floor86.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel85.png",  floor: FLOOR.RND,      wall: WALL.MAUVE20,      gflr: "gfx/g1floor73.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel84.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor84.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel83.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor52.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel82.png",  floor: FLOOR.RND,      wall: WALL.BLUE8,      gflr: "gfx/g1floor43.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel81.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor81.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel80.png",  floor: FLOOR.RND,      wall: WALL.GRAY7,      gflr: "gfx/g1floor80.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel79.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor28.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel78.png",  floor: FLOOR.RND,      wall: WALL.PURPLE30,      gflr: "gfx/g1floor78.jpg",      music: 'nullm',	unpinx: 1,      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel77.png",  floor: FLOOR.RND,      wall: WALL.PURPLE77,      gflr: "gfx/g1floor77.jpg",      music: 'nullm',	unpinx: 1,      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel76.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor76.jpg",      music: 'nullm',	unpinx: 1,      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel75.png",  floor: FLOOR.RND,      wall: WALL.YELLOW10,      gflr: "gfx/g1floor28.jpg",      music: 'nullm',	unpinx: 1,      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel74.png",  floor: FLOOR.RND,      wall: WALL.PURPLE30,      gflr: "gfx/g1floor74.jpg",      music: 'nullm',	unpinx: 1,      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel73.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor73.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel72.png",  floor: FLOOR.RND,      wall: WALL.BROWN24,      gflr: "gfx/g1floor72.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel71.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor71.jpg",      music: 'nullm',	unpinx: 1,      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel70.png",  floor: FLOOR.RND,      wall: WALL.BLUE25,      gflr: "gfx/g1floor70.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel69.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor65.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel68.png",  floor: FLOOR.RND,      wall: WALL.PINK34,      gflr: "gfx/g1floor4.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel67.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor67.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel66.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,      gflr: "gfx/g1floor65.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel65.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor65.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel64.png",  floor: FLOOR.RND,      wall: WALL.RED5,      gflr: "gfx/g1floor13.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel63.png",  floor: FLOOR.RND,      wall: WALL.BLUE8,      gflr: "gfx/g1floor63.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel62.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,      gflr: "gfx/g1floor62.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel61.png",  floor: FLOOR.RND,      wall: WALL.BROWN24,      gflr: "gfx/g1floor61.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel60.png",  floor: FLOOR.RND,      wall: WALL.BLUE25,      gflr: "gfx/g1floor60.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel59.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor59.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel58.png",  floor: FLOOR.RND,      wall: WALL.MAUVE20,      gflr: "gfx/g1floor26.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel57.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,      gflr: "gfx/g1floor50.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel56.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor8.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel55.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor55.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel54.png",  floor: FLOOR.RND,      wall: WALL.BLUE28,      gflr: "gfx/g1floor54.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel53.png",  floor: FLOOR.RND,      wall: WALL.YELLOW10,      gflr: "gfx/g1floor28.jpg",      music: 'nullm',	unpinx: 1,      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel52.png",  floor: FLOOR.RND,      wall: WALL.BLUE25,      gflr: "gfx/g1floor52.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel51.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor28.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel50.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,      gflr: "gfx/g1floor50.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel49.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor49.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel48.png",  floor: FLOOR.RND,      wall: WALL.MAUVE20,      gflr: "gfx/g1floor81.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel47.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor47.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel46.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor34.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel45.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor45.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel44.png",  floor: FLOOR.RND,      wall: WALL.GRAY7,      gflr: "gfx/g1floor44.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel43.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor43.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel42.png",  floor: FLOOR.RND,      wall: WALL.PINK34,      gflr: "gfx/g1floor42.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel41.png",  floor: FLOOR.RND,      wall: WALL.BLUE25,      gflr: "gfx/g1floor41.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel40.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor23.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel39.png",  floor: FLOOR.RND,      wall: WALL.GREEN3,      gflr: "gfx/g1floor39.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel38.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor38.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel37.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor13.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel36.png",  floor: FLOOR.RND,      wall: WALL.PINK34,      gflr: "gfx/g1floor36.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel35.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor35.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel34.png",  floor: FLOOR.RND,      wall: WALL.PINK34,      gflr: "gfx/g1floor34.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel33.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor33.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel32.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor32.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel31.png",  floor: FLOOR.RND,      wall: WALL.ORANG31,      gflr: "gfx/g1floor31.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel30.png",  floor: FLOOR.RND,      wall: WALL.PURPLE30,      gflr: "gfx/g1floor30.jpg",      music: 'nullm',	unpinx: 1,      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel29.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor29.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel28.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor28.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel27.png",  floor: FLOOR.RND,      wall: WALL.YELLOW10,      gflr: "gfx/g1floor27.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel26.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor26.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel25.png",  floor: FLOOR.RND,      wall: WALL.BLUE25,      gflr: "gfx/g1floor24.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel24.png",  floor: FLOOR.RND,      wall: WALL.BROWN24,      gflr: "gfx/g1floor24.jpg",      music: 'nullm',	unpinx: 1,      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel23.png",  floor: FLOOR.RND,      wall: WALL.BLUE28,      gflr: "gfx/g1floor23.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel22.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor3.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel21.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor1.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel20.png",  floor: FLOOR.RND,      wall: WALL.MAUVE20,      gflr: "gfx/g1floor7.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel19.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,      gflr: "gfx/g1floor19.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel18.png",  floor: FLOOR.RND,      wall: WALL.PURPLE77,      gflr: "gfx/g1floor8.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel17.png",  floor: FLOOR.RND,      wall: WALL.BROWN1,      gflr: "gfx/g1floor17.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel16.png",  floor: FLOOR.RND,      wall: WALL.GREEN16,      gflr: "gfx/g1floor1.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel15.png",  floor: FLOOR.RND,      wall: WALL.PURPLE30,      gflr: "gfx/g1floor6.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel14.png",  floor: FLOOR.RND,      wall: WALL.RED5,      gflr: "gfx/g1floor14.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel13.png",  floor: FLOOR.RND,      wall: WALL.PINK34,      gflr: "gfx/g1floor13.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel12.png",  floor: FLOOR.RND,      wall: WALL.RED5,      gflr: "gfx/g1floor9.jpg",      music: 'nullm',	unpinx: 1,      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel11.png",  floor: FLOOR.RND,      wall: WALL.GREEN50,      gflr: "gfx/g1floor7.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel10.png",  floor: FLOOR.RND,      wall: WALL.YELLOW10,      gflr: "gfx/g1floor10.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel9.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,      gflr: "gfx/g1floor9.jpg",      music: 'nullm',      score:  1000, help: null },
		{ name: 'Research X',     url: "levels/glevel8.png",  floor: FLOOR.RND,      wall: WALL.BLUE8,      gflr: "gfx/g1floor8.jpg",      music: 'nullm',	unpinx: 1,      score:  1000, help: null },
      { name: 'Z gon',     url: "levels/glevelZ.png",  floor: FLOOR.RND,      wall: WALL.ORANG9,    brikovr:  WALL.DESTBRIK,		gflr: "gfx/g1floor0z.jpg",      music: 'nullm',  score:  1000, help: null },
		{ name: 'Treasure',     url: "levels/glevel115.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,  rtime: 30,	unpinx: 1,    music: 'must30',      score:  1000, help: null },
		{ name: 'Treasure',     url: "levels/glevel116.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,  rtime: 20,      music: 'must21',      score:  1000, help: null },
		{ name: 'Treasure',     url: "levels/glevel117.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,  rtime: 22,      music: 'must25',      score:  1000, help: null },
		{ name: 'Treasure',     url: "levels/glevel118.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,  rtime: 32,      music: 'must60',      score:  1000, help: null },
		{ name: 'Treasure',     url: "levels/glevel119.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,  rtime: 20,      music: 'must21',      score:  1000, help: null },
		{ name: 'Treasure',     url: "levels/glevel120.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,  rtime: 25,      music: 'must25',      score:  1000, help: null },
		{ name: 'Treasure',     url: "levels/glevel121.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,  rtime: 20,      music: 'must21',      score:  1000, help: null },
		{ name: 'Treasure',     url: "levels/glevel122.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,  rtime: 30,	unpinx: 1,      music: 'must30',      score:  1000, help: null },
		{ name: 'Treasure',     url: "levels/glevel123.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,  rtime: 20,	unpinx: 1,      music: 'must21',      score:  1000, help: null },
      { name: 'Treasure',     url: "levels/glevel124.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,  rtime: 25,      music: 'must25',      score:  1000, help: null },
      { name: 'Treasure',     url: "levels/glevel125.png",  floor: FLOOR.LIGHBROWN_BOARDS,      wall: WALL.ORANG9,      gflr: "gfx/g1floor1.jpg",   brikovr:  WALL.G1BRICKD,  rtime: 30,      music: 'must30',      score:  1000, help: null }
    ],

    keys: [
      { key: Game.Key.W,      mode: 'up',   state: 'menu',    action: function()    { this.start(PLAYER.WARRIOR);      } },
      { key: Game.Key.V,      mode: 'up',   state: 'menu',    action: function()    { this.start(PLAYER.VALKYRIE);     } },
      { key: Game.Key.Z,      mode: 'up',   state: 'menu',    action: function()    { this.start(PLAYER.WIZARD);       } },
      { key: Game.Key.E,      mode: 'up',   state: 'menu',    action: function()    { this.start(PLAYER.ELF);          } },
      { key: Game.Key.F2,     mode: 'up',   state: 'menu',    action: function()    { screenshot();                    } },
      { key: Game.Key.X,      mode: 'up',   state: 'playing', action: function()    { spawn();                         } },
      { key: Game.Key.F2,     mode: 'up',   state: 'playing', action: function()    { screenshot();                    } },
      { key: Game.Key.ONE,    mode: 'up',   state: 'playing', action: function()    { this.player.coindrop();          } },
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
      { key: Game.Key.F2,     mode: 'up',   state: 'tween',   action: function()    { screenshot();                    } },
      { key: Game.Key.ESC,    mode: 'up',   state: 'tween',   action: function()    { this.resume();                   } },
      { key: Game.Key.RETURN, mode: 'up',   state: 'tween',   action: function()    { this.resume();                   } },
      { key: Game.Key.SPACE,  mode: 'up',   state: 'tween',   action: function()    { this.resume();                   } }
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

  function shuffle(array) { array.sort(() => Math.random() - 0.5); }

  function helpdis(nh, htex, hto, hrep, hannc)		// display text in the tutorial overlay box		passed vars - nh = help # array ref,		htex = override help text,		hto = timeout in millisecs, def to 2000,		hrep - replace str,	hannc - announcer code to play after delay
  {
			if (hto == undefined || (hto < 1) || (hto > 120000)) hto = 2000;
			if (htex == null || htex == "") htex = undefined;
			if (htex == undefined)
			if (nh != undefined)
			if (HELPCLEAR[nh]) 		// help messages cleared after 1 appearance or blocked by option
			{
					HELPCLEAR[nh] = helpcleared;
					htex = HELPDIS[nh];
					if (!document.getElementById("seltut").checked && nh <= G1HLP) return;							// g1 tut not enabled
					if (!document.getElementById("selg2tut").checked && (nh > G1HLP && nh <= G2HLP)) return;	// g2 tut not enabled
					if (!document.getElementById("seltutx").checked && nh > G2HLP) return;							// ext tut not enabled
			}

			if (htex != undefined)
			{
					Musicth.play(Musicth.sounds.infosnd);
					if (hrep != undefined) htex = htex.replace("#", hrep);
					$('help').update(htex).show(); setTimeout(game.onleavehelp.bind(this), hto); announcepause = true;
					if (nh != undefined)
					if (HELPANNC[nh] != undefined) Musicth.play(HELPANNC[nh]);
			}
	}

  //=========================================================================
  // MAPPING
  //=========================================================================

	function isp(pixel, type)      { return ((pixel & PIXEL.MASK.TYPE) === type); };
	function type(pixel)           { return  (pixel & PIXEL.MASK.EXHIGH) >> 4;    };
	function isnothing(pixel)      { return isp(pixel, PIXEL.NOTHING);   };
	function iswall(pixel)         { if (isp(pixel, PIXEL.WALL)) return true; if (pixel >= PXWALGUD && pixel <= PXWALPASS) return true; if (pixel >= 0x8210 && pixel <= 0x822F) return true; return (pixel & MEXHIGH) == PXWALSHT ? true : false; };
	function iswallpr(pixel)       { if (pixel >= PXWALRND && pixel <= PXWALPHAS) return true; };
	function iswallrw(pixel)       { return (isp(pixel, PIXEL.WALL))     };
	function isfloor(pixel)        { return isp(pixel, PIXEL.FLOOR);     };
	function isstart(pixel)        { return isp(pixel, PIXEL.START);     };
	function isdoor(pixel)         { return isp(pixel, PIXEL.DOOR);      };
	function isexit(pixel)         { return isp(pixel, PIXEL.EXIT);      };
	function isgenerator(pixel)    { return isp(pixel, PIXEL.GENERATOR); };
	function ismonster(pixel)      { return isp(pixel, PIXEL.MONSTER);   };
	function istreasure(pixel)     { return isp(pixel, PIXEL.TREASURE);  };

// repl the other ref - map.pixel(x,y)
// for unpins we need source x,y to check across unpin boundaries

	function mpixel(sx,sy, tx,ty , sf) {

			if (sf == 2) { sx = p2t(sx); sy = p2t(sy); tx = p2t(tx); ty = p2t(ty); }
			if (Munpinx) {
				if (sx == 0 && tx < 0) tx = Mtw - 1;
				if (sx >= (Mtw - 1) && tx >= Mtw) tx = 0;
			}
			if (Munpiny) {
				if (sy == 0 && ty < 0) ty = Mth - 1;
				if (sy >= (Mth - 1) && ty >= Mth) ty = 0;
			}
				var n = tx + (ty * Mtw); d1 = tx; d2 = ty;
				if (sf > 0) return (n);		// second fn, calculate n

				return(Mapdata[n]);
			};

     function walltype(tx,ty,map,findwall)   {
		  if (findwall == undefined) findwall = iswall;
			var wally = (findwall(mpixel(tx,ty, tx,   ty-1)) ? 1 : 0) | (findwall(mpixel(tx,ty, tx+1, ty))   ? 2 : 0) | (findwall(mpixel(tx,ty, tx,   ty+1)) ? 4 : 0) | (findwall(mpixel(tx,ty, tx-1, ty))   ? 8 : 0);
			if (wally > 13) {
				if (findwall(mpixel(tx,ty, tx-1, ty+1)))  { wally += 6; if (findwall(mpixel(tx,ty, tx+1, ty+1))) wally += 4; }
				else if (findwall(mpixel(tx,ty, tx+1, ty+1))) wally += 8;
			}
			if (wally == 6 || wally == 7) if (findwall(mpixel(tx,ty, tx+1, ty+1))) wally += 10;
			if (wally == 12 || wally == 13) if (findwall(mpixel(tx,ty, tx-1, ty+1))) wally += 6;
			return wally;
			};
      function shadowtype(tx,ty,map) { if (!iswall(mpixel(tx,ty,tx,ty))) return (iswall(mpixel(tx,ty, tx-1, ty))   ? 1 : 0) | (iswall(mpixel(tx,ty, tx-1, ty+1)) ? 2 : 0) | (iswall(mpixel(tx,ty, tx,   ty+1)) ? 4 : 0); };
      function doortype(tx,ty,map)   {
				var dr = (isdoor(mpixel(tx,ty,  tx,   ty-1)) ? 1 : 0) | (isdoor(mpixel(tx,ty,  tx+1, ty))   ? 2 : 0) | (isdoor(mpixel(tx,ty,  tx,   ty+1)) ? 4 : 0) | (isdoor(mpixel(tx,ty,  tx-1, ty))   ? 8 : 0);
				if (!dr) dr = (iswall(mpixel(tx,ty,  tx,   ty-1)) ? 1 : 0) | (iswall(mpixel(tx,ty,  tx+1, ty))   ? 2 : 0) | (iswall(mpixel(tx,ty,  tx,   ty+1)) ? 4 : 0) | (iswall(mpixel(tx,ty,  tx-1, ty))   ? 8 : 0);
				return (dr);
		};

	function pMapcell(tx, ty, pixel, map, spref) {

        var cell, x = t2p(tx),
                  y = t2p(ty),
                  n = tx + (ty * Mtw);

        spref.cells[n] = cell = { occupied: [] };

/// do stuff so we can modify cells later
//		  pcell = spref.cells[n];
		  reloaded = spref;
		  Mastercell = spref.cells[n];
		  spref.cells[n].x = x; // used by walls -> exits
		  spref.cells[n].y = y;
		  spref.cells[n].tx = tx; // used by trap: walls -> floor
		  spref.cells[n].ty = ty;
		  spref.cells[n].pixel = pixel;
		  refpixel = pixel;
// make some floor tiles appear slightlyt different - a "GPS" out of complex mazes
// this is built into the map file as color code #a08080
		  spref.cells[n].mapcht = ((pixel & 0xa08080) == 0xa08080);
/// do stuff tier

		  if (isstart(pixel))
		  {
				 spref.start = { x: x, y: y }
				 fndstart = true;
// save player start for theif entry
				if (thieftrack === 0)
				{
						THIEFTRX[thieftrack] = tx;
						THIEFTRY[thieftrack] = ty;
						thieftrack++;
				}
		  }

		  if (iswallrw(pixel))
			 cell.wall = walltype(tx, ty, map);
		  else if (isnothing(pixel))
			 cell.nothing = true;
		  else
			 cell.shadow = shadowtype(tx, ty, map);

		  if (isexit(pixel))
			 {
				 switch(type(pixel)) {
					case 0: spref.addExit(x, y, DOOR.EXIT);
							break;
					case 1: spref.addExit(x, y, DOOR.EXIT4);
							break;
					case 2: spref.addExit(x, y, DOOR.EXIT8);
							break;
					case 3: spref.addExit(x, y, DOOR.EXIT6);
							break;
					case 4: spref.addExit(x, y, DOOR.EXITMOVE);
								Movexit[lastmex++] = Mastercell.ptr; Mastercell.ptr.nohlp = 999; Mastercell.ptr.frame = 0;
							break;
				 }
			 }
		  else if (isdoor(pixel))
			{
					spref.addDoor(x, y, DOOR.HORIZONTAL);
					Mastercell.ptr.sx = doortype(tx,ty,map);
			}
		  else if (isgenerator(pixel)) {
			 var ent = spref.addGenerator(x, y, MONSTERS[(type(pixel) < MONSTERS.length) ? type(pixel) : 0]);
			  if (pixel != 0xF00000 && pixel != 0xF00060 && pixel != 0xF000B0) {
					ent.dx = -5;
					ent.dy = -5;
					ent.dw = 10;
					ent.dh = 10;
					}
				else
					{
					ent.dx = -2;
					ent.dy = -2;
					ent.dw = 4;
					ent.dh = 4;
					}
			}
		  else if (istreasure(pixel))
			 {
				 var ad = TREASURES[type(pixel) < TREASURES.length ? type(pixel) : 0];
// some treasures operate from sub pixels
				 var sb = MEXLOW & pixel;
				 if (ad == TREASURE.POTION && (sb > 0)) switch(sb) { case 1: ad = TREASURE.POTIONORG; break; }
				 if (ad == TREASURE.HEALRND && (sb > 0)) switch(sb) { case 1: ad = TREASURE.POISON; break; case 2: ad = TREASURE.BADPOT; break;}
				 if (ad == TREASURE.XSPEED && (sb > 0)) switch(sb) { case 1: ad = TREASURE.XSHOTPWR; break; case 2: ad = TREASURE.XSHOTSPD; break; case 3: ad = TREASURE.XARMOR; break; case 4: ad = TREASURE.XFIGHT; break; case 5: ad = TREASURE.XMAGIC; break; }
				 if (ad == TREASURE.LIMINVIS && (sb > 0)) switch(sb) { case 1: ad = TREASURE.LIMINVUL; break; case 2: ad = TREASURE.LIMREPUL; break; case 3: ad = TREASURE.LIMREFLC; break; case 4: ad = TREASURE.LIMSUPER; break; case 5: ad = TREASURE.LIMTELE; break; case 6: ad = TREASURE.LIMANK; break; }
				 if (ad == TREASURE.WATER && (sb > 0)) switch(sb) { case 1: ad = TREASURE.WATERT; break; case 2: ad = TREASURE.WATERC; break; case 3: ad = TREASURE.WATERR; break; }
				 if (ad == TREASURE.LAVA && (sb > 0)) switch(sb) { case 1: ad = TREASURE.LAVAT; break; case 2: ad = TREASURE.LAVAC; break; case 3: ad = TREASURE.LAVAR; break; }
				 if (ad == TREASURE.NWASTE && (sb > 0)) switch(sb) { case 1: ad = TREASURE.NWASTET; break; case 2: ad = TREASURE.NWASTEC; break; case 3: ad = TREASURE.NWASTER; break; }
				 if (ad == TREASURE.FFIELDUNIT && (sb > 0)) switch(sb) { case 1: ad = TREASURE.FFIELDUNITD; break; case 2: ad = TREASURE.FFIELDUNITL; break; case 3: ad = TREASURE.FFIELDUNITR; break; case 4: ad =  TREASURE.FFIELDDIM; break; };
				spref.addTreasure(x, y, ad);
// wall types all work to build wall appearance
				 if (Mastercell.ptr.type.wall) {
					 Mastercell.ptr.sx = pixel & MEXLOW; // color of rubble shotwall
					 if (ad == TREASURE.SHOTWALL) { Mastercell.ptr.sy = Mastermap.level.wall; if (sb > 0) Mastercell.ptr.sy = sb + 1; Mastercell.ptr.sx = walltype(tx, ty, map, iswall); }
					 if (ad == TREASURE.SHOTWALL2) { Mastercell.ptr.sy = sb + 17; Mastercell.ptr.sx = walltype(tx, ty, map, iswall); }
				 }
				 if (ad == TREASURE.WALLRND || ad == TREASURE.WALLRND2 || ad == TREASURE.WALLPHS || ad == TREASURE.WALLPHS2) {
					 Mastercell.ptr.rwall = (ad == TREASURE.WALLRND || ad == TREASURE.WALLRND2);
					 if (ad == TREASURE.WALLPHS || ad == TREASURE.WALLPHS2) Mastercell.ptr.pwall = 1;
					 Mastercell.ptr.hb = 0;
					 Mastercell.ptr.sy = Mastermap.level.wall;
					 if (sb > 0) Mastercell.ptr.sy = sb + 1 + (0x10 * (ad == TREASURE.WALLRND2) + (0x10 * (ad == TREASURE.WALLPHS2)));
					 Mastercell.ptr.sx = walltype(tx, ty, map, iswallpr);
					 Mastercell.ptr.svsy = Mastercell.ptr.sy;
					 }
				 if (ad == TREASURE.WALLGUD || ad == TREASURE.WALLGUD2 || ad == TREASURE.WALLPASS || ad == TREASURE.WALLPASS2) {
					 Mastercell.ptr.sy = Mastermap.level.wall;
					 if (sb > 0) Mastercell.ptr.sy = sb + 1 + (0x10 * (ad == TREASURE.WALLGUD2)) + (0x10 * (ad == TREASURE.WALLPASS2));
					 Mastercell.ptr.sx = walltype(tx, ty, map);
					 }
				 Mastercell.ptr.lvlwall = (sb == 0 && (ad == TREASURE.WALLRND || ad == TREASURE.WALLPHS || ad == TREASURE.WALLGUD || ad == TREASURE.WALLPASS || ad == TREASURE.SHOTWALL)); // lvlwall - ent wall in lvl wall color
				 }
		  else if (ismonster(pixel))
			 spref.addMonster(x, y, MONSTERS[type(pixel) < MONSTERS.length ? type(pixel) : 0]);
      };

// sref - the self from map load
	function parseImage(image, callback, sref) {
		 var tx, ty, index, pixel,
			  tw      = Mtw,
			  th      = Mth,
			  canvas  = Game.renderToCanvas(tw, th, function(ctx) { ctx.drawImage(image, 0, 0); }),
			  ctx     = canvas.getContext('2d'),
			  data    = ctx.getImageData(0, 0, tw, th).data,
			  helpers = {
				 valid: function(tx,ty) { return (tx >= 0) && (tx < tw) && (ty >= 0) && (ty < th); },
				 index: function(tx,ty) { return (tx + (ty*tw)) * 4; },
				 indexb: function(tx,ty) { return (tx + (ty*tw)); },
				 indexc: function(tx,ty) { return (tx + (ty*Mtw)); },
				 pixel: function(tx,ty) { var i = this.index(tx,ty); return this.valid(tx,ty) ? (data[i]<<16)+(data[i+1]<<8)+(data[i+2]) : null; }
			  }

		if (Mapdata == null) {

// mirror here, mr burton...
	var mx = 0, my = 0;
		if (Mirx) mx = tw - 1;
		if (Miry) my = th - 1;

		 Mapdata = [];
		 for(ty = 0 ; ty < th ; ty++)
			for(tx = 0 ; tx < tw ; tx++)
				Mapdata[helpers.indexc(tx,ty)] = helpers.pixel(Math.abs(mx - tx),Math.abs(my - ty));

		if (Mrot) {
					var nw = th, nh = tw, nv = 0;
					image.width = nw;
					image.height = nh
					Mtw = nw;
					Mastermap.tw = Mtw;		// or nothing placed on initial load will be touchable
					Mth = nh;
					var newdata = [];
					for(ty = 0 ; ty < (Mtw * Mth)  ; ty++) {
							newdata[ty] = Mapdata[ty];
							Mapdata[ty] = 0;
						}
					for(tx = (tw - 1) ; tx >= 0 ; tx--) {
						for(ty = 0 ; ty < th ; ty++)
							Mapdata[nv++] = newdata[helpers.indexb(tx,ty)] }
// relod
					}
		}

		 for(ty = 0 ; ty < Mth ; ty++)
			for(tx = 0 ; tx < Mtw ; tx++)
			  callback(tx, ty, Mapdata[helpers.indexc(tx,ty)], helpers, sref);
		};

	function rewall(map) {

		var n, nc = reloaded.cells.length;

		for (n = 0;n < nc;n++) {

        cell = reloaded.cells[n];

		  if (iswallrw(cell.pixel))
			 cell.wall = walltype(cell.tx, cell.ty, map);
		  else if (isnothing(cell.pixel))
			 cell.nothing = true;
//		  else
		 cell.shadow = shadowtype(cell.tx, cell.ty, map);

			}

		};

// hues & colors
// process level colors, hue overrides, special color instructions, tile overrides
// first byte - codes: xFE, xFC, xFA, xF8, xF6, xF4, xF2
// xFE - hues override: xFFFF: 0 - 255 interpolate to 0 - 359, byte 1 = floor/wall, byte 0 = items
// xFC - tile override: 0xF000 - extra tiles set #, x0F00 - trap code, 0xFF - lower byte floors ref, 0 is level floor
// xFA - color layer as gradient 0xFFFF gradient codes, & follow 2 triples color1 to color2
// xF8 - phase wall code # byte 0, sequential - 1st phase set, {1,2,3,4}, break (no 5) 2nd phase set, {6,7,8,9,10,11}, and on -- byte 1 is time delay (default 2 sec)
// xF4 - trap code - trap # match 80B#, this wall or item will be removed by indicated trap
// xF -
/*
	var mgrad = ctx.createLinearGradient(0, 0, 0, 170);
	mgrad.addColorStop(0, "red");
	mgrad.addColorStop(1, "yellow");
*/
// XF -
// any other codes: color triple 0xFFFFFF that will load between gbas layer and gflr

var Lhue_bkg, Lhue_item, Lcolor, Lrgb, Lxtr, Ltile, Ltrap, Lphase, Lsecs;

	function parseHue(px, py, ns, ctx) {
		Lhue_bkg = 0;
		Lhue_item = 0;
		Lcolor = 0;
		Lxtr = 0;
		Ltile = 0;
		Ltrap = 0;
		Lsecs = 0;
		Lphase = 0;
// no data loaded
		if (Huedata == null) return -1;
		var n = px + (py * Mtw), mask = 0xFF0000;
		if (ns != undefined) n = ns;

		var d = Huedata[n];

// hue codes wall, items
		if ((d & mask) == 0xFE0000) {
			Lhue_bkg = (d & 0xFF00) / 0x100;
			Lhue_item = (d & 0xFF);
			return 0;
		}
// tile override
		if ((d & mask) == 0xFC0000) {
			Lxtr = (d & 0xF000) / 0x1000;
			Ltrap = (d & 0xF00) / 0x100;
			Ltile = (d & 0xFF);
			return 0;
		}
// phase wall seq
		if ((d & mask) == 0xF80000) {
			Lsecs = (d & 0xFF00) / 0x100;
			Lphase = (d & 0xFF);
			return 0;
		}
		Lcolor = d;
		Lrgb = "rgb("+((d & 0xFF0000) / 0x10000)+", "+((d & 0xFF00) / 0x100)+", "+(d & 0xFF)+")";
		return d;
	};

// random load item from chest or shotwall - col (10, 11), chn 0.0 - 1.0, cell to plug
	function rlitem(col, chn, cell) {

		for (f = 0;f <= swloop;f++)
			{
				if (RLPROF[f][col] > 0)
				if (Math.random() < chn) {
					if (cell != undefined)
					Mastermap.load_cell(cell.tx, cell.ty, RLPROF[f][0],Mastermap);
					return RLPROF[f][0];
				}
			}
			return -1;	// no item deployed
		};
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

// xperimental - doin mod stuff
// currently spawns theif/muger for std g1/g2 ops
  function spawn()
  {
		var thcell,cell, cells  = reloaded.cells;
		var c, nc = cells.length, fnd = 0, sft = 6000;

		for (c = 0;c < nc;c++)
		{
				cell = cells[c];
				if (cell.tx == THIEFTRX[0] && cell.ty == THIEFTRY[0]) thcell = cell;
				fnd = true;
		}
		if (thcell == undefined)		// no start was found - just spawn a theif and hope he finds players
		{
				fnd = 0;
				while (!fnd && (sft > 0))
				{
						c = Game.Math.randomInt(0,nc - 1);
						thcell = cells[c];
						fnd = isfloor(thcell.pixel);
						if (cell.loaded != undefined) fnd = false;		// for some reason the .occupied() fn fails here, so we do our own thing
						sft--;
				}
		}
		if (fnd)
		{
//document.title = "THFC:  "+thcell.tx+" : "+thcell.ty;
// for strict g1/g2 - only one theif
//				if (one_theif) theif_ad = mug_ad;
				one_theif++;
				var addo = theif_ad;
				if (Math.random() < thf_mug_bal) addo = mug_ad;		// g1 only will block this -- bal, first time more chance of thf
				else thf_mug_bal = 0.65;																		// g2 seems to send out a lot of muggers
				Mastermap.load_cell(thcell.tx, thcell.ty, addo,Mastermap);
				Mastercell.ptr.theif = 0;	// spawned -- NOT generated or placed
// could start a new thief where the old one was killed - if local thieftrack is saved
				Mastercell.ptr.thieftrack = 0;	// spawned -- NOT generated or placed
//				Musicth.play(Musicth.sounds.hitheif);
				Musicth.play(Musicth.sounds[Mastercell.ptr.type.bsound]);

		}
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
		img = document.getElementById("gfloorbas");
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

		 scoredex = readCookieDef("hindex",0,0);
		if (scoredex > 0)
		for (var i = 1; i <= scoredex; i++)
		 {
				HSCORE[i,0] = readCookie(i+"score");
				HSCORE[i,1] = readCookie(i+"name");
				HSCORE[i,2] = readCookie(i+"char");
		 }
// load user options here
		document.getElementById("seldiff").value = readCookie("_ops_"+"seldiff");
		document.getElementById("sellvl").value = readCookie("_ops_"+"sellvl");
		document.getElementById("whue").value = readCookie("_ops_"+"whue");
		document.getElementById("fhue").value = readCookie("_ops_"+"fhue");
		document.getElementById("phue").value = readCookie("_ops_"+"phue");
		document.getElementById("ashue").value = readCookie("_ops_"+"ashue");
		document.getElementById("vports").value = readCookie("_ops_"+"vports");
		document.getElementById("seltut").checked = false;
		document.getElementById("selg2tut").checked = false;
		document.getElementById("seltutx").checked = false;
		document.getElementById("mazsolv").checked = false;
		document.getElementById("xunp").checked = false;
		document.getElementById("yunp").checked = false;
		document.getElementById("xmiror").checked = false;
		document.getElementById("ymiror").checked = false;
		document.getElementById("rotat").checked = false;
		document.getElementById("invwal").checked = false;
		document.getElementById("invhint").checked = false;
		document.getElementById("spedis").checked = false;
		document.getElementById("blrndlod").checked = false;
		document.getElementById("forndlod").checked = false;
		document.getElementById("nostal").checked = false;
		document.getElementById("noah").checked = false;
		document.getElementById("nommv").checked = false;
		document.getElementById("nogen").checked = false;
		document.getElementById("noblend").checked = false;

		if (readCookie("_ops_"+"seltut") == "true") document.getElementById("seltut").checked = true;
		if (readCookie("_ops_"+"selg2tut") == "true") document.getElementById("selg2tut").checked = true;
		if (readCookie("_ops_"+"seltutx") == "true") document.getElementById("seltutx").checked = true;
		if (readCookie("_dev_"+"mazsolv") == "true") document.getElementById("mazsolv").checked = true;
		if (readCookie("_dev_"+"xunp") == "true") document.getElementById("xunp").checked = true;
		if (readCookie("_dev_"+"yunp") == "true") document.getElementById("yunp").checked = true;
		if (readCookie("_dev_"+"xmiror") == "true") document.getElementById("xmiror").checked = true;
		if (readCookie("_dev_"+"ymiror") == "true") document.getElementById("ymiror").checked = true;
		if (readCookie("_dev_"+"rotat") == "true") document.getElementById("rotat").checked = true;
		if (readCookie("_dev_"+"invwal") == "true") document.getElementById("invwal").checked = true;
		if (readCookie("_dev_"+"invhint") == "true") document.getElementById("invhint").checked = true;
		if (readCookie("_dev_"+"spedis") == "true") document.getElementById("spedis").checked = true;
		if (readCookie("_dev_"+"blrndlod") == "true") document.getElementById("blrndlod").checked = true;
		if (readCookie("_dev_"+"forndlod") == "true") document.getElementById("forndlod").checked = true;
		if (readCookie("_dev_"+"nostal") == "true") document.getElementById("nostal").checked = true;
		if (readCookie("_dev_"+"noah") == "true") document.getElementById("noah").checked = true;
		if (readCookie("_dev_"+"nommv") == "true") document.getElementById("nommv").checked = true;
		if (readCookie("_dev_"+"nogen") == "true") document.getElementById("nogen").checked = true;
		if (readCookie("_dev_"+"noblend") == "true") document.getElementById("noblend").checked = true;
/// TEST - remove
//for (i = 1; i <= 81; i++) { deleteCookie(i+"char"); deleteCookie(i+"score"); deleteCookie(i+"name"); }

    },

    onstart: function(event, previous, current, type, nlevel) {
//		scoredex++;
		 $('scordiv').hide();
      this.player.join(type);
      this.load(to.number(nlevel, this.loadLevel()));
// intro
		  Musicth.play(Musicth.sounds[type.blip]);
// announce intro
		  Musicth.play(Musicth.sounds.ancwelc);
		  Musicth.play(Musicth.sounds[type.helo]);

// setup some things for this run - maybe
			SPOTION[0] = TREASURE.XSPEED;
			SPOTION[1] = TREASURE.XSHOTPWR;
			SPOTION[2] = TREASURE.XSHOTSPD;
			SPOTION[3] = TREASURE.XARMOR;
			SPOTION[4] = TREASURE.XFIGHT;
			SPOTION[5] = TREASURE.XMAGIC;
			shuffle(SPOTION);
// special treasure room deal
			TROOMSUP[1] = TREASURE.GOLD;
			TROOMSUP[2] = TREASURE.BAG;
			TROOMSUP[3] = TREASURE.LOCKED;
			TROOMSUP[4] = TREASURE.KEY;
// autoload
			RNGLOAD[1] = TREASURE.GOLD;
//			stolen_load = 0;
			FLVLRND = Game.Math.randomInt(FLOOR.MIN, FLOOR.MAX);
    },

    onload: function(event, previous, current, nlevel) {
/// debug code - remove pre-release
			if (DEBUGON)
			if (initlevel > -1)
		 {
			 		nlevel = initlevel;
					initlevel = 0;
		 }
// reset theif trax
					thieftrack = 0;
					thiefexit = false;

/// debug tier
// clear found start
		 fndstart = false;
// mark treasure levels
		 var c = 0, sk, trdisp, potionhelp;

		 for (sk = 0;sk < cfg.levels.length;sk++)
		 {
				if (cfg.levels[sk].name == 'Treasure')
				{
					TREASUREROOM[c] = cfg.levels[sk];
					TREASUREROOM[c++].lvl = sk;
				}
// rename any level named "Research X"
				 if (cfg.levels[sk].name == "Research X")
				{
						cfg.levels[sk].name = generateName();
// randomly play 4 sec intro title bit on these levels
				}
		 }
		 leveldisp = "<br>LEVEL:&nbsp&nbsp "+nlevel;
		 levelhelp = undefined;
		 potionhelp = "";
		 trdisp = false;

		 if (tlevel > 7) 				// last level was treasure room
		 {
			 trdisp = true;			// display treasure room stats first
			 nlevel = tlevel;		// saved level advance to inject treasure room - resume on nlevel
			 tlevel  = 0;
			 treasurerc = 0;		// reset chance after treasure room
// still :
			 /// add up bonus on exit - timer == -1 (for now)
		 }
		 else
		 if (treasurerc >= Math.random())		// test for treasure room rnd chance
		 {
				troomfin = false;
				tlevel = nlevel;
				sk = Math.floor(Math.random() * (c - 1));
				nlevel = TREASUREROOM[sk].lvl;
				troomtime = TREASUREROOM[sk].rtime;	// run time
				leveldisp = "<br>TREASURE ROOM";
				levelhelp = HELPDIS[nohlptr].replace("#",troomtime) + "<br><br>" + HELPDIS[nohlpmstex];
				var r = Game.Math.randomInt(0, 3);			// treasure room failure taunts
				switch(r) {
						case 0: Musicth.play(Musicth.sounds.ancftreas);
								break;
						case 1: Musicth.play(Musicth.sounds.ancwtreas);
								break;
						case 2: Musicth.play(Musicth.sounds.ancwtreas);
								break;
				}
		 }
		 else
		{
// 0 - level after troom - nada
// 1 - 2nd level after
// 2 - 3rd level after
// start room check again
				if (nlevel > 9)			// not needed before - logic changed...
				if (tlevel > 1)			// wait 3 levels then start rand checks
					treasurerc = treasurerc + 0.37;
				else
				tlevel++;
		}
/// testing - REMOVE
//		 treasurerc = 1;
//		 spotionlv = 1;

		var plannc = false;
		var shotsnow = "<br><br><br><font color=orange>shots now stun other players";
		var anncshots = Musicth.sounds.ancyssop;
//		plannc = true;
		if (Math.random() < 0.5) { shotsnow = "<br><br><br><font color=red>shots now hurt other players"; anncshots = Musicth.sounds.ancyshop; }
//		Musicth.play(anncshots);

// check for hidden potions
		if (nlevel > 5)
		{
				spotionloop++;
				if (spotionloop > 2) spotionlv = 1;
// enhanced - g1 had a special every 3 levels
//				if (Math.random() < 0.33 || (spotionloop > 4)) spotionlv = 1;

				if (spotionlv)
				{
						spotionloop = 0;
						potionhelp = "<br><br><br><font color=yellow>FIND THE HIDDEN POTION</font>";
// NOTE: overlap can occur if treasure room taunt happens in 3 secs or extended announce occurs
						if (Math.random() < 0.66 && !plannc) { Musicth.play(Musicth.sounds.anchidpot); plannc = true; }
				}
		}

      var level    = cfg.levels[nlevel],
		self     = this,
		onloaded = function() { $('booting').hide(); self.play(new Map(nlevel)); };
		document.getElementById("gfloor").src = level.gflr;		// set this here so its ready on map build
      if (level.source) {
				onloaded();
      }
      else {
				loadscortabl();
			  $('booting').show();

					var lvs = level.url;
/// TEST - remove
// this works - but it refuses to refresh if flvl is changed
var lvu = document.getElementById("flvl").value;

	 if (lvu != "") lvs = lvu;
/// TEST - remove
					level.hued = Game.createImage("h"+lvs +"?cachebuster=" + VERSION);		// special color and hues map for a level
					level.source = Game.createImage(lvs +"?cachebuster=" + VERSION , { onload: onloaded });

      }

			announcepause = true;
			if (levelhelp == undefined) levelhelp = level.help;		/// NOTE: test & add in level msgs that have annc (5, 6, 7)
			if (levelhelp == undefined) levelhelp = HELPDIS[Game.Math.randomInt(nohlplvl,nohlplvlend)];
/// NOTE: special level notes & annc here - shots stun & hurt, ploff
			levelhelp = levelhelp + potionhelp + shotsnow;
//		turned on during player exiting
			var img = document.getElementById("tweenmsg");
			if (trdisp)
			{
					$('tween').update("Stats").show();
					setTimeout(game.onexittreasure.bind(this), 2500);
					if (troomfin)
					{
								img.innerHTML = game.player.type.fcol+"<table style='text-align: left;'><tr><td>MULTIPLIER:&nbsp&nbsp&nbsp&nbsp&nbsp</td><td>" + game.player.scmult + " x 100 pts</td></tr><tr><td>TREASURES x</td><td>" + game.player.ctr  + "</td></tr><tr><td>BONUS = </td><td>" + (game.player.ctr * 100 * game.player.scmult)  + "</td></tr></table></font>";
								game.player.addscore(game.player.ctr * 100);
					}
					else
								img.innerHTML = "better luck next time!"
					game.player.ctr = 0;
			}
			else
			{
					$('tween').update(leveldisp).show();
					setTimeout(game.onleavetween.bind(this), 2000);
					img.innerHTML = levelhelp;
			}
    },

    onplay: function(event, previous, current, map) {
		 Masterthmp = this;	// why do we need both this and Mastermap ??
      this.map = map;
      this.saveLevel(map.nlevel);
      this.saveHighScore(); // a convenient place to save in-progress high scores without writing to local storage at 60fps
      publish(EVENT.START_LEVEL, map);
//      if (map.level.help)		// moved to tween msg
//        this.help(map.level.help);
// stop intro loop
		var spl = document.getElementById("splash");
		spl.style.visibility = "hidden";

// load special potion
		var cell, cells  = reloaded.cells;
		var c, nc = cells.length, fnd = 0, sft = 6000;

			if (spotionlv)
			{
					spotionlv = 0;
					var spotct = spotionct, ldrnd = 0.01, seqrnd = false;
					if (Math.random() < spotionrnd) seqrnd = true;
					else spotionct++;
					if (seqrnd || (spotct > spotionmax)) spotct = Game.Math.randomInt(0, spotionmax);

					while (!fnd && (sft > 0))
					{
							c = Game.Math.randomInt(0,nc - 1);
							cell = cells[c];
							fnd = isfloor(cell.pixel);
//							if (cell.loaded != undefined) fnd = false;		// not needed pre game ops - maps will only have is{X}() loaded stuff at this point -- we would need this in a map reload situ
							sft--;
					}
					if (fnd)
					{
							reloaded.addTreasure(cell.x, cell.y, SPOTION[spotct]);		// NOTE: fnd could fail, then we have hidden notification with no potion
							cell.loaded = true;
					}
			}

/// NOTE: special until treasures are mapped into treasure rooms !
			if (troomtime > 0)
			{
					var tind;
					for (var tl = 0; tl < 100; tl++)	// temp load 100 treasures
					{
							fnd = 0;
							tind = 1;
							if (Math.random() < 0.1) tind = 2;
							if (Math.random() < 0.05) tind = 3;
							if (Math.random() < 0.05) tind = 4;
							sft = 6000;
							while (!fnd && (sft > 0))
							{
									c = Game.Math.randomInt(0,nc - 1);
									cell = cells[c];
									fnd = isfloor(cell.pixel);
									if (cell.loaded != undefined) fnd = false;		// for some reason the .occupied() fn fails here, so we do our own thing
									sft--;
							}
							if (fnd)
							{
									reloaded.addTreasure(cell.x, cell.y, TROOMSUP[tind]);
									cell.loaded = true;
							}
					}
			}
			else
			{
// check theif check
					if (Math.random() < thiefrnd)
					{
			/// rnd check that varies - similar to treasure room
			/// perhaps relate to how many special potions, multiplier, score gained, etc
							thieftim = 1000 * (thieftotim + (thieftotim * Math.random())) + timestamp();
					}
					if (g4rc >= Math.random()) {
						if (Math.random() > 0.66)
							Musicth.play(Musicth.sounds.g4sec);		// rnd play 4 sec, but not treasure rooms
						else
							Musicth.play(Musicth.sounds.g4sec2);
					}
			}
// dev controls - block rnd loads, or force them on levels
			var blrnd = document.getElementById("blrndlod").checked;
			var frnd = document.getElementById("forndlod").checked;

			if ((Mastermap.level.nornd == undefined || frnd == true) && blrnd != true)	// random load a level
			{
					var f, rprof, ldiff;

					diff_level = document.getElementById("seldiff").value;
					ldiff = diff_level / def_diff;
// treasure will come thru here unless blocked
					rprof = Game.Math.randomInt(1,rlline);			// for now pick a random profile
					if (troomtime > 0) rprof = rlline + 1;
					for (f = 0;f <= rlloop;f++) RLOAD[f] = Math.ceil(RLPROF[f][rprof] * ldiff);		// get item counts for a profile
					for (f = 0;f <= rlloop;f++)
					{
							sft = 6000;
							while (RLOAD[f] > 0 && (sft > 0))
							{
									fnd = 0;
									while (!fnd && (sft > 0))
									{
											c = Game.Math.randomInt(0,nc - 1);
											cell = cells[c];
											fnd = isfloor(cell.pixel);
											if (cell.loaded != undefined) fnd = false;		// for some reason the .occupied() fn fails here, so we do our own thing
											sft--;
									}
									if (fnd)
									{
											Mastermap.load_cell(cell.tx, cell.ty, RLPROF[f][0],Mastermap);
											cell.loaded = true;
											RLOAD[f]--;
// randomize the last 2
											if ((RLOAD[f] == 2) && (Math.random() < 0.1)) RLOAD[f]--;
											if ((RLOAD[f] == 1) && (Math.random() < 0.25)) RLOAD[f]--;
									}
							}
					}
			}
// theif escaped with item -
			if (stolen_load > 0 && stolen_load <= rlloop)
			{
					sft = 6000;
					fnd = 0;
					while (!fnd && (sft > 0))
					{
							c = Game.Math.randomInt(0,nc - 1);
							cell = cells[c];
							fnd = isfloor(cell.pixel);
							if (cell.loaded != undefined) fnd = false;		// for some reason the .occupied() fn fails here, so we do our own thing
							sft--;
					}
					if (fnd)
					{
							Mastermap.load_cell(cell.tx, cell.ty, RLPROF[(stolen_load - 1)][0],Mastermap);
							stolen_load = 0;
					}
			}
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

    onexittreasure: function(event, previous, current, msg) { setTimeout(this.onleavetween.bind(this), 2500);

					var img = document.getElementById("tween");
					img.innerHTML = leveldisp;
					img = document.getElementById("tweenmsg");
					img.innerHTML =  "";
					if (levelhelp) img.innerHTML = levelhelp;
		 },

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
		 Mastercell.ptr.lsuper = false;
		 if (player.lsuper > 0) // fire a super shot
		 {
				player.lsuper = countdown(player.lsuper);
				Mastercell.ptr.lsuper = true;
				Mastercell.ptr.damage = 100; // estimate - for damage soaks - dragon, players
				Mastercell.ptr.xshotspd = true; // super are fast shot
		 }
		 else
		 {
				if (player.lreflect) Mastercell.ptr.reflect = reflectcnt;
				Mastercell.ptr.xshotpwr = player.xshotpwr; // weapon fire contains xtra shot power flag
				Mastercell.ptr.xshotspd = player.xshotspd; // weapon fire contains xtra shot speed flag
		 }
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
		troomfin = true; // halt treasure room count - cause treasure add on level load
		troomtime = 0;
		 thiefexit = true;
// used between levels
			var img = document.getElementById("tweenmsg");	// prep this & turn on here for:
			img.style.visibility = "visible";	// always turn on - blocks scmult rot
			img.innerHTML = "";
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

		 var nosup = true;
      if (weapon.type.player && (entity.monster || entity.generator || entity.treasure ))
		 {
				var r, rn, xdmg = 0, dmg, vdmg = weapon.type.wind;
				if (weapon.xshotpwr) vdmg = vdmg + Math.min(weapon.xshotpwr, ppotmax);
				dmg = ABILIND[vdmg];
				r = ABILRNG[vdmg];			// cursed potions could make this neg val - Math.abs needed
				rn = r - Math.floor(r);
				if (rn > 0)
				{
						if (rn > Math.random()) xdmg = Math.floor(r);
				}
				if (weapon.lsuper)
				{
						dmg = weapon.damage;
						if (entity.type.canbeshot) nosup = false;			// super shot hit a monster, gen or treasure that is shotable - keep going
				}
/// TEST - update ?
				if (document.getElementById("sdps").checked && entity.type.pushwal)
				{
					var dpst = document.getElementById("dpsout").title;
					var dphm  = 0;	// damage per 30 secs
					if (document.getElementById("sdphm").checked) dphm = 30;
					if (dpstim < heartbeet) {
						document.getElementById("dpsout").value = dpsacc;
						if (dpst.length > 256) dpst = "dps: ";
						document.getElementById("dpsout").title = dpst + " : "+dpsacc;
						dpsacc = 0;
						dpstim = heartbeet + dphm;
					}
					else
					{
						dpsacc += dmg + xdmg;
					}
				}
				else
/// TEST - remove
				entity.hurt(dmg + xdmg, weapon);
		 }
// monster shot player
      else if (weapon.type.monster && entity.player)
        entity.hurt(weapon.type.damage, weapon);
// monster shot monster
      else if (weapon.type.monster && entity.monster)
        entity.hurt(weapon.type.damage, weapon);

      this.map.addFx(x, y, FX.WEAPON_HIT);
      if (nosup) this.map.remove(weapon);
    },

    onPlayerCollide: function(player, entity) {
      if (entity.monster || entity.generator)
		 {
				var xdmg = 0;	// calculate extra fight power	-- for now 25% of regular power, should boost ability evenly
				if (player.xfight) xdmg = player.xfight * 0.25 * player.type.damage;
// player cant fight ghosts or death or acid blobs or IT
				if (entity.type.notfot != true)
					entity.hurt(player.type.damage + xdmg, player);
		 }
      else if (entity.treasure)
		 {
			if (entity.type.lock && !player.keys) {
				helpdis(entity.type.nohlp, undefined, 2000, undefined, undefined);
				return;
			}
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
		 {
				if (entity.type.sx != 9 || entity.frame == 4)		// catch moving exit only on full open frame
/// TEST - remove
//			document.title = player.x+"."+player.y+":x.y - dx: "+distance(player.x,player.y,entity.x,player.y)+" -- dy: "+distance(player.x,player.y,player.x,entity.y)+" -- delt:"+distance(player.x,player.y,entity.x,entity.y);
					player.exit(entity);
		 }
    },

    onMonsterCollide: function(monster, entity) {
      if (entity.player) {
			helpdis(monster.type.nohlp, undefined, 2000, Math.floor(monster.type.damage), undefined);		// ISSUE: player armor
        entity.hurt(monster.type.damage, monster);
// monster hit player sound
		Musicth.play(Musicth.sounds[monster.type.hits]);
        if (monster.type.selfharm)
          monster.hurt(monster.type.selfharm, monster);
        if (monster.type.theif)// && (monster.stolen == 0 || monster.stolen == undefined))
			{
				if (monster.stolen == 0 || monster.stolen == undefined)
				 {
						if (monster.type.name == "mugger")
						 {
								entity.hurt(monster.type.steal);
								monster.stolen = 7;
						 }
						else if (entity.xspeed > 0)
						{
								entity.xspeed = entity.xspeed - 1;
								if (entity.xspeed < 0) entity.xspeed = 0;
								monster.stolen = 3;
						}
						else if (entity.xshotpwr > 0)
						{
								entity.xshotpwr = entity.xshotpwr - 1;
								if (entity.xshotpwr < 0) entity.xshotpwr = 0;
								monster.stolen = 3;
						}
						else if (entity.xshotspd > 0)
						{
								entity.xshotspd = entity.xshotspd - 1;
								if (entity.xshotspd < 0) entity.xshotspd = 0;
								monster.stolen = 3;
						}
						else if (entity.xmagic > 0)
						{
								entity.xmagic = entity.xmagic - 1;
								if (entity.xmagic < 0) entity.xmagic = 0;
								monster.stolen = 3;
						}
						else if (entity.xarmor > 0)
						{
								entity.xarmor = entity.xarmor - 1;
								if (entity.xarmor < 0) entity.xarmor = 0;
								monster.stolen = 3;
						}
						else if (entity.xfight > 0)
						{
								entity.xfight = entity.xfight - 1;
								if (entity.xfight < 0) entity.xfight = 0;
								monster.stolen = 3;
						}
						else if (entity.potions > 0)
						{
								entity.potions = entity.potions - 1;
								monster.stolen = 3;
						}
						else if (entity.keys > 0)
						{
								entity.keys = entity.keys - 1;
								monster.stolen = 2;
						}
						else if (entity.score > monster.type.steal)
						{
							entity.score = entity.score - monster.type.steal;
							monster.stolen = 1;
						}
						if (monster.stolen)
						{
							monster.thcount = 35;
							if (monster.type.name != "mugger") helpdis(nohlpkth, undefined, 2000, undefined, undefined);
						}
				  }
			}
      }
    },

    onMonsterDeath: function(monster, by, nuke) {
      if (by)
        by.addscore(monster.type.score);
      this.map.addMultipleFx(3, monster, FX.MONSTER_DEATH, TILE/2, nuke ? FPS/2 : FPS/6);
// shot thief drops item
        if (monster.type.theif && (monster.stolen > 0 || monster.theif != NOSPAWNTHF))
		 {
				if (monster.stolen < 1 || monster.stolen == undefined) monster.stolen = 1; // theif is innocent - give him a bag of gold, 		yes planting evidence occured
				var tcell = reloaded.cells[p2t(monster.x+5) + p2t(monster.y+5) *  Mastermap.tw];
				Mastermap.load_cell(tcell.tx, tcell.ty, RLPROF[(monster.stolen - 1)][0],Mastermap);
		 }
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

// dont save for lvl 8 replay - levels 1 - 7 & treasure rooms
    saveLevel: function(nlevel) { if ((nlevel > 7) && (nlevel < 115)) this.storage[STORAGE.NLEVEL] = nlevel;    },
    loadLevel: function()
	 {
// let player select any of 1st 7 levels or last saved level
			var slvl = to.number(document.getElementById("sellvl").value, 1);
			if (slvl == 8) slvl = to.number(this.storage[STORAGE.NLEVEL], 1);
/// TEST - remove
// dev - override level load with an internal level number
	var dlvl = to.number(document.getElementById("nlvl").value, 1);
		 if (dlvl > 7) slvl = dlvl;
/// TEST - remove

			return slvl;
	},
    prevLevel: function()       { var n = this.map.nlevel - 1; this.load(n <= 0  ? cfg.levels.length - 1 : n); },
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
		if (diff_level > 9) return;
      if ((this.player.score / this.player.droppedcoins) > this.loadHighScore()) {
        this.storage[STORAGE.SCORE] = (this.player.score / this.player.droppedcoins);
        this.storage[STORAGE.WHO]   = this.player.type.name;
      }
// char stats
		var chtime = readCookie("chartm_"+this.player.type.name);
		if (heartbeet > chtime) createCookie("chartm_"+this.player.type.name,heartbeet,7777);

		if (this.player.score > 8000) {
/// TEST - remove
			var ablist = "ABCDEFGHIJKLMNPQRSTUVWXYZ1234567890._ ";
			var res = "";
				 for(var i = 0; i < 3; i++) {
			var rnd = Math.floor(Math.random() * ablist.length);
				 res = res + ablist.charAt(rnd); }
/// TEST - remove

			scoredex++;
			createCookie(scoredex+"char", this.player.type.name,7777);
			createCookie(scoredex+"score",(this.player.score / this.player.droppedcoins),7777);
			createCookie(scoredex+"name", res,7777);
			createCookie("hindex", scoredex,7777);
			HSCORE[scoredex,0] = (this.player.score / this.player.droppedcoins);
			HSCORE[scoredex,1] = res;
			HSCORE[scoredex,2] = this.player.type.name;
//			HSCORE[scoredex,0] = readCookie(scoredex+"score");
//			HSCORE[scoredex,1] = readCookie(scoredex+"name");
//			HSCORE[scoredex,2] = readCookie(scoredex+"char");
//						HSCORE.sort((a,b) => a[0] - b[0]);
		}
		if (DEBUGON)
		{
						var tstr = scoredex + ":";
						 for (i = 1; i <= 6; i++) tstr = tstr + HSCORE[i,0] + "- " + HSCORE[i,1] + "- " + HSCORE[i,2] + "\n";
						 alert(tstr);
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
			if (this.cell(x,y) == undefined) return null;
	  var obj = this.cell(x,y).occupied[0];  // optimization - we know doors will always be first (and only) entity in a cell
			return obj && obj.door ? obj : null;
    },

    tpos: { }, // a persistent intermediate object to avoid GC allocations (caller is responsible for using result immediately and not hanging on to a reference)

    trymove: function(entity, dir, speed, ignore, dryrun, teled) {
  var collision, nocoll = true, tos = timestamp(), ttd = 1;
		if (teled != undefined) ttd = teled;
      this.tpos.x = entity.x + (isLeft(dir) ? -speed : isRight(dir) ? speed : 0) * ttd;
      this.tpos.y = entity.y + (isUp(dir)   ? -speed : isDown(dir)  ? speed : 0) * ttd;
// ttd - teleport distance used by temp teleportability device for attempt to teleport thru walls - min single wall dist is about 58
		 if (ttd > 1) { if (this.tpos.y < -5) this.tpos.y = Mth * TILE + this.tpos.y; }
// mod for lobber shot
		 if (entity.lobsht != undefined)
		 if (entity.lobsht)
		 {
// lobber shot targets direct! not always at 90 deg angle (like all other shots move)
	  var dest = 6;
// Calculate direction towards player
			if (!entity.lobnotr)
			{
		  var toX = entity.targx - entity.x;
		  var toY = entity.targy - entity.y;

// Normalize
		  var toLen = Math.sqrt((toX * toX) + (toY * toY));
				toX = toX / toLen;
				toY = toY / toLen;

// Move towards the player
				this.tpos.x = entity.x + (toX * speed);
				this.tpos.y = entity.y + (toY * speed);
				dest = distance(this.tpos.x, this.tpos.y, entity.targx, entity.targy);
			}

			 if (!entity.lobhot) nocoll = false; // no collision until hot
			 if ((tos - entity.timeout)  > 1600 || dest < 3) // lobber shot dies after # secs
			 {
					collision = true;
					nocoll = false;
			 }
		 }

		if (nocoll)		// no coll escapes collision check for lobbers
// end lobber shot
		 {
				var sendir = null;
				if (entity.player || entity.monster) sendir = entity.dir;
				collision = this.occupied(this.tpos.x + entity.cbox.x, this.tpos.y + entity.cbox.y, entity.cbox.w, entity.cbox.h, ignore || entity, sendir);
				var subcol = collision.exit;
				var ffcol = false;
// collect subcollisions for weapon non-hits
				if (collision.type != undefined) {
					if (collision.type.key != undefined) subcol = subcol || collision.type.key;
					if (collision.type.nohlp != undefined)
					{
						if (collision.type.nohlp == FFHLP) ffcol = true;
						if (collision.type.nohlp == 999 || collision.nohlp == 999) ffcol = true;	// for no collision items with no help
						if (collision.type.nohlp >= WTHLP) ffcol = true;
						if (collision.type.nohlp == STNHLP) subcol = true;
						if (collision.type.nohlp == TRPHLP) subcol = true;
						if (collision.type.nohlp == PCKLHLP) subcol = true;
					}
					if (collision.nohlp != undefined)
					if (collision.nohlp == 999) ffcol = true;	// for no collision items with no help
				}
				if (collision.pixel != undefined) {
					if (collision.pixel == 0x8120) subcol = true; // fake exit; pfi
					if (collision.pixel == 0x8125) subcol = true;	// fake key, pfi
					if (collision.pixel == 0x812e) subcol = true; // fake pickle; pfi
				}
				if (!collision.player && entity.weapon && subcol) collision = undefined;
				else if (ffcol == true)
				{
//					if (collision.pwall && collision.nohlp == 999) collision.pwall = -1;	// when ent on vacant phase wall spot, PW is temp blocked
					if (entity.player)
					{
// slow down in glue, water, etc
						if (collision.rwall && collision.nohlp == 999) collision.rwall = 0;	// when players step on vacant random wall spot, RW ends
						if (collision.type.nohlp >= WTHLP) entity.gluesp = collision.type.gluesp;
// handle tiles that do dmg - forcefield, liquids, etc
						if (collision.type.damage > 0) // dmg players in active FF
						{
							helpdis(collision.type.nohlp, undefined, 2000, collision.type.damage, undefined);
							Musicth.play(Musicth.sounds[collision.type.sound]);
							entity.hurt(collision.type.damage);
						}
// non damage tiles like water
						else if (collision.type.nohlp != FFHLP && collision.type.nohlp != 999) 		// ffdim still uses FFHLP with no dmg
						{
							helpdis(collision.type.nohlp, undefined, 2000, collision.type.damage, undefined);
							Musicth.play(Musicth.sounds[collision.type.sound]);
						}
					}
					collision = undefined;
				}

				if (entity.reflect && collision != undefined)
				{
					if (isdoor(collision.pixel) || wallcoll)
						{
						wallcoll = false;
						entity.reflect = countdown(entity.reflect);
						var rfc = entity.reflect;
						if (entity.dir === DIR.UPLEFT) {var nd = DIR.DOWNLEFT; if (Math.random() < 0.5) nd = DIR.UPRIGHT };			// iterim solution - some will reflect, and some wont
						if (entity.dir === DIR.DOWNLEFT) { nd = DIR.UPLEFT; if (Math.random() < 0.5) nd = DIR.DOWNRIGHT };
						if (entity.dir === DIR.UPRIGHT) { nd = DIR.DOWNRIGHT; if (Math.random() < 0.5) nd = DIR.UPLEFT };
						if (entity.dir === DIR.DOWNRIGHT) { nd = DIR.UPRIGHT; if (Math.random() < 0.5) nd = DIR.DOWNLEFT };
						if (entity.dir === DIR.RIGHT) nd = DIR.LEFT;
						if (entity.dir === DIR.LEFT) nd = DIR.RIGHT;
						if (entity.dir === DIR.UP) nd = DIR.DOWN;
						if (entity.dir === DIR.DOWN) nd = DIR.UP;
						Musicth.play(Musicth.sounds.bouncshot);
						entity.norelod =  true;
						entity = Mastermap.addWeapon(entity.x, entity.y, entity.owner.type.weapon, nd, entity.owner);
						entity.norelod =  true;
						entity.reflect = rfc;
					}
				}
		 }
      if (!collision && !dryrun) {
			var nx = this.tpos.x, ny = this.tpos.y;

			if (nx <= Munlx) { this.tpos.x = Munhx - ( Munlx - nx); }
			else if (nx >= Munhx) { this.tpos.x = Munlx + ( nx - Munhx ); }

			if (ny <= Munly) { this.tpos.y = Munhy - ( Munly - ny); }
			else if (ny >= Munhy) { this.tpos.y = Munly + ( ny - Munhy ); }

        this.occupy(this.tpos.x, this.tpos.y, entity);
      }
		else if (entity.ltele && ttd == 1) 
		if (dir == DIR.LEFT || dir == DIR.RIGHT || dir == DIR.UP || dir == DIR.DOWN) // not on diagonals for now
		{
			var wc = 25;
			if (wallcoll) wc = wallcoll.wall;
			if (TELEWAL[wc]) {
				collision = Mastermap.trymove(entity, dir, 1, null, false, 60);
				if (!collision) Musicth.play(Musicth.sounds.teleport);
			}
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

    overlappingCells: function(x, y, w, h, dir) {

      var cells = _overlappingCells.getcells();

      if ((x === null) || (y === null))
        return cells;

      x = Math.floor(x); // ensure working in integer math in this function to avoid floating point errors giving us the wrong cells
      y = Math.floor(y);

      var nx = ((x%TILE) + w) > TILE ? 1 : 0,
          ny = ((y%TILE) + h) > TILE ? 1 : 0;

			set_add(cells, this.cell(x, y));
			if (nx > 0)
			  set_add(cells, this.cell(x + TILE, y));
			if (ny > 0)
			  set_add(cells, this.cell(x,        y + TILE));
			if ((nx > 0) && (ny > 0))
			  set_add(cells, this.cell(x + TILE, y + TILE));
//		}
		return cells;

    },

    occupied: function(x, y, w, h, ignore, dir) {

      var cells   = this.overlappingCells(x, y, w, h,dir),
          checked = _occupied.getchecked(), // avoid checking against the same item multiple times (if that item spans multiple cells)
          cell, item,
          c, nc = cells.length,
          i, ni;
//if (!document.getElementById("noclip").checked) alert(cells.length);
      // have to check for any player FIRST, so even if player is near a wall or other monster he will still get hit (otherwise its possible to use monsters as semi-shields against other monsters)
      if ((game.player != ignore) && overlapEntity(x, y, w, h, game.player))
        return game.player;
/// TEST - remove
//var celpr = " c:";
      // now loop again checking for walls and other entities
      for(c = 0 ; c < nc ; c++) {
        cell = cells[c];

/// TEST - remove
/*
if (cell == undefined) celpr += "u:"+c;
else { celpr += c+" xy: "+ cell.x+":"+cell.y;
	if (cell.wall !== undefined && cell.wall !== null) celpr += "-bangwall:" + cell.tx+":"+cell.ty }
celpr += ", ";
//document.title = "-pl xy "+Math.round(dent.x)+":"+Math.round(dent.y)+" 2t: "+p2t(dent.x)+":"+p2t(dent.y)+" celltst: "+nc+" xy: "+Math.round(x)+":"+Math.round(y)+celpr+"  e:"+(Mtw - 1)+":"+(Mth - 1);
*/
//document.title = "-pl xy "+Math.round(dent.x)+":"+Math.round(dent.y)+" 2t: "+p2t(dent.x)+":"+p2t(dent.y)+" celltst: "+nc+" xy: "+Math.round(x)+":"+Math.round(y);
/// TEST - remove

// this is cross the unpinned edge ops code
	var n, ptw = false;
		     if (x < 7 || x > (TILE * (Mtw - 1) - 7) && dir == DIR.LEFT) { n = mpixel(x,y, x - TILE, y, 2); if (this.cells[n] != undefined) { if (this.cells[n].ptr) ptw = this.cells[n].ptr.type.wall; if (!this.cells[n].wall && !ptw) return false; }}
		else if (x < 7 || x > (TILE * (Mtw - 1) - 7) && dir == DIR.RIGHT) { ptw = false;; n = mpixel(x,y, x + TILE, y, 2); if (this.cells[n] != undefined) { if (this.cells[n].ptr) ptw = this.cells[n].ptr.type.wall; if (!this.cells[n].wall && !ptw) return false; }}
		else if (y < 7 || y > (TILE * (Mth - 1) - 9) && dir == DIR.UP) { ptw = false; n = mpixel(x,y, x, y - TILE, 2); if (this.cells[n] != undefined) { if (this.cells[n].ptr) ptw = this.cells[n].ptr.type.wall; if (!this.cells[n].wall && !ptw) return false; }}
		else if (y < 7 || y > (TILE * (Mth - 1) - 9) && dir == DIR.DOWN) { ptw = false; n = mpixel(x,y, x, y + TILE, 2); if (this.cells[n] != undefined) { if (this.cells[n].ptr) ptw = this.cells[n].ptr.type.wall; if (!this.cells[n].wall && !ptw) return false; }}

/// TEST - this will be needed because of the above code flakyness around the 0 unpin y line and some wall edges
if (document.getElementById("noclip").checked) return false;
/// TEST

// since edje walls can become exits, make sure shots expire at edge
			if (cell == undefined) {
// getting stuck with detect x = Mtw - 1, y = Mth - 2, attempt fix  -- this is a specific player gets stuck case...
				if (p2t(x) == (Mtw - 1) && p2t(y) >= (Mth - 2) && (dir == DIR.UP || dir == DIR.UPLEFT || dir == DIR.UPRIGHT)) return false;
				return true;
				}

			wallcoll = false;
			if (cell.wall !== undefined && cell.wall !== null)		{		// walls to exits sets null
//				if (mtm != "bw: "+cell.tx+":"+cell.ty) { mtm = "bw: "+cell.tx+":"+cell.ty; alert("bw: "+cell.tx+":"+cell.ty);}
				wallcoll = cell;
				return true;
				}
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
      var n, max, entity, distance, limit = TILE*player.type.magic;
		var r, r2, rn, rg, xdm = 0, xdg = 0, dmg, dgg, vdm = player.type.mind, vdg = player.type.mindg;
		if (player.xmagic)			// xtra magic boosts damages
		 {
				vdm = vdm + Math.min(player.xmagic, ppotmax);
				vdg = vdg + Math.min(player.xmagic, ppotmax);
		 }
		 if (shotpot)					// player shot potions are less powerful
		 {
				vdm = Math.max(0, (vdm - 3));
				vdg = Math.max(0, (vdg - 3));
		 }
		dmg = ABILIND[vdm];
		dgg = ABILIND[vdg];

// get chance for random boost - applied per ent below
		r = ABILRNG[vdm];
		rn = r - Math.floor(r);
		r2 = ABILRNG[vdg];
		rg = r2 - Math.floor(r2);

		helpdis(nohlpmagaff, undefined, 2000, undefined, undefined);
// potion boom
		for(n = 0, max = this.entities.length ; n < max ; n++) {
        entity = this.entities[n];
        if (entity.monster && entity.active) {
				distance = Math.max(Math.abs(player.x - entity.x), Math.abs(player.y - entity.y)); // rough, but fast, approximation for slower, sqrt(x*x + y*y)
				xdm = 0;
				if (rn > 0)
				{
						if (rn > Math.random()) xdm = Math.floor(r);
				}
				 if (distance < limit)
				if (entity.type.theif == 0 || entity.type.theif == undefined)		// magic has no effect on theif
					entity.hurt(dmg + xdm, player, true);
        }
// cataboligne - add damage to generators
        if (entity.generator && entity.active) {
				distance = Math.max(Math.abs(player.x - entity.x), Math.abs(player.y - entity.y)); // rough, but fast, approximation for slower, sqrt(x*x + y*y)
				xdg = 0;
				if (rg > 0)
				{
					if (rg > Math.random()) xdg = Math.floor(r2);
				}
				if (distance < limit)
						entity.hurt(dgg + xdg, player, true);
        }
      }							// nuke ent loop++
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
          hues = level.hued;

/// TEST - remove
		Mirx = document.getElementById("xmiror").checked;
		Miry = document.getElementById("ymiror").checked;
		Mrot = document.getElementById("rotat").checked;
		Munpinx = false;
		Munpiny = false;
		var cb = document.getElementById("xunp").checked;
		if (cb == true || level.unpinx) Munpinx = true;
		cb = document.getElementById("yunp").checked;
		if (cb == true || level.unpiny) Munpiny = true;
		var rdunpx = level.unpinx, rdunpy = level.unpiny;
		if (Mrot) { var swp = Munpinx; Munpinx = Munpiny; Munpiny = swp; rdunpx = level.unpiny; rdunpy = level.unpinx; } // rotate swaps single unpins
/// TEST - remove
		 if (level.mw == null || level.mw == undefined) { level.mw = source.width; level.mh = source.height; }
		 else { source.width = level.mw; source.height = level.mh; }
// process level colors, hue overrides, special color instructions, tile overrides
// first byte codes: xFE, xFC, xFA, xF8, xF6, xF4, xF2

// any other codes: color triple 0xFFFFFF that will load between gbas layer and gflr// process level colors, hue overrides, special color instructions, tile overrides
// first byte codes: xFE, xFC, xFA, xF8, xF6, xF4, xF2
// xFE - hues override: xFFFF: 0 - 255 interpolate to 0 - 359, byte 1 = floor/wall, byte 0 = items
// xFC - tile override: 0xF000 - extra tiles set #, x0F00 - trap code, 0xFF - lower byte floors ref, 0 is level floor
// xFA - color layer as gradient 0xFFFF gradient codes, & follow 2 triples color1 to color2
// xF8 - phase wall code #, sequential - 1st phase set, {1,2,3,4}, break (no 5) 2nd phase set, {6,7,8,9,10,11}, and on
// xF4 - trap code - trap # match 80B#, this wall or item will be removed by indicated trap
// xF - 
// any other codes: color triple 0xFFFFFF that will load between gbas layer and gflr (if used), if nothing, black will not overwrite the color
		 var dohu = false;
		if (hues.width == source.width && hues.height == source.height) dohu = true;

// while looking nice, this breaks g1 lvl 3 doors (a fix is in place, but the former broken doors, may not sound off
		if (Munpinx && (rdunpx != Munpinx)) source.width--;
		if (Munpiny && (rdunpy != Munpiny)) source.height--;

		var tw     = source.width,
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

		Mastermap = self;
		Mapdata = null;
		Huedata = null;
		Mtw = tw;
		Mth = th;
		Phasewal = [];
		Movexit  = []; Movexit[0] = undefined;

		if (dohu)
		{
			parseImage(hues, function(tx, ty, pixel, map) { return; }, self);
			Huedata = [];
			for (var n = 0 ; n < (Mtw * Mth) ; n++) Huedata[n] = Mapdata[n];

// put back for level load
			Mtw = tw;
			Mth = th ;
			self.w = Mtw * TILE;
			self.h = Mth * TILE;

			Mapdata = null;
			for(var n = 0 ; n < (Mtw * Mth) ; n++) {
				parseHue(0, 0, n);
				if (Lphase > 0)
					Phasewal[Lphase] = Lsecs;
				if (Lphase > lastphas) lastphas = Lphase;
				}
		}

// make sure mults is not undefed - later load deathmult from cooky
		Deathmult = readCookie("deathmul");
		if (Deathmult < 0 || Deathmult == null) Deathmult = 0;
		if (Masterot == undefined) Masterot = 0;
		shotpot = 0;

      parseImage(source, pMapcell, self);

      self.tw       = Mtw;
      self.th       = Mth;
      self.w        = Mtw * TILE;
      self.h        = Mth * TILE;

		if (Munpinx) { Munhx = Mtw * TILE - 1; }
		if (Munpiny) { Munhy = Mth * TILE - 12; }

		Blendcanvas1 = Game.createCanvas(TILE, TILE);
      Blendctx1    = Blendcanvas1.getContext('2d');
		Blendcanvas2 = Game.createCanvas(TILE, TILE);
      Blendctx2    = Blendcanvas2.getContext('2d');
    },

    //-------------------------------------------------------------------------

	load_cell: function(tx, ty, pixel, map) {

//      var level  = cfg.levels[Mastermap.nlevel],
//          source = level.source,
//          tw     = source.width,
//          th     = source.height,

		pMapcell(tx, ty, pixel, map, this)

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
      }
		Mastercell.ptr = entity;
      this.occupy(x, y, entity);
      entity.active = true;
		entity.to = heartbeet + wto;
		entity.numer = false; // these are a reused pool, turn this off
      entity.reflect = 0;
      entity.norelod = false;
		if (entity.type != undefined) { entity.sx = entity.type.sx; entity.sy = entity.type.sy; }
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

		 if (type.theif)
			{
				this.stolen = 0;
				this.theif       = NOSPAWNTHF;	// so placed & genned thiefs do not auto track
			}
    },

    monster: true,
    cbox:    CBOX.MONSTER,

    update: function(frame, player, map, viewport) {

// theif works offscreen
		 if (!(this.type.theif && this.theif != NOSPAWNTHF))
      // monsters dont move offscreen g1 / g2 - difficulty option
      if (viewport.outside(this.x, this.y, TILE, TILE))
        return;

      // keep reloading (if applicable)
      this.reloading = countdown(this.reloading);

      // dont bother trying to update a monster that is still 'thinking'
      if (this.thinking && --this.thinking)
        return;

      // am i going towards a live player, or AWAY from a dead one, if away, my speed should be slow (the player is dead, I'm no longer interested in him)
      var away  = !player.active(), speed;
		 if (player.linvis || player.lrepuls) away = true;		// note: for invisibility monster dir should be set random occasionally

		speed = away ? 1 : this.type.speed;

/// TEST - remove
// dev: no move
			if (document.getElementById("nommv").checked) return;
/// TEST - remove
		if (this.stun > heartbeet) return;		// make supsoc visible too

      // let travelling monsters travel
      if (this.travelling > 0)
        return this.step(map, player, this.dir, speed, countdown(this.travelling), !away);

      // otherwise find a new direction
      var dirs, n, max, psx, psy;
// theif trax
		if (this.type.theif && thieftrack > 4 && this.theif != NOSPAWNTHF)
		{
			if (thiefexit) return;
			if (this.thieftrack == undefined)
			{
				this.thieftrack = 0;
				this.stolen = 0;
			}
			psx = this.x;
			psy = this.y;
			if (!this.blocked)
			if (this.stolen > 0)
			{
					this.thcount--;
					this.thieftrack = this.thieftrack - 1;
					if (this.thcount == 5) Musicth.play(Musicth.sounds[THFTALK[Game.Math.randomInt(2, 5)]]);
					if (this.thieftrack == 15) Musicth.play(Musicth.sounds[THFTALK[Game.Math.randomInt(0, 1)]]);
					if (this.thieftrack < 2)
					{
							stolen_load = this.stolen;
							Mastermap.remove(this); // theif escaped
							helpdis(nohlpinl, undefined, 2000, undefined, undefined);
					}
					this.x = THIEFTRX[this.thieftrack];
					this.y = THIEFTRY[this.thieftrack];
			}
			else
			{
					this.thieftrack = this.thieftrack + 1;
					if (this.thieftrack >= thieftrack) this.thieftrack = thieftrack - 1;
					this.x = THIEFTRX[this.thieftrack];
					this.y = THIEFTRY[this.thieftrack];
			}
			Mastermap.occupy(this.x, this.y, this);		// allow spawn theif to collide / be shot
// theif need collision detect
			this.blocked = false;

			collision = Mastermap.occupied(this.x, this.y, this.w, this.h, this);
			if (collision.player)
// theif could have "hookshot" method here - increase dist
			if (distance(this.x,this.y,collision.x,collision.y) < 20)
					publish(EVENT.MONSTER_COLLIDE, this, collision);

/* this does not seem to work as expected - theif passes most monsters and when he gets stuck, he doesnt kill the monster
			if (collision.monster) {
				this.blocked = true;
				collision.hurt(this.type.damage, this);
				}*/

			if (collision.type != undefined)
			if (collision.type.pushwal) {
				this.blocked = true;
				collision.hurt(this.type.damage, this);
				}

// point theif the right way
			this.dir = THFDIR[(Math.sign(this.y - psy) + 1)][(Math.sign(this.x - psx) + 1)];
		}
		else
		{
			this.lobrev = false; // dont let player close inside lob distance if poss
			if (this.type.name == "lobber") {
					this.firedist = distance(this.x, this.y, player.x, player.y);
					if (this.firedist < 110) { this.lobrev = 2; if (this.vx || this.vy) this.lobrev = 4; } //move back -- but in vx / vy reverse zone move back is move fwd
					else if (this.firedist < 200) this.lobrev = 1; // stop, face player
				}
	  var vec = this.directionTo(player, away);
			dirs = PREFERRED_DIRECTIONS[vec];
			if (this.vx && !this.vy && this.lobrev != 4) {
				if (vec == DIR.LEFT || vec == DIR.RIGHT) dirs = RV_PREFERRED_DIRECTIONS[vec];
				if (vec == DIR.UPLEFT) dirs = PREFERRED_DIRECTIONS[DIR.UPRIGHT];
				if (vec == DIR.UPRIGHT) dirs = PREFERRED_DIRECTIONS[DIR.UPLEFT];
				if (vec == DIR.DOWNLEFT) dirs = PREFERRED_DIRECTIONS[DIR.DOWNRIGHT];
				if (vec == DIR.DOWNRIGHT) dirs = PREFERRED_DIRECTIONS[DIR.DOWNLEFT];
				}
			if (!this.vx && this.vy && this.lobrev != 4) {
				if (vec == DIR.UP || vec == DIR.DOWN) dirs = RV_PREFERRED_DIRECTIONS[vec];
				if (vec == DIR.UPLEFT) dirs = PREFERRED_DIRECTIONS[DIR.DOWNLEFT];
				if (vec == DIR.UPRIGHT) dirs = PREFERRED_DIRECTIONS[DIR.DOWNRIGHT];
				if (vec == DIR.DOWNLEFT) dirs = PREFERRED_DIRECTIONS[DIR.UPLEFT];
				if (vec == DIR.DOWNRIGHT) dirs = PREFERRED_DIRECTIONS[DIR.UPRIGHT];
				}
			if ((this.vx && this.vy || this.lobrev == 2)  && this.lobrev != 4) dirs = RV_PREFERRED_DIRECTIONS[vec];

			for(n = 0, max = dirs.length ; n < max ; n++) {
				if (this.lobrev == 1) speed = 0;
			  if (this.step(map, player, dirs[n], speed, n < 2 ? 0 : this.type.travelling * (n-2), !away))
				 return;
			}
// lets see if stationary lobbers can fire
		this.firedist = distance(this.x, this.y, player.x, player.y);	// distance to target & pos for wep tracking (mostly lobbers)
		if (this.type.weapon != undefined)
		if (this.type.weapon.lobsht && this.firedist > 90  && this.firedist < 300) {

			if (this.lobrev < 2 && allowfire && this.type.weapon && this.fire(map, player)) {
				 this.thinking   = this.type.thinking;
				 this.travelling = 0;
			  }
		  }

      }

    },

    step: function(map, player, dir, speed, travelling, allowfire) {
      var collision = map.trymove(this, dir, speed * slowmonster);
  var lob = false;
		this.firedist = distance(this.x, this.y, player.x, player.y);	// distance to target & pos for wep tracking (mostly lobbers)
		this.targx = player.x;
		this.targy = player.y;
// lobber always has chance at shot
		if (this.type.weapon != undefined)
		if (this.type.weapon.lobsht && this.firedist > 90 && this.lobrev < 2) lob = true;
      if (!collision || lob) {
        this.dir = dir;
// need to improve lobber hitability - when close to player, shots always miss
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

/// TEST - remove
// dev: no move
			if (document.getElementById("nommv").checked) return;
/// TEST - remove
		if (this.stun > heartbeet) return;		// make supsoc visible too
      // if we couldn't move in that direction at full speed, try a baby step before giving up
      if (speed > 1)
        return this.step(map, player, dir, 1, travelling, allowfire);

      this.thinking   = this.type.thinking;
      this.travelling = 0;
      return false;
    },


    fire: function(map, player) {
      var dx, dy, dd, lob = false;
      if (this.type.weapon) {
        if (!this.reloading) {
          dx = Math.abs(p2t(this.x) - p2t(player.x));
          dy = Math.abs(p2t(this.y) - p2t(player.y));
          dd = Math.abs(dx-dy);
// lobber can fire if blocked
			  if ((this.type.weapon.lobsht) && (dd < 10) && (Math.random() < 0.35)) lob = true;

          if ( lob || (((dx < 2) && isVertical(this.dir))   ||
              ((dy < 2) && isHorizontal(this.dir)) ||
              ((dd < 2) && isDiagonal(this.dir)))) {
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
				createCookie("deathmul", Deathmult,7777);
				document.getElementById('scrmult3').innerHTML = Deathscore[Deathmult]+"- Score";
				return;
		 }
      if (nuke && this.type.canbehit == 2) // death nuked
		 {
				this.health = Math.max(0, this.health - damage);
				if (this.health > 0) return;
				var re = Mastermap.addFx(this.x, this.y, FX.NUMER);
				if (re != null) {
					re.sy = re.type.sy + Deathnote[Deathmult];
					re.numer = true; // special display class because of sprite render using entity.type.sy instead of entity.sy
				}
				this.die(by.player ? by : by.weapon && by.type.player ? by.owner : null, nuke);
				by.addscore(Math.floor( (Deathscore[Deathmult] - 1) /  (by.scmult > 1 ? 1.33333 : 1) ) );
				return;
		 }
      if (nuke && this.type.twopot) // angry pickle (acid blob) nuked
		 {
				if (this.stun < heartbeet || this.stun == undefined) { this.stun = heartbeet + 10; return; }

				if (this.type.twopot > 1) return; // IT can not be killed with 2 pots, but one stuns
				var re = Mastermap.addFx(this.x, this.y, FX.NUMER);
				if (re != null) {
					re.sy = re.type.sy + this.type.scorefx;
					re.numer = true; // special display class because of sprite render using entity.type.sy instead of entity.sy
				}
				this.die(by.player ? by : by.weapon && by.type.player ? by.owner : null, nuke);
				by.addscore(Math.floor( this.type.score /  (by.scmult > 1 ? 1.33333 : 1) ) );
				return;
		 }

      if ((by.weapon && this.type.canbeshot) || (by.player && this.type.canbehit) || (by == this) || nuke) {
        this.health = Math.max(0, this.health - damage);

			var lvl = Math.max(0, Math.ceil(this.health / 10));
			var monlvl = this.type.mlvl[lvl];
			this.type = MONSTERS[monlvl];

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
		if (this.type.invisibility != undefined)
      if (this.type.invisibility && ((frame+this.df)%(this.type.invisibility.on + this.type.invisibility.off) < this.type.invisibility.on))
        return false;

		if (this.type.name == "IT") { this.frame =  animate(frame, this.type.fpf, this.type.frames); return; }
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
      if (viewport.outside(this.x, this.y, TILE, TILE))
        return;

/// TEST - remove
// dev: no gen
			if (document.getElementById("nogen").checked) return;
/// TEST - remove

      var pos;
      if ((this.count < this.type.max) && (--this.pending <= 0)) {
        pos = map.canmove(this, Game.Math.randomInt(0,7), TILE);
        if (pos) {
          map.addMonster(pos.x, pos.y, this.mtype, this);
          this.count++;
          this.pending = Game.Math.randomInt(1, this.type.speed);
			this.pending = this.pending + 10 * Math.ceil(Math.max(-6,(def_diff - diff_level)));
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
		 var lvl = Math.max(0, Math.ceil(this.health / 10));
      this.frame = lvl - 1;		//(2 - Math.floor(3 * (this.health / (this.type.health + 1))));
		var genlvl = this.type.glvl[lvl];
		this.mtype = MONSTERS[genlvl];
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
		 if ( this.type.lobsht == undefined) this.lobsht = false;
		 else {
			 this.lobsht = true;
			this.targx = owner.targx;
			this.targy = owner.targy;
			this.lobnotr = false;
			if (Math.random() < 0.11) this.lobnotr = true; // occasionally fire a non tracker
			this.lobhot = false;	// shot wont hit until "hot"
			}
		 this.to = heartbeet;		// measure seconds weapon is flying
		 this.timeout = timestamp();
    },

    weapon:   true,
    temporal: true,
    cbox:     CBOX.WEAPON,

    update: function(frame, player, map, viewport) {

		var xspd = 0;
		if (this.xshotspd) xspd = 10;

      var collision = map.trymove(this, this.dir, this.type.speed + xspd, this.owner);
      if (collision) {
			if (!this.type.monster && !this.norelod)
				this.owner.reloading = countdown(this.owner.reloading, this.type.reload * 0.8); // speed up reloading process if previous weapon hit something, makes player feel powerful
        publish(EVENT.WEAPON_COLLIDE, this, collision);
      }
    },

    onrender: function(frame) {
		var tos = timestamp();
// animate lobber shot
		 if (this.lobsht != undefined)
		 if (this.lobsht)
		 {
				this.lobdist = distance(this.x, this.y, this.targx, this.targy);
				if (this.lobdist < LOBBERFUSE) this.lobhot = true; // can now hit
				this.frame = Math.floor((tos - this.timeout) / 100);
				if (this.frame > 9) this.frame = 8;
		 }
		 else
      this.frame = this.type.rotate ? animate(frame, this.type.fpf, 8) : this.dir;
		if (this.lsuper) this.frame = SUPERSHTFR;
		 if (this.to < heartbeet) Mastermap.remove(this);		// should either be: a. timestamp() test - b. distance test
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

    hurt: function(damage, by, nuke) {
		 if (this.stun > heartbeet) return;
		 var reret = true; // early return
		 if (by.weapon && (this.type.canbeshot == 2 ||(this.type.canbeshot == 3 && by.lsuper)) && !nuke) {
			 var regud = false, rx, ry;
				if (this.type.wall)
				{
						reret = false;
						if (this.pixel == INVSWALCD)
							helpdis(IVWSHLP, undefined, 2000, undefined, undefined);
						else
						if (this.type.nohlp == FITCH) {	// diff msg when shooting fake items
							helpdis(FICBS, undefined, 2000, undefined, undefined);
							reret = true;
							}
						else
							helpdis(this.type.nohlp, undefined, 2000, undefined, undefined);
						 if (this.health == undefined) this.health = this.type.health;
						 this.health = Math.max(0, this.health - damage);
						 if (this.health > 0) return;
						Musicth.play(Musicth.sounds[this.type.sound]);
						if (this.type.gud > 0) {regud = true; rx = this.x; ry = this.y; }
				}
				else
				if (this.type.health)
				{
// pushwalls do not set health on spawn
						if (this.type.pushwal)
						{
							if (this.health == undefined) this.health = this.type.health;
							this.health = this.health - damage;
							if (this.health <= 10) helpdis(PSWDHLP, undefined, 2000, undefined, undefined);
							if (this.health > 0) return;
						}
						else
						if (HELPCLEAR[nohlpdsf])		// pre-test so we can run taunts when the helpannc is done
								helpdis(nohlpdsf, undefined, 2000, undefined, undefined);
						else
						{
								var r = Game.Math.randomInt(0, 5);			// shot food taunts
								switch(r) {
										case 0: Musicth.play(Musicth.sounds.anceyf);
												break;
										case 1: Musicth.play(Musicth.sounds.ancstf);
														  Musicth.play(Musicth.sounds[by.owner.type.annc]);
												break;
										case 2: Musicth.play(Musicth.sounds.ancfoodsh);
												break;
										case 3: Musicth.play(Musicth.sounds.ancssfood);
												break;
								}
						}
				}
			 shotpot = 1;	// shot potions are weaker
				if (this.type.potion)
				{
						if (HELPCLEAR[nohlpsap])
								helpdis(nohlpsap, undefined, 2000, undefined, undefined);
						else
						{
								var r = Game.Math.randomInt(0, 5);
								switch(r) {
										case 0: Musicth.play(Musicth.sounds.ancyjsp);
												break;
										case 1: Musicth.play(Musicth.sounds.ancstp);
														  Musicth.play(Musicth.sounds[by.owner.type.annc]);
												break;
										case 2: Musicth.play(Musicth.sounds.ancpotsh);
												break;
								}
						}
						Mastermap.nuke(null, by.owner);
						Musicth.play(Musicth.sounds.nuke);
				}
				if (this.type.poison)
				{
						Musicth.play(Musicth.sounds.slopoisn);
						slowmonstertime = slowmonstertime + 30;
						slowmonster = 0.5;
						helpdis(nohlppois, undefined, 2000, undefined, undefined);
				}
				shotpot = 0;
				var n = p2t(this.x) + (p2t(this.y) * Mtw), ctx = reloaded.cells[n].ctx;
				Mapdata[n] = 0xa08060;
				Mastermap.remove(this);
				if (reret) return; // dont remap anything but shotwalls
				rewall(Mastermap);
				tilerend.maptiles(Mastermap, ctx);		// this redraws the background
				reloaded.cells[n].ptr = null;
				if (regud) {		// shoot wall get item
					var cell = reloaded.cells[p2t(rx) + (p2t(ry) * Mtw)];
					rlitem(rlswall, 0.15, cell);
					Mastercell.ptr.stun = heartbeet + 2;
					cell.ctx = ctx;
					}
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
    cbox: CBOX.EXIT

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
/// TEST - remove
var txsv = ":";

  var Player = Class.create({

    initialize: function() {

      subscribe(EVENT.START_LEVEL, this.onStartLevel.bind(this));

      this.canvas = Game.createCanvas(STILE + 2*FX.PLAYER_GLOW.border, STILE + 2*FX.PLAYER_GLOW.border);
      this.ctx    = this.canvas.getContext('2d');
      this.cells  = []; // entities track which cells they currently occupy

// init some control code
		this.pushwal = null;
		this.stun = 0;
		 stalling = 0;
		 doorstalled = DOORSTALL;
    },

    player: true,
    cbox:   CBOX.PLAYER,

    active: function() { return !this.dead && !this.exiting; },

    join: function(type) {
      this.type      = type;
      this.sx        = type.sx;
      this.sy        = type.sy;
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
		this.ctr = 0;				// collected treasures
		this.msgtimer = 0;				// message timer for repeat msgs
		Mastermult = 1;
      this.dir       = Game.Math.randomInt(0, 7);
      this.health    = type.health;
      this.coins    = type.coins;
		this.droppedcoins = 1;
      publish(EVENT.PLAYER_JOIN, this);

// clear video - in case it was playing, this is a seperate element that needs turned off
			var vid = document.getElementById("introvid");
			vid.load();
			vid.pause();
			vid.style.visibility = "hidden";
// some help msgs pair with announcer dialog
			HELPANNC[9] = Musicth.sounds.anchidpot;
			HELPANNC[14] = Musicth.sounds.anctrs;
			HELPANNC[18] = Musicth.sounds.anckeys;
			HELPANNC[19] = Musicth.sounds.ancpots;
			HELPANNC[20] = Musicth.sounds.anctraps;
			HELPANNC[21] = Musicth.sounds.ancfoodsh;
			HELPANNC[22] = Musicth.sounds.ancpotsh;
			HELPANNC[26] = Musicth.sounds.ancwaldes;
			HELPANNC[28] = Musicth.sounds.ancfindex;
			HELPANNC[36] = Musicth.sounds.ancbeware;
			HELPANNC[37] = Musicth.sounds.ancsorc;
			HELPANNC[39] = Musicth.sounds.anckilthf;
			HELPANNC[56] = Musicth.sounds.g2antrlok;
			HELPANNC[58] = Musicth.sounds.ancfooled;
			HELPANNC[76] = Musicth.sounds.g2aninvw;
// treasure room count down
			TROOMCNT[0] = Musicth.sounds.anc0;
			TROOMCNT[1] = Musicth.sounds.anc1;
			TROOMCNT[2] = Musicth.sounds.anc2;
			TROOMCNT[3] = Musicth.sounds.anc3;
			TROOMCNT[4] = Musicth.sounds.anc4;
			TROOMCNT[5] = Musicth.sounds.anc5;
			TROOMCNT[6] = Musicth.sounds.anc6;
			TROOMCNT[7] = Musicth.sounds.anc7;
			TROOMCNT[8] = Musicth.sounds.anc8;
			TROOMCNT[9] = Musicth.sounds.anc9;
			TROOMCNT[10] = Musicth.sounds.anc10;

			for (var c = 0; c < 100; c++) HELPCLEAR[c] = 1;	// option here would zero to turn off tutorial msgs
    },

    leave: function() {
      publish(EVENT.PLAYER_LEAVE, this);
    },

    onStartLevel: function(map) {
			if (!fndstart)		// the map has no start - may be a "random" rogue style map - add random start
			{
						var cell, cells  = reloaded.cells;
						var c, nc = cells.length, fnd = 0, sft = 6000;
						while (!fnd && (sft > 0))
						{
								c = Game.Math.randomInt(0,nc - 1);
								cell = cells[c];
								fnd = isfloor(cell.pixel);
								if (cell.loaded != undefined) fnd = false;		// for some reason the .occupied() fn fails here, so we do our own thing
								sft--;
						}
						if (fnd)
						{
								reloaded.start = { x: cell.x, y: cell.y }
								cell.loaded = true;
								if (thieftrack === 0)
								{
										THIEFTRX[thieftrack] = cell.tx;
										THIEFTRY[thieftrack] = cell.ty;
										thieftrack++;
								}
						}
					fndstart = true;
			}
      map.occupy(map.start.x, map.start.y, this);
// original code cleared keys every level - set PLAYMODE detect here
//      this.keys    = DEBUG.KEYS || 0;
      this.dead    = false;
      this.exiting = false;


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
			doorstalled = DOORSTALL;
			if (this.keys) doorstalled = KEYSTALL;	// stalling doors out takes longer if player is holding keys
			return; // can't fire and move at same time
      }

      if (is.invalid(this.moving.dir))
        return;

		stalling = 0; // reset on player move
		doorstalled = DOORSTALL;
		if (this.keys) doorstalled = KEYSTALL;

      var d, dmax, dir, collision,
          directions = SLIDE_DIRECTIONS[this.moving.dir];

		var pushspeed = 1;
		if (this.pushwal != undefined) pushspeed = this.pushwal.speed;
		if (this.gluesp == undefined) this.gluesp = this.type.gluesp;

      for(d = 0, dmax = directions.length ; d < dmax ; d++) {
        dir = directions[d];
// player trying to cross unpinned edge
/// TEST - remove
//dent = this;
//document.title = "-pl xy "+Math.round(this.x)+":"+Math.round(this.y)+" 2t: "+p2t(this.x)+":"+p2t(this.y);
/// TEST - remove

        collision = map.trymove(this, dir, (this.type.speed * pushspeed * this.gluesp) + (this.xspeed * 30)/FPS);

/// TEST - remove
//txsv = Math.floor(this.x) +"," + Math.floor(this.y) + " map: " + Math.floor(map.w) +"," + Math.floor(map.h);
//txsv = txsv.substring(0,100);
//document.title = "-pl  "+txsv;
///
		  if (this.pushwal != undefined)
		  if (collision == this.pushwal) collision = false;

// psuhwall mover
			if (this.pushwal != null)
			if (pmvx != this.x || pmvy != this.y)
			{
				var pushd = this.dir;
				if (this.pushwal.dir == 0 && pushd == 7) pushd = 1;
				if (this.pushwal.dir == 7 && pushd == 0) pushd = 6;
				if (Math.abs(this.pushwal.dir - pushd) > 1) {
					Mastermap.occupy(this.pushwal.x, this.pushwal.y, this.pushwal);
					this.pushwal = null;
				}
				else
				{
					this.pushwal.x = this.pushwal.x + (this.x - pmvx);
					this.pushwal.y = this.pushwal.y + (this.y - pmvy);

					pmvx = this.x;
					pmvy = this.y;
				}
			}

        if (collision)
          publish(EVENT.PLAYER_COLLIDE, this, collision); // if we collided with something, publish event and then try next available direction...
		else
					return; // ... otherwise we moved, so we're done trying
      }

    },

    collect: function(treasure) {

// wall adjust
      var level  = cfg.levels[Mastermap.nlevel],
          source = level.source,
          tw     = Mtw; //source.width,
          th     = Mth; //source.height;
		var cen = Math.floor(this.health / 100) * 100,
			 dec = Math.floor((this.health - cen) / 10),
			 ons = this.health - cen - (dec * 10),
			 od = (dec % 2 === 1);

      if (treasure.type.pushwal)
		 {
				helpdis(treasure.type.nohlp, undefined, 2000, undefined, undefined);
				treasure.cbox = CBOX.MONSTER;	// slim box a bit

				if (this.pushwal != treasure) {
					this.pushwal = treasure;
					pmvx = this.x;
					pmvy = this.y;
					treasure.speed = PWALLSPD;		// slow a pushing player
					treasure.dir = this.dir;	// stay with player while he pushes towards block
				}
				return; //push wall, go back
		 }

      if (treasure.type.wall)
		 {
				if (treasure.pixel == INVWALCD)
					helpdis(IVWHLP, undefined, 2000, undefined, undefined);
				else
				if (treasure.type.sy == FAKES) helpdis(treasure.type.nohlp, undefined, 2000, undefined, undefined);
				return; //shot wall, go back
		 }
// shotwall gud & locked chest need wait on touch or activation of item
		 if (treasure.stun > heartbeet) return;

		 if ((treasure.pixel & MEXHIGH) == FFIELDTILE)
		 {
// technically this no longer happens as collisions are blocked so fields can be walked over
// future plans include blue field gen pillars that make an unpassable lightning fence
				if ((treasure.pixel & MEXLOW) > 3)		// MEXLOW 0 - 3 are pillars
				{
					helpdis(treasure.type.nohlp, undefined, 2000, treasure.type.damage, undefined);
					Musicth.play(Musicth.sounds.ffield);
					this.hurt(treasure.type.damage);
				}
				return; //field wall, go back
		 }

		if ((troomtime > 0) && treasure.type.troom)
			this.ctr = this.ctr + (treasure.type.score / 100);
		else
		 {
				var rlk = -1;
				if (treasure.type.lock)
				{
					var cell = reloaded.cells[p2t(treasure.x) + (p2t(treasure.y) * Mtw)];
					var ctx = cell.ctx;
					rlk = rlitem(rllock, 0.21, cell);
					Mastercell.ptr.stun = heartbeet + 2;
					cell.ctx = ctx;
					this.keys = countdown(this.keys);
				}
				if (rlk < 0) {	// if lock chest empty, get 500 pts
				this.addscore(treasure.type.score);
				if (treasure.type.score == 100 || treasure.type.score == 500)
				{
					var tp = tp100;
					if (treasure.type.score == 500) tp = tp500;
					var re = Mastermap.addFx(treasure.x, treasure.y, FX.NUMER);
					if (re != null) {
						re.sy = re.type.sy + tp;
						re.numer = true;
					}
				}}
// score multiplier
				if (treasure.type.scmult)
				 {
						this.scmult = Mastermult + treasure.type.scmult;
// diff level affects mult - mult cant be more than 1 for diff 1 & 2, 2 for diff 3 & 4, 3 for diff 5 & 6
						var dlim = Math.ceil(diff_level / 2)
						if (diff_level < def_diff)
						if (this.scmult > dlim) this.scmult = dlim;
// max (hard coded for now) mult is 4.9 - if you can hit that, you can get 4.5 on a treasure bag
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
		 }

		 var hrp = undefined;
		 if (treasure.type.nohlp == RNDHLP) {
// "odd five, even seven" - give 200 health
			 if ((od && ons == 5) || (!od && ons == 7)) treasure.type.health = 200;
			 else treasure.type.health = 50 + Game.Math.randomInt(1,2) * 50;

			}
		 if (treasure.type.health > 0) hrp = treasure.type.health;
		 if (!treasure.type.damage) {
			 helpdis(treasure.type.nohlp, undefined, 2000, hrp, undefined);
			 if (treasure.type.blkhlp != undefined) HELPCLEAR[treasure.type.blkhlp] = 0;
		 }

		 if (treasure.type.stun)
			this.stun = 4;

		 if (treasure.type.teleport) {
				var cells   = reloaded.cells,
					 walled, cell, c, nc = cells.length, tdist = 100000, cdist, destcell, ldestcell, swapcell,
					mxdir = 7, tdir, ddir = this.moving.dir;

				if (ddir < 0 || ddir > 7) ddir = 0;

				// now loop checking for all teleporters
				for(c = 0 ; c < nc ; c++) {
						cell = cells[c];
						if (cell.pixel == TELEPORTILE)
						if (Math.abs(treasure.x - cell.x) > 33 ||  Math.abs(treasure.y - cell.y) > 33)		// find closest teleport not origin
						{
							cdist = distance(cell.x,cell.y,treasure.x,treasure.y);
// cross the unpin lines...
							var bdist1, tpx = treasure.x, tpy = treasure.y, cpx = cell.x, cpy = cell.y;		// measure dest tele to line
							var bdist2, ttx = treasure.x, tty = treasure.y, ctx = cell.x, cty = cell.y;		// measure src  tele to line

							if (cell.ptr.vx || cell.ptr.vy && !game.viewport.outside(cell.x, cell.y, TILE, TILE)) {
								if (cell.ptr.vx < 0) { tpx = Mtw * TILE; ctx = 0; }
								if (cell.ptr.vx > 0) { tpx = 0; ctx = Mtw * TILE; }
								if (cell.ptr.vy < 0) { tpy = Mth * TILE; cty = 0; }
								if (cell.ptr.vy > 0) { tpy = 0; cty = Mth * TILE; }
								bdist1 = distance(cpx,cpy,tpx,tpy); bdist2 = distance(ctx,cty,ttx,tty);
								if ((bdist1 + bdist2) < cdist) cdist = bdist1 + bdist2;
								}

							if (cdist < tdist)
							{
									tdist = cdist;
									ldestcell = destcell;
									destcell = cell;
							}
						}
				}
				if (Math.random() < 0.1) // swap last 2
				{
					swapcell = destcell;
					if (ldestcell != undefined) destcell = ldestcell;
					ldestcell = swapcell;
				}
						if (destcell != undefined)
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
// make sure it isnt a wall
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
// - telefrag monsters / death
								if (isp(tcell.pixel, PIXEL.MONSTER))
									if (tcell.ptr != undefined)
									if (tcell.ptr.hurt != undefined) {
											var tfrag = 10000;
											if (tcell.ptr.health != undefined) tfrag = tcell.ptr.health+10;
											tcell.ptr.hurt(tfrag, tcell.ptr);
									}
								Mastermap.occupy(px, py, this);

/// TEST - remove
//createCookie("_t_"+Math.round(destcell.ptr.vx)+"_"+Math.round(destcell.ptr.vy), "telepad",0);
								if (!walled) Musicth.play(Musicth.sounds.teleport);
								walled = true;
						}
				return;
		 }

		 if (treasure.type.trap) {
				var cells   = reloaded.cells,
					 cell, c, nc = cells.length, walled, ctx = null;

				// now loop again checking for all trap walls
				for(c = 0 ; c < nc ; c++) {
					cell = cells[c];
					if (cell.ctx && ctx == null) ctx = cell.ctx;
					if (cell.wall !== undefined && cell.wall !== null)
					 {
							  if ((cell.pixel & MEXHIGH) == TRAPWALL && ((cell.pixel & MEXLOW) == (treasure.pixel & MEXLOW)))
								{
										var gimg = document.getElementById("gfloor");
										if (!walled) Musicth.play(Musicth.sounds.wallexit);

										cell.wall = undefined;	// so we dont fire these wall segs again
										cell.pixel = 0xa08060;	// need to be floor value correct?
										Mapdata[c] = cell.pixel;
										walled = true;
								}
					 }
					if (cell.pixel == treasure.pixel)		// remove matching trap
					 {
						 if (cell.ptr);
							Mastermap.remove(cell.ptr);
					 }
				}
				rewall(Mastermap);
				tilerend.maptiles(Mastermap, ctx);		// this redraws the background
		 }

		var powerp = 0, limitp = 0;
      if (treasure.type.powers)		// special power potions, limited items
		 {

				if (treasure.type == TREASURE.XSPEED && !this.xspeed) {this.xspeed++; powerp++;}
				if (treasure.type == TREASURE.XSHOTPWR && !this.xshotpwr) {this.xshotpwr++; powerp++;}
				if (treasure.type == TREASURE.XSHOTSPD && !this.xshotspd) {this.xshotspd++; powerp++;}
				if (treasure.type == TREASURE.XARMOR && !this.xarmor) {this.xarmor++; powerp++;}
				if (treasure.type == TREASURE.XFIGHT && !this.xfight) {this.xfight++; powerp++;}
				if (treasure.type == TREASURE.XMAGIC && !this.xmagic) {this.xmagic++; powerp++; if (this.type.name == "wizard") this.potions++;}

// plan: these need either put in type or somehow made code adjustable or both
				if (treasure.type == TREASURE.LIMINVIS) {this.linvis = this.linvis + 30; limitp++;}
				if (treasure.type == TREASURE.LIMINVUL) {this.linvuln  = this.linvuln + 30; limitp++;}
				if (treasure.type == TREASURE.LIMREPUL) {this.lrepuls = this.lrepuls + 30; limitp++;}
				if (treasure.type == TREASURE.LIMREFLC) {this.lreflect++; limitp++;}
				if (treasure.type == TREASURE.LIMSUPER) {this.lsuper = this.lsuper + 10; limitp++;}
				if (treasure.type == TREASURE.LIMTELE) {this.ltele++; limitp++;}
				if (treasure.type == TREASURE.LIMANK) {this.lank = this.lank + 60; limitp++;}

				if (powerp > 0 || limitp > 0)
				{
						Musicth.play(Musicth.sounds[this.type.annc]);
						Musicth.play(Musicth.sounds.ancnhs);
						Musicth.play(Musicth.sounds[treasure.type.annc]);
				}
		 }
      if (treasure.type.potion && powerp < 1)
        this.potions++;
      else if (treasure.type.key)
        this.keys++;
      else if (treasure.type.health)
		{
        this.heal(treasure.type.health);
			if (treasure.type.nohlp == 16) // record for eaten all food lately taunt, & rnd on 3 eats
			{
					whohaseaten[haseatenall++] = this;
					if (haseatenall > 2)
					{
							if (whohaseaten[0] === whohaseaten[1] && whohaseaten[1] === whohaseaten[2])
							if (Math.random() < haseatenplay)
							{
									Musicth.play(Musicth.sounds.anchasetn);
									Musicth.play(Musicth.sounds[this.type.annc]);
							}
							while (haseatenall > 0) whohaseaten[haseatenall--] = haseatenall;
							haseatenall = 0;
					}
			}
		}
      else if (treasure.type.damage)
		{
			if (treasure.type.poison) this.poison = POISONTM;
			document.getElementById(this.type.name+"poison").src = "images/poison.png";
			if (treasure.pixel == 0x8011) document.getElementById(this.type.name+"poison").src = "images/poisonf.png";
			helpdis(treasure.type.nohlp, undefined, 2000, treasure.type.damage, undefined);
			this.hurt(treasure.type.damage);
		}
      publish(EVENT.TREASURE_COLLECTED, treasure, this);
    },

    exit: function(exit) {
      if (!this.exiting) {
//        this.health  = this.health + (this.health < this.type.health ? 100 : 0);		/// RUNORG - gauntlet no do this
        this.exiting = { max: exit.type.speed, count: exit.type.speed, fpf: exit.type.fpf, dx: (exit.x - this.x), dy: (exit.y - this.y) };
			levelplus = exit.type.lvlp;
        publish(EVENT.PLAYER_EXITING, this, exit);
      }
    },

    fire:      function(on) { this.firing       = on;   },
    moveUp:    function(on) { this.moving.up    = on; if (this.poison > 0 && Math.random() < POISONDIZ) { if (Math.random() < 0.66) this.moving.left = this.moving.left ? false : this.poison; else this.moving.right = this.moving.right ? false : this.poison; if (Math.random() < 0.16) this.moving.up    = this.moving.up    ? false : this.poison; }; this.setDir(); },
    moveDown:  function(on) { this.moving.down  = on; if (this.poison > 0 && Math.random() < POISONDIZ) { if (Math.random() < 0.66) this.moving.left = this.moving.left ? false : this.poison; else this.moving.right = this.moving.right ? false : this.poison; if (Math.random() < 0.16) this.moving.down  = this.moving.down  ? false : this.poison; }; this.setDir(); },
    moveLeft:  function(on) { this.moving.left  = on; if (this.poison > 0 && Math.random() < POISONDIZ) { if (Math.random() < 0.66) this.moving.up   = this.moving.up ? false : this.poison;   else this.moving.down  = this.moving.down  ? false : this.poison; if (Math.random() < 0.16) this.moving.left  = this.moving.left  ? false : this.poison; }; this.setDir(); },
    moveRight: function(on) { this.moving.right = on; if (this.poison > 0 && Math.random() < POISONDIZ) { if (Math.random() < 0.66) this.moving.up   = this.moving.up ? false : this.poison;   else this.moving.down  = this.moving.down  ? false : this.poison; if (Math.random() < 0.16) this.moving.right = this.moving.right ? false : this.poison; }; this.setDir(); },
    coindrop: function() {
		 if (this.coins > 0)
		 {
				this.heal(this.type.health);
				this.coins--;
				this.droppedcoins++;
				Musicth.play(Musicth.sounds.coindrp);
		 }
	},

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
		if (automatic || (this.linvuln < 1))
      if (this.active() && !DEBUG.NODAMAGE) {
        damage = automatic ? damage : damage/(this.type.armor + this.xarmor);
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
      if ((frame % (FPS/1)) === 0) {

/// TEST - update
		this.hue = document.getElementById("phue").value;
/// TEST - update

// this is game 1 second interval pulse - prob should be on a timer
			heartbeet += 1;

			this.gluesp = 1;	// glue slow is reset here, mr burton
// poisoned -- woozy controls turn off here
			if (this.poison > 0) {
// poison confuses controls by activating them - because it wasnt a button press, we need to turn it back off a second later
				if (this.moving.left == this.poison) this.moving.left = false;
				if (this.moving.right == this.poison) this.moving.right = false;
				if (this.moving.up == this.poison) this.moving.up = false;
				if (this.moving.down == this.poison) this.moving.down = false;
				this.setDir();
				this.poison--; // count down poison effect
			}

			if (!document.getElementById("nommv").checked)
			{
// pass 1 - change walls
			for(n = 0, nc = Mastermap.entities.length ; n < nc ; n++) {
					  entity = Mastermap.entities[n];
					var r = mpixel(entity.x,entity.y, entity.x,entity.y , 2);
// random walls
					if (entity.rwall)
					if (Math.random() < 0.45) {
//						wallupd = true;
						if (entity.nohlp == 999) { Mapdata[r] = entity.pixel; entity.nohlp = 0; entity.sy = entity.svsy; }
						else { entity.nohlp = 999; entity.sy = INVWALSY; entity.sx = INVWALA; if (Mastermap.cells != undefined) Mapdata[r] = Mastermap.cells[r].ihpixel; else Mapdata[r] = 0xA08060; }
						}
					if (entity.pwall && entity.hb < heartbeet) {
						var n2 = p2t(entity.x) + p2t(entity.y) * Mtw;
						parseHue(0, 0, n2);
						entity.pwall++;
						if (Phasewal[entity.pwall] == undefined) { if (entity.pwall == 2) altphas = true; entity.pwall = 1; }
//						if (Phasewal[entity.pwall] == undefined) continue;
//						var pw = entity.pwall;
						if (Lphase == entity.pwall || (altphas && entity.nohlp == 999)) { if (!Mastermap.occupied(entity.x, entity.y, entity.w, entity.h, entity))
							{Mapdata[r] = entity.pixel; entity.nohlp = 0; entity.sy = entity.svsy; }}
						else { entity.nohlp = 999; entity.sy = INVWALSY; entity.sx = INVWALA; if (Mastermap.cells != undefined) Mapdata[r] = Mastermap.cells[r].ihpixel; else Mapdata[r] = 0xA08060; }

// next phase, this wall
						if (Lsecs < 2) Lsecs = 2;
						entity.hb = heartbeet + Lsecs;
						if (pwalled < heartbeet) Musicth.play(Musicth.sounds[entity.type.bsound]);
						pwalled = entity.hb;
					}
				}
// pass 2 - set wall shapes --not shadows
			for(n = 0, nc = Mastermap.entities.length ; n < nc ; n++) {
					entity = Mastermap.entities[n];
// if you leave out this if, it does real weird stuff
				var ppx = p2t(entity.x), ppy = p2t(entity.y);
					if (entity.rwall) {
// likewise if you want an interesting "empty" tile, leave out the 999 test
						if (entity.nohlp != 999) entity.sx = walltype(ppx, ppy, Mastermap, iswallpr);
//						var n2 = p2t(entity.x) + p2t(entity.y) * Mtw;
//						var cell = reloaded.cells[n2];
//						if (cell != undefined) cell.shadow = shadowtype(cell.tx, cell.ty, Mastermap);
					}
					if (entity.pwall) {
						if (entity.nohlp != 999) entity.sx = walltype(ppx, ppy, Mastermap, iswallpr);
					}
				}
/*				if (wallupd) {			// this is too costly on refresh
					var ctx = reloaded.cells[0].ctx;
					tilerend.maptiles(Mastermap, ctx);
					} */
				if (Movexit[0] != undefined)
				{
					var newex = Game.Math.randomInt(0, (lastmex - 1));
					for(n = 0; n < lastmex ; n++) {
// exit is open and ready to move
						if (Movexit[n].frame == 4 && Movexit[n].hb < heartbeet) { Movit = Movexit[n]; Movit.nohlp = 999; Movit.movit = -1; Musicth.play(Musicth.sounds[Movit.type.bsound]); break; }
						else if (Movexit[n].frame > 0) break;
						}
// exits are all closed, open a random selection
					if (n >= lastmex) {
						Movit = Movexit[newex];
						Movit.hb = heartbeet + Movit.type.hbtim;
						Movit.movit = 1;
						}
				}
			}

			var hinv = 0;
			if (this.linvuln > 0) hinv = 1; // invulnerable takes another health per tick
// difficulty > 7 (std hard) adds dmg at 1% per diff
			if (diff_level > 7) hinv = hinv + (diff_level / 100);
// ankh item - found in amiga sprites - add 1 health per sec + diff/100
			if (this.lank > 0)
				this.heal(1+ (diff_level / 100));
			else
// players automatically lose 1 health every second
			if (!DEBUG.NOAUTOHURT)
/// TEST - remove
// dev: no autohurt
		if (!document.getElementById("noah").checked)
/// TEST - remove
				this.hurt(1 + hinv, this, true);

// count downs may want a setTimeout fn for these and stalling
			if ((frame % (FPS)) === 0)
			{
// limited items that count down and expire
					if (this.lank > 0) this.lank = countdown(this.lank);
					if (this.lrepuls > 0) this.lrepuls = countdown(this.lrepuls);
					if (this.linvis > 0) this.linvis = countdown(this.linvis);
					if (this.linvuln > 0) this.linvuln = countdown(this.linvuln);
// treasure room timer
 					if (!troomfin)
					if (troomtime > 0)
					{
							troomtime--;
							var taunt = 50 % troomtime;		// time mod 50 - see image cap chart, hit values 48, 42, 24, 21, 16, 14, 12 -- (either 2 or 8 result)
							timerupd.level.update("Time: " + troomtime);
							if (troomtime < 11) Musicth.play(TROOMCNT[troomtime]);
							else if ((taunt == 2 || taunt == 8) && Math.random() < trtauntrnd)
							{
									var r = Game.Math.randomInt(0, 3);			// treasure room hurry taunts
									if (r == lastrt) r++;
									lastrt = r;
									switch(r) {
											case 0: Musicth.play(Musicth.sounds.ancymi);
													break;
											case 1: Musicth.play(Musicth.sounds.anchurry);
													break;
											case 2: Musicth.play(Musicth.sounds.anctimes);
													break;
											case 3: Musicth.play(Musicth.sounds.anctoms);
													break;
									}
							}
							if (troomtime < 1) // ran out of time
							{
									levelhelp = "<font color=yellow>YOU LOST!</font>"
									var r = Game.Math.randomInt(0, 1);			// treasure room failure taunts
									if (Math.random() < 0.66)
									switch(r) {
											case 0: Musicth.play(Musicth.sounds.ancbetr);
													levelhelp = "<font color=yellow>YOU DIDNT MAKE IT!</font>"
													break;
											case 1: Musicth.play(Musicth.sounds.anculoose);
													break;
									}
									game.nextLevel();
							}
					}
					if (slowmonstertime > 0)
					{
							slowmonstertime--;
							if (slowmonstertime < 1) slowmonster = 1;
					}
// low health "badump" & taunt
					if (this.health < 20) { if ((frame % (FPS)) === 0) Musicth.play(Musicth.sounds.healthcnt); }
					else if (this.health < 40) { if ((frame % (FPS * 2)) === 0) Musicth.play(Musicth.sounds.healthcnt); }
					else if (this.health < 100) { if ((frame % (FPS * 3)) === 0) Musicth.play(Musicth.sounds.healthcnt); }

					this.msgtimer--;
					if (this.weak() && this.msgtimer < 1)
					{
								this.msgtimer = 15 + Game.Math.randomInt(-5, 5);
								var r = Game.Math.randomInt(0, 3);			// near death taunts
								switch(r) {
										case 0: Musicth.play(Musicth.sounds.ancpwrl);
														  Musicth.play(Musicth.sounds[this.type.annc]);
												break;
										case 1: Musicth.play(Musicth.sounds.anc2die);
														  Musicth.play(Musicth.sounds[this.type.annc]);
												break;
										case 2: Musicth.play(Musicth.sounds.ancndsfd);
														  Musicth.play(Musicth.sounds[this.type.annc]);
												break;
										case 3: Musicth.play(Musicth.sounds.ancruno);
														  Musicth.play(Musicth.sounds[this.type.annc]);
												break;
								}
					}
			}
// count down stun
			if (this.stun > 0) this.stun--;
// count health tics for stalling
			stalling = stalling + 1;
/// TEST - remove
// dev: no stalling
		if (!document.getElementById("nostal").checked)
/// TEST - remove
			if (stalling == doorstalled) {

				var cells   = reloaded.cells,
					 opendr = 0, cell, c, nc = cells.length;

				// now loop again checking for walls and other entities - doors
				for(c = 0 ; c < nc ; c++) {
					  cell = cells[c];
						if (cell.ptr)
						if (cell.ptr.door)
						{
								if (!opendr) Musicth.play(Musicth.sounds.opendoor);
								cell.ptr.door = null;
								Masterthmp.map.remove(cell.ptr);
								opendr = true;
						}
				}
			} 	// end doorstall

/// TEST - remove
// dev: no stalling
		if (!document.getElementById("nostal").checked)
/// TEST - remove
			if (stalling == WALLSTALL) {

				var cells   = reloaded.cells,
					 walled, cell, c, nc = cells.length;

				// now loop again checking for walls and other entities
				for(c = 0 ; c < nc ; c++) {
					  cell = cells[c];
					  if (cell.wall !== undefined && cell.wall !== null)
//					  if (cell.x != 0 &&  cell.y != 0) 			/// restore for std G1 ops - the top wall & left wall did not exitify
						{
								if (!walled) Musicth.play(Musicth.sounds.wallexit);
								reloaded.addExit(cell.x, cell.y, DOOR.EXIT);
								cell.wall = null;	// so we dont fire these wall segs again
								walled = true;
						}
				}

			}	// end wallstall

// ffield ops
				ffieldpulse = heartbeet;
				var n, k = ffieldpulse & 0xF, max, entity;
				for(n = 0, max = Mastermap.entities.length ; n < max ; n++) {
					  entity = Mastermap.entities[n];

					if (entity.type.nohlp == FFHLP)
					if (!game.viewport.outside(entity.x, entity.y, TILE, TILE))
					{
						if (k == 3 || k == 8 || k == 14)
							entity.type = TREASURE.FFIELDPOW;
						if (k == 6 || k == 10 || k == 0)
							entity.type = TREASURE.FFIELDDIM;
					}
					else
						entity.type = TREASURE.FFIELDDIM;
				}

/// TEST - remove
// dev: sound test
				var nsnd = document.getElementById("nsnd").value;
				if (document.getElementById("playsnd").checked) {
					if (Musicth.sounds[nsnd] != undefined)
						Musicth.play(Musicth.sounds[nsnd]);
					document.getElementById("playsnd").checked = false;
				}
// dev cook storage
//				createCookie("_dev_"+, document.getElementById().checked,7777);
// the first 5 are (planned) normal ops and should be kept after TEST is removed...
				if ((heartbeet & 15) == 7) {
				createCookie("_ops_"+"seldiff", document.getElementById("seldiff").value,7777);
				createCookie("_ops_"+"sellvl", document.getElementById("sellvl").value,7777);
				createCookie("_ops_"+"seltut", document.getElementById("seltut").checked,7777);
				createCookie("_ops_"+"selg2tut", document.getElementById("selg2tut").checked,7777);
				createCookie("_ops_"+"seltutx", document.getElementById("seltutx").checked,7777);
				createCookie("_dev_"+"mazsolv", document.getElementById("mazsolv").checked,7777);
// keep     -^
				createCookie("_dev_"+"xunp", document.getElementById("xunp").checked,7777);
				createCookie("_dev_"+"yunp", document.getElementById("yunp").checked,7777);
				createCookie("_dev_"+"xmiror", document.getElementById("xmiror").checked,7777);
				createCookie("_dev_"+"ymiror", document.getElementById("ymiror").checked,7777);
				createCookie("_dev_"+"rotat", document.getElementById("rotat").checked,7777);
				createCookie("_dev_"+"invwal", document.getElementById("invwal").checked,7777);
				createCookie("_dev_"+"invhint", document.getElementById("invhint").checked,7777);
				createCookie("_dev_"+"spedis", document.getElementById("spedis").checked,7777);
				createCookie("_dev_"+"blrndlod", document.getElementById("blrndlod").checked,7777);
				createCookie("_dev_"+"forndlod", document.getElementById("forndlod").checked,7777);
				createCookie("_dev_"+"nostal", document.getElementById("nostal").checked,7777);
				createCookie("_dev_"+"noah", document.getElementById("noah").checked,7777);
				createCookie("_dev_"+"nommv", document.getElementById("nommv").checked,7777);
				createCookie("_dev_"+"nogen", document.getElementById("nogen").checked,7777);
				createCookie("_dev_"+"noblend", document.getElementById("noblend").checked,7777);
				createCookie("_ops_"+"whue", document.getElementById("whue").value,7777);
				createCookie("_ops_"+"fhue", document.getElementById("fhue").value,7777);
				createCookie("_ops_"+"phue", document.getElementById("phue").value,7777);
				createCookie("_ops_"+"ashue", document.getElementById("ashue").value,7777);
				createCookie("_ops_"+"vports", document.getElementById("vports").value,7777);
				}
/// TEST - remove
		}
		if (Movit != null)
		if ((frame % (Movit.type.fpf)) === 0) {
			Movit.frame += Movit.movit;
			if (Movit.frame < 1) { Movit.movit = 0; Movit.frame = 0; Movit = null;}
			else if (Movit.frame >= 4) { Movit.nohlp = 0; Movit.movit = 0; Movit.frame = 4; Movit = null; }
		}
    },

    weak: function() {
      return this.health < 100;
    },

    die: function() {
      this.dead = true;
      publish(EVENT.PLAYER_DEATH, this);
// clear treasure room on single player death -- NOTE: multiplay
		troomfin = false;
		troomtime  = 0;
		tlevel  = 0;
		treasurerc = 0;
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
		else
		{
				helpdis(nohlpcmb, undefined, 2000, undefined, undefined);
				Musicth.play(Musicth.sounds.sbuzz);
		}
    },

    onrender: function(frame) {
      if (this.dead)
        this.frame = 32;
      else if (this.exiting)
        this.frame = this.sx + animate(this.exiting.count, this.exiting.fpf, 8);
      else if (is.valid(this.moving.dir) || this.firing)
        this.frame = this.sx + this.dir + (8 * animate(frame, this.type.fpf, this.type.frames));
      else
        this.frame = this.sx + this.dir;
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
		timerupd = this;	// for treasure room timer
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
		if (Mastermult != player.scmult) player.scmult = Mastermult;		// ISSUE: not multiplayer compatible
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

		 document.getElementById(player.type.name+"poison").style.visibility = (player.poison > 0) ? "visible" : "hidden";
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
// user select viewport size, requires game reload to change
		 var vp = document.getElementById("vports").value; // check for manual entry
		 if (!/^\d+$/.test(vp)) vp = readCookie("_ops_"+"vports"); //-- value is not loaded yet
		 if (!/^\d+$/.test(vp)) vp = 16;
		 if (vp < 10) vp = 10;
		 if (vp > 40) vp = 40;
		 VIEWPORT.TW = vp;
		 VIEWPORT.TH = vp;
      subscribe(EVENT.START_LEVEL, this.onStartLevel.bind(this));
    },

    onStartLevel: function(map) {
      this.size(VIEWPORT.TW, map);
      this.center(map.start, map);
      this.zoomingout = false;
    },

    outside: function(x, y, w, h) {
// handle unpin areas in display test
		var rx = this.x, ry = this.y, rw = this.w, rh = this.h, j = false, k = false, m = false;
		var txu = tyu = txo = tyo = false;

// middle underpins
		if (this.x < 0) {
			txu = true;
			rx = Mastermap.w + this.x;
			rw = 0 - this.x;
			k = Game.Math.overlap(x, y, w, h, rx, ry, rw, rh);
		}
		else if ((this.x + this.w) > Mastermap.w)
		{
			txo = true;
			rx = 0;
			rw = (this.x + this.w) - Mastermap.w;
			k = Game.Math.overlap(x, y, w, h, rx, ry, rw, rh);
		}
		if (this.y < 0) {
			tyu = true;
			ry = Mastermap.h + this.y;
			rh = 0 - this.y;
			j = Game.Math.overlap(x, y, w, h, this.x, ry, this.w, rh);
		}
		else if ((this.y + this.h) > Mastermap.h)
		{
			tyo = true;
			ry = 0;
			rh = (this.y + this.h) - Mastermap.h;
			j = Game.Math.overlap(x, y, w, h, this.x, ry, this.w, rh);
		}
// corner underpins
		if (txu && tyu) {
			rx = Mastermap.w + this.x;
			rw = 0 - this.x;
			ry = Mastermap.h + this.y;
			rh = 0 - this.y;
			m = Game.Math.overlap(x, y, w, h, rx, ry, rw, rh);
		}
		if (txo && tyo) {
			rx = 0;
			rw = (this.x + this.w) - Mastermap.w;
			ry = 0;
			rh = (this.y + this.h) - Mastermap.h;
			m = Game.Math.overlap(x, y, w, h, rx, ry, rw, rh);
		}
		if (txo && tyu) {
			rx = 0;
			rw = (this.x + this.w) - Mastermap.w;
			ry = Mastermap.h + this.y;
			rh = 0 - this.y;
			m = Game.Math.overlap(x, y, w, h, rx, ry, rw, rh);
		}
		if (txu && tyo) {
			rx = Mastermap.w + this.x;
			rw = 0 - this.x;
			ry = 0;
			rh = (this.y + this.h) - Mastermap.h;
			m = Game.Math.overlap(x, y, w, h, rx, ry, rw, rh);
		}

		if (k != false || j != false || m != false) return(false);		// return is false if overlap happens

      return !Game.Math.overlap(x, y, w, h, this.x, this.y, this.w, this.h);
    },

    center: function(pos, map) {
      this.move(pos.x - this.w/2, pos.y - this.h/2, map);
    },

    move: function(x, y, map) {
		 if (Munpinx)
//				this.x = Game.Math.minmax(x, 0, map.w - 1);
				this.x = Math.min(x, map.w - 1);
		 else
				this.x = Game.Math.minmax(x, 0, map.w - this.w - 1);

		 if (Munpiny)
				this.y = Math.min(y, map.h - 1);
		 else
				this.y = Game.Math.minmax(y, 0, map.h - this.h - 1);
    },

    size: function(tw, map) {
      this.tw = Game.Math.minmax(tw, 10, map.th < map.tw ? map.tw : map.th * (VIEWPORT.TW/VIEWPORT.TH));
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

		var nvx = rx = viewport.x,
			 ry = viewport.y,
			 nx = 0, ny = 0;
		 var txu = tyu = txo = tyo = false;
			Vx = 0;
			Vy = 0;
// draw the spriotes unpinned !
// the early returns had  to be removed - they blocked the corner tests
// -- this likely means sprites are being called outside display area

// middle unpin overscan sprites
		 if ((viewport.x + viewport.w) > Mastermap.w)
		 {
			 txo = true;
			 rx = (viewport.x + viewport.w) - Mastermap.w;
			 nx = viewport.w - (rx - x);
			 if (x < rx && nx >= 0) {
				ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, nx, y - ry, w || TILE, h || TILE);
				Vx = 1;
				Vy = 0;
			 }
		 }
		 else
		 if (viewport.x < 0) {
			 txu = true;
			 rx = (Mastermap.w + viewport.x);
			 nx = (0 - viewport.x) - (Mastermap.w - x);
			 if (x > rx && nx >= 0) {
				ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, nx, y - ry, w || TILE, h || TILE);
				Vx = -1;
				Vy = 0;
			 }
		 }

		 if ((viewport.y + viewport.h) > Mastermap.h)
		 {
			 tyo = true;
			 ry = (viewport.y + viewport.h) - Mastermap.h;
			 ny = viewport.h - (ry - y);
			 if (y < ry && ny >= 0) {
				ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, x - nvx, ny, w || TILE, h || TILE);
				Vx = 0;
				Vy = 1;
			 }
		 }
		 else
		 if (viewport.y < 0) {
			 tyu = true;
			 ry = (Mastermap.h + viewport.y);
			 ny = (0 - viewport.y) - (Mastermap.h - y);
			 if (y > ry && ny >= 0) {
				ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, x - nvx, ny, w || TILE, h || TILE);
				Vx = 0;
				Vy = -1;
			 }
		 }
// corner unpin overscan sprites
		 if (txu && tyu) {
			 rx = (Mastermap.w + viewport.x);
			 nx = (0 - viewport.x) - (Mastermap.w - x);
			 ry = (Mastermap.h + viewport.y);
			 ny = (0 - viewport.y) - (Mastermap.h - y);
			 if (x > rx && nx >= 0 && y > ry && ny >= 0) {
				ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, nx, ny, w || TILE, h || TILE);
				Vx = -1;
				Vy = -1;
				return;
			 }
		 }
		 if (txo && tyu) {
			 rx = (viewport.x + viewport.w) - Mastermap.w;
			 nx = viewport.w - (rx - x);
			 ry = (Mastermap.h + viewport.y);
			 ny = (0 - viewport.y) - (Mastermap.h - y);
			 if (x < rx && nx >= 0 && y > ry && ny >= 0) {
				ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, nx, ny, w || TILE, h || TILE);
				Vx = 1;
				Vy = -1;
				return;
			 }
		 }
		 if (txu && tyo) {
			 rx = (Mastermap.w + viewport.x);
			 nx = (0 - viewport.x) - (Mastermap.w - x);
			 ry = (viewport.y + viewport.h) - Mastermap.h;
			 ny = viewport.h - (ry - y);
			 if (x > rx && nx >= 0 && y < ry && ny >= 0) {
				ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, nx, ny, w || TILE, h || TILE);
				Vx = -1;
				Vy = 1;
				return;
			 }
		 }
		 if (txo && tyo) {
			 rx = (viewport.x + viewport.w) - Mastermap.w;
			 nx = viewport.w - (rx - x);
			 ry = (viewport.y + viewport.h) - Mastermap.h;
			 ny = viewport.h - (ry - y);
			 if (x < rx && nx >= 0 && y < ry && ny >= 0) {
				ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, nx, ny, w || TILE, h || TILE);
				Vx = 1;
				Vy = 1;
				return;
			 }
		 }

// normal viewport sprites
      ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, x - viewport.x, y - viewport.y, w || TILE, h || TILE);
    },

    tile: function(ctx, sprites, sx, sy, tx, ty) {
      ctx.drawImage(sprites, sx * STILE, sy * STILE, STILE, STILE, tx * TILE, ty * TILE, TILE, TILE);
    },

    map: function(ctx, frame, viewport, map) {
      var w = Math.min(map.w, viewport.w),
          h = Math.min(map.h, viewport.h)
			 rx = viewport.x,
			 ry = viewport.y;
		var rw = w, rh = h, xz = 0, yz = 0, nw, nh;
		var txu = tyu = txo = tyo = false;
      map.background = map.background || Game.renderToCanvas(map.w, map.h, this.maptiles.bind(this, map));
		 tilerend = this; // save tile renderer to use later

// draw the map background unpinned !

// the middle single unpin overscans
		 if ((viewport.x + viewport.w) > map.w)
		 {
			 txo = true;
			 rx = 0;
			 xz = map.w - viewport.x;
			 w = (viewport.x + viewport.w) - map.w;
			 ctx.drawImage(map.background, rx, ry, w, h, xz, 0, w, h);
			 rx = viewport.x;
			 w = xz;
			 xz = 0;
		 }
		 else
		 if (viewport.x < 0) {
			 txu = true;
			 rx = (map.w + viewport.x);
			 w = 0 - viewport.x;
			 ctx.drawImage(map.background, rx, ry, w, h, 0, 0, w, h);
			 w = rw + viewport.x;
			 rx = 0;
			 xz = 0 - viewport.x;
		 }
		 if ((viewport.y + viewport.h) > map.h)
		 {
			 tyo = true;
			 ry = 0;
			 yz = map.h - viewport.y;
			 h = (viewport.y + viewport.h) - map.h;
			 ctx.drawImage(map.background, rx, ry, w, h, xz, yz, w, h);
			 ry = viewport.y;
			 h = yz;
			 yz = 0;
		 }
		 else
		 if (viewport.y < 0) {
			 tyu = true;
			 ry = (map.h + viewport.y);
			 h = 0 - viewport.y;
			 ctx.drawImage(map.background, rx, ry, w, h, xz, yz, w, h);
			 h = rh + viewport.y;
			 ry = 0;
			 yz = 0 - viewport.y;
		 }
// corners of dual unpin overscan
		 if (txu && tyu) {
			 var arx = (map.w + viewport.x);
			 var ary = (map.h + viewport.y);
			 nw = 0 - viewport.x;
			 nh = 0 - viewport.y;
			 ctx.drawImage(map.background, arx, ary, nw, nh, 0, 0, nw, nh);
		 }
		 if (txo && tyo) {
			 arx = 0;
			 ary = 0;
			 var nxz = map.w - viewport.x;
			 var nyz = map.h - viewport.y;
			 nw = (viewport.x + viewport.w) - map.w;
			 nh = (viewport.y + viewport.h) - map.h;
			 ctx.drawImage(map.background, arx, ary, nw, nh, nxz, nyz, nw, nh);
		 }
		 if (txo && tyu) {
			 arx = 0;
			 ary = (map.h + viewport.y);
			 nxz = map.w - viewport.x;
			 nyz = 0;
			 nw = (viewport.x + viewport.w) - map.w;
			 nh = 0 - viewport.y;
			 ctx.drawImage(map.background, arx, ary, nw, nh, nxz, nyz, nw, nh);
		 }
		 if (txu && tyo) {
			 arx = (map.w + viewport.x);
			 ary = 0;
			 nxz = 0;
			 nyz = map.h - viewport.y;
			 nw = 0 - viewport.x;
			 nh = (viewport.y + viewport.h) - map.h;
			 ctx.drawImage(map.background, arx, ary, nw, nh, nxz, nyz, nw, nh);
		 }

// normal viewport adjust for chunks of unpin overscan
		 ctx.drawImage(map.background, rx, ry, w, h, xz, yz, w, h);
    },

    maptiles: function(map, ctx) {
      var n, cell, tx, ty, tw, th, sprites = this.sprites.backgrounds;
//						0     2     4     6     8    10    12    14    16    18    20    22    24
		var bch = [ 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1 ],
			 bcv = [ 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 4, 4, 0, 0, 0, 0, 1, 1 ];

		function blnck(cell1,cell2,barr) { var bt = barr[cell1.wall]; if (bt > 0 && bt == barr[cell2.wall]) return true; };

// option vo, to only redraw viewport tiles - wont work because of patchwork viewport on unpinned levels
		 var vxz = 0, vyz = 0, vtw = map.tw, vth = map.th;

// first cycle - map entire map bkg with a larger floor tile if specced
		if (map.level.gflr)	// this is set before map load
		 {
			var gbas = document.getElementById("gfloorbas");
			var gimg = document.getElementById("gfloor");	// tiled images should be W == H and divisible by 32 and properly loop for best appearances
			var gap = 8; // with 256 x 256 tile, they have to map over 32 x 32 level grid 8 sections at a time
			if (gimg.width != 256) gap = Math.floor(gimg.width / 32);
			if (gap < 1) gap = 1;
			if (gap > 60) gap = 60;		// size 1920 x 1920, prob too big anyway
			for(ty = vyz, th = vth ; ty < th ; ty=ty+gap) {
			  for(tx = vxz, tw = vtw ; tx < tw ; tx=tx+gap) {
						ctx.drawImage(gbas, 0, 0, STILE * gap, STILE * gap, tx * TILE, ty * TILE, TILE * gap, TILE * gap);
// new case of color under transp floors
			     var hu = parseHue(tx, ty);

					  if (hu > 0) {
							ctx.beginPath();
							ctx.rect(tx * TILE, ty * TILE, TILE * gap, TILE * gap);
							ctx.fillStyle = Lrgb;
							ctx.fill();
							ctx.closePath();
							}
/// TEST - update
							var flhue = document.getElementById("fhue").value;
							if (flhue <0 || flhue > 360) flhue = 0;
							ctx.filter = "hue-rotate("+flhue+"deg)";
/// TEST - update
							if (gimg.width > 25)		// for some reason when the load fails w x h is 24 x 24
								ctx.drawImage(gimg, 0, 0, STILE * gap, STILE * gap, tx * TILE, ty * TILE, TILE * gap, TILE * gap);
							ctx.filter = "hue-rotate(0deg)";
				  }
				}
		 }
		 fcellstr = map.cell(0, 0); // preload so no undefine
		 ftilestr = 0;
/// TEST - remove
		 var hintinv = document.getElementById("invhint").checked;
		 if (document.getElementById("invwal").checked) map.level.wall = WALL.INVIS;
/// TEST - remove
		 var B1, B2, Bh, bcell;
// second cycle - everything else
      for(ty = vyz, th = vth ; ty < th ; ty++) {
        for(tx = vxz, tw = vtw ; tx < tw ; tx++) {
          cell = map.cell(tx * TILE, ty * TILE);
			  cell.ctx = ctx;						// for traps turning walls to floor, stalling walls to exits
			  if (cell.spriteset == undefined) cell.spriteset = sprites;		//		shootable walls, g2 shot walls, g2 random walls, and so
//			  cell.tileptr = this;
			  cell.map = map;
			  var hu = parseHue(tx, ty);

		  if (cell.nothing) {
				fcellstr = cell;
			  if (hu > 0) {
               ctx.beginPath();
					ctx.rect(tx * TILE, ty * TILE, TILE, TILE);
					ctx.fillStyle = Lrgb;
					ctx.fill();
					ctx.closePath();

					fcellstr = null;	// the only way to pass this is in huedata
					}
				else
				this.tile(ctx, cell.spriteset, 0, 0, tx, ty);
				nfl = nft = 0;
			 }
			else if (isp(cell.pixel,0xA08000))	// all floors except 0x000000
			  {
				  if (hu == 0 && Ltile > 0) cell.pixel = 0xA08000 | Ltile;
			var nfl = cell.pixel & MEXLOW, nft = FCUSTILE;
				  if (cell.pixel & 0x10) nft = 0;

				  if (cell.pixel & MEXLOB)		// special diff floor tiles - up to 15 as of now
				  {
						this.tile(ctx, cell.spriteset, nfl, nft, tx, ty);
				  }
// no g floor tile & nothing else spec
				  else if (!map.level.gflr)
						{
							nfl = map.level.floor; nft = 0;
							if (nfl == undefined || nfl == FLOOR.RND) nfl = FLVLRND;
							this.tile(ctx, cell.spriteset, DEBUG.FLOOR || nfl, 0, tx, ty);
						}
					ftilestr = nfl; // store for non floor content tests
// if cust tile in an area and a cell is occupied by ent or removable - this sets it to prev tiles cust state
					fcellstr = cell;
			  }
			else if (is.valid(cell.wall))
			  {
//					cell.ptile = fcellstr;
					if ((cell.pixel & MEXLOB) && (cell.pixel & MEXHIGB) == 0x404000 && (cell.pixel & MEXHIGH) != TRAPWALL)  {// diff walls by low nibble
// blender
						B2 = tx + ty * Mtw;
						if (document.getElementById("noblend").checked) B2 = -2;
						if (B2 == (B1 + 1) && ((cell.pixel & MEXLOB) != (bcell.pixel & MEXLOB)) && Bh == 0 && blnck(bcell,cell,bch)) {
							this.tile(Blendctx2, cell.spriteset, cell.wall, G1WALL[cell.pixel & MEXLOB], 0, 0);
							var bimg1 = Blendctx1.getImageData(0, 0, TILE, TILE);
							var b1Data = bimg1.data;
							var bimg2 = Blendctx2.getImageData(0, 0, TILE, TILE);
							var b2Data = bimg2.data;
							var pixs, XTILE = 4 * TILE, bl1, bl2, addr = 0.0625;
							for(var j = 0; j < TILE; j ++) { bl1 = 1.0; bl2 = 0.0;
								for(var i = 36; i < (XTILE - 36) ; i += 4) {
									pixs = i + j * XTILE;
									b1Data[pixs] = Math.round(b1Data[pixs] * bl1 + b2Data[pixs] * bl2);
									b1Data[pixs+1] = Math.round(b1Data[pixs+1] * bl1 + b2Data[pixs+1] * bl2);
									b1Data[pixs+2] = Math.round(b1Data[pixs+2] * bl1 + b2Data[pixs+2] * bl2);
//									b1Data[pixs+3] = b1Data[pixs+3] * bl1 + b2Data[pixs+3] * bl2;
									bl1 -= addr; bl2 += addr;
								}
								for(var i = 0; i < 36; i += 4) {
									pixs = i + j * XTILE;
									var pixb = (124 - i) + j * XTILE;
									b1Data[pixs] = b1Data[pixb];
									b1Data[pixs+1] = b1Data[pixb+1];
									b1Data[pixs+2] = b1Data[pixb+2];
								}
								for(var i = (XTILE - 36); i < XTILE; i += 4) {
									pixs = i + j * XTILE;
									b1Data[pixs] = b2Data[pixs];
									b1Data[pixs+1] = b2Data[pixs+1];
									b1Data[pixs+2] = b2Data[pixs+2];
								}}
							bimg1.data = b1Data;
							ctx.putImageData(bimg1, tx * TILE, ty * TILE);
							}
						else

						this.tile(ctx, cell.spriteset, cell.wall, G1WALL[cell.pixel & MEXLOB], tx, ty);
// blend for next
						this.tile(Blendctx1, cell.spriteset, cell.wall, G1WALL[cell.pixel & MEXLOB], 0, 0);
						B1 = tx + ty * Mtw; Bh = 0;
						bcell = cell;
					  }
					else
					if (map.level.wall != WALL.INVIS) { 		// dont load wall tile for invis walls -- only applies to std level walls
/// TEST - update
						var wallhue = document.getElementById("whue").value;
						if (wallhue <0 || wallhue > 360) wallhue = 0;
						ctx.filter = "hue-rotate("+wallhue+"deg)";
/// TEST - update
// blender
						B2 = tx + ty * Mtw; Bh = wallhue;
						if (document.getElementById("noblend").checked) B2 = -2;
						if (B2 == (B1 + 1) && ((cell.pixel & MEXLOB) != (bcell.pixel & MEXLOB)) && wallhue == 0 && blnck(bcell,cell,bch)) {
							this.tile(Blendctx2, cell.spriteset, cell.wall, G1WALL[cell.pixel & MEXLOB], 0, 0);
							var bimg1 = Blendctx1.getImageData(0, 0, TILE, TILE);
							var b1Data = bimg1.data;
							var bimg2 = Blendctx2.getImageData(0, 0, TILE, TILE);
							var b2Data = bimg2.data;
							var pixs, XTILE = 4 * TILE, bl1, bl2, addr = 0.0625;
							for(var j = 0; j < TILE; j ++) { bl1 = 1.0; bl2 = 0.0;
								for(var i = 36; i < (XTILE - 36) ; i += 4) {
									pixs = i + j * XTILE;
									b1Data[pixs] = Math.round(b1Data[pixs] * bl1 + b2Data[pixs] * bl2);
									b1Data[pixs+1] = Math.round(b1Data[pixs+1] * bl1 + b2Data[pixs+1] * bl2);
									b1Data[pixs+2] = Math.round(b1Data[pixs+2] * bl1 + b2Data[pixs+2] * bl2);
//									b1Data[pixs+3] = b1Data[pixs+3] * bl1 + b2Data[pixs+3] * bl2;
									bl1 -= addr; bl2 += addr;
								}
								for(var i = 0; i < 36; i += 4) {
									pixs = i + j * XTILE;
									var pixb = (36 - i) + j * XTILE;
									b1Data[pixs] = b1Data[pixb];
									b1Data[pixs+1] = b1Data[pixb+1];
									b1Data[pixs+2] = b1Data[pixb+2];
								}
								for(var i = (XTILE - 36); i < XTILE; i += 4) {
									pixs = i + j * XTILE;
									b1Data[pixs] = b2Data[pixs];
									b1Data[pixs+1] = b2Data[pixs+1];
									b1Data[pixs+2] = b2Data[pixs+2];
								}}
							bimg1.data = b1Data;
							ctx.putImageData(bimg1, tx * TILE, ty * TILE);
							}
						else

						this.tile(ctx, cell.spriteset, cell.wall, DEBUG.WALL || map.level.wall, tx, ty);
// blend for next
						this.tile(Blendctx1, cell.spriteset, cell.wall, DEBUG.WALL || map.level.wall, 0, 0);
						B1 = tx + ty * Mtw;
						bcell = cell;

						ctx.filter = "hue-rotate(0deg)";
						if (map.level.brikovr) this.tile(ctx, cell.spriteset, cell.wall, map.level.brikovr, tx, ty);
					}
					else if (fcellstr != null) {
						if (hu == 0 && Ltile > 0) {
							nfl = Ltile & MEXLOW, nft = FCUSTILE;
							if (Ltile & 0x10) nft = 0;
						}
						if (Ltile != 96 || !map.level.gflr)	// normal floor tile, already written
						if (fcellstr.pixel == 0 || isp(fcellstr.pixel,0xA08000) && (fcellstr.pixel & MEXLOB || !map.level.gflr)) // underneath an invisible wall - load as under an ent
								this.tile(ctx, cell.spriteset, nfl, nft, tx, ty);

						if (hintinv) this.tile(ctx, cell.spriteset, cell.wall, HINTIV, tx, ty);
					}
			  }
			else if (fcellstr != null) {		// this is some ent - copy floor tile under it from imm. previous
					cell.ihpixel = 0;
					if (hu == 0 && Ltile > 0) {
						if (map.level.gflr || Ltile & MEXLOW) { nfl = Ltile & MEXLOW, nft = FCUSTILE; }
						if (Ltile & 0x10) nft = 0;
						if (Ltile == 96 && map.level.gflr) continue;	// normal floor tile, already written
						cell.ihpixel = 0xA08000 | Ltile & 0x1F;
					}
					if (fcellstr.pixel == 0 || isp(fcellstr.pixel,0xA08000) && (fcellstr.pixel & MEXLOB || !map.level.gflr)) {
							this.tile(ctx, cell.spriteset, nfl, nft, tx, ty);
							if (cell.ihpixel == 0) cell.ihpixel = fcellstr.pixel;
					}
				}

// map gps
		  if (document.getElementById("mazsolv").checked)
		  if (cell.mapcht) this.tile(ctx, cell.spriteset,  15, 0, tx, ty);			// currently unit 15 of row 0 backgrounds.png is the yellow brick overlay

			if (map.level.wall == WALL.INVIS)				// do floor tile for invis walls
			{
				if (!map.level.gflr)
						this.tile(ctx, cell.spriteset, DEBUG.FLOOR || map.level.floor, 0, tx, ty);
			}
			if (map.level.wall != WALL.INVIS || hintinv)
				if (cell.shadow)		// dont shadow for invis walls
					this.tile(ctx, cell.spriteset, cell.shadow, WALL.INVIS, tx, ty);
// when a following tile is covered and being revealed, this sets it to the prev. tile if area is cust tile (differ from spec tile on map)
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
            sx      = player.sx + player.frame,
            sy      = player.sy,
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

		  if (player.hue != undefined)
				ctx.filter = "hue-rotate("+player.hue+"deg)";

        ctx.drawImage(player.canvas, 0, 0, STILE + 2*maxglow, STILE + 2*maxglow, x + dx - maxglow + shrink/2 - viewport.x, y + dy - maxglow + shrink/2 - viewport.y, TILE + 2*maxglow - shrink, TILE + 2*maxglow - shrink);

		  ctx.filter = "hue-rotate(0deg)";
// thief tracker
		  if (thieftrack > 0)
		  {
/// TEST - remove
//document.title = thieftim+": "+ ((thieftim - timestamp())/1000)+" :tft (&-stmp)/1000: ";
/// TEST - remove
					if (troomtime == 0)
					if (thieftim  != 0 && (thieftim < timestamp()))
					{
							spawn(); // start theif
							Mastercell.ptr.blocked = false;	// keep track of stuck theif
							if (Math.random() < thiefrnd * 0.25)	// enhanced - 1/4 chance to start another theif				-- expanded rules, option off for g1/g2 mode only
									thieftim = 1000 * (thieftotim + (thieftotim * Math.random())) + timestamp();
							else
									thieftim = 0; // stop timer
					}
					if ((Math.floor(x) != THIEFTRX[thieftrack - 1]) || (Math.floor(y) != THIEFTRY[thieftrack - 1]))
					{
							THIEFTRX[thieftrack] = Math.floor(x);
							THIEFTRY[thieftrack] = Math.floor(y);
							thieftrack++;
					}
		  }
      }
    },

    entities: function(ctx, frame, viewport, entities) {
      var n, max, entity, sf, sprites = this.sprites.entities, hold = [], held = 0;
		 hold[held] = null;
      for(n = 0, max = entities.length ; n < max ; n++) {
        entity = entities[n];
			if (entity.spriteset == undefined) {
				if (entity.type.wall) {
					entity.spriteset = this.sprites.backgrounds;
					if (entity.pixel >= 0x8210 && entity.pixel <= 0x822F || entity.pixel >= 0x8110 && entity.pixel <= 0x812F) entity.spriteset = this.sprites.shotwalls;
					}
				else
				entity.spriteset = sprites;
				}
			entity.vx = 0; entity.vy = 0;
        if (entity.active && (!entity.onrender || entity.onrender(frame) !== false) && !viewport.outside(entity.x, entity.y, TILE, TILE)) {
// note: RUNORG

				if (entity.hue != undefined)
					ctx.filter = "hue-rotate("+entity.hue+"deg)";
/// TEST - update
				ctx.filter = "hue-rotate("+document.getElementById("ashue").value+"deg)";
/// TEST - update
// we have an entity posing as a wall - if a level wall, use level wall hue
				if (entity.lvlwall == true) ctx.filter = "hue-rotate("+document.getElementById("whue").value+"deg)";

					if (entity.type.pushwal)
					{ hold[held++] = entity; hold[held] = null; }
					else
					  if (map.level.wall != WALL.INVIS || entity.lvlwall != true)
							this.sprite(ctx, entity.spriteset, viewport, entity.sx + (entity.frame || 0), entity.sy, entity.x + (entity.dx || 0), entity.y + (entity.dy || 0), TILE + (entity.dw || 0), TILE + (entity.dh || 0));

					entity.vx = Vx;
					entity.vy = Vy;
				ctx.filter = "hue-rotate(0deg)";
        }
      }
		held = 0;		// save and do pushwalls last
		while (hold[held] != null) {
			entity = hold[held++];
				this.sprite(ctx, entity.spriteset, viewport, entity.sx + (entity.frame || 0), entity.sy, entity.x + (entity.dx || 0), entity.y + (entity.dy || 0), TILE + (entity.dw || 0), TILE + (entity.dh || 0));
						entity.vx = Vx;
						entity.vy = Vy;
			}
    }

  });

  //===========================================================================
  // SOUND FX and MUSIC
  //===========================================================================

  var Sounds = Class.create({

    initialize: function(sounds) {
      this.sounds      = sounds;
      this.sounds.menu = this.sounds.gtitle;
      this.sounds.game = this.sounds.gtitle;
      this.sounds.fire = this.sounds.firewizard;     // re-use wizard firing sound for monster (demon) fire
      this.sounds.nuke = this.sounds.potionbang;
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
//      subscribe(EVENT.MONSTER_DEATH,      this.onMonsterDeath.bind(this));
//      subscribe(EVENT.GENERATOR_DEATH,    this.onGeneratorDeath.bind(this));
      subscribe(EVENT.HIGH_SCORE,         this.onHighScore.bind(this));
      subscribe(EVENT.PLAYER_DEATH,       this.onPlayerDeath.bind(this));
    },

    onStartLevel:        function(map)               { if (!NOBKGMUSIC) this.playGameMusic(this.sounds[DEBUG.MUSIC || map.level.music]); this.nlevel = map.nlevel;             },
    onPlayerFire:        function(player)            { this.play(this.sounds["fire" + player.type.name]);                                                     },
    onMonsterFire:       function(monster)
	 {
			if (monster.type.weapon != undefined)
			if (monster.type.weapon.foir != undefined) { Musicth.play(Musicth.sounds[monster.type.weapon.foir]); return; }
			this.play(this.sounds.fire);
	 },
    onDoorOpen:          function(door)              { this.play(this.sounds.opendoor);                                                                       },
    onTreasureCollected: function(treasure, player)  { this.play(this.sounds[treasure.type.sound]);                                               },
//    onMonsterDeath:      function(monster, by, nuke) { this.play(nuke ? this.sounds.generatordeath : this.sounds["monsterdeath" + Game.Math.randomInt(1,3)]); },
//    onGeneratorDeath:    function(generator, by)     { this.play(this.sounds.generatordeath);                                                                 },
    onHighScore:         function(player)            { this.play(this.sounds.highscore);                                                                      },
    onPlayerNuke:        function(player)            { this.play(this.sounds.nuke);                                                                           },
    onPlayerDeath:       function(player)            { this.stopAllMusic(); this.play(Musicth.sounds[player.type.name + "die" + Game.Math.randomInt(1,2)]); },

    onPlayerExiting: function(player, exit) {
      this.play(this.sounds.exitlevel);
		 if (RUNORG)
		 {
				if (this.nlevel === (cfg.levels.length-1)) {
				  this.sounds.game.stop();
//				  this.play(this.sounds.victory);
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
        player.hurtSound = this.play(this.sounds[player.type.name + "pain" + Game.Math.randomInt(1,9)]);
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
    play:      function(s) { if (s != undefined) if (this.isNotMute()) return s.play(); },

    stopAllMusic: function() {
      this.sounds.menu.stop();
      this.sounds.game.stop();
    },

    playMenuMusic: function() {
      this.stopAllMusic();
      this.play(this.sounds.menu);
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

