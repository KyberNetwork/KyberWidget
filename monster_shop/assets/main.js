(function () {

  var monsters = [
    {
      id: 106,
      name: "Ikopi",
      slug: "325db34365c36c186fd2217ace32591c"
    },
    {
      id: 109,
      name: "Purgast",
      slug: "49aede488f0a4e0f53371669a8d700b5"
    }
  ];

  var abi = [{ "constant": true, "inputs": [{ "name": "_classId", "type": "uint32" }], "name": "getPrice", "outputs": [{ "name": "catchable", "type": "bool" }, { "name": "price", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }];

  String.prototype.replaceAll = function (search, replacement) {
    return this.split(search).join(replacement);
  };

  function getPrice(instance, monsterId) {
    instance.getPrice(monsterId, function (err, value) {
      var price = value[1].div(Math.pow(10, 18)).toNumber();
      document.querySelector("#monster" + monsterId + " .price").textContent = price;
    })
  }

  (function geneteHtml(monsters) {

    var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io"));
    var instance = web3.eth.contract(abi).at("0x11f9f4ce02f3a4e2ae37f8dedf23e882fd67b2c0");

    var sampleHtml = document.getElementById("sampleItem").innerHTML;
    var allHtml = "";

    monsters.forEach(function (item) {
      var html = sampleHtml;
      for (var key in item) {
        html = html.replaceAll("#{" + key + "}", item[key]);
      }
      allHtml += html;

      getPrice(instance, item.id);
    })

    document.getElementById("list").innerHTML = allHtml;

    document.querySelectorAll(".action").forEach(function (tag) {
      tag.setAttribute("data-href", tag.href);
    })

    var clearEvents = function(tag) {
      var newTag = tag.cloneNode(true);
      tag.parentNode.replaceChild(newTag, tag);
    }

    var reflectHref = function () {
      var isPopup = document.getElementById("modePopup").checked;
      var isFrame = document.getElementById("modeFrame").checked;
      var mode = "tab";
      if (isFrame) mode = "iframe";
      if (isPopup) mode = "dom";
      var callbackUrl = document.getElementById("callbackUrl").value || "";

      document.querySelectorAll(".action").forEach(function (tag) {
        var href = tag.getAttribute("data-href");
        href = href += "&mode=" + mode;
        href = href + "&callback=" + encodeURIComponent(callbackUrl);
        tag.href = href;
        
        clearEvents(tag);
        if (window.kyberWidgetOptions && window.kyberWidgetOptions.register) {
          window.kyberWidgetOptions.register();
        }
      })
    }

    document.getElementById("callbackUrl").addEventListener("blur", reflectHref);
    document.querySelectorAll(".mode input[type='radio']").forEach(function (tag) {
      tag.addEventListener("change", reflectHref);
    });

  })(monsters);

})(this);