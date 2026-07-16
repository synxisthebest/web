// Cấu hình tài khoản mặc định và bộ lưu trữ
let currentUser = null;
let currentBetType = null; // 'tai' hoặc 'xiu'
let currentBetAmount = 0;
let isRolling = false;
let isCupClosed = true;

// Mock Dữ liệu Cầu
let matchHistory = [
    { dice: [4, 5, 6], total: 15, result: 'tai' },
    { dice: [1, 2, 3], total: 6, result: 'xiu' },
    { dice: [5, 5, 2], total: 12, result: 'tai' },
    { dice: [3, 2, 1], total: 6, result: 'xiu' },
    { dice: [6, 4, 3], total: 13, result: 'tai' },
    { dice: [2, 2, 4], total: 8, result: 'xiu' }
];

// DOM Elements
const loggedInPanel = document.getElementById('logged-in-panel');
const loggedOutPanel = document.getElementById('logged-out-panel');
const userDisplayName = document.getElementById('user-display-name');
const balanceEl = document.getElementById('balance');
const gameStatus = document.getElementById('game-status');
const resultBanner = document.getElementById('result-banner');

// Xúc sắc
const diceCup = document.getElementById('dice-cup');
const dice1 = document.getElementById('dice-1');
const dice2 = document.getElementById('dice-2');
const dice3 = document.getElementById('dice-3');

// Bảng cược
const optionTai = document.getElementById('option-tai');
const optionXiu = document.getElementById('option-xiu');
const indicatorTai = document.getElementById('indicator-tai');
const indicatorXiu = document.getElementById('indicator-xiu');
const betsCountTai = document.getElementById('bets-count-tai');
const betsTotalTai = document.getElementById('bets-total-tai');
const betsCountXiu = document.getElementById('bets-count-xiu');
const betsTotalXiu = document.getElementById('bets-total-xiu');

// Control inputs
const customBetAmountInput = document.getElementById('custom-bet-amount');
const chips = document.querySelectorAll('.chip');
const btnClearBet = document.getElementById('btn-clear-bet');
const btnRoll = document.getElementById('btn-roll');

// Modals
const modalRegister = document.getElementById('modal-register');
const modalLogin = document.getElementById('modal-login');
const modalDeposit = document.getElementById('modal-deposit');

// Trigger Modals
const btnOpenLogin = document.getElementById('btn-open-login');
const btnOpenRegister = document.getElementById('btn-open-register');
const btnOpenDeposit = document.getElementById('btn-open-deposit');
const btnLogout = document.getElementById('btn-logout');

const formRegister = document.getElementById('form-register');
const formLogin = document.getElementById('form-login');
const btnSubmitDeposit = document.getElementById('btn-submit-deposit');
const depositAmountSelect = document.getElementById('deposit-amount-select');

// Links inside footer modal
document.getElementById('link-to-login').onclick = () => {
    closeAllModals();
    openModal(modalLogin);
};
document.getElementById('link-to-register').onclick = () => {
    closeAllModals();
    openModal(modalRegister);
};

// Khởi tạo app
document.addEventListener('DOMContentLoaded', () => {
    checkLoggedInUser();
    updateUIForBets();
    renderRoadmap();
    renderHistoryLogs();
    setupEventListeners();
});

// Kiểm tra user đã lưu trong LocalStorage chưa
function checkLoggedInUser() {
    const savedUser = localStorage.getItem('royal_tai_xiu_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showUserLoggedIn();
    } else {
        showUserLoggedOut();
    }
}

function showUserLoggedIn() {
    loggedOutPanel.style.display = 'none';
    loggedInPanel.style.display = 'flex';
    userDisplayName.textContent = currentUser.username;
    balanceEl.textContent = formatMoney(currentUser.balance);
}

function showUserLoggedOut() {
    loggedInPanel.style.display = 'none';
    loggedOutPanel.style.display = 'flex';
    currentUser = null;
    currentBetType = null;
    currentBetAmount = 0;
    updateUIForBets();
}

// Định dạng tiền
function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount);
}

// Toast Thông báo
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : '❌'}</span>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Quản lý Modal
function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(closeModal);
}

