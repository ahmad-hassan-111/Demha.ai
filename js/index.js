// Supabase Connection Credentials
const SUPABASE_URL = 'https://lwcgaiemjmgbknocuuwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FCK9K17VSybey1cH0getCg_rx5Cw5uK';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// FAQ Accordion Toggle Logic
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.parentElement;
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
        if (!isActive) item.classList.add('active');
    });
});

// Password Hide/Unhide Toggle Function
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('reqPassword');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.textContent = '👁️';
    } else {
        passwordInput.type = 'password';
        eyeIcon.textContent = '👁️‍🗨️';
    }
}

// Automated Instant Self-Signup Handler
async function submitAccountRequest(event) {
    event.preventDefault();
    
    const name = document.getElementById('reqName').value.trim();
    const email = document.getElementById('reqEmail').value.trim();
    const business_name = document.getElementById('reqBusiness').value.trim();
    const google_profile = document.getElementById('reqProfile').value.trim();
    const password = document.getElementById('reqPassword').value.trim();

    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }

    // 1. Create account in Supabase Auth
    const { data: authData, error: authError } = await _supabase.auth.signUp({
        email: email,
        password: password
    });

    if (authError) {
        alert('Account creation failed: ' + authError.message);
        return;
    }

    const userId = authData.user ? authData.user.id : null;

    // 2. Insert business settings using ONLY the 'id' column
    const { error: dbError } = await _supabase
        .from('businesses')
        .insert({
            id: userId,
            business_name: business_name,
            email: email,
            google_link: google_profile
        });

    if (dbError) {
        console.error('Database error:', dbError);
        alert('Failed to save business details: ' + dbError.message);
        return;
    }

    alert('Account created successfully! Redirecting to your dashboard...');

    // Clear all form input boxes after successful account creation
    document.getElementById('reqName').value = '';
    document.getElementById('reqEmail').value = '';
    document.getElementById('reqBusiness').value = '';
    document.getElementById('reqProfile').value = '';
    document.getElementById('reqPassword').value = '';

    window.location.href = 'dashboard.html';
}
