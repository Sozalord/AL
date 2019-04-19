//my group
var group = ["Sozaw", "Sozap", "Sozar"];

setInterval(function() {
    if (character.name == group[0]) {
        for (let i = 1; i < group.length; i++) {
            let name = group[i];
            send_party_invite(name);
        }
    } else {
        if (character.party) {
            if (character.party != group[0]) {
                parent.socket.emit("party", {
                    event: "leave"
                })
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

//calls merchant
setInterval(function() {
    let items = parent.character.items
    let eggs = ["egg0", "egg1", "egg2", "egg3", "egg4", "egg5", "egg6", "egg7", "egg8", "goldenegg", "vitscroll", "cscale", "gem0"];
    if ((items[36]) != null) {
        give_location("Sozam")
    }
    for (let i = 2; i < 41; i++) {
        if ((items[i]) != null) {
            if (eggs.indexOf(items[i].name) > -1) {
                send_item("Sozap", i, 100)
            }
        }
    }
}, 1000 * 10);
game_log("---Script Start---");
//load_code(11)
//Put monsters you want to kill in here
//If your character has no target, it will travel to a spawn of the first monster in the list below.
var monster_targets = ["bat", "phoenix", "mvampire"];

var state = "farm";

var min_potions = 50; //The number of potions at which to do a resupply run.
var purchase_amount = 200; //How many potions to buy at once.
var potion_types = ["hpot0", "mpot0"]; //The types of potions to keep supplied.

//Show character range
//setInterval(function(){
//	clear_drawings()
//	draw_circle(character.real_x, character.real_y, parent.character.range, 1, 0xD2F33E)
//}, 50);

//Send Items and gold to merchant if in range
setInterval(function() {
    let items = parent.character.items
    let player = get_player("Sozam");
    let gold = character.gold
    if (player == null) return;
    if (player.visible == null) return;
    for (let i = 2; i < 41; i++) {
        if ((items[i]) != null) {
            send_item(player, i, 1)
        }
    }
    if (gold > 500000) {
        send_gold(player, gold - 500000)
    }
}, 1000 * 4);

//Movement And Attacking
setInterval(function() {

    //Determine what state we should be in.
    state_controller();

    //Switch statement decides what we should do based on the value of 'state'
    switch (state) {
        case "farm":
            farm();
            break;
        case "resupply_potions":
            resupply_potions();
            break;
    }
}, 100); //Execute 10 times per second

//Potions And Looting
setInterval(function() {
    loot();

    //Heal With Potions if we're below 75% hp.
    if (character.hp / character.max_hp < 0.75 || character.mp / character.max_mp < 0.75) {
        use_hp_or_mp();
    }
}, 500); //Execute 2 times per second

function state_controller() {
    //Default to farming
    var new_state = "farm";


    //Do we need potions?
    for (type_id in potion_types) {
        var type = potion_types[type_id];

        var num_potions = num_items(type);

        if (num_potions < min_potions) {
            new_state = "resupply_potions";
            break;
        }
    }

    if (state != new_state) {
        state = new_state;
    }

}

//This function contains our logic for when we're farming mobs
function farm() {
    //Try to get warrior's target first before defaulting to something viable
    let player = get_player("Sozaw");
    if (player != null) {
        var target = get_target_of(player);
    }

    if (player == null && !smart.moving) {
        ask_location("Sozaw")
    }

    //Attack or move to target
    if (target != null && is_monster(target)) {
        if (distance_to_point(target.real_x, target.real_y) < character.range) {
            if (can_attack(target)) {
                attack(target);
            }
        }
    } else {
        let player = get_player("Sozaw");
        if (player == null) return;
        if (parent.distance(character, player) < character.range) {
            stop(move)
            move(
                character.x + ((player.x - character.x) + 20),
                character.y + ((player.y - character.y) - 20));
        } else {
            if (!smart.moving) {
                ask_location("Sozaw")
            }
        }
    }
}

//This function contains our logic during resupply runs
function resupply_potions() {
    var potion_merchant = get_npc("fancypots");

    var distance_to_merchant = null;

    if (potion_merchant != null) {
        distance_to_merchant = distance_to_point(potion_merchant.position[0], potion_merchant.position[1]);
    }

    if (!smart.moving &&
        (distance_to_merchant == null || distance_to_merchant > 250)) {
        smart_move({
            to: "potions"
        });
    }

    if (distance_to_merchant != null &&
        distance_to_merchant < 250) {
        buy_potions();
    }
}

//Buys potions until the amount of each potion_type we defined in the start of the script is above the min_potions value.
function buy_potions() {
    if (empty_slots() > 0) {
        for (type_id in potion_types) {
            var type = potion_types[type_id];

            var item_def = parent.G.items[type];

            if (item_def != null) {
                var cost = item_def.g * purchase_amount;

                if (character.gold >= cost) {
                    var num_potions = num_items(type);

                    if (num_potions < min_potions) {
                        buy(type, purchase_amount);
                    }
                } else {
                    game_log("Not Enough Gold!");
                }
            }
        }
    } else {
        game_log("Inventory Full!");
    }
}


//Returns the number of items in your inventory for a given item name;
function num_items(name) {
    var item_count = character.items.filter(item => item != null && item.name == name).reduce(function(a, b) {
        return a + (b["q"] || 1);
    }, 0);

    return item_count;
}

//Returns how many inventory slots have not yet been filled.
function empty_slots() {
    return character.esize;
}

//Gets an NPC by name from the current map.
function get_npc(name) {
    var npc = parent.G.maps[character.map].npcs.filter(npc => npc.id == name);

    if (npc.length > 0) {
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
    } else {
        if (!smart.moving) {
            smart_move({
                x: target.real_x,
                y: target.real_y
            });
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
        mob => (mob.target == null ||
            parent.party_list.includes(mob.target) ||
            mob.target == character.name) &&
        (mob.type == "monster" &&
            (parent.party_list.includes(mob.target) ||
                mob.target == character.name)) ||
        monster_targets.includes(mob.mtype));

    for (id in monsters) {
        var monster = monsters[id];

        if (parent.party_list.includes(monster.target) ||
            monster.target == character.name) {
            monster.targeting_party = 1;
        } else {
            monster.targeting_party = 0;
        }
    }

    //Order monsters by whether they're attacking us, then by distance.
    monsters.sort(function(current, next) {
        if (current.targeting_party > next.targeting_party) {
            return -1;
        }
        var dist_current = distance(character, current);
        var dist_next = distance(character, next);
        // Else go to the 2nd item
        if (dist_current < dist_next) {
            return -1;
        } else if (dist_current > dist_next) {
            return 1
        } else {
            return 0;
        }
    });
    return monsters;
}
