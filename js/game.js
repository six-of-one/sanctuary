//=============================================================================
// feature detection
//=============================================================================
ua = function() {

  var ua  = navigator.userAgent.toLowerCase(); // should avoid user agent sniffing... but sometimes you just gotta do what you gotta do
  var key =        ((ua.indexOf("opera")   > -1) ? "opera"   : null);
      key = key || ((ua.indexOf("firefox") > -1) ? "firefox" : null);
      key = key || ((ua.indexOf("chrome")  > -1) ? "chrome"  : null);
      key = key || ((ua.indexOf("safari")  > -1) ? "safari"  : null);
      key = key || ((ua.indexOf("msie")    > -1) ? "ie"      : null);

  try {
    var re      = (key == "ie") ? "msie ([\\d\\.]*)" : key + "\\/([\\d\\.]*)"
    var matches = ua.match(new RegExp(re, "i"));
    var version = matches ? matches[1] : null;
  } catch (e) {}

  return {
    full:    ua,
    name:    key + (version ? " " + version : ""),
    version: version,
    major:   version ? parseInt(version) : null,
    is: {
      firefox: (key == "firefox"),
      chrome:  (key == "chrome"),
      safari:  (key == "safari"),
      opera:   (key == "opera"),
      ie:      (key == "ie")
    },
    has: {
      audio:  AudioFX && AudioFX.enabled,
      canvas: (document.createElement('canvas').getContext),
      touch:  ('ontouchstart' in window)
    }
  }
}();

//=============================================================================
// type detection
//=============================================================================

is = {
  'string':         function(obj) { return (typeof obj === 'string');                 },
  'number':         function(obj) { return (typeof obj === 'number');                 },
  'bool':           function(obj) { return (typeof obj === 'boolean');                },
  'array':          function(obj) { return (obj instanceof Array);                    },
  'undefined':      function(obj) { return (typeof obj === 'undefined');              },
  'func':           function(obj) { return (typeof obj === 'function');               },
  'null':           function(obj) { return (obj === null);                            },
  'notNull':        function(obj) { return (obj !== null);                            },
  'invalid':        function(obj) { return ( is['null'](obj) ||  is.undefined(obj));  },
  'valid':          function(obj) { return (!is['null'](obj) && !is.undefined(obj));  },
  'emptyString':    function(obj) { return (is.string(obj) && (obj.length == 0));     },
  'nonEmptyString': function(obj) { return (is.string(obj) && (obj.length > 0));      },
  'emptyArray':     function(obj) { return (is.array(obj) && (obj.length == 0));      },
  'nonEmptyArray':  function(obj) { return (is.array(obj) && (obj.length > 0));       },
  'document':       function(obj) { return (obj === document);                        }, 
  'window':         function(obj) { return (obj === window);                          },
  'element':        function(obj) { return (obj instanceof HTMLElement);              },
  'event':          function(obj) { return (obj instanceof Event);                    },
  'link':           function(obj) { return (is.element(obj) && (obj.tagName == 'A')); }
}

//=============================================================================
// type coersion
//=============================================================================

to = {
  'bool':   function(obj, def) { if (is.valid(obj)) return ((obj == 1) || (obj == true) || (obj == "1") || (obj == "y") || (obj == "Y") || (obj.toString().toLowerCase() == "true") || (obj.toString().toLowerCase() == 'yes')); else return (is.bool(def) ? def : false); },
  'number': function(obj, def) { if (is.valid(obj)) { var x = parseFloat(obj); if (!isNaN(x)) return x; } return (is.number(def) ? def : 0); },
  'string': function(obj, def) { if (is.valid(obj)) return obj.toString(); return (is.string(def) ? def : ''); }
}

//=============================================================================
//
// Compatibility for older browsers (compatibility: http://kangax.github.com/es5-compat-table/)
//
//  Function.bind:        https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
//  Object.create:        http://javascript.crockford.com/prototypal.html
//  Object.extend:        (defacto standard like jquery $.extend or prototype's Object.extend)
//  Class.create:         create a simple javascript 'class' (a constructor function with a prototype and optional class methods)
//
//=============================================================================

if (!Function.prototype.bind) {
  Function.prototype.bind = function(obj) {
    var slice = [].slice,
        args  = slice.call(arguments, 1),
        self  = this,
        nop   = function () {},
        bound = function () {
          return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));   
        };
    nop.prototype   = self.prototype;
    bound.prototype = new nop();
    return bound;
  };
}

if (!Object.create) {
  Object.create = function(base) {
    function F() {};
    F.prototype = base;
    return new F();
  }
}

if (!Object.extend) {
  Object.extend = function(destination, source) {
    for (var property in source) {
      if (source.hasOwnProperty(property))
        destination[property] = source[property];
    }
    return destination;
  };
}

var Class = {
  create: function(prototype, extensions) {
    var ctor = function() { if (this.initialize) return this.initialize.apply(this, arguments); }
    ctor.prototype = prototype || {};      // instance methods
    Object.extend(ctor, extensions || {}); // class methods
    return ctor;
  }
}

if (!window.requestAnimationFrame) {// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimationFrame = window.webkitRequestAnimationFrame || 
                                 window.mozRequestAnimationFrame    || 
                                 window.oRequestAnimationFrame      || 
                                 window.msRequestAnimationFrame     || 
                                 function(callback, element) {
                                   window.setTimeout(callback, 1000 / 60);
                                 }
}

