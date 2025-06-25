let provider;
let signer;
let connected = false;
let deployedCollectionContract = null; // To store the deployed contract instance
let deployerAddress = null;

const connectBtn = document.getElementById('connectBtn');
const statusDiv = document.getElementById('status');
const yourWalletInput = document.getElementById('yourWallet');

// Collection Deployment Elements
const createTokenBtn = document.getElementById('createToken');
const outputDiv = document.getElementById('output');
const collectionNameInput = document.getElementById('name');
const collectionSymbolInput = document.getElementById('symbol');

// Minting Section Elements (assuming they exist in HTML now)
const mintingSection = document.getElementById('mintingSection');
const collectionContractAddressSpan = document.getElementById('collectionContractAddress');
const nextTokenIdDisplaySpan = document.getElementById('nextTokenIdDisplay');
const nftNameInput = document.getElementById('nftName');
const nftDescriptionInput = document.getElementById('nftDescription');
const nftImageUrlInput = document.getElementById('nftImageUrl');
const generateMetadataBtn = document.getElementById('generateMetadataBtn');
const metadataJsonOutputTextarea = document.getElementById('metadataJsonOutput');
const nftMetadataIpfsUrlInput = document.getElementById('nftMetadataIpfsUrl');
const mintNftBtn = document.getElementById('mintNftBtn');
const mintOutputDiv = document.getElementById('mintOutput');


connectBtn.addEventListener('click', connectWallet);

async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    statusDiv.innerText = '❌ MetaMask is not installed.';
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    deployerAddress = accounts[0];
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    yourWalletInput.value = deployerAddress;
    statusDiv.innerText = `✅ Wallet connected: ${deployerAddress.slice(0, 6)}...${deployerAddress.slice(-4)}`;
    connected = true;
  } catch (err) {
    statusDiv.innerText = '❌ Wallet connection was cancelled or failed.';
    console.error(err);
  }
}

// ----------------------------------------------------------------------------------
// IMPORTANT: BYTECODE FOR MyCustomNFT.sol
// You MUST compile the MyCustomNFT.sol contract (provided in README.md or a separate file)
// and replace the placeholder below with the actual bytecode from compilation.
// The Solidity code for MyCustomNFT.sol is designed to work with the ABI below.
// MyCustomNFT.sol uses OpenZeppelin contracts for ERC721, ERC721URIStorage, Ownable, and Counters.
// Its constructor is: constructor(string memory name, string memory symbol)
// Its mint function is: safeMint(address to, string memory uri)
// ----------------------------------------------------------------------------------
const erc721Bytecode = "0xYOUR_COMPILED_MyCustomNFT_BYTECODE_HERE"; // MUST REPLACE

const erc721ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getNextTokenId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "uri",
        "type": "string"
      }
    ],
    "name": "safeMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Listener for the create collection button
if (createTokenBtn) {
  createTokenBtn.addEventListener("click", async () => {
    outputDiv.textContent = "";
    if (mintingSection) mintingSection.style.display = 'none';
    if (mintOutputDiv) mintOutputDiv.textContent = "";


    if (!connected || !signer) {
      outputDiv.textContent = "⛔ Please connect your wallet first.";
      return;
    }

    const collectionName = collectionNameInput.value.trim();
    const collectionSymbol = collectionSymbolInput.value.trim();

    if (!collectionName || !collectionSymbol) {
      outputDiv.textContent = "⚠️ Please fill in Collection Name and Symbol correctly.";
      return;
    }

    if (erc721Bytecode === "0xYOUR_COMPILED_MyCustomNFT_BYTECODE_HERE" || !erc721Bytecode.startsWith("0x") || erc721Bytecode.length < 60) {
      outputDiv.innerHTML = `
        ⚠️ **CRITICAL ERROR:** ERC721 Bytecode is not set or is invalid in main.js!<br>
        Please compile the MyCustomNFT.sol contract (see README.md) and replace the placeholder erc721Bytecode value in main.js with the actual compiled bytecode.
      `;
      return;
    }

    outputDiv.textContent = `🚀 Deploying NFT Collection (${collectionSymbol})... Please wait.`;

    try {
      const factory = new ethers.ContractFactory(erc721ABI, erc721Bytecode, signer);
      const contract = await factory.deploy(collectionName, collectionSymbol);

      outputDiv.textContent = `⏳ Waiting for transaction confirmation...\nTX Hash: ${contract.deploymentTransaction().hash}`;

      const receipt = await contract.waitForDeployment();
      const contractAddress = await receipt.getAddress();

      outputDiv.textContent = `✅ NFT Collection deployed successfully!\nContract Address: ${contractAddress}\nTX Hash: ${contract.deploymentTransaction().hash}`;

      deployedCollectionContract = new ethers.Contract(contractAddress, erc721ABI, signer);
      if (mintingSection) {
          mintingSection.style.display = 'block';
      }
      if (collectionContractAddressSpan) {
        collectionContractAddressSpan.innerText = contractAddress;
      }
      updateNextTokenIdDisplay();

    } catch (err) {
      outputDiv.textContent = `❌ Error deploying collection: ${err.message || err}`;
      console.error(err);
    }
  });
}


