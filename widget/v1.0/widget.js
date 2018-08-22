(function (global, editionTag) {

  var BASE_URL = (function(editionTag) {
    var editions = {
      standard: "https://widget.knstats.com",
      etheremon: "https://widget-etheremon.knstats.com"
    }
    var path = null;

    var current = !editionTag ? null : 
      (editionTag.getAttribute("data-kyber-widget-edition") || editionTag.getAttribute("data-edition"));

    if (!editionTag || !current) {
      var button = document.querySelector(".kyber-widget-button");
      if (button && button.href) {
        path = button.href.split("?")[0];
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

    if (!current || !editions[current]) current = "standard";
    document.documentElement.setAttribute("data-kyber-widget-edition", current);
    return path || editions[current];
  })(editionTag);

  function closeWidget () {
    var overlay = document.getElementById("kyber-widget-overlay");
    if (overlay) {
      var body = document.body,
        oldValue = body.getAttribute("data-overflow") || null;
      body.style.overflow = oldValue;
      body.removeAttribute("data-overflow");
      overlay.remove();
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
      script.src = baseUrl + "/app.min.js?t=" + Date.now();
      document.body.appendChild(script);
    }
    // add CSS tag
    if (!document.getElementById("kyber-widget-css")) {
      var css = document.createElement("link");
      css.id = "kyber-widget-css";
      css.setAttribute("rel", "stylesheet")
      css.setAttribute("href", baseUrl + "/app.bundle.css?t=" + Date.now());
      document.head.appendChild(css);
    }
  }

  function register(selector) {
    selector = selector || ".kyber-widget-button";
    var hasDomMode = false;

    document.querySelectorAll(selector).forEach(function (tag) {

      var params = new URL(tag.href).searchParams;
      var mode = params.get("mode") || "tab";
      if (mode === "dom") hasDomMode = true;
      
      if (mode !== "dom" && mode !== "iframe") return;

      tag.addEventListener("click", function (e) {

        if (mode === 'dom' && global.kyberWidgetOptions.jsLoadError) {
          // error loadding js, just fallback to new tab mode
          return;
        }

        // js loading ok, disable new tab mode
        e.preventDefault();
        
        // remove old overlay, just to ensure
        closeWidget();

        // create a new overlay
        var overlay = document.createElement("DIV");
        overlay.id = "kyber-widget-overlay";
        overlay.addEventListener("click", function (e) {
          if (e.target === this) {
            closeWidget();
          }
        });

        var element = '';
        if (mode === 'dom') {
          // create the widget container
          element = document.createElement("DIV");
          element.id = "kyber-widget";
          element.classList.add("kyber-widget");
          // set widget attributes
          element.setAttribute("data-widget-attribute", "true");
          var entries = params.entries();
          for (var pair of entries) {
            element.setAttribute("data-widget-" + pair[0].replace(/([a-z])([A-Z])/g,
              '$1-$2'), decodeURIComponent(pair[1]));
          }
        } else {
          element = document.createElement("IFRAME");
          element.id = "kyber-widget-iframe";
          element.onload = function () {
            global.addEventListener("message", function(e){
              if (e.data === "CloseWidget") {
                closeWidget();
              }
            });
          };
          element.src = tag.href;
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

    if (hasDomMode) insertTags(BASE_URL);
  }

  global.kyberWidgetOptions = {
    onClose: closeWidget,
    register: register
  }

  register();

})(this, document.currentScript || document.getElementById("kyber-widget-edition") || document.documentElement);
