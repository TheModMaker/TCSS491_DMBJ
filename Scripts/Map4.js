/////////////////////////////////////////////////////////////////////
//
// Map1.js - Defines the first map for the game.
//
// Load Dependencies - MapBase
// Use  Dependencies - <none>
//

(function() {
  var map = new Map("\n\
---============================================================================---=========\n\
                                                                                           \n\                                                                                                                                                                          \n\
                                                                                           \n\
                                                                                           \n\
                                                                                           \n\
 + #                                                                            a          \n\
-----    ----     ---    ---   ----      ---      ----      ----      -====================\n\
===                                                                   -====================\n\
===                                                                   -====================\n\
===                                                                   -====================\n\
===                                                                   -====================\n\
===                                                                   -====================\n\
===                                                                   -====================\n\
===~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-         -====================\n\
===----------------------------------------------------------         -====================\n\
===                                                                    -===================\n\
===                                                                    -===================\n\
===                                                                    -===================\n\
===                                                                    -===================\n\
===                                                                    -===================\n\
===                                                                    -===================\n\
===                                                                    -===================\n\
===   ====                                                             -===================\n\
===   =  A                                                             -===================\n\
===   =* A                                                             -===================\n\
===   ====                                                             -===================\n\
===                                                                    -===================\n\
===                                                                    ====================\n\
===                                                                    ====================\n\
===       ------------                       -------                  =====================\n\
===-~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~=====================");                                                                                                                                                                 
	map.assets['~'] = 34;
    map.backgroundMusic = ASSETS["back4"];


	MAPS.push(map);
})();