function localstorage() {
    this.get = function(name) {
        return window.localStorage.getItem(name.toString());
    }
    this.set = function(name, obj) {
        window.localStorage.setItem(name.toString(), obj);
    }
    this.remove = function(name) {
        return window.localStorage.removeItem(name.toString());
    }
    this.clear = function(name) {
        return window.localStorage.clear();
    }
}
$(function() {
    const storage_name = "openclose_url_arrs";
    var storage = new localstorage();
    try {
        var url_arrays = storage.get(storage_name) ? JSON.parse(storage.get(storage_name)) : [];
    } catch (e) {
        var url_arrays = [];
        storage.clear();
    }
    let string = "";
    for (let i in url_arrays) {
        string += "<li>";
        string += "<a class='left' data-urls=" + JSON.stringify(url_arrays[i]) + ">" + i + "</a>";
        string += "<a class='right remove'>×</a>";
        string += "</li>";
    }
    $(".industry_format .list").html(string);
    $(".industry_format").on("click", ".remove", function(event) {
        let key = $(this).parent().find("a").first().text()
        if (key) {
            $(this).parent().remove();
            delete url_arrays[key];
            storage.set(storage_name, JSON.stringify(url_arrays));
        }
        window.location.reload(true);
    });
    $(document).on("click", "li>a", function(event) {
        for (let url in ($(this).data("urls"))) {
            let url_str = unescape(($(this).data("urls"))[url])
            if (url_str) {
                chrome.tabs.create({
                    url: url_str
                });
            }
        }
    });
    $("input[name=name]").keypress(function(event) {
        if (event.keyCode == 13) {
            $(".save").click();
        }
    });
    $(".save").on("click", function(event) {
        chrome.windows.getCurrent({
            populate: true
        }, function(currentWindow) {
            name = $("input[name='name']").val();
            if (name) {
                let j = [];
                for (let i in (currentWindow.tabs)) {
                    j.push(escape(((currentWindow.tabs)[i]).url));
                }
                url_arrays[name] = j;
                storage.set(storage_name, JSON.stringify(Object.assign({}, url_arrays)));
                window.location.reload(true);
            }
        });
    });
    $(".download").on("click", function(event) {
        try {
            if (url_arrays) {
                let a = document.createElement("a");
                a.style.visibility = "hidden";
                a.href = URL.createObjectURL(new Blob([JSON.stringify(url_arrays)], {
                    type: "application/json"
                }));
                a.download = "save.json";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (e) {
            storage.clear();
        }
    });
    $(".read").on("click", function(event) {
        try {
            let input = document.createElement("input");
            input.type = "file";
            input.style.visibility = "hidden";
            input.onchange = function() {
                let reader = new FileReader();
                reader.readAsText(input.files[0]);
                reader.onload = function(event) {
                    storage.set(storage_name, JSON.stringify($.extend(url_arrays, JSON.parse(event.target.result))));
                    window.location.reload(true);
                };
            };
            document.body.appendChild(input);
            input.click();
        } catch (e) {
            storage.clear();
        }
    });
});