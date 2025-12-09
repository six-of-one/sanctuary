Sanctuary
=========

Javascript engine;
 Gauntlet-style Game

 - not ready for distribution, though it is very playable
 - a few serious hurdles stand in the way of any public release

SUPPORTED BROWSERS
==================

 - this is still a mixed bag - different browsers may have vars issues
 - the following command (python 3 required) will run a local server
             python3 -m http.server -b "::" 8080
   \_ connect by loading http://127.0.0.1:8080

   the best result for true local (direct loaded files) is firefox vers 0.7 or earlier

KNOWN ISSUES
============

 - some browsers have display problems and media load issues
 - No support for touch/mobile devices
 - unknown possibilities for local multiplayer support

DEVELOPMENT
===========

The game is 100% client side javascript and css.

Any changes to these files will be reflected immediately on refresh

  - js/gauntlet.js
  - css/gauntlet.css
  - images/
  - sounds/
  - levels/

However, if you modify the js/game/ or js/vendor/ javascript files, the unified versions need to be regenerated:

    js/vendor.js        # the unified 3rd party vendor scripts (sizzle, animator, audio-fx, stats, state-machine)
    js/game.js          # the unified general purpose game engine

If you have the Ruby language available, Rake tasks can be used to auto generate these unified files:

    rake assets:create   # re-create unified javascript/css asset files on demand
    rake assets:server   # run a simple rack server that automatically regenerates the unified files when the underlying source is modified

Attributions
=============

based in part on -

https://codeincomplete.com/articles/javascript-gauntlet/

License
=======

new code and various:
[GPL2](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)

original code and engine package:
[MIT](http://en.wikipedia.org/wiki/MIT_License) license.

