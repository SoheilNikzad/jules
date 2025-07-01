// --- DOM Elements ---
const connectWalletBtn = document.getElementById('connectWalletBtn');
const userInfoDiv = document.getElementById('userInfo');
const userAddressSpan = document.getElementById('userAddress');
const networkNameSpan = document.getElementById('networkName');
const chainIdSpan = document.getElementById('chainId');
const contactListDiv = document.getElementById('contactList');
const chattingWithHeader = document.getElementById('chattingWith');
const messageListDiv = document.getElementById('messageList');
const recipientAddressInput = document.getElementById('recipientAddressInput');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const clearCacheBtn = document.getElementById('clearCacheBtn');
const qrCodeModal = document.getElementById('qrCodeModal');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const closeModalBtn = document.querySelector('.modal .close-button');


// --- Global State ---
let ethersProvider = null;
let ethersSigner = null;
let currentUserAddress = null;
let currentNetwork = null;
let currentChatAddress = null;
// let localEncryptionKey = null; // Key for encrypting/decrypting local cache, derived from signature - REMOVED, using webCryptoEncryptionKey

const DB_NAME = 'web3MessengerDB';
const CHATS_STORE_NAME = 'chats';
const MESSAGES_STORE_NAME_PREFIX = 'messages_'; // messages_0x123...
const META_STORE_NAME = 'metadata'; // For storing last sync block, etc. for each chat contact

// --- Initialize LocalForage ---
// For simplicity in this initial setup, we might use localForage for key-value storage.
// Later, we can structure it more like the folder structure described.
localforage.config({
    driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
    name: 'web3MessengerCache'
});

// --- DOM Elements ---
// ... (ensure all DOM elements are listed if new ones like a statusDisplay were added)
// const statusDisplay = document.getElementById('statusDisplay'); // Example if added in HTML

// --- Global State ---
// ...

// --- Utility function for status updates ---
function showStatusMessage(message, isError = false) {
    // For now, using a simple console log and alert for errors.
    // A dedicated status bar or notification area would be better in a full app.
    console.log(isError ? `ERROR: ${message}` : `STATUS: ${message}`);
    if (isError) {
        alert(message);
    }
    // Could also update a specific status element in the UI if we add one.
    // e.g., if (statusDisplay) statusDisplay.textContent = message;
}

// --- Event Listeners ---
connectWalletBtn.addEventListener('click', connectWallet);
sendMessageBtn.addEventListener('click', handleSendMessage);
contactListDiv.addEventListener('click', handleContactClick); // Event delegation
clearCacheBtn.addEventListener('click', clearLocalCache);

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        if (qrCodeModal) qrCodeModal.style.display = 'none';
    });
}
window.addEventListener('click', (event) => {
    if (event.target === qrCodeModal) {
        if (qrCodeModal) qrCodeModal.style.display = 'none';
    }
});


// --- Wallet Functions ---
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        const useQr = confirm('MetaMask is not installed. Would you like to see options for mobile wallet connection (QR code placeholder)?');
        if (useQr) {
            showQrCodeModal();
        } else {
            showStatusMessage('Please install MetaMask or use a Web3 browser.', true);
        }
        return;
    }

    connectWalletBtn.disabled = true;
    connectWalletBtn.textContent = 'Connecting...';
    showStatusMessage('Attempting to connect wallet...');

    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        ethersSigner = ethersProvider.getSigner();
        currentUserAddress = await ethersSigner.getAddress();
        currentNetwork = await ethersProvider.getNetwork();

        updateUserInfoUI();
        await deriveLocalEncryptionKey();

        connectWalletBtn.textContent = 'Wallet Connected';
        // clearCacheBtn.style.display = 'inline-block'; // Already shown in updateUserInfoUI if connected

        showStatusMessage(`Wallet connected: ${currentUserAddress.substring(0,6)}...`);

        showStatusMessage('Loading contacts from cache...');
        await loadContactsFromCache();

        if (currentUserAddress) {
            showStatusMessage('Scanning blockchain for messages (simulated)...');
            await scanForMessagesPlaceholder(currentUserAddress);
            showStatusMessage('Blockchain scan complete (simulated).');
        }
        clearCacheBtn.style.display = 'inline-block';


    } catch (error) {
        console.error('Error connecting wallet:', error);
        showStatusMessage(`Error connecting wallet: ${error.message || error}`, true);
        connectWalletBtn.textContent = 'Connect Wallet';
        connectWalletBtn.disabled = false;
        resetAppUI(); // Ensure UI is reset on failed connection
    }

    // Handle account and network changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        console.log('MetaMask locked or disconnected.');
        showStatusMessage('Wallet disconnected. Please reconnect.', true);
        resetAppUI();
    } else {
        currentUserAddress = accounts[0];
        // Re-initialize with new account
        ethersSigner = ethersProvider.getSigner();
        updateUserInfoUI();
        deriveLocalEncryptionKey(); // Re-derive key for new account
        console.log('Account changed to:', currentUserAddress);
        loadContactsFromCache(); // Reload data for the new account
    }
}

