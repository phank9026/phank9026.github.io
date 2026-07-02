let danh_sach_workouts = [];
let danh_sach_lich_su = [];   
let ds_bai_da_chon = [];      
let tong_calo_du_kien = 0;    
let ds_bai_hoan_thanh = []; 

// ==========================================
// KIỂM TRA ĐĂNG NHẬP
// ==========================================
function kiem_tra_dang_nhap() {
    const da_dang_nhap = sessionStorage.getItem('fittrack_da_dang_nhap') === 'true';
    if (da_dang_nhap) {
        document.getElementById('nav_khach').classList.add('d-none');
        document.getElementById('nav_khach').classList.remove('d-lg-flex');
        document.getElementById('nav_thanh_vien').classList.remove('d-none');
        document.getElementById('nav_thanh_vien').classList.add('d-flex');
    } else {
        document.getElementById('nav_khach').classList.remove('d-none');
        document.getElementById('nav_khach').classList.add('d-lg-flex');
        document.getElementById('nav_thanh_vien').classList.add('d-none');
        document.getElementById('nav_thanh_vien').classList.remove('d-flex');
    }
    return da_dang_nhap;
}

// ==========================================
// KHỞI TẠO DỮ LIỆU
// ==========================================
async function load_workouts() {
    kiem_tra_dang_nhap(); // Khôi phục giao diện đăng nhập nếu tải lại trang
    
    danh_sach_workouts = await get_workouts();
    danh_sach_lich_su = await get_history(); 
    
    render_workouts(danh_sach_workouts);
    if (document.getElementById('statsRow')) {
        render_stats();
        render_progress_chart();
    }
    populate_filters();
}

function render_workouts(workouts_data) {
    const container_el = document.getElementById('workoutList');
    if (!container_el) return;
    container_el.innerHTML = '';
    
    workouts_data.forEach(w => {
        const da_chon = ds_bai_da_chon.includes(w.id);
        const vien_mau = da_chon ? 'border-warning' : '';
        const nut_mau = da_chon ? 'btn-danger' : 'btn-success';
        const nut_chu = da_chon ? '<i class="fa-solid fa-xmark"></i> Bỏ chọn' : '<i class="fa-solid fa-plus"></i> Chọn tập';

        const card_html = `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm border-0 border-bottom border-success border-3 ${vien_mau} transition-all">
                    <div class="card-body bg-dark text-white">
                        <h5 class="card-title text-success">${w.name}</h5>
                        <p class="text-secondary small mb-2"><i class="fa-regular fa-calendar"></i> ${format_date(w.date)}</p>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span><i class="fa-regular fa-clock text-warning"></i> <strong>${w.duration} phút</strong></span>
                            <span class="badge bg-success fs-6">${w.calories} calo</span>
                        </div>
                        <p class="mt-2 text-info small"><i class="fa-solid fa-dumbbell"></i> Nhóm cơ: ${w.muscleGroup || 'Toàn thân'}</p>
                    </div>
                    <div class="card-footer bg-dark border-top border-secondary d-flex gap-2">
                        <button onclick="show_detail('${w.id}')" class="btn btn-sm btn-outline-secondary flex-grow-1 text-white">Chi tiết</button>
                        <button onclick="chon_bai_tap('${w.id}', this)" class="btn btn-sm ${nut_mau} flex-grow-1">${nut_chu}</button>
                    </div>
                </div>
            </div>`;
        container_el.innerHTML += card_html;
    });
    
    if (workouts_data.length === 0) {
        container_el.innerHTML = '<p class="text-center text-muted">Chưa có bài tập nào. Hãy sang trang Admin để thêm mới!</p>';
    }
}

