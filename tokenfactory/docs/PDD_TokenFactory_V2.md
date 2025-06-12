# Product Design Document (PDD) - TokenFactory Version 2

## Chapter One: Introduction and Purpose of Writing

**Introduction:** In the new era of digital assets, there is a growing need for platforms that enable tokenization and interaction with assets without relying on central infrastructure and processing servers. TokenFactory is designed as a minimal, fully front-end, and blockchain-free platform to enable users to issue, register, and manage tokens based on real assets through direct interaction with smart contracts.

**Purpose of this document:** This Product Design Document (PDD) - TokenFactory Version 2 is a detailed, transparent, and technical roadmap for designing and implementing a complete WebApp without the need for code to provide a written solution. In this version, the focus is on an architecture that:

**Smart contract developers are written to:**
*   Perform all operations using smart contract methods and without server dependency.
*   Use static HTML files and independent frontend structure.
*   Read and write user and token information from the blockchain (via Node RPC).
*   Provide the ability to encrypt, upload, and record documents on IPFS only through the browser and sign transactions.
*   Do not include any data storage on the server or sending to the blockchain.

**User Interface Design Architecture:** The TokenFactory platform is designed as a fully front-end project and runs only through an `index.html` file and a dependent folder structure (such as `abi/`, `assets/`, `css/`, `js/`, etc.). There will be no communication with the server or any external API (unless for RPC nodes). This project can be run via GitHub Pages, localhost, or even from a simple USB.

**Importance of this document:** This document serves as a complete development reference for user interface (UX/UI) designers, front-end programmers, and smart contract developers. The user's interaction path with the system should be defined step by step. The function and structure of each menu and button should be fully described. The different user paths (token proposal registration, voting, issuance, P2P market viewing, etc.) should be analyzed and designed. All capabilities should be defined and documented within the framework of predefined smart contracts.

**Color scheme and visual design:** The project's color scheme is designed based on the Bitcoin color palette:
*   70% white background (base and legible color)
*   25% black (bold sections, headers, footers, and fixed menus)
*   5% Bitcoin Orange (for CTAs and interactive icons)
*   All English fonts on the platform will use the Light Comfortaa font.

In the next chapter, the overall platform structure, menus, and main modules will be described in detail.

## Chapter 2: General platform structure, menus and main modules

This chapter describes the structure of the main modules of the TokenFactory platform in a step-by-step, development-oriented manner. The goal is to provide documentation that allows the developer to accurately implement each menu, form, role, and interaction flow without misunderstandings. Since the ultimate goal is to build a platform that is independent of the code and can be implemented in any environment (browser, local file, GitHub pages, etc.), all design components should be simple, straightforward, and based on decentralized structures.

### Module One: Tokenization

**Tab:** "Tokenization" (Accessible from the main menu)

**Module purpose:** Providing a form for users to propose the creation of RWA tokens, along with uploading documents and registering information on the chain.

**Form: New Token Offer**
*   **Form Title:** RWA New Token Proposal
*   **Location:** "Tokenization" tab
*   **Submission Type:** Transaction Signature by Wallet
*   **Roles involved:**
    *   Proposer User
    *   DAO Owner (for review and voting)
*   **Fields:**
    *   Token Name (Name Token – Type: `string`)
    *   Token Symbol (Symbol Token – Type: `string`)
    *   Total Number of Tokens (Total Supply – Type: `uint256`)
    *   Number of Decimals (Decimals – Type: `uint8`)
    *   Token Lifetime in days (Token Validity Duration – Type: `uint256`)
    *   Upload the Main Proposal File – Type: `.pdf`
    *   Upload Supplementary Documents (zip – Type: `.zip`)
*   **Process steps:**
    1.  **Document preparation:** The user prepares the original PDF file named `TokenProposal.pdf` and zips it along with the supporting documents.
    2.  **Local encryption:** The user encrypts the documents with the DAO public key using a tool like `sh.hat` (Note: specific client-side encryption library to be chosen, e.g., `openpgp.js` or similar).
    3.  **Upload to IPFS:** The files are uploaded to the local IPFS node (or a connected public/pinning service via client-side JS) and two CIDs are obtained.
    4.  **Calling the method:** By connecting to the wallet, the above form is registered on the chain along with the information and two CIDs (e.g., `proposeToken(name, symbol, supply, decimals, lifetime, pdfCid, zipCid)`).