async function updateNextTokenIdDisplay() {
    if (deployedCollectionContract && nextTokenIdDisplaySpan) {
        nextTokenIdDisplaySpan.innerText = "Fetching...";
        try {
            const nextId = await deployedCollectionContract.getNextTokenId();
            nextTokenIdDisplaySpan.innerText = nextId.toString();
        } catch (err) {
            console.error("Could not fetch next token ID:", err);
            nextTokenIdDisplaySpan.innerText = "Error";
        }
    }
}

if (generateMetadataBtn) {
  generateMetadataBtn.addEventListener('click', () => {
    const name = nftNameInput.value.trim();
    const description = nftDescriptionInput.value.trim();
    const imageUrl = nftImageUrlInput.value.trim();

    if (!name || !description || !imageUrl) {
      metadataJsonOutputTextarea.value = "Please fill in NFT Name, Description, and Image URL first.";
      return;
    }

    const metadata = {
      name: name,
      description: description,
      image: imageUrl,
      // attributes: [] // Optional: add attributes if needed in the future
    };
    metadataJsonOutputTextarea.value = JSON.stringify(metadata, null, 2);
  });
}

if (mintNftBtn) {
  mintNftBtn.addEventListener('click', async () => {
    if (!connected || !signer || !deployedCollectionContract) {
      mintOutputDiv.textContent = "⛔ Please connect wallet and deploy a collection first.";
      return;
    }

    const metadataIpfsUrl = nftMetadataIpfsUrlInput.value.trim();
    if (!metadataIpfsUrl) {
      mintOutputDiv.textContent = "⚠️ Please provide the IPFS URL of your metadata JSON.";
      return;
    }
    // Basic validation for IPFS URL (very simplistic)
    if (!metadataIpfsUrl.startsWith("ipfs://") && !metadataIpfsUrl.startsWith("https://")) {
        mintOutputDiv.textContent = "⚠️ Metadata URL should typically start with ipfs:// or a public gateway https://";
        // return; // Commenting out to allow user flexibility if they know what they're doing
    }


    mintOutputDiv.textContent = `🚀 Minting NFT... Please wait.`;

    try {
      const toAddress = deployerAddress; // Mint to the deployer/connected wallet
      const tx = await deployedCollectionContract.safeMint(toAddress, metadataIpfsUrl);

      mintOutputDiv.textContent = `⏳ Waiting for minting transaction confirmation...\nTX Hash: ${tx.hash}`;
      await tx.wait(); // Wait for the transaction to be mined

      mintOutputDiv.textContent = `✅ NFT minted successfully!\nTX Hash: ${tx.hash}`;

      // Clear minting form fields (optional)
      nftNameInput.value = '';
      nftDescriptionInput.value = '';
      nftImageUrlInput.value = '';
      metadataJsonOutputTextarea.value = '';
      nftMetadataIpfsUrlInput.value = '';

      updateNextTokenIdDisplay(); // Refresh the next token ID

    } catch (err) {
      mintOutputDiv.textContent = `❌ Error minting NFT: ${err.message || err}`;
      console.error("Error during minting:", err);
    }
  });
}
