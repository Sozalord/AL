const my_people = ["Sozam", "Sozaw", "Sozar", "Sozap", "Soza"];

function ask_location(person) {
  //send the message to the person requesting
  var question = "where are you?"
  send_cm(person, question);
}
function give_location(person) {
  //send a message back to the requester
  var location = {requester:character.name, map:character.map, x:character.real_x, y:character.real_y};
  send_cm(person, location);
}
function on_cm(name, data) {
  //recieving a message asking where you are give location
  console.log(data)
  if (name == null) return;
  if (!my_people.includes(name)) return;
  if (data == "where are you?"){
  give_location(name)
  }
  if (data.requester == null) return;
  if (data.map == null) return;
  if (data.x == null || data.y == null) return;
  if (data.requester && data.map && data.x && data.y) {
    if (data.map != character.map) {
      stop(move)
      smart_move(data.map)
    }
    if (data.map == character.map) {
    stop(move)
    smart_move({x:data.x, y:data.y});
    }
  }
}
