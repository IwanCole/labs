const PIXEL = 5;
const WIDTH = 100;
const HEIGHT = 100;
const BOARDWIDTH = WIDTH * PIXEL;
const BOARDHEIGHT = HEIGHT * PIXEL;

var ctx;
var board;

class Board {
    constructor() {
        this.cells = [];
        for (var i = 0; i < HEIGHT; i++) {
            var row = []
            for (var j = 0; j < WIDTH; j++) {
                var x = Math.random() > 0.75 ? 1 : 0;
                row.push(x);
            }
            this.cells.push(row);
        }
    }


    getNeighbourSum(x, y) {
        var sum = 0;
        for (var i = y - 1; i < y + 2; i++) {
            for (var j = x - 1; j < x + 2; j++) {
                var ii = i;
                var jj = j;
                if (i < 0) ii = HEIGHT - 1;
                else if (i == HEIGHT) ii = 0;

                if (j < 0) jj = WIDTH - 1;
                else if (j == WIDTH) jj = 0;

                sum += this.cells[ii][jj];
            }
        }
        return sum;
    }

    nextEpoch() {
        var newCells = [];
        for (var i = 0; i < HEIGHT; i++) {
            var row = [];
            // console.log(`Processing row ${i}`);
            for (var j = 0; j < WIDTH; j++) {
                // console.log(`Processing box ${j}`);
                var neighbourSum = this.getNeighbourSum(j, i);
                var oldState = this.cells[i][j];
                var newState = 0;
                if (neighbourSum < 2) {
                    newState = 0;
                } else if (neighbourSum == 2) {
                    if (oldState == 1) {
                        newState = 0;
                    }
                }
                else if (neighbourSum == 3) {
                    newState = 1;
                }
                else {
                    newState = 0;
                }
                row.push(newState);
                if (j == 98) {
                    var blah = 37893;
                }
            }
            // console.log(`Finished processing row ${i}`);
            newCells.push(row);
            row = [];
        }
        this.cells = newCells;
    }

    draw() {
        for (var y = 0; y < HEIGHT; y++) {
            for (var x = 0; x < WIDTH; x++) {
                if (this.cells[y][x] == 1) ctx.fillStyle = "rgb(0, 0, 0)";
                else ctx.fillStyle = "rgb(255, 255, 255)";
                ctx.fillRect(x * PIXEL, y * PIXEL, PIXEL, PIXEL);
            }
        }

        ctx.fill();
    }

    update() {
        this.nextEpoch();
        this.draw();
    }
}

function setup() {
    var canvas = document.querySelector("canvas");
    ctx = canvas.getContext('2d');
    canvas.width = BOARDWIDTH;
    canvas.height = BOARDHEIGHT;

    board = new Board();
    board.draw();

    setInterval(() => {
        board.update();
    }, 500);
}

$(document).on('ready', setup());
