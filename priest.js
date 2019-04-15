var group = ["Sozaw", "Sozap", "Sozar"];

setInterval(function () {
    if (character.name == group[0]) {
        for (let i = 1; i < group.length; i++) {
            let name = group[i];
            send_party_invite(name);
        }
    } else {
        if (character.party) {
            if (character.party != group[0]) {
                parent.socket.emit("party", {event: "leave"})
            }
        } else {
            send_party_request(group[0]);
        }
    }
}, 1000 * 10);

function on_party_request(name) {
    console.log("Party Request");
    if (group.indexOf(name) != -1) {
        accept_party_request(name);
    }
}
function on_party_invite(name) {
    console.log("Party Invite");
    if (group.indexOf(name) != -1) {
        accept_party_invite(name);
    }
}

var Sozaw = get_player("Sozaw")
setInterval(function ()
{
	let unwanted_items = ["hpamulet", "hpbelt", "firestaff", "fireblade", "ringsj", "wcap", "wshoes"];
	let items = parent.character.items
	for(let i = 2; i < 42; i++) {
		if ((items[i]) != null) {
    		if(unwanted_items.indexOf(items[i].name) > -1) {
				destroy_item(i)
			}
		}
	}
}, 100);
game_log("---Script Start---");
//load_code(11)
//Put monsters you want to kill in here
var monster_targets = ["bat", "phoenix", "mvampire"];

var state = "farm";

var min_potions = 50; //The number of potions at which to do a resupply run.
var purchase_amount = 200;//How many potions to buy at once.
var potion_types = ["hpot0", "mpot0"];//The types of potions to keep supplied.

//Show character range
//setInterval(function(){
//	clear_drawings()
//	draw_circle(character.real_x, character.real_y, parent.character.range, 1, //0xD2F33E)
//	let player = get_player("Sozaw");
//	if (player == null) return;
//	if (player.visible == null) return;
//	draw_circle(get_player("Sozaw").real_x, get_player("Sozaw").real_y, get_player("Sozaw").range)
//}, 50);

//Send Items to merchant if in range
setInterval(function ()
{
	let items = parent.character.items
	let player = get_player("Sozam");
	if (player == null) return;
	if (player.visible == null) return;
	for(let i = 2; i < 42; i++) {
    	if ((items[i]) != null) {
			send_item(player, i, 1)
		}
	}
}, 1000);
//Send Gold to merchant if in range
setInterval(function ()
{
	let player = get_player("Sozam");
	let gold = character.gold
	if (player == null) return;
	if (player.visible == null) return;
		if (gold > 500000) {
			send_gold(player, gold - 500000)
		}
}, 1000);
//Movement And Attacking
setInterval(function () {

	//Determine what state we should be in.
	state_controller();

	//Switch statement decides what we should do based on the value of 'state'
	switch(state)
	{
		case "farm":
			farm();
			break;
		case "resupply_potions":
			resupply_potions();
			break;
		case "follow":
			follow()
			break;
	}
}, 100);//Execute 10 times per second

//Potions And Looting
setInterval(function () {
    loot();

    //Heal With Potions if we're below 75% hp.
    if (character.hp / character.max_hp < 0.75 || character.mp / character.max_mp < 0.75) {
        use_hp_or_mp();
    }
}, 500 );//Execute 2 times per second

function state_controller()
{
	//Default to farming
	var new_state = "farm";

	if (get_target_of(Sozaw) == null)
	{
			new_state = "follow"
	}

	//Do we need potions?
	for(type_id in potion_types)
	{
		var type = potion_types[type_id];

		var num_potions = num_items(type);

		if(num_potions < min_potions)
		{
			new_state = "resupply_potions";
			break;
		}
	}

	if(state != new_state)
	{
		state = new_state;
	}

}
//This function makes you follow the warrior
function follow()
{
	var lowest_health = lowest_health_partymember();

    //If we have a target to heal, heal them. Otherwise attack a target.
    if (lowest_health != null && lowest_health.health_ratio < 0.8) {
        if (distance_to_point(lowest_health.real_x, lowest_health.real_y) < character.range) {
            heal(lowest_health);
        }
        else {
            move_to_target(lowest_health);
        }
    }

	let player = get_player("Sozaw");
	if (player == null) return;
	if (player.visible == null) return;
	move(
	character.x + ((player.x - character.x) - 20),
	character.y + ((player.y - character.y) - 20));
}
//This function contains our logic for when we're farming mobs
function farm()
{
    var lowest_health = lowest_health_partymember();

    //If we have a target to heal, heal them. Otherwise attack a target.
    if (lowest_health != null && lowest_health.health_ratio < 0.8) {
        if (distance_to_point(lowest_health.real_x, lowest_health.real_y) < character.range) {
            heal(lowest_health);
        }
        else {
            move_to_target(lowest_health);
        }
    }
    else {
		    let player = get_player("Sozaw");
		    if (player != null)
		    {
			       var target = get_target_of(player);
		    }
		    if (player == null)
		    {
			       var target = find_viable_targets()[0];
		    }
        if (target != null) {
            if (player != null && target != null && target.s.cursed == undefined && in_attack_range(target)) {
              if (target.hp > 6000) {
                curse(target)
              }
            }
            if (distance_to_point(target.real_x, target.real_y) < character.range) {
                if (can_attack(target)) {
                    attack(target);
                }
            }
            else {
              let player = get_player("Sozaw");
              if (player == null) return;
              if (player.visible == null) return;
              move(
              character.x + ((player.x - character.x) - 20),
              character.y + ((player.y - character.y) - 20));
            }
        }
		else
		{
			if (!smart.moving) {
				game_log("finding a target");
            	smart_move({ to: monster_targets[0] });
        	}
		}
    }
}

