// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SampleToken
 * @dev A basic ERC20 token implementation.
 * For a production-ready token, consider using OpenZeppelin's robust ERC20 contract.
 */
contract SampleToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _initialSupplyInSmallestUnit) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _initialSupplyInSmallestUnit; // Assign the already adjusted supply
        balanceOf[msg.sender] = totalSupply; // Mint initial supply to deployer
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != address(0), "ERC20: transfer to the zero address");
        require(balanceOf[_from] >= _value, "ERC20: transfer amount exceeds balance");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(allowance[_from][msg.sender] >= _value, "ERC20: transfer amount exceeds allowance");

        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }
}
