const { Server } = require('socket.io');

let io;

module.exports = {
  init: (server) => {
    // Khởi tạo Socket.IO với server và tùy chỉnh CORS nếu cần thiết
    io = new Server(server, {
      cors: {
        origin: "http://localhost:3000", // Thay * bằng domain cụ thể nếu cần
        methods: ["GET", "POST"],
      },
    });

    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      // Lấy id_NguoiDung từ client
      const id_NguoiDung = socket.handshake.query.idNguoiDung;

      // Nếu có id_NguoiDung, thêm user vào phòng riêng theo id
      if (id_NguoiDung) {
        socket.join(id_NguoiDung);
        console.log(`User with ID: ${id_NguoiDung} joined room.`);
      }

      // Lắng nghe sự kiện join-admin để thêm admin vào phòng admin
      socket.on('join-admin-room', () => {
        socket.join('admin-room');
        console.log(`Socket ${socket.id} joined admin-room`);
      });

      // Xử lý khi client ngắt kết nối
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });

      // Ví dụ: Xử lý sự kiện custom từ client
      socket.on('custom-event', (data) => {
        console.log('Received custom-event with data:', data);
        // Phát lại sự kiện này tới phòng admin
        io.to('admin-room').emit('new-notification', data);
      });

      // // Gửi thông báo đến admin-room
      // function sendNotification(message, details) {
      //   io.to('admin-room').emit('new-notification', {
      //     message,    // Tóm tắt thông báo
      //     details,    // Chi tiết thông báo
      //   });
      // }

      // // Ví dụ: Gửi thông báo mỗi 30 giây (chỉ để test)
      // setInterval(() => {
      //   sendNotification(
      //     `Thông báo mới lúc ${new Date().toLocaleTimeString()}`,
      //     `Chi tiết thông báo được gửi vào lúc ${new Date().toLocaleTimeString()}`
      //   );
      // }, 30000);
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
