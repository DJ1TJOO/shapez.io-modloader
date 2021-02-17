# Setup modloader

-   ./setup_modloader

#### or

-   cd ./modloader
-   yarn
-   cd gulp
-   yarn

# Setup mod

-   ./setup_mod

#### or

-   cd mod
-   yarn
-   add atlas folder to the mod
-   add themes folder to the mod
-   add icons folder to the mod

optional: rename mod folder to your mods name, then also change the mod.bat

in ./mod/src/js/main.js add uuid and change other info,
in ./modloader/src/js/main.js change the uuid

# Run mod

### Terminal 1:

-   ./modloader

#### or

-   cd ./modloader/gulp
-   gulp

### Terminal 2:

-   ./mod

#### or

-   cd ./mod
-   gulp