function handleChainChanged(_chainId) {
    // Reload the page or re-initialize the app state for the new network
    // alert('Network changed. Please reload the page or re-initialize.');
    console.log('Network changed to:', _chainId);
    window.location.reload(); // Simplest way to handle network change for now
}

function updateUserInfoUI() {
    if (currentUserAddress && currentNetwork) {
        userAddressSpan.textContent = `${currentUserAddress.substring(0, 6)}...${currentUserAddress.substring(currentUserAddress.length - 4)}`;
        networkNameSpan.textContent = currentNetwork.name;
        chainIdSpan.textContent = currentNetwork.chainId;
        userInfoDiv.style.display = 'block';
    } else {
        userInfoDiv.style.display = 'none';
    }
}

function resetAppUI() {
    currentUserAddress = null;
    ethersProvider = null;
    ethersSigner = null;
    localEncryptionKey = null;

    userAddressSpan.textContent = '';
    networkNameSpan.textContent = '';
    chainIdSpan.textContent = '';
    userInfoDiv.style.display = 'none';

    connectWalletBtn.textContent = 'Connect Wallet';
    connectWalletBtn.disabled = false;
    clearCacheBtn.style.display = 'none';

    contactListDiv.innerHTML = '';
    messageListDiv.innerHTML = '<p class="system-message">Connect your wallet to start messaging.</p>';
    chattingWithHeader.textContent = 'Select a chat';
    recipientAddressInput.value = '';
    messageInput.value = '';
}

// --- Encryption Key Derivation ---

// --- New WebCrypto based Encryption/Decryption ---

async function deriveWebCryptoKey(signatureBasedKeyMaterial) {
    // Use the hex key material derived from the signature
    // We need to convert this hex string into an ArrayBuffer for WebCrypto
    const keyBuffer = new Uint8Array(signatureBasedKeyMaterial.match(/.{1,2}/g).map(byte => parseInt(byte, 16))).buffer;
    return crypto.subtle.importKey(
        "raw",
        keyBuffer,
        { name: "AES-GCM" },
        false, // not extractable
        ["encrypt", "decrypt"]
    );
}

let webCryptoEncryptionKey = null; // Store the imported WebCrypto key

// Modify deriveLocalEncryptionKey to also prepare WebCrypto key
async function deriveLocalEncryptionKey() {
    if (!ethersSigner || !currentUserAddress) {
        console.error("Signer or address not available for key derivation.");
        // localEncryptionKey = null; // CryptoJS key - Removed
        webCryptoEncryptionKey = null; // WebCrypto key
        return;
    }
    try {
        const messageToSign = `Login to Web3 Messenger: ${currentUserAddress}`;
        const signature = await ethersSigner.signMessage(messageToSign);
        const keyMaterialHex = CryptoJS.SHA256(signature).toString(CryptoJS.enc.Hex);

        // localEncryptionKey = keyMaterialHex.substring(0, 32); // Old key - Removed

        // Prepare WebCrypto key (e.g., using first 256 bits / 32 bytes for AES-256)
        // AES-GCM keys can be 128, 192, or 256 bits. Using 256 bits (32 bytes = 64 hex chars).
        const webCryptoKeyMaterialHex = keyMaterialHex.substring(0, 64);
        webCryptoEncryptionKey = await deriveWebCryptoKey(webCryptoKeyMaterialHex);

        console.log("Local encryption keys derived (WebCrypto).");
    } catch (error) {
        console.error("Error deriving local encryption key:", error);
        showStatusMessage("Could not sign message to secure local storage. Please try again.", true);
        // localEncryptionKey = null; // Old key - Removed
        webCryptoEncryptionKey = null;
    }
}


