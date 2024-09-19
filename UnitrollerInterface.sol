// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface UnitrollerInterface {
    function enterMarkets(address[] calldata cTokens) external returns (uint[] memory);
    function exitMarket(address cToken) external returns (uint);
    function checkAccountLiquidity(address account) external view returns (uint, uint, uint);
}
