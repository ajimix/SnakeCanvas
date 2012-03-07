window.addEvent('domready', function() {
    var Snake = new Class({
        initialize: function(canvas) {
            this.canvas = canvas;
            this.size = 3;
            var halfXSize = Math.floor(this.canvas.size.x/8/2), halfYSize = Math.floor(this.canvas.size.y/8/2);
            this.cuerpo = [new Punto(halfXSize,halfYSize), new Punto(halfXSize-1,halfYSize), new Punto(halfXSize-2,halfYSize)];
            this.direccion = 'right';
            this.cabeza = 0;
            this.temp = new Array();
        },
        dibuja: function() {
            var canvas = this.canvas;
            this.cuerpo.each(function(punto, indice) {
                canvas.fillStyle = "rgb(200,0,0)";
                canvas.fillRect(punto.x * 8, punto.y * 8, 8, 8);
            });
        },
        mueve: function () {
            for(var i=0; i<this.size; i++) {
                this.temp[i] = Object.clone(this.cuerpo[i]);
                if(i == 0) {
                    if(this.direccion == 'right') {
                        this.cuerpo[i].x++;
                    } else if(this.direccion == 'down') {
                        this.cuerpo[i].y++;
                    } else if(this.direccion == 'up') {
                        this.cuerpo[i].y--;
                    } else if(this.direccion == 'left') {
                        this.cuerpo[i].x--;
                    }
                } else {
                    this.cuerpo[i] = this.temp[i-1];
                }
            }
        },
        setDireccion: function(direccion) {
            this.direccion = direccion;
        },
        getCabeza: function() {
            return this.cuerpo[0];
        },
        crece: function(size) {
            if(size == null) size = 1;
            this.size += size;
        },
        setCabeza: function (x,y) {
            this.cuerpo[this.cabeza].x = x;
            this.cuerpo[this.cabeza].y = y;
        }
    });

    var Punto = new Class({
        initialize: function(x,y) {
            this.x = x;
            this.y = y;
        }
    });

    var Manzana = new Class({
        initialize: function(canvas,x,y) {
            this.canvas = canvas;
            this.x = x;
            this.y = y;
        },
        setNew: function() {
            this.x = Number.random(0,Math.floor((this.canvas.size.x/8))-1);
            this.y = Number.random(0,Math.floor((this.canvas.size.y/8))-1);
        },
        dibuja: function() {
            this.canvas.fillStyle = "rgb(34,139,34)";
            this.canvas.fillRect(this.x * 8, this.y * 8, 8, 8);
        }
    });
    
    var Cereza = new Class({
        initialize: function(canvas) {
            this.canvas = canvas;
            this.timeOnScreen = 1;
            this.x = Number.random(0,Math.floor((this.canvas.size.x/8))-1);
            this.y = Number.random(0,Math.floor((this.canvas.size.y/8))-1);
        },
        dibuja: function() {
            this.canvas.fillStyle = "rgb(255,0,0)";
            this.canvas.fillRect(this.x * 8, this.y * 8, 8, 8);
        }
    });

    var Juego = new Class({

        initialize: function() {
            this.canvas = $('canvas').getContext('2d');
            this.canvas.size = $('canvas').getSize();
            this.serpiente = new Snake(this.canvas);
            this.manzana = new Manzana(this.canvas,Math.floor(this.canvas.size.x/8/2),Math.floor(this.canvas.size.y/8/2));
            this.lastKey = 'right';
            this.estado = 'juego';
            window.addEvent('keydown', function(ev) {
                if(ev.key == 'up' || ev.key == 'down' || ev.key == 'left' || ev.key == 'right') {
                    if((this.lastKey == 'right' && ev.key != 'left') || (this.lastKey == 'up' && ev.key != 'down') || (this.lastKey == 'left' && ev.key != 'right') || (this.lastKey == 'down' && ev.key != 'up')) {
                        this.serpiente.setDireccion(ev.key);
                        this.lastKey = ev.key;
                    }
                }
            }.bind(this));
            this.currentSpeed = 200;
            this.periodicalId = this.bucle.periodical(this.currentSpeed, this);
            this.lastExtrasScore = 0;
        },
        bucle: function () {
            this.dibuja();
            this.actualiza();
            this.comprueba();
            this.extras();
        },
        dibuja: function() {
            this.dibujaTablero();
            this.serpiente.dibuja();
            this.manzana.dibuja();
            if(this.cereza != null) this.cereza.dibuja();
        },
        actualiza: function() {
            this.serpiente.mueve();
        },
        comprueba: function() {
            var xSize = Math.floor(this.canvas.size.x/8), ySize = Math.floor(this.canvas.size.y/8);
            var cabeza = this.serpiente.getCabeza();
            if(cabeza.x == this.manzana.x && cabeza.y == this.manzana.y) {
                this.manzana.setNew();
                this.serpiente.crece();
                this.subirDificultad();
            }
            if(this.cereza != null && cabeza.x == this.cereza.x && cabeza.y == this.cereza.y) {
                this.serpiente.crece(3);
                this.cereza = null;
                this.subirDificultad();
            }
            if(cabeza.x > xSize-1 || cabeza.x < 0 || cabeza.y > ySize-1 || cabeza.y < 0) { // Fuera de la pantalla
//                console.log('pierdes');
            }
            if(cabeza.x > xSize-1) {
                this.serpiente.setCabeza(0, cabeza.y);
            }
            if(cabeza.x < 0) {
                this.serpiente.setCabeza(xSize-1, cabeza.y);
            }
            if(cabeza.y > ySize-1) {
                this.serpiente.setCabeza(cabeza.x, 0);
            }
            if(cabeza.y < 0) {
                this.serpiente.setCabeza(cabeza.x, ySize-1);
            }
            var i = 0;
            this.serpiente.cuerpo.each(function(cuerpo){
                if(i != 0 && cabeza.x == cuerpo.x && cabeza.y == cuerpo.y) {
                    console.log("Chocado con si mismo");
                }
                i++;
            });
            
        },
        extras: function() {
            if(this.serpiente.size != this.lastExtrasScore && this.serpiente.size % 5 == 0 && this.cereza == null) {
                this.cereza = new Cereza(this.canvas);
            } else if (this.cereza != null) {
                this.cereza.timeOnScreen++;
                if(this.cereza.timeOnScreen == 50) {
                    this.cereza = null;
                }
            }
            this.lastExtrasScore = this.serpiente.size;
            $('canvas').tween('-webkit-transform', 'rotate('+((this.serpiente.size-3)*5)+'deg)');
        },
        subirDificultad: function() {
            this.currentSpeed -= 5;
            clearInterval(this.periodicalId);
            this.periodicalId = this.bucle.periodical(this.currentSpeed, this);
        },
        dibujaTablero: function() {
            this.canvas.fillStyle = "rgb(0,0,0)";
            this.canvas.fillRect (0, 0, this.canvas.size.x, this.canvas.size.y);
        }

    });
    juego = new Juego();
});