function setupEventListeners() {
    // Modals
    btnOpenLogin.onclick = () => openModal(modalLogin);
    btnOpenRegister.onclick = () => openModal(modalRegister);
    
    if (btnOpenDeposit) {
        btnOpenDeposit.onclick = () => {
            if (!currentUser) {
                showToast("Vui lòng đăng nhập trước khi nạp tiền!", "error");
                openModal(modalLogin);
                return;
            }
            openModal(modalDeposit);
        };
    }

    btnLogout.onclick = () => {
        localStorage.removeItem('royal_tai_xiu_user');
        showToast("Đăng xuất thành công!");
        showUserLoggedOut();
    };

    // Nút close modal
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.onclick = () => closeAllModals();
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.onclick = (e) => {
            if (e.target === overlay) closeAllModals();
        };
    });

    // Form Đăng ký
    formRegister.onsubmit = (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value.trim();

        if (username.length < 3) {
            showToast("Tên đăng nhập phải có ít nhất 3 ký tự!", "error");
            return;
        }

        // Lưu vào localStorage
        const users = JSON.parse(localStorage.getItem('royal_users') || '[]');
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            showToast("Tên tài khoản này đã tồn tại!", "error");
            return;
        }

        const newUser = { username, password, balance: 100000 }; // Tặng 100k trải nghiệm
        users.push(newUser);
        localStorage.setItem('royal_users', JSON.stringify(users));

        // Tự động đăng nhập
        localStorage.setItem('royal_tai_xiu_user', JSON.stringify(newUser));
        currentUser = newUser;
        showToast("Đăng ký thành công! Bạn nhận được 100.000đ trải nghiệm!");
        showUserLoggedIn();
        closeAllModals();
    };

    // Form Đăng nhập
    formLogin.onsubmit = (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        const users = JSON.parse(localStorage.getItem('royal_users') || '[]');
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

        if (!user) {
            showToast("Tài khoản hoặc mật khẩu không chính xác!", "error");
            return;
        }

        localStorage.setItem('royal_tai_xiu_user', JSON.stringify(user));
        currentUser = user;
        showToast("Đăng nhập thành công!");
        showUserLoggedIn();
        closeAllModals();
    };

    // Form Nạp tiền
    btnSubmitDeposit.onclick = () => {
        if (!currentUser) return;
        const amount = parseInt(depositAmountSelect.value);
        
        currentUser.balance += amount;
        
        // Cập nhật người dùng hiện tại
        localStorage.setItem('royal_tai_xiu_user', JSON.stringify(currentUser));
        
        // Cập nhật mảng tất cả người dùng
        const users = JSON.parse(localStorage.getItem('royal_users') || '[]');
        const idx = users.findIndex(u => u.username === currentUser.username);
        if (idx !== -1) {
            users[idx].balance = currentUser.balance;
            localStorage.setItem('royal_users', JSON.stringify(users));
        }

        balanceEl.textContent = formatMoney(currentUser.balance);
        showToast(`Nạp tiền thành công! Đã cộng +${formatMoney(amount)}đ`);
        closeAllModals();
    };

    // Chọn lựa cược Tài hoặc Xỉu
    optionTai.onclick = () => selectBetOption('tai');
    optionXiu.onclick = () => selectBetOption('xiu');

    // Chips nhanh
    chips.forEach(chip => {
        chip.onclick = () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const amt = parseInt(chip.getAttribute('data-amount'));
            customBetAmountInput.value = amt;
            if (currentBetType) {
                placeBet(currentBetType, amt);
            }
        };
    });

    customBetAmountInput.oninput = () => {
        const amt = parseInt(customBetAmountInput.value) || 0;
        if (currentBetType && amt > 0) {
            placeBet(currentBetType, amt);
        }
    };

    // Hủy cược
    btnClearBet.onclick = () => {
        if (!currentUser) return;
        if (isRolling) {
            showToast("Không thể hủy cược khi đang lắc!", "error");
            return;
        }
        if (currentBetAmount > 0) {
            currentUser.balance += currentBetAmount;
            saveUserBalance();
            currentBetAmount = 0;
            currentBetType = null;
            updateUIForBets();
            showToast("Đã hủy cược thành công!");
        }
    };

    // Xóc đĩa / Chơi
    btnRoll.onclick = () => rollGame();
    
    // Nhấp vào bát trực tiếp để lắc
    diceCup.onclick = () => {
        if (!isRolling) {
            rollGame();
        }
    };
}

