// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC3156FlashLender {
    function flashLoan(
        IERC3156FlashBorrower receiver,
        address token,
        uint256 amount,
        bytes calldata data
    ) external returns (bool);

    function flashFee(address token, uint256 amount) external view returns (uint256);
}
