pragma solidity ^0.5.2;

import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-solidity/master/contracts/token/ERC20/ERC20.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-solidity/master/contracts/lifecycle/Pausable.sol";
import "./Ownable.sol";
contract ABitOfCharity is Pausable, Ownable {

    struct Organization {
        string name;
        address payable addr;
    }

    address owner;
    Organization[] organizations;

    constructor() public {
        owner = msg.sender;
    }

    function addOrganization(string memory _name, address payable _addr) public{//add an organization
        require(msg.sender == owner, "Only the owner of this contract can add an organization.");
        organizations.push(Organization(_name, _addr));
    }

    function removeOrganization(string memory _name) public{//remove organization
        require(msg.sender == owner, "Only the owner of this contract can remove an organization.");
        bool rightName=false;
        for(uint i = 0; i < organizations.length; i++){
            if(stringsEqual(_name,organizations[i].name)){
                remove(i);
                rightName=true;
                break;
            }
        }
        require(rightName,"Organization not existing");
    }

    function stringsEqual(string memory _a, string storage _b) internal pure returns (bool) {//compare strings (of type memory and storage)
        bytes memory a = bytes(_a);
        bytes memory b = bytes(_b);
        if (a.length != b.length)
            return false;
        for (uint i = 0; i < a.length; i++)
            if (a[i] != b[i])
                return false;
        return true;
    }

    function remove(uint index) internal {//remove organization at certain index
        if (index >= organizations.length) return;

        for (uint i = index; i<organizations.length-1; i++){
            organizations[i] = organizations[i+1];
        }
        delete organizations[organizations.length-1];
        organizations.length--;

    }

    function donate() public payable {//donates ether by equally splitting among all organizations
        require(msg.value > 0);

        require(organizations.length>=1,"No organizations added.");

        for(uint i = 0; i < organizations.length - 1; i++){
            organizations[i].addr.transfer(msg.value / organizations.length);
        }

        organizations[organizations.length-1].addr.transfer((msg.value / organizations.length) + (msg.value % organizations.length));
    }


    function donate(uint[] memory _percentages) public payable {//donates ether by passing an array of integers that represents the percentages allocated to a certain org.
        require(msg.value > 0);
        require(organizations.length>=1,"No organizations added.");
        require(organizations.length==_percentages.length, "Wrong number of organizations.");

        //check that it sums up to 100
        uint percentage=0;
        for(uint i = 0; i < organizations.length; i++){
            percentage+=_percentages[i];
        }
        require(percentage==100, "Total percentage must be 100%.");

        for(uint i = 0; i < organizations.length; i++){
            if(_percentages[i]>0){
                organizations[i].addr.transfer((msg.value / 100) *_percentages[i]);
            }
        }

    }

    function kill() public {
        require(msg.sender == owner, "Only the owner of this contract can kill it.");
        selfdestruct(address(uint160(owner)));

    }


    //----------------------------------------------------------------------------//
    //Based on openzeppelin-solidity
    /**
    * @dev Details of each transfer * @param contract_ contract address of ER20 token to transfer * @param to_ receiving account * @param amount_ number of tokens to transfer to_ account * @param failed_ if transfer was successful or not */
    struct Transfer {
        address contract_;
        address to_;
        uint amount_;
        bool failed_;
     }

    /**
    * @dev a mapping from transaction ID's to the sender address * that initiates them. Owners can create several transactions */
    mapping(address => uint[]) public transactionIndexesToSender;

    /**
    * @dev a list of all transfers successful or unsuccessful */
    Transfer[] public transactions;


    /**
    * @dev list of all supported tokens for transfer * @param string token symbol * @param address contract address of token */
    mapping(bytes32 => address) public tokens;

    ERC20 public ERC20Interface;

    /**
    * @dev Event to notify if transfer successful or failed * after account approval verified */
    event TransferSuccessful(address indexed from_, address indexed to_, uint256 amount_);

    event TransferFailed(address indexed from_, address indexed to_, uint256 amount_);


    /**
     * @dev add address of token to list of supported tokens using * token symbol as identifier in mapping */
    function addNewToken(bytes32 symbol_, address address_) public onlyOwner returns (bool) {
        tokens[symbol_] = address_;
        return true;
     }

    /**
     * @dev remove address of token we no more support */
    function removeToken(bytes32 symbol_) public onlyOwner returns (bool) {
        delete(tokens[symbol_]);
        return true;
        }

      /**
     * @dev method that handles transfer of ERC20 tokens to other address * it assumes the calling address has approved this contract * as spender * @param symbol_ identifier mapping to a token contract address * @param to_ beneficiary address * @param amount_ numbers of token to transfer */
    function transferTokens(bytes32 symbol_, address to_, uint256 amount_) public whenNotPaused{
        require(amount_ > 0);
        address contract_ = tokens[symbol_];
        address from_ = msg.sender;

        ERC20Interface = ERC20(contract_);

        uint256 transactionId = transactions.push(
            Transfer({
                contract_:  contract_,
                to_: to_,
                amount_: amount_,
                failed_: true
            })
        );
        transactionIndexesToSender[from_].push(transactionId - 1);

        if(amount_ > ERC20Interface.allowance(from_, address(this))) {
            emit TransferFailed(from_, to_, amount_);
            revert();
        }
        ERC20Interface.transferFrom(from_, to_, amount_);

        transactions[transactionId - 1].failed_ = false;

        emit TransferSuccessful(from_, to_, amount_);
    }
      /**
     * @dev allow contract to receive funds */

      /**
     * @dev withdraw funds from this contract * @param beneficiary address to receive ether */
    function withdraw(address payable beneficiary) public payable onlyOwner whenNotPaused {
        beneficiary.transfer(address(this).balance);
    }


    function donateTokens(bytes32 symbol_, uint256 amount_) public{
        require(amount_ > 0);

        require(organizations.length>=1,"No organizations added.");

        for(uint i = 0; i < organizations.length - 1; i++){
            transferTokens(symbol_, organizations[i].addr, amount_/organizations.length);
        }

        transferTokens(symbol_,organizations[organizations.length-1].addr,(amount_ / organizations.length) + (amount_ % organizations.length));
    }

    function donateTokens(bytes32 symbol_, uint256 amount_,uint[] memory _percentages) public{
        require(amount_ > 0);
        require(organizations.length>=1,"No organizations added.");
        require(organizations.length==_percentages.length, "Wrong number of organizations.");

        //check that it sums up to 100
        uint percentage=0;
        for(uint i = 0; i < organizations.length; i++){
            percentage+=_percentages[i];
        }
        require(percentage==100, "Total percentage must be 100%.");

        for(uint i = 0; i < organizations.length; i++){
            transferTokens(symbol_, organizations[i].addr, (amount_/100)*_percentages[i]);
        }

    }




}
