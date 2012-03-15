/**
* A test using Moootools classes and canvas for a Snake game :)
* 
* Licensed under the Apache License 2.0
*
* Author: Ajimix [github.com/ajimix], Jonathan Gimeno
* Version: tests
*/

window.addEvent('domready', function() {

    // Class that will generate the snake
    var Snake = new Class({
        Implements: Options,

        options: {
            initialSize: 3
        },

        initialize: function(canvas, options) {
            this.setOptions(options);
            this.snakeSize = this.options.initialSize;
            this.canvas = canvas;
            // Get the half of the canvas so we can start from the middle
            var halfXSize = Math.floor(this.canvas.size.x/8/2), halfYSize = Math.floor(this.canvas.size.y/8/2);
            // Snake initialization
            this.snakeBody = [];
            for (var i = 0; i < this.options.initialSize; i++) {
                this.snakeBody.push(new Dot(halfXSize - i, halfYSize));
            }
            this.direction = 'right';
            this.head = 0;
            this.temp = new Array();
        },
        draw: function() {
            var canvas = this.canvas;
            this.snakeBody.each(function(dot, indice) {
                canvas.fillStyle = "rgb(200,0,0)";
                canvas.fillRect(dot.x * 8, dot.y * 8, 8, 8);
            });
        },
        moves: function () {
            for(var i = 0; i < this.snakeSize; i++) {
                this.temp[i] = Object.clone(this.snakeBody[i]);
                if(i == 0) {
                    if(this.direction == 'right') {
                        this.snakeBody[i].x++;
                    } else if(this.direction == 'down') {
                        this.snakeBody[i].y++;
                    } else if(this.direction == 'up') {
                        this.snakeBody[i].y--;
                    } else if(this.direction == 'left') {
                        this.snakeBody[i].x--;
                    }
                } else {
                    this.snakeBody[i] = this.temp[i-1];
                }
            }
        },
        setDireccion: function(direccion) {
            this.direction = direccion;
        },
        getHead: function() {
            return this.snakeBody[0];
        },
        grow: function(size) {
            if(size == null) size = 1;
            this.snakeSize += size;
        },
        setHead: function (x,y) {
            this.snakeBody[this.head].x = x;
            this.snakeBody[this.head].y = y;
        }
    });

    // Each snake will be composed of dots
    var Dot = new Class({
        initialize: function(x,y) {
            this.x = x;
            this.y = y;
        }
    });

    // Apples are points you have to eat
    var Apple = new Class({
        initialize: function(canvas,x,y) {
            this.canvas = canvas;
            this.x = x;
            this.y = y;
        },
        setNew: function() {
            this.x = Number.random(0,Math.floor((this.canvas.size.x/8))-1);
            this.y = Number.random(0,Math.floor((this.canvas.size.y/8))-1);
        },
        draw: function() {
            this.canvas.fillStyle = "rgb(34,139,34)";
            this.canvas.fillRect(this.x * 8, this.y * 8, 8, 8);
        }
    });
    
    // Cherries are special items that makes the snake grow bigger and get extra points :D
    var Cherry = new Class({
        initialize: function(canvas) {
            this.canvas = canvas;
            this.timeOnScreen = 1;
            this.x = Number.random(0,Math.floor((this.canvas.size.x/8))-1);
            this.y = Number.random(0,Math.floor((this.canvas.size.y/8))-1);
        },
        draw: function() {
            this.canvas.fillStyle = "rgb(255,0,0)";
            this.canvas.fillRect(this.x * 8, this.y * 8, 8, 8);
        }
    });

    // This class manages all the game itself
    var Game = new Class({
        Implements: Options,

        options: {
            initialSnakeSize: 3
        },

        initialize: function(canvas, options) {
            this.setOptions(options);
            this.canvas = canvas.getContext('2d');
            this.canvas.size = canvas.getSize();
            this.snake = new Snake(this.canvas, {initialSize: this.options.initialSnakeSize});
            this.apple = new Apple(this.canvas, Math.floor(this.canvas.size.x/8/2), Math.floor(this.canvas.size.y/8/2));
            this.lastKey = 'right';
            this.state = 'juego';
            window.addEvent('keydown', function(ev) {
                if(ev.key == 'up' || ev.key == 'down' || ev.key == 'left' || ev.key == 'right') {
                    if((this.lastKey == 'right' && ev.key != 'left') || (this.lastKey == 'up' && ev.key != 'down') || (this.lastKey == 'left' && ev.key != 'right') || (this.lastKey == 'down' && ev.key != 'up')) {
                        this.snake.setDireccion(ev.key);
                        this.lastKey = ev.key;
                    }
                }
            }.bind(this));
            this.currentSpeed = 200;
            this.periodicalId = this.loop.periodical(this.currentSpeed, this);
            this.lastExtrasScore = 0;
        },
        loop: function () {
            this.draw();
            this.update();
            this.check();
            this.extras();
        },
        draw: function() {
            this.drawBoard();
            this.snake.draw();
            this.apple.draw();
            if(this.cherry != null) this.cherry.draw();
        },
        update: function() {
            this.snake.moves();
        },
        check: function() {
            var xSize = Math.floor(this.canvas.size.x/8), ySize = Math.floor(this.canvas.size.y/8);
            var head = this.snake.getHead();
            if(head.x == this.apple.x && head.y == this.apple.y) {
                this.apple.setNew();
                this.snake.grow();
                this.raiseLevel();
            }
            if(this.cherry != null && head.x == this.cherry.x && head.y == this.cherry.y) {
                this.snake.grow(3);
                this.cherry = null;
                this.raiseLevel();
            }
            if(head.x > xSize-1 || head.x < 0 || head.y > ySize-1 || head.y < 0) { // Border touched
//                console.log('You lose!');
            }
            if(head.x > xSize-1) {
                this.snake.setHead(0, head.y);
            }
            if(head.x < 0) {
                this.snake.setHead(xSize-1, head.y);
            }
            if(head.y > ySize-1) {
                this.snake.setHead(head.x, 0);
            }
            if(head.y < 0) {
                this.snake.setHead(head.x, ySize-1);
            }
            var i = 0;
            this.snake.snakeBody.each(function(body){
                if(i != 0 && head.x == body.x && head.y == body.y) {
                    console.log("Crashed with itself");
                }
                i++;
            });
            
        },
        // Function that control the extras (cherry right now)
        extras: function() {
            if(this.snake.size != this.lastExtrasScore && this.snake.size % 5 == 0 && this.cherry == null) {
                this.cherry = new Cereza(this.canvas);
            } else if (this.cherry != null) {
                this.cherry.timeOnScreen++;
                if(this.cherry.timeOnScreen == 50) {
                    this.cherry = null;
                }
            }
            this.lastExtrasScore = this.snake.size;
            //$('canvas').tween('-webkit-transform', 'rotate('+((this.snake.size-3)*5)+'deg)');
        },
        raiseLevel: function() {
            this.currentSpeed -= 5;
            clearInterval(this.periodicalId);
            this.periodicalId = this.loop.periodical(this.currentSpeed, this);
        },
        drawBoard: function() {
            this.canvas.fillStyle = "rgb(0,0,0)";
            this.canvas.fillRect (0, 0, this.canvas.size.x, this.canvas.size.y);
        }

    });

    // Canvas, options
    var game = new Game($('canvas'), {
        initialSnakeSize: 3
    });
});
