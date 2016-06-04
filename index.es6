const reactions = ["blank", "エモいね", "ひえぇ〜", "一理ある", "いい話だ", "神", "感動した", "気になる", "まじかよ",
                   "なるほど", "乙", "知ってた", "そうだね", "そうかも", "そうかな", "すごい！", "たしかに",
                   "たすけて", "天才", "尊い", "わからん", "わかる！", "笑", "⭕️", "❌"];

const masuilab_sensor = ["delta_light", "delta_temperature", "delta_door", "enoshima_wind", "sfc_weather",
                         "shokai_light", "shokai_temperature"];

// connect Socket.IO & Linda
const server_url = "https://linda-server.herokuapp.com/";
const socket = io.connect(server_url);
const linda = new Linda().connect(socket);
const ts = linda.tuplespace("masuilab");

// URL末尾のカンマ区切り文字列から表示するユーザを抽出
const fromArray = Array.from(new Set(location.search.substring(1).split(',')));
console.log(fromArray);

if (fromArray.length == 0 || (fromArray.length == 1 && (fromArray[0].charAt(0) == "@" || fromArray[0] == ""))) {
  /**
   * console リアクション投稿ページ
   * URL末尾に何も書かない、Twitterユーザ名が1人のとき
   */

  let myName = "test";
  if (fromArray.length == 0 || fromArray[0] == "") {
    if (window.localStorage) {
      myName = localStorage.name;
    }
  } else {
    myName = fromArray[0];
  }
  document.getElementById("name_text_box").value = myName.substring(1);

  // TODO: クリックした長さで表示時間を変える
  // 一瞬 -> 15秒,   2秒 -> 5分,   5秒 -> ずっと
  var sendReaction = (reaction, time) => {
    return () => {
      myName = "@" + document.getElementById("name_text_box").value;
      if (window.localStorage) localStorage.name = myName;
      document.getElementById("img").src = `images/l/${reaction}.png`;
      ts.write({from: myName, value: reaction, time: time});
      switchMenu();
    }
  };

  // スタンプビューの表示/非表示切り替え
  var switchMenu = () => {
    const obj = document.getElementById('stamp_grid_view').style;
    obj.display = (obj.display == 'none') ? 'block' : 'none';
  };

  linda.io.on("connect", () => {
    console.log("connect Linda!!");
    ts.watch({from: myName}, (err, tuple) => {
      console.log(myName+" < " + tuple.data.value);
      document.getElementById("img").src = `images/l/${tuple.data.value}.png`;
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
    img.setAttribute("src", `images/${id}.png`);
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
   * URL末尾に2人以上Twitterユーザ名を書いたとき、1つ以上Twitterユーザ名【以外】を書いたとき
   */

  // 表示する人/物/現象のViewを動的に生成する
  const createCell = (name, cellWidth, cellHeight) => {
    let img_url;
    if (name.charAt(0) == "@") {
      //Twitterからプロフィール画像取得
      img_url = "http://www.paper-glasses.com/api/twipi/" + name.substring(1) + "/original";
    } else if (masuilab_sensor.includes(name)) {
      // 研究室のセンサ等の場合
      img_url = "images/l/" + name + ".png";
    } else {
      img_url = "images/l/blank.png";
    }

    const gridCell = document.createElement("div");
    gridCell.setAttribute("class", "cell");
    const img = document.createElement("img");
    if (masuilab_sensor.includes(name)) {
      img.setAttribute("class", "image_sensor");
      img.setAttribute("id", name);
    } else {
      img.setAttribute("class", "image");
    }
    img.setAttribute("src", img_url);

    if (cellWidth >= cellHeight) {
      img.setAttribute("height", "100%");
    } else {
      img.setAttribute("width", "100%");
    }
    gridCell.appendChild(img);

    if (masuilab_sensor.includes(name)) {
      const figcaption = document.createElement("figcaption");
      figcaption.setAttribute("class", "absolute");
      const text = document.createElement("p");
      text.setAttribute("id", name + "_value_text");
      figcaption.appendChild(text);
      gridCell.appendChild(img);
      gridCell.appendChild(figcaption);
    } else {
      const reaction_img = document.createElement("img");
      reaction_img.setAttribute("class", "reaction_image");
      reaction_img.setAttribute("id", name);
      reaction_img.setAttribute("src", "images/l/blank.png");
      if (cellWidth >= cellHeight) {
        reaction_img.setAttribute("height", "100%");
      } else {
        reaction_img.setAttribute("width", "100%");
      }
      gridCell.appendChild(img);
      gridCell.appendChild(reaction_img);
    }
    return gridCell;
  };

  // ウィンドウサイズと表示数からグリッドの列数と行数を算出する
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

  // 指定時間後に発言を非表示にする
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
        if (masuilab_sensor.includes(reactor)) {
          document.getElementById(reactor).src = `../images/l/${reactor}.png`;
        } else {
          document.getElementById(reactor).src = "http://www.paper-glasses.com/api/twipi/" + reactor.substring(1) + "/original";
        }
        document.getElementById(reactor).style.opacity = 0.25;
      }, time);
    }
  };

  linda.io.on("connect", function(){
    console.log("connect Linda!!");

    for (let i in fromArray) {
      if (fromArray[i].charAt(0) == "@") {
        ts.watch({from: fromArray[i]}, (err, tuple) => {
          const reactor = tuple.data.from;
          if (fromArray.includes(reactor)) {
            const value = tuple.data.value;
            const time = tuple.data.time;
            const ip_address = tuple.from;
            console.log(reactor + " < " + value + " " + time + "sec (from " + ip_address + ")");

            if (typeof value == "string") {
              document.getElementById(reactor).src = `../images/l/${value}.png`;
              document.getElementById(reactor).style.opacity = 1.0;
              if (time != 0) {
                withdrawReaction(reactor, time * 1000);
              }
            } else if (typeof value == "number") {
              // TODO: 数値の表示
              console.log("value is Number!");
            }
          }
        });
      }
    }

    if (fromArray.includes("delta_temperature")) {
      ts.watch({where: "delta", type: "sensor", name: "temperature"}, (err, tuple) => {
        const temp = Math.round(tuple.data.value * 10) / 10;
        console.log("delta_temperature = " + temp);
        document.getElementById("delta_temperature_value_text").innerHTML = temp + "℃";
      });
    }

    if (fromArray.includes("delta_light")) {
      ts.watch({where: "delta", type: "sensor", name: "light"}, (err, tuple) => {
        const value = tuple.data.value;
        console.log("delta_light = " + value);
        document.getElementById("delta_light_value_text").innerHTML = value;
        if (value <= 100) {
          document.getElementById("delta_light").src = "images/l/delta_light.png";
        } else {
          document.getElementById("delta_light").src = "images/l/delta_light_on.png";
        }
      });
    }

    if (fromArray.includes("delta_door")) {
      ts.watch({where: "delta", type: "door", cmd: "open"}, (err, tuple) => {
        console.log("delta_door_open!!");
        const date = new Date();
        document.getElementById("delta_door_value_text").innerHTML =
            "Last OPEN " + date.getHours()+ ":" + date.getMinutes() + ":" + date.getSeconds();
        document.getElementById("delta_door").src = "images/l/delta_door_open.png";
        window.setTimeout(() => {
          document.getElementById("delta_door").src = "images/l/delta_door.png";
        }, 10000);
      });
    }

    if (fromArray.includes("enoshima_wind")) {
      ts.watch({where: "enoshima", type: "sensor", name: "wind"}, (err, tuple) => {
        document.getElementById("enoshima_wind_value_text").innerHTML =
            tuple.data.direction + " の風 " + tuple.data.speed + "m/s";
      });
    }
  });

  // リアクションの書き込みのViewはいらないので削除
  const body_ids = ["name_input", "switch_menu", "stamp_grid_view", "img"];
  for (let i in body_ids) {
    const ele = document.getElementById(body_ids[i]);
    ele.parentNode.removeChild(ele);
  }

  const minCellWidth = 100; //TODO: ユーザが任意に変えられるようにしようかな
  const minCellHeight = 100;
  const gridSize = getGridSize(window.innerWidth, window.innerHeight, minCellWidth, fromArray.length);
  const columnCount = gridSize.columnCount;
  const rowCount = gridSize.rowCount;
  console.log("columnCount = " + columnCount + ", rowCount = " + rowCount);
  const cellWidth = Math.max(window.innerWidth / columnCount, minCellWidth);
  const cellHeight = Math.max(window.innerHeight / rowCount, minCellHeight);

  for (let i in fromArray) {
    const name = fromArray[i];
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