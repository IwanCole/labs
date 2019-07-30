var X0 = null;          // The origin X co-ord
var Y0 = null;          // The origin Y co-ord
var WIDTH = null;       // Global width of the canvas
var HEIGHT = null;      // Global height of the canvas
var hyper = false;      // Boost factor for oribital speed
var dampener = 0.1;     // Dampening factor of orbital speed
var MAXSPEED = null;    // Max orbital speed
var MINSPEED = null;    // Min orbital speed
var planets = [];       // Planets and their moons
var tapStart = null;    // (mobile) Time of touch start
var mobileZoom = false; // (mobile) Viewport scaling active or not

const MOBILE = mobileCheck();

var canvas = document.querySelector("canvas");
var ctx = canvas.getContext('2d');


class Planet {
    constructor(x0, y0, orbit, radius, colour, speed) {
        this.radius = radius;
        this.orbit = orbit;
        this.speed = speed;
        this.angle = Math.floor(Math.random()*360);;
        this.col = colour;
        this.origin = {
            x: x0,
            y: y0
        };
        this.x = Math.round(WIDTH/2);
        this.y = Math.round(HEIGHT/2) + orbit;
    }

    draw() {
        ctx.fillStyle = this.col;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fill();
    }

    update() {
        var newX  = this.orbit * Math.cos(this.angle * (Math.PI/180));
        var newY = this.orbit * Math.sin(this.angle * (Math.PI/180));
        this.x = newX + this.origin.x;
        this.y = newY + this.origin.y;
        this.angle += (this.speed * dampener);
        if (this.angle >= 360) this.angle %= 360;
        this.draw();
    }
}


// Includes a 'planet index' plt_i referencing which planet-object the moon belongs to
class Moon extends Planet {
    constructor(x0, y0, orbit, radius, colour, speed, plt_i) {
        const x = planets[plt_i].x;
        const y = planets[plt_i].y;
        super(x, y, orbit, radius, colour, speed);
        this.plt_i = plt_i;
    }

    update() {
        this.origin.x = planets[this.plt_i].x;
        this.origin.y = planets[this.plt_i].y;
        super.update();
    }
}


// Calculates the size of the webpage, adjusts the canvas to fit.
// Sets the origin (sun) co-ords X0,Y0.
function calculateSize() {
    if ( navigator.platform != "iPad" && navigator.platform != "iPhone" && navigator.platform != "iPod" ) {
        HEIGHT = innerHeight;
        WIDTH = innerWidth;
    } else {
        HEIGHT = screen.height;
        WIDTH = screen.width;
    }
    
    WIDTH *= (mobileZoom) ? 2 : 1;
    HEIGHT *= (mobileZoom) ? 2 : 1;
    
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    X0 = Math.round(WIDTH/2);
    Y0 = Math.round(HEIGHT/2);
}


// Scales the orbits of the planets on page load to fit the screen. Ensures Pluto remains on screen.
// On mobile, adjusts radii of planets to be more visible, and hides most outer planets.
function scaleSize() {
    if (!MOBILE) {
        var sizeScale = ((WIDTH < HEIGHT) ? WIDTH : HEIGHT) / (2*PLT.pl.orbit);
        for (var i = 0; i < planets.length; i++) planets[i].orbit *= sizeScale;
        if (HEIGHT < 750 || WIDTH < 750) {
            for (var i = 0; i < planets.length; i++) planets[i].orbit *= 1.1;
            for (var i = 0; i < planets.length; i++) planets[i].radius *= 0.6;
        }
    }
    else {
        for (var i = 0; i < 9; i++) planets[i].orbit *= 1.5;
        for (var i = 9; i < planets.length; i++) planets[i].orbit *= 1.6;
        for (var i = 0; i < planets.length; i++) planets[i].radius *= 2;
    }
}


// Re-centers all the planets (not moons) to have the origin co-ords.
function recenter() {
    for (var i = 0; i < 9; i++) planets[i].origin = { x: X0, y: Y0 };
}


function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    h = (h < 10) ? `0${h}` : h;
    m = (m < 10) ? `0${m}` : m;
    document.querySelector(".clock").innerHTML = `${h}:${m}`;
    var t = setTimeout(startTime, 30000);
}












// Adds page event handlers. On mobile, a short tap re-scales the viewport to view all the outer planets.
function handlers() {
    var rocket = document.querySelector(".info-pic");
    rocket.addEventListener('click', (e) => {
        var notif = document.querySelector(".info");
        notif.classList.add("info-active");
        rocket.remove();
        
    });
    
    if (!MOBILE) {
        canvas.addEventListener('mousedown', (e) => { hyper = true; });
        canvas.addEventListener('mouseup', (e) => { hyper = false; });
        window.addEventListener('resize', (e) => {
            calculateSize();
            recenter();
        });
        window.addEventListener('keydown', (e) => {
            if (e.keyCode && e.keyCode == 32) {
                document.querySelector(".clock").classList.toggle("clock-active");
            } 
        });
    }
    else {
        canvas.addEventListener('touchstart', (e) => { 
            hyper = true;
            d = new Date();
            tapStart = d.getTime();
        });
        canvas.addEventListener('touchend', (e) => { 
            hyper = false;
            d = new Date();
            if (d.getTime() - tapStart < 100) {
                mobileZoom = !mobileZoom
                document.querySelector('canvas').classList.toggle("canvas-zoom");
                calculateSize();
                recenter();
            }
        });
    }
}


function animate() {
    req = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#ffd834";
    ctx.beginPath();
    ctx.arc(X0, Y0, 20, 0, Math.PI*2, false);
    ctx.fill();

    for (var i = 0; i < planets.length; i++) planets[i].update();

    if (hyper && dampener < MAXSPEED) {
        dampener += 0.02;
        if (dampener > MAXSPEED) dampener = MAXSPEED;
    }
    else if (!hyper && dampener > MINSPEED) {
        dampener -= 0.02;
        if (dampener < MINSPEED) dampener = MINSPEED;
    }
}


function init() {
    calculateSize();

    Object.keys(PLT).forEach(function(key,index) {
        planets.push(new Planet(X0, Y0, PLT[key].orbit, PLT[key].radius, PLT[key].col, PLT[key].speed));
    });
    Object.keys(MOON).forEach(function(key,index) {
        planets.push(new Moon(0, 0, MOON[key].orbit, MOON[key].radius, MOON[key].col, MOON[key].speed, MOON[key].plt_i));
    });

    scaleSize();
    handlers();
    
    startTime();
    
    var t1 = document.querySelector(".text1");
    var t2 = document.querySelector(".text2");
    if (MOBILE) {
        MINSPEED = 0.35;
        MAXSPEED = 3.5;
        t2.textContent = "Tap to zoom in and out"
    }
    else {
        MINSPEED = 0.15;
        MAXSPEED = 2;
        t1.textContent = t1.textContent.replace("Tap", "Click");
    }
}


init();
req = requestAnimationFrame(animate);
