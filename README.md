My Js13kGames 2016 competition entry on the theme "Glitch".

Goal
----

You are a Blade Gunner, a member of an elite unit whose job is to retire glitchy androids before they become a danger to the civilian population. Be careful not to inflict casualties yourself in the process.

Where to play
-------------
Latest version: [http://herebefrogs.com/bladegunner/](http://herebefrogs.com/bladegunner/)

Js13kGames entry: [http://js13kgames.com/entries/blade-gunner](http://js13kgames.com/entries/blade-gunner)

Controls
-----------
Move: arrow keys / WASD (English keyboard) / ZQSD (French keyboard)

Shoot: space bar.

Desktop only (sorry, no touch control).

Running the code
-------------
Run the development version (no code compression):

	cd src
	python -m SimpleHTTPServer

Run the compressed version:

	npm install
	gulp encode // inline external images into JavaScript code
	gulp build  // compress Javascript code
	cd build
	python -m SimpleHTTPServer
	
My Post Mortem on making Blade Gunner: [https://medium.com/@herebefrogs/blade-gunner-js13kgames-2016-post-mortem-6786d2237733](https://goo.gl/vNsWov)








