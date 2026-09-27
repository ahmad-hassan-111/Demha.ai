const SUPABASE_URL = 'https://lwcgaiemjmgbknocuuwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FCK9K17VSybey1cH0getCg_rx5Cw5uK';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUserEmail = '';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Session Check
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    currentUserEmail = session.user.email;
    document.getElementById('userEmailDisplay').textContent = currentUserEmail;

    // 2. Load and pre-fill existing business settings
    const { data, error } = await supabaseClient
        .from('businesses')
        .select('*')
        .eq('email', currentUserEmail)
        .single();

    if (data) {
        document.getElementById('businessName').value = data.business_name || '';
        document.getElementById('googleLink').value = data.google_link || '';
    }

    // 3. Load incoming private feedback for this business
    const { data: feedbackData, error: feedbackError } = await supabaseClient
        .from('feedback')
        .select('*')
        .eq('business_email', currentUserEmail)
        .order('created_at', { ascending: false });

    const feedbackContainer = document.getElementById('feedbackList');
    if (feedbackData && feedbackData.length > 0) {
        feedbackContainer.innerHTML = '';
        feedbackData.forEach(item => {
            const box = document.createElement('div');
            box.className = 'feedback-item';
            box.innerHTML = `
                <div class="feedback-header">
                    <span class="customer-name">👤 ${item.customer_name || 'Customer'}</span>
                    <span class="stars">⭐ ${item.rating} / 5</span>
                </div>
                <p class="feedback-body">"${item.feedback_text}"</p>
                <div class="feedback-footer">
                    <span class="date">${new Date(item.created_at).toLocaleString()}</span>
                </div>
            `;
            feedbackContainer.appendChild(box);
        });
    } else {
        feedbackContainer.innerHTML = '<p class="empty-text">No negative feedback received yet. Great job!</p>';
    }
});

// Modal Controls
function openRequestModal() {
    document.getElementById('newBusinessName').value = document.getElementById('businessName').value;
    document.getElementById('newGoogleLink').value = document.getElementById('googleLink').value;
    document.getElementById('requestModal').classList.add('active');
}

function closeRequestModal() {
    document.getElementById('requestModal').classList.remove('active');
}

// 4. Settings Change Request via Mailto/Gmail Web (Sends to ahmadhassannazeer111@gmail.com)
function submitChangeRequest() {
    const newName = document.getElementById('newBusinessName').value.trim();
    const newLink = document.getElementById('newGoogleLink').value.trim();

    if (!newName || !newLink) {
        alert('Please fill out both fields.');
        return;
    } 

    const adminEmail = 'ahmadhassannazeer111@gmail.com'; 
    const subject = `Setting Change Request: ${newName}`;
    const body = 
        `Hello Admin,\n\nI would like to update my business details on Demha.ai:\n\n` +
        `Client Email: ${currentUserEmail}\n` +
        `New Business Name: ${newName}\n` +
        `New Google Review Link: ${newLink}\n\n` +
        `Please update this in the system.`;

    const mailtoLink = `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const gmailWebLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(adminEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        window.location.href = mailtoLink;
    } else {
        window.open(gmailWebLink, '_blank');
    }

    closeRequestModal();
}

// 5. Send Review Request to Customer via Webhook
async function sendReviewRequest() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const businessName = document.getElementById('businessName').value.trim();

    if (!customerName || !customerEmail || !businessName) {
        alert('Please fill out your customer details first.');
        return;
    }

    const reviewLink = `${window.location.origin}/review.html?email=${encodeURIComponent(currentUserEmail)}`;

    const formData = new URLSearchParams();
    formData.append('customer_name', customerName);
    formData.append('customer_email', customerEmail);
    formData.append('business_name', businessName);
    formData.append('review_link', reviewLink);

    try {
        const WEBHOOK_URL = 'https://hook.us2.make.com/v7aeqer50ceahfe5gif6vnd5uaqs3vy4';
        
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });

        alert('Review request sent successfully!');
        document.getElementById('customerName').value = '';
        document.getElementById('customerEmail').value = '';
    } catch (err) {
        console.error(err);
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            });
            alert('Review request sent successfully!');
            document.getElementById('customerName').value = '';
            document.getElementById('customerEmail').value = '';
        } catch (e) {
            alert('Failed to send review request. Please check connection.');
        }
    }
}

// 6. Logout Function
async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
}