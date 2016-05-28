// connect Socket.IO & Linda
const server_url = "https://linda-server.herokuapp.com";
const socket = io.connect(server_url);
const linda = new Linda().connect(socket);
const ts = linda.tuplespace("wakaruland");

linda.io.on("connect", function(){
  console.log("connect Linda!!");

  ts.watch({type: "reaction"}, function(err, tuple){
    const reactor = tuple.data.who;
    const reaction = tuple.data.reaction;
    if (nameArray.includes(reactor)) {
      console.log(reactor + " < " + reaction);
      document.getElementById(reactor).src = "../images/l/" + reaction + ".jpg";
    }
  });

  ts.watch({response: "NO"}, function(err, tuple) {
    const reactor = tuple.data.who;
    if (nameArray.includes(reactor)) {
      console.log(reactor + " < NO response (30sec)");
      document.getElementById(reactor).src = "../images/l/blank.jpg";
    }
  });
});

// URLのパラメータから表示するユーザを取得
// TODO: パラメータが正しいCSVフォーマットであるか判定する
var nameArray = location.search.substring(1).split(',');
console.log(nameArray);
for (var i in nameArray) {
  var name = nameArray[i];  // FIXME: Safariでconstの挙動がおかしい
  console.log(name);
  const gridCell = document.createElement("div");
  gridCell.setAttribute("class", "cell");
  const nameText = document.createElement("p");
  nameText.innerHTML = name;
  const reactionImg = document.createElement("img");
  reactionImg.setAttribute("id", name);
  reactionImg.setAttribute("src", "../images/l/blank.jpg");
  reactionImg.setAttribute("width", "100%");
  gridCell.appendChild(nameText);
  gridCell.appendChild(reactionImg);
  document.getElementById("grid_view").appendChild(gridCell);
}