async function encryptDataWC(plainTextData) {
    if (!webCryptoEncryptionKey) throw new Error("WebCrypto encryption key not available.");

    const dataStr = JSON.stringify(plainTextData);
    const encodedData = new TextEncoder().encode(dataStr);

    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV is recommended for AES-GCM

    const encryptedBuffer = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        webCryptoEncryptionKey,
        encodedData
    );

    // Store IV with ciphertext: common practice is to prepend IV to ciphertext
    const ivAndCiphertext = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    ivAndCiphertext.set(iv);
    ivAndCiphertext.set(new Uint8Array(encryptedBuffer), iv.length);

    // Convert to Base64 string for storage in localForage (which might prefer strings)
    return btoa(String.fromCharCode.apply(null, ivAndCiphertext));
}

async function decryptDataWC(base64EncryptedData) {
    if (!webCryptoEncryptionKey) throw new Error("WebCrypto encryption key not available.");

    try {
        const ivAndCiphertext = new Uint8Array(atob(base64EncryptedData).split("").map(char => char.charCodeAt(0)));

        const iv = ivAndCiphertext.slice(0, 12);
        const ciphertext = ivAndCiphertext.slice(12);

        const decryptedBuffer = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            webCryptoEncryptionKey,
            ciphertext
        );

        const decryptedStr = new TextDecoder().decode(decryptedBuffer);
        return JSON.parse(decryptedStr);
    } catch (error) {
        console.error("WebCrypto Decryption error:", error);
        // This could be due to wrong key, tampered data (GCM would detect), or other issues
        return null;
    }
}

// --- Chat and Message Management ---
async function handleSendMessage() {
    if (!currentUserAddress || !ethersSigner) {
        showStatusMessage('Please connect your wallet first.', true); // Use showStatusMessage
        return;
    }

    const recipientAddress = recipientAddressInput.value.trim();
    const messageText = messageInput.value.trim();

    if (!ethers.utils.isAddress(recipientAddress)) {
        showStatusMessage('Invalid recipient address.', true);
        return;
    }
    if (!messageText) {
        showStatusMessage('Message cannot be empty.', true);
        return;
    }

    if (recipientAddress.toLowerCase() === currentUserAddress.toLowerCase()) {
        showStatusMessage("You cannot send a message to yourself in this manner.", true);
        return;
    }

    // For now, we are not sending to blockchain. We'll simulate by storing locally.
    // Encryption for "sending" (simulated on-chain message) would need recipient's public key.
    // Here, we are focusing on local storage encryption.

    const message = {
        id: self.crypto.randomUUID(), // Browser's built-in UUID
        sender: currentUserAddress,
        recipient: recipientAddress,
        content: messageText, // This would be encrypted before "sending" to blockchain
        timestamp: new Date().toISOString(),
        type: 'sent' // To distinguish in UI if loaded into recipient's client
    };

    console.log('Simulating send message:', message);

    // Store message locally (encrypted)
    await saveMessageToLocalCache(recipientAddress, message);
    await saveMessageToLocalCache(currentUserAddress, message); // Save in sender's cache too, but mark differently

    // Update UI
    if (currentChatAddress && recipientAddress.toLowerCase() === currentChatAddress.toLowerCase()) {
        displayMessage(message);
    }

    // Add/update contact list
    await addOrUpdateContact(recipientAddress, message.content, message.timestamp);

    messageInput.value = ''; // Clear input after sending
    // recipientAddressInput.value = ''; // Optionally clear recipient
}

