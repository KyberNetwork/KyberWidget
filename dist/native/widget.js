(function (global) {
  var WIDGET_VERSION = "0.6.5";
  var incrementDeploy = 37;

  function getUrlParam(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function initKyberWidget() {
    function getCurrentScriptDir() {
      if (!document.currentScript || !document.currentScript.src) return null;

      var path = document.currentScript.src;
      return path.substring(0, path.lastIndexOf("/"));
    }

    global.kyberWidgetOptions = (function () {
      var params = new URLSearchParams(location.search);
      var editionTag = document.getElementById("kyber-widget-edition") || document.currentScript || document.documentElement;
      var editions = {
        standard: getCurrentScriptDir() || ("https://widget.kyber.network/v" + WIDGET_VERSION),
        etheremon: params.get("widget_url") || "https://etheremon.kyber.network"
      }

      var current = params.get("widget_edition") ||
        editionTag.getAttribute("data-kyber-widget-edition") ||
        editionTag.getAttribute("data-edition");
      if (!current || !editions[current]) {
        // invalid edition
        current = null;
      }

      var path = null;

      if (!current) {
        var button = document.querySelector(".kyber-widget-button");
        if (button && button.href) {
          path = button.href.split("?")[0].toLowerCase();
          if (path.substr(-1) === "/") {
            path = path.substr(0, path.length - 1);
          }
          for (var prop in editions) {
            if (path === editions[prop]) {
              current = prop;
              break;
            }
          }
        }
      }

      // set default version & path
      if (!current) current = "standard";
      path = path || editions[current];

      // store edition to DOM
      document.documentElement.setAttribute("data-kyber-widget-edition", current);

      return {
        edition: current,
        path: path
      }

    })();

    var closeWidget = global.kyberWidgetOptions.onClose = function () {
      var overlay = document.getElementById("kyber-widget-overlay");
      if (overlay) {
        var body = document.body,
          oldValue = body.getAttribute("data-overflow") || null;
        body.style.overflow = oldValue;
        body.removeAttribute("data-overflow");
        overlay.classList.add("hidden-overlay");

        setTimeout(function () {
          global.kyberWidgetInstance.destroy();
          overlay.remove();

          const onCloseCallBack = window.kyberWidgetOptions.onCloseCallBack;

          if (onCloseCallBack && typeof onCloseCallBack === "function") {
            onCloseCallBack()
          }
        }, 300);
      }
    }

    function insertTags(baseUrl) {
      if (!document.getElementById("kyber-widget-script")) {
        var script = document.createElement("script");
        script.id = "kyber-widget-script";
        script.async = true;
        script.onerror = function () {
          global.kyberWidgetOptions.jsLoadError = true;
          console.log("Error loading KyberWidget.");
          closeWidget();
        };
        script.onload = function () {
          document.getElementById("kyber-widget") && global.kyberWidgetInstance.render();
        };
        script.src = baseUrl + "/app.min.js?v=" + incrementDeploy;
        document.body.appendChild(script);
      }
      // add CSS tag
      if (!document.getElementById("kyber-widget-css")) {
        var css = document.createElement("link");
        css.id = "kyber-widget-css";
        css.setAttribute("rel", "stylesheet")
        css.setAttribute("href", baseUrl + "/app.css?v=" + incrementDeploy);
        document.head.appendChild(css);
      }
    }

    (global.kyberWidgetOptions.register = function (selector) {
      selector = selector || ".kyber-widget-button";
      var hasDomMode = false;
      var isStandardEdition = (global.kyberWidgetOptions.edition === "standard");
      var extensionInstalled = !!global.kyberwidget && !!global.kyberwidget.performPay;
      var shouldDelegate = false && extensionInstalled && isStandardEdition;

      document.querySelectorAll(selector).forEach(function (tag) {

        var params = tag.searchParams || (new URLSearchParams(new URL(tag.href).search));
        var mode = params.get("mode") || "tab";
        if (mode === "popup") hasDomMode = true;

        if (mode !== "popup" && mode !== "iframe") return;

        tag.addEventListener("click", function (e) {

          if (mode === 'popup' && global.kyberWidgetOptions.jsLoadError) {
            // error loadding js, just fallback to new tab mode
            return;
          }

          // js loading ok, disable new tab mode
          e.preventDefault();

          // remove old overlay, just to ensure
          closeWidget();

          // Delegate to KyberWidget extension if installed
          var paramObj = {};
          if (shouldDelegate) {
            for (var pair of params) {
              paramObj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            }
            global.kyberwidget.performPay(paramObj);
            return;
          }

          // create a new overlay
          var overlay = document.createElement("DIV");
          overlay.id = "kyber-widget-overlay";
          overlay.addEventListener("click", function (e) {
            if (e.target === this) {
              closeWidget();
            }
          });

          var element = '';
          var embeddedIframe = getUrlParam("embeddedIframe");
          var embeddedIframeClass = embeddedIframe === 'true' ? 'embedded-iframe' : false;

          if (mode === 'popup') {
            var productNames = [];
            var productQtys = [];
            var productImages = [];

            // create the widget container
            element = document.createElement("DIV");
            element.id = "kyber-widget";
            element.classList.add("kyber_widget");

            // set widget attributes
            element.setAttribute("data-widget-attribute", "true");

            for (var pair of params) {
              var name = decodeURIComponent(pair[0]).replace(/([a-z])([A-Z])/g, '$1-$2');
              var value = decodeURIComponent(pair[1]);

              if (name === 'product-Name') {
                productNames.push(value);
                continue;
              } else if (name === 'product-Qty') {
                productQtys.push(value);
                continue;
              } else if (name === 'product-Image') {
                productImages.push(value);
                continue;
              }

              element.setAttribute("data-widget-" + name, value);
            }

            if (productNames.length) {
              var products = generateProductDataAttribute(productNames, productQtys, productImages);
              element.setAttribute("data-widget-products", JSON.stringify(products));
            }
          } else {
            element = document.createElement("IFRAME");
            element.id = "kyber-widget-iframe";
            element.onload = function () {
              global.addEventListener("message", function (e) {
                if (e.data === "CloseWidget") {
                  closeWidget();
                }
              });
            };
            element.src = tag.href;
          }

          if (embeddedIframeClass) {
            element.classList.add(embeddedIframeClass);
          }

          // add the tags to body
          overlay.appendChild(element);
          document.body.appendChild(overlay);
          if (document.body.style.overflow) {
            document.body.setAttribute("data-overflow", document.body.style.overflow);
          }
          document.body.style.overflow = "hidden";

          // render the widget
          global.kyberWidgetInstance && global.kyberWidgetInstance.render();
        })
      });

      if (hasDomMode & !shouldDelegate) insertTags(global.kyberWidgetOptions.path);

    })();

    function generateProductDataAttribute(productNames, productQtys, productImages) {
      var products = [];

      for (var i = 0; i < productNames.length; i++) {
        var productQty = +productQtys[i] ? +productQtys[i] : 1;
        var productImage = productImages[i] ? productImages[i] : null;

        products.push({"name": productNames[i], "qty": productQty, "image": productImage})
      }

      return products;
    }

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initKyberWidget);
  } else {  // `DOMContentLoaded` already fired
    initKyberWidget();
  }

  global.addEventListener("message", function (e) {
    if (e.data.name === "Broadcasted") {
      global.kyberWidgetOptions.isBroadcasted = true;
      global.kyberWidgetOptions.txHash = e.data.txHash;
    }
  });

})(this);
