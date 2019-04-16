load_code(6)
setInterval(function(){}
if (!character.moving){
  parent.socket.emit("merchant", {num:41});
  //Potions And Looting
  setInterval(function () {
      loot();

      //Heal With Potions if we're below 75% hp.
      if (character.hp / character.max_hp < 0.75 || character.mp / character.max_mp < 0.75) {
          use_hp_or_mp();
      }
  }, 500 );//Execute 2 times per second

  //Draws a circle of range around merchant where his range is
  setInterval(function(){
  	clear_drawings()
  	draw_circle(character.real_x, character.real_y, 320)
  }, 50);
  //this code allows your merchant to give luck boosts to anyone within range
  setInterval(function(){

  	//searches everyone nearby
  	for(id in parent.entities)
  	{
  		var current = parent.entities[id];

  		//makes sure its a player
  		if(current && current.type == 'character' && !current.npc)
  		{
  			//determines if they already have a mluck boost
  			if(current.s.mluck)
  			{
  				//checks to see if the boost is from you
  				if(current.s.mluck.f && current.s.mluck.f != character.name)
  				{
  					//boosts them if they are in range
  					if(Math.sqrt((character.real_x-current.real_x)*
  								 (character.real_x-current.real_x)+
  								 (character.real_y-current.real_y)*
  								 (character.real_y-current.real_y)) < 320)
  					{
  						luck(current);
  					}
  				}
  			}
  			else
  			{
  				//if they dont already have a boost then boost them
  				if(Math.sqrt((character.real_x-current.real_x)*
  								 (character.real_x-current.real_x)+
  								 (character.real_y-current.real_y)*
  								 (character.real_y-current.real_y)) < 320)
  				{
  					luck(current);
  				}
  			}
  		}
  	}
  }, 50);

  var lastluck = new Date(0);
  function luck(target){
  	// Luck only if not on cd (cd is .1sec).
  	if((new Date() - lastluck > 100)){
  		parent.socket.emit("skill", {name: "mluck", id: target.id});
  		set_message(target.name);
  		lastluck = new Date();
  	}

  }

},500);

setInterval(function(){
    if(character.moving){
        parent.socket.emit("merchant", {close:41});
        //Potions And Looting
        setInterval(function () {
            loot();

            //Heal With Potions if we're below 75% hp.
            if (character.hp / character.max_hp < 0.75 || character.mp / character.max_mp < 0.75) {
                use_hp_or_mp();
            }
        }, 500 );//Execute 2 times per second

        //Draws a circle of range around merchant where his range is
        setInterval(function(){
        	clear_drawings()
        	draw_circle(character.real_x, character.real_y, 320)
        }, 50);
        //this code allows your merchant to give luck boosts to anyone within range
        setInterval(function(){

        	//searches everyone nearby
        	for(id in parent.entities)
        	{
        		var current = parent.entities[id];

        		//makes sure its a player
        		if(current && current.type == 'character' && !current.npc)
        		{
        			//determines if they already have a mluck boost
        			if(current.s.mluck)
        			{
        				//checks to see if the boost is from you
        				if(current.s.mluck.f && current.s.mluck.f != character.name)
        				{
        					//boosts them if they are in range
        					if(Math.sqrt((character.real_x-current.real_x)*
        								 (character.real_x-current.real_x)+
        								 (character.real_y-current.real_y)*
        								 (character.real_y-current.real_y)) < 320)
        					{
        						luck(current);
        					}
        				}
        			}
        			else
        			{
        				//if they dont already have a boost then boost them
        				if(Math.sqrt((character.real_x-current.real_x)*
        								 (character.real_x-current.real_x)+
        								 (character.real_y-current.real_y)*
        								 (character.real_y-current.real_y)) < 320)
        				{
        					luck(current);
        				}
        			}
        		}
        	}
        }, 50);

        var lastluck = new Date(0);
        function luck(target){
        	// Luck only if not on cd (cd is .1sec).
        	if((new Date() - lastluck > 100)){
        		parent.socket.emit("skill", {name: "mluck", id: target.id});
        		set_message(target.name);
        		lastluck = new Date();
        	}

        }
    }
},500);
