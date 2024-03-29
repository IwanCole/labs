var mouse = {
    x: undefined,
    y: undefined
}


window.addEventListener('mousedown', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});


window.addEventListener('touchstart', (e) => {
    mouse.x = e.touches[0].screenX;
    mouse.y = e.touches[0].screenY;
});

function Ball(x,y,vx,vy,rad,col) {
    this.x = x;
    this.y = y;
    this.mx = Math.abs(vx);
    this.my = Math.abs(vy);
    this.dx = (vx >= 0) ? 1 : -1;
    this.dy = (vy >= 0) ? 1 : -1;
    this.radius = rad;
    this.col = col;
//    this.mass = 1;

    this.velocity = function() {
        return {
            x: this.mx * this.dx,
            y: this.my * this.dy
        };
    }
    
    this.get_velocity = function() {
        return [this.mx, this.my, this.dx, this.dy];
    }
    
    this.set_velocity = function(vel) {
        this.mx = vel[0];
        this.my = vel[1];
        this.dx = vel[2];
        this.dy = vel[3];
    }
    
    this.set_velocity2 = function(v) {
        this.mx = Math.abs(v.x);
        this.my = Math.abs(v.y);
        this.dx = (v.x >= 0) ? 1 : -1;
        this.dy = (v.y >= 0) ? 1 : -1;
    }
    
    this.draw = function() {
        c.fillStyle = this.col;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fill();
    }

    
    this.update = function(req) {
        
        if (mouse.x) {
            if (mouse.x >= this.x - this.radius &&
                mouse.x <= this.x + this.radius &&
                mouse.y >= this.y - this.radius &&
                mouse.y <= this.y + this.radius) {
                this.dx = -this.dx;
                this.dy = -this.dy;
                this.mx += Math.floor(Math.random()*(16)+5);
                this.my += Math.floor(Math.random()*(16)+7);
                mouse.x = undefined;
                mouse.y = undefined;
            }
        }
        
        
        // Collision with walls
        if (this.x + this.radius >= WIDTH || this.x - this.radius <= 0) {
            this.dx = -this.dx;
            this.mx -= 0.5;
        }
        
        // Collision with floor/ceiling
        if (this.y + this.radius >= HEIGHT || this.y - this.radius <= 0) {
            this.dy = -this.dy;
            this.my -= 1;
            this.mx -= 0.5;
        }
        
        
        
        
        // Gravity
        if (this.my == 0 && this.dy == -1) this.dy = 1;
        this.my += this.dy;
        
        // Check magnitude is always >= 0;
        this.mx = (this.mx < 0) ? 0 : this.mx;
        this.my = (this.my < 0) ? 0 : this.my;
        
        // Cap magnitude at 50
        this.mx = (this.mx > 50) ? 50 : this.mx;
        this.my = (this.my > 50) ? 50 : this.my;
        
        // check if rolling on floor
        if (this.y + this.radius == HEIGHT) {
            if (this.mx > 0.5) {
                this.mx -= 0.5;
            }
            else {
                this.mx = 0;
            }
        }
        
        //console.log(`x: ${this.mx} ${this.dx}, y: ${this.my} ${this.dy}`);
        this.y += (this.dy * this.my);
        this.x += (this.dx * this.mx);
        
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        
        if (this.y + this.radius > HEIGHT) this.y = HEIGHT - this.radius;
        if (this.x + this.radius > WIDTH)  this.x = WIDTH - this.radius;
        if (this.y - this.radius < 0) this.y = this.radius;
        if (this.x - this.radius < 0) this.x = this.radius;
        
        this.draw();
        
//        if (this.dy*this.my == 0 && this.dx*this.mx == 0)
    }
}


var canvas = document.querySelector("canvas");

if ( navigator.platform != "iPad" && navigator.platform != "iPhone" && navigator.platform != "iPod" ) {
    HEIGHT = innerHeight - 10;
    WIDTH = innerWidth - 10;
} else {
    HEIGHT = screen.height - 60;
    WIDTH = screen.width - 60;
}

canvas.width = WIDTH;
canvas.height = HEIGHT;

var c = canvas.getContext('2d');

var cols = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"];
var balls = [];
for (var i = 0; i < 5; i++) {
    var r = Math.floor(Math.random()*(14)+45);
    var vx = Math.floor(Math.random()*(7)-2);
    var vy = Math.floor(Math.random()*(4)-1);    
    balls.push(new Ball(50+(i*150), 100, vx, vy, r, cols[i]));
}


function animate() {
    req = requestAnimationFrame(animate);
    c.clearRect(0, 0, WIDTH, HEIGHT);
    
    for (var i = 0; i < 5; i++) {
        for (var j = i + 1; j < 5; j++) {
            
            var dist = Math.pow(balls[i].x-balls[j].x, 2) + Math.pow(balls[i].y-balls[j].y, 2);
            dist = Math.sqrt(dist);
            var rads = balls[i].radius + balls[j].radius;
                        
            // Check for collision and conserve momentum
            if (dist <= rads) {
                resolveCollision(balls[i], balls[j]);
                console.log(`Collision between balls ${i},${j}`);
            }
        }
        balls[i].update();
    }
}

req = requestAnimationFrame(animate);
