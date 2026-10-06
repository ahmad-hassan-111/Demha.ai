const SUPABASE_URL = 'https://lwcgaiemjmgbknocuuwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FCK9K17VSybey1cH0getCg_rx5Cw5uK';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUserEmail = '';
let currentUserId = '';

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

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    currentUserEmail = session.user.email;
    currentUserId = session.user.id;
    document.getElementById('userEmailDisplay').textContent = currentUserEmail;

    let { data, error } = await supabaseClient
        .from('businesses')
        .select('*')
        .eq('id', currentUserId)
        .single();

    if (!data) {
        const { data: fallbackData } = await supabaseClient
            .from('businesses')
            .select('*')
            .eq('email', currentUserEmail)
            .single();
        data = fallbackData;
    }

    if (data) {
        document.getElementById('businessName').value = data.business_name || '';
        document.getElementById('googleLink').value = data.google_link || '';
    }

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

function openRequestModal() {
    document.getElementById('newBusinessName').value = document.getElementById('businessName').value;
    document.getElementById('newGoogleLink').value = document.getElementById('googleLink').value;
    document.getElementById('requestModal').classList.add('active');
}

function closeRequestModal() {
    document.getElementById('requestModal').classList.remove('active');
}

function submitChangeRequest() {
    const newName = document.getElementById('newBusinessName').value.trim();
    const newLink = document.getElementById('newGoogleLink').value.trim();

    if (!newName || !newLink) {
        showCustomAlert('Please fill out both fields.', 'Validation Error');
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

async function sendReviewRequest() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const businessName = document.getElementById('businessName').value.trim();

    if (!customerName || !customerEmail || !businessName) {
        showCustomAlert('Please fill out your customer details first.', 'Validation Error');
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

        showCustomAlert('Review request sent successfully!', 'Success!');
        document.getElementById('customerName').value = '';
        document.getElementById('customerEmail').value = '';
    } catch (err) {
        console.error(err);
        try {
            const WEBHOOK_URL = 'https://hook.us2.make.com/v7aeqer50ceahfe5gif6vnd5uaqs3vy4';
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            });
            showCustomAlert('Review request sent successfully!', 'Success!');
            document.getElementById('customerName').value = '';
            document.getElementById('customerEmail').value = '';
        } catch (e) {
            showCustomAlert('Failed to send review request. Please check connection.', 'Error');
        }
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
}
