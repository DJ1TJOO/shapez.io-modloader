# Shapez.io multiplayer

The server for multiplayer are not longer running. See [Setting up a server](#setting-up-a-server) to create your own

This mod adds multiplayer to shapez.io. 
- The game is hosted at `https://mods.thomasbrants.nl`
- Its only in English and Dutch (Not much more text has been added).

##How to add mutliplayer mod on modloader:
If no existing instance:
1. Go to http://mods.thomasbrants.nl/
2. Login with discord
3. Hover over avatar
4. Click Dashboard
5. Create an instance (with out - in the name, you won't be able to delete it)
6. Read If existing instance

If existing instance:
1. Go to mods (http://mods.thomasbrants.nl/mods)
2. Go to the multiplayer mod
3. Click Add to instance
4. Select instance
5. Go back to the dashboard
6. Go to the instance and hit play

## Host/ PC 1 
1. Create a world with normal single player or an already existing world
2. save that world and leave
3. go to multiplayer
4. play the world
5. enter a gameserver for example: wss://thomasbrants.nl:8889
--> then you get room code

## Others / PC 2
1. go to multiplayer
2. click join
3. enter the same gameserver
4. enter room code

## Setting up a server
1. Have nodejs and yarn installed (https://nodejs.org/en/download/, https://classic.yarnpkg.com/en/docs/install/#windows-stable)
2. Download the files from https://github.com/DJ1TJOO/shapez.io-modloader/tree/MultiplayerMod/multiplayer_server
3. Change secure, in server.js, too true/false depening on if you have a ssl certificate.
4. Open a terminal/cmd in the folder and run `yarn`
5. Then to start run `node server`
6. The game server is `ws://localhost:8889`
7. Port foreward to play with friends

<hr>
# Coding:
# Setup modloader

-   cd ./modloader
-   yarn
-   cd gulp
-   yarn

# Setup mod

-   cd empty_mod
-   yarn

rename empty_mod folder to your mods name
in ./empty_mod/src/js/main.js add uuid and change other info,
in ./modloader/src/js/main.js uncomment the empty_mod and change the uuid

# Run mod

## Terminal 1:

-   cd ./empty_mod
-   gulp

## Terminal 2:

-   cd ./modloader/gulp
-   gulp
