var me;
var peerdata = {};

function mainMenu() {
  displayUI("main");
}

function startGame() {
  document.body.classList.add("cursor-initialized");
  GAME = new Game();
  CURSOR = new Cursor();
  CURSOR.playerid = me;
  GAME.addCursor(CURSOR);
}

function createRoom(name) {
  let id = "";
  for (let i=0; i<name.length; i++) {
    id += name[i].charCodeAt(0);
  }
  
  const peer = new Peer(id);
  me = id;

  peer.on("open", function(id) {
    console.log("room created " + id);

    startGame();
  });

  peer.on("connection", function(conn) {
    initConnection(conn);
  });
}

function joinRoom(roomname) {
  let id = "";
  for (let i=0; i<roomname.length; i++) {
    id += roomname[i].charCodeAt(0);
  }
  peerdata.hostid = id;
  
  const peer = new Peer();
  
  peer.on("open", function(id) {
    me = id;
    
    startGame();
    console.log("room joined " + id);
    
    var conn = peer.connect(peerdata.hostid);
    initConnection(conn);
  });
}

function initConnection(conn, isHost) {
  conn.on("open", function() {
    conn.on("data", function(data) {
      switch (data.type) {
        case "game instance":
          GAME = new Game(data.data);
          GAME.addCursor(CURSOR);
          break;

        case "remaining time":
          GAME.time = data.data;
          break;

        case "new player":
          GAME.addCursor(new Cursor(data.data));
          break;
          
        case "update player":
          for (let cursor of GAME.cursors) {
            if (cursor.playerid == data.data.playerid) {
              cursor.setData(data.data);
            }
          };
          break;
      }
    });
    
    if (isHost) {
      conn.send({ type: "game instance", data: GAME.data() });
    }

    conn.send({ type: "new player", data: CURSOR.data() })
    
    var updateConnection = function() {
      if (isHost) conn.send({ type: "remaining time", data: GAME.time });
      
      if (CURSOR.hasUpdate) {
        conn.send({ type: "update player", data: CURSOR.data() });
        CURSOR.hasUpdate = false;
      }
      
      setTimeout(updateConnection, 500);
    };
    updateConnection();
  })
}