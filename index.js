if (window.localStorage) document.getElementById("name").value = localStorage.name;

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

const img_ids = ["emoine", "hiee", "iihanashida", "kandoushita", "kininaru", "majikayo", "naruhodo", "shitteta",
                 "soudane", "soukamo", "soukana", "sugoi", "tashikani", "tensai", "wakaran", "wara"];

// 画像の大きさ設定
if (!(_ua.Mobile || _ua.Tablet)){
  document.getElementById("img").width = "320";
  for (var i in img_ids) {
    document.getElementById(img_ids[i]).width = "96";
  }
}

// connect Socket.IO & Linda
const server_url = "https://linda-server.herokuapp.com";
const socket = io.connect(server_url);
const linda = new Linda().connect(socket);
const ts = linda.tuplespace("wakaruland");

var myName = document.getElementById("name").value;

linda.io.on("connect", function(){
  output("connect Linda!!");
  ts.watch({type: "reaction"}, function(err, tuple){
    if (myName == tuple.data.who) {
      document.getElementById("img").src = "images/l/" + tuple.data.reaction + ".jpg";
    }
  });
});

const output = function(msg){
  $("#log").prepend( $("<p>").text(msg) );
  console.log(msg);
};

const switchMenu = function() {
  const obj = document.getElementById('open').style;
  obj.display = (obj.display == 'none') ? 'block' : 'none';
};

const sendReaction = function(id) {
  myName = document.getElementById("name").value;
  if (window.localStorage) localStorage.name = myName;
  document.getElementById("img").src = "images/l/" + id + ".jpg";
  ts.write({who: myName, type: "reaction", reaction: id});
  for (var i in img_ids) {
    document.getElementById(img_ids[i]).border = 0;
  }
  document.getElementById(id).border = 3;
  switchMenu();
};

// Gyazzからnameの一覧を取得
var nameArray = [];
const gyazz_url = "http://gyazz.masuilab.org/wakaruland/name/json";
$.getJSON(gyazz_url, function(jsonData) {
  nameArray = jsonData.data;
});
