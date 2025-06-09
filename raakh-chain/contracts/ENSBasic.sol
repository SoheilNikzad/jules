// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ENSBasic
 * @dev A very basic Name Registry, similar to ENS, mapping strings to addresses.
 * This is a simplified version for demonstration purposes.
 */
contract ENSBasic {
    address public owner;
    mapping(string => address) private _records;

    event NameRegistered(string name, address indexed destination);
    event NameUnregistered(string name); // Optional: if you want to allow unregistering

    modifier onlyOwner() {
        require(msg.sender == owner, "ENSBasic: Caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Registers a name to point to a specific address.
     * Only the owner can register new names.
     * If a name is already registered, it will be overwritten.
     * @param name The name to register (e.g., "mywallet.eth").
     * @param destination The address the name should resolve to.
     */
    function register(string memory name, address destination) public onlyOwner {
        require(bytes(name).length > 0, "ENSBasic: Name cannot be empty");
        require(destination != address(0), "ENSBasic: Destination address cannot be the zero address");

        _records[name] = destination;
        emit NameRegistered(name, destination);
    }

    /**
     * @dev Resolves a name to an address.
     * @param name The name to resolve.
     * @return The address the name resolves to, or the zero address if not found.
     */
    function resolve(string memory name) public view returns (address) {
        return _records[name];
    }

    /**
     * @dev Transfers ownership of the contract to a new address.
     * Only the current owner can call this function.
     * @param newOwner The address of the new owner.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "ENSBasic: New owner cannot be the zero address");
        owner = newOwner;
    }

    /**
     * @dev Optional: Allows the owner to unregister a name.
     * @param name The name to unregister.
     */
    function unregister(string memory name) public onlyOwner {
        require(bytes(name).length > 0, "ENSBasic: Name cannot be empty");
        require(_records[name] != address(0), "ENSBasic: Name not found or already unregistered");

        delete _records[name];
        emit NameUnregistered(name);
    }
}
