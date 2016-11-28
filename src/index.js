import $ from 'jquery'
import SocketIO from 'socket.io-client'

// 各ボタンのlistener
$('#image_url_text_box').keypress(function(e){
  if(e.which && e.which === 13 || e.keyCode && e.keyCode === 13) {
    addStampFromTextBox();
  }
});

$('#image_url_add_button').on("click", () => {
  addStampFromTextBox();
});

$('#console_switch_button').on("click", () => {
  switch_display();
});

$('#grid_switch_button').on("click", () => {
  switch_display();
});

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

let listeners = {};

// レイアウトの定数
const GRID_USER_INPUT_HEIGHT = 41;
const MIN_CELL_WIDTH = 10;
const MIN_CELL_HEIGHT = 10;

// connect Socket.IO & Linda
const server_url = "//linda-server.herokuapp.com";
const socket = SocketIO(server_url);
const linda = new Linda().connect(socket);
const ts = linda.tuplespace("masuilab");

linda.io.on("connect", () => {
  console.log("connect Linda!!");
  // FIXME: ループではなくて動的にJSを書き換えてwatchするタプルを列挙できないか？
  // Read ページを開いた時に1回だけ実行される
  for (let i in display_users) {
    if (display_users[i].charAt(0) == "@") {
      const cancel_id = ts.read({wakaruland: "reaction", from: display_users[i]}, (err, tuple) => {
        readReaction(tuple);
        setTimeout(() => {
          ts.cancel(cancel_id);
        }, 2000);
      })
    } else if (!display_users[i].match('^(https?)')) {
      const cancel_id = ts.read({wakaruland: "data", from: display_users[i]}, (err, tuple) => {
        readData(tuple);
        setTimeout(() => {
          ts.cancel(cancel_id);
        }, 2000);
      })
    }
  }

  // Watch
  for (let i in display_users) {
    if (display_users[i].charAt(0) == "@") {
      ts.watch({wakaruland: "reaction", from: display_users[i]}, (err, tuple) => {
        watchReaction(tuple);
      });
    } else if (!display_users[i].match('^(https?)')) {
      ts.watch({wakaruland: "data", from: display_users[i]}, (err, tuple) => {
        watchData(tuple);
      })
    }
  }
});

//lindaのネストが深くて見にくいので関数にした
const readReaction = (tuple) => {
  const reactor = tuple.data.from;
  const img_url = textToImgUrl(tuple.data.value);
  const reaction_unix_time = Math.floor(new Date(tuple.data.time).getTime() / 1000);
  const now_unix_time = Math.floor(new Date().getTime() / 1000);
  const display = (reaction_unix_time + tuple.data.display) - now_unix_time;
  if (img_url == "" || img_url == "https://i.gyazo.com/f1b6ad7000e92d7c214d49ac3beb33be.png" || display < 2 || display == "") {
    const style = "background:url('') center center no-repeat; background-size:contain";
    document.getElementById(reactor + "_reaction").setAttribute("style", style);
    document.getElementById(reactor + "_image").style.opacity = 1.0;
  } else {
    const style = "background:url('" + img_url + "') center center no-repeat; background-size:contain";
    document.getElementById(reactor + "_reaction").setAttribute("style", style);
    document.getElementById(reactor + "_image").style.opacity = 0.25;
    if (reactor == my_name) {
      document.getElementById("console_reaction_img").setAttribute("style", style);
    }
    withdrawReaction(reactor, display);
  }
};

const readData = (tuple) => {
  const from = tuple.data.from;
  const value = tuple.data.value;
  const written_unix_time = Math.floor(new Date(tuple.data.time).getTime() / 1000);
  const now_unix_time = Math.floor(new Date().getTime() / 1000);
  const display = (written_unix_time + tuple.data.display) - now_unix_time;
  const background = textToImgUrl(tuple.data.background);
  const style = "background:url('" + background + "') center center no-repeat; background-size:contain";
  document.getElementById(from + "_image").setAttribute("style", style);
  document.getElementById(from + "_value_text").innerHTML = value;
  // 設定されているlistenerを削除してから新しいlistenerをセットする
  const from_cell = document.getElementById(from);
  from_cell.removeEventListener("click", listeners[from], false);
  const listener = () => {ts.write(tuple.data.onclick);};
  from_cell.addEventListener("click", listener, false);
  listeners[from] = listener;
  if (display > 0) {
    document.getElementById(from + "_value_text").innerHTML = value;
    withdrawData(from, display);
  }
};

