export class RoomManager {
  static getRoomId() {
    const params = new URLSearchParams(window.location.search);
    let roomId = params.get('room');
    if (!roomId) {
      roomId = 'ott_' + Math.random().toString(36).substring(2, 8);
      const newUrl = `${window.location.pathname}?room=${roomId}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
    return roomId;
  }
}