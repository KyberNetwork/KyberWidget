(function () {

    function getWidgetUrl() {
        var url = new URLSearchParams(location.search).get("widget_url");
        return url || "https://developer.kyber.network/widget/payment";

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
        var data = [], error = [], msg, name, value;
        form.querySelectorAll("input, select").forEach(function (node) {

            if (node.type && node.type === 'radio' && !node.checked) return;

            // do simple validation
            name = node.getAttribute("name");
            if (!node.checkValidity()) {
                msg = node.getAttribute("message") || ("Invalid input for: " + name);
                node.setAttribute("title", msg);
                error.push(msg);
                return;
            } else {
                node.removeAttribute("title");
            }

            // set name - value
            if (node.type && node.type === 'checkbox') {
                value = node.checked.toString();
            } else {
                value = node.value;
            }

            if (name && value) {
                if (name != "extraParams") {
                    data.push(name + "=" + encodeURIComponent(value));
                } else {
                    data.push(value);
                }
            }
        });

        return {
            error: error,
            data: data.join("&")
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
            var selector = document.querySelector(".tablink.active").getAttribute("data-tab") + " code";
            if (!copyClipboard(selector)) {
                alert("Copy failed. Please use browser's copy feature instead.");
            }
        });
    }

    var generateTag = debounce(function () {
        var formData = grabForm();
        if (formData.error && formData.error.length) {
            document.getElementById("widget").innerHTML = "<p class='error'>" +
                formData.error.join("<br>") + "</p>";
            document.getElementById("sourceHtml").textContent = "";
            return;
        }

        var isPopup = document.getElementById("modePopup").checked;
        var isFrame = document.getElementById("modeFrame").checked;

        var widgetBaseUrl = getWidgetUrl();
        var url = widgetBaseUrl + "?" + formData.data;
        var cssUrl = widgetBaseUrl + '/widget/v1.0/widget.css';
        var jsUrl = widgetBaseUrl + '/widget/v1.0/widget.js';
        var tagHtml = "<a href='" + url + "'\nclass='kyber-widget-button' ";
        tagHtml += "name='KyberWidget - Powered by KyberNetwork' title='Pay by tokens'\n";
        tagHtml += "target='_blank'>Pay by tokens</a>";

        var fullHtml = "<!-- Add this to the <head> tag -->\n<link rel='stylesheet' href='" + cssUrl + "'> \n\n";
        fullHtml += tagHtml;
        fullHtml += "\n\n<!-- Add this to the end of <body> tag -->\n<script async src='" + jsUrl + "'></script>"

        document.getElementById("widget").innerHTML = tagHtml;
        document.getElementById("sourceHtml").textContent = fullHtml;
        Prism.highlightElement(document.getElementById("sourceHtml"));

        if (window.kyberWidgetOptions && window.kyberWidgetOptions.register) {
            window.kyberWidgetOptions.register();
        }

    }, 50, false);


    generateTag();
    wireEvents();

})();
