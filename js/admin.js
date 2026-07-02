let current_edit_id = null;

// ==========================================
// 1. QUẢN LÝ BÀI TẬP (WORKOUTS)
// ==========================================

async function load_admin_workouts() {
    const workouts_data = await get_workouts();
    render_admin_table(workouts_data);
    populate_exercise_types();
}

function render_admin_table(workouts_data) {
    const tbody = document.querySelector('#workoutTable tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    workouts_data.forEach(w => {
        const row = `
            <tr>
                <td class="align-middle">${format_date(w.date)}</td>
                <td class="align-middle fw-medium">${w.name}</td>
                <td class="align-middle">${w.exerciseType || ''}</td>
                <td class="align-middle">${w.duration} phút</td>
                <td class="align-middle text-success fw-bold">${w.calories} calo</td>
                <td class="align-middle text-center">
                    <button onclick="edit_workout('${w.id}')" class="btn btn-sm btn-outline-warning fw-bold me-1"><i class="fa-solid fa-pen"></i> Sửa</button>
                    <button onclick="delete_workout_confirm('${w.id}')" class="btn btn-sm btn-outline-danger fw-bold"><i class="fa-solid fa-trash"></i> Xóa</button>
                </td>
            </tr>`;
        tbody.innerHTML += row;
    });
}

async function populate_exercise_types() {
    const exercises_data = await get_exercises();
    const select_el = document.getElementById('exerciseType');
    select_el.innerHTML = '<option value="">Chọn loại bài tập</option>';
    exercises_data.forEach(ex => {
        const opt = document.createElement('option');
        opt.value = ex.name;
        opt.textContent = ex.name;
        select_el.appendChild(opt);
    });
}

function hien_thi_loi(input_id, thong_bao) {
    const input_el = document.getElementById(input_id);
    input_el.classList.add('is-invalid');
    const loi_el = document.createElement('div');
    loi_el.className = 'invalid-feedback msg-loi';
    loi_el.innerText = thong_bao;
    input_el.parentNode.appendChild(loi_el);
}

function xoa_loi_form() {
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    document.querySelectorAll('.msg-loi').forEach(el => el.remove());
}

async function save_workout(e) {
    e.preventDefault();
    xoa_loi_form();
    
    let hop_le = true;
    const ten_bai = document.getElementById('name').value.trim();
    const thoi_gian = parseInt(document.getElementById('duration').value);
    const calo = parseInt(document.getElementById('calories').value);
    
    if (ten_bai === '') {
        hien_thi_loi('name', 'Vui lòng nhập tên buổi tập!');
        hop_le = false;
    }
    if (isNaN(thoi_gian) || thoi_gian <= 0) {
        hien_thi_loi('duration', 'Thời gian tập phải lớn hơn 0!');
        hop_le = false;
    }
    if (isNaN(calo) || calo <= 0) {
        hien_thi_loi('calories', 'Lượng calo đốt cháy phải lớn hơn 0!');
        hop_le = false;
    }

    if (!hop_le) return;
    
    const workout_data = {
        name: ten_bai,
        exerciseType: document.getElementById('exerciseType').value,
        duration: thoi_gian,
        calories: calo,
        muscleGroup: document.getElementById('muscleGroup').value,
        notes: document.getElementById('notes').value,
        date: new Date().toISOString()
    };
    
    try {
        if (current_edit_id) {
            await update_workout(current_edit_id, workout_data);
            show_toast('Cập nhật bài tập thành công!');
        } else {
            await create_workout(workout_data);
            show_toast('Thêm bài tập mới thành công!');
        }
        $('#workoutFormModal').modal('hide');
        load_admin_workouts();
        document.getElementById('workoutForm').reset();
        current_edit_id = null;
    } catch (err) {
        show_toast('Có lỗi xảy ra kết nối API!', 'danger');
    }
}

