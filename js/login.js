const SUPABASE_URL = 'https://lwcgaiemjmgbknocuuwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FCK9K17VSybey1cH0getCg_rx5Cw5uK';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Universal Golden & White Modal Injector & Trigger
let modalCallback = null;
function showCustomAlert(message, title = 'Demha.ai', callback = null) {
    let modal = document.getElementById('customModal');
    if (!modal) {
        const modalHTML = `
        <div id="customModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.4); z-index: 9999; justify-content: center; align-items: center;">
            <div style="background: linear-gradient(135deg, #fffdf9 0%, #fdf8eb 100%); border: 1.5px solid #d4af37; border-radius: 16px; padding: 30px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 15px 35px rgba(212, 175, 55, 0.25); font-family: sans-serif;">
                <h3 id="modalTitle" style="color: #1a1a1a; font-size: 20px; font-weight: 800; margin-bottom: 10px;">Demha.ai</h3>
                <p id="modalMessage" style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 25px;"></p>
                <button id="modalBtn" onclick="closeCustomModal()" style="background: linear-gradient(135deg, #d4af37 0%, #b89123 100%); color: #fff; border: none; padding: 12px 30px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);">OK</button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('customModal');
    }
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    modal.style.display = 'flex';
    modalCallback = callback;
}

window.closeCustomModal = function() {
    const modal = document.getElementById('customModal');
    if (modal) modal.style.display = 'none';
    if (modalCallback) {
        modalCallback();
        modalCallback = null;
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        showCustomAlert('Login failed: ' + error.message, 'Login Error');
    } else {
        window.location.href = 'dashboard.html';
    }
});
