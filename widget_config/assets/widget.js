function getParams(url) {
  var params = {};
  var match = url.match(/\?(.*)$/);

  if (match && match[1]) {
    match[1].split('&').forEach(function (pair) {
      pair = pair.split('=');
      params[pair[0]] = pair[1];
    });
  }
  return params;
};

function getMode() {
  var kyber_widget_button = document.getElementsByClassName("kyber-widget-button")[0];
  var queryParams = getParams(kyber_widget_button.href);
  return queryParams;
}

function closeWidget(mode) {
  var overlay = document.getElementById("kyber-widget-overlay");

  if (overlay) {
    document.body.style.overflow = null;
    overlay.remove();
  }
  if(mode ==='dom'){
    var js = document.getElementById("kyber-widget-script");
    if(js){
      js.remove();
    }
  }
}
(function (global, baseUrl) {
  var queryParams = getMode();

  if ('mode' in queryParams & (queryParams.mode === 'dom' || queryParams.mode === 'iframe')) {
    if (queryParams.mode === 'dom' ) {

      if (!global.kyberWidgetOptions) {
        global.kyberWidgetOptions = {};
      } // add script tag
      if (!document.getElementById("kyber-widget-script")) {
        var script = document.createElement("script");
        script.id = "kyber-widget-script";
        script.async = true;
        script.onerror = function () {
          global.kyberWidgetOptions.jsLoadError = true;
          console.log("Error loading KyberWidget.");
          // global.kyberWidgetOptions.onClose();
          closeWidget(queryParams.mode);
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
    document.querySelectorAll(".kyber-widget-button").forEach(function (tag) {
      tag.addEventListener("click", function (e) {
        if(queryParams.mode === 'dom' && global.kyberWidgetOptions.jsLoadError){
          // error loadding js, just fallback to new tab mode
          return;
          // js loading ok, disable new tab mode
        }
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
              closeWidget(queryParams.mode);
          }
        });
        var element = '';
        if(queryParams.mode === 'dom'){
          // create the widget container
          element = document.createElement("DIV");
          element.id = "kyber-widget";
          element.classList.add("kyber-widget");
          // set widget attributes
          element.setAttribute("data-widget-attribute", "true");
          var params = new URL(tag.href).searchParams.entries();
          for (var pair of params) {
            element.setAttribute("data-widget-" + pair[0].replace(/([a-z])([A-Z])/g,
              '$1-$2'), decodeURIComponent(pair[1]));
          }
        }else if(queryParams.mode === 'iframe'){
          element = document.createElement("IFRAME");
          element.id = "kyber-widget-iframe";
          element.onload = function () {
            element.contentWindow.kyberWidgetOptions = {
              onClose: closeWidget
            };
          };
          element.src = tag.href;
        }
        // add the tags to body
        overlay.appendChild(element);
        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";
        // render the widget
        global.kyberWidgetInstance && global.kyberWidgetInstance.render();
      })
    });
  }

})(this, "https://widget.knstats.com");
