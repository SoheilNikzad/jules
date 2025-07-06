const provider = new ethers.BrowserProvider(window.ethereum);
let signer;
let contractFactory;
let deployedContract;

const contractAbi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function mintNFT(address recipient, string memory tokenURI) public returns (uint256)",
  "function owner() view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function _tokenIds() view returns (uint256)",

  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

const contractBytecode = "PASTE_YOUR_COMPILED_BYTECODE_HERE"; 

document.getElementById("connectBtn").onclick = async () => {
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    signer = await provider.getSigner();
    const address = await signer.getAddress();
    document.getElementById("yourWallet").value = address;
    document.getElementById("status").innerText = "Wallet connected!";
  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "Connection failed.";
  }
};

document.getElementById("createToken").onclick = async () => {
  const name = document.getElementById("name").value.trim();
  const symbol = document.getElementById("symbol").value.trim();

  if (!name || !symbol) {
    alert("Please enter collection name and symbol.");
    return;
  }

  const factory = new ethers.ContractFactory(contractAbi, contractBytecode, signer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  deployedContract = contract;

  const address = await contract.getAddress();
  document.getElementById("output").innerText = `Contract deployed at:\n${address}`;
  document.getElementById("collectionContractAddress").innerText = address;
  document.getElementById("mintingSection").style.display = "block";

  const nextTokenId = await contract._tokenIds();
  document.getElementById("nextTokenIdDisplay").innerText = nextTokenId.toString();
};

document.getElementById("generateMetadataBtn").onclick = () => {
  const name = document.getElementById("nftName").value.trim();
  const description = document.getElementById("nftDescription").value.trim();
  const image = document.getElementById("nftImageUrl").value.trim();

  if (!name || !description || !image) {
    alert("Please fill in all NFT fields.");
    return;
  }

  const metadata = {
    name,
    description,
    image
  };

  document.getElementById("metadataJsonOutput").value = JSON.stringify(metadata, null, 2);
};

document.getElementById("mintNftBtn").onclick = async () => {
  const tokenURI = document.getElementById("nftMetadataIpfsUrl").value.trim();
  if (!tokenURI) {
    alert("Please enter the IPFS metadata URL.");
    return;
  }

  try {
    const recipient = await signer.getAddress();
    const tx = await deployedContract.mintNFT(recipient, tokenURI);
    const receipt = await tx.wait();

    const event = receipt.logs.find(log => log.fragment?.name === "Transfer");
    const tokenId = event?.args?.tokenId?.toString() ?? "Unknown";
    document.getElementById("mintOutput").innerText = `NFT Minted!\nToken ID: ${tokenId}\nTransaction Hash: ${tx.hash}`;

    const nextTokenId = await deployedContract._tokenIds();
    document.getElementById("nextTokenIdDisplay").innerText = nextTokenId.toString();
  } catch (err) {
    console.error(err);
    document.getElementById("mintOutput").innerText = "Minting failed.";
  }
};