async function saveMessageToLocalCache(chatPartnerAddress, message) {
    if (!localEncryptionKey) {
        console.warn("Cannot save message, local encryption key not available.");
        return;
    }
    const normalizedPartnerAddress = chatPartnerAddress.toLowerCase();
    // For messages received from blockchain, the chatPartner is the sender.
    // For messages sent by user, the chatPartner is the recipient.
    // The key should be consistent for a given chat pair.
    // Let's make the chatPartnerAddress always the "other" party.
    let effectiveChatPartner = normalizedPartnerAddress;
    if (message.sender.toLowerCase() === currentUserAddress.toLowerCase()){ // Outgoing message
        effectiveChatPartner = message.recipient.toLowerCase();
    } else { // Incoming message
        effectiveChatPartner = message.sender.toLowerCase();
    }

    const cacheKey = `messages_${effectiveChatPartner}`;

    try {
        const existingEncrypted = await localforage.getItem(cacheKey);
        let messages = [];
        if (existingEncrypted) {
            const decrypted = await decryptDataWC(existingEncrypted); // USE WEBCRYPTO
            if (decrypted) {
                messages = decrypted;
            } else {
                console.warn(`Could not decrypt existing messages for ${effectiveChatPartner} using WebCrypto. Data might be old format or corrupted. Starting new list.`);
                // TODO: Add migration logic here if needed: try decryptData (old CryptoJS)
            }
        }

        // Avoid duplicates based on message ID (e.g., transaction hash)
        if (message.id && messages.some(m => m.id === message.id)) {
            console.log(`Message with ID ${message.id} already exists in cache for chat with ${effectiveChatPartner}. Skipping.`);
            return;
        }

        const messageForDisplay = { ...message };
        if (message.sender.toLowerCase() === currentUserAddress.toLowerCase()) {
            messageForDisplay.type = 'sent';
        } else {
            messageForDisplay.type = 'received';
        }

        messages.push(messageForDisplay);
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const dataToEncrypt = messages;
        const newEncrypted = await encryptDataWC(dataToEncrypt); // USE WEBCRYPTO
        await localforage.setItem(cacheKey, newEncrypted);
        console.log(`Message saved to local cache for chat with ${effectiveChatPartner} (using WebCrypto).`);
    } catch (error) {
        console.error(`Error saving message for ${effectiveChatPartner} to local cache:`, error);
    }
}


async function loadMessagesForChat(chatAddress) {
    if (!localEncryptionKey) {
        console.warn("Cannot load messages, local encryption key not available.");
        messageListDiv.innerHTML = '<p class="system-message">Error: Local encryption key not available.</p>';
        return;
    }
    currentChatAddress = chatAddress.toLowerCase();
    chattingWithHeader.textContent = `Chat with ${currentChatAddress.substring(0, 6)}...${currentChatAddress.substring(currentChatAddress.length - 4)}`;
    messageListDiv.innerHTML = ''; // Clear previous messages

    const cacheKey = `messages_${currentChatAddress}`;
    try {
        const encryptedMessages = await localforage.getItem(cacheKey);
        if (encryptedMessages) {
            const messages = await decryptDataWC(encryptedMessages); // USE WEBCRYPTO
            if (messages && Array.isArray(messages)) {
                messages.forEach(displayMessage);
            } else if (messages === null) { // Decryption failed
                messageListDiv.innerHTML = '<p class="system-message">Could not decrypt messages. Key mismatch, data corruption, or old format.</p>';
                console.warn(`WebCrypto decryption failed for ${cacheKey}. Data might be from a different account, corrupted, or old format.`);
                // TODO: Add migration logic here if needed: try decryptData (old CryptoJS)
            }
            else { // Should not happen if decryptDataWC returns null on failure
                messageListDiv.innerHTML = '<p class="system-message">No messages yet in this chat.</p>';
            }
        } else {
            messageListDiv.innerHTML = '<p class="system-message">No messages yet in this chat.</p>';
        }
    } catch (error) {
        console.error(`Error loading messages for ${currentChatAddress}:`, error);
        messageListDiv.innerHTML = `<p class="system-message">Error loading messages: ${error.message}</p>`;
    }
    recipientAddressInput.value = currentChatAddress; // Pre-fill recipient for quick reply
}

function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    // Adjust type based on current user perspective
    if (message.sender.toLowerCase() === currentUserAddress.toLowerCase()) {
        messageDiv.classList.add('sent');
    } else {
        messageDiv.classList.add('received');
    }

    const contentP = document.createElement('p');
    contentP.textContent = message.content; // Assume content is already decrypted for display

    const timestampSpan = document.createElement('span');
    timestampSpan.classList.add('timestamp');
    timestampSpan.textContent = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.appendChild(contentP);
    messageDiv.appendChild(timestampSpan);
    messageListDiv.appendChild(messageDiv);
    messageListDiv.scrollTop = messageListDiv.scrollHeight; // Scroll to bottom
}

