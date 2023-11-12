var current_page = 0;
var direction = 0;
var audio = null;
var starttime = 0;
var lasttime = 0;
var current_img = null;
var auto_next = null;
const max_page = 8;

// [delay, total duration]
// if it scrolls too fast, increase total duration!
// if it scrolls too slow, decrease total duration!
const durations = {
    1: [16, 61],
    2: [2, 70],
    3: [2, 70],
    4: [2, 68],
    5: [2, 55],
    6: [2, 62],
    7: [2, 63],
};

function play_audio() {
    if (current_page > 0) {
        audio.src = "audio/" + current_page + ".mp3";
        audio.currentTime = starttime;
        audio.play();
    } else {
        audio.pause();
    }
}

function stop_audio() {
    audio.pause();
}

function play_or_pause() {
    if (audio.paused) {
        audio.play();
    } else {
        stop_audio();
    }
}

function audio_update() {
    var info = durations[current_page];
    if (info === undefined) return;
    var position = (audio.currentTime - info[0]) / info[1];
    if (position < 0) position = 0;
    if (position > 1) position = 1;
    var el = $("#text-scroll-" + current_page);
    var vis = $("#text-" + current_page).height();
    var dist = el.height() - vis;
    var dur = 1000 * (audio.currentTime - lasttime) - 20;
    if (dur < 100) dur = 100;
    if (dur > 500) dur = 500;
    el.animate({"top": (-position*dist) + "px"}, dur);
    lasttime = audio.currentTime;
}

function audio_ended() {
    if (current_page < 8) {
        auto_next = window.setTimeout(next, 5000);
    }
}

function display_image(pg, nr) {
    if (current_img !== null) {
        current_img.hide();
    }
    current_img = $("#image-" + pg + "-" + nr);
    var nw = current_img[0].naturalWidth;
    var nh = current_img[0].naturalHeight;
    var img_asp = nw/nh;
    var win_asp = (window.innerWidth - 200)/(window.innerHeight - 200);
    var ww = window.innerWidth;
    var wh = window.innerHeight
    if (img_asp >= win_asp) {
        current_img.css("left", 100);
        current_img.css("top", (wh - (ww - 200)/img_asp)/2);
        current_img.css("width", ww - 200);
        current_img.css("height", (ww - 200)/img_asp);
    } else {
        current_img.css("left", (ww - (wh - 200)*img_asp)/2);
        current_img.css("top", 100);
        current_img.css("width", (wh - 200)*img_asp);
        current_img.css("height", wh - 200);
    }
    current_img.show();
    $("#images").fadeIn(1000);
}

function hide_image() {
    $("#images").fadeOut(1000);
}

function next() {
    window.clearTimeout(auto_next);
    direction = 1;
    $("#flip").bookblock("next");
}

function prev() {
    window.clearTimeout(auto_next);
    direction = -1;
    $("#flip").bookblock("prev");
}

function resize_flip() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (h > w) {
        /* On portrait viewports we keep the full height, and scroll to the right
           to indicate that users need to scroll left/right. */
        document.documentElement.style.setProperty('--vh', "1vh");
        document.documentElement.style.setProperty('margin-top', "0");
        $("body").scrollLeft($("#flip").width() / 4);
    } else if (w < h * 1.5) {
        /* On landscape viewports that are less than 1:1.5 aspect ratio,
           adapt the height instead. */
        document.documentElement.style.setProperty('--vh', "0.66666666vw");
        var margin = (h - (w / 1.5)) / 2;
        document.documentElement.style.setProperty('margin-top', margin + "px");
    } else {
        document.documentElement.style.setProperty('--vh', "1vh");
        document.documentElement.style.setProperty('margin-top', "0");
    }
}

function init_flip() {
    audio = document.getElementById("audio");
    resize_flip();

    $("#flip").bookblock({
        onBeforeFlip: function(page) {
            if (page+direction < 0 || page+direction > max_page) {
                return;
            }
            $("body").css("background-image",
                          "url(pages/" + (page+direction) + "_frame.png)");
        },
        onEndFlip: function(old, page, isLimit) {
            current_page = page;
            if (current_page == 0) {
                $("#page-button").hide();
                $("#play-button").hide();
                $("#prev-button").hide();
                $("#next-button").show();
            } else if (current_page == max_page) {
                $("#page-button").show();
                $("#play-button").show();
                $("#prev-button").show();
                $("#next-button").hide();
            } else {
                $("#page-button").show();
                $("#play-button").show();
                $("#prev-button").show();
                $("#next-button").show();
            }
            play_audio();
            $("#page-number").text(current_page);
        }
    });
    $(document).click(function(e) {
        var range = Math.max(200, window.innerWidth / 6);
        if (e.clientX > window.innerWidth - range) {
            next();
        } else if (e.clientX < range) {
            prev();
        }
        audio.play(); // necessary for ios
    });

    $(".star").click(function(ev) { ev.stopPropagation(); });
    $("#page-button").click(function(ev) {
        $("#page-drawer").slideDown();
        ev.stopPropagation();
    });
    $("#play-button").click(function(ev) {
        play_or_pause();
        ev.stopPropagation();
    });
    $("#prev-button").click(function(ev) {
        prev();
        ev.stopPropagation();
    });
    $("#next-button").click(function(ev) {
        next();
        ev.stopPropagation();
    });
    $("#page-drawer").click(function(ev) {
        $("#page-drawer").slideUp();
        ev.stopPropagation();
    });

    $(document).keyup(function(ev) {
        if (ev.key == "ArrowRight") {
            next();
        } else if (ev.key == "ArrowLeft") {
            prev();
        }
    });

    var q = document.location.search;
    if (q !== "") {
        q = q.substr(1).split(",");
        if (q[1])
            starttime = parseInt(q[1]);
        if (q[0])
            set_page(parseInt(q[0]));
    }
}

function set_page(nr) {
    $("#flip").bookblock("jump", nr + 1);
}