//This function contains our logic during resupply runs
function resupply_potions()
{
	var potion_merchant = get_npc("fancypots");

	var distance_to_merchant = null;

	if(potion_merchant != null)
	{
		distance_to_merchant = distance_to_point(potion_merchant.position[0], potion_merchant.position[1]);
	}

	if (!smart.moving
		&& (distance_to_merchant == null || distance_to_merchant > 250)) {
            smart_move({ to:"potions"});
    }

	if(distance_to_merchant != null
	   && distance_to_merchant < 250)
	{
		buy_potions();
	}
}

//Buys potions until the amount of each potion_type we defined in the start of the script is above the min_potions value.
function buy_potions()
{
	if(empty_slots() > 0)
	{
		for(type_id in potion_types)
		{
			var type = potion_types[type_id];

			var item_def = parent.G.items[type];

			if(item_def != null)
			{
				var cost = item_def.g * purchase_amount;

				if(character.gold >= cost)
				{
					var num_potions = num_items(type);

					if(num_potions < min_potions)
					{
						buy(type, purchase_amount);
					}
				}
				else
				{
					game_log("Not Enough Gold!");
				}
			}
		}
	}
	else
	{
		game_log("Inventory Full!");
	}
}


//Returns the number of items in your inventory for a given item name;
function num_items(name)
{
	var item_count = character.items.filter(item => item != null && item.name == name).reduce(function(a,b){ return a + (b["q"] || 1);
	}, 0);

	return item_count;
}

//Returns how many inventory slots have not yet been filled.
function empty_slots()
{
	return character.esize;
}

//Gets an NPC by name from the current map.
function get_npc(name)
{
	var npc = parent.G.maps[character.map].npcs.filter(npc => npc.id == name);

	if(npc.length > 0)
	{
		return npc[0];
	}

	return null;
}

//Returns the distance of the character to a point in the world.
function distance_to_point(x, y) {
    return Math.sqrt(Math.pow(character.real_x - x, 2) + Math.pow(character.real_y - y, 2));
}

//This function will ether move straight towards the target entity,
//or utilize smart_move to find their way there.
function move_to_target(target) {
    if (can_move_to(target.real_x, target.real_y)) {
        smart.moving = false;
        smart.searching = false;
        move(
            character.real_x + (target.real_x - character.real_x) / 2,
            character.real_y + (target.real_y - character.real_y) / 2
        );
    }
    else {
        if (!smart.moving) {
            smart_move({ x: target.real_x, y: target.real_y });
        }
    }
}

//Returns an ordered array of all relevant targets as determined by the following:
////1. The monsters' type is contained in the 'monsterTargets' array.
////2. The monster is attacking you or a party member.
////3. The monster is not targeting someone outside your party.
//The order of the list is as follows:
////Monsters attacking you or party members are ordered first.
////Monsters are then ordered by distance.
function find_viable_targets() {
    var monsters = Object.values(parent.entities).filter(
        mob => (mob.target == null
                    || parent.party_list.includes(mob.target)
                    || mob.target == character.name)
                && (mob.type == "monster"
                    && (parent.party_list.includes(mob.target)
                        || mob.target == character.name))
                    || monster_targets.includes(mob.mtype));

    for (id in monsters) {
        var monster = monsters[id];

        if (parent.party_list.includes(monster.target)
                    || monster.target == character.name) {
            monster.targeting_party = 1;
        }
        else {
            monster.targeting_party = 0;
        }
    }

    //Order monsters by whether they're attacking us, then by distance.
    monsters.sort(function (current, next) {
        if (current.targeting_party > next.targeting_party) {
            return -1;
        }
        var dist_current = distance(character, current);
        var dist_next = distance(character, next);
        // Else go to the 2nd item
        if (dist_current < dist_next) {
            return -1;
        }
        else if (dist_current > dist_next) {
            return 1
        }
        else {
            return 0;
        }
    });
    return monsters;
}

//Returns the party member with the lowest hp -> max_hp ratio.
function lowest_health_partymember() {
    var party = [];
    if (parent.party_list.length > 0) {
		for(id in parent.party_list)
		{
			var member = parent.party_list[id];

			var entity = parent.entities[member];

			if(member == character.name)
			{
				entity = character;
			}

			if(entity != null)
			{
				party.push({name: member, entity: entity});
			}
		}
    }
	else
	{
		//Add Self to Party Array
		party.push(
		{
			name: character.name,
			entity: character
		});
	}

    //Populate health percentages
    for (id in party) {
        var member = party[id];
        if (member.entity != null) {
            member.entity.health_ratio = member.entity.hp / member.entity.max_hp;
        }
        else {
            member.health_ratio = 1;
        }
    }

    //Order our party array by health percentage
    party.sort(function (current, next) {
        return current.entity.health_ratio - member.entity.health_ratio;
    });


    //Return the lowest health
    return party[0].entity;
}
//Put curse on target if it's not already cursed
var lastcurse;

function curse(target) {
  //Curse only if target hasn't been cursed and if curse is off cd (cd is 5sec).
  if ((!lastcurse || new Date() - lastcurse > 5000) && !target.cursed) {
    lastcurse = new Date();
    parent.use_skill("curse", target.id);
  }
}
