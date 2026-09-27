const SUPABASE_URL = 'https://lwcgaiemjmgbknocuuwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FCK9K17VSybey1cH0getCg_rx5Cw5uK';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentSelectedRating = 0;
let businessGoogleLink = '';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const businessEmail = urlParams.get('email');

    if (!businessEmail) return;

    const { data } = await supabaseClient
        .from('businesses')
        .select('*')
        .eq('email', businessEmail)
        .single();

    if (data) {
        businessGoogleLink = data.google_link;
        if (data.business_name) {
            document.getElementById('businessTitle').textContent = `Review ${data.business_name}`;
        }
    }
});

async function handleRating(stars) {
    currentSelectedRating = stars;

    if (stars >= 4) {
        if (businessGoogleLink) {
            window.location.href = businessGoogleLink;
        } else {
            alert('Google Review link is not configured for this business yet.');
        }
    } else {
        // Show private feedback form for 1-3 stars
        document.getElementById('starContainer').classList.add('hidden');
        document.getElementById('feedbackFormContainer').classList.remove('hidden');
    }
}

async function submitPrivateFeedback() {
    const customerName = document.getElementById('feedbackCustomerName').value.trim();
    const feedbackText = document.getElementById('privateFeedback').value.trim();
    
    if (!customerName) {
        alert('Please enter your name.');
        return;
    }
    if (!feedbackText) {
        alert('Please type a quick note before submitting.');
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
            customer_name: customerName
        });

    if (error) {
        console.error('Error saving feedback:', error);
        alert('Failed to send feedback. Please try again.');
        return;
    }

    document.getElementById('feedbackFormContainer').classList.add('hidden');
    document.getElementById('thankYouMessage').classList.remove('hidden');
}