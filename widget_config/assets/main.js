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

    function openTab(tabLink) {
        var i, tabcontent, tablinks;
        var tabSelector = tabLink.getAttribute("data-tab");

        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.visibility = "hidden";
        }
        document.querySelector(tabSelector).style.visibility = "visible";

        tablinks = document.getElementsByClassName("tablink");
        for (i = 0; i < tablinks.length; i++) {
          tablinks[i].classList.remove("active");
        }

        tabLink.classList.add("active");
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

        document.querySelectorAll(".tablink").forEach(function (link) {
            link.addEventListener('click', function () {
                openTab(link);
            });
        });

        document.querySelector(".btn-copy").addEventListener('click', function(){
            var selector = document.querySelector(".tablink.active").getAttribute("data-tab") + " code";
            if (!copyClipboard(selector)) {
                alert("Copy failed. Please use browser's copy feature instead.");
            }
        });
    }

    function runTemplateJS(baseUrl) {
        var js = document.getElementById("widget_js").innerHTML.trim().replace("${baseUrl}", baseUrl);

        var script = document.createElement("script");
        script.innerHTML = js;
        document.getElementsByTagName('body')[0].appendChild(script);

        return js;
    }

    var generateTag = debounce(function () {
        var formData = grabForm();
        if (formData.error && formData.error.length) {
            document.getElementById("widget").innerHTML = "<p class='error'>" +
                formData.error.join("<br>") + "</p>";
            document.getElementById("sourceHtml").textContent = "";
            document.getElementById("sourceCss").textContent = "";
            document.getElementById("sourceJs").textContent = "";
            return;
        }

        var isPopup = document.getElementById("typePopup").checked;

        var widgetBaseUrl = getWidgetUrl();
        var url = widgetBaseUrl + "?" + formData.data;
        var tagHtml = "<a href='" + url + "' class='kyber-widget-button'\n";
        tagHtml += "name='KyberWidget - Powered by KyberNetwork' title='Pay by tokens'\n";
        tagHtml += "target='_blank'>Pay by tokens</a>";

        document.getElementById("widget").innerHTML = tagHtml;
        document.getElementById("sourceHtml").textContent = tagHtml;

        document.getElementById("sourceCss").textContent = document.getElementById("widget_button_style").innerHTML.trim();

        if (isPopup) {
            document.getElementById("sourceJs").textContent = runTemplateJS(widgetBaseUrl);
            document.getElementById("sourceCss").textContent += "\n" + document.getElementById("widget_popup_style").innerHTML.trim();
        } else {
            document.getElementById("sourceJs").textContent = "";
        }

        Prism.highlightElement(document.getElementById("sourceHtml"));
        Prism.highlightElement(document.getElementById("sourceJs"));
        Prism.highlightElement(document.getElementById("sourceCss"));
    }, 50, false);


    generateTag();
    wireEvents();

})();
