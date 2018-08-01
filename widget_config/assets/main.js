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
        var form = document.querySelector(".params");
        var data = [], error = [], msg, name, value;
        form.querySelectorAll("input, select").forEach(function (node) {

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
                value = node.checked;
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
        var input = document.querySelector(selector); // input, textarea, contenteditable
        input.removeAttribute("disabled");
        input.select();

        var result = document.execCommand("copy", true);
        input.setAttribute("disabled", "disabled");

        return result;
    }

    function wireEvents() {
        var form = document.querySelector(".params");
        form.querySelectorAll("input, select").forEach(function (node) {
            node.addEventListener('change', generateTag);
            node.addEventListener('keyup', generateTag);
            node.addEventListener('paste', function () {
                setTimeout(generateTag, 0);
            });
        });

        document.querySelectorAll(".btn-copy").forEach(function (btn){
            btn.addEventListener('click', function(){
                if (!copyClipboard(this.getAttribute("data-copy-target"))) {
                    alert("Copy failed. Please use browser's copy feature instead.");
                }
            })
        });
    }

    var generateTag = debounce(function () {
        var formData = grabForm();
        if (formData.error && formData.error.length) {
            document.getElementById("widget").innerHTML = "<p class='error'>" +
                formData.error.join("<br>") + "</p>";
            document.getElementById("sourceHtml").value = "";
            document.getElementById("sourceCss").value = "";
            return;
        }

        var widgetBaseUrl = getWidgetUrl();
        var url = widgetBaseUrl + "?" + formData.data;
        var tagHtml = "<a href='" + url + "' class='_kyberpay-widget'\n";
        tagHtml += "name='KyberPay - Powered by KyberNetwork' title='Pay by tokens'\n";
        tagHtml += "target='_blank'>Pay by tokens</a>";

        document.getElementById("widget").innerHTML = tagHtml;
        document.getElementById("sourceHtml").value = tagHtml;
        document.getElementById("sourceCss").value = document.getElementById("widget_style").innerHTML.trim();
    }, 50, false);


    generateTag();
    wireEvents();

})();
