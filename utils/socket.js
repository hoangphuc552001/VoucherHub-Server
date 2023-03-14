function Socket(server) {
    const io = require("socket.io")(server);
    return io;
}

module.exports = Socket;
