# NFT Collection Creator & Minter

This application allows you to easily deploy your own ERC721 NFT collection contract and then mint individual NFTs into that collection. It uses a specific Solidity contract (`MyCustomNFT.sol` detailed below) that supports per-token URIs, ownership for minting, and auto-incrementing token IDs.

## Features

*   Connect to your Ethereum wallet (e.g., MetaMask).
*   Deploy a new ERC721 NFT collection contract (`MyCustomNFT`) with a custom name and symbol.
*   After deployment, mint individual NFTs into your collection.
*   Generate metadata JSON structure for your NFTs.
*   User-guided process for uploading metadata to IPFS and using the IPFS URL for minting.

## Smart Contract: `MyCustomNFT.sol`

This application is designed to work with a specific Solidity smart contract named `MyCustomNFT.sol`. You will need to compile this contract to get the bytecode required for deployment.

*   **Features:**
    *   **ERC721 Standard:** Implements the EIP-721 non-fungible token standard.
    *   **ERC721URIStorage:** Allows each token to have a unique URI, pointing to its metadata JSON.
    *   **Ownable:** The deployer of the contract becomes the owner and is the only one who can mint new NFTs.
    *   **Counters:** Uses OpenZeppelin's Counters library for auto-incrementing token IDs, starting from 0.
*   **Key Functions:**
    *   `constructor(string memory name, string memory symbol)`: Deploys the collection.
    *   `safeMint(address to, string memory uri)`: Mints a new NFT to the specified address with the given metadata URI. Only callable by the owner.
    *   `getNextTokenId()`: View function to see the ID that will be assigned to the next minted token.
*   **Solidity Code (`MyCustomNFT.sol`):**
    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
    import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";
    import "@openzeppelin/contracts/utils/Counters.sol";

    /*
    To compile this in Remix IDE:
    1. Create a new file named `MyCustomNFT.sol` and paste this code.
    2. Resolve OpenZeppelin imports using GitHub URLs if not setup in Remix (see comments in main.js or previous README version for examples like):
       import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.1/contracts/token/ERC721/ERC721.sol";
       (Ensure you use compatible OpenZeppelin versions, e.g., v5.0.1 for Solidity 0.8.20+)
    3. Select Solidity compiler (e.g., 0.8.20).
    4. Compile `MyCustomNFT.sol`.
    5. Copy the generated bytecode.
    */

    contract MyCustomNFT is ERC721, ERC721URIStorage, Ownable {
        using Counters for Counters.Counter;
        Counters.Counter private _tokenIdCounter;

        constructor(string memory name, string memory symbol)
            ERC721(name, symbol)
            Ownable(msg.sender)
        {}

        function safeMint(address to, string memory uri) public onlyOwner {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uri);
        }

        function getNextTokenId() public view returns (uint256) {
            return _tokenIdCounter.current();
        }

        function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
            super._burn(tokenId);
        }

        function tokenURI(uint256 tokenId)
            public
            view
            override(ERC721, ERC721URIStorage)
            returns (string memory)
        {
            require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");
            return super.tokenURI(tokenId);
        }

        function supportsInterface(bytes4 interfaceId)
            public
            view
            override(ERC721, ERC721URIStorage)
            returns (bool)
        {
            return super.supportsInterface(interfaceId);
        }
    }
    ```

## Prerequisites

*   A web browser with the MetaMask extension (or a similar EIP-1193 compatible wallet extension).
*   Some test ETH on your desired test network (e.g., Sepolia, Goerli) to pay for gas fees.
*   An account with an IPFS pinning service like [Pinata.cloud](https://www.pinata.cloud/), [NFT.Storage](https://nft.storage/), or access to a local/public IPFS node to upload metadata.

## Setup & Running

1.  **Clone or download this repository.**
2.  **Compile `MyCustomNFT.sol` & Update Bytecode:**
    *   **Compile:** Use the Solidity code provided above (or from a separate `MyCustomNFT.sol` file if included). Compile it using Remix IDE, Hardhat, or Foundry.
        *   **Remix IDE (Recommended for this app):**
            *   Go to [Remix IDE](https://remix.ethereum.org/).
            *   Create `MyCustomNFT.sol`, paste the code.
            *   Resolve `@openzeppelin` imports (e.g., by using full GitHub URLs for each import statement as shown in the Solidity code comments, making sure to use a version compatible with Solidity `^0.8.20` like OpenZeppelin Contracts `v5.0.1` or `v4.9.x`).
            *   Select the Solidity compiler tab, choose a version like `0.8.20`.
            *   Click "Compile MyCustomNFT.sol".
            *   After successful compilation, go to the "Deploy & Run Transactions" tab.
            *   Under the "Contract" dropdown, select "MyCustomNFT".
            *   Copy the **bytecode** (a long hexadecimal string starting with `0x`).
    *   **Update `nftshop/main.js`:**
        *   Open `nftshop/main.js`.
        *   Find the line: `const erc721Bytecode = "0xYOUR_COMPILED_MyCustomNFT_BYTECODE_HERE";`
        *   Replace the placeholder with the actual bytecode you copied.
        *   The `erc721ABI` in `main.js` is already set up for this `MyCustomNFT.sol` contract.

3.  **Open `nftshop/index.html`:**
    *   Open the `nftshop/index.html` file in your web browser.

## How to Use

### Part 1: Deploy NFT Collection Contract

1.  **Connect Wallet:** Click "Connect Wallet" and approve in MetaMask. Ensure you're on your desired network.
2.  **Fill Collection Details:**
    *   **Collection Name:** e.g., "My Digital Art"
    *   **Collection Symbol:** e.g., "MDA"
    *   (Optional fields for description and image URL for the collection are present but not used by this specific contract's constructor).
3.  **Deploy Contract:** Click "Create NFT Collection". Approve the transaction in MetaMask.
4.  **Confirmation:** Wait for confirmation. The contract address will be displayed. The "Mint New NFT" section will appear.

### Part 2: Mint Individual NFTs

Once the collection is deployed, the "Mint New NFT" section becomes active.

1.  **Prepare NFT Details:**
    *   **NFT Name:** Name for your specific NFT (e.g., "Sunset Bliss").
    *   **NFT Description:** Description for this NFT.
    *   **NFT Image URL:** A direct public URL to your NFT's image (e.g., an image you've already uploaded to IPFS, Arweave, or a standard web server: `https://your-image-host.com/image.png`).

