function formatCurrencyVND(amount) {
    const number = parseFloat(amount);
    if (!isNaN(number)) {
        return number.toLocaleString('vi-VN');
    } else {
        return 'Invalid amount';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);

    // Lấy ngày, tháng, năm từ đối tượng Date
    const day = String(date.getDate()).padStart(2, '0'); // Đảm bảo có 2 chữ số
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng được tính từ 0
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

module.exports = { formatCurrencyVND, formatDate };