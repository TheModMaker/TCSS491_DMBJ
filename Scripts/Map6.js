/////////////////////////////////////////////////////////////////////
//
// Map1.js - Defines the first map for the game.
//
// Load Dependencies - MapBase
// Use  Dependencies - <none>
//

(function() {
	var map = new Map("\n\
==============================~~~~~~~~~~~~~~=============--------========================================================---===========================================\n\
=  ---         -   - ---  =  =~~ ~~                        -------=                                                                                                   =\n\
= -      --    -  -  -    =  =~ * ~                   ~~-  -------=                                                                                                   =\n\
= -     -  -   ---   ---  =  === ================     ~--  -- ----=                                                                                                   =\n\
= -    ------  -  -  -    =  ====---------------=     ~--  - * ---=                                                                                                   =\n\
=  --- -     - -   - ---- =  -------------------====  ~--  -- ----=                                                                                                   =\n\
=                         =  -      -------      --=  ~--  -------=                                                                                                   =\n\
= --- +                   =  ---~~-----------~~----=  ~--  -------=                                                                                                   -\n\
==---===============      =  ----------------------=  ~--  ========                                                       *                                           -\n\
=~         -----====    ===  ----------------------=  ~--                                                                ***                                          -\n\
=~         -----=       =    ------  ~~   ---------=  ~--    ~~~~~~                                                       *                                           -\n\
==~  ~==-  -----=       =    ---   -------  -------=  ~----  ~----=                                                       ~                                   =========\n\
-=~  ~=--  -----=  ----==    =-- ---------- -------=  ~----~~~----=                                                      ~~~                                  =========\n\
-=~  ~=--  --====  -----=    ==--------------------=  ~-----------=                                                      ===                                  =       =\n\
-=~  ~=--    ===   --- -=     =--------------------=  ~-----------=                                                      = =                                          =\n\
-=~  ~=--          --- -=     =--------------------=  ~-----------=                                                      = =                                          =\n\
-=~  ~=--          --- -=     =-----           ----=  ~---- ------=                                                  ============                                     =\n\
-=~  ~=------====  --- -=     =-----           ----=  ~--- * -----=                                              ==================                                   =\n\
-=~  ~=----------  --- -=                 -           ~---- ------=                                            =====================                                  =\n\
-=~  ~=---------   --- -=                 -           ~-----------=                                          ==                   ==                                  =\n\
-=~  ~=---------   --- -=     ====~~      -    -----  ~-----------=                                        ==~~~~~~~~~~~~~~~~~~~~~==                                  =\n\
-=~  ~=        ====--- -=     =-----      -    ----=  ~-----------=                                       ==                      ==                                  =\n\
-=~            =------ -=     =-----  --  -      --=  ~-----------=                                       ==                      ==                                  =\n\
-==      ---           -=     =-----  --         --=  ~-----------=                                       ==~~~~~~~~~~~~~~~~~~~~~~==                                  =\n\
---=========           -=     =-----  -        ----=  ~------ ----=                                       ==~~~~~~~~~~~~~~~~~~~~~~==                                  =\n\
------          --------=     =-----  -      ------=  ~----- * ---=                                       ==                      ==                                  =\n\
------    ~~    --------=     =-----       --------=  ~------ ----=                                       ==========================                                  =\n\
------    ~--------------=    =-----     ----------=  ~-----------=                                       --------------------------                                  =\n\
------     --------------=    =-----     ----------=  ~-----------=                                                                                                   =\n\
-                             =-----                  ~-----------=                                                                                                   =\n\
-                             =-----                  ~-----------=                                                                                                   =\n\
------------------------------------~~----------------------------~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
	map.assets['~'] = 34;

	MAPS.push(map);
})();