function render_stats() {
    const tong_calo_that = danh_sach_lich_su.reduce((tong, p) => tong + parseInt(p.calories || 0), 0);
    const tong_thoi_gian = danh_sach_lich_su.reduce((tong, p) => tong + parseInt(p.duration || 0), 0);
    const tong_phien_tap = danh_sach_lich_su.length;
    const thoi_gian_tb = tong_phien_tap > 0 ? Math.round(tong_thoi_gian / tong_phien_tap) : 0;
    
    const stats_row = document.getElementById('statsRow');
    if(stats_row) {
        stats_row.innerHTML = `
            <div class="col-md-4 mb-3">
                <div class="card text-center p-3 border-success bg-dark text-white shadow">
                    <h3 class="text-success fw-bold">${tong_calo_that}</h3>
                    <p class="text-secondary mb-0">Tổng calo đã đốt</p>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card text-center p-3 border-primary bg-dark text-white shadow">
                    <h3 class="text-primary fw-bold">${tong_phien_tap}</h3>
                    <p class="text-secondary mb-0">Tổng phiên tập</p>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card text-center p-3 border-warning bg-dark text-white shadow">
                    <h3 class="text-warning fw-bold">${thoi_gian_tb}</h3>
                    <p class="text-secondary mb-0">Thời gian TB (phút)</p>
                </div>
            </div>
        `;
    }
    
    const cal_count = document.getElementById('calories-count');
    if (cal_count) cal_count.innerText = tong_calo_that;
}

