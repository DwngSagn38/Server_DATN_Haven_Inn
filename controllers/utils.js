function formatCurrencyVND(amount) {
    const number = parseFloat(amount);
    if (!isNaN(number)) {
        return number.toLocaleString('vi-VN');
    } else {
        return 'Invalid amount';
    }
}

module.exports = { formatCurrencyVND };