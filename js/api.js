// Link lấy từ ảnh của bạn (Chứa workouts và exercises)
const api_base = 'https://6a4565b2aab3faec3f69e16d.mockapi.io'; 

// DÁN LINK PROJECT MỚI CỦA BẠN VÀO ĐÂY (Để chứa history)
const api_history_base = 'https://6a467939a268c8be2ce7ed36.mockapi.io'; 

// ==========================================
// API BÀI TẬP (WORKOUTS & EXERCISES)
// ==========================================

async function get_workouts() {
    try {
        const res = await fetch(`${api_base}/workouts`);
        if (!res.ok) throw new Error('Failed to fetch');
        return await res.json();
    } catch (error) {
        console.error(error);
        show_toast('Lỗi khi tải dữ liệu bài tập', 'danger');
        return [];
    }
}

function get_exercises() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${api_base}/exercises`,
            method: 'GET',
            success: function(data) {
                resolve(data);
            },
            error: function(err) {
                console.error(err);
                resolve([]);
            }
        });
    });
}

async function create_workout(workout_data) {
    try {
        const res = await fetch(`${api_base}/workouts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workout_data)
        });
        return await res.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function update_workout(id_bai_tap, workout_data) {
    try {
        const res = await fetch(`${api_base}/workouts/${id_bai_tap}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workout_data)
        });
        return await res.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function delete_workout(id_bai_tap) {
    try {
        await fetch(`${api_base}/workouts/${id_bai_tap}`, { method: 'DELETE' });
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

// ==========================================
// API LỊCH SỬ TẬP LUYỆN (HISTORY)
// ==========================================

async function get_history() {
    try {
        const res = await fetch(`${api_history_base}/history`);
        if (!res.ok) throw new Error('Lỗi fetch history');
        return await res.json();
    } catch (error) {
        console.error("Chưa kết nối được kho Lịch sử. Hãy chắc chắn bạn đã điền đúng link api_history_base nhé!", error);
        return [];
    }
}

async function create_history(history_data) {
    try {
        const res = await fetch(`${api_history_base}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(history_data)
        });
        return await res.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}
// Xóa lịch sử tập luyện trên MockAPI (DELETE)
async function delete_history(id_phien) {
    try {
        await fetch(`${api_history_base}/history/${id_phien}`, { method: 'DELETE' });
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
// ==========================================
// TIỆN ÍCH GIAO DIỆN
// ==========================================

function show_toast(message, type = 'success') {
    const toast_html = `
        <div class="toast align-items-center text-white bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>`;
    const toast_container = document.createElement('div');
    toast_container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toast_container.style.zIndex = '1060';
    toast_container.innerHTML = toast_html;
    document.body.appendChild(toast_container);
    const toast_el = new bootstrap.Toast(toast_container.querySelector('.toast'));
    toast_el.show();
    setTimeout(() => toast_container.remove(), 3000);
}