function xem_chi_tiet_phien_tap(id_phien_tap) {
    const phien_tap = danh_sach_lich_su.find(ls => ls.id == id_phien_tap); 
    if (!phien_tap) return;

    const vung_chi_tiet = document.getElementById('chi_tiet_luot_tap');
    if (vung_chi_tiet) {
        vung_chi_tiet.innerHTML = `
            <div class="mt-4 p-4 bg-black border border-warning rounded-4 shadow-lg" style="animation: fadeIn 0.4s ease-in-out;">
                <div class="d-flex justify-content-between border-bottom border-secondary pb-3 mb-3">
                    <h5 class="text-warning mb-0"><i class="fa-solid fa-bolt"></i> Chi tiết Lượt tập</h5>
                    <button class="btn-close btn-close-white" onclick="document.getElementById('chi_tiet_luot_tap').innerHTML = ''"></button>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-2 text-white fs-6"><strong><i class="fa-regular fa-calendar text-secondary"></i> Thời gian:</strong> ${format_date(phien_tap.date)}</p>
                        <p class="mb-2 text-white fs-6"><strong><i class="fa-solid fa-fire text-danger"></i> Calo đốt:</strong> ${phien_tap.calories} calo</p>
                        <p class="mb-2 text-white fs-6"><strong><i class="fa-regular fa-clock text-info"></i> Thời lượng:</strong> ${phien_tap.duration} phút</p>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1 text-success fs-6"><strong><i class="fa-solid fa-list-check"></i> Các bài đã tập:</strong></p>
                        <div class="p-2 border border-secondary rounded bg-dark text-white small" style="max-height: 100px; overflow-y: auto;">
                            ${phien_tap.name.replace('Đã tập: ', '')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function render_progress_chart() {
    const luot_tap_gan_nhat = danh_sach_lich_su.slice(-7); 
    
    let html_chart = '<div class="d-flex align-items-end justify-content-center" style="height: 250px; gap: 20px;">';
    
    if (luot_tap_gan_nhat.length === 0) {
        html_chart = '<div class="d-flex align-items-center justify-content-center h-100 text-muted">Chưa có dữ liệu. Tập luyện ngay để vẽ biểu đồ!</div>';
    } else {
        const max_calo = Math.max(...luot_tap_gan_nhat.map(ls => parseInt(ls.calories) || 0), 100);

        luot_tap_gan_nhat.forEach((ls, index) => {
            const height_bar = Math.max((ls.calories / max_calo) * 200, 20); 
            
            html_chart += `
                <div class="text-center flex-grow-1 position-relative" style="max-width: 60px; cursor: pointer;" onclick="xem_chi_tiet_phien_tap('${ls.id}')" title="Nhấn để xem chi tiết">
                    <div class="shadow-sm bar-chart-col" style="height: ${height_bar}px; background: linear-gradient(180deg, #198754 0%, #146c43 100%); border-radius: 6px 6px 0 0; transition: all 0.3s ease;"></div>
                    <small class="d-block mt-2 text-white">Lượt ${index + 1}</small>
                    <small class="fw-bold text-success">${ls.calories}</small>
                </div>`;
        });
        html_chart += '</div>';
    }
    
    const chart_container = document.getElementById('chartContainer');
    if(chart_container) {
        chart_container.innerHTML = html_chart;
        
        if (!document.getElementById('custom_chart_styles')) {
            const style = document.createElement('style');
            style.id = 'custom_chart_styles';
            style.innerHTML = `
                .bar-chart-col:hover {
                    transform: translateY(-8px);
                    background: linear-gradient(180deg, #20c997 0%, #198754 100%) !important;
                    box-shadow: 0 8px 15px rgba(32, 201, 151, 0.4) !important;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

function populate_filters() {
    const select_el = document.getElementById('categoryFilter');
    if(!select_el) return;
    const unique_types = [...new Set(danh_sach_workouts.map(w => w.exerciseType))];
    select_el.innerHTML = '<option value="">Tất cả bài tập</option>';
    unique_types.forEach(type_item => {
        if (type_item) {
            const opt = document.createElement('option');
            opt.value = type_item;
            opt.textContent = type_item;
            select_el.appendChild(opt);
        }
    });
}

function show_detail(id_bai_tap) {
    const workout_item = danh_sach_workouts.find(w => w.id == id_bai_tap);
    if (!workout_item) return;
    show_toast(`Chi tiết: ${workout_item.notes || 'Không có ghi chú thêm.'}`, 'info');
}

function chon_bai_tap(id_bai_tap, btn_element) {
    const bai_tap = danh_sach_workouts.find(w => w.id == id_bai_tap);
    if (!bai_tap) return;
    
    const the_card = btn_element.closest('.card');

    if (ds_bai_da_chon.includes(id_bai_tap)) {
        ds_bai_da_chon = ds_bai_da_chon.filter(id => id !== id_bai_tap);
        ds_bai_hoan_thanh = ds_bai_hoan_thanh.filter(id => id !== id_bai_tap);
        tong_calo_du_kien -= parseInt(bai_tap.calories) || 0;
        if(tong_calo_du_kien < 0) tong_calo_du_kien = 0;
        
        the_card.classList.remove('border-warning');
        btn_element.classList.remove('btn-danger');
        btn_element.classList.add('btn-success');
        btn_element.innerHTML = '<i class="fa-solid fa-plus"></i> Chọn tập';
        
        show_toast(`Đã bỏ chọn: ${bai_tap.name}`, 'secondary');
    } else {
        ds_bai_da_chon.push(id_bai_tap);
        tong_calo_du_kien += parseInt(bai_tap.calories) || 0;
        
        the_card.classList.add('border-warning');
        btn_element.classList.remove('btn-success');
        btn_element.classList.add('btn-danger');
        btn_element.innerHTML = '<i class="fa-solid fa-xmark"></i> Bỏ chọn';
        
        show_toast(`Đã thêm: ${bai_tap.name} (+${bai_tap.calories} calo)`, 'success');
    }
    
    cap_nhat_thanh_noi();
}

function cap_nhat_thanh_noi() {
    const vung_chon = document.getElementById('vung_chon_bai');
    const span_calo = document.getElementById('calo_du_kien');
    
    if(vung_chon && span_calo) {
        span_calo.innerText = tong_calo_du_kien;
        if (tong_calo_du_kien > 0) {
            vung_chon.classList.remove('d-none');
        } else {
            vung_chon.classList.add('d-none');
        }
    }
}

function bo_chon_tat_ca() {
    tong_calo_du_kien = 0;
    ds_bai_da_chon = [];
    ds_bai_hoan_thanh = [];
    
    cap_nhat_thanh_noi();
    
    document.querySelectorAll('.card.border-warning').forEach(el => el.classList.remove('border-warning'));
    document.querySelectorAll('button[onclick^="chon_bai_tap"]').forEach(btn => {
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-success');
        btn.innerHTML = '<i class="fa-solid fa-plus"></i> Chọn tập';
    });
    
    show_toast('Đã hủy toàn bộ giỏ bài tập', 'info');
}

function danh_dau_hoan_thanh(id_bai_tap, checkbox_element) {
    const div_thong_tin = document.getElementById(`thong_tin_bai_${id_bai_tap}`);
    
    if (checkbox_element.checked) {
        if (!ds_bai_hoan_thanh.includes(id_bai_tap)) {
            ds_bai_hoan_thanh.push(id_bai_tap);
        }
        div_thong_tin.classList.add('text-decoration-line-through', 'text-secondary');
        div_thong_tin.classList.remove('text-white');
    } else {
        ds_bai_hoan_thanh = ds_bai_hoan_thanh.filter(id => id !== id_bai_tap);
        div_thong_tin.classList.remove('text-decoration-line-through', 'text-secondary');
        div_thong_tin.classList.add('text-white');
    }
    
    const phan_tram = Math.round((ds_bai_hoan_thanh.length / ds_bai_da_chon.length) * 100) || 0;
    document.getElementById('badge_phan_tram').innerText = `${phan_tram}% Hoàn thành`;
    document.getElementById('thanh_tien_do').style.width = `${phan_tram}%`;
}

// ==========================================
// ĐẨY KẾT QUẢ LÊN MOCKAPI
// ==========================================
async function ket_thuc_phien_tap() {
    if (ds_bai_hoan_thanh.length === 0) {
        show_toast('Bạn chưa tích hoàn thành bài nào cả!', 'danger');
        return;
    }
    
    if (ds_bai_hoan_thanh.length < ds_bai_da_chon.length) {
        if (!confirm('Bạn chưa tập hết các bài đã chọn. Bạn có chắc chắn muốn kết thúc sớm?')) {
            return;
        }
    }
    
    show_toast('Đang lưu dữ liệu lên hệ thống...', 'primary');
    
    let calo_dat_duoc = 0;
    let thoi_gian_dat_duoc = 0;
    let ten_cac_bai = [];
    
    ds_bai_hoan_thanh.forEach(id => {
        const bai = danh_sach_workouts.find(w => w.id == id);
        if (bai) {
            calo_dat_duoc += parseInt(bai.calories) || 0;
            thoi_gian_dat_duoc += parseInt(bai.duration) || 0;
            ten_cac_bai.push(bai.name);
        }
    });
    
    const phien_tap_moi = {
        date: new Date().toISOString(),
        calories: calo_dat_duoc,
        duration: thoi_gian_dat_duoc,
        name: "Đã tập: " + ten_cac_bai.join(' | ')
    };
    
    try {
        await create_history(phien_tap_moi);
        danh_sach_lich_su = await get_history();
        
        show_toast(`Tuyệt vời! Bạn đã đốt cháy ${calo_dat_duoc} calo. Kết quả đã được lưu trữ!`, 'success');
        
        tong_calo_du_kien = 0;
        ds_bai_da_chon = [];
        ds_bai_hoan_thanh = [];
        navigate_to('progress');
        
    } catch (error) {
        show_toast('Lỗi khi đẩy dữ liệu lên máy chủ, vui lòng thử lại!', 'danger');
    }
}

// ==========================================
// ĐIỀU HƯỚNG VÀ HIỂN THỊ GIAO DIỆN (SPA)
// ==========================================
function navigate_to(ten_trang) {
    // CHỐT CHẶN: Nếu chưa đăng nhập mà ấn lung tung thì chặn lại
    const trang_thai_dang_nhap = sessionStorage.getItem('fittrack_da_dang_nhap') === 'true';
    if (!trang_thai_dang_nhap && ten_trang !== 'home') {
        show_toast('⚠️ Vui lòng đăng nhập để sử dụng tính năng này!', 'warning');
        
        // Tự động xổ form đăng nhập ra
        const form_dang_nhap = document.querySelector('#nav_khach .dropdown-toggle');
        if (form_dang_nhap && !form_dang_nhap.classList.contains('show')) {
            form_dang_nhap.click();
        }
        return; 
    }

    const trang_chu_el = document.querySelector('.position-relative'); 
    const content_area = document.getElementById('content-area'); 
    window.scrollTo(0, 0);

    if (ten_trang === 'home') {
        trang_chu_el.classList.remove('d-none');
        content_area.innerHTML = '';
        render_stats(); 
    } 
    else if (ten_trang === 'workout') {
        trang_chu_el.classList.add('d-none');
        
        content_area.innerHTML = `
            <div class="container py-5 position-relative">
                <h2 class="fw-bold mb-4 text-success border-bottom border-secondary pb-2"><i class="fa-solid fa-list-check"></i> Danh sách Luyện tập</h2>
                
                <div class="row mb-4">
                    <div class="col-md-6 mb-3">
                        <input type="text" id="searchInput" class="form-control bg-dark text-white border-secondary shadow-sm" placeholder="🔍 Nhập tên bài tập để tìm...">
                    </div>
                    <div class="col-md-6 mb-3">
                        <select id="categoryFilter" class="form-select bg-dark text-white border-secondary shadow-sm">
                            <option value="">Tất cả bài tập</option>
                        </select>
                    </div>
                </div>
                
                <div id="workoutList" class="row" style="padding-bottom: 80px;"></div>

                <div id="vung_chon_bai" class="position-fixed bottom-0 start-50 translate-middle-x mb-4 bg-warning text-dark px-4 py-3 rounded-pill shadow-lg ${tong_calo_du_kien > 0 ? '' : 'd-none'}" style="z-index: 1050; transition: all 0.3s; min-width: 380px; text-align: center; border: 2px solid #fff;">
                    <span class="fw-bold fs-6"><i class="fa-solid fa-fire-flame-curved text-danger"></i> Mục tiêu: <span id="calo_du_kien" class="fs-4 fw-bolder text-danger">${tong_calo_du_kien}</span> calo</span>
                    <button onclick="navigate_to('progress')" class="btn btn-sm btn-primary ms-3 fw-bold rounded-pill px-3 shadow">Bắt đầu tập <i class="fa-solid fa-arrow-right"></i></button>
                    <button onclick="bo_chon_tat_ca()" class="btn btn-sm btn-dark rounded-circle ms-2 fw-bold" title="Hủy chọn tất cả">X</button>
                </div>
            </div>
        `;
        
        gan_su_kien_loc();
        render_workouts(danh_sach_workouts); 
        populate_filters();
    } 
    else if (ten_trang === 'progress') {
        trang_chu_el.classList.add('d-none');
        
        let html_phien_tap = '';
        if (ds_bai_da_chon.length > 0) {
            let danh_sach_li = '';
            ds_bai_da_chon.forEach(id_bai => {
                const bai = danh_sach_workouts.find(w => w.id == id_bai);
                if(bai) {
                    const is_checked = ds_bai_hoan_thanh.includes(id_bai) ? 'checked' : '';
                    const kieu_chu = ds_bai_hoan_thanh.includes(id_bai) ? 'text-decoration-line-through text-secondary' : 'text-white';
                    
                    danh_sach_li += `
                        <li class="list-group-item bg-dark border-secondary d-flex justify-content-between align-items-center py-3">
                            <div class="${kieu_chu} transition-all" id="thong_tin_bai_${id_bai}">
                                <h6 class="mb-1 text-success fw-bold fs-5">${bai.name}</h6>
                                <small class="text-info"><i class="fa-regular fa-clock"></i> ${bai.duration} phút &nbsp;|&nbsp; <i class="fa-solid fa-fire text-warning"></i> ${bai.calories} calo</small>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input border-success shadow-sm" type="checkbox" style="transform: scale(1.6); cursor: pointer;" ${is_checked} onchange="danh_dau_hoan_thanh('${id_bai}', this)">
                            </div>
                        </li>
                    `;
                }
            });
            
            const phan_tram_ban_dau = Math.round((ds_bai_hoan_thanh.length / ds_bai_da_chon.length) * 100) || 0;
            
            html_phien_tap = `
                <div class="card bg-dark border-warning mb-5 shadow-lg">
                    <div class="card-header bg-warning text-dark fw-bold d-flex justify-content-between align-items-center py-3">
                        <span class="fs-5"><i class="fa-solid fa-person-running"></i> Phiên tập đang diễn ra</span>
                        <span class="badge bg-danger fs-6" id="badge_phan_tram">${phan_tram_ban_dau}% Hoàn thành</span>
                    </div>
                    <div class="progress bg-secondary rounded-0" style="height: 6px;">
                        <div id="thanh_tien_do" class="progress-bar bg-success progress-bar-striped progress-bar-animated" style="width: ${phan_tram_ban_dau}%; transition: width 0.5s ease;"></div>
                    </div>
                    <ul class="list-group list-group-flush">
                        ${danh_sach_li}
                    </ul>
                    <div class="card-footer bg-dark border-top border-secondary text-end p-3">
                        <button onclick="bo_chon_tat_ca(); navigate_to('workout');" class="btn btn-outline-danger me-2 fw-medium"><i class="fa-solid fa-trash-can"></i> Hủy phiên tập</button>
                        <button onclick="ket_thuc_phien_tap()" class="btn btn-success fw-bold px-4"><i class="fa-solid fa-check"></i> Hoàn thành</button>
                    </div>
                </div>
            `;
        }

        let html_danh_sach_lich_su = '';
        if (danh_sach_lich_su.length > 0) {
            danh_sach_lich_su.slice().reverse().forEach(ls => {
                html_danh_sach_lich_su += `
                    <li class="list-group-item bg-dark border-secondary text-white py-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1 text-success fw-bold">${format_date(ls.date)}</h6>
                                <small class="text-secondary">${ls.name}</small>
                            </div>
                            <div class="text-end">
                                <span class="badge bg-warning text-dark mb-1"><i class="fa-regular fa-clock"></i> ${ls.duration} phút</span><br>
                                <span class="badge bg-danger"><i class="fa-solid fa-fire"></i> ${ls.calories} calo</span>
                            </div>
                        </div>
                    </li>
                `;
            });
        } else {
            html_danh_sach_lich_su = '<li class="list-group-item bg-dark border-secondary text-muted text-center py-4">Chưa có dữ liệu lịch sử. Hãy hoàn thành phiên tập đầu tiên nhé!</li>';
        }

        content_area.innerHTML = `
            <div class="container py-5">
                <h2 class="fw-bold mb-4 text-success border-bottom border-secondary pb-2"><i class="fa-solid fa-chart-line"></i> Tiến độ của bạn</h2>
                
                ${html_phien_tap}

                <div id="statsRow" class="row mb-5 mt-4"></div>
                
                <h4 class="mb-3 text-white"><i class="fa-solid fa-chart-bar text-warning"></i> Biểu đồ các lượt tập gần nhất</h4>
                <div class="card bg-dark border-secondary p-4 shadow-lg rounded-4 mb-5">
                    <div id="chartContainer"></div>
                    <div id="chi_tiet_luot_tap"></div>
                </div>

                <h4 class="mb-3 text-white"><i class="fa-solid fa-clock-rotate-left text-info"></i> Lịch sử tập luyện chi tiết</h4>
                <ul class="list-group list-group-flush shadow-sm border border-secondary rounded-3 mb-5">
                    ${html_danh_sach_lich_su}
                </ul>
            </div>
        `;
        
        render_stats();
        render_progress_chart();
    }
    else {
        trang_chu_el.classList.add('d-none');
        content_area.innerHTML = `
            <div class="container py-5 text-center mt-5">
                <i class="fa-solid fa-person-digging text-warning" style="font-size: 80px;"></i>
                <h2 class="text-secondary mt-4">Tính năng đang được phát triển...</h2>
            </div>
        `;
    }
}

function gan_su_kien_loc() {
    const search_input = document.getElementById('searchInput');
    if(search_input) {
        search_input.addEventListener('input', (e) => {
            const tu_khoa = e.target.value.toLowerCase();
            const mang_loc = danh_sach_workouts.filter(w => 
                w.name.toLowerCase().includes(tu_khoa)
            );
            render_workouts(mang_loc);
        });
    }

    const filter_input = document.getElementById('categoryFilter');
    if(filter_input) {
        filter_input.addEventListener('change', (e) => {
            const loai_bai = e.target.value;
            const mang_loc = loai_bai ? danh_sach_workouts.filter(w => w.exerciseType === loai_bai) : danh_sach_workouts;
            render_workouts(mang_loc);
        });
    }
}

const btn_xac_nhan = document.getElementById('btn_xac_nhan');
if (btn_xac_nhan) {
    btn_xac_nhan.addEventListener('click', function() {
        const ten_dang_nhap = document.getElementById('ten_dang_nhap').value.trim();
        const mat_khau = document.getElementById('mat_khau').value.trim();

        if (ten_dang_nhap === '' || mat_khau === '') {
            show_toast('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu!', 'danger');
            return;
        }

        // Lưu trạng thái đăng nhập vào bộ nhớ phiên
        sessionStorage.setItem('fittrack_da_dang_nhap', 'true');
        kiem_tra_dang_nhap(); // Ẩn hiện thanh Navbar
        
        show_toast(`Chào mừng ${ten_dang_nhap} đã đăng nhập thành công!`, 'success');
        
        document.getElementById('ten_dang_nhap').value = '';
        document.getElementById('mat_khau').value = '';
    });
}

function hien_thi_ho_so() {
    show_toast('Đang mở hồ sơ cá nhân...', 'primary');
}

function dang_xuat() {
    // Xóa bộ nhớ phiên
    sessionStorage.removeItem('fittrack_da_dang_nhap');
    kiem_tra_dang_nhap();
    
    navigate_to('home'); // Tự đá về trang chủ
    bo_chon_tat_ca(); 
    show_toast('Đã đăng xuất tài khoản an toàn.', 'warning');
}

window.onload = load_workouts;