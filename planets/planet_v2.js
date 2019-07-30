var WIDTH = null;
var HEIGHT = null;
var X0 = null;
var Y0 = null;
var dampener = 0.1;
var hyper = false;
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext('2d');
var planets = [];


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


function calculateSize() {
    if ( navigator.platform != "iPad" && navigator.platform != "iPhone" && navigator.platform != "iPod" ) {
        HEIGHT = innerHeight;
        WIDTH = innerWidth;
    } else {
        HEIGHT = screen.height;
        WIDTH = screen.width;
    }
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    X0 = Math.round(WIDTH/2);
    Y0 = Math.round(HEIGHT/2);
}

function scaleSize() {

    // Scale max orbit (pluto) to size of screen's smallest dimention - no clipping
    var sizeScale = ((WIDTH < HEIGHT) ? WIDTH : HEIGHT) / (2*PLT.pl.orbit);
    for (var i = 0; i < planets.length; i++) planets[i].orbit *= sizeScale;

    // Scale bodies if page is too small
    if (HEIGHT < 750 || WIDTH < 750) {
        for (var i = 0; i < planets.length; i++) planets[i].orbit *= 1.1;
        for (var i = 0; i < planets.length; i++) planets[i].radius *= 0.6;
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

    if (hyper && dampener < 2) {
        dampener += 0.02;
        if (dampener > 2) dampener = 2;
    }
    else if (!hyper && dampener > 0.15) {
        dampener -= 0.02;
        if (dampener < 0.15) dampener = 0.15;
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

    window.addEventListener('mousedown', (e) => { hyper = true; });
    window.addEventListener('mouseup', (e) => { hyper = false; });
    window.addEventListener('touchstart', (e) => { hyper = true; });
    window.addEventListener('touchend', (e) => { hyper = false; });
    window.addEventListener('resize', (e) => {
        calculateSize();
        for (var i = 0; i < 9; i++) planets[i].origin = { x: X0, y: Y0 };
        // scaleSize();
    });
}


init();
req = requestAnimationFrame(animate);
