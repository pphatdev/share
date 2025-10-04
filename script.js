// DOM Elements
const linkInput = document.getElementById('linkInput');
const shareBtn = document.getElementById('shareBtn');
const linkDisplay = document.getElementById('linkDisplay');
const generatedLink = document.getElementById('generatedLink');
const copyBtn = document.getElementById('copyBtn');
const successMessage = document.getElementById('successMessage');
const linksList = document.getElementById('linksList');

// Storage key for localStorage
const STORAGE_KEY = 'sharedLinks';

// Initialize the app
function init() {
    loadLinks();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    shareBtn.addEventListener('click', shareLink);
    copyBtn.addEventListener('click', copyToClipboard);
    linkInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            shareLink();
        }
    });
}

// Validate URL
function isValidUrl(string) {
    try {
        // Try to create a URL object
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        // If no protocol, try adding https://
        try {
            const url = new URL('https://' + string);
            return true;
        } catch (_) {
            return false;
        }
    }
}

// Format URL to ensure it has a protocol
function formatUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
}

// Share link function
function shareLink() {
    const url = linkInput.value.trim();
    
    if (!url) {
        alert('Please enter a link');
        return;
    }

    if (!isValidUrl(url)) {
        alert('Please enter a valid URL');
        return;
    }

    const formattedUrl = formatUrl(url);
    
    // Display the generated link
    generatedLink.value = formattedUrl;
    linkDisplay.classList.remove('hidden');
    
    // Save to storage
    saveLink(formattedUrl);
    
    // Clear input
    linkInput.value = '';
    
    // Hide success message if it was visible
    successMessage.classList.add('hidden');
}

// Copy to clipboard
async function copyToClipboard() {
    const link = generatedLink.value;
    
    try {
        await navigator.clipboard.writeText(link);
        
        // Show success message
        successMessage.classList.remove('hidden');
        
        // Change button text temporarily
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        
        setTimeout(() => {
            successMessage.classList.add('hidden');
            copyBtn.textContent = originalText;
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        generatedLink.select();
        document.execCommand('copy');
        
        successMessage.classList.remove('hidden');
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 2000);
    }
}

// Save link to localStorage
function saveLink(url) {
    const links = getLinks();
    
    // Check if link already exists
    if (!links.includes(url)) {
        links.unshift(url); // Add to beginning
        
        // Keep only last 10 links
        if (links.length > 10) {
            links.pop();
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
        displayLinks();
    }
}

// Get links from localStorage
function getLinks() {
    const links = localStorage.getItem(STORAGE_KEY);
    return links ? JSON.parse(links) : [];
}

// Display links
function displayLinks() {
    const links = getLinks();
    
    if (links.length === 0) {
        linksList.innerHTML = '<li class="empty-state">No links shared yet</li>';
        return;
    }
    
    linksList.innerHTML = links.map((url, index) => `
        <li>
            <div class="link-item">
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="link-url">
                    ${url}
                </a>
                <button class="delete-btn" onclick="deleteLink(${index})">Delete</button>
            </div>
        </li>
    `).join('');
}

// Delete link
function deleteLink(index) {
    const links = getLinks();
    links.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    displayLinks();
}

// Load links on page load
function loadLinks() {
    displayLinks();
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
