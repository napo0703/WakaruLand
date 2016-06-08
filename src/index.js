import $ from 'jquery'

$('#switch_menu').on("click", () => {
  switchMenu()
});

import SocketIO from 'socket.io-client'

const reactions = ["blank", "エモいね", "ひえぇ〜", "一理ある", "いい話だ", "神", "感動した", "気になる", "まじかよ",
                   "なるほど", "乙", "知ってた", "そうだね", "そうかも", "そうかな", "すごい！", "たしかに",
                   "たすけて", "天才", "尊い", "わからん", "わかる！", "笑", "⭕️", "❌"];

const sensors = ["delta_light", "delta_temperature", "delta_door", "enoshima_wind", "sfc_weather",
                 "shokai_light", "shokai_temperature"];

// connect Socket.IO & Linda
const server_url = "//linda-server.herokuapp.com/";
const socket = SocketIO(server_url);
const linda = new Linda().connect(socket);
const ts = linda.tuplespace("masuilab");

// URL末尾のカンマ区切り文字列から表示するユーザを抽出
const display_users = Array.from(new Set(location.search.substring(1).split(',')));
console.log(display_users);

if (display_users.length == 0 ||
    (display_users.length == 1 && (display_users[0].charAt(0) == "@" || display_users[0] == ""))) {
  /**
   * console リアクション投稿ページ
   * URL末尾に何も書かない、Twitterユーザ名が1人のとき
   */

  let myName = "test";
  if (display_users.length == 0 || display_users[0] == "") {
    if (window.localStorage) {
      myName = localStorage.name || myName;
    }
  } else {
    myName = display_users[0];
  }
  document.getElementById("name_text_box").value = myName.substring(1);

  // TODO: クリックした長さで表示時間を変える
  // 一瞬 -> 15秒,   2秒 -> 5分,   5秒 -> ずっと
  var sendReaction = (reaction, time) => {
    myName = "@" + document.getElementById("name_text_box").value;
    if (window.localStorage) localStorage.name = myName;
    document.getElementById("img").src = `images/l/${reaction}.png`;
    document.getElementById(reaction + "_cell").style.backgroundColor = "#ffffff";
    ts.write({from: myName, value: reaction, time: time});
    switchMenu();
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
    const reaction = reactions[i];
    const gridCell = document.createElement("div");
    gridCell.setAttribute("class", "icon");
    gridCell.setAttribute("id", reaction + "_cell");
    gridCell.setAttribute("style", "background-color:#ffffff");

    const img = document.createElement("img");
    img.setAttribute("id", reaction);
    img.setAttribute("src", `images/${reaction}.png`);
    img.setAttribute("width", "100%");
    
    gridCell.appendChild(img);
    document.getElementById("stamp_grid_view").appendChild(gridCell);
  }

  let mousedown_id;
  let mousedown_count = 0;
  const startCount = (reaction) => {
    mousedown_id = setInterval(() => {
      mousedown_count += 1;
      if (mousedown_count >= 5) {
        document.getElementById(reaction + "_cell").style.backgroundColor = "#ffbbbb";
      } else if (mousedown_count >= 2) {
        document.getElementById(reaction + "_cell").style.backgroundColor = "#bbbbff";
      }
    }, 1000);
  };

  for (let i in reactions) {
    const reaction = reactions[i];
    document.getElementById(reaction + "_cell").addEventListener("mousedown", () => {
      startCount(reaction);
    });
    document.getElementById(reaction + "_cell").addEventListener("mouseup", () => {
      clearInterval(mousedown_id);
      if (mousedown_count >= 5) {
        sendReaction(reaction, 0);
      } else if (mousedown_count >= 2) {
        sendReaction(reaction, 600);
      } else {
        sendReaction(reaction, 30);
      }
      mousedown_count = 0;
    });
  }

} else {
  /**
   * grid ユーザの一覧ページ
   * URL末尾に2人以上Twitterユーザ名を書いたとき、1つ以上Twitterユーザ名【以外】を書いたとき
   */

  // 表示する人/物/現象のViewを動的に生成する
  const createUserCell = (from, cellWidth, cellHeight) => {
    const cell = document.createElement("div");
    cell.setAttribute("class", "cell");

    const user_icon_layer = document.createElement("img");
    user_icon_layer.setAttribute("class", "user_image");
    user_icon_layer.setAttribute("id", from + "_image");
    user_icon_layer.setAttribute("src", "http://www.paper-glasses.com/api/twipi/" + from.substring(1) + "/original");

    const reaction_img_layer = document.createElement("img");
    reaction_img_layer.setAttribute("class", "reaction_image");
    reaction_img_layer.setAttribute("id", from + "_reaction");
    reaction_img_layer.setAttribute("src", "/images/l/blank.png");

    const reaction_text_layer = document.createElement("div");
    reaction_text_layer.setAttribute("class", "reaction_text");
    reaction_text_layer.setAttribute("id", from + "_reaction_text");

    if (cellWidth >= cellHeight) {
      user_icon_layer.setAttribute("height", "100%");
      reaction_img_layer.setAttribute("height", "100%");
      reaction_text_layer.setAttribute("height", "100%");
    } else {
      user_icon_layer.setAttribute("width", "100%");
      reaction_img_layer.setAttribute("width", "100%");
      reaction_text_layer.setAttribute("width", "100%");
    }

    cell.appendChild(user_icon_layer);
    cell.appendChild(reaction_img_layer);
    cell.appendChild(reaction_text_layer);
    return cell;
  };

  const createSensorCell = (from, cellWidth, cellHeight) => {
    const cell = document.createElement("div");
    cell.setAttribute("class", "cell");
    
    const sensor_img_layer = document.createElement("img");
    sensor_img_layer.setAttribute("class", "sensor_image");
    sensor_img_layer.setAttribute("id", from + "_image");
    sensor_img_layer.setAttribute("src", "images/l/" + from + ".png");
    
    const sensor_value_text_layer = document.createElement("figcaption");
    sensor_value_text_layer.setAttribute("class", "caption");
    
    const sensor_value_text = document.createElement("p");
    sensor_value_text.setAttribute("id", from + "_value_text");

    if (cellWidth >= cellHeight) {
      sensor_img_layer.setAttribute("height", "100%");
    } else {
      sensor_img_layer.setAttribute("width", "100%");
    }

    sensor_value_text_layer.appendChild(sensor_value_text);
    cell.appendChild(sensor_img_layer);
    cell.appendChild(sensor_value_text_layer);
    return cell;
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
    if (time == 0 && reactor in timer_ids) {
      window.clearTimeout(timer_ids[reactor]);
    } else {
      if (reactor in timer_ids) {
        window.clearTimeout(timer_ids[reactor]);
      }
      console.log("time = " + time + "msec");
      timer_ids[reactor] = window.setTimeout(() => {
        console.log("withdraw -> " + reactor);
        if (sensors.includes(reactor)) {
          document.getElementById(reactor + "_image").src = `../images/l/${reactor}.png`;
        } else {
          document.getElementById(reactor + "_reaction").src = "/images/l/blank.png";
          document.getElementById(reactor + "_image").style.opacity = 1.0;
        }
      }, time);
    }
  };

  linda.io.on("connect", function(){
    console.log("connect Linda!!");

    for (let i in display_users) {
      if (display_users[i].charAt(0) == "@") {
        ts.watch({from: display_users[i]}, (err, tuple) => {
          const reactor = tuple.data.from;
          if (display_users.includes(reactor)) {
            const value = tuple.data.value;
            const time = tuple.data.time;
            const ip_address = tuple.from;
            console.log(reactor + " < " + value + " " + time + "sec (from " + ip_address + ")");
            document.getElementById(reactor + "_reaction").src = `../images/l/${value}.png`;
            document.getElementById(reactor + "_image").style.opacity = 0.25;
            if (time != 0) {
              withdrawReaction(reactor, time * 1000);
            }
          }
        });
      }
    }

    if (display_users.includes("delta_temperature")) {
      ts.watch({where: "delta", type: "sensor", name: "temperature"}, (err, tuple) => {
        const temp = Math.round(tuple.data.value * 10) / 10;
        console.log("delta_temperature = " + temp);
        document.getElementById("delta_temperature_value_text").innerHTML = temp + "℃";
      });
    }

    if (display_users.includes("delta_light")) {
      ts.watch({where: "delta", type: "sensor", name: "light"}, (err, tuple) => {
        const value = tuple.data.value;
        console.log("delta_light = " + value);
        document.getElementById("delta_light_value_text").innerHTML = value;
        if (value <= 100) {
          document.getElementById("delta_light_image").src = "images/l/delta_light.png";
        } else {
          document.getElementById("delta_light_image").src = "images/l/delta_light_on.png";
        }
      });
    }

    if (display_users.includes("delta_door")) {
      ts.watch({where: "delta", type: "door", cmd: "open"}, (err, tuple) => {
        console.log("delta_door_open!!");
        const date = new Date();
        const minute = date.getMinutes() > 10 ? date.getMinutes() : "0" + date.getMinutes();
        const second = date.getSeconds() > 10 ? date.getSeconds() : "0" + date.getSeconds();
        document.getElementById("delta_door_value_text").innerHTML =
            "Last OPEN " + date.getHours()+ ":" + minute + ":" + second;
        document.getElementById("delta_door_image").src = "images/l/delta_door_open.png";
        window.setTimeout(() => {
          document.getElementById("delta_door_image").src = "images/l/delta_door.png";
        }, 10000);
      });
    }

    if (display_users.includes("enoshima_wind")) {
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
  const gridSize = getGridSize(window.innerWidth, window.innerHeight, minCellWidth, display_users.length);
  const columnCount = gridSize.columnCount;
  const rowCount = gridSize.rowCount;
  console.log("columnCount = " + columnCount + ", rowCount = " + rowCount);
  const cellWidth = Math.max(window.innerWidth / columnCount, minCellWidth);
  const cellHeight = Math.max(window.innerHeight / rowCount, minCellHeight);

  for (let i in display_users) {
    const name = display_users[i];
    let cell;
    if (name.charAt(0) == "@") {
      cell = createUserCell(name, cellWidth, cellHeight);
    } else {
      cell = createSensorCell(name, cellWidth, cellHeight);
    }
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
