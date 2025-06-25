let provider;
let signer;
let connected = false;

const connectBtn = document.getElementById('connectBtn');
const statusDiv = document.getElementById('status');
const yourWalletInput = document.getElementById('yourWallet');

connectBtn.addEventListener('click', connectWallet);

async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    statusDiv.innerText = '❌ MetaMask نصب نشده است.';
    return;
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    const address = await signer.getAddress();

    yourWalletInput.value = address;
    statusDiv.innerText = `✅ Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
    connected = true;
  } catch (err) {
    statusDiv.innerText = '❌ اتصال به کیف پول لغو شد یا خطا داشت.';
    console.error(err);
  }
}

const erc20ABI = [{
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
      },
      {
        "internalType": "uint256",
        "name": "initialSupply",
        "type": "uint256"
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
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
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
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
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
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
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
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
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
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
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
    "inputs": [],
    "name": "totalSupply",
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
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
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
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }];
const erc20Bytecode = "608060405234801562000010575f80fd5b5060405162000b8c38038062000b8c83398101604081905262000033916200029d565b8282600362000043838262000397565b50600462000052828262000397565b5050506200006733826200007060201b60201c565b50505062000485565b6001600160a01b0382166200009f5760405163ec442f0560e01b81525f60048201526024015b60405180910390fd5b620000ac5f8383620000b0565b5050565b6001600160a01b038316620000de578060025f828254620000d291906200045f565b90915550620001509050565b6001600160a01b0383165f9081526020819052604090205481811015620001325760405163391434e360e21b81526001600160a01b0385166004820152602481018290526044810183905260640162000096565b6001600160a01b0384165f9081526020819052604090209082900390555b6001600160a01b0382166200016e576002805482900390556200018c565b6001600160a01b0382165f9081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051620001d291815260200190565b60405180910390a3505050565b634e487b7160e01b5f52604160045260245ffd5b5f82601f83011262000203575f80fd5b81516001600160401b0380821115620002205762000220620001df565b604051601f8301601f19908116603f011681019082821181831017156200024b576200024b620001df565b8160405283815260209250868385880101111562000267575f80fd5b5f91505b838210156200028a57858201830151818301840152908201906200026b565b5f93810190920192909252949350505050565b5f805f60608486031215620002b0575f80fd5b83516001600160401b0380821115620002c7575f80fd5b620002d587838801620001f3565b94506020860151915080821115620002eb575f80fd5b50620002fa86828701620001f3565b925050604084015190509250925092565b600181811c908216806200032057607f821691505b6020821081036200033f57634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111562000392575f81815260208120601f850160051c810160208610156200036d5750805b601f850160051c820191505b818110156200038e5782815560010162000379565b5050505b505050565b81516001600160401b03811115620003b357620003b3620001df565b620003cb81620003c484546200030b565b8462000345565b602080601f83116001811462000401575f8415620003e95750858301515b5f19600386901b1c1916600185901b1785556200038e565b5f85815260208120601f198616915b82811015620004315788860151825594840194600190910190840162000410565b50858210156200044f57878501515f19600388901b60f8161c191681555b5050505050600190811b01905550565b808201808211156200047f57634e487b7160e01b5f52601160045260245ffd5b92915050565b6106f980620004935f395ff3fe608060405234801561000f575f80fd5b5060043610610090575f3560e01c8063313ce56711610063578063313ce567146100fa57806370a082311461010957806395d89b4114610131578063a9059cbb14610139578063dd62ed3e1461014c575f80fd5b806306fdde0314610094578063095ea7b3146100b257806318160ddd146100d557806323b872dd146100e7575b5f80fd5b61009c610184565b6040516100a99190610554565b60405180910390f35b6100c56100c03660046105ba565b610214565b60405190151581526020016100a9565b6002545b6040519081526020016100a9565b6100c56100f53660046105e2565b61022d565b604051601281526020016100a9565b6100d961011736600461061b565b6001600160a01b03165f9081526020819052604090205490565b61009c610250565b6100c56101473660046105ba565b61025f565b6100d961015a36600461063b565b6001600160a01b039182165f90815260016020908152604080832093909416825291909152205490565b6060600380546101939061066c565b80601f01602080910402602001604051908101604052809291908181526020018280546101bf9061066c565b801561020a5780601f106101e15761010080835404028352916020019161020a565b820191905f5260205f20905b8154815290600101906020018083116101ed57829003601f168201915b5050505050905090565b5f3361022181858561026c565b60019150505b92915050565b5f3361023a85828561027e565b6102458585856102ff565b506001949350505050565b6060600480546101939061066c565b5f336102218185856102ff565b610279838383600161035c565b505050565b6001600160a01b038381165f908152600160209081526040808320938616835292905220545f198110156102f957818110156102eb57604051637dc7a0d960e11b81526001600160a01b038416600482015260248101829052604481018390526064015b60405180910390fd5b6102f984848484035f61035c565b50505050565b6001600160a01b03831661032857604051634b637e8f60e11b81525f60048201526024016102e2565b6001600160a01b0382166103515760405163ec442f0560e01b81525f60048201526024016102e2565b61027983838361042e565b6001600160a01b0384166103855760405163e602df0560e01b81525f60048201526024016102e2565b6001600160a01b0383166103ae57604051634a1406b160e11b81525f60048201526024016102e2565b6001600160a01b038085165f90815260016020908152604080832093871683529290522082905580156102f957826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258460405161042091815260200190565b60405180910390a350505050565b6001600160a01b038316610458578060025f82825461044d91906106a4565b909155506104c89050565b6001600160a01b0383165f90815260208190526040902054818110156104aa5760405163391434e360e21b81526001600160a01b038516600482015260248101829052604481018390526064016102e2565b6001600160a01b0384165f9081526020819052604090209082900390555b6001600160a01b0382166104e457600280548290039055610502565b6001600160a01b0382165f9081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161054791815260200190565b60405180910390a3505050565b5f6020808352835180828501525f5b8181101561057f57858101830151858201604001528201610563565b505f604082860101526040601f19601f8301168501019250505092915050565b80356001600160a01b03811681146105b5575f80fd5b919050565b5f80604083850312156105cb575f80fd5b6105d48361059f565b946020939093013593505050565b5f805f606084860312156105f4575f80fd5b6105fd8461059f565b925061060b6020850161059f565b9150604084013590509250925092565b5f6020828403121561062b575f80fd5b6106348261059f565b9392505050565b5f806040838503121561064c575f80fd5b6106558361059f565b91506106636020840161059f565b90509250929050565b600181811c9082168061068057607f821691505b60208210810361069e57634e487b7160e01b5f52602260045260245ffd5b50919050565b8082018082111561022757634e487b7160e01b5f52601160045260245ffdfea26469706673582212207efdf37de605761bda624751256f2d2f1cd91463f32cf64da84400c8f3b8dd1364736f6c63430008140033";

document.getElementById("createToken").addEventListener("click", async () => {
  const output = document.getElementById("output");
  output.textContent = "";

  if (!connected || !signer) {
    output.textContent = "⛔ لطفاً ابتدا کیف پول خود را متصل کنید.";
    return;
  }

  const name = document.getElementById("name").value.trim();
  const symbol = document.getElementById("symbol").value.trim();
  const supply = document.getElementById("supply").value.trim();
  const decimals = 18;

  if (!name || !symbol || !supply || isNaN(Number(supply))) {
    output.textContent = "⚠️ لطفاً تمام فیلدها را به‌درستی پر کنید (Supply باید عدد باشد).";
    return;
  }

  try {
    const totalSupply = ethers.parseUnits(supply, decimals);
    const factory = new ethers.ContractFactory(erc20ABI, erc20Bytecode, signer);
    const contract = await factory.deploy(name, symbol, totalSupply);

    output.textContent = `🚀 در حال انتشار...\nTX: ${contract.deploymentTransaction().hash}`;
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    output.textContent += `\n✅ قرارداد ساخته شد در آدرس: ${contractAddress}`;
  } catch (err) {
    output.textContent = `❌ خطا: ${err.message || err}`;
    console.error(err);
  }
});
