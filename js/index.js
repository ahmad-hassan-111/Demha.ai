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

// Account Request Form Submission (Sends to ahmadhassannazeer111@gmail.com)
function submitAccountRequest(event) {
    event.preventDefault();
    
    const name = document.getElementById('reqName').value.trim();
    const email = document.getElementById('reqEmail').value.trim();
    const business_name = document.getElementById('reqBusiness').value.trim();
    const google_profile = document.getElementById('reqProfile').value.trim();

    const adminEmail = 'ahmadhassannazeer111@gmail.com'; 
    const subject = `New Account Request: ${business_name}`;
    const body = 
        `Hello Admin,\n\nI would like to request a new Demha.ai account with the following details:\n\n` +
        `Owner Name: ${name}\n` +
        `Business Email: ${email}\n` +
        `Business Name: ${business_name}\n` +
        `Google Profile Link: ${google_profile}\n\n` +
        `Please provision my account and email me the credentials.`;

    const mailtoLink = `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const gmailWebLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(adminEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        window.location.href = mailtoLink;
    } else {
        window.open(gmailWebLink, '_blank');
    }
}