// --- Contact List Management ---
async function addOrUpdateContact(contactAddress, lastMessage, timestamp) {
    if (!localEncryptionKey) return; // Can't save without key

    const normalizedContactAddress = contactAddress.toLowerCase();
    if (normalizedContactAddress === currentUserAddress.toLowerCase()) return; // Don't add self to contacts

    const contactsKey = `contacts_${currentUserAddress.toLowerCase()}`;
    try {
        let contacts = [];
        const encryptedContacts = await localforage.getItem(contactsKey);
        if (encryptedContacts) {
            const decrypted = await decryptDataWC(encryptedContacts); // USE WEBCRYPTO
            if (decrypted) {
                 contacts = decrypted;
            } else {
                console.warn(`Could not decrypt contacts using WebCrypto for ${currentUserAddress}. Data might be old format or corrupted. Starting new contact list.`);
                // TODO: Add migration logic here if needed
            }
        }

        const existingContactIndex = contacts.findIndex(c => c.address.toLowerCase() === normalizedContactAddress);
        if (existingContactIndex > -1) {
            // Update existing contact if this message is newer
            if (new Date(timestamp) > new Date(contacts[existingContactIndex].lastTimestamp)) {
                contacts[existingContactIndex].lastMessage = lastMessage.substring(0, 30) + (lastMessage.length > 30 ? '...' : '');
                contacts[existingContactIndex].lastTimestamp = timestamp;
            }
        } else {
            contacts.push({
                address: normalizedContactAddress,
                lastMessage: lastMessage.substring(0, 30) + (lastMessage.length > 30 ? '...' : ''),
                lastTimestamp: timestamp,
                // unreadCount: 0 // Future feature
            });
        }

        // Sort contacts by most recent message
        contacts.sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp));

        const newEncryptedContacts = await encryptDataWC(contacts); // USE WEBCRYPTO
        await localforage.setItem(contactsKey, newEncryptedContacts);

        renderContactList(contacts);

    } catch (error) {
        console.error("Error adding or updating contact:", error);
    }
}

async function loadContactsFromCache() {
    if (!currentUserAddress || !localEncryptionKey) {
        contactListDiv.innerHTML = '<p class="system-message">Connect wallet to see contacts.</p>';
        return;
    }
    const contactsKey = `contacts_${currentUserAddress.toLowerCase()}`;
    try {
        const encryptedContacts = await localforage.getItem(contactsKey);
        if (encryptedContacts) {
            const contacts = await decryptDataWC(encryptedContacts); // USE WEBCRYPTO
            if (contacts && Array.isArray(contacts)) {
                renderContactList(contacts);
            } else if (contacts === null) { // Decryption failed
                 contactListDiv.innerHTML = '<p class="system-message">Could not load contacts. Key mismatch, data corruption or old format.</p>';
                 console.warn(`WebCrypto decryption failed for contacts ${contactsKey}. Data might be from a different account, corrupted, or old format.`);
                // TODO: Add migration logic here if needed
            }
            else { // Should not happen
                contactListDiv.innerHTML = '<p class="system-message">No contacts yet. Start a new chat!</p>';
            }
        } else {
            contactListDiv.innerHTML = '<p class="system-message">No contacts yet. Start a new chat!</p>';
        }
    } catch (error) {
        console.error("Error loading contacts from cache:", error);
        contactListDiv.innerHTML = `<p class="system-message">Error loading contacts.</p>`;
    }
}

function renderContactList(contacts) {
    contactListDiv.innerHTML = ''; // Clear existing
    if (!contacts || contacts.length === 0) {
        contactListDiv.innerHTML = '<p class="system-message">No contacts yet. Start a new chat!</p>';
        return;
    }
    contacts.forEach(contact => {
        const contactDiv = document.createElement('div');
        contactDiv.classList.add('contact-item');
        contactDiv.dataset.address = contact.address; // Store address in data attribute

        const addressP = document.createElement('p');
        addressP.textContent = `${contact.address.substring(0, 6)}...${contact.address.substring(contact.address.length - 4)}`;
        addressP.style.fontWeight = 'bold';

        const lastMessageP = document.createElement('p');
        lastMessageP.textContent = contact.lastMessage;
        lastMessageP.style.fontSize = '0.9em';
        lastMessageP.style.color = '#b0b0b0';

        contactDiv.appendChild(addressP);
        contactDiv.appendChild(lastMessageP);
        contactListDiv.appendChild(contactDiv);
    });
}