Game = {

  run: function(gameFactory, cfg) {
    document.addEventListener('DOMContentLoaded', function() {
      window.game   = gameFactory();
      window.runner = new Game.Runner(window.game, cfg);
    }, false);
  },

  //===========================================================================
  // GAME RUNNER
  //===========================================================================

  Runner: Class.create({

    initialize: function(game, cfg) {
      this.game          = game;
      this.cfg           = (cfg = Object.extend(cfg || {}, (game.cfg && game.cfg.runner) || {}));
      this.fps           = cfg.fps || 30;
      this.dstep         = 1.0 / cfg.fps;
      this.frame         = 0;
      this.canvas        = $(cfg.id || 'canvas');
      this.bounds        = this.canvas.getBoundingClientRect();
      this.width         = cfg.width  || this.canvas.offsetWidth;
      this.height        = cfg.height || this.canvas.offsetHeight;
      this.canvas        = this.canvas;
      this.canvas.width  = this.width;
      this.canvas.height = this.height;
      this.ctx           = this.canvas.getContext('2d');
      game.run(this);
      if (to.bool(this.cfg.start))
        this.start();
      return this.game;
    },

    timestamp: function() { return new Date().getTime(); },

    start: function() {

      this.addEvents();
      this.resetStats();

      if (this.cfg.manual)
        return this.draw();

      var timestamp = this.timestamp,
          start, middle, end, last = timestamp(),
          dt    = 0.0,            // time elapsed (seconds)
          stopping = false,       // flag for stopping game loop
          self = this;            // closure over this

      var step = function() {
        start  = timestamp(); dt = self.update(dt + Math.min(1, (start - last)/1000.0)); // send dt as seconds, MAX of 1s (to avoid huge delta's when requestAnimationFrame put us in the background)
        middle = timestamp(); self.draw();
        end    = timestamp();
        self.updateStats(middle - start, end - middle);
        last = start;
        if (!stopping)
          requestAnimationFrame(step);
      }
      this.stop = function() { stopping = true; }
      step();

    },

    update: function(dt) {
      while (dt >= this.dstep) {
        this.game.update(this.frame);
        this.frame = this.frame + 1;
        dt = dt - this.dstep;
      }
      return dt;
    },

    manual: function() {
      if (this.cfg.manual) {
        var start  = this.timestamp(); this.update(this.dstep);
        var middle = this.timestamp(); this.draw();
        var end    = this.timestamp();
        this.updateStats(middle - start, end - middle);
      }
    },

    draw: function() {
      this.ctx.save();
      this.game.draw(this.ctx, this.frame);
      this.ctx.restore();
      this.drawStats();
    },

    resetStats: function() {
      if (this.cfg.stats) {
        this.stats = new Stats();
        this.stats.extra = {
          update: 0,
          draw:   0
        };
        this.stats.domElement.id = 'stats';
        this.canvas.parentNode.appendChild(this.stats.domElement);
        this.stats.domElement.appendChild($({
          tag:     'div',
          'class': 'extra',
          'style': 'font-size: 8pt; position: absolute; top: -50px;',
          html: "<span class='update'></span><br><span class='draw'></span>"
        }));
        this.stats.updateCounter = $(this.stats.domElement).down('div.extra span.update');
        this.stats.drawCounter   = $(this.stats.domElement).down('div.extra span.draw');
      }
    },

    updateStats: function(update, draw) {
      if (this.cfg.stats) {
        this.stats.update();
        this.stats.extra.update = update ? Math.max(1, update) : this.stats.extra.update;
        this.stats.extra.draw   = draw   ? Math.max(1, draw)   : this.stats.extra.draw;
      }
    },

    drawStats: function() {
      if (this.cfg.stats) {
        this.stats.updateCounter.update("update: " + Math.round(this.stats.extra.update) + "ms");
        this.stats.drawCounter.update(  "draw: " + Math.round(this.stats.extra.draw) + "ms");
      }
    },

    addEvents: function() {
      var game = this.game;

      if (game.onfocus) {
        document.body.tabIndex = to.number(document.body.tabIndex, 0); // body needs tabIndex to recieve focus
        $(document.body).on('focus', function(ev) { game.onfocus(ev); });
      }

      if (game.onclick) {
        this.canvas.on('click', function(ev) { game.onclick(ev); });
      }

      if (game.onwheel) {
        this.canvas.on(ua.is.firefox ? "DOMMouseScroll" : "mousewheel", function(ev) { game.onwheel(Game.Event.mouseWheelDelta(ev), ev); });
      }

    },

    setSize: function(width, height) {
      this.width  = this.canvas.width  = width;
      this.height = this.canvas.height = height;
    }

  }),

  //===========================================================================
  // UTILS
  //===========================================================================

  qsValue: function(name, format) {
    var pattern = name + "=(" + (format || "\\w+") + ")",
        re      = new RegExp(pattern),
        match   = re.exec(location.search);
    return match ? match[1] : null;
  },

  qsNumber: function(name, def) {
    var value = this.qsValue(name);
    return value ? to.number(value, def) : null;
  },

  qsBool: function(name, def) {
    return to.bool(this.qsValue(name), def);
  },

  storage: function() {
    try {
      return this.localStorage = this.localStorage || window.localStorage || {};
    }
    catch(e) { // IE localStorage throws exceptions when using non-standard port (e.g. during development)
      return this.localStorage = {};
    }
  },

  createCanvas: function(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  },

  renderToCanvas: function(width, height, render, canvas) { // http://kaioa.com/node/103
    canvas = canvas || this.createCanvas(width, height, canvas);
    render(canvas.getContext('2d'));
    return canvas;
  },

  parseImage: function(image, callback) {
    var tx, ty, index, pixel,
        tw      = image.width,
        th      = image.height,
        canvas  = Game.renderToCanvas(tw, th, function(ctx) { ctx.drawImage(image, 0, 0); }),
        ctx     = canvas.getContext('2d'),
        data    = ctx.getImageData(0, 0, tw, th).data,
        helpers = {
          valid: function(tx,ty) { return (tx >= 0) && (tx < tw) && (ty >= 0) && (ty < th); },
          index: function(tx,ty) { return (tx + (ty*tw)) * 4; },
          pixel: function(tx,ty) { var i = this.index(tx,ty); return this.valid(tx,ty) ? (data[i]<<16)+(data[i+1]<<8)+(data[i+2]) : null; }
        }

    for(ty = 0 ; ty < th ; ty++)
      for(tx = 0 ; tx < tw ; tx++)
        callback(tx, ty, helpers.pixel(tx,ty), helpers);
  },

  createImage: function(url, options) {
    options = options || {};
    var image = $({tag: 'img'});
    if (options.onload)
      image.on('load', options.onload);
    image.src = url;
    return image;
  },

  loadResources: function(images, sounds, callback) { /* load multiple images and sounds and callback when ALL have finished loading */
    images    = images || [];
    sounds    = sounds || [];
    var count = images.length + sounds.length;
    var resources = { images: {}, sounds: {} };
    if (count == 0) {
      callback(resources);
    }
    else {

      var done = false;
      var loaded = function() {
        if (!done) {
          done = true; // ensure only called once, either by onload, or by setTimeout
          callback(resources);
        }
      }

      var onload = function() {
        if (--count == 0)
          loaded();
      };

      for(var n = 0 ; n < images.length ; n++) {
        var image = images[n];
        image = is.string(image) ? { id: image, url: image } : image;
        resources.images[image.id] = Game.createImage(image.url, { onload: onload });
      }

      for(var n = 0 ; n < sounds.length ; n++) {
        var sound  = sounds[n];
        sound = is.string(sound) ? { id: sound, name: sound } : sound;
        resources.sounds[sound.id] = AudioFX(sound.name, sound, onload);
      }

      setTimeout(loaded, 15000); // need a timeout because HTML5 audio canplay event is VERY VERY FLAKEY (especially on slow connections)

    }
  }

};

Game.PubSub = {

  enable: function(cfg, on) {

    var n, max;

    on.subscribe = function(event, callback) {
      this.subscribers = this.subscribers || {};
      this.subscribers[event] = this.subscribers[event] || [];
      this.subscribers[event].push(callback);
    },

    on.publish = function(event) {
      if (this.subscribers && this.subscribers[event]) {
        var subs = this.subscribers[event],
            args = [].slice.call(arguments, 1),
            n, max;
        for(n = 0, max = subs.length ; n < max ; n++)
          subs[n].apply(on, args);
      }
    }

    if (cfg) {
      for(n = 0, max = cfg.length ; n < max ; n++)
        on.subscribe(cfg[n].event, cfg[n].action);
    }

  }

}
//=============================================================================
// Minimal DOM Library ($)
//=============================================================================

