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
    var target = this;
    return target.split(search).join(replacement);
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

    document.querySelector(".options input").addEventListener("blur", function () {
      var callbackUrl = this.value || "";

      document.querySelectorAll(".action").forEach(function (tag) {
        var href = tag.getAttribute("data-href");
        href = href + "&callback=" + encodeURIComponent(callbackUrl);
        tag.href = href;
      })
    })

  })(monsters);

  function getWidgetUrl() {
    var url = new URLSearchParams(location.search).get("widget_url");
    return url || "https://widget-etheremon.knstats.com";

  }

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this, args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };



  function runTemplateJS(baseUrl, scriptID) {
    var js = document.getElementById(scriptID).innerHTML.trim().replace("${baseUrl}", baseUrl);

    var script = document.createElement("script");
    script.className = "script";
    script.innerHTML = js;
    document.getElementsByTagName('body')[0].appendChild(script);
    return js;
  }
  function wireEvents() {
    var form = document.querySelector("form");
    form.querySelectorAll("input").forEach(function (node) {
      node.addEventListener('change', generateTag);
    });
  }
  function removeElementsByClass(className){
    var elements = document.getElementsByClassName(className);
    while(elements.length > 0){
      elements[0].parentNode.removeChild(elements[0]);
    }
  }
  function recreateNode(el, withChildren) {
    if (withChildren) {
      el.parentNode.replaceChild(el.cloneNode(true), el);
    }
    else {
      var newEl = el.cloneNode(false);
      while (el.hasChildNodes()) newEl.appendChild(el.firstChild);
      el.parentNode.replaceChild(newEl, el);
    }
  }
  var generateTag = debounce(function () {

    var isPopup = document.getElementById("modePopup").checked;
    var isFrame = document.getElementById("modeFrame").checked;

    var widgetBaseUrl = getWidgetUrl();
    var url = widgetBaseUrl;
    document.querySelectorAll(".action").forEach(function (tag) {
      recreateNode(tag);
    });
    removeElementsByClass("script");
    removeElementsByClass("ReactModalPortal");
    if (isPopup) {
      runTemplateJS(widgetBaseUrl, "widget_popup_js");
    } else if (isFrame) {
      runTemplateJS(widgetBaseUrl, "widget_iframe_js");
    }
  }, 50, false);
  generateTag();
  wireEvents();
})(this);