const watchReaction = (tuple) => {
  const reactor = tuple.data.from;
  const display = tuple.data.display;
  const ip_address = tuple.from;
  const img_url = textToImgUrl(tuple.data.value);
  console.log(reactor + " < " + img_url + " " + display + "sec (from " + ip_address + ")");
  if (img_url == "" || img_url == "https://i.gyazo.com/f1b6ad7000e92d7c214d49ac3beb33be.png" || display == "") {
    const style = "background:url('') center center no-repeat; background-size:contain";
    document.getElementById(reactor + "_reaction").setAttribute("style", style);
    document.getElementById(reactor + "_image").style.opacity = 1.0;
    if (reactor == my_name) {
      document.getElementById("console_reaction_img").setAttribute("style", style);
    }
  } else {
    const style = "background:url('" + img_url + "') center center no-repeat; background-size:contain";
    document.getElementById(reactor + "_reaction").setAttribute("style", style);
    document.getElementById(reactor + "_image").style.opacity = 0.25;
    if (reactor == my_name) {
      document.getElementById("console_reaction_img").setAttribute("style", style);
    }
    withdrawReaction(reactor, display);
  }
};

const watchData = (tuple) => {
  const from = tuple.data.from;
  const value = tuple.data.value;
  const display = tuple.data.display;
  const background = textToImgUrl(tuple.data.background);
  const ip_address = tuple.from;
  console.log(from + " < " + value + " " + display + "sec (from " + ip_address + ")");
  const style = "background:url('" + background + "') center center no-repeat; background-size:contain";
  document.getElementById(from + "_image").setAttribute("style", style);
  document.getElementById(from + "_value_text").innerHTML = value;
  // 設定されているlistenerを削除してから新しいlistenerをセットする
  const from_cell = document.getElementById(from);
  from_cell.removeEventListener("click", listeners[from], false);
  const listener = () => {ts.write(tuple.data.onclick);};
  from_cell.addEventListener("click", listener, false);
  listeners[from] = listener;
  let display_time;
  if (display == "") {
    display_time = 20;
  } else {
    display_time = display
  }
  withdrawData(from, display_time);
};

// URL末尾のカンマ区切り文字列から表示するユーザを抽出
const display_users = Array.from(new Set(location.search.substring(1).split(',')));

// テキストからSVG画像を作成
const createSvg = (text) => {
  const text_array = text.split(" ");
  console.log(text_array);
  const column_counts = [];
  for (let i in text_array) {
    column_counts.push(Array.from(text_array[i]).length);
  }
  const column_count = Math.max.apply(null, column_counts);
  const row_count = text_array.length;
  const max_text_count = Math.max(column_count, row_count);
  const font_size = 128 / max_text_count;

  let x_coordinate;
  let y_coordinate;
  if (column_count >= row_count) {
    x_coordinate = 0;
    y_coordinate = (114 - (font_size * row_count)) / 2 + font_size;
  } else {
    x_coordinate = (128 - (font_size * column_count)) / 2;
    y_coordinate = font_size - 4;
  }

  let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><g font-size="' + font_size +'px" font-family="YuGothic" font-weight="bold">';
  let i = 0;
  while (i < text_array.length) {
    const y = y_coordinate + (font_size * i);
    const add_text = '<text x="' + x_coordinate + '" y="' + y + '">' + text_array[i] + '</text>';
    svg += add_text;
    i += 1;
  }
  svg += '</g></svg>';
  return svg;
};

const createImage = (svg) => {
  const svg_data_uri = "data:image/svg+xml;utf8;base64," + btoa(unescape(encodeURIComponent(svg)));
  return svg_data_uri;
};