function handleContactClick(event) {
    const targetItem = event.target.closest('.contact-item');
    if (targetItem && targetItem.dataset.address) {
        const contactAddress = targetItem.dataset.address;

        // Remove 'active' class from previously active contact
        const currentlyActive = contactListDiv.querySelector('.contact-item.active');
        if (currentlyActive) {
            currentlyActive.classList.remove('active');
        }
        // Add 'active' class to clicked contact
        targetItem.classList.add('active');

        loadMessagesForChat(contactAddress);
    }
}

// --- Cache Clearing ---
async function clearLocalCache() {
    if (!currentUserAddress) {
        showStatusMessage("Connect your wallet first before clearing cache.", true);
        return;
    }
    const confirmation = confirm("Are you sure you want to clear all locally cached messages and contacts for this wallet address? This action cannot be undone.");
    if (confirmation) {
        showStatusMessage("Clearing local cache...");
        try {
            // ... (rest of the logic for clearing)
            const contactsKeyToDelete = `contacts_${currentUserAddress.toLowerCase()}`;
            await localforage.removeItem(contactsKey);

            // Clear messages for all known chats (more robust: iterate over keys if localforage supports it well, or clear by prefix)
            // For now, let's assume we know which chats to clear or clear everything related to the app.
            // A simpler but more drastic approach:
            // await localforage.clear(); // Clears the entire database for this app name!
            // This is too broad if other app data (not per-user) is stored.
            // A more targeted approach: iterate through all keys and remove ones matching patterns.

            const keys = await localforage.keys();
            const userSpecificKeys = keys.filter(key =>
                key.startsWith(`messages_`) || key.startsWith(`contacts_${currentUserAddress.toLowerCase()}`)
            );

            for (const key of userSpecificKeys) {
                // We need to be careful here. If another user used the same browser,
                // `messages_${chatPartnerAddress}` could be shared.
                // However, encryption key is per-user. So, one user cannot decrypt other's messages.
                // For a full clear FOR THIS USER, we must identify chats this user participated in.
                // The current structure saves messages under `messages_${chatPartnerAddress}`.
                // The `contacts_${currentUserAddress}` list gives us these partner addresses.

                // For simplicity of this function, we'll just clear the current user's contacts list
                // and any message caches that *might* have been decrypted with their key.
                // A truly robust clear would involve more complex key management or namespacing.
            }

            // A more direct way if we assume current encryption key protects all relevant data:
            // Iterate all `messages_*` keys, try to decrypt a small part. If successful, it's this user's. Risky.
            // Best for now: clear contacts list, and user has to re-discover chats or they will be orphaned until next interaction.
            // Or, if `contacts` stores all chat partners, iterate and delete:
            const contactsKey_to_delete = `contacts_${currentUserAddress.toLowerCase()}`; // Renamed to avoid conflict if any
            const encryptedContacts = await localforage.getItem(contactsKey_to_delete);
            if (encryptedContacts) {
                const contacts = await decryptDataWC(encryptedContacts); // USE WEBCRYPTO, Needs the key to be available
                if (contacts && Array.isArray(contacts)) {
                    for (const contact of contacts) {
                        await localforage.removeItem(`messages_${contact.address.toLowerCase()}`);
                    }
                }
                await localforage.removeItem(contactsKey_to_delete);
            }

            showStatusMessage('Local cache cleared successfully.');
            // Reset relevant parts of the UI
            contactListDiv.innerHTML = '<p class="system-message">Cache cleared. Start a new chat or reconnect to scan blockchain.</p>';
            messageListDiv.innerHTML = '<p class="system-message">Select a chat or start a new one.</p>';
            chattingWithHeader.textContent = 'Select a chat';
            currentChatAddress = null;
        } catch (error) {
            console.error('Error clearing local cache:', error);
            showStatusMessage(`Failed to clear local cache: ${error.message}`, true);
        }
    }
}

