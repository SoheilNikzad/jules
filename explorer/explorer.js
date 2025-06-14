const RPC="https://rpc.raakh.net";
const out=document.getElementById("output");

async function rpc(m,p=[]){
  const r=await fetch(RPC,{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",id:1,method:m,params:p})});
  return (await r.json()).result;
}

function fmtTS(hex){
  const d=new Date(parseInt(hex,16)*1000);
  return d.toLocaleString();
}

function renderTable(txs){
  if(!txs.length) return "<p>No transactions found.</p>";
  return `<table><thead><tr>
  <th>Block</th><th>Tx Hash</th><th>Time</th>
  <th>From</th><th>To</th><th>Value (ETH)</th><th>Status</th>
  </tr></thead><tbody>` +
    txs.map(tx=>{
      const vals=(parseInt(tx.value,16)/1e18).toFixed(6);
      const status=tx.receipt?.status==='0x1'?"success":"failed";
      return `<tr>
        <td>${parseInt(tx.blockNumber,16)}</td>
        <td>${tx.hash.slice(0,10)}...</td>
        <td>${fmtTS(tx.timestamp)}</td>
        <td>${tx.from}</td><td>${tx.to||'-'}</td>
        <td>${vals}</td>
        <td class="status-${status}">${status}</td>
      </tr>`;
    }).join("") +
    "</tbody></table>";
}

async function handleSearch(){
  const q=document.getElementById("query").value.trim().toLowerCase();
  const fromT=new Date(document.getElementById("from").value).getTime()/1000;
  const toT=new Date(document.getElementById("to").value).getTime()/1000;
  if(!q.startsWith("0x")) return out.innerHTML="❌ Invalid input";
  out.innerHTML="⏳ Searching...";
  if(q.length===66){
    const tx=await rpc("eth_getTransactionByHash",[q]);
    const rec=await rpc("eth_getTransactionReceipt",[q]);
    tx.receipt=rec;
    tx.timestamp=(await rpc("eth_getBlockByNumber",[tx.blockNumber,true])).timestamp;
    out.innerHTML=renderTable([tx]);
  } else {
    const latest=parseInt(await rpc("eth_blockNumber"),16);
    let acc=[];
    for(let i=latest; i>=0; i--){
      const blk=await rpc("eth_getBlockByNumber",["0x"+i.toString(16),true]);
      if(!blk) continue;
      const ts=parseInt(blk.timestamp,16);
      if(ts<fromT) break;
      if(ts>toT) continue;
      blk.transactions.forEach(tx=>{
        if(tx.from===q || tx.to===q){
          tx.receipt=null; acc.push(tx);
        }
      });
      out.innerHTML=`🔄 scanning block ${i}, found ${acc.length} tx(s)...`;
    }
    // fetch receipts + timestamp
    for(const tx of acc){
      const blk=await rpc("eth_getBlockByNumber",[tx.blockNumber,true]);
      tx.timestamp=blk.timestamp;
      tx.receipt=await rpc("eth_getTransactionReceipt",[tx.hash]);
    }
    out.innerHTML=renderTable(acc);
  }
}
