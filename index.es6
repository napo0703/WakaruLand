const reactions = ["blank", "emoine", "hiee", "ichiriaru", "iihanashida", "kami", "kandoushita", "kininaru", "majikayo",
                   "naruhodo", "otsu", "shitteta", "soudane", "soukamo", "soukana", "sugoi", "tashikani", "tasukete",
                   "tensai", "toutoi", "wakaran", "wakaru", "wara", "maru", "batsu"];

// connect Socket.IO & Linda
const server_url = "https://linda-server.herokuapp.com/";
const socket = io.connect(server_url);
const linda = new Linda().connect(socket);
const ts = linda.tuplespace("masuilab");

// URL末尾のカンマ区切り文字列から表示するユーザを抽出
const nameArray = Array.from(new Set(location.search.substring(1).split(',')));
console.log(nameArray);

if (nameArray.length <= 1) {
  /**
   * console リアクション投稿ページ
   * URL末尾にユーザ名を書かない、または、ユーザ名が1人のとき
   */
  let myName = "test";
  if (nameArray.length == 0) {
    if (window.localStorage) {
      myName = localStorage.name;
    }
  } else {
    myName = nameArray[0];
  }
  document.getElementById("name_text_box").value = myName;

  var sendReaction = (reaction, time) => {
    return () => {
      myName = document.getElementById("name_text_box").value;
      if (window.localStorage) localStorage.name = myName;
      document.getElementById("stamp_grid_view").src = `images/l/${reaction}.jpg`;
      ts.write({type: "wakaruland", who: myName, value: reaction, time: time});
      switchMenu();
    }
  };

  var switchMenu = () => {
    const obj = document.getElementById('stamp_grid_view').style;
    obj.display = (obj.display == 'none') ? 'block' : 'none';
  };

  linda.io.on("connect", () => {
    console.log("connect Linda!!");
    ts.watch({type: "wakaruland"}, (err, tuple) => {
      if (myName == tuple.data.who) {
        document.getElementById("img").src = `images/l/${tuple.data.value}.jpg`;
      }
    });
  });

  // 一覧表示は使わないので削除
  const gridView = document.getElementById("grid_view");
  gridView.parentNode.removeChild(gridView);

  // リアクションアイコン画像を動的に追加
  for (let i in reactions) {
    const id = reactions[i];
    const gridCell = document.createElement("div");
    gridCell.setAttribute("class", "icon");
    const img = document.createElement("img");
    img.setAttribute("id", id);
    img.setAttribute("src", `images/${id}.jpg`);
    img.setAttribute("width", "100%");
    gridCell.appendChild(img);
    document.getElementById("stamp_grid_view").appendChild(gridCell);
  }

  for (let i in reactions) {
    const id = reactions[i];
    document.getElementById(id).onclick = sendReaction(id, 30);
  }

} else {
  /**
   * grid ユーザの一覧ページ
   * URL末尾に2人以上ユーザ名を書いたとき
   */
  // FIXME: もっといい方法ありそう
  const getGridSize = (windowWidth, windowHeight, minCellWidth, itemCount) => {
    if (itemCount <= 1) {
      return { "columnCount": 1, "rowCount": 1 };
    }

    if (windowWidth >= windowHeight) {
      if ((windowWidth / windowHeight) * 2 > itemCount) {
        return { "columnCount": itemCount, "rowCount": 1 }
      }
    } else {
      if ((windowHeight / windowWidth) * 2 > itemCount) {
        return { "columnCount": 1, "rowCount": itemCount }
      }
    }

    const cellAspectRatio = 1.0;
    const minCellHeight = minCellWidth / cellAspectRatio;
    const maxColumnCount = Math.min(Math.floor(windowWidth / minCellWidth), itemCount);
    const minRowCount = Math.ceil(itemCount / maxColumnCount);
    if (windowHeight < minRowCount * minCellHeight) {
      return { "columnCount": maxColumnCount, "rowCount": minRowCount };
    }

    let columnCount = maxColumnCount - 1;
    let rowCount = Math.ceil(itemCount / columnCount);

    while (columnCount > 1) {
      const prevColumnCount = columnCount + 1;
      const prevRowCount = Math.ceil(itemCount / prevColumnCount);
      if (Math.min(windowWidth / columnCount, windowHeight / rowCount)
          < Math.min(windowWidth / prevColumnCount, windowHeight / prevRowCount)) {
        return { "columnCount": prevColumnCount, "rowCount": prevRowCount }
      } else {
        columnCount -= 1;
        rowCount = Math.ceil(itemCount / columnCount);
      }
    }
    if (windowWidth >= windowHeight) return { "columnCount": Math.ceil(itemCount / 2), "rowCount": 2 };
    else return { "columnCount": 2, "rowCount": Math.ceil(itemCount / 2) };
  };

  const createCell = (name, cellWidth, cellHeight) => {
    //Twitterからプロフィール画像取得
    var img_url = "http://www.paper-glasses.com/api/twipi/" + name + "/original";
    const gridCell = document.createElement("div");
    gridCell.setAttribute("class", "cell");
    const img = document.createElement("img");
    img.setAttribute("class", "image");
    img.setAttribute("id", name);
    img.setAttribute("src", img_url);
    if (cellWidth >= cellHeight) {
      img.setAttribute("height", "100%");
    } else {
      img.setAttribute("width", "100%");
    }
    gridCell.appendChild(img);
    return gridCell;
  };

  let timer_ids = {};
  const withdrawReaction = (reactor, time) => {
    if (time == "forever" && reactor in timer_ids) {
      window.clearTimeout(timer_ids[reactor]);
    } else {
      if (reactor in timer_ids) {
        window.clearTimeout(timer_ids[reactor]);
      }
      console.log("time = " + time + "msec");
      timer_ids[reactor] = window.setTimeout(() => {
        console.log("withdraw -> " + reactor);
        document.getElementById(reactor).src = "http://www.paper-glasses.com/api/twipi/" + reactor + "/original";
        document.getElementById(reactor).style.opacity = 0.25;
      }, time);
    }
  };

  linda.io.on("connect", function(){
    console.log("connect Linda!!");

    ts.watch({type: "wakaruland"}, (err, tuple) => {
      const reactor = tuple.data.who;
      if (nameArray.includes(reactor)) {
        const value = tuple.data.value;
        const time = tuple.data.time;
        const from = tuple.from;
        console.log(reactor + " < " + value + " " + time + "sec (from " + from + ")");

        if (typeof value == "string") {
          document.getElementById(reactor).src = `../images/l/${value}.jpg`;
          document.getElementById(reactor).style.opacity = 1.0;
          withdrawReaction(reactor, time * 1000);
        } else if (typeof value == "number") {
          // TODO: 数値の表示
          console.log("value is Number!");
        }
      }
    });
  });

  // リアクションの書き込みはいらないので削除
  const body_ids = ["name_input", "switch_menu", "stamp_grid_view", "img"];
  for (let i in body_ids) {
    const ele = document.getElementById(body_ids[i]);
    ele.parentNode.removeChild(ele);
  }

  const minCellWidth = 100; //TODO: ユーザが任意に変えられるようにしようかな
  const minCellHeight = 100;
  const gridSize = getGridSize(window.innerWidth, window.innerHeight, minCellWidth, nameArray.length);
  const columnCount = gridSize.columnCount;
  const rowCount = gridSize.rowCount;
  console.log("columnCount = " + columnCount + ", rowCount = " + rowCount);
  const cellWidth = Math.max(window.innerWidth / columnCount, minCellWidth);
  const cellHeight = Math.max(window.innerHeight / rowCount, minCellHeight);

  for (let i in nameArray) {
    const name = nameArray[i];
    const cell = createCell(name, cellWidth, cellHeight);
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
}