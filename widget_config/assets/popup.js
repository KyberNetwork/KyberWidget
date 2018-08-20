(function (global, baseUrl) {
  if (!global.kyberWidgetOptions) {
    global.kyberWidgetOptions = {};
    global.kyberWidgetOptions.onClose = function () {
      var overlay = document.getElementById("kyber-widget-overlay");
      var js = document.getElementById("kyber-widget-script");
      if (overlay) {
        document.body.style.overflow = null;
        overlay.remove();
      }
      if(js){
        js.remove();
      }
    }
  } // add script tag
  if (!document.getElementById("kyber-widget-script")) {
    var script = document.createElement("script");
    script.id = "kyber-widget-script";
    script.async = true;
    script.onerror = function () {
      global.kyberWidgetOptions.jsLoadError = true;
      console.log("Error loading KyberWidget.");
      global.kyberWidgetOptions.onClose();
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
  document.querySelectorAll(".kyber-widget-button").forEach(function (tag) {
    tag.addEventListener("click", function (e) {
      // error loadding js, just fallback to new tab mode
      if (global.kyberWidgetOptions.jsLoadError) return;
      // js loading ok, disable new tab mode
      e.preventDefault(); // remove old overlay, just to ensure
      var oldOverlay = document.getElementById("kyber-widget-overlay");
      if (oldOverlay) {
        oldOverlay.remove();
      }
      // create a new overlay
      var overlay = document.createElement("DIV");
      overlay.id = "kyber-widget-overlay";
      overlay.addEventListener("click", function (e) {
        if (e.target === this) {
          global.kyberWidgetOptions.onClose();
        }
      });
      // create the widget container
      var popup = document.createElement("DIV");
      popup.id = "kyber-widget";
      popup.classList.add("kyber-widget");
      // set widget attributes
      popup.setAttribute("data-widget-attribute", "true");
      var params = new URL(tag.href).searchParams.entries();
      for (var pair of params) {
        popup.setAttribute("data-widget-" + pair[0].replace(/([a-z])([A-Z])/g,
          '$1-$2'), decodeURIComponent(pair[1]));
      }
      // add the tags to body
      overlay.appendChild(popup);
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
      // render the widget
      global.kyberWidgetInstance && global.kyberWidgetInstance.render();
    })
  });
})(this, "https://widget.knstats.com");