*   **Information recorded in the blockchain:**
    *   Token Name, Symbol, Supply, Decimals, Lifetime
    *   CID encrypted PDF file
    *   CID encrypted zip file
*   **Visible statuses (for the proposal):**
    *   Waiting for voting
    *   Accepted (with mint option)
    *   Rejected (with reason message)
*   **Additional features:**
    *   "Submit Amendment" button (allows re-upload of documents with new CID if a proposal is rejected or needs changes before voting ends, specific logic TBD).
    *   "View Proposal" button (links to IPFS, client-side decryption if applicable).

### Module 2: DAO (Decentralized Organization)

**Tab:** "Decentralized Management"

**Module purpose:** Create an on-chain voting system to review, accept, or reject token proposals by DAO members.

**Roles involved:**
*   DAO Owner (Voter with decision-making authority)
*   Proposer User (to track status)
*   Public Viewer (to clarify and view results)

**Main components:**

1.  **Proposal List Table:**
    *   Displays a list of all submitted proposals that are in the "Awaiting Vote" status.
    *   **Columns:** Proposal ID, Token Name, Submission Date, Current Status, Number of Up/Down votes, Link to proposal documents, "Vote" button.

2.  **Voting Panel (modal or separate view upon clicking "Vote"):**
    *   **Section Title:** Review and Vote on Proposal
    *   **Display:** Full information of the selected proposal (token content, documents, CID details).
    *   **Two action buttons:** Approve Vote, Reject Vote.
    *   **Method call:** `voteOnProposal(proposalId, isApproved)` with wallet signature (where `isApproved` is true/false).
    *   **Validity condition:** Only DAO Owner with a valid address in the contract can vote.

3.  **Final token issuance (Mint):**
    *   **Activation condition:** After obtaining a majority of votes in favor.
    *   **Button:** "Issuance of final token" (visible to DAO or perhaps proposer if allowed by contract).
    *   **Calling the method:** `mintToken(proposalId)`.
    *   **Result:** The smart contract deploys the desired token on the network with the proposal specifications (using Factory Contract).

**Blockchain registration:**
*   Voter address + voting result.
*   Proposal ID and final status.
*   Token issuance transaction (if successful).

**Additional features:**
*   Live voting status for each proposal (real-time or regularly updated).
*   Vote percentage chart (UX/UI).
*   Vote status message after action (toast notification).

### Module Three: P2P Market

**Tab:** "P2P Market"

**Module purpose:** Providing a platform for buying and selling issued tokens in a decentralized market, without the need for a server and solely through smart contracts.

**Roles involved:**
*   Seller (token provider)
*   Buyer (looking for a suitable token)
*   General observer (to review projects and market statistics)

**Main components:**

1.  **Table of tokens available for trading:**
    *   Displays a list of tokens that have passed the DAO process and are currently tradable on the market.
    *   **Columns:** Token Name, Symbol, Offered selling price (token per Price), Remaining amount for sale, Seller's address, "View details" and "Buy" buttons.

2.  **Details page for each token (on "View details" click):**
    *   View full token profile: Initial and current supply of the issuer's contract, remaining time until expiration (Lifetime), registration date, CID Documents.
    *   Previous transactions (if possible to fetch from chain events).

3.  **Sales order registration form (Display only for token owner on their owned tokens):**
    *   **Title:** Add Token Sale Offer
    *   **Fields:**
        *   Amount of tokens to sell (Amount – Type: `uint256`)
        *   Price per unit of token (Price per unit – Type: `uint256`, e.g., in terms of native currency like ETH or a stablecoin)
        *   Offer validity period (Expiration – Type: `uint256` seconds, optional)
    *   **Method call:** `createOrder(tokenAddress, amount, price, expiration)`.
    *   **Limit:** Sell only up to the amount of assets available in the wallet.

4.  **Buy button for the buyer (Display only for non-owners on the token details/list):**
    *   Possibility to purchase any amount up to the available limit in the order.
    *   **Method call:** `buy(orderId, amountToBuy)` (with native token transfer, e.g., MATIC or ETH, if price is in native token).

**Information recorded in the blockchain (for orders/trades):**
*   Order ID
*   Seller and buyer addresses
*   Token amount and unit price
*   Status (active, expired, completed)

**Additional features:**
*   Filter by token name, price, date of entry.
*   Show "Only my active orders" for sellers.
*   Graphical interface Chart for recent prices (could be challenging without a backend, might rely on on-chain data analysis or external services if absolutely necessary and allowed).

