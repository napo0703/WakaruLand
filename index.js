if (window.localStorage) document.getElementById("name").value = localStorage.name;

const img_ids = ["emoine", "hiee", "ichiriaru", "iihanashida", "kami", "kandoushita", "kininaru","majikayo", "naki",
  "naruhodo", "otsu", "shitteta", "soudane", "soukamo", "soukana", "sugoi", "tashikani", "tasukete",
  "tensai", "toutoi", "wakaran", "wakaru", "wara", "maru", "batsu"];

// ユーザエージェント判定
const _ua = (function (u){
  return {
    Tablet:(u.indexOf("windows") != -1 && u.indexOf("touch") != -1 && u.indexOf("tablet pc") == -1)
    || u.indexOf("ipad") != -1
    || (u.indexOf("android") != -1 && u.indexOf("mobile") == -1)
    || (u.indexOf("firefox") != -1 && u.indexOf("tablet") != -1)
    || u.indexOf("kindle") != -1
    || u.indexOf("silk") != -1
    || u.indexOf("playbook") != -1,
    Mobile:(u.indexOf("windows") != -1 && u.indexOf("phone") != -1)
    || u.indexOf("iphone") != -1
    || u.indexOf("ipod") != -1
    || (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
    || (u.indexOf("firefox") != -1 && u.indexOf("mobile") != -1)
    || u.indexOf("blackberry") != -1
  }
})(window.navigator.userAgent.toLowerCase());

// connect Socket.IO & Linda
const server_url = "https://linda-server.herokuapp.com";
const socket = io.connect(server_url);
const linda = new Linda().connect(socket);
const ts = linda.tuplespace("wakaruland");

linda.io.on("connect", function(){
  output("connect Linda!!");
  ts.watch({type: "reaction"}, function(err, tuple){
    if (myName == tuple.data.who) {
      document.getElementById("img").src = "images/l/" + tuple.data.reaction + ".jpg";
    }
  });
});

var myName = document.getElementById("name").value;

const sendReaction = function(id) {
  return function () {
    myName = document.getElementById("name").value;
    if (window.localStorage) localStorage.name = myName;
    document.getElementById("img").src = "images/l/" + id + ".jpg";
    ts.write({who: myName, type: "reaction", reaction: id});
    switchMenu();
  }
};

const output = function(msg){
  $("#log").prepend( $("<p>").text(msg) );
  console.log(msg);
};

const switchMenu = function() {
  const obj = document.getElementById('icon_view').style;
  obj.display = (obj.display == 'none') ? 'block' : 'none';
};

// リアクションアイコン画像を動的に追加
for (var i in img_ids) {
  const id = img_ids[i];
  var gridCell = document.createElement("div");
  gridCell.setAttribute("class", "icon");
  var img = document.createElement("img");
  img.setAttribute("id", id);
  img.setAttribute("src", "images/" + id + ".jpg");
  img.setAttribute("width", "100%");
  gridCell.appendChild(img);
  document.getElementById("icon_view").appendChild(gridCell);
}

for (var i in img_ids) {
  const id = img_ids[i];
  document.getElementById(id).onclick = sendReaction(id);
}