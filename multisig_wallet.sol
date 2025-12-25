// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MultiSigWallet {
    address[] public owners;
    uint public requiredApprovals;

    struct Transaction {
        address to;
        uint value;
        bool executed;
        uint approvals;
    }

    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public approved;

    modifier onlyOwner() {
        bool isOwner = false;
        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == msg.sender) {
                isOwner = true;
            }
        }
        require(isOwner, "Not owner");
        _;
    }

    constructor(address[] memory _owners, uint _requiredApprovals) {
        require(_owners.length > 0, "No owners");
        require(_requiredApprovals > 0 && _requiredApprovals <= _owners.length, "Invalid approvals");
        owners = _owners;
        requiredApprovals = _requiredApprovals;
    }

    receive() external payable {}

    function submitTransaction(address _to, uint _value) public onlyOwner {
        transactions.push(Transaction({
            to: _to,
            value: _value,
            executed: false,
            approvals: 0
        }));
    }

    function approveTransaction(uint _txId) public onlyOwner {
        Transaction storage txn = transactions[_txId];
        require(!txn.executed, "Already executed");
        require(!approved[_txId][msg.sender], "Already approved");

        approved[_txId][msg.sender] = true;
        txn.approvals += 1;

        if (txn.approvals >= requiredApprovals) {
            executeTransaction(_txId);
        }
    }

    function executeTransaction(uint _txId) internal {
        Transaction storage txn = transactions[_txId];
        require(!txn.executed, "Already executed");
        require(txn.approvals >= requiredApprovals, "Not enough approvals");

        txn.executed = true;
        (bool success, ) = txn.to.call{value: txn.value}("");
        require(success, "Transfer failed");
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }
}
