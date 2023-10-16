Javascript Gauntlet
===================

A Gauntlet-style Game

 - not ready for distribution, though it is very playable
 - a few serious hurdles stand in the way of any public release

SUPPORTED BROWSERS
==================

 - this is a real mixed bag - all new browsers either fail miserably or require significant
   command line workarounds - honestly the best result for local play is firefox vers 0.57 or earlier

KNOWN ISSUES
============

 - new browser versions will likely not run this due to all kinds of "feature" additions
   \ planned instructions will be added to the eventual release with an archive copy of firefox
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

