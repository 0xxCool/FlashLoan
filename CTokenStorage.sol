// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CTokenStorage {
    mapping(address => uint256) public tokenBalances;

    function updateBalance(address token, uint256 amount) external {
        tokenBalances[token] = amount;
    }

    function getBalance(address token) external view returns (uint256) {
        return tokenBalances[token];
    }
}
