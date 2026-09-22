const Room = require('./room');

class GameManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room
  }

  getOrCreateRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Room(roomId));
    }
    return this.rooms.get(roomId);
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  removeRoomIfEmpty(roomId) {
    const room = this.rooms.get(roomId);
    if (room && room.isEmpty()) {
      this.rooms.delete(roomId);
    }
  }
}

module.exports = GameManager;