function selectBetOption(type) {
    if (!currentUser) {
        showToast("Vui lòng đăng nhập để đặt cược!", "error");
        openModal(modalLogin);
        return;
    }

    if (isRolling) {
        showToast("Đang lắc bát, không thể đặt cược!", "error");
        return;
    }

    const amt = parseInt(customBetAmountInput.value) || 0;
    if (amt <= 0) {
        showToast("Số tiền đặt cược không hợp lệ!", "error");
        return;
    }

    placeBet(type, amt);
}

function placeBet(type, amount) {
    // Trả lại số tiền đã cược trước đó (nếu đổi lựa chọn cược hoặc đổi số lượng)
    if (currentBetAmount > 0) {
        currentUser.balance += currentBetAmount;
    }

    if (currentUser.balance < amount) {
        showToast("Số dư tài khoản không đủ!", "error");
        // Hồi lại mức cược cũ nếu có
        if (currentBetAmount > 0) {
            currentUser.balance -= currentBetAmount;
        }
        return;
    }

    // Trừ số dư
    currentUser.balance -= amount;
    currentBetType = type;
    currentBetAmount = amount;
    
    saveUserBalance();
    updateUIForBets();
    showToast(`Đã cược thành công ${formatMoney(amount)}đ vào cửa ${type.toUpperCase()}`);
}

function saveUserBalance() {
    if (!currentUser) return;
    localStorage.setItem('royal_tai_xiu_user', JSON.stringify(currentUser));
    balanceEl.textContent = formatMoney(currentUser.balance);

    const users = JSON.parse(localStorage.getItem('royal_users') || '[]');
    const idx = users.findIndex(u => u.username === currentUser.username);
    if (idx !== -1) {
        users[idx].balance = currentUser.balance;
        localStorage.setItem('royal_users', JSON.stringify(users));
    }
}

function updateUIForBets() {
    // Xóa class active
    optionTai.classList.remove('selected-tai', 'active-bet');
    optionXiu.classList.remove('selected-xiu', 'active-bet');
    indicatorTai.style.opacity = '0';
    indicatorXiu.style.opacity = '0';

    if (currentBetAmount > 0) {
        if (currentBetType === 'tai') {
            optionTai.classList.add('selected-tai', 'active-bet');
            indicatorTai.textContent = `Đã cược: ${formatMoney(currentBetAmount)}đ`;
            indicatorTai.style.opacity = '1';
        } else if (currentBetType === 'xiu') {
            optionXiu.classList.add('selected-xiu', 'active-bet');
            indicatorXiu.textContent = `Đã cược: ${formatMoney(currentBetAmount)}đ`;
            indicatorXiu.style.opacity = '1';
        }
    }
}

// Bắt đầu quay / xóc đĩa
function rollGame() {
    if (isRolling) return;
    isRolling = true;
    
    // Đóng bát nếu đang mở
    diceCup.classList.remove('open');
    resultBanner.className = 'game-result-banner';
    
    // Tạo ngẫu nhiên lượng cược cho hệ thống thêm sinh động
    simulateSystemBets();

    gameStatus.textContent = "Hệ thống đang xóc bát...";
    
    // Animation Lắc bát
    diceCup.classList.add('shaking');
    
    // Tạo animation xoay xúc xắc ảo dưới bát
    dice1.classList.add('rolling');
    dice2.classList.add('rolling');
    dice3.classList.add('rolling');

    setTimeout(() => {
        // Dừng lắc bát
        diceCup.classList.remove('shaking');
        
        // Dừng xoay xúc xắc
        dice1.classList.remove('rolling');
        dice2.classList.remove('rolling');
        dice3.classList.remove('rolling');

        // Tạo kết quả ngẫu nhiên thật
        const r1 = Math.floor(Math.random() * 6) + 1;
        const r2 = Math.floor(Math.random() * 6) + 1;
        const r3 = Math.floor(Math.random() * 6) + 1;

        // Cập nhật các mặt xúc xắc
        dice1.setAttribute('data-value', r1);
        dice2.setAttribute('data-value', r2);
        dice3.setAttribute('data-value', r3);

        const total = r1 + r2 + r3;
        const result = total >= 11 ? 'tai' : 'xiu';

        // Mở bát hiển thị xúc xắc
        diceCup.classList.add('open');

        // Xử lý thắng thua cược
        processGameResult(r1, r2, r3, total, result);
        
    }, 2000);
}

