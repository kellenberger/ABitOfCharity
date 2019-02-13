pragma solidity ^0.5.1;

contract ABitOfCharity {

    struct Organization {
        string name;
        address payable addr;
    }

    address manager;
    Organization[] organizations;

    constructor() public {
        manager = msg.sender;
    }

    function addOrganization(string memory _name, address payable _addr) public{
        require(msg.sender == manager, "Only the owner of this contract can add an organization.");
        organizations.push(Organization(_name, _addr));
    }

    function donate() public payable {
        require(msg.value > 0);

        for(uint i = 0; i < organizations.length - 1; i++){
            organizations[i].addr.transfer(msg.value / organizations.length);
        }

        organizations[organizations.length-1].addr.transfer((msg.value / organizations.length) + (msg.value % organizations.length));
    }
}
