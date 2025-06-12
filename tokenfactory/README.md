# TokenFactory WebApp

TokenFactory is a decentralized front-end application for issuing, registering, and managing tokens based on real-world assets (RWA). It interacts directly with smart contracts and IPFS for data storage, without relying on a traditional backend server.

## Project Structure

-   **`/index.html`**: The main entry point for the application.
-   **`/abi/`**: Contains JSON ABI (Application Binary Interface) files for interacting with the deployed smart contracts.
-   **`/assets/`**: Holds static assets like images, icons, and fonts.
    -   **`/assets/fonts/`**: Font files (e.g., Comfortaa, Vazirmatn).
    -   **`/assets/images/`**: Image files.
-   **`/css/`**: Contains stylesheets for the application.
    -   **`/css/style.css`**: Main stylesheet.
-   **`/js/`**: Contains JavaScript files.
    -   **`/js/app.js`**: Main application logic, UI interactions.
    -   **`/js/ipfs.js`**: Functions for interacting with IPFS (InterPlanetary File System).
    -   **`/js/web3-interactions.js`**: Functions for blockchain interactions (e.g., connecting to wallets, calling smart contract methods via Web3.js or Ethers.js).
-   **`/docs/`**: Project documentation, including the Product Design Document (PDD), architectural diagrams, and user guides.

## Features (Planned)

-   **Tokenization**: Propose new RWA tokens, upload supporting documents to IPFS, and register proposals on the blockchain.
-   **DAO (Decentralized Autonomous Organization)**: Review and vote on token proposals.
-   **P2P Market**: A decentralized marketplace for trading issued tokens.
-   **My Dashboard**: A personalized view of user assets, activities, proposal statuses, and settings.
-   **About Us**: Information about the project, team, and documentation.

## How to Run

Since this is a purely front-end application, it can be run in several ways:

1.  **Locally via a simple HTTP server:**
    -   Navigate to the `tokenfactory` directory in your terminal.
    -   If you have Python 3, run: `python -m http.server`
    -   If you have Node.js and `serve` installed (`npm install -g serve`), run: `serve .`
    -   Then open your browser and go to `http://localhost:8000` (or the port specified by the server).
2.  **Directly from the file system (some features might be limited due to browser security policies):**
    -   Open the `index.html` file directly in your web browser.
    -   *Note: Interactions with IPFS or blockchain wallets might require a proper HTTP server environment due to CORS and other security restrictions.*
3.  **Via GitHub Pages (or any static site hosting):**
    -   If this repository is hosted on GitHub and GitHub Pages is configured for the `tokenfactory` directory (or the root, if `tokenfactory` is the root), it can be accessed via `https://<your-username>.github.io/<repository-name>/` or `https://<your-username>.github.io/<repository-name>/tokenfactory/index.html` if it's a subdirectory.

## Dependencies

-   A modern web browser with JavaScript enabled.
-   A blockchain wallet extension (like MetaMask) for interacting with smart contracts.
-   (Potentially) An IPFS node or gateway for document storage and retrieval (details to be implemented).

## Development

To contribute or modify the project:

1.  Clone the repository.
2.  Make changes to the HTML, CSS, or JavaScript files.
3.  Test thoroughly in a browser, preferably using a local HTTP server.

## Color Scheme

-   **Background:** 70% White (`#FFFFFF`)
-   **Text/Headers/Footers:** 25% Black (`#000000`)
-   **CTAs/Interactive Elements:** 5% Bitcoin Orange (`#F7931A`)

## Fonts

-   **Default (English):** Comfortaa
-   **Persian/Arabic:** Vazirmatn (to be added)

---

This project aims to be a minimal, fully front-end, and blockchain-native platform.
