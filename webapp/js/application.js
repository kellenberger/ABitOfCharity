var openDonationModal = (function(donation_amount){
  var $modal = $(".modal#donation-modal");
  $modal.find("span.amount").text(donation_amount);
  var $form = $modal.find("form");
  $form.empty();
  $form.append("<input type='hidden' id='donation-amount' value='" + donation_amount + "'>")
  var number_of_charities = $(".organization-checkbox input:checked").length;
  var ether_per_percentage = donation_amount / 100;
  var share = Math.floor(100/number_of_charities);
  $(".organization-checkbox input:checked").each(function(i){
    var this_share = share;
    if(i < 100 % number_of_charities) this_share++;

    var html = "<div class='row'><div class='col xl2 s4 valign-wrapper'>" ;
    html += $(this).closest(".card").find(".card-title").text();
    html += "</div><div class='col s5 xl8'><p class='range-field'><input type='range' min='0' max='100' value='" + this_share + "'>"
    html += "<span class='thumb'><span class='value'></span></span>";
    html += "</p></div>";
    html += "<div class='col xl2 s3'><span class='row-amount'>";
    html += (this_share * ether_per_percentage).toFixed(donation_amount.countDecimals() + 2);
    html += "</span><img src='./images/ether_logo.png' class='small-ether-logo'></div></div>";

    $form.append(html);
  });

  var array_of_dom_elements = document.querySelectorAll("input[type=range]");
  M.Range.init(array_of_dom_elements);
  $modal.modal('open');
});

var updateEtherShare = (function(range){
  var donation_amount = parseFloat($(range).closest(".modal").find("input#donation-amount").val());
  var ether_per_percentage = donation_amount / 100;
  $(range).closest(".row").find(".row-amount").text((ether_per_percentage * $(range).val()).toFixed(donation_amount.countDecimals() + 2));
});

$(document).ready(function(){
  $('.sidenav').sidenav();
  $('.modal').modal();


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

  $("body").on("click", ".filter-row .chip", function(){
    var $this = $(this);
    $this.closest(".filter-row").find(".chip").removeClass("selected");
    $this.addClass("selected");
    var filter = $this.find("input").val();

    $(".organization-card").each(function(){
      var $col = $(this).closest(".col");

      if(filter == "all"){
        $col.show();
        $(this).find(".organization-checkbox input").prop("checked", true);
      } else {
        categories = $(this).attr('data-category').split(",");
        if(categories.includes(filter)){
          $col.show()
          $(this).find(".organization-checkbox input").prop("checked", true);
        } else {
          $col.hide();
          $(this).find(".organization-checkbox input").prop("checked", false);
        }
      }
    });
  });

  $("body").on("click", ".distribute-donation-button", function(){
    var donation_amount = parseFloat($(".donation-amount input").val());
    if(donation_amount <= 0) {
      M.toast({html: 'The donation amount needs to be greater than zero', classes: "error-toast"});
    } else if($(".organization-checkbox input:checked").length == 0){
      M.toast({html: 'You need to select at least one organization', classes: "error-toast"});
    } else {
      openDonationModal(donation_amount);
    }
  });

  $("body").on("input", "#donation-modal input[type='range']", function(){
    $modal = $(this).closest(".modal");

    var $locked = $modal.find("input.locked[type='range']");
    $(this).addClass("locked");

    if($modal.find("input[type='range']:not(.locked)").length == 0){
      $modal.find("input[type='range']").removeClass("locked");
      $(this).addClass("locked");
    }

    var $unlocked = $modal.find("input[type='range']:not(.locked)");

    var sum_of_ranges = 0;
    $modal.find("input[type='range']").each(function(){
      sum_of_ranges += parseInt($(this).val());
    });
    console.log(sum_of_ranges);

    var i = -1;
    while(sum_of_ranges > 100 && $unlocked.length > 0){
      i = (i+1) % $unlocked.length;
      $range = $unlocked.eq(i);
      if(parseInt($range.val()) > 0){
        $range.val(parseInt($range.val()) - 1);
        sum_of_ranges--;
      }
      $unlocked = $unlocked.filter(function(){
        return $(this).val() > 0;
      });
    }

    i = -1;
    while(sum_of_ranges > 100 && $locked.length > 0){
      i = (i+1) % $locked.length;
      $range = $locked.eq(i);
      if(parseInt($range.val()) > 0){
        $range.val(parseInt($range.val()) - 1);
        sum_of_ranges--;
      }
      $locked = $locked.filter(function(){
        return $(this).val() > 0;
      });
    }

    i = -1;
    while(sum_of_ranges < 100 && $unlocked.length > 0){
      i = (i+1) % $unlocked.length;
      $range = $unlocked.eq(i);
      $range.val(parseInt($range.val()) + 1);
      sum_of_ranges++;
    }

    i = -1;
    while(sum_of_ranges < 100 && $unlocked.length > 0){
      i = (i+1) % $locked.length;
      $range = $locked.eq(i);
      $range.val(parseInt($range.val()) + 1);
      sum_of_ranges++;
    }

    $modal.find("input[type='range']").each(function(){
        updateEtherShare(this);
    });
  });
});