var sendReaction = (img_url, display_time) => {
  my_name = "@" + document.getElementById("name_text_box").value;
  if (window.localStorage) localStorage.name = my_name;
  const date = new Date();

  //自分の最新の発言を削除してからwriteする
  const cid = ts.take({wakaruland: "reaction", from: my_name});
  setTimeout( () => {
    ts.cancel(cid);
  }, 3000);
  ts.write({
    wakaruland: "reaction",
    from: my_name,
    display: display_time,
    time: date,
    value: img_url,
  }, {expire: display_time});

  // クリックしたスタンプ画像を先頭に移動
  const stamp_grid = document.getElementById("stamp_grid_view");
  stamp_grid.removeChild(document.getElementById(img_url + "_cell"));
  const my_images = Array.from(new Set(localStorage.images.split(',')));
  my_images.some((v, i) => {
    if (v == img_url) my_images.splice(i, 1);
  });
  my_images.unshift(img_url); //先頭に追加
  localStorage.images = my_images;
  appendStampCell(img_url, false);
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
      } else if (mousedown_count <= 14) {
        progress_bar.innerHTML = "1分";
      } else if (mousedown_count <= 23) {
        progress_bar.innerHTML = "10分";
      } else if (mousedown_count < 30) {
        progress_bar.innerHTML = "1時間";
      } else {
        progress_bar.innerHTML = "1日";
      }
    }
  }, 100);
};

// スタンプの一覧に画像を追加する
const appendStampCell = (value, append_last) => {
  let img_url;
  let id;
  let cell;
  if (value.match('^(https?|ftp)')) {
    img_url = value;
    cell = document.createElement("div");
    cell.setAttribute("class", "stamp_cell");
    cell.setAttribute("id", img_url + "_cell");
    const cell_style = "background:url('" + img_url + "') center center no-repeat; background-size:contain; background-color: #ffffff;";
    cell.setAttribute("style", cell_style);
    cell.addEventListener("mousedown", () => {
      startCount(img_url);
      const reaction_style = "background:url('" + img_url +"') center center no-repeat; background-size:contain";
      document.getElementById("console_reaction_img").setAttribute("style", reaction_style);
    });
  } else {
    img_url = createImage(createSvg(value));
    cell = document.createElement("div");
    cell.setAttribute("class", "stamp_cell");
    cell.setAttribute("id", value + "_cell");
    const cell_style = "background:url('" + img_url + "') center center no-repeat; background-size:contain; background-color: #ffffff;";
    cell.setAttribute("style", cell_style);
    cell.addEventListener("mousedown", () => {
      startCount(img_url);
      const reaction_style = "background:url('" + img_url +"') center center no-repeat; background-size:contain";
      document.getElementById("console_reaction_img").setAttribute("style", reaction_style);
    });
  }

  const delete_button = document.createElement("img");
  delete_button.setAttribute("class", "cell_delete_button");
  delete_button.setAttribute("width", "20px");
  delete_button.setAttribute("src", "images/delete.png");
  delete_button.addEventListener("mousedown", (event) => {
    displayDeleteDialog(value);
    event.stopPropagation();
  });
  cell.appendChild(delete_button);

  cell.addEventListener("mouseup", () => {
    clearInterval(mousedown_id);
    let display_time;
    if (mousedown_count <= 5) {
      display_time = 20;
    } else if (mousedown_count <= 14) {
      display_time = 60;
    } else if (mousedown_count <= 23) {
      display_time = 600;
    } else if (mousedown_count < 30) {
      display_time = 3600;
    } else {
      display_time = 86400;
    }
    if (value.match('^(https?|ftp)')) {
      sendReaction(img_url, display_time);
    } else {
      sendReaction(value, display_time);
    }
    mousedown_count = 0;
    const progress = document.getElementById("console_reaction_progress");
    const progress_bar = document.getElementById("console_reaction_progress_bar");
    progress.style.visibility = "hidden";
    progress_bar.style.visibility = "hidden";
    progress_bar.style.width = 0;
  });

  if (append_last) {
    document.getElementById("stamp_grid_view").appendChild(cell);
  } else {
    const stamp_grid_view = document.getElementById("stamp_grid_view");
    stamp_grid_view.insertBefore(cell, stamp_grid_view.firstChild);
  }
};

// 自分で追加した画像を削除
var removeStampImage = (img_url) => {
  const stamp_grid = document.getElementById("stamp_grid_view");
  // TODO: elementの存在チェック
  stamp_grid.removeChild(document.getElementById(img_url + "_cell"));
  const my_images = Array.from(new Set(localStorage.images.split(',')));
  my_images.some((v, i) => {
    if (v == img_url) my_images.splice(i, 1);
  });
  localStorage.images = my_images;
};

