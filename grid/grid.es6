// connect Socket.IO & Linda
const server_url = "https://linda-server.herokuapp.com";
const socket = io.connect(server_url);
const linda = new Linda().connect(socket);
const ts = linda.tuplespace("wakarulanddebug");

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

const getLayoutSize = function(windowWidth, windowHeight, minCellWidth, itemCount) {
  if (itemCount <= 1) {
    return {"columnCount": 1, "rowCount": 1};
  }

  const cellAspectRatio = 1.0;
  const minCellHeight = minCellWidth / cellAspectRatio;
  const maxColumnCount = Math.floor(windowWidth / minCellWidth);
  const minRowCount = Math.ceil(itemCount / maxColumnCount);
  if (windowHeight < minRowCount * minCellHeight) {
    return {"columnCount": maxColumnCount, "rowCount": minRowCount};
  }

  var columnCount = maxColumnCount - 1;
  var rowCount = Math.ceil(itemCount / columnCount);
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

const createCell = function(name) {
  //Twitterからプロフィール画像取得
  const img_url = "http://www.paper-glasses.com/api/twipi/"+ name + "/original";
  const gridCell = document.createElement("div");
  gridCell.setAttribute("class", "cell");
  const img = document.createElement("img");
  img.setAttribute("id", name);
  img.setAttribute("src", img_url);
  img.setAttribute("height", "100%");
  gridCell.appendChild(img);
  return gridCell;
};

// URLのパラメータから表示するユーザを取得
// TODO: パラメータが正しいCSVフォーマットであるか判定する
var nameArray = Array.from(new Set(location.search.substring(1).split(',')));
console.log(nameArray);
const minCellWidth = 100;  //TODO: ユーザが任意に変えられるようにしようかな
const minCellHeight = 100;
const gridSize = getLayoutSize(window.innerWidth, window.innerHeight, minCellWidth, nameArray.length);
const columnCount = gridSize.columnCount;
const rowCount = gridSize.rowCount;
console.log("columnCount = "+ columnCount + ", rowCount = " + rowCount);
const cellHeight = Math.max(window.innerHeight / rowCount, minCellWidth);

for (var i in nameArray) {
  const name = nameArray[i];  // FIXME: Safariでconstの挙動がおかしい
  const cell = createCell(name);
  document.getElementById("grid_view").appendChild(cell);
  if (cellHeight == minCellWidth) {
    cell.style.width = Math.floor(100 / columnCount) + "%";
    cell.style.height = minCellHeight;
  } else if (window.innerHeight < cellHeight * rowCount) {
    cell.style.width = Math.floor(100 / rowCount) + "%";
    cell.style.height = Math.floor(100 / rowCount) + "%";
  } else {
    cell.style.width = Math.floor(100 / columnCount) + "%";
    cell.style.height = Math.floor(100 / rowCount) + "%";
  }
}