Game.Element = function() {

  var query  = function(selector, context) {
    if (is.array(context))
      return Sizzle.matches(selector, context);
    else
      return Sizzle(selector, context);
  };

  var extend = function(obj)  {
    if (is.array(obj)) {
      for(var n = 0, l = obj.length ; n < l ; n++)
        obj[n] = extend(obj[n]);
    }
    else if (!obj._extended) {
      Object.extend(obj, Game.Element.instanceMethods);
    }
    return obj;
  };

  var on = function(ele, type, fn, capture) { ele.addEventListener(type, fn, capture);    };
  var un = function(ele, type, fn, capture) { ele.removeEventListener(type, fn, capture); };

  var create = function(attributes) {
    var ele = document.createElement(attributes.tag);
    for (var name in attributes) {
      if (attributes.hasOwnProperty(name) && is.valid(attributes[name])) {
        switch(name) {
          case 'tag'  : break;
          case 'html' : ele.innerHTML = attributes[name];  break;
          case 'text' : ele.appendChild(document.createTextNode(attributes[name])); break;
          case 'dom'  :
            attributes[name] = is.array(attributes[name]) ? attributes[name] : [attributes[name]];
            for (var n = 0 ; n < attributes[name].length ; n++)
              ele.appendChild(attributes[name][n]);
            break;
          case 'class':
          case 'klass':
          case 'className':
            ele.className = attributes[name];
            break;
          case 'on':
            for(var ename in attributes[name])
              on(ele, ename, attributes[name][ename]);
            break;
          default:
            ele.setAttribute(name, attributes[name]);
            break;
        }
      }
    }
    return ele;
  };

  return {
 
    all: function(selector, context) {
      return extend(query(selector, context));
    },

    get: function(obj, context) {
      if (is.string(obj))
        return extend(query("#" + obj, context)[0]);
      else if (is.element(obj) || is.window(obj) || is.document(obj))
        return extend(obj);
      else if (is.event(obj))
        return extend(obj.target || obj.srcElement);
      else if ((typeof obj == 'object') && obj.tag)
        return extend(create(obj));
      else
        throw "not an appropriate type for DOM wrapping: " + ele;
    },

    instanceMethods: {

      _extended: true,

      on: function(type, fn, capture) { on(this, type, fn, capture); return this; },
      un: function(type, fn, capture) { un(this, type, fn, capture); return this; },

      showIf:  function(on)      { if (on) this.show(); else this.hide(); },
      show:    function()        { this.style.display = ''       },
      hide:    function()        { this.style.display = 'none';  },
      visible: function()        { return (this.style.display != 'none') && !this.fading; },
      fade:    function(amount)  { this.style.opacity = amount;  },

      relations: function(property, includeSelf) {
        var result = includeSelf ? [this] : [], ele = this;
        while(ele = ele[property])
          if (ele.nodeType == 1)
            result.push(ele);
        return extend(result); 
      },

      parent:            function()            { return extend(this.parentNode); },
      ancestors:         function(includeSelf) { return this.relations('parentNode', includeSelf); },
      previousSiblings:  function()            { return this.relations('previousSibling');         },
      nextSiblings:      function()            { return this.relations('nextSibling');             },

      select: function(selector)            { return Game.Element.all(selector, this); },
      down: function(selector)              { return Game.Element.all(selector, this)[0]; },
      up:   function(selector, includeSelf) { return Game.Element.all(selector, this.ancestors(includeSelf))[0]; },
      prev: function(selector)              { return Game.Element.all(selector, this.previousSiblings())[0];     },
      next: function(selector)              { return Game.Element.all(selector, this.nextSiblings())[0];         },

      remove: function() {
        if (this.parentNode)
          this.parentNode.removeChild(this);
        return this;
      },

      removeChildren: function() { // NOTE: can't use :clear because its in DOM level-1 and IE bitches if we try to provide our own
        while (this.childNodes.length > 0)
          this.removeChild(this.childNodes[0]);
        return this;
      },

      update: function(content) {
        this.innerHTML = "";
        this.append(content);
        return this;
      },
          
      append: function(content) {
        if (is.string(content))
          this.innerHTML += content;
        else if (is.array(content))
          for(var n = 0 ; n < content.length ; n++)
            this.append(content[n]);
        else
          this.appendChild(Game.Element.get(content));
      },

      setClassName:    function(name)     { this.className = name; },
      hasClassName:    function(name)     { return (new RegExp("(^|\s*)" + name + "(\s*|$)")).test(this.className) },
      addClassName:    function(name)     { this.toggleClassName(name, true);  },
      removeClassName: function(name)     { this.toggleClassName(name, false); },
      toggleClassName: function(name, on) {
        var classes = this.className.split(' ');
        var n = classes.indexOf(name);
        on = (typeof on == 'undefined') ? (n < 0) : on;
        if (on && (n < 0))
          classes.push(name);
        else if (!on && (n >= 0))
          classes.splice(n, 1);
        this.className = classes.join(' ');
      },

      fadeout: function(options) {
        options = options || {};
        this.cancelFade();
        this.fading = Animator.apply(this, 'opacity: 0', { duration: options.duration, onComplete: function() {
          this.hide();
          this.fading = null;
          this.style.opacity = is.ie ? 1 : null; /* clear opacity after hiding, but IE doesn't allow clear so set to 1.0 for IE */
          if (options.onComplete)
            options.onComplete();
        }.bind(this) });
        this.fading.play();
      },

      fadein: function(options) {
        options = options || {};
        this.cancelFade();
        this.style.opacity = 0;
        this.show();
        this.fading = Animator.apply(this, 'opacity: 1', { duration: options.duration, onComplete: function() {
          this.fading = null;
          this.style.opacity = is.ie ? 1 : null; /* clear opacity after hiding, but IE doesn't allow clear so set to 1.0 for IE */
          if (options.onComplete)
            options.onComplete();
        }.bind(this) });
        this.fading.play();
      },

      cancelFade: function() {
        if (this.fading) {
          this.fading.stop();
          delete this.fading;
        }
      }

    }
  };

}();

$ = Game.Element.get;
$$ = Game.Element.all;

Game.Event = {

  stop: function(ev) {
    ev.preventDefault();
    ev.cancelBubble = true;
    ev.returnValue = false;
    return false;
  },

  canvasPos: function(ev, canvas) {
    var bbox = canvas.getBoundingClientRect(),
           x = (ev.clientX - bbox.left) * (canvas.width / bbox.width),
           y = (ev.clientY - bbox.top)  * (canvas.height / bbox.height);
    return { x: x, y: y };
  },

  mouseWheelDelta: function(ev) {
    if (is.valid(ev.wheelDelta))
      return ev.wheelDelta/120;
    else if (is.valid(ev.detail))
      return -ev.detail/3;
    else
      return 0;
  }

}