// URLから画像を追加
var addStampImage = (img_url) => {
  let my_images = Array.from(new Set(localStorage.images.split(',')));
  if (my_images.includes(img_url)) {
    const stamp_grid = document.getElementById("stamp_grid_view");
    stamp_grid.removeChild(document.getElementById(img_url + "_cell"));
    const my_images = Array.from(new Set(localStorage.images.split(',')));
    my_images.some((v, i) => {
      if (v == img_url) my_images.splice(i, 1);
    });
  }
  my_images.unshift(img_url); //先頭に追加
  localStorage.images = my_images;
  appendStampCell(img_url, false);
};

console.log(display_users);
// 表示する人/物/現象のViewを動的に生成する
const appendUserCell = (from) => {
  const cell = document.createElement("div");
  cell.setAttribute("class", "cell");
  cell.setAttribute("id", from);

  const background_layer = document.createElement("div");
  background_layer.setAttribute("class", "cell_background");
  background_layer.setAttribute("id", from + "_background");

  const user_icon_layer = document.createElement("div");
  user_icon_layer.setAttribute("class", "cell_image");
  user_icon_layer.setAttribute("id", from + "_image");
  const icon_style = "background:url('http://www.paper-glasses.com/api/twipi/" + from.substring(1) +"/original') center center no-repeat; background-size:contain";
  user_icon_layer.setAttribute("style", icon_style);

  const reaction_img_layer = document.createElement("div");
  reaction_img_layer.setAttribute("class", "cell_image");
  reaction_img_layer.setAttribute("id", from + "_reaction");
  reaction_img_layer.setAttribute("style", "background:url('') center center no-repeat; background-size:contain");

  background_layer.appendChild(user_icon_layer);
  background_layer.appendChild(reaction_img_layer);
  cell.appendChild(background_layer);
  return cell;
};

