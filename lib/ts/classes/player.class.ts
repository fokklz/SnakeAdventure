/**
 * @class Player
 * @author Fokko Vos & Matthias Rabbe
 * @description Player ist sowohl für die Daten so wie auch für die Logik des Spielers Verantwortlich
 */
class Player {

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    score: number;
    percent: number;

    posX: number;
    posY: number;
    speed: number;
    radius: number;
    maxLength: number;

    angle: number;
    angleChange: number;

    snake: Array<Object> = [];
    snakeTimeout: number = 0;

    level: Level;
    blocks: Array<Object> = [];
    paused: Boolean = false;
    finished: Boolean = false;

    constructor(level: Number) {
        this.canvas = document.getElementsByTagName('canvas')[0];
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 75;

        this.score = 0;

        this.posX = window.innerWidth / 2;
        this.posY = window.innerHeight / 2;
        this.speed = 0.7;
        this.radius = 5;

        this.angle = 10;
        this.angleChange = 0.05;

        this.ctx.strokeStyle = "red";
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";
        this.ctx.lineWidth = this.radius;

        events.emit('beforePlayerLevel', this);
        this.level = new Level(level);
        this.maxLength = this.level.playerMaxLength;

        while (this.blocks.length < this.level.atOnce) {
            this.generateBlock();
        }

        document.addEventListener('keydown', this.handleKeyDown);
    }

    moveAngleUp() {
        /** Angle Addieren */
        this.angle += this.angleChange;
    }

    moveAngleDown() {
        /** Angle Subtraieren */
        this.angle -= this.angleChange;
    }

    move() {
        /** Position alle 10 Ticks zur Schlange Hinzufügen */
        if (++this.snakeTimeout > 2) {
            this.snakeTimeout = 0;

            this.snake.push({
                x: this.posX,
                y: this.posY,
                angle: this.angle
            });
        }
        /** Positionen von der Schlange entfernen sobald die MaxLenght überschritten wird */
        if (this.snake.length > this.maxLength * 20) {
            this.snake.splice(0, this.snake.length - this.maxLength * 20);
        }

        /** Nächste position berechnen */
        this.posX += Math.sin(this.angle) * this.speed;
        this.posY += Math.cos(-this.angle) * this.speed;
    }

    updatePercent() {
        /** Score in Prozent */
        this.percent = Math.round((this.score / this.level.blocksMax) * 100);
        events.emit('SADV_GAME_STATS', this);
    }

    checkCollision() {
        /** Ausserhalb des Canvas */
        if (this.posX > window.innerWidth || this.posX < 0 || this.posY > window.innerHeight || this.posY < 0) {
            return true;
        }

        /** Inerhalb der eingenen Schlange */
        if (this.snake.length > 10) {
            for (let i = 0; i < this.snake.length - 10; i++) {
                let snakeObj = this.snake[i];
                let distance = getDistance(this.posX, snakeObj['x'], this.posY, snakeObj['y']);
                if (distance < this.radius) {
                    return true;
                }
            }
        }

        /** Inerhalb eines Blocks */
        for (let i = 0; i < this.blocks.length; i++) {
            let block = this.blocks[i];

            /** Block löschen & Neuen generieren */
            if (block['until'] < Date.now() && block['opacity'] == 0) {
                this.blocks.splice(i, 1);
                this.generateBlock();
                this.score++;
                continue;
            }

            if (block['opacity'] == 0) continue;

            if (this.posX > block['x'] && this.posX < block['x'] + block['size'] && this.posY > block['y'] && this.posY < block['y'] + block['size']) {
                return true;
            }
        }

        return false;
    }

    draw() {
        /** Canvas Leeren */
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        /** Blocks */
        for (let i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i]['opacity'] == 0) continue;
            if (this.blocks[i]['opacity'] != 0 && this.blocks[i]['until'] < Date.now()) {
                this.blocks[i]['opacity'] = 0;
                continue;
            }

            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(${this.blocks[i]["R"]}, ${this.blocks[i]["G"]}, ${this.blocks[i]["B"]}, ${this.blocks[i]["opacity"]})`;
            this.ctx.fillRect(this.blocks[i]['x'], this.blocks[i]['y'], this.blocks[i]['size'], this.blocks[i]['size']);
        }

        /** Snake */
        this.ctx.beginPath();
        this.snake.forEach((sc, i) => {
            if (i > 0) {
                // Maybe change to lineto
                this.ctx.moveTo(this.snake[i - 1]['x'], this.snake[i - 1]['y']);
                this.ctx.lineTo(sc['x'], sc['y']);
            }
        });
        this.ctx.lineTo(this.posX, this.posY);
        this.ctx.stroke();
    }

    generateBlock() {
        let block = this.level.generateBlock();

        /** Abstand zwischen schlangen-Kopf & Block */
        let distance = getDistance(this.posX, block['x'], this.posY, block['y']);

        if (distance > block['size'] * 2) {
            this.blocks.push(block);
        } else {
            this.generateBlock();
        }
    }

    pause() {
        if (this.paused) return this.resume();
        this.paused = true;
        if (!get('sadv-canvas-wrapper').classList.contains('pause')) get('sadv-canvas-wrapper').classList.add('pause');
        get('sadv-pause-img').style.backgroundImage = `url(${this.canvas.toDataURL()})`;
    }

    finish(full: Boolean = false) {
        this.paused = true;
        this.finished = true;

        if (full) get('sadv-canvas-wrapper').classList.add('full-finish');

        if (get('sadv-canvas-wrapper').classList.contains('pause')) get('sadv-canvas-wrapper').classList.remove('pause');
        if (!get('sadv-canvas-wrapper').classList.contains('finish')) get('sadv-canvas-wrapper').classList.add('finish');

        get('sadv-pause-img').style.backgroundImage = `url(${this.canvas.toDataURL()})`;
    }

    resume() {
        this.paused = false;
        if (get('sadv-canvas-wrapper').classList.contains('pause')) get('sadv-canvas-wrapper').classList.remove('pause');
    }

    handleKeyDown = (e) => {
        switch (e.keyCode) {
            case 39: // RIGHT
            case 68:
                this.moveAngleDown();
                break;
            case 37: // LEFT
            case 65:
                this.moveAngleUp();
                break;
            case 27:
                this.pause();
                break;
        }
    }

}