async function edit_workout(id_bai_tap) {
    current_edit_id = id_bai_tap;
    const workouts_data = await get_workouts();
    const workout_item = workouts_data.find(w => w.id == id_bai_tap);
    
    if (workout_item) {
        xoa_loi_form();
        document.getElementById('formTitle').textContent = 'Sửa Buổi Tập';
        document.getElementById('name').value = workout_item.name;
        document.getElementById('exerciseType').value = workout_item.exerciseType || '';
        document.getElementById('duration').value = workout_item.duration;
        document.getElementById('calories').value = workout_item.calories;
        document.getElementById('muscleGroup').value = workout_item.muscleGroup || '';
        document.getElementById('notes').value = workout_item.notes || '';
        document.getElementById('workoutId').value = id_bai_tap;
        
        new bootstrap.Modal(document.getElementById('workoutFormModal')).show();
    }
}

async function delete_workout_confirm(id_bai_tap) {
    if (confirm('Xác nhận xóa bài tập này khỏi danh sách gốc?')) {
        const thanh_cong = await delete_workout(id_bai_tap);
        if (thanh_cong) {
            show_toast('Đã xóa bài tập thành công!');
            load_admin_workouts();
        }
    }
}

// ==========================================
// 2. QUẢN LÝ LỊCH SỬ TẬP LUYỆN (HISTORY)
// ==========================================

async function load_admin_history() {
    const lich_su_data = await get_history();
    render_history_table(lich_su_data);
}

function render_history_table(lich_su_data) {
    const tbody = document.querySelector('#historyTable tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    lich_su_data.slice().reverse().forEach(ls => {
        const row = `
            <tr>
                <td class="align-middle">${format_date(ls.date)}</td>
                <td class="align-middle fw-medium">${ls.name}</td>
                <td class="align-middle text-info">${ls.duration} phút</td>
                <td class="align-middle text-danger fw-bold">${ls.calories} calo</td>
                <td class="align-middle text-center">
                    <button onclick="xoa_lich_su_confirm('${ls.id}')" class="btn btn-sm btn-outline-danger fw-medium">
                        <i class="fa-solid fa-trash-can"></i> Xóa
                    </button>
                </td>
            </tr>`;
        tbody.innerHTML += row;
    });

    if (lich_su_data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Chưa có lịch sử tập luyện nào trên hệ thống.</td></tr>';
    }
}

async function xoa_lich_su_confirm(id_phien) {
    if (confirm('Cảnh báo: Bạn có chắc chắn muốn xóa vĩnh viễn phiên tập này khỏi lịch sử không? (Dữ liệu thống kê cũng sẽ bị giảm trừ)')) {
        const thanh_cong = await delete_history(id_phien);
        if (thanh_cong) {
            show_toast('Đã xóa dữ liệu lịch sử thành công!');
            load_admin_history(); 
        } else {
            show_toast('Xóa thất bại. Vui lòng kiểm tra lại kết nối!', 'danger');
        }
    }
}

// ==========================================
// LẮNG NGHE SỰ KIỆN VÀ KHỞI TẠO
// ==========================================

document.getElementById('workoutForm').addEventListener('submit', save_workout);

$(document).ready(function() {
    $('#workoutFormModal').on('hidden.bs.modal', function() {
        document.getElementById('workoutForm').reset();
        xoa_loi_form();
        current_edit_id = null;
        document.getElementById('formTitle').textContent = 'Thêm Buổi Tập Mới';
    });
});

// Tải dữ liệu cho cả 2 bảng khi mở trang Admin 
window.onload = () => {
    // Nếu chưa đăng nhập mà dám mò vào trang Admin, hệ thống sẽ đá văng ra ngoài
    const da_dang_nhap = sessionStorage.getItem('fittrack_da_dang_nhap') === 'true';
    if (!da_dang_nhap) {
        alert('⚠️ Báo động: Truy cập trái phép! Vui lòng đăng nhập trước khi vào trang Quản trị.');
        window.location.href = 'index.html';
        return;
    }
    
    load_admin_workouts();
    load_admin_history();
};