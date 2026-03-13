# 🔐 MultiSig Wallet

Hey there! Welcome to the **MultiSig Wallet** – your friendly neighborhood multi-signature wallet on the blockchain!

## What's This All About?

Tired of keeping all your crypto eggs in one basket (or worse, one private key)? This smart contract is your answer! 

The **MultiSig Wallet** is a Solidity-based smart contract that lets multiple people control a wallet together. Think of it like a bank account that requires multiple signatures on checks – nobody can move the money alone, but the right group can!

## Why You'll Love It 💖

- **Safety in Numbers** – Multiple owners mean multiple approvals needed before ANY transaction happens
- **Flexible Approval System** – Set your own number of required approvals (needs 2 out of 3? Done!)
- **Fair & Transparent** – Everyone can see what transactions are pending and who's approved them
- **Smart Execution** – Once enough people approve, the transaction automatically goes through

## How It Works

### The Setup
When you deploy the contract, you decide:
- **Who the owners are** (all the addresses that get a say)
- **How many approvals you need** (the majority rules!)

### The Flow
1. 💬 An owner **submits a transaction** (send money to this address)
2. ✅ Other owners **approve it** (vote yes!)
3. 🎯 Once you hit the required approvals, **it executes automatically**
4. 💸 The money gets sent – no takesie backsies!

## Features at a Glance

| Feature | What It Does |
|---------|-------------|
| `submitTransaction()` | Create a new transaction waiting for approval |
| `approveTransaction()` | Cast your vote to move money |
| `getOwners()` | See who runs this wallet |
| `getTransactionCount()` | Check how many transactions there are |

## Getting Started

### Prerequisites
- Solidity knowledge (or just vibes ✨)
- A blockchain network (Ethereum, Polygon, etc.)
- Some ETH for gas fees

### Deploying
```javascript
// When deploying, pass in:
const owners = ["0xAddress1", "0xAddress2", "0xAddress3"];
const requiredApprovals = 2; // At least 2 people need to approve

// Deploy the contract with these params
```

### Using the ABI
We've included the `ABI.js` file – this is basically the instruction manual for talking to the smart contract from your app. Use this to interact with the wallet programmatically!

## Example Scenario

**You and your friends run a DAO (Decentralized Autonomous Organization):**
- 👥 4 members, each with equal voting rights
- ⚙️ Set `requiredApprovals` to 3 (majority rules!)
- 💰 Anyone can submit a transaction
- ✍️ Any 3 members must approve it before it goes through
- 🎉 When the 3rd person clicks approve, boom – money transfers instantly!

---

## 🚀 How to Run & Use

### 🏠 Local Development
1. **Clone the Repo**:
   ```bash
   git clone https://github.com/DarsanV/MultiSig_wallet.git
   cd MultiSig_wallet
   ```
2. **Launch a Local Server**:
   Since the app uses JavaScript to load configuration files (like `ABI.js`), you must serve it through a web server.
   ```bash
   # Using npx (easiest if you have Node.js)
   npx -y serve .
   ```
3. **Open in Browser**:
   Navigate to `http://localhost:3000` (or the port specified by your server).

### 🔗 Connecting to the Blockchain
1. **MetaMask**: Ensure you have the MetaMask extension installed and set to your target network (Mainnet, Sepolia, or local Ganache/Hardhat).
2. **Contract Address**: In the app's initial screen, enter the address of your deployed `MultiSigWallet` contract.
3. **Connect**: Click **Connect Wallet** to link your address.

### 💸 Managing Transactions
- **Submit**: Use the "Submit Transaction" card to propose a transfer.
- **Approve**: Other owners can see pending proposals in the "Proposed Transactions" list and click **Approve**.
- **Execution**: The contract automatically executes the transfer as soon as the `requiredApprovals` threshold is reached!

---

## Safety Notes ⚠️

This is a basic implementation for learning! If you're deploying to mainnet with real money:
- Get a security audit
- Add more safeguards (daily limits, timeouts, etc.)
- Test extensively on testnet first
- Consider using battle-tested multisig solutions (like Gnosis Safe)

## Questions?

This code is pretty straightforward, but if something's confusing:
- Check the comments in `multisig_wallet.sol`
- Review the ABI structure in `ABI.js`
- Experiment on a testnet first!

---

**Happy hodling! 🚀**

*P.S. – Remember: With great power comes great responsibility. Guard your private keys like they're the last slice of pizza!*