const appendSensorCell = (from) => {
  const cell = document.createElement("div");
  cell.setAttribute("class", "cell");
  cell.setAttribute("id", from);

  const background_layer = document.createElement("div");
  background_layer.setAttribute("class", "cell_background");
  background_layer.setAttribute("id", from + "_background");

  const sensor_icon_layer = document.createElement("div");
  sensor_icon_layer.setAttribute("class", "cell_image");
  sensor_icon_layer.setAttribute("id", from + "_image");
  const icon_style = "background:url('') center center no-repeat; background-size:contain";
  sensor_icon_layer.setAttribute("style", icon_style);

  const sensor_value_text_layer = document.createElement("figcaption");
  sensor_value_text_layer.setAttribute("class", "sensor_caption");

  const sensor_value_text = document.createElement("p");
  sensor_value_text.setAttribute("id", from + "_value_text");
  sensor_value_text.innerHTML = "　";

  sensor_value_text_layer.appendChild(sensor_value_text);
  background_layer.appendChild(sensor_icon_layer);
  background_layer.appendChild(sensor_value_text_layer);
  cell.appendChild(background_layer);
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

// reactorの発言をtime秒後に取り下げる
let timer_ids = {};
const withdrawReaction = (reactor, time) => {
  if (reactor in timer_ids) {
    window.clearTimeout(timer_ids[reactor]);
  }
  timer_ids[reactor] = window.setTimeout(() => {
    console.log("withdraw -> " + reactor);
    const reaction_style = "background:url('') center center no-repeat; background-size:contain";
    document.getElementById(reactor + "_reaction").setAttribute("style", reaction_style);
    document.getElementById(reactor + "_image").style.opacity = 1.0;
    if (reactor == my_name) {
      const reaction_style = "background:url('') center center no-repeat; background-size:contain";
      document.getElementById("console_reaction_img").setAttribute("style", reaction_style);
    }
  }, time * 1000); //ミリ秒
};

const withdrawData = (from, time) => {
  if (from in timer_ids) {
    window.clearTimeout(timer_ids[from]);
  }
  timer_ids[from] = window.setTimeout(() => {
    console.log("withdraw -> " + from);
    document.getElementById(from + "_value_text").innerHTML = "　";
  }, time * 1000); //ミリ秒
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

const relayout_grid = () => {
  const grid_width = window.innerWidth;
  const grid_height = window.innerHeight - GRID_USER_INPUT_HEIGHT;
  const gridSize = getGridSize(grid_width, grid_height, MIN_CELL_WIDTH, display_users.length);
  const columnCount = gridSize.columnCount;
  const rowCount = gridSize.rowCount;
  const cellWidth = Math.max(grid_width / columnCount, MIN_CELL_WIDTH);
  const cellHeight = Math.max(grid_height / rowCount, MIN_CELL_HEIGHT);
  const gridHeightProportion = (grid_height / window.innerHeight);

  let cellWidthProportion;
  let cellHeightProportion;
  if (grid_height < cellHeight * rowCount) {
    cellWidthProportion = 1 / rowCount;
    cellHeightProportion = gridHeightProportion / rowCount;
  } else {
    cellWidthProportion = 1 / columnCount;
    cellHeightProportion = gridHeightProportion / rowCount;
  }

  for (let i in display_users) {
    const from = display_users[i];
    let cell = document.getElementById(from);
    cell.style.width = Math.floor(cellWidthProportion * 1000) / 10 + "%";
    cell.style.height = Math.floor(cellHeightProportion * 1000) / 10 + "%";
    const background_layer = document.getElementById(from + "_background");
    if (cellWidth >= cellHeight) {
      background_layer.style.width = cellHeight - 8;
      background_layer.style.height = cellHeight - 8;
    } else {
      background_layer.style.width = cellWidth - 8;
      background_layer.style.height = cellWidth - 8;
    }
  }
};

const isConsoleOnly = () => {
  return (display_users.length == 0 ||
  (display_users.length == 1 && (display_users[0] == "" || display_users[0].charAt(0) == "@")));
};

var displayDeleteDialog = (img_url) => {
  if (window.confirm(img_url + "\nを削除します。よろしいですか？")) {
    removeStampImage(img_url);
  }
};

var toZenkaku = (strVal) => {
  var value = strVal.replace(/[!-~]/g,
      function( tmpStr ) {
        return String.fromCharCode(tmpStr.charCodeAt(0) + 0xFEE0);
      }
  );

  return value.replace(/”/g, "\"")
      .replace(/'/g, "’")
      .replace(/`/g, "｀")
      .replace(/\\/g, "＼")
      .replace(/~/g, "〜");
};

var addStampFromTextBox = () => {
  const value = document.getElementById("image_url_text_box").value;
  let image_url;
  if (value.match('^https://gyazo.com')) {
    image_url = value + ".png";
  } else if (value.match('^(https?|ftp).+?\.(jpg|jpeg|png|gif|bmp|svg)')) {
    image_url = value;
  } else {
    image_url = toZenkaku(value);
  }
  if (image_url) {
    addStampImage(image_url);
    document.getElementById("image_url_text_box").value = "";
  }
};

// テキストを渡すと画像のURLが返ってくる
var textToImgUrl = (text) => {
  let url;
  if (text.match('^https://gyazo.com')) {
    url = text + ".png";
  } else if (text.match('^(https?|ftp).+?\.(jpg|jpeg|png|gif|bmp|svg)')) {
    url = text;
  } else {
    url = createImage(createSvg(toZenkaku(text)));
  }
  return url;
};

/**
 *  ここから下はページを開いた時に実行されるもの
 */
// ローカルストレージまたはURL末尾のクエリから発言者名の設定
let my_name = "@test";
if (display_users.length == 1 && display_users[0].charAt(0) == "@") {
  my_name = display_users[0]
} else {
  my_name = localStorage.name || my_name;
}
document.getElementById("name_text_box").value = my_name.substring(1);

// localStorageから自分で追加した画像を表示
if (localStorage.images == null || localStorage.images == "") {
  localStorage.images = default_icons;
}

const appendStampFromLocalStorage = (() => {
  const my_images = Array.from(new Set(localStorage.images.split(',')));
  for (let i in my_images) {
    appendStampCell(my_images[i], true);
  }
  localStorage.images = Array.from(new Set(my_images));
})();

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

// Motion JPEG画像の表示とdataのclickリスナの一覧の生成
for (let i in display_users) {
  const from = display_users[i];
  if (from.charAt(0) == "@") {
    //
  } else if (from.match('^(https?)')) {
    const style = "background:url('" + from + "') center center no-repeat; background-size:contain";
    document.getElementById(from + "_image").setAttribute("style", style);
    document.getElementById(from + "_value_text").innerHTML = "";
  } else {
    // FIXME: ヤバイ？
    const dummy_listener = () => {};
    document.getElementById(from).addEventListener("click", dummy_listener, false);
    listeners[from] = dummy_listener();
  }
}

$(window).resize(() => {
  if (document.getElementById("grid").style.display == "block") {
    relayout_grid();
  }
});
