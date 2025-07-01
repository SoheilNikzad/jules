# Web3 Messenger

## Description

Web3 Messenger is a client-side Web3 messaging application. It allows users to connect via their EVM-based wallets (like MetaMask) and exchange messages. All message data and contact information are stored exclusively in the user's browser local storage, encrypted using AES-GCM. The encryption keys are derived from a signature provided by the user's wallet, ensuring that only the user can decrypt their local data.

This project is designed to run entirely in the browser without any backend server. Interaction with the blockchain (for message sending/retrieval) is currently **simulated**.

## Features

*   **Wallet Integration:** Connects with EVM-based wallets (e.g., MetaMask) using ethers.js.
*   **Client-Side Storage:** All chat messages and contacts are stored in the browser's local storage (via localForage).
*   **Local Data Encryption:**
    *   Data at rest in local storage is encrypted using AES-GCM (via WebCrypto API).
    *   Encryption keys are derived on-the-fly from a signature obtained from the user's wallet (`personal_sign`). This means your local cache is only readable when you connect the correct wallet.
*   **Simulated Messaging:**
    *   Conceptual sending of messages to other Ethereum addresses.
    *   Simulated retrieval of messages from the "blockchain."
*   **User Interface:**
    *   Modern dark theme with orange accents.
    *   Contacts list (chat partners).
    *   Chat window for displaying messages.
*   **Zero Backend:** The application is 100% client-side.
*   **Cache Management:** Option to clear the locally stored encrypted cache.

## How to Run

1.  **Get the Files:**
    *   Clone this repository: `git clone <repository-url>`
    *   OR Download the files: `index.html`, `style.css`, `app.js`.
2.  **Open in Browser:**
    *   Navigate to the directory where you saved the files.
    *   Open the `index.html` file in a modern web browser (e.g., Chrome, Firefox, Brave).
3.  **Wallet Setup:**
    *   Ensure you have an EVM-compatible wallet extension like MetaMask installed and configured in your browser.
4.  **Connect & Use:**
    *   Click the "Connect Wallet" button in the application.
    *   Approve the connection in your wallet.
    *   Once connected, your address and network will be displayed.
    *   The app will simulate finding some messages for you from mock senders.
    *   You can start a new chat by entering a recipient address and message, then clicking "Send."

## Technologies Used

*   **HTML5**
*   **CSS3**
*   **JavaScript (ES6+)**
*   **ethers.js:** For Ethereum wallet interaction.
*   **localForage:** For convenient local storage management (IndexedDB/LocalStorage wrapper).
*   **CryptoJS:** Used for SHA256 hashing during the derivation of the encryption key from the wallet signature.
*   **WebCrypto API:** Used for AES-GCM encryption and decryption of all data stored locally.

## Important Notes

*   **Simulation:** The sending of messages to the blockchain and retrieval of messages from the blockchain are currently **simulated**. No actual on-chain transactions occur for messages.
*   **Security of Local Data:** The local cache is encrypted. However, the overall security also depends on the security of your browser and your computer.
*   **No Backend Storage:** Since there is no backend, if you clear your browser's local storage for this site, or switch browsers/devices, your message history will not be available unless you have a way to re-sync or re-discover it (which is part of the simulated blockchain scan).

## Future Development Ideas (Out of Scope for this Version)

*   Implement actual on-chain message sending/retrieval via a defined smart contract or protocol (e.g., Waku, XMPT).
*   User-configurable RPC endpoints.
*   Support for WalletConnect or other wallet providers.
*   Enhanced UI/UX for notifications, status updates, and error handling.
*   Full implementation of EIP-6963 for multi-wallet discovery.
*   Service workers for improved offline capabilities and caching of static assets.
*   Implementing SRI for CDN-loaded scripts.
*   Option to backup/restore encrypted local cache.
*   Formal test suites.
