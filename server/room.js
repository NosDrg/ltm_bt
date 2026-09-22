class Room {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = {
      P1: null, // socket.id
      P2: null  // socket.id
    };
    this.gameState = null;
  }

  addPlayer(socketId) {
    if (!this.players.P1) {
      this.players.P1 = socketId;
      return 'P1';
    } else if (!this.players.P2) {
      this.players.P2 = socketId;
      return 'P2';
    }
    return null; // Phòng đã đủ 2 người
  }

  removePlayer(socketId) {
    if (this.players.P1 === socketId) {
      this.players.P1 = null;
    } else if (this.players.P2 === socketId) {
      this.players.P2 = null;
    }
  }

  isEmpty() {
    return !this.players.P1 && !this.players.P2;
  }

  isFull() {
    return !!(this.players.P1 && this.players.P2);
  }
}

module.exports = Room;