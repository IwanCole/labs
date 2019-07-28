var WIDTH = null;
var HEIGHT = null;
var canvas = document.querySelector("canvas");

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
const X0 = Math.round(WIDTH/2);
const Y0 = Math.round(HEIGHT/2);


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
        this.angle += (this.speed *0.2);
        if (this.angle == 360) this.angle = 0;
    
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




var planets = [];
var moons = [];

Object.keys(PLT).forEach(function(key,index) {
    planets.push(new Planet(X0, Y0, PLT[key].orbit, PLT[key].radius, PLT[key].col, PLT[key].speed));
});

Object.keys(MOON).forEach(function(key,index) {
    planets.push(new Moon(0, 0, MOON[key].orbit, MOON[key].radius, MOON[key].col, MOON[key].speed, MOON[key].plt_i));
});


function animate() {
    req = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    ctx.fillStyle = "#ffd834";
    ctx.beginPath();
    ctx.arc(X0, Y0, 22, 0, Math.PI*2, false);
    ctx.fill();
    
    for (var i = 0; i < planets.length; i++) {
        planets[i].update();
    }
    for (var i = 0; i < moons.length; i++) {
        moons[i].update();
    }
}

req = requestAnimationFrame(animate);
















