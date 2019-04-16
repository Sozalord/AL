var merchant = "Sozam"
var waiting = false;
var pickups = [];

function request_dispatch () {
  var items_needed = {asking:character.name,
    items:items,
    x:character.real_x,
    y:character.real_y};

    //send the message to the merchant
    send_cm(merchant, items_needed);
    waiting = true;
    setTimeout(function (){
      game_log("here");
      if (waiting) send_request();
      else {
        items = [];
      }
    }, 10000)
}
function on_cm(name, data) {
  if (data != null && data === "done") {
    waiting = false;
    show_json(data);
  }
  if (data != null && data == "send data")
}
