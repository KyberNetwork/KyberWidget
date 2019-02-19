(function () {
  var excludedInput = ["version"];
  var defaultVersion = document.getElementById("selected-version").innerText;
  var NO_VERSION = "no";
  var STABLE_COINS = ['DAI', 'WBTC'];
  var activeTheme = "theme-emerald";
  var currentNetwork = document.getElementById('widget-network').value;
  var currentTokens = [];

  async function fetchTokens(network) {
    try {
      document.getElementById('token-list').innerHTML = '<img class="widget-config__loading-icon" src="assets/images/icon-loading.gif"/>';

      const response = await fetch(`https://${network === "ropsten" ? network + '-' : ''}api.kyber.network/internal/currencies`);
      const tokenResponse = await response.json();
      const tokens = tokenResponse.data;

      // Sort stable coins on the top
      tokens.unshift(tokens.splice(tokens.findIndex(item => STABLE_COINS.includes(item.symbol)), 1)[0]);

      currentTokens = tokens;

      renderTokenList(tokens);
    } catch (error) {
      alert('Errors occurred on fetching tokens from API: ' + error)
    }
  }

  function renderTokenList(tokens) {
    let tokenListHtml = '';

    for (let i in tokens) {
      const tokenSymbol = tokens[i].symbol;
      const tokenName = tokens[i].name;

      tokenListHtml += `
          <div class="widget-config__dropdown-token" data-token-symbol="${tokenSymbol}">
            <span class="widget-config__dropdown-symbol" data-token-symbol="${tokenSymbol}">${tokenSymbol}</span>
            <span class="widget-config__dropdown-name" data-token-symbol="${tokenSymbol}">${STABLE_COINS.includes(tokenSymbol) ? 'Stable Coin': tokenName}</span>
          </div>
        `
    }

    document.getElementById('token-list').innerHTML = tokenListHtml;
  }

  function getUrlParam(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function getWidgetUrl() {
    var url = getUrlParam("widget_url")  || "https://widget.kyber.network";

    var version = getUrlParam("version");

    if (version !== NO_VERSION) {
      version = "/v" + (version || defaultVersion);
    } else {
      version = "";
    }

    return url + version;
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

  function grabForm() {
    var form = document.querySelector("form");
    var type = form.type.value || "pay";
    var receiveAddr = form.receiveAddr,
      receiveToken = form.receiveToken,
      buttonText = "Swap tokens";
    var data = [], error = [], msg, name, value;

    form.querySelectorAll("input, select").forEach(function (node) {
      name = node.getAttribute("name");

      if ((node.type && node.type === 'radio' && !node.checked) || excludedInput.indexOf(name) > -1) return;

      node.classList.remove("invalid");
      node.removeAttribute("title");

      if (!node.hasAttribute("data-type-" + type) && !node.checkValidity()) {
        msg = node.getAttribute("message") || ("Invalid input for: " + name);
        node.setAttribute("title", msg);
        error.push(msg);
        return;
      }

      // set name - value
      if (node.type && node.type === 'checkbox') {
        value = node.checked.toString();
      } else if (node.hasAttribute("data-type-" + type)) {
        value = node.getAttribute("data-type-" + type);
      } else {
        value = node.value;
      }

      if (name && value) {
        if (name != "extraParams") {
          form.setAttribute("data-widget-" + name, value);
          data.push(name + "=" + encodeURIComponent(value));
        } else {
          data.push(value);
        }
      }
    });

    // some integration checks

    if (type === "pay") {
      buttonText = "Pay with tokens";
      if (!receiveAddr.value) {
        receiveAddr.classList.add("invalid");
        msg = "Recipient Address is required for widget type of 'Pay'.";
        receiveAddr.setAttribute("title", msg);
        error.push(msg);
      }
      if (!receiveToken.value) {
        receiveToken.classList.add("invalid");
        msg = "Receiving Token Symbol is required for widget type of 'Pay'.";
        receiveToken.setAttribute("title", msg);
        error.push(msg);
      }
    }

    if (type === "buy") {
      buttonText = "Buy token";
      if (!receiveToken.value) {
        receiveToken.classList.add("invalid");
        msg = "Receiving Token Symbol is required for widget type of 'Buy'.";
        receiveToken.setAttribute("title", msg);
        error.push(msg);
      }
    }

    data.push("theme=" + activeTheme);

    return {
      error: error,
      data: data.join("&"),
      buttonText: buttonText
    }
  }

  function copyClipboard(selector) {
    var input = document.querySelector(selector).textContent;
    var aux = document.createElement("input");
    aux.setAttribute("value", input);
    document.body.appendChild(aux);
    aux.select();
    var result=document.execCommand("copy");
    document.body.removeChild(aux);
    return result;
  }

  function wireEvents() {
    var form = document.querySelector("form");
    form.querySelectorAll("input, select").forEach(function (node) {
      node.addEventListener('change', generateTag);
      node.addEventListener('keyup', generateTag);
      node.addEventListener('paste', function () {
        setTimeout(generateTag, 0);
      });
    });

    document.querySelector(".btn-copy").addEventListener('click', function(){
      var selector = document.getElementById("defaultOpen").getAttribute("data-tab") + " code";
      if (!copyClipboard(selector)) {
        alert("Copy failed. Please use browser's copy feature instead.");
        return;
      }

      var sourceContent = document.getElementById("sourceContent");

      sourceContent.classList.add("active");

      setTimeout(function() {
        sourceContent.classList.remove("active");
      }, 3000);
    });

    // For Modal
    document.querySelector("[data-modal-id]").addEventListener("click", openModal);
    document.querySelector(".kyber-modal__close-btn").addEventListener("click", function() {
      closeModal();
    });
    document.querySelector(".kyber-overlay, .kyber-modal__close-btn").addEventListener("click", function(e) {
      if(e.target.nodeName.toLowerCase() === "a") return;
      closeModal();
    });
    document.querySelector(".kyber-modal").addEventListener("click", function(e) {
      if(e.target.nodeName.toLowerCase() === "a") return;
      e.stopPropagation();
    });

    document.querySelectorAll(".widget-config__select.version").forEach(function (item) {
      item.addEventListener("click", function () {
        this.classList.toggle("active");
      })
    });

    document.querySelectorAll(".widget-config__select.version .widget-config__select-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var version = this.getAttribute("data-version");
        var params = new URLSearchParams(location.search);

        params.set("version", version);

        window.location.search = params.toString();
      })
    });

    document.querySelectorAll(".widget-config__theme-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var theme = this.getAttribute("data-theme");
        var body = document.querySelector(".widget-config__body");

        document.querySelector(".widget-config__theme-item.active").classList.remove("active");
        this.classList.add("active");
        body.className = "widget-config__body " + theme;
        activeTheme = theme;
      })
    });

    document.getElementById("widget-html-source").addEventListener("click", function () {
      generateTag();
    });

    document.querySelectorAll(".widget-config__theme-item").forEach(function (item) {
      item.addEventListener("click", function () {
        generateTag();
      })
    });

    document.querySelectorAll(".widget-config__dropdown-trigger").forEach(function (item) {
      item.addEventListener("click", function () {
        var network = document.getElementById('widget-network').value;

        if (network === "test" || network === "ropsten") {
          network = "ropsten";
        } else if (network === "production" || network === "mainnet") {
          network = "";
        }

        if (network !== currentNetwork) {
          currentNetwork = network;
          fetchTokens(currentNetwork);
        }

        this.classList.toggle("active");
      })
    });

    document.getElementById("token-list").addEventListener("click",function(e) {
      if (e.target && e.target.matches(".widget-config__dropdown-token, .widget-config__dropdown-symbol, .widget-config__dropdown-name")) {
        const tokenSymbol =  e.target.getAttribute("data-token-symbol");
        const $tokenTrigger = document.getElementById('token-trigger');

        document.getElementById('dest-token').value = tokenSymbol;
        $tokenTrigger.innerText = tokenSymbol;
        $tokenTrigger.classList.remove("active");
        generateTag();
      }
    });

    document.getElementById("widget-config__token-search").addEventListener("keyup", function() {
      const value = this.value.toLowerCase();

      if (!currentTokens.length) return;

      if (!value) {
        renderTokenList(currentTokens);
        return;
      }

      const filteredTokens = currentTokens.filter(function (token) {
        return token.symbol.toLowerCase().includes(value) || token.name.toLowerCase().includes(value)
      });

      renderTokenList(filteredTokens);
    });
  }

  var generateTag = debounce(function () {
    var formData = grabForm();
    var codeBtn = document.querySelector(".widget-config__btn");

    if (formData.error && formData.error.length) {
      document.getElementById("widget").innerHTML = "<div class='error'>" +
        formData.error.join("<br>") + "</div>";
      document.getElementById("sourceHtml").textContent = "";
      codeBtn.classList.add("widget-config__btn--disabled");
      return;
    }

    codeBtn.classList.remove("widget-config__btn--disabled");

    var mode = document.querySelector("form").mode.value || "tab";
    var widgetBaseUrl = getWidgetUrl();
    var url = widgetBaseUrl + "/?" + formData.data;
    var cssUrl = widgetBaseUrl + '/widget.css';
    var jsUrl = widgetBaseUrl + '/widget.js';
    var tagHtml = "<!-- This is the '" + formData.buttonText + "' button, place it anywhere on your webpage -->\n";
    tagHtml += "<!-- You can add multiple buttons into a same page -->\n";
    tagHtml += "<a href='" + url + "'\nclass='kyber-widget-button " + activeTheme + "' ";
    tagHtml += "name='KyberWidget - Powered by KyberNetwork' title='Pay with tokens'\n";
    tagHtml += "target='_blank'>" + formData.buttonText + "</a>";

    var fullHtml = "<!-- Add this to the <head> tag -->\n<link rel='stylesheet' href='" + cssUrl + "'> \n\n";
    fullHtml += tagHtml;
    if (mode !== "tab") {
      fullHtml += "\n\n<!-- Add this to the end of <body> tag -->\n<script async src='" + jsUrl + "'></script>"
    }

    document.getElementById("widget").innerHTML = tagHtml;
    document.getElementById("sourceHtml").textContent = fullHtml;
    Prism.highlightElement(document.getElementById("sourceHtml"));

    if (window.kyberWidgetOptions && window.kyberWidgetOptions.register) {
      window.kyberWidgetOptions.register();
    }

  }, 50, false);

  function insertWidgetFiles() {
    var widgetUrl = getWidgetUrl();

    var head = document.head;
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = widgetUrl + "/widget.css?t=" + Date.now();
    head.appendChild(link);

    var body = document.body;
    var script = document.createElement("script");
    script.src = widgetUrl + "/widget.js?t=" + Date.now();
    body.appendChild(script);
  }

  function setupVersion() {
    var widgetUrlParam = getUrlParam("widget_url");
    var version = getUrlParam("version");

    if (widgetUrlParam && version === NO_VERSION) {
      document.getElementById("version-selector").style.display = "none";
    } else {
      document.getElementById("selected-version").innerText = version || defaultVersion;
    }
  }

  function openModal() {
    var modalId = this.getAttribute("data-modal-id");
    document.querySelector(".kyber-overlay").classList.add("kyber-overlay--active");
    document.getElementById(modalId).classList.add("kyber-modal--active");
    document.body.classList.add("no-scroll");
  }

  function closeModal() {
    document.querySelector(".kyber-overlay").classList.remove("kyber-overlay--active");
    document.querySelector(".kyber-modal").classList.remove("kyber-modal--active");
    document.body.classList.remove("no-scroll");
  }

  function checkStandalone() {
    if (window === window.parent) {
      document.documentElement.classList.add("standalone");
    }
  }

  checkStandalone();
  insertWidgetFiles();
  generateTag();
  wireEvents();
  setupVersion();
  fetchTokens("ropsten");
})();
