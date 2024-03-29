var cols = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"];
var tap = 0;
var lineWidth = 8;

var ongoingTouches = [];
var mouse = false;

var canvas = document.querySelector("canvas");
var slider = document.querySelector("input");
var themeBtn = document.getElementsByClassName("menu-theme");
var clearBtn = document.querySelector(".menu-clear");


if ( navigator.platform != "iPad" && navigator.platform != "iPhone" && navigator.platform != "iPod" ) {
    HEIGHT = innerHeight;
    WIDTH = innerWidth;
} else {
    HEIGHT = screen.height;
    WIDTH = screen.width;
}

canvas.width = WIDTH;
canvas.height = HEIGHT;

var ctx = canvas.getContext('2d');
ctx.lineCap = "round";


function draw_start(e, touches) {
    console.log("START");
    e.preventDefault();
    tap += 1;
    tap %= 5;

    for (var i = 0; i < touches.length; i++) {
        ongoingTouches.push(copyTouch(touches[i]));
        var colour = cols[(i + tap)%5];
        ctx.beginPath();
        ctx.arc(touches[i].pageX, touches[i].pageY, lineWidth/2, 0, 2 * Math.PI, false);
        ctx.fillStyle = colour;
        ctx.fill();
    }
}


function draw_move(e, touches) {
    console.log("MOVE");
    e.preventDefault();

    for (var i = 0; i < touches.length; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier);
        var colour = cols[(idx + tap)%5];

        if (idx >= 0) {
            ctx.beginPath();
            ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
            ctx.lineTo(touches[i].pageX, touches[i].pageY);
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = colour;
            ctx.stroke();

            ongoingTouches.splice(idx, 1, copyTouch(touches[i]));
        }
    }
}


function draw_end(e, touches) {
    console.log("END");
    e.preventDefault();

    for (var i = 0; i < touches.length; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier);
        var colour = cols[(idx + tap)%5];

        if (idx >= 0) {
            ctx.lineWidth = 4;
            ctx.fillStyle = colour;
            ctx.beginPath();
            ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
            ctx.lineTo(touches[i].pageX, touches[i].pageY);
            ctx.arc(touches[i].pageX, touches[i].pageY, lineWidth/2, 0, 2 * Math.PI, false);
            ctx.fillStyle = colour;
            ctx.fill();
            ongoingTouches.splice(idx, 1);
        }
    }
    checkpoint();
}

function checkpoint() {
    var bmp = canvas.toDataURL();
    window.localStorage.setItem("canvas", bmp);
}

function clearCanvas() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    window.localStorage.removeItem("canvas");
    
    var draw = document.querySelector(".draw-icon");
    draw.classList.remove("draw-icon-animate");
    void draw.offsetWidth;
    draw.classList.add("draw-icon-animate");
}

function loadCanvasCheckpoint() {
    var bmp = window.localStorage.getItem("canvas");
    if (bmp) {
        var img = new Image;
        img.src = bmp;
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        }
    }
    else {
        var draw = document.querySelector(".draw-icon");
        draw.classList.add("draw-icon-animate");
    }
}

function ongoingTouchIndexById(idToFind) {
    for (var i = 0; i < ongoingTouches.length; i++) {
        var id = ongoingTouches[i].identifier;
        if (id == idToFind) return i;
    }
    return -1;
}


function copyTouch(touch) {
    return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}

function menuHandler() {
    $(".menu-icon").on('click', () => {
        console.log("menu opened");
        $(".menu-cont").toggleClass("menu-open");
        $("canvas").toggleClass("canvas-blur");
    });
    $(".page-cover").on('click', () => {
        $(".menu-cont").toggleClass("menu-open");
        $("canvas").toggleClass("canvas-blur");
    });
}


function themeSwitch(e) {
    var prev = document.getElementsByClassName("theme-active")[0];
    prev.classList.remove("theme-active");
    e.target.classList.add("theme-active");
    var html = document.querySelector("html");
    
    if (e.target.attributes.value.value == "0") {
        html.classList.remove("theme1");
        html.classList.add("theme2");
        document.querySelector('meta[name="theme-color"]').setAttribute("content", "#d6d6d6");
        document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]').setAttribute("content", "#d6d6d6");
    }
    else {
        html.classList.remove("theme2");
        html.classList.add("theme1");
        document.querySelector('meta[name="theme-color"]').setAttribute("content", "#222222");
        document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]').setAttribute("content", "#222222");
    }
    
}


function init() {
    menuHandler();
    var mobileDevice = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) mobileDevice = true;})(navigator.userAgent||navigator.vendor||window.opera,'http://detectmobilebrowser.com/mobile');
    console.log(`Mobile Detected: ${mobileDevice}`);

    slider.addEventListener('input', (e) => {
         lineWidth = e.target.value;
    });
    
    clearBtn.addEventListener('click', (e) => {
        clearCanvas(); 
    });
    
    for(var i = 0; i < themeBtn.length; i+= 1) {
        themeBtn[i].addEventListener('click', (e) => {
            themeSwitch(e);
        });
    }
    
    loadCanvasCheckpoint();
    
    if (mobileDevice) {
        canvas.addEventListener('touchstart', (e) => {
            var touches = e.changedTouches;
            draw_start(e, touches);
        });
        canvas.addEventListener('touchmove', (e) => {
            var touches = e.changedTouches;
            draw_move(e, touches);
        });
        canvas.addEventListener('touchend', (e) => {
            var touches = e.changedTouches;
            draw_end(e, touches);

        });
    }
    else {
        canvas.addEventListener('mousedown', (e) => {
            var touchObj = {
                pageX: e.pageX,
                pageY: e.pageY,
                identifier: 0
            };

            draw_start(e, [touchObj]);
            mouse = true;
        });
        canvas.addEventListener('mousemove', (e) => {
            if (mouse){
                var touchObj = {
                    pageX: e.pageX,
                    pageY: e.pageY,
                    identifier: 0
                };
                draw_move(e, [touchObj]);
            }
        });
        canvas.addEventListener('mouseup', (e) => {
            var touchObj = {
                pageX: e.pageX,
                pageY: e.pageY,
                identifier: 0
            };
            draw_end(e, [touchObj]);
            mouse = false;
        });
    }
}

init();
