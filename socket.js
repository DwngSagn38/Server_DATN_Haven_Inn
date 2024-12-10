const socketIo = require('socket.io');

let io;

module.exports = {
  init: (server) => {
    io = socketIo(server); // Khởi tạo Socket.IO với server
    io.on('connection', (socket) => {
        console.log('A user connected');

        // Lấy id_NguoiDung từ client (ví dụ: thông qua query hoặc sự kiện)
        const id_NguoiDung = socket.handshake.query.idNguoiDung;
        if (id_NguoiDung) {
            socket.join(id_NguoiDung); // Tham gia phòng dựa trên id_NguoiDung
            console.log(`User joined room: ${id_NguoiDung}`);
        }
    
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
};