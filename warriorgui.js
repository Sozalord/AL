load_code(6)
load_code(7)
//GUI Settings
var gui_tl_gold = true; //Enable kill (or xp) till level & GPH [scripted session] = true, Disable kill (or xp) till level & GPH [scripted session] = false
var gui_timer = true; //Enable time till level [scripted session] = true, Disable time till level [scripted session] = false
var till_level = 0; //Kills till level = 0, XP till level = 1
// GUI [if either GUI setting is turned on and then you want to turn them off you'll have to refresh the game] //

//GUI Timer Refresh
setInterval(function () {

  //Updates GUI for Till_Level/Gold
  if (gui_tl_gold) {
    updateGUI();
  }

  //Updates GUI for Time Till Level
  if (gui_timer) {
    update_xptimer();
  }

  //Loot available chests
  loot();

}, 500); //Loop every 500 milliseconds

//GUI Stuff
var minute_refresh; //how long before the clock refreshes
var last_target = null;
var gold = character.gold;
var date = new Date();
var p = parent;

function init_xptimer(minref) {
  minute_refresh = minref || 1;
  p.add_log(minute_refresh.toString() + ' min until tracker refresh!', 0x00FFFF);

  let $ = p.$;
  let brc = $('#bottomrightcorner');

  brc.find('#xptimer').remove();

  let xpt_container = $('<div id="xptimer"></div>').css({
    background: 'black',
    border: 'solid gray',
    borderWidth: '5px 5px',
    width: '320px',
    height: '96px',
    fontSize: '28px',
    color: '#77EE77',
    textAlign: 'center',
    display: 'table',
    overflow: 'hidden',
    marginBottom: '-5px'
  });

  //vertical centering in css is fun
  let xptimer = $('<div id="xptimercontent"></div>')
    .css({
      display: 'table-cell',
      verticalAlign: 'middle'
    })
    .html('Estimated time until level up:<br><span id="xpcounter" style="font-size: 40px !important; line-height: 28px">Loading...</span><br><span id="xprate">(Kill something!)</span>')
    .appendTo(xpt_container);

  brc.children().first().after(xpt_container);
}

var last_minutes_checked = new Date();
var last_xp_checked_minutes = character.xp;
var last_xp_checked_kill = character.xp;
//lxc_minutes = xp after {minute_refresh} min has passed, lxc_kill = xp after a kill (the timer updates after each kill)

function update_xptimer() {
  if (character.xp == last_xp_checked_kill) return;

  let $ = p.$;
  let now = new Date();

  let time = Math.round((now.getTime() - last_minutes_checked.getTime()) / 1000);
  if (time < 1) return; //1s safe delay
  let xp_rate = Math.round((character.xp - last_xp_checked_minutes) / time);
  if (time > 60 * minute_refresh) {
    last_minutes_checked = new Date();
    last_xp_checked_minutes = character.xp;
  }
  last_xp_checked_kill = character.xp;

  let xp_missing = p.G.levels[character.level] - character.xp;
  let seconds = Math.round(xp_missing / xp_rate);
  let minutes = Math.round(seconds / 60);
  let hours = Math.round(minutes / 60);
  let counter = `${hours}h ${minutes % 60}min`;

  $('#xpcounter').text(counter);
  $('#xprate').text(`${ncomma(xp_rate)} XP/s`);
}

function initGUI() {
  let $ = p.$;
  let brc = $('#bottomrightcorner');
  let blc = $('#bottomleftcorner2');
  $('#xpui').css({
    fontSize: '25px',
  });

  brc.find('.xpsui').css({
    background: 'url("https://i.imgur.com/zCb8PGK.png")',
    backgroundSize: 'cover'
  });

  blc.find('#goldui').remove();
  blc.find('#goldgainloss').remove();
  let gb = $('<div id="goldui"></div>').css({
    background: 'black',
    border: 'solid gray',
    borderWidth: '5px 5px',
    width: '320px',
    height: '34px',
    lineHeight: '34px',
    fontSize: '25px',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: '-5px'
  });
  let ggl = $('<div id="goldgainloss"></div>').css({ //gold gain loss
    background: 'black',
    border: 'solid gray',
    borderWidth: '5px 5px',
    width: '320px',
    height: '34px',
    lineHeight: '34px',
    fontSize: '25px',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: '-5px'
  });
  $('#bottomleftcorner2').prepend(ggl);
  $('#bottomleftcorner2').prepend(gb);
}

if (till_level === 0)

function updateGUI() {
  let $ = p.$;
  let xp_percent = ((character.xp / p.G.levels[character.level]) * 100).toFixed(2);
  let xp_string = `LV${character.level} ${xp_percent}%`;
  var goldPerHour = 0;
  if (p.ctarget && p.ctarget.type == 'monster') {
    last_target = p.ctarget.mtype;
  }
  if (last_target) {
    let xp_missing = p.G.levels[character.level] - character.xp;
    let monster_xp = p.G.monsters[last_target].xp;
    goldPerHour = Math.round((character.gold - gold) / ((new Date() - date) / 3600000));
    let party_modifier = character.party ? 1.5 / p.party_list.length : 1;
    let monsters_left = Math.ceil(xp_missing / (monster_xp * party_modifier * character.xpm));
    xp_string += ` (${ncomma(monsters_left)} kills to go!)`;
  }
  $('#xpui').html(xp_string);
  $('#goldui').html(goldPerHour.toLocaleString('en-US', {
    minimumFractionDigits: 0
  }) + " Gold/hour");
  $('#goldgainloss').html(ncomma(character.gold - gold) + " Gold gain/lost");
} else if (till_level === 1)

function updateGUI() {
  let $ = p.$;
  let xp_percent = ((character.xp / G.levels[character.level]) * 100).toFixed(2);
  let xp_missing = ncomma(G.levels[character.level] - character.xp);
  let xp_string = `LV${character.level} ${xp_percent}% (${xp_missing}) xp to go!`;
  var goldPerHour = 0;
  if (p.ctarget && p.ctarget.type == 'monster') {
    last_target = p.ctarget.mtype;
  }
  goldPerHour = Math.round((character.gold - gold) / ((new Date() - date) / 3600000));
  let party_modifier = character.party ? 1.5 / p.party_list.length : 1;
  $('#xpui').html(xp_string);
  $('#goldui').html(goldPerHour.toLocaleString('en-US', {
    minimumFractionDigits: 0
  }) + " Gold/hour");
  $('#goldgainloss').html(ncomma(character.gold - gold) + " Gold gain/lost");
}

function ncomma(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

if (gui_tl_gold) {
  initGUI();
}

if (gui_timer) {
  init_xptimer(5);
}
