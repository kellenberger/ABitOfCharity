$(document).ready(function(){
  if (typeof web3 !== 'undefined') {
    web3js = new Web3(web3.currentProvider);
  } else {
    console.log('No web3? You should consider trying MetaMask!');
    web3js = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  }

  web3.eth.defaultAccount = web3.eth.accounts[0];

  var abiofContract = web3.eth.contract([{"constant":false,"inputs":[{"name":"_name","type":"string"},{"name":"_addr","type":"address"}],"name":"addOrganization","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"donate","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]);
  var abitofcharitycontract = abiofContract.at("0x04b6131b6d0d6ea56416edcd935391a9dbabc23b");

  // // call contract function
  // abitofcharitycontract.addOrganization("wwf", "0xe5cbe37DBDb7c2e4F442FAA9Fb223487c5A0c70d", function(){alert("it worked!")});
  //
  // // transfer ether
  // var getData = abitofcharitycontract.donate.getData();
  // web3.eth.sendTransaction({to: abitofcharitycontract.address, data: getData, value:web3.toWei("0.5", "ether")}, function(){alert("worked");});
});
