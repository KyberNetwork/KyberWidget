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

  function wireEvents() {
    document.querySelectorAll(".action").forEach(function (tag) {
      tag.addEventListener("click", function (e) {

        var isPopup = document.getElementById("modePopup").checked;
        var isFrame = document.getElementById("modeFrame").checked;
        if (!isPopup && !isFrame) return;

        // error from last time's load -> fallback to new tab mode
        if (isPopup && window.kyberWidgetOptions.jsLoadError) return;

        // js loading ok, disable new tab mode
        e.preventDefault();

        // remove old overlay, just to ensure
        var oldOverlay = document.getElementById("kyber-widget-overlay");
        if (oldOverlay) {
          oldOverlay.remove();
        }

        // create a new overlay
        var overlay = document.createElement("DIV");
        overlay.id = "kyber-widget-overlay";
        overlay.addEventListener("click", function (e) {
          if (e.target === this) {
            window.kyberWidgetOptions.onClose();
          }
        });

        if (isPopup) {
          // create the widget container
          var popup = document.createElement("DIV");
          popup.id = "kyber-widget";
          popup.classList.add("kyber-widget");

          // set widget attributes
          popup.setAttribute("data-widget-attribute", "true");
          var params = new URL(tag.href).searchParams.entries();
          for (var pair of params) {
            popup.setAttribute("data-widget-" + pair[0].replace(/([a-z])([A-Z])/g, '$1-$2'), decodeURIComponent(pair[1]));
          }
          overlay.appendChild(popup);
        } else {
          // create the iframe
          var iframe = document.createElement("IFRAME");
          iframe.id = "kyber-widget-iframe";
          iframe.onload = function () {
            iframe.contentWindow.kyberWidgetOptions = { onClose: window.kyberWidgetOptions.onClose };
          }
          iframe.src = tag.href;
          overlay.appendChild(iframe);
        }

        // add the tags to body
        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";

        // render the widget
        isPopup && window.kyberWidgetInstance && window.kyberWidgetInstance.render();
      })
    });
  };

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

    document.querySelector(".options input").addEventListener("blur", function () {
      var callbackUrl = this.value || "";

      document.querySelectorAll(".action").forEach(function (tag) {
        var href = tag.getAttribute("data-href");
        href = href + "&callback=" + encodeURIComponent(callbackUrl);
        tag.href = href;
      })
    })

    wireEvents();

  })(monsters);

  (function init() {
    window.kyberWidgetOptions = {};
    window.kyberWidgetOptions.onClose = function () {
      var overlay = document.getElementById("kyber-widget-overlay");
      if (overlay) {
        document.body.style.overflow = null;
        overlay.remove();
      }
    }

    // add script tag
    if (!document.getElementById("kyber-widget-script")) {
      var script = document.createElement("script");
      script.id = "kyber-widget-script";
      script.async = true;
      script.onerror = function () {
        window.kyberWidgetOptions.jsLoadError = true;
        alert("Error loading KyberWidget.");
        window.kyberWidgetOptions.onClose();
      };
      script.onload = function () {
        document.getElementById("kyber-widget") && global.kyberWidgetInstance.render();
      };
      script.src = "https://widget-etheremon.knstats.com/app.min.js?t=" + Date.now();
      document.body.appendChild(script);
    }

    // add CSS tag
    if (!document.getElementById("kyber-widget-css")) {
      var css = document.createElement("link");
      css.id = "kyber-widget-css";
      css.setAttribute("rel", "stylesheet")
      css.setAttribute("href", "https://widget-etheremon.knstats.com/app.bundle.css?t=" + Date.now());
      document.head.appendChild(css);
    }
  })();

})(this);