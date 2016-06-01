if (window.localStorage) document.getElementById("name").value = localStorage.name;

const img_ids = ["blank", "emoine", "hiee", "ichiriaru", "iihanashida", "kami", "kandoushita", "kininaru","majikayo",
  "naruhodo", "otsu", "shitteta", "soudane", "soukamo", "soukana", "sugoi", "tashikani", "tasukete",
  "tensai", "toutoi", "wakaran", "wakaru", "wara", "maru", "batsu"];

// connect Socket.IO & Linda
const server_url = "https://linda-server.herokuapp.com/";
const socket = io.connect(server_url);
const linda = new Linda().connect(socket);
const ts = linda.tuplespace("wakarulanddebug");

linda.io.on("connect", () => {
  output("connect Linda!!");
  ts.watch({type: "reaction"}, (err, tuple) => {
    if (myName == tuple.data.who) {
      document.getElementById("img").src = `images/l/${tuple.data.reaction}.jpg`;
    }
  });
});

var myName = document.getElementById("name").value;

const sendReaction = (id) => {
  return () => {
    myName = document.getElementById("name").value;
    if (window.localStorage) localStorage.name = myName;
    document.getElementById("img").src = `images/l/${id}.jpg`;
    ts.write({who: myName, type: "reaction", reaction: id});
    switchMenu();
    startCount();
  }
};

const output = (msg) => {
  $("#log").prepend( $("<p>").text(msg) );
  console.log(msg);
};

const switchMenu = () => {
  let obj = document.getElementById('icon_view').style;
  obj.display = (obj.display == 'none') ? 'block' : 'none';
};

// リアクションアイコン画像を動的に追加
for (let i in img_ids) {
  let id = img_ids[i];
  var gridCell = document.createElement("div");
  gridCell.setAttribute("class", "icon");
  var img = document.createElement("img");
  img.setAttribute("id", id);
  img.setAttribute("src", `images/${id}.jpg`);
  img.setAttribute("width", "100%");
  gridCell.appendChild(img);
  document.getElementById("icon_view").appendChild(gridCell);
}

for (let i in img_ids) {
  let id = img_ids[i];
  document.getElementById(id).onclick = sendReaction(id);
}

// 30秒間リアクションしなかったら一覧から消す
const withdrawReaction = () => {
  stopCount();
  document.getElementById("img").src = "images/l/blank.jpg";
  ts.write({who: myName, response: "NO", time: "30sec"});
};

var count = 0;
var count30sec;

const startCount = () => {
  stopCount();
  count30sec = setInterval(() => {
    count += 1;
    console.log(count);
    if (count >= 30) {
      withdrawReaction();
    }
  }, 1000);
};

const stopCount = () => {
  clearInterval(count30sec);
  count = 0;
};

window.addEventListener("beforeunload", (e) => {
  var confirmationMessage = "\o/";
  e.returnValue = confirmationMessage;     // Gecko and Trident
  return confirmationMessage;              // Gecko and WebKit
});

window.addEventListener('unload', (e) => {
  ts.write({who: myName, response: "NO", time: "30sec"});
});
