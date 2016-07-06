import $ from 'jquery'

$('#image_url_add_button').on("click", () => {
  addImage(document.getElementById("image_url_text_box").value);
});

$('#image_url_delete_button').on("click", () => {
  removeImage(document.getElementById("image_url_text_box").value);
});

$('#console_switch_button').on("click", () => {
  switch_display();
});

$('#grid_switch_button').on("click", () => {
  switch_display();
});

import SocketIO from 'socket.io-client'

const default_icons = [
  "https://i.gyazo.com/f1b6ad7000e92d7c214d49ac3beb33be.png",
  "https://i.gyazo.com/f461f7b9924dbc41ea5a9c745a45e34d.png",
  "https://i.gyazo.com/1fdfa88d9051c938a8dd9b0d28d714f4.png",
  "https://i.gyazo.com/22984674b6d0cbb46d781a70f420fbe4.png",
  "https://i.gyazo.com/6b03c00625edc66db10d4e5f5d57ae3d.png",
  "https://i.gyazo.com/1bc0ae9981d968a5014ebc5bd604b07e.png",
  "https://i.gyazo.com/67e6b6b0a9af872a47576f39d6edf11f.png",
  "https://i.gyazo.com/5beaf5e32f46a574106679b484a0546b.png",
  "https://i.gyazo.com/12e7ec7310fee975bc9f2eb1621d6145.png",
  "https://i.gyazo.com/4be7cfbb10dbdbba57f1388865cf6759.png",
  "https://i.gyazo.com/3cf5a7d371b382c09c2de707515ab250.png",
  "https://i.gyazo.com/d82fcdcd76c81aeec8077162abf21b6b.png",
  "https://i.gyazo.com/4a7203e6b3b54a5f38ac4c4020104c9c.png",
  "https://i.gyazo.com/ae8e5efc68b221a4321597c3e152fc90.png",
  "https://i.gyazo.com/f583d08f717d84d97747547c75e0da64.png",
  "https://i.gyazo.com/db030b45cbc759418719deb3f46cca39.png"
];

const sensors = ["delta_light", "delta_temperature", "delta_door", "enoshima_wind"];

const sensor_images = {
  "delta_door": "https://i.gyazo.com/a25a3fa1fabb36f01f9751d41243d6da.png",
  "delta_door_open": "https://i.gyazo.com/a588115b69ac57165c4e0372caf6ed53.png",
  "delta_light": "https://i.gyazo.com/d48b8b3b7027c0739fea18f1e77129af.png",
  "delta_light_on": "https://i.gyazo.com/b0388280bee7fd4ddef5b0d85b455a35.png",
  "delta_temperature": "https://i.gyazo.com/c74f7dbcb876de97320bbb50bf2de5ba.png",
  "enoshima_wind": "https://i.gyazo.com/d13f222ba330bf686b6cdcd98b264464.png"
};

// レイアウトの定数
const CONSOLE_WIDTH = 440;
const GRID_USER_INPUT_HEIGHT = 24;

// connect Socket.IO & Linda
const server_url = "//linda-server.herokuapp.com/";
const socket = SocketIO(server_url);
const linda = new Linda().connect(socket);
const ts = linda.tuplespace("masuilab");