// --- QR Code Modal (Placeholder) ---
function showQrCodeModal() {
    // In a real scenario, you'd generate a WalletConnect QR code here
    qrCodeContainer.innerHTML = '<p>QR Code Functionality (e.g., WalletConnect) would be implemented here.</p><img src="https://via.placeholder.com/200?text=QR+Code+Placeholder" alt="QR Code Placeholder">';
    if (qrCodeModal) qrCodeModal.style.display = 'flex';
}


// --- Initial Load ---
function initializeApp() {
    // Check if wallet is already connected (e.g., from previous session via EIP-6963 or other means)
    // For now, we require manual connection on each load.
    messageListDiv.innerHTML = '<p class="system-message">Welcome to Web3 Messenger. Connect your wallet to begin.</p>';
    // If we want to persist connection status or auto-reconnect, more logic is needed here.
}

// Start the app
initializeApp();
console.log("App initialized. Waiting for wallet connection.");
console.log("Note: True blockchain scanning and message encryption/decryption for on-chain messages are simplified in this phase.");
console.log("Current focus is on UI, local caching, and wallet interaction basics.");

// TODO for later steps:
// - Actual Blockchain Scanning (eth_getLogs or similar)
// - On-chain message encryption/decryption (e.g. using ECIES with recipient's public key)
// - Robust error handling and user feedback
// - More sophisticated local storage structure (simulating /user_chats/[address]/messages.json)
// - Handling of new messages arriving from blockchain scan
// - Syncing last read block number for each chat.
// - WebCrypto API for AES-GCM for local storage (more secure than direct CryptoJS AES if not careful with IVs etc.)
// - Consider EIP-6963 for multi-wallet discovery.
// - Implement the QR code modal for WalletConnect.
// - Security: Ensure no sensitive data (like unencrypted private keys or raw signatures used for key derivation beyond initial derivation) is leaked.
// - UI refinements: loading indicators, better feedback on operations.
// - Offline support: Service workers for caching static assets.
// - Tests!

async function scanForMessagesPlaceholder(userAddress) {
    if (!ethersProvider) {
        console.warn("Blockchain provider not available for scanning messages.");
        return;
    }
    console.log(`Simulating blockchain scan for messages for address: ${userAddress}`);

    // Simulate finding a couple of messages via eth_getLogs or similar method
    // In a real scenario, this would involve:
    // 1. Defining the contract address and event signature (topic) for messages.
    // 2. Using ethersProvider.getLogs() with appropriate filters (e.g., indexed recipient address).
    // 3. Iterating through logs and decrypting message content.

    const mockMessages = [
        {
            // Mocking a log structure that might come from eth_getLogs
            // Typically, data would be hex strings, and topics would guide interpretation.
            transactionHash: '0xmocktxhash1',
            blockNumber: await ethersProvider.getBlockNumber() - 5, // Simulate a recent block
            // Assuming event Message(address indexed from, address indexed to, string encryptedContent);
            // topics[0] = keccak256("Message(address,address,string)")
            // topics[1] = abi.encode(senderAddress)
            // topics[2] = abi.encode(recipientAddress)
            // data = abi.encode(encryptedContent)
            simulatedSender: '0x0123456789012345678901234567890123456789', // A mock sender
            simulatedRecipient: userAddress,
            simulatedEncryptedContent: 'U2FsdGVkX1+fFrCvqLpFfH6O+w7BqDMn2n0jYc/n07s=', // Mock encrypted "Hello from blockchain!"
            simulatedTimestamp: new Date(Date.now() - 5 * 60000).toISOString() // 5 minutes ago
        },
        {
            transactionHash: '0xmocktxhash2',
            blockNumber: await ethersProvider.getBlockNumber() - 10,
            simulatedSender: '0x9876543210987654321098765432109876543210', // Another mock sender
            simulatedRecipient: userAddress,
            simulatedEncryptedContent: 'U2FsdGVkX19cSM8t5xJ1gH8gIqG9zO9aP3sLdFqU2rA=', // Mock encrypted "Web3 chat test"
            simulatedTimestamp: new Date(Date.now() - 10 * 60000).toISOString() // 10 minutes ago
        }
    ];

    let newMessagesFound = false;
    for (const mockMsg of mockMessages) {
        if (mockMsg.simulatedRecipient.toLowerCase() !== userAddress.toLowerCase()) continue;

        // Use the new conceptual decryption function
        // The `simulatedEncryptedContent` is what we'd pass to eth_decrypt
        // (assuming it was correctly formatted and encrypted for that purpose)
        const decryptedContent = await decryptMessageWithWallet(mockMsg.simulatedEncryptedContent);

        const message = {
            id: mockMsg.transactionHash,
            sender: mockMsg.simulatedSender,
            recipient: mockMsg.simulatedRecipient,
            content: decryptedContent, // Content is now from the conceptual wallet decryption
            timestamp: mockMsg.simulatedTimestamp,
            type: 'received',
            blockNumber: mockMsg.blockNumber
        };
        // ... (rest of the loop: saveMessageToLocalCache, addOrUpdateContact, etc.) ...
        await saveMessageToLocalCache(message.sender, message);
        await addOrUpdateContact(message.sender, message.content, message.timestamp);
        newMessagesFound = true;
        console.log(`Simulated new message from ${message.sender}: "${message.content}" (decrypted via conceptual wallet interaction)`);
    }
    // ... (rest of the function: UI updates) ...
    if (newMessagesFound) {
        if (currentChatAddress && mockMessages.some(m => m.simulatedSender.toLowerCase() === currentChatAddress.toLowerCase())) {
            await loadMessagesForChat(currentChatAddress);
        }
        await loadContactsFromCache();
    } else {
        console.log("No new simulated messages found on blockchain.");
    }
}