### Module Four: My Dashboard

**Tab:** "My Dashboard"

**Module purpose:** Fully provide a personalized view of the user's assets, activities, proposal status, and personal settings in a personalized and secure dashboard.

**Roles involved:** All users (DAO Member, Proposer, Investor, Viewer)

**Main components:**

1.  **My Assets Panel:**
    *   Display the list of tokens that the user has in their wallet.
    *   **Information for each asset:** Token name, Symbol, Available amount, Approximate value (using market rate via contract or on-chain API if available), Transfer button (Open signature form for transfer).

2.  **History of activities:**
    *   List of registered activities with user signature: registered proposals, votes cast, purchases/sales made in the market, displayed in chronological order with the possibility of filtering by activity type.

3.  **Status of my proposals:**
    *   Suggestions submitted by the user are categorized as: Awaiting voting, Accepted (being issued), Rejected (with reason message), Finalized and Minted.
    *   "Edit and resubmit" button in case of rejection (linking back to the tokenization form with pre-filled data, if feasible).

4.  **Wallet and Environment Settings Form:**
    *   **Available settings:**
        *   Display wallet connection status (connected or disconnected).
        *   Button to reconnect to wallet.
        *   Select network (e.g., RAAKH, Polygon, Ethereum - this would require re-initializing web3 provider with new RPC and chain ID).
        *   Change language (English, Persian, ...).
        *   Dark/Light theme with saving selection to `localStorage`.
        *   Notification Bar (for new messages such as voting status or transaction execution).
        *   Alert icon for pending transactions.

### Module Five: About Us and Project Documentation (Documentation & About)

**Tab:** "About Us"

**Module purpose:** Creating an independent section on the platform to introduce the project, developers, design philosophy, and technical and functional documentation of the TokenFactory platform.

**Roles involved:**
*   All users (to read documentation and get to know the team and project)
*   External developers (to contribute or branch the project)
*   Potential investors or collaborators

**Main components:**

1.  **Project introduction and vision:**
    *   A simple text about what TokenFactory is, its goals, no-code/no-server philosophy, and its ability to run in decentralized environments (local browser, GitHub Pages, USB files).

2.  **Introducing the team and key members:**
    *   Names (optional), roles, backgrounds, and public contact addresses such as GitHub, email, or ENS (if applicable).

3.  **Link to sources and Git:**
    *   Full address of official GitHub repositories.
    *   Direct links to main smart contracts on different blockchains (Polygon, RAAKH, ...).
    *   Links to key commits (such as genesis, version 1.0v, stable and 2.0v).

4.  **Downloadable technical documentation:**
    *   Complete PDF file of this product design document.
    *   Image files and diagrams such as: Smart Contract Architecture, Contracts Architecture Flow Interaction Modules, Encryption and IPFS Upload Process.
    *   Markdown Documentation for use in GitBook or open source projects.

5.  **New User Guide:**
    *   Step-by-step tutorial with screenshots and short videos if needed: Connecting the wallet, Submitting the first voting proposal, Registering a sell order, Buying tokens.

**Additional features:**
*   "Copy Documentation Link" button.
*   Ability to select a language from English, Persian, Russian, Chinese, Hindi, Japanese, Arabic, Georgian and Korean. When selecting a language, all user interface texts (labels, buttons, messages, descriptions) are displayed in the same language.
*   Persian and Arabic font: Vazirmatn.
*   Other language font: Light Comfortaa.
*   Display the current platform version and the date of the last update.
*   Link to the user feedback form (Feedback form).

With this module, the TokenFactory platform will serve not only as a functional tool, but also as a transparent, open-source, and extensible reference.

---

**Important technical note for the developer:**

The project should be structured so that the entire project, including the `index.html` file and related folders, is contained in a directory within a Git repository. This repository should be accessible from a standalone GitHub Pages `/tokenfactory` or any static file hosting service.

The execution path should be as follows: `https://<your-domain>/tokenfactory/index.html`

In this path, all required files (ABI, JS, CSS, HTML, fonts and images) should be included relatively and without the need for any APIs (other than blockchain RPC and IPFS gateways/nodes) can be loaded and executed from the same path.

Management of this repository should be delegated to the developer responsible for implementing this document, so that changes, updates, and versioning can be done from there.