Game.Key = {
  BACKSPACE: 8,
  TAB:       9,
  RETURN:   13,
  ESC:      27,
  SPACE:    32,
  END:      35,
  HOME:     36,
  LEFT:     37,
  UP:       38,
  RIGHT:    39,
  DOWN:     40,
  PAGEUP:   33,
  PAGEDOWN: 34,
  INSERT:   45,
  DELETE:   46,
  ZERO:     48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57,
  A:        65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
  TILDA:    192,

  map: function(map, context, cfg) {
    cfg = cfg || {};
    var ele = $(cfg.ele || document);
    var onkey = function(ev, keyCode, mode) {
      var n, k, i;
      if ((ele === document) || ele.visible()) {
        for(n = 0 ; n < map.length ; ++n) {
          k = map[n];
          k.mode = k.mode || 'up';
          if (Game.Key.match(k, keyCode, mode, context)) {
            k.action.call(context, keyCode, ev.shiftKey);
            return Game.Event.stop(ev);
          }
        }
      }
    };
    ele.on('keydown', function(ev) { return onkey(ev, ev.keyCode, 'down'); });
    ele.on('keyup',   function(ev) { return onkey(ev, ev.keyCode, 'up');   });
  },

  match: function(map, keyCode, mode, context) {
    if (map.mode === mode) {
      if (!map.state || !context || (map.state === context.current) || (is.array(map.state) && map.state.indexOf(context.current) >= 0)) {
        if ((map.key === keyCode) || (map.keys && (map.keys.indexOf(keyCode) >= 0))) {
          return true;
        }
      }
    }
    return false;
  }

};


Game.Math = {

  minmax: function(x, min, max) {
    return Math.max(min, Math.min(max, x));
  },

  random: function(min, max) {
    return (min + (Math.random() * (max - min)));
  },

  randomInt: function(min, max) {
    return Math.round(Game.Math.random(min, max));
  },

  randomChoice: function(choices) {
    return choices[Math.round(Game.Math.random(0, choices.length-1))];
  },

  randomBool: function() {
    return Game.randomChoice([true, false]);
  },

  between: function(x, from, to) {
    return (is.valid(x) && (from <= x) && (x <= to));
  },

  overlap: function(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(((x1 + w1 - 1) < x2) ||
             ((x2 + w2 - 1) < x1) ||
             ((y1 + h1 - 1) < y2) ||
             ((y2 + h2 - 1) < y1))
  }

}


  //===========================================================================
  // GAME TITLE ROTATOR
  //===========================================================================

  var spl_rot = 6000;
  var spl_cyc = 0;
  var spl_loop = "0123456789ABCDEF";

  function splashrot () {

		var spl = document.getElementById("splash");

// shutdown until game over
	  if (spl.style.visibility == "hidden") return;

	  var vid = document.getElementById("introvid");
		var rot;
		rot = spl_rot;

	  if (spl_cyc < 1 || spl_cyc > 12) spl_cyc = 0;
	  spl_cyc++;

	  if (spl_cyc == 1)
	{
			vid.height = spl.height;
			vid.width = spl.width;
			document.splashrot.src = "images/1x1.png";
			vid.src = "images/intro.ogg";
			rot = 44400;
			if (Math.random() < 0.3)		// randomly select g2 intro vid
			{
					vid.src = "images/g2intro.ogg";
					rot = 119850;
			}
			vid.play(); 
			vid.style.visibility = "visible";
		}
	else
// jinky code for alt splash legend instead of / after score box
	{
		vid.load();
		vid.pause();
		vid.style.visibility = "hidden";
//	  if (spl_cyc == 11 && (Math.random() > 0.5)) spl_cyc = 12;
//	  else
//	  if (spl_cyc > 10 && (Math.random() > 0.6)) spl_cyc = 2;
	  if (spl_cyc == 3 && (Math.random() > 0.6)) spl_cyc = 12;

	  if (spl_cyc == 2)
	  {
			document.splashrot.src = "images/splash2.gif"
			rot = 12700;
	  }
	  else
			document.splashrot.src = "images/splash" + spl_loop.substring(spl_cyc,spl_cyc+1) + ".jpg"

		if (spl_cyc == 11)
		if (Math.random() > 0.9) spl_cyc = 2;
		else
		{
				var HSCORE = [ 0, "Names", "character" ];
				var scoredex = readCookieDef("hindex",0,0);
				if (scoredex > 0)
				{
						for (var i = 1; i <= scoredex; i++)
						 {
								HSCORE[i,0] = readCookie(i+"score");
								HSCORE[i,1] = readCookie(i+"name");
								HSCORE[i,2] = readCookie(i+"char");
						 }
						HSCORE.sort((a,b) => a[0] - b[0]);
						var tstr = "";
						 for (i = 1; i <= 6; i++) tstr = tstr + HSCORE[i,0] + "- " + HSCORE[i,1] + "- " + HSCORE[i,2] + ";; ";
//						 alert(tstr);
				 }
		}
	}

	  setTimeout('splashrot()',rot);
  }

// in singleplayer, multiplier rots down to 1
// treasure rooms pause rot - have to detect room time here

  var Mastermult, Masterot, troomtime = 0;

  function multrot () {

		var img = document.getElementById("tweenmsg");

		if (img.style.visibility == "hidden")
	   if (troomtime < 1)
			Masterot = Masterot - 1;

		if (Masterot < 1)
	  {
			Mastermult= Mastermult - 1;
			if (Mastermult >= 5) Mastermult = 4;
			if (Mastermult < 1) Mastermult = 1;
			else
			{
					if (Mastermult > 1) Masterot = 60;
					if (Mastermult > 2) Masterot = 30;
					if (Mastermult > 3) Masterot = 15;
			}
		}
		if (Mastermult > 1) setTimeout('multrot()',1000);

				document.getElementById('scrmult1').innerHTML = Masterot +":" + Mastermult + "x Score";
				document.getElementById('scrmult2').innerHTML = Masterot +":" + Mastermult + "x Score";
				document.getElementById('scrmult3').innerHTML = Masterot +":" + Mastermult + "x Score";
				document.getElementById('scrmult4').innerHTML = Masterot +":" + Mastermult + "x Score";
 };
 
 // distance calc
 
 function distance(px,py,qx,qy)
{ 
	var dx   = px - qx;
	var dy   = py - qy;
	var dist = Math.sqrt( dx*dx + dy*dy );
	return dist;
}

// cookie selector


function createCookie(name,value,days)
{
var domain = "";

//	if (is_ie) domain = ";domain=.newmarkscenic.com";
	if (days) 
		{
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
		}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/"+domain;//+";domain=www.newmarkscenic.com";
}

