var charity_accounts = [
  {name: "wwf", address: "0x6B6a8381e41a16f9B23f3E8EE7101e799016a26B"},
  {name: "greenpeace", address: "0xe5cbe37DBDb7c2e4F442FAA9Fb223487c5A0c70d"},
  {name: "unicef", address: "0x6B4F58663eBD4600F3ED65c220c18333c509C896"},
  {name: "charity_water", address: "0x8b508eC5faD13657beca20378C762800D5cFC6d7"},
  {name: "save_the_children", address: "0xb70C7A345Cb8B38975f6f09C78eDd939aa3375C8"},
  {name: "waterorg", address: "0x74083be1280E22Fd2f961008B0AcCd435FcA51b6"},
]

var DonationManager = {};

var setupWeb3 = (function(){
  $.getJSON( "abi/contractabi.json", function( data ) {
    if (typeof web3 !== 'undefined') {
      web3js = new Web3(web3.currentProvider);
    } else {
      console.log('No web3? You should consider trying MetaMask!');
      web3js = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }

    web3.eth.defaultAccount = web3.eth.accounts[0];

    var abiofContract = web3.eth.contract(data);
    var abitofcharitycontract = abiofContract.at("0x04b6131b6d0d6ea56416edcd935391a9dbabc23b");

    // for(var i=0; i < charity_accounts.length; i++){
    //   abitofcharitycontract.addOrganization(charity_accounts[i].name, charity_accounts[i].address, function(){return;});
    // }

    DonationManager.web3 = web3;
    DonationManager.contract = abitofcharitycontract;
  });
});

var donation = (function(amount){
  var getData = DonationManager.contract.donate.getData();
  DonationManager.web3.eth.sendTransaction({to: DonationManager.contract.address, data: getData, value:DonationManager.web3.toWei(amount.toString(), "ether")}, function(){M.toast({html: 'Successfully donated ' + amount + ' Ether', classes: "success-toast"});});
});


var distributedDonation = (function(amount, percentages){
  argument = [];
  for(var i=0; i < charity_accounts.length; i++){
    argument.push(0);
  }

  for(var i=0; i < percentages.length; i++){
    argument[percentages[i].id] = percentages[i].percentage;
  }

  var getData = DonationManager.contract.donatePerc.getData(argument);
  DonationManager.web3.eth.sendTransaction({to: DonationManager.contract.address, data: getData, value:DonationManager.web3.toWei(amount.toString(), "ether")}, function(){M.toast({html: 'Successfully donated ' + amount + ' Ether', classes: "success-toast"});});
});