linda.io.on("connect", () => {
  console.log("connect Linda!!");
  ts.watch({from: my_name}, (err, tuple) => {
    console.log(my_name+" < " + tuple.data.value);
    document.getElementById("console_reaction_img").src = tuple.data.value;
  });

  // 一覧表示
  for (let i in display_users) {
    if (display_users[i].charAt(0) == "@") {
      ts.watch({from: display_users[i]}, (err, tuple) => {
        const reactor = tuple.data.from;
        if (display_users.includes(reactor)) {
          const img_url = tuple.data.value;
          const time = tuple.data.time;
          const ip_address = tuple.from;
          console.log(reactor + " < " + img_url + " " + time + "sec (from " + ip_address + ")");
          document.getElementById(reactor + "_reaction").src = img_url;
          // 真っ白画像をリアクションした時
          if (img_url == "https://i.gyazo.com/f1b6ad7000e92d7c214d49ac3beb33be.png") {
            document.getElementById(reactor + "_image").style.opacity = 1.0;
          } else {
            document.getElementById(reactor + "_image").style.opacity = 0.25;
            if (time != 0) {
              withdrawReaction(reactor, time * 1000);
            }
          }
        }
      });
    }
  }

  // デルタのセンサ
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
        document.getElementById("delta_light_image").src = sensor_images["delta_light"];
      } else {
        document.getElementById("delta_light_image").src = sensor_images["delta_light_on"];
      }
    });
  }

  if (display_users.includes("delta_door")) {
    ts.watch({where: "delta", type: "door", cmd: "open"}, (err, tuple) => {
      console.log("delta_door_open!!");
      const date = new Date();
      const minute = date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes();
      const second = date.getSeconds() >= 10 ? date.getSeconds() : "0" + date.getSeconds();
      document.getElementById("delta_door_value_text").innerHTML = date.getHours()+ ":" + minute + ":" + second;
      document.getElementById("delta_door_image").src = sensor_images["delta_door_open"];
      window.setTimeout(() => {
        document.getElementById("delta_door_image").src = sensor_images["delta_door"];
      }, 10000);
    });
  }

  // 江ノ島の風
  if (display_users.includes("enoshima_wind")) {
    ts.watch({where: "enoshima", type: "sensor", name: "wind"}, (err, tuple) => {
      document.getElementById("enoshima_wind_value_text").innerHTML =
          tuple.data.direction + " の風 " + tuple.data.speed + "m/s";
    });
  }
});

// URL末尾のカンマ区切り文字列から表示するユーザを抽出
const display_users = Array.from(new Set(location.search.substring(1).split(',')));

var sendReaction = (reaction, time) => {
  my_name = "@" + document.getElementById("name_text_box").value;
  if (window.localStorage) localStorage.name = my_name;
  document.getElementById("console_reaction_img").src = reaction;
  document.getElementById(reaction + "_cell").style.backgroundColor = "#ffffff";
  ts.write({from: my_name, value: reaction, time: time});
  document.getElementById("image_url_text_box").value = reaction;
};

let mousedown_id;
let mousedown_count = 0;
const startCount = () => {
  const progress = document.getElementById("console_reaction_progress");
  const progress_bar = document.getElementById("console_reaction_progress_bar");
  mousedown_id = setInterval(() => {
    mousedown_count += 1;
    if (mousedown_count <= 30) {
      let display_time = document.getElementById("display_time");
      // mousedown_count 長押し時間（1/10秒）、second 表示時間（秒）
      if (mousedown_count >= 2) {
        progress.style.visibility = "visible";
        progress_bar.style.visibility = "visible";
        progress_bar.style.width = mousedown_count * 3.33 + "%";
      }
      if (mousedown_count <= 5) {
        progress_bar.innerHTML = "20秒";
      } else if (mousedown_count <= 15) {
        progress_bar.innerHTML = "1分";
      } else if (mousedown_count <= 25) {
        progress_bar.innerHTML = "10分";
      } else if (mousedown_count < 30) {
        progress_bar.innerHTML = "1時間";
      } else {
        progress_bar.innerHTML = "forever";
      }
    }
  }, 100);
};