2.  **Generate Metadata JSON:**
    *   Fill in the NFT Name, Description, and Image URL fields.
    *   Click the "1. Generate Metadata JSON" button.
    *   The application will create a JSON object with `name`, `description`, and `image` fields. This JSON will appear in the "Copy the JSON below..." textarea.

3.  **Upload Metadata JSON to IPFS:**
    *   **Copy the entire JSON string** from the textarea.
    *   Go to your IPFS pinning service (e.g., Pinata, NFT.Storage).
    *   Upload the copied JSON string as a new file.
        *   For Pinata: You can often just paste the JSON content when uploading, or save it as a `.json` file and upload that.
    *   Once uploaded, you will get an **IPFS CID** (Content Identifier) for your JSON file (e.g., `QmXo...`).

4.  **Provide Metadata IPFS URL:**
    *   In the application, in the "IPFS URL of Metadata JSON" field, enter the IPFS URI for your uploaded JSON. This should be in the format: `ipfs://YOUR_METADATA_CID` (e.g., `ipfs://QmXo...`). Some wallets also accept full HTTPS gateway URLs like `https://gateway.pinata.cloud/ipfs/YOUR_METADATA_CID`.

5.  **Mint the NFT:**
    *   Click the "2. Mint This NFT" button.
    *   Approve the transaction in MetaMask.
    *   Wait for confirmation. The minting status will be displayed.
    *   The "Next Token ID to Mint" will update.

6.  **View Your NFT:**
    *   After successful minting, your NFT should appear in your MetaMask wallet's NFT tab (sometimes requires manual import or a short delay for MetaMask to detect it). It should also be viewable on NFT marketplaces that support your chosen network, once they index your collection and token (e.g., OpenSea, Rarible).

## Important Notes

*   **Bytecode is CRUCIAL:** The application **WILL NOT WORK** if you do not replace the placeholder bytecode in `main.js` with the correctly compiled bytecode for `MyCustomNFT.sol` (or a compatible contract).
*   **IPFS Handling:** The current version requires you to manually upload the generated metadata JSON to an IPFS service.
*   **Gas Fees:** All blockchain transactions (deployment, minting) require gas fees.
*   **Testnets:** Always test on a test network first.
*   **Security:** Understand the smart contract you are deploying. For production, consider auditing your contract.
