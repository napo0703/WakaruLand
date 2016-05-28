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

const getLayoutSize = function(windowWidth, windowHeight, minItemWidth, itemCount) {
  if (itemCount <= 1) {
    return {"columnCount": 1, "rowCount": 1};
  }

  const cellAspectRatio = 1.0;
  const minHeight = minItemWidth / cellAspectRatio;

  // 最小セルサイズで並べる
  const maxColumnCount = Math.floor(windowWidth / minItemWidth);
  const minRowCount = Math.ceil(itemCount / maxColumnCount);
  if (windowHeight < minRowCount * minHeight) {
    return {"columnCount": maxColumnCount, "rowCount": minRowCount};
  }

  var columnCount = maxColumnCount - 1;
  var rowCount = Math.ceil(itemCount / columnCount);

  // columnCountを減らしてく
  while (columnCount > 1) {
    const cellWidth = windowWidth / columnCount;
    const cellHeight = cellWidth * cellAspectRatio;
    if (windowHeight < rowCount * cellHeight) {
      rowCount = Math.ceil(itemCount / columnCount);
      return {"columnCount": columnCount, "rowCount": rowCount};
    } else {
      columnCount -= 1;
      rowCount = Math.ceil(itemCount / columnCount);
    }
  }

  return {"columnCount": 1, "rowCount": itemCount};
};

// URLのパラメータから表示するユーザを取得
// TODO: パラメータが正しいCSVフォーマットであるか判定する
var nameArray = Array.from(new Set(location.search.substring(1).split(',')));
console.log(nameArray);
const gridSize = getLayoutSize(window.innerWidth, window.innerHeight, 200, nameArray.length);
console.log("columnCount = "+ gridSize.columnCount + ", rowCount = " + gridSize.rowCount);
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
  gridCell.style.width = (window.innerWidth / gridSize.columnCount) - (gridSize.columnCount * 10);
  gridCell.style.height = (window.innerWidth / gridSize.columnCount) - (gridSize.columnCount * 10);
}