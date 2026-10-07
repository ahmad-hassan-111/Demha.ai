const SUPABASE_URL = 'https://lwcgaiemjmgbknocuuwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FCK9K17VSybey1cH0getCg_rx5Cw5uK';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentSelectedRating = 0;
let businessGoogleLink = '';
let customerNameFromUrl = '';
let customerEmailFromUrl = '';

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
    const urlParams = new URLSearchParams(window.location.search);
    const businessEmail = urlParams.get('email');
    customerNameFromUrl = urlParams.get('name') || '';
    customerEmailFromUrl = urlParams.get('customer_email') || '';

    if (!businessEmail) {
        document.getElementById('businessTitle').textContent = "Invalid Review Link";
        document.getElementById('businessSubtitle').textContent = "No business email was provided in the link.";
        document.getElementById('starContainer').style.display = 'none';
        return;
    }

    const { data, error } = await supabaseClient
        .from('businesses')
        .select('*')
        .eq('email', businessEmail)
        .single();

    if (error || !data) {
        console.error('Error fetching business:', error);
        document.getElementById('businessTitle').textContent = "Business Not Found";
        document.getElementById('businessSubtitle').textContent = "This review link is invalid or expired.";
        document.getElementById('starContainer').style.display = 'none';
        return;
    }

    businessGoogleLink = data.google_link;
    if (data.business_name) {
        document.getElementById('businessTitle').textContent = `Review ${data.business_name}`;
        document.getElementById('businessSubtitle').textContent = `How was your experience with ${data.business_name} today?`;
    }

    if (businessGoogleLink) {
        document.getElementById('googleProfileFallbackLink').href = businessGoogleLink;
    }
});

async function handleRating(stars) {
    currentSelectedRating = stars;

    if (stars >= 4) {
        if (businessGoogleLink) {
            window.location.href = businessGoogleLink;
        } else {
            showCustomAlert('Google Review link is not configured for this business yet.', 'Configuration Notice');
        }
    } else {
        document.getElementById('starContainer').classList.add('hidden');
        document.getElementById('businessTitle').textContent = "We Value Your Feedback";
        document.getElementById('businessSubtitle').textContent = "Help us resolve any issues privately.";
        document.getElementById('feedbackFormContainer').classList.remove('hidden');
    }
}

async function submitPrivateFeedback() {
    const feedbackText = document.getElementById('privateFeedback').value.trim();
    
    if (!feedbackText) {
        showCustomAlert('Please type a quick note before submitting.', 'Validation Error');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const businessEmail = urlParams.get('email');

    const { error } = await supabaseClient
        .from('feedback')
        .insert({
            business_email: businessEmail,
            rating: currentSelectedRating,
            feedback_text: feedbackText,
            customer_name: customerNameFromUrl || 'Anonymous Customer',
            customer_email: customerEmailFromUrl || 'No email provided'
        });

    if (error) {
        console.error('Error saving feedback:', error);
        showCustomAlert('Failed to send feedback. Please try again.', 'Error');
        return;
    }

    document.getElementById('feedbackFormContainer').classList.add('hidden');
    document.getElementById('thankYouMessage').classList.remove('hidden');
}
