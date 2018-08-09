(function () {

    var monsters = [

        {
            id: 109,
            name: "Purgast",
            slug: "49aede488f0a4e0f53371669a8d700b5"
        },

        {
            id: 106,
            name: "Ikopi",
            slug: "325db34365c36c186fd2217ace32591c"
        }

    ];

    var abi = [{ "constant": true, "inputs": [{ "name": "_classId", "type": "uint32" }], "name": "getPrice", "outputs": [{ "name": "catchable", "type": "bool" }, { "name": "price", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }];

    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
    };

    function getPrice(monsterId) {
        var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io"));
        var instance = web3.eth.contract(abi).at("0x11f9f4ce02f3a4e2ae37f8dedf23e882fd67b2c0");
        instance.getPrice(monsterId, function (err, value) {
            var price = value[1].div(Math.pow(10, 18)).toNumber();
            document.querySelector("#monster" + monsterId + " .price").textContent = price;
        })
    }

    (function geneteHtml(monsters) {
        var sampleHtml = document.getElementById("sampleItem").innerHTML;

        var allHtml = "";

        monsters.forEach(function (item) {
            var html = sampleHtml;
            for (var key in item) {
                html = html.replaceAll("#{" + key + "}", item[key]);
            }
            allHtml += html;

            getPrice(item.id);
        })

        document.getElementById("list").innerHTML = allHtml;

        document.querySelectorAll(".action").forEach(function (tag) {
            tag.setAttribute("data-href", tag.href);
        })

        document.querySelector(".options input").addEventListener("blur", function () {
            var callbackUrl = document.querySelector(".options input").value || "";

            document.querySelectorAll(".action").forEach(function (tag) {
                var href = tag.getAttribute("data-href");
                href = href + "&callback=" + encodeURIComponent(callbackUrl);
                tag.href = href;
            })
        })

    })(monsters);

})(this);
