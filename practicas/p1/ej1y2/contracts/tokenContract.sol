// SPDX-License-Identifier: Unlicenced
pragma solidity 0.8.18;

contract TokenContract {

    address public owner;
    uint256 public contractEtherBalance;
    uint256 public constant TOKEN_PRICE = 5 ether;

    struct Receivers {
        string name;
        uint256 tokens;
    }

    mapping(address => Receivers) public users;

    modifier onlyOwner(){
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor(){
        owner = msg.sender;
        users[owner].tokens = 100;
    }

    function double(uint _value) public pure returns (uint){
        return _value * 2;
    }

    function register(string memory _name) public{
        users[msg.sender].name = _name;
    }

    function giveToken(address _receiver, uint256 _amount) public onlyOwner{
        require(users[owner].tokens >= _amount, "Not enough tokens available");
        users[owner].tokens -= _amount;
        users[_receiver].tokens += _amount;
    }

    function getTokensSender() public view returns (uint){
        return users[msg.sender].tokens;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        uint256 totalEtherRequired = _numberOfTokens * TOKEN_PRICE;
        require(msg.value == totalEtherRequired, "Incorrect Ether amount sent");
        require(users[owner].tokens >= _numberOfTokens, "Not enough tokens available for purchase");

        users[owner].tokens -= _numberOfTokens;
        users[msg.sender].tokens += _numberOfTokens;
        contractEtherBalance += msg.value;
    }

    function getContractEtherBalance() public view returns (uint256) {
        return contractEtherBalance;
    }
}
