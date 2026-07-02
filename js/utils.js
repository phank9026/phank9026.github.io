// Format date
function format_date(chuoi_ngay) {
    const ngay = new Date(chuoi_ngay);
    return ngay.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Calculate total calories
function calculate_total_calories(mang_workouts) {
    return mang_workouts.reduce((tong, bai_tap) => tong + (parseInt(bai_tap.calories) || 0), 0);
}

// Simple progress bar for chart simulation
function create_simple_chart(mang_workouts) {
    const du_lieu_chart = {};
    mang_workouts.forEach(bai_tap => {
        const ngay_tap = bai_tap.date ? bai_tap.date.split('T')[0] : '2024-01-01';
        du_lieu_chart[ngay_tap] = (du_lieu_chart[ngay_tap] || 0) + (parseInt(bai_tap.calories) || 0);
    });
    return Object.entries(du_lieu_chart).slice(-7); // Lấy 7 ngày gần nhất
}