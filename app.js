let provider;
let signer;
let contract;
let currentAddress;

// DOM Elements
const connectBtn = document.getElementById('connectWallet');
const startDAppBtn = document.getElementById('startDApp');
const contractInput = document.getElementById('contractAddress');
const connectionOverlay = document.getElementById('connectionOverlay');
const dashboard = document.getElementById('dashboard');

const walletBalance = document.getElementById('walletBalance');
const currentAccount = document.getElementById('currentAccount');
const approvalsNeeded = document.getElementById('approvalsNeeded');
const ownerList = document.getElementById('ownerList');

const txToInput = document.getElementById('txTo');
const txValueInput = document.getElementById('txValue');
const submitTxBtn = document.getElementById('submitTx');
const transactionList = document.getElementById('transactionList');

// MultiSig ABI (loaded via fetch)
let ABI;

async function init() {
    try {
        const response = await fetch('ABI.js');
        ABI = await response.json();
    } catch (err) {
        console.error("Could not load ABI.js:", err);
        alert("Make sure ABI.js exists in the root directory and is valid JSON.");
    }

    // Check for existing wallet connection
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
            handleAccountsChanged(accounts);
        }
    }
}

async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            handleAccountsChanged(accounts);
        } catch (err) {
            console.error(err);
        }
    } else {
        alert('Please install MetaMask!');
    }
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        currentAddress = null;
        connectBtn.innerText = "Connect Wallet";
        dashboard.classList.add('hidden');
        connectionOverlay.classList.remove('hidden');
    } else {
        currentAddress = accounts[0];
        signer = provider.getSigner();
        connectBtn.innerText = `${currentAddress.substring(0, 6)}...${currentAddress.substring(38)}`;
        currentAccount.innerText = currentAddress;
    }
}

async function startDashboard() {
    const address = contractInput.value.trim();
    if (!ethers.utils.isAddress(address)) {
        alert("Please enter a valid contract address!");
        return;
    }

    try {
        contract = new ethers.Contract(address, ABI, signer);
        
        // Test connection
        await contract.getOwners();
        
        // Hide overlay, show dashboard
        connectionOverlay.classList.add('hidden');
        dashboard.classList.remove('hidden');
        
        loadDashboardData();
        // Poll for updates every 10 seconds
        setInterval(loadDashboardData, 10000);
    } catch (err) {
        console.error(err);
        alert("Failed to connect to contract. Make sure the address is correct and you're on the right network!");
    }
}

async function loadDashboardData() {
    if (!contract) return;

    try {
        // Balance
        const balance = await provider.getBalance(contract.address);
        walletBalance.innerText = `${ethers.utils.formatEther(balance)} ETH`;

        // Owners & Required Approvals
        const owners = await contract.getOwners();
        const required = await contract.requiredApprovals();
        
        ownerList.innerHTML = owners.map(o => `<div>${o}</div>`).join('');
        approvalsNeeded.innerText = required.toString();

        // Transactions
        loadTransactions();
    } catch (err) {
        console.error("Error loading dashboard:", err);
    }
}

async function loadTransactions() {
    const count = await contract.getTransactionCount();
    transactionList.innerHTML = '';
    
    if (count.eq(0)) {
        transactionList.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">No transactions found yet.</div>';
        return;
    }

    // Load in reverse order (newest first)
    for (let i = count.toNumber() - 1; i >= 0; i--) {
        const tx = await contract.transactions(i);
        const hasApproved = currentAddress ? await contract.approved(i, currentAddress) : false;
        
        const txCard = document.createElement('div');
        txCard.className = 'tx-card fade-in';
        txCard.innerHTML = `
            <div class="tx-info">
                <div class="tx-id">Transaction #${i}</div>
                <div class="tx-dest">${tx.to}</div>
                <div class="tx-value">${ethers.utils.formatEther(tx.value)} ETH</div>
            </div>
            <div style="display: flex; align-items: center;">
                <span class="tx-status ${tx.executed ? 'status-executed' : 'status-pending'}">
                    ${tx.executed ? 'Executed' : `Pending (${tx.approvals} approvals)`}
                </span>
                ${(!tx.executed && !hasApproved) ? 
                    `<button class="approve-btn" onclick="approveTx(${i})">Approve</button>` : 
                    (hasApproved && !tx.executed ? '<span style="margin-left:1rem; font-size: 0.8rem; color: var(--success);">✓ Approved</span>' : '')
                }
            </div>
        `;
        transactionList.appendChild(txCard);
    }
}

async function submitProposal() {
    const to = txToInput.value.trim();
    const value = txValueInput.value;

    if (!ethers.utils.isAddress(to)) {
        alert("Invalid recipient address!");
        return;
    }
    if (!value || isNaN(value)) {
        alert("Invalid value!");
        return;
    }

    submitTxBtn.disabled = true;
    submitTxBtn.innerHTML = '<span class="loader"></span> Submitting...';

    try {
        const tx = await contract.submitTransaction(to, ethers.utils.parseEther(value));
        await tx.wait();
        alert("Transaction submitted for approval!");
        txToInput.value = '';
        txValueInput.value = '';
        loadDashboardData();
    } catch (err) {
        console.error(err);
        alert(err.message || "Failed to submit transaction.");
    } finally {
        submitTxBtn.disabled = false;
        submitTxBtn.innerHTML = 'Submit Proposal';
    }
}

async function approveTx(id) {
    try {
        const tx = await contract.approveTransaction(id);
        // Show immediate feedback
        const btn = event.target;
        btn.innerHTML = '<span class="loader"></span> Approving...';
        btn.disabled = true;
        
        await tx.wait();
        loadDashboardData();
    } catch (err) {
        console.error(err);
        alert(err.data?.message || err.message || "Approval failed.");
        loadDashboardData();
    }
}

// Event Listeners
connectBtn.addEventListener('click', connectWallet);
startDAppBtn.addEventListener('click', startDashboard);
submitTxBtn.addEventListener('click', submitProposal);

// Expose approveTx to global scope for onclick handlers
window.approveTx = approveTx;

// Init
init();
