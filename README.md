# Setup modloader

-   cd ./modloader
-   yarn
-   cd gulp
-   yarn

# Setup mod

-   cd empty_mod
-   yarn
-   add atlas folder to the empty_mod

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
