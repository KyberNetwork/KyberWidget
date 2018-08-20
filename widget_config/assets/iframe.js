(function (global, baseUrl) {
  function closeWidget() {
    var overlay = document.getElementById("kyber-widget-overlay");
    if (overlay) {
      document.body.style.overflow = null;
      overlay.remove();
    }
  }
  document.querySelectorAll(".kyber-widget-button").forEach(function (tag) {
    tag.addEventListener("click", function (e) {
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
          closeWidget();
        }
      });
      // create the iframe
      var iframe = document.createElement("IFRAME");
      iframe.id = "kyber-widget-iframe";
      iframe.onload = function () {
        iframe.contentWindow.kyberWidgetOptions = {
          onClose: closeWidget
        };
      }
      iframe.src = tag.href;
      // add the tags to body
      overlay.appendChild(iframe);
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
      // render the widget
      global.kyberWidgetInstance && global.kyberWidgetInstance.render();
    })
  });
})(this, "https://widget.knstats.com");