// スタンプの一覧に画像を追加する
const appendStampCell = (img_url, append_last) => {
  const cell = document.createElement("div");
  cell.setAttribute("class", "stamp_cell");
  cell.setAttribute("id", img_url + "_cell");
  const img = document.createElement("img");
  img.setAttribute("class", "stamp_cell_img");
  img.setAttribute("id", img_url);
  img.setAttribute("src", img_url);
  img.setAttribute("width", "100%");
  img.addEventListener("mousedown", () => {
    startCount(img_url);
    document.getElementById("console_reaction_img").src = img_url;
    if (default_icons.includes(img_url)) {
      document.getElementById("image_url_text_box").value = "";
    } else {
      document.getElementById("image_url_text_box").value = img_url;
    }
  });

  img.addEventListener("mouseup", () => {
    clearInterval(mousedown_id);
    if (mousedown_count <= 5) {
      sendReaction(img_url, 20);
    } else if (mousedown_count <= 15) {
      sendReaction(img_url, 60);
    } else if (mousedown_count <= 25) {
      sendReaction(img_url, 600);
    } else if (mousedown_count < 30) {
      sendReaction(img_url, 3600);
    } else {
      sendReaction(img_url, 0);
    }
    mousedown_count = 0;
    const progress = document.getElementById("console_reaction_progress");
    const progress_bar = document.getElementById("console_reaction_progress_bar");
    progress.style.visibility = "hidden";
    progress_bar.style.visibility = "hidden";
    progress_bar.style.width = 0;
  });
  cell.appendChild(img);

  if (append_last) {
    document.getElementById("stamp_grid_view").appendChild(cell);
  } else {
    const stamp_grid_view = document.getElementById("stamp_grid_view");
    stamp_grid_view.insertBefore(cell, stamp_grid_view.firstChild);
  }
};

let my_images = "";

// 自分で追加した画像を削除
var removeImage = (img_url) => {
  const my_images_array = Array.from(new Set(localStorage.images.split(',')));
  const children = document.getElementById("grid_view").children;
  for (let i in children) {
    if (children[i].getAttribute("id") == img_url + "_cell") {
      document.getElementById("stamp_grid_view").removeChild(document.getElementById(img_url + "_cell"));
      my_images_array.splice(i, 1);
      break;
    }
  }
  localStorage.images = my_images_array;
};

// URLから画像を追加
var addImage = (img_url) => {
  appendStampCell(img_url, false);
  let my_images_array = [];
  const children = document.getElementById("grid_view").children;
  for (let i in children) {
    my_images_array.push(children[i].getAttribute("id"));
  }
  localStorage.images = my_images_array;
};

console.log(display_users);
// 表示する人/物/現象のViewを動的に生成する
const appendUserCell = (from) => {
  const cell = document.createElement("div");
  cell.setAttribute("class", "cell");
  cell.setAttribute("id", from);

  const user_icon_layer = document.createElement("img");
  user_icon_layer.setAttribute("class", "user_image");
  user_icon_layer.setAttribute("id", from + "_image");
  user_icon_layer.setAttribute("src", "http://www.paper-glasses.com/api/twipi/" + from.substring(1) + "/original");

  const reaction_img_layer = document.createElement("img");
  reaction_img_layer.setAttribute("class", "reaction_image");
  reaction_img_layer.setAttribute("id", from + "_reaction");
  reaction_img_layer.setAttribute("src", "https://i.gyazo.com/f1b6ad7000e92d7c214d49ac3beb33be.png");

  cell.appendChild(user_icon_layer);
  cell.appendChild(reaction_img_layer);

  return cell;
};

const appendSensorCell = (from) => {
  const cell = document.createElement("div");
  cell.setAttribute("class", "cell");
  cell.setAttribute("id", from);

  const sensor_img_layer = document.createElement("img");
  sensor_img_layer.setAttribute("class", "sensor_image");
  sensor_img_layer.setAttribute("id", from + "_image");
  sensor_img_layer.setAttribute("src", sensor_images[from]);

  const sensor_value_text_layer = document.createElement("figcaption");
  sensor_value_text_layer.setAttribute("class", "sensor_caption");

  const sensor_value_text = document.createElement("p");
  sensor_value_text.setAttribute("id", from + "_value_text");

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
        document.getElementById(reactor + "_image").src = sensor_images[reactor];
      } else {
        document.getElementById(reactor + "_reaction").src = "https://i.gyazo.com/f1b6ad7000e92d7c214d49ac3beb33be.png";
        document.getElementById(reactor + "_image").style.opacity = 1.0;
      }
    }, time);
  }
};