function processGameResult(r1, r2, r3, total, result) {
    gameStatus.textContent = `Tổng điểm: ${total} (${r1} + ${r2} + ${r3})`;
    
    // Hiện banner kết quả
    resultBanner.textContent = `${result.toUpperCase()} - ${total}`;
    resultBanner.classList.add(result);

    // Tính toán tiền thắng thua cho user
    if (currentBetAmount > 0) {
        if (currentBetType === result) {
            // Thắng: Hoàn trả gốc + Thắng x1 (nhận 2 lần tiền cược)
            const winAmount = currentBetAmount * 2;
            currentUser.balance += winAmount;
            saveUserBalance();
            showToast(`Xin chúc mừng! Bạn đã thắng +${formatMoney(currentBetAmount)}đ`, "success");
        } else {
            // Thua: Mất tiền cược (đã trừ từ trước)
            showToast(`Rất tiếc! Bạn đã thua -${formatMoney(currentBetAmount)}đ`, "error");
        }
        
        // Reset cược ván này
        currentBetAmount = 0;
        currentBetType = null;
        updateUIForBets();
    }

    // Thêm vào lịch sử cầu
    matchHistory.unshift({
        dice: [r1, r2, r3],
        total: total,
        result: result
    });

    // Giữ lịch sử cầu tối đa 20 ván để hiển thị đẹp
    if (matchHistory.length > 20) {
        matchHistory.pop();
    }

    renderRoadmap();
    renderHistoryLogs();
    
    isRolling = false;
}

// Mô phỏng số người và tổng tiền cược hệ thống ngẫu nhiên thay đổi
function simulateSystemBets() {
    const xiuCount = Math.floor(Math.random() * 80) + 80;
    const taiCount = Math.floor(Math.random() * 80) + 120;
    
    const xiuTotal = (Math.floor(Math.random() * 30) + 20) * 1000000;
    const taiTotal = (Math.floor(Math.random() * 40) + 30) * 1000000;

    betsCountXiu.textContent = formatMoney(xiuCount);
    betsTotalXiu.textContent = formatMoney(xiuTotal) + 'đ';
    
    betsCountTai.textContent = formatMoney(taiCount);
    betsTotalTai.textContent = formatMoney(taiTotal) + 'đ';
}

// Vẽ Roadmap cầu tròn Tài Xỉu
function renderRoadmap() {
    const roadmapGrid = document.getElementById('roadmap-grid');
    roadmapGrid.innerHTML = '';

    // Lấy 10 kết quả gần nhất, vẽ theo thứ tự ván cũ -> mới
    const recentTen = [...matchHistory].slice(0, 10).reverse();

    for (let i = 0; i < 10; i++) {
        const cell = document.createElement('div');
        cell.className = 'roadmap-cell';
        
        if (recentTen[i]) {
            const res = recentTen[i];
            cell.classList.add(res.result);
            cell.textContent = res.result === 'tai' ? 'T' : 'X';
            cell.title = `Tổng: ${res.total} (${res.dice.join(', ')})`;
        } else {
            cell.textContent = '-';
        }
        roadmapGrid.appendChild(cell);
    }
}

// Hiển thị danh sách lịch sử chi tiết ván trước
function renderHistoryLogs() {
    const logsContainer = document.getElementById('history-logs');
    logsContainer.innerHTML = '';

    matchHistory.forEach((match, index) => {
        const item = document.createElement('div');
        item.className = 'log-item';
        
        const diceString = match.dice.join(' • ');
        const timeOffset = index === 0 ? "Vừa xong" : `${index} phút trước`;
        
        item.innerHTML = `
            <div>
                <span class="log-result ${match.result}">${match.result.toUpperCase()}</span>
                <span style="margin-left: 10px; color:#fff; font-weight:600;">${match.total} điểm</span>
                <span class="log-detail" style="display:block; font-size:0.75rem;">(${diceString})</span>
            </div>
            <span class="log-detail">${timeOffset}</span>
        `;
        logsContainer.appendChild(item);
    });
}
