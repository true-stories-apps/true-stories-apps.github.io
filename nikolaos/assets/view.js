var current_page = 0;
var direction = 0;
var audio = null;
var lasttime = 0;
var current_img = null;
var auto_next = null;
const max_page = 8;

// [delay, total duration]
// if it scrolls too fast, decrease total duration!
const durations = {
    1: [16, 70],
    2: [2, 67],
    3: [2, 68],
    4: [2, 73],
    5: [2, 58],
    6: [2, 70],
    7: [2, 75],
};

function play_audio() {
    if (current_page > 0) {
        audio.src = "audio/" + current_page + ".mp3";
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
            play_audio();
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

    $(".star").click(function(e) { e.stopPropagation(); });
    $(".play-button").click(function(e) { e.stopPropagation(); });
}