function readCookie(name)
{
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');

	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function readCookieDef(name,val,days)
{
	var v = readCookie(name);

	if (v == null)
	{
		createCookie(name,val,days);
		return(val);
	}
	else
		return(v);
}

function deleteCookie(name)
{
	createCookie(name,"",-1);
}

/*
(c) by Thomas Konings
Random Name Generator for Javascript
*/

function capFirst(string) {
	if (string != undefined)
		return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRandomInt(min, max) {
  	return Math.floor(Math.random() * (max - min)) + min;
}

function generateName(){
	var name1 = ["abandoned","able","absolute","adorable","adventurous","academic","acceptable","acclaimed","accomplished","accurate","aching","acidic","acrobatic","active","actual","adept","admirable","admired","adolescent","adorable","adored","advanced","afraid","affectionate","aged","aggravating","aggressive","agile","agitated","agonizing","agreeable","ajar","alarmed","alarming","alert","alienated","alive","all","altruistic","amazing","ambitious","ample","amused","amusing","anchored","ancient","angelic","angry","anguished","animated","annual","another","antique","anxious","any","apprehensive","appropriate","apt","arctic","arid","aromatic","artistic","ashamed","assured","astonishing","athletic","attached","attentive","attractive","austere","authentic","authorized","automatic","avaricious","average","aware","awesome","awful","awkward","babyish","bad","back","baggy","bare","barren","basic","beautiful","belated","beloved","beneficial","better","best","bewitched","big","big-hearted","biodegradable","bite-sized","bitter","black","black-and-white","bland","blank","blaring","bleak","blind","blissful","blond","blue","blushing","bogus","boiling","bold","bony","boring","bossy","both","bouncy","bountiful","bowed","brave","breakable","brief","bright","brilliant","brisk","broken","bronze","brown","bruised","bubbly","bulky","bumpy","buoyant","burdensome","burly","bustling","busy","buttery","buzzing","calculating","calm","candid","canine","capital","carefree","careful","careless","caring","cautious","cavernous","celebrated","charming","cheap","cheerful","cheery","chief","chilly","circular","classic","clean","clear","clear-cut","clever","close","closed","cloudy","clueless","clumsy","cluttered","coarse","cold","colorful","colorless","colossal","comfortable","common","compassionate","competent","complete","complex","complicated","composed","concerned","concrete","confused","conscious","considerate","constant","content","conventional","cooked","cool","cooperative","coordinated","corny","corrupt","costly","courageous","courteous","crafty","crazy","creamy","creative","creepy","criminal","crisp","critical","crooked","crowded","cruel","crushing","cuddly","cultivated","cultured","cumbersome","curly","curvy","cute","cylindrical","damaged","damp","dangerous","dapper","daring","darling","dark","dazzling","dead","deadly","deafening","dear","dearest","decent","decimal","decisive","deep","defenseless","defensive","defiant","deficient","definite","definitive","delayed","delectable","delicious","delightful","delirious","demanding","dense","dental","dependable","dependent","descriptive","deserted","detailed","determined","devoted","different","difficult","digital","diligent","dim","dimpled","dimwitted","direct","disastrous","discrete","disfigured","disgusting","disloyal","dismal","distant","downright","dreary","dirty","disguised","dishonest","dismal","distant","distinct","distorted","dizzy","dopey","doting","double","downright","drab","drafty","dramatic","dreary","droopy","dry","dual","dull","dutiful","each","eager","earnest","early","easy","easy-going","ecstatic","edible","educated","elaborate","elastic","elated","elderly","electric","elegant","elementary","elliptical","embarrassed","embellished","eminent","emotional","empty","enchanted","enchanting","energetic","enlightened","enormous","enraged","entire","envious","equal","equatorial","essential","esteemed","ethical","euphoric","even","evergreen","everlasting","every","evil","exalted","excellent","exemplary","exhausted","excitable","excited","exciting","exotic","expensive","experienced","expert","extraneous","extroverted","extra-large","extra-small","fabulous","failing","faint","fair","faithful","fake","false","familiar","famous","fancy","fantastic","far","faraway","far-flung","far-off","fast","fatal","fatherly","favorable","favorite","fearful","fearless","feisty","feline","few","fickle","filthy","fine","finished","firm","first","firsthand","fitting","fixed","flaky","flamboyant","flashy","flat","flawed","flawless","flickering","flimsy","flippant","flowery","fluffy","fluid","flustered","focused","fond","foolhardy","foolish","forceful","forked","formal","forsaken","forthright","fortunate","fragrant","frail","frank","frayed","free","French","fresh","frequent","friendly","frightened","frightening","frigid","frilly","frizzy","frivolous","front","frosty","frozen","frugal","fruitful","full","fumbling","functional","funny","fussy","fuzzy","gargantuan","gaseous","general","generous","gentle","genuine","giant","giddy","gigantic","gifted","giving","glamorous","glaring","glass","gleaming","gleeful","glistening","glittering","gloomy","glorious","glossy","glum","golden","good","good-natured","gorgeous","graceful","gracious","grand","grandiose","granular","grateful","grave","gray","great","greedy","green","gregarious","grim","grimy","gripping","grizzled","gross","grotesque","grouchy","grounded","growing","growling","grown","grubby","gruesome","grumpy","guilty","gullible","gummy","hairy","half","handmade","handsome","handy","happy","happy-go-lucky","hard","hard-to-find","harmful","harmless","harmonious","harsh","hasty","hateful","haunting","healthy","heartfelt","hearty","heavenly","heavy","hefty","helpful","helpless","hidden","hideous","high","high-level","hilarious","hoarse","hollow","homely","honest","honorable","honored","hopeful","horrible","hospitable","bot","huge","humble","humiliating","humming","humongous","hungry","hurtful","husky","icky","icy","ideal","idealistic","identical","idle","idiotic","idolized","ignorant","ill","illegal","ill-fated","ill-informed","illiterate","illustrious","imaginary","imaginative","immaculate","immaterial","immediate","immense","impassioned","impeccable","impartial","imperfect","imperturbable","impish","impolite","important","impossible","impractical","impressionable","impressive","improbable","impure","inborn","incomparable","incompatible","incomplete","inconsequential","incredible","indelible","inexperienced","indolent","infamous","infantile","infatuated","inferior","infinite","informal","innocent","insecure","insidious","insignificant","insistent","instructive","insubstantial","intelligent","intent","intentional","interesting","internal","international","intrepid","ironclad","irresponsible","irritating","itchy","jaded","jagged","jam-packed","jaunty","jealous","jittery","joint","jolly","jovial","joyful","joyous","jubilant","judicious","juicy","jumbo","junior","jumpy","juvenile","kaleidoscopic","keen","key","kind","kindhearted","kindly","klutzy","knobby","knotty","knowledgeable","knowing","known","kooky","kosher","lame","lanky","large","last","lasting","late","lavish","lawful","lazy","leading","lean","leafy","left","legal","legitimate","light","lighthearted","likable","likely","limited","limp","limping","linear","lined","liquid","little","live","lively","livid","loathsome","lone","lonely","long","long-term","loose","lopsided","lost","loud","lovable","lovely","loving","low","loyal","lucky","lumbering","luminous","lumpy","lustrous","luxurious","mad","made-up","magnificent","majestic","major","mammoth","married","marvelous","masculine","massive","mature","meager","mealy","mean","measly","meaty","medical","mediocre","medium","meek","mellow","melodic","memorable","menacing","merry","messy","metallic","mild","milky","mindless","miniature","mine","minty","miserable","miserly","misguided","misty","mixed","modern","modest","moist","monstrous","monthly","monumental","moral","mortified","motherly","motionless","mountainous","muddy","muffled","multicolored","mundane","murky","mushy","musty","muted","mysterious","naive","narrow","nasty","natural","naughty","nautical","near","neat","necessary","needy","negative","neglected","negligible","neighboring","nervous","new","next","nice","nifty","nimble","nippy","nocturnal","noisy","nonstop","normal","notable","noted","noteworthy","novel","noxious","numb","nutritious","nutty","obedient","obese","oblong","oily","oblong","obvious","occasional","odd","oddball","offbeat","offensive","official","old","old-fashioned","only","open","optimal","optimistic","opulent","orange","orderly","organic","ornate","ornery","ordinary","original","other","our","outlying","outgoing","outlandish","outrageous","outstanding","oval","overcooked","overdue","overjoyed","overlooked","palatable","pale","paltry","parallel","parched","partial","passionate","past","pastel","peaceful","peppery","perfect","perfumed","periodic","perky","personal","pertinent","pesky","pessimistic","petty","phony","physical","piercing","pink","pitiful","plain","plaintive","plastic","playful","pleasant","pleased","pleasing","plump","plush","polished","polite","political","pointed","pointless","poised","poor","popular","portly","posh","positive","possible","potable","powerful","powerless","practical","precious","present","prestigious","pretty","precious","previous","pricey","prickly","primary","prime","pristine","private","prize","probable","productive","profitable","profuse","proper","proud","prudent","punctual","pungent","puny","pure","purple","pushy","putrid","puzzled","puzzling","quaint","qualified","quarrelsome","quarterly","queasy","querulous","questionable","quick","quick-witted","quiet","quintessential","quirky","quixotic","quizzical","radiant","ragged","rapid","rare","rash","raw","recent","reckless","rectangular","ready","real","realistic","reasonable","red","reflecting","regal","regular","reliable","relieved","remarkable","remorseful","remote","repentant","required","respectful","responsible","repulsive","revolving","rewarding","rich","rigid","right","ringed","ripe","roasted","robust","rosy","rotating","rotten","rough","round","rowdy","royal","rubbery","rundown","ruddy","rude","runny","rural","rusty","sad","safe","salty","same","sandy","sane","sarcastic","sardonic","satisfied","scaly","scarce","scared","scary","scented","scholarly","scientific","scornful","scratchy","scrawny","second","secondary","second-hand","secret","self-assured","self-reliant","selfish","sentimental","separate","serene","serious","serpentine","several","severe","shabby","shadowy","shady","shallow","shameful","shameless","sharp","shimmering","shiny","shocked","shocking","shoddy","short","short-term","showy","shrill","shy","sick","silent","silky","silly","silver","similar","simple","simplistic","sinful","single","sizzling","skeletal","sleepy","slight","slim","slimy","slippery","slow","slushy","small","smart","smoggy","smooth","smug","snappy","snarling","sneaky","sniveling","snoopy","sociable","soft","soggy","solid","somber","some","spherical","sophisticated","sore","sorrowful","soulful","soupy","sour","Spanish","sparkling","sparse","specific","spectacular","speedy","spicy","spiffy","spirited","spiteful","splendid","spotless","spotted","spry","square","squeaky","squiggly","stable","staid","stained","stale","standard","starchy","stark","starry","steep","sticky","stiff","stimulating","stingy","stormy","straight","strange","steel","strict","strident","striking","striped","strong","studious","stunning","stupendous","stupid","sturdy","stylish","subdued","submissive","substantial","subtle","suburban","sudden","sugary","sunny","super","superb","superficial","superior","supportive","sure-footed","surprised","suspicious","svelte","sweaty","sweet","sweltering","swift","sympathetic","tall","talkative","tame","tan","tangible","tart","tasty","tattered","taut","tedious","teeming","tempting","tender","tense","tepid","terrible","terrific","testy","thankful","that","these","thick","thin","third","thirsty","this","thorough","thorny","those","thoughtful","threadbare","thrifty","thunderous","tidy","tight","timely","tinted","tiny","tired","torn","total","tough","traumatic","treasured","tremendous","tragic","trained","tremendous","triangular","tricky","trifling","trim","trivial","troubled","true","trusting","trustworthy","trusty","truthful","tubby","turbulent","twin","ugly","ultimate","unacceptable","unaware","uncomfortable","uncommon","unconscious","understated","unequaled","uneven","unfinished","unfit","unfolded","unfortunate","unhappy","unhealthy","uniform","unimportant","unique","united","unkempt","unknown","unlawful","unlined","unlucky","unnatural","unpleasant","unrealistic","unripe","unruly","unselfish","unsightly","unsteady","unsung","untidy","untimely","untried","untrue","unused","unusual","unwelcome","unwieldy","unwilling","unwitting","unwritten","upbeat","upright","upset","urban","usable","used","useful","useless","utilized","utter","vacant","vague","vain","valid","valuable","vapid","variable","vast","velvety","venerated","vengeful","verifiable","vibrant","vicious","victorious","vigilant","vigorous","villainous","violet","violent","virtual","virtuous","visible","vital","vivacious","vivid","voluminous","wan","warlike","warm","warmhearted","warped","wary","wasteful","watchful","waterlogged","watery","wavy","wealthy","weak","weary","webbed","wee","weekly","weepy","weighty","weird","welcome","well-documented","well-groomed","well-informed","well-lit","well-made","well-off","well-to-do","well-worn","wet","which","whimsical","whirlwind","whispered","white","whole","whopping","wicked","wide","wide-eyed","wiggly","wild","willing","wilted","winding","windy","winged","wiry","wise","witty","wobbly","woeful","wonderful","wooden","woozy","wordy","worldly","worn","worried","worrisome","worse","worst","worthless","worthwhile","worthy","wrathful","wretched","writhing","wrong","wry","yawning","yearly","yellow","yellowish","young","youthful","yummy","zany","zealous","zesty","zigzag","rocky"];

	var name2 = ["people","history","way","art","world","information","map","family","government","health","system","computer","meat","year","thanks","music","person","reading","method","data","food","understanding","theory","law","bird","literature","problem","software","control","knowledge","power","ability","economics","love","internet","television","science","library","nature","fact","product","idea","temperature","investment","area","society","activity","story","industry","media","thing","oven","community","definition","safety","quality","development","language","management","player","variety","video","week","security","country","exam","movie","organization","equipment","physics","analysis","policy","series","thought","basis","boyfriend","direction","strategy","technology","army","camera","freedom","paper","environment","child","instance","month","truth","marketing","university","writing","article","department","difference","goal","news","audience","fishing","growth","income","marriage","user","combination","failure","meaning","medicine","philosophy","teacher","communication","night","chemistry","disease","disk","energy","nation","road","role","soup","advertising","location","success","addition","apartment","education","math","moment","painting","politics","attention","decision","event","property","shopping","student","wood","competition","distribution","entertainment","office","population","president","unit","category","cigarette","context","introduction","opportunity","performance","driver","flight","length","magazine","newspaper","teaching","cell","dealer","debate","finding","lake","member","message","phone","scene","appearance","association","concept","customer","death","discussion","housing","inflation","insurance","mood","woman","advice","blood","effort","expression","importance","opinion","payment","reality","responsibility","situation","skill","statement","wealth","application","city","county","depth","estate","foundation","grandmother","heart","perspective","photo","recipe","studio","topic","collection","depression","imagination","passion","percentage","resource","setting","ad","agency","college","connection","criticism","debt","description","memory","patience","secretary","solution","administration","aspect","attitude","director","personality","psychology","recommendation","response","selection","storage","version","alcohol","argument","complaint","contract","emphasis","highway","loss","membership","possession","preparation","steak","union","agreement","cancer","currency","employment","engineering","entry","interaction","limit","mixture","preference","region","republic","seat","tradition","virus","actor","classroom","delivery","device","difficulty","drama","election","engine","football","guidance","hotel","match","owner","priority","protection","suggestion","tension","variation","anxiety","atmosphere","awareness","bread","climate","comparison","confusion","construction","elevator","emotion","employee","employer","guest","height","leadership","mall","manager","operation","recording","respect","sample","transportation","boring","charity","cousin","disaster","editor","efficiency","excitement","extent","feedback","guitar","homework","leader","mom","outcome","permission","presentation","promotion","reflection","refrigerator","resolution","revenue","session","singer","tennis","basket","bonus","cabinet","childhood","church","clothes","coffee","dinner","drawing","hair","hearing","initiative","judgment","lab","measurement","mode","mud","orange","poetry","police","possibility","procedure","queen","ratio","relation","restaurant","satisfaction","sector","signature","significance","song","tooth","town","vehicle","volume","wife","accident","airport","appointment","arrival","assumption","baseball","chapter","committee","conversation","database","enthusiasm","error","explanation","farmer","gate","girl","hall","historian","hospital","injury","instruction","maintenance","manufacturer","meal","perception","pie","poem","presence","proposal","reception","replacement","revolution","river","son","speech","tea","village","warning","winner","worker","writer","assistance","breath","buyer","chest","chocolate","conclusion","contribution","cookie","courage","desk","drawer","establishment","examination","garbage","grocery","honey","impression","improvement","independence","insect","inspection","inspector","king","ladder","menu","penalty","piano","potato","profession","professor","quantity","reaction","requirement","salad","sister","supermarket","weakness","wedding","affair","ambition","analyst","apple","assignment","assistant","bathroom","bedroom","beer","birthday","celebration","championship","cheek","client","consequence","departure","diamond","dirt","ear","fortune","friendship","funeral","gene","girlfriend","hat","indication","intention","lady","midnight","negotiation","obligation","passenger","pizza","platform","poet","pollution","recognition","reputation","shirt","speaker","stranger","surgery","sympathy","tale","throat","trainer","uncle","youth","time","work","film","water","money","example","while","business","study","game","life","form","air","day","place","number","part","field","fish","back","process","heat","hand","experience","job","book","end","point","type","home","economy","value","body","market","guide","interest","state","radio","course","company","price","size","card","list","mind","trade","line","care","group","risk","word","force","key","light","training","name","school","top","amount","level","order","practice","research","sense","service","piece","web","boss","sport","fun","house","page","term","test","answer","sound","focus","matter","kind","soil","board","oil","picture","access","garden","range","rate","reason","future","site","demand","exercise","image","case","cause","coast","action","age","bad","boat","record","result","section","building","mouse","cash","class","period","plan","store","tax","side","subject","space","rule","stock","weather","chance","figure","man","model","source","beginning","earth","program","chicken","design","feature","head","material","purpose","question","rock","salt","act","car","dog","object","scale","sun","note","profit","rent","speed","style","war","bank","craft","half","inside","outside","standard","bus","exchange","eye","fire","position","pressure","stress","advantage","benefit","box","frame","issue","step","cycle","face","item","metal","paint","review","room","screen","structure","view","account","ball","discipline","medium","share","balance","bit","black","bottom","choice","gift","impact","machine","shape","tool","wind","address","average","career","culture","morning","pot","sign","table","task","condition","contact","credit","egg","hope","ice","network","north","square","attempt","date","effect","link","post","star","voice","capital","challenge","friend","self","shot","brush","couple","exit","front","function","lack","living","plant","plastic","spot","summer","taste","theme","track","wing","brain","button","click","desire","foot","gas","influence","notice","rain","wall","base","damage","distance","feeling","pair","savings","staff","sugar","target","text","animal","author","budget","discount","file","ground","lesson","minute","officer","phase","reference","register","sky","stage","stick","title","trouble","bowl","bridge","campaign","character","club","edge","evidence","fan","letter","lock","maximum","novel","option","pack","park","quarter","skin","sort","weight","baby","background","carry","dish","factor","fruit","glass","joint","master","muscle","red","strength","traffic","trip","vegetable","appeal","chart","gear","ideal","kitchen","land","log","mother","net","party","principle","relative","sale","season","signal","spirit","street","tree","wave","belt","bench","commission","copy","drop","minimum","path","progress","project","sea","south","status","stuff","ticket","tour","angle","blue","breakfast","confidence","daughter","degree","doctor","dot","dream","duty","essay","father","fee","finance","hour","juice","luck","milk","mouth","peace","pipe","stable","storm","substance","team","trick","afternoon","bat","beach","blank","catch","chain","consideration","cream","crew","detail","gold","interview","kid","mark","mission","pain","pleasure","score","screw","sex","shop","shower","suit","tone","window","agent","band","bath","block","bone","calendar","candidate","cap","coat","contest","corner","court","cup","district","door","east","finger","garage","guarantee","hole","hook","implement","layer","lecture","lie","manner","meeting","nose","parking","partner","profile","rice","routine","schedule","swimming","telephone","tip","winter","airline","bag","battle","bed","bill","bother","cake","code","curve","designer","dimension","dress","ease","emergency","evening","extension","farm","fight","gap","grade","holiday","horror","horse","host","husband","loan","mistake","mountain","nail","noise","occasion","package","patient","pause","phrase","proof","race","relief","sand","sentence","shoulder","smoke","stomach","string","tourist","towel","vacation","west","wheel","wine","arm","aside","associate","bet","blow","border","branch","breast","brother","buddy","bunch","chip","coach","cross","document","draft","dust","expert","floor","god","golf","habit","iron","judge","knife","landscape","league","mail","mess","native","opening","parent","pattern","pin","pool","pound","request","salary","shame","shelter","shoe","silver","tackle","tank","trust","assist","bake","bar","bell","bike","blame","boy","brick","chair","closet","clue","collar","comment","conference","devil","diet","fear","fuel","glove","jacket","lunch","monitor","mortgage","nurse","pace","panic","peak","plane","reward","row","sandwich","shock","spite","spray","surprise","till","transition","weekend","welcome","yard","alarm","bend","bicycle","bite","blind","bottle","cable","candle","clerk","cloud","concert","counter","flower","grandfather","harm","knee","lawyer","leather","load","mirror","neck","pension","plate","purple","ruin","ship","skirt","slice","snow","specialist","stroke","switch","trash","tune","zone","anger","award","bid","bitter","boot","bug","camp","candy","carpet","cat","champion","channel","clock","comfort","cow","crack","engineer","entrance","fault","grass","guy","hell","highlight","incident","island","joke","jury","lip","mate","motor","nerve","passage","pen","pride","priest","prize","promise","resident","resort","ring","roof","rope","sail","scheme","script","sock","station","toe","tower","truck","witness","can","will","other","use","make","good","look","help","go","great","being","still","public","read","keep","start","give","local","general","specific","long","play","feel","high","put","common","set","change","simple","past","big","possible","particular","major","personal","current","national","cut","natural","physical","show","try","check","second","call","move","pay","let","increase","single","individual","turn","ask","buy","guard","hold","main","offer","potential","professional","international","travel","cook","alternative","special","working","whole","dance","excuse","cold","commercial","low","purchase","deal","primary","worth","fall","necessary","positive","produce","search","present","spend","talk","creative","tell","cost","drive","green","support","glad","remove","return","run","complex","due","effective","middle","regular","reserve","independent","leave","original","reach","rest","serve","watch","beautiful","charge","active","break","negative","safe","stay","visit","visual","affect","cover","report","rise","walk","white","junior","pick","unique","classic","final","lift","mix","private","stop","teach","western","concern","familiar","fly","official","broad","comfortable","gain","rich","save","stand","young","heavy","lead","listen","valuable","worry","handle","leading","meet","release","sell","finish","normal","press","ride","secret","spread","spring","tough","wait","brown","deep","display","flow","hit","objective","shoot","touch","cancel","chemical","cry","dump","extreme","push","conflict","eat","fill","formal","jump","kick","opposite","pass","pitch","remote","total","treat","vast","abuse","beat","burn","deposit","print","raise","sleep","somewhere","advance","consist","dark","double","draw","equal","fix","hire","internal","join","kill","sensitive","tap","win","attack","claim","constant","drag","drink","guess","minor","pull","raw","soft","solid","wear","weird","wonder","annual","count","dead","doubt","feed","forever","impress","repeat","round","sing","slide","strip","wish","combine","command","dig","divide","equivalent","hang","hunt","initial","march","mention","spiritual","survey","tie","adult","brief","crazy","escape","gather","hate","prior","repair","rough","sad","scratch","sick","strike","employ","external","hurt","illegal","laugh","lay","mobile","nasty","ordinary","respond","royal","senior","split","strain","struggle","swim","train","upper","wash","yellow","convert","crash","dependent","fold","funny","grab","hide","miss","permit","quote","recover","resolve","roll","sink","slip","spare","suspect","sweet","swing","twist","upstairs","usual","abroad","brave","calm","concentrate","estimate","grand","mine","prompt","quiet","refuse","regret","reveal","rush","shake","shift","shine","steal","suck","surround","bear","brilliant","dare","dear","delay","drunk","hurry","inevitable","invite","kiss","neat","pop","punch","quit","reply","representative","resist","rip","rub","silly","smile","spell","stretch","stupid","tear","temporary","tomorrow","wake","wrap","yesterday","Thomas","Tom","Lieuwe"];

	var name3 = ["Ideal for a", "Guild of Dagger and", "Arrow and", "Fang and", "Sword and", "Fellowship of Blessed", "Thorns of", "Arrows of", "Guild of", "Shields of", "Fellowship of", "Circle of", "Covenant of", "Rangers of", "Council of", "Knights of", "Hounds of", "Eldritch", "Crimson", "Earthquake", "Legostevens", "Jimenezlotus", "Hernandehat", "Campbestat", "Bilders Bagmartin", "Remlend", "Iron", "Emerald", "Ruby", "Golden", "White", "Black", "Azure", "Silver", "Sori's", "Johnson's", "Tera's", "Andom's", "Draki's", "Mara's", "Bellee's", "Lokiee's", "Rathi's", "Wrichy's", "Miray's", "Helrose", "Prispell", "Gantin", "Chenixie","Ricemus"
	];
	var name4 = ["goblin", "pixie", "Orb", "Caleah", "Haukrefell", "Swords", "Falcons", "Bears", "Arrow", "Silver Bear", "Wayfarers", "Demons", "Angels", "Snakhagr", "Foxes", "Wyverns", "Heroes", "Tome", "Shields", "Arhill", "Lions", "Sword", "Bears", "Crastow", "Ravens", "Wands", "Ring", "Dragons", "Scepter", "Arrows", "Company", "Order", "Circle", "Arrows", "Tome", "Baford", "Foxes", "Heroes", "Wand", "Dragoons", "Jade Wand", "Adventurers", "Angel", "Fangs", "Crown", "Guild", "Axelbekkr", "Demons", "Wedon", "Llani", "Bears", "Glenhowa", "Herickering", "Crawood", "Jorlaf", "Capriyoung", "Galick", "Dumblediaz", "Godore", "Gonzacked", "Murranazzo", "Forestcher", "Huntalka", "Edwackering", "Aumtierrez", "Shlewis Shham", "Bailenga", "Hamiltonstinkmoore", "Piranhao'conno", "Devastation", "Archion", "Onixath"
	];

	var name1b = capFirst(name1[getRandomInt(0, name1.length + 1)]);
	var name2b = capFirst(name2[getRandomInt(0, name2.length + 1)]);

	if (Math.random() < 0.8) name1b = capFirst(name3[getRandomInt(0, name3.length + 1)]);
	if (Math.random() < 0.7) name2b = capFirst(name4[getRandomInt(0, name4.length + 1)]);
	return name1b + ' ' + name2b;

}