// Mock encrypted messages for testing the placeholder scan
// "Hello from blockchain!" encrypted with "a_very_secret_key_for_simulation_only"
// CryptoJS.AES.encrypt("Hello from blockchain!", "a_very_secret_key_for_simulation_only").toString()
// -> U2FsdGVkX1+fFrCvqLpFfH6O+w7BqDMn2n0jYc/n07s=
// "Web3 chat test" encrypted with "a_very_secret_key_for_simulation_only"
// CryptoJS.AES.encrypt("Web3 chat test", "a_very_secret_key_for_simulation_only").toString()
// -> U2FsdGVkX19cSM8t5xJ1gH8gIqG9zO9aP3sLdFqU2rA=

async function decryptMessageWithWallet(encryptedDataHexString) {
    if (!ethersProvider || !currentUserAddress) {
        console.warn("Wallet provider or user address not available for decryption.");
        // For simulation, fall back to the symmetric placeholder if no provider
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedDataHexString, "a_very_secret_key_for_simulation_only");
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (originalText) return originalText;
            return "(Decryption failed - simulated fallback)";
        } catch (e) {
            return "(Decryption error - simulated fallback)";
        }
    }

    try {
        // In a real scenario, encryptedDataHexString should be a hex string.
        // The data should have been encrypted using the user's eth_getEncryptionPublicKey.
        // const decryptedPayload = await ethersProvider.send('eth_decrypt', [encryptedDataHexString, currentUserAddress]);
        // For this simulation, as we don't have data encrypted with eth_getEncryptionPublicKey,
        // we will continue to use the symmetric placeholder to "decrypt" the mock data.
        // This call would typically prompt the user in MetaMask.

        console.log(`Simulating call to eth_decrypt for data: ${encryptedDataHexString.substring(0,30)}...`);
        // This is where the actual call would be:
        // return await ethersProvider.send('eth_decrypt', [encryptedDataHexString, currentUserAddress]);

        // Placeholder decryption logic (same as before for mock data):
        const bytes = CryptoJS.AES.decrypt(encryptedDataHexString, "a_very_secret_key_for_simulation_only");
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        if (originalText) {
            return originalText;
        }
        return "(Simulated eth_decrypt: Decryption failed or data not in expected format)";

    } catch (error) {
        console.error("Error during simulated eth_decrypt:", error);
        // Handle specific errors, e.g., user rejected request, decryption failed
        // For some errors, MetaMask might not even show a prompt if data isn't correctly formatted.
        return `(Simulated eth_decrypt: Error - ${error.message})`;
    }
}