const switch_display = () => {
  if (!isConsoleOnly()) {
    const console = document.getElementById("console");
    const grid = document.getElementById("grid");
    if (console.style.display == "block") {
      console.style.display = "none";
      grid.style.display = "block";
    } else {
      console.style.display = "block";
      grid.style.display = "none";
    }
  }
};

const MIN_CELL_WIDTH = 10;
const MIN_CELL_HEIGHT = 10;

const relayout_grid = () => {
  let grid_width;
  const grid_height = window.innerHeight - GRID_USER_INPUT_HEIGHT;
  const console_style = document.getElementById("console").style;
  if (console_style.display == "block") {
    grid_width = window.innerWidth - CONSOLE_WIDTH;
  } else {
    grid_width = window.innerWidth;
  }
  const gridSize = getGridSize(grid_width, grid_height, MIN_CELL_WIDTH, display_users.length);
  const columnCount = gridSize.columnCount;
  const rowCount = gridSize.rowCount;
  const cellWidth = Math.max(grid_width / columnCount, MIN_CELL_WIDTH);
  const cellHeight = Math.max(grid_height / rowCount, MIN_CELL_HEIGHT);

  for (let i in display_users) {
    const from = display_users[i];
    let cell = document.getElementById(from);
    if (grid_height < cellHeight * rowCount) {
      cell.style.width = Math.floor(100 / rowCount) + "%";
      cell.style.height = Math.floor(100 / rowCount) + "%";
    } else {
      cell.style.width = Math.floor(100 / columnCount) + "%";
      cell.style.height = Math.floor(100 / rowCount) + "%";
    }

    const user_icon_layer = cell.children[0];
    const reaction_img_layer = cell.children[1];
    if (cellWidth >= cellHeight) {
      user_icon_layer.setAttribute("height", "100%");
      user_icon_layer.removeAttribute("width");
      reaction_img_layer.setAttribute("height", "100%");
      reaction_img_layer.removeAttribute("width");
    } else {
      user_icon_layer.setAttribute("width", "100%");
      user_icon_layer.removeAttribute("height");
      reaction_img_layer.setAttribute("width", "100%");
      reaction_img_layer.removeAttribute("height");
    }
  }
};

const isConsoleOnly = () => {
  return !!(display_users.length == 0 ||
  (display_users.length == 1 && (display_users[0] == "" || display_users[0].charAt(0) == "@")));
};

// ローカルストレージまたはURL末尾のクエリから発言者名の設定
let my_name = "@test";
if (display_users.length == 0) {
  my_name = localStorage.name || my_name;
} else if (display_users.length == 1 && display_users[0].charAt(0) == "@") {
  my_name = display_users[0]
} else {
  my_name = localStorage.name || my_name;
}
document.getElementById("name_text_box").value = my_name.substring(1);

// consoleの生成
// デフォルトで用意してある画像を表示
for (let i in default_icons) {
  appendStampCell(default_icons[i], true);
}

// localStorageから自分で追加した画像を表示
my_images = localStorage.images || my_images;
if (my_images.length != "") {
  const my_images_array = Array.from(new Set(my_images.split(',')));
  for (let i in my_images_array) {
    console.log(my_images_array[i]);
    appendStampCell(my_images_array[i], false);
  }
}

if (isConsoleOnly()) {
  const console = document.getElementById("console");
  const grid = document.getElementById("grid");
  const switch_button = document.getElementById("grid_switch_button");
  console.style.display = "block";
  grid.style.display = "none";
  switch_button.style.display = "none";
} else {
  // Gridの生成
  for (let i in display_users) {
    const name = display_users[i];
    let cell;
    if (name.charAt(0) == "@") {
      cell = appendUserCell(name);
    } else {
      cell = appendSensorCell(name);
    }
    document.getElementById("grid_view").appendChild(cell);
  }
  document.getElementById("console").style.display = "none";
  document.getElementById("grid").style.display = "block";
  relayout_grid();
}

$(window).resize(() => {
  if (document.getElementById("grid").style.display == "block") {
    relayout_grid();
  }
});