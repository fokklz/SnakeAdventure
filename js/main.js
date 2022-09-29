/**
 * @author Fokko Vos
 * @description Verschiedene Globale Anpassungen & Überprüfungen, Bereitstellung verschwiedener GLobaler Funktionen
 */
var indexOf;
var events;
/**
 * @description Wenn window.requestAnimationFrame nicht definiert, wird diese Funktion mit der Timeout Funktion immitiert
 */
if ((typeof window.requestAnimationFrame) === 'undefined') {
    window.requestAnimationFrame = function (callback) {
        return setTimeout(callback, 1000 / 60);
    };
}
/**
 * @description Fix für indexOf in Arrays wenn nicht existent
 */
if ((typeof Array.prototype.indexOf) === 'function') {
    indexOf = function (haystack, needle) {
        return haystack.indexOf(needle);
    };
}
else {
    indexOf = function (haystack, needle) {
        var i = 0, length = haystack.length, idx = -1, found = false;
        while (i < length && !found) {
            if (haystack[i] === needle) {
                idx = i;
                found = true;
            }
            i++;
        }
        return idx;
    };
}
/**
 * @description StartsWith erstellung da diese Funktion in Vanilla JS nicht existiert
 */
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString) {
        var position = 0;
        return this.indexOf(searchString, position) === position;
    };
}
/**
 * GLOBALE FUNKTIONEN
 *******************************************************************************************************************/
/**
 * @description Vereinfacht 'document.getElementById'
 *
 * @param id String
 *
 * @returns HTMLElement
 */
function get(id) {
    return document.getElementById(id);
}
/**
 * @description Erstellt eine Random einzigartige ID
 *
 * @returns String
 */
function generateUUID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
/**
 * @description
 *
 * @param min Number
 * @param max Number
 */
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getDistance(x1, x2, y1, y2) {
    var xDistance = x2 - x1;
    var yDistance = y2 - y1;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}
/**
 * @class EventEmitter
 * @author Fokko Vos
 * @description Eventemitter wird zu überwachung & Ausführung von globalen Events genutzt
 */
var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this.events = {};
    }
    EventEmitter.prototype.on = function (event, listener) {
        var e = event.toString();
        if (typeof this.events[e] !== 'object') {
            this.events[e] = [];
        }
        this.events[e].push(listener);
    };
    EventEmitter.prototype.removeListener = function (event, listener) {
        var idx;
        var e = event.toString();
        if (typeof this.events[e] === 'object') {
            idx = indexOf(this.events[e], listener);
            if (idx > -1) {
                this.events[e].splice(idx, 1);
            }
        }
    };
    EventEmitter.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var e = event.toString();
        var i, listeners, length = args;
        if (typeof this.events[e] === 'object') {
            listeners = this.events[e].slice();
            length = listeners.length;
            for (i = 0; i < length; i++) {
                listeners[i].apply(this, args);
            }
        }
    };
    EventEmitter.prototype.once = function (event, listener) {
        var e = event.toString();
        this.on(e, function g() {
            this.removeListener(event, g);
            listener.apply(this, arguments);
        });
    };
    return EventEmitter;
}());
if (!(events instanceof EventEmitter)) {
    events = new EventEmitter();
}
/**
 * @class ViewManager
 * @author Fokko Vos
 * @description ViewManager ist für das Verwalten der Ansicht verantwortlich, Entfernt ansichten aus dem HTML Context & fühgt ansichten in dem HTML Context
 */
var ViewManager = /** @class */ (function () {
    function ViewManager(wrapper) {
        if (wrapper === void 0) { wrapper = 'wrapper'; }
        // Für das einfügen der Views nötig
        this.wrapper = wrapper.toString();
        this.views = {};
        // Views sichern
        var viewsArr = document.getElementsByClassName('view-manager');
        for (var key in viewsArr) {
            if (viewsArr.hasOwnProperty(key)) {
                if (!isNaN(parseInt(key))) {
                    viewsArr[key].id = generateUUID();
                    this.views[viewsArr[key].getAttribute("data-view")] = viewsArr[key];
                }
            }
        }
        // Localstorage Untstüzung für eine Nutzerfreundlichere Oberfläche
        if (localStorage['sadv-view'] == null || localStorage['sadv-view'] == undefined || localStorage['sadv-view'] == "" || localStorage['sadv-view'] == ViewManagerViews.game) {
            localStorage['sadv-view'] = ViewManagerViews.levels;
        }
        // Loop läuft so lange bis alle Elemente aus dem Wrapper gelöscht wurden
        while (get(this.wrapper).children.length > 0) {
            get(this.wrapper).children[0].remove();
        }
        this.fadeIn(localStorage['sadv-view']);
        events.emit('afterViewManagerInit');
    }
    ViewManager.prototype.getWrapper = function () {
        return this.wrapper;
    };
    ViewManager.prototype.setWrapper = function (wrapper) {
        this.wrapper = wrapper;
    };
    ViewManager.prototype.getViews = function () {
        return this.views;
    };
    ViewManager.prototype.setViews = function (views) {
        this.views = views;
    };
    ViewManager.prototype.getView = function () {
        return this.view;
    };
    ViewManager.prototype.setView = function (view) {
        this.view = view;
    };
    ViewManager.prototype.getViewName = function () {
        return this.viewName;
    };
    ViewManager.prototype.setViewName = function (viewName) {
        this.viewName = viewName;
    };
    ViewManager.prototype.fadeOut = function () {
        var _this = this;
        // Abbrechen wenn keine Elemente im Wrapper vorhanden sind
        if (get(this.wrapper).children.length == 0)
            return;
        // Erstes Kind des Wrapper Elements als "Target" markieren
        var elem = get(this.wrapper).children[0];
        // EVENT -> event-handlers::beforeviewFadeOut
        events.emit('beforeViewFadeOut', elem.getAttribute('data-view'));
        this._rTransClasses(elem);
        // Setzt die Klassen welche bennötigt werden
        elem.classList.add('transition-fadeOut', 'transition-500ms', 'transition');
        // Warten bis die Animation vollendet wurde
        setTimeout(function () {
            _this._rTransClasses(elem);
            // Entfernt das Element anhand der ID aus dem HTML Context
            if (get(elem.id))
                get(elem.id).remove();
            // EVENT -> event-handlers::afterViewFadeOut
            events.emit('afterViewFadeOut');
        }, 500);
    };
    ViewManager.prototype.fadeIn = function (view) {
        var _this = this;
        if (document.getElementsByTagName('body')[0].getAttribute('data-view') == view)
            return;
        this.fadeOut();
        // HTML View Container
        var elem = this.views[view];
        this._rTransClasses(elem);
        // Setzt die klassen für die CSS Animationen
        elem.classList.add('transition-clearfix', 'transition-fadeIn', 'transition-500ms', 'transition');
        get(this.wrapper).appendChild(elem);
        // EVENT -> event-handlers::beforeViewFadeIn
        events.emit('beforeViewFadeIn', elem.getAttribute('data-view'));
        setTimeout(function () {
            localStorage['sadv-view'] = elem.getAttribute('data-view');
            _this.viewName = elem.getAttribute('data-view');
            _this.view = elem;
            _this._rTransClasses(elem);
            // EVENT -> event-handlers::afterViewFadeIn
            events.emit('afterViewFadeIn', elem.getAttribute('data-view'));
        }, 500);
    };
    // Entfernt alle Transition* Klassen
    ViewManager.prototype._rTransClasses = function (elem) {
        return elem.setAttribute('class', elem.getAttribute('class').replace(/(?:transition-\S*|transition)/g, ''));
    };
    return ViewManager;
}());
var ViewManagerViews;
(function (ViewManagerViews) {
    ViewManagerViews["levels"] = "levels";
    ViewManagerViews["game"] = "game";
})(ViewManagerViews || (ViewManagerViews = {}));
/**
 * @class Level
 * @author Fokko Vos & Matthias Rabbe
 * @description Level ist für die Level Gennerierung verantwortlich
 */
var Level = /** @class */ (function () {
    function Level(num) {
        this.num = 0;
        this.baseBlocksMax = 120;
        this.baseAtOnce = 30;
        this.num = parseInt(num.toString());
        this.blocksMax = Math.ceil(this.baseBlocksMax * (this.num * 0.8));
        this.atOnce = Math.ceil(this.baseAtOnce * (this.num * 0.4)) + 5;
        this.stayMin = 2;
        this.stayMax = 3;
        this.playerMaxLength = Math.ceil(12 * this.num);
        if (this.atOnce > 200)
            this.atOnce = 200;
    }
    Level.prototype.generateBlock = function () {
        var x = getRandom(0, window.innerWidth);
        var y = getRandom(0, window.innerHeight);
        var size = getRandom(window.innerWidth / 100 * getRandom(7, 9), window.innerHeight / 100 * getRandom(9, 12));
        return {
            x: x,
            y: y,
            size: size,
            until: Date.now() + (getRandom(10, 12) * 1000),
            opacity: 1,
            R: getRandom(100, 220),
            G: getRandom(100, 220),
            B: getRandom(100, 220)
        };
    };
    return Level;
}());
/**
 * @class Player
 * @author Fokko Vos & Matthias Rabbe
 * @description Player ist sowohl für die Daten so wie auch für die Logik des Spielers Verantwortlich
 */
var Player = /** @class */ (function () {
    function Player(level) {
        var _this = this;
        this.snake = [];
        this.snakeTimeout = 0;
        this.blocks = [];
        this.paused = false;
        this.finished = false;
        this.handleKeyDown = function (e) {
            switch (e.keyCode) {
                case 39: // RIGHT
                case 68:
                    _this.moveAngleDown();
                    break;
                case 37: // LEFT
                case 65:
                    _this.moveAngleUp();
                    break;
                case 27:
                    _this.pause();
                    break;
            }
        };
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
    Player.prototype.moveAngleUp = function () {
        /** Angle Addieren */
        this.angle += this.angleChange;
    };
    Player.prototype.moveAngleDown = function () {
        /** Angle Subtraieren */
        this.angle -= this.angleChange;
    };
    Player.prototype.move = function () {
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
    };
    Player.prototype.updatePercent = function () {
        /** Score in Prozent */
        this.percent = Math.round((this.score / this.level.blocksMax) * 100);
        events.emit('SADV_GAME_STATS', this);
    };
    Player.prototype.checkCollision = function () {
        /** Ausserhalb des Canvas */
        if (this.posX > window.innerWidth || this.posX < 0 || this.posY > window.innerHeight || this.posY < 0) {
            return true;
        }
        /** Inerhalb der eingenen Schlange */
        if (this.snake.length > 10) {
            for (var i = 0; i < this.snake.length - 10; i++) {
                var snakeObj = this.snake[i];
                var distance = getDistance(this.posX, snakeObj['x'], this.posY, snakeObj['y']);
                if (distance < this.radius) {
                    return true;
                }
            }
        }
        /** Inerhalb eines Blocks */
        for (var i = 0; i < this.blocks.length; i++) {
            var block = this.blocks[i];
            /** Block löschen & Neuen generieren */
            if (block['until'] < Date.now() && block['opacity'] == 0) {
                this.blocks.splice(i, 1);
                this.generateBlock();
                this.score++;
                continue;
            }
            if (block['opacity'] == 0)
                continue;
            if (this.posX > block['x'] && this.posX < block['x'] + block['size'] && this.posY > block['y'] && this.posY < block['y'] + block['size']) {
                return true;
            }
        }
        return false;
    };
    Player.prototype.draw = function () {
        var _this = this;
        /** Canvas Leeren */
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        /** Blocks */
        for (var i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i]['opacity'] == 0)
                continue;
            if (this.blocks[i]['opacity'] != 0 && this.blocks[i]['until'] < Date.now()) {
                this.blocks[i]['opacity'] = 0;
                continue;
            }
            this.ctx.beginPath();
            this.ctx.fillStyle = "rgba(" + this.blocks[i]["R"] + ", " + this.blocks[i]["G"] + ", " + this.blocks[i]["B"] + ", " + this.blocks[i]["opacity"] + ")";
            this.ctx.fillRect(this.blocks[i]['x'], this.blocks[i]['y'], this.blocks[i]['size'], this.blocks[i]['size']);
        }
        /** Snake */
        this.ctx.beginPath();
        this.snake.forEach(function (sc, i) {
            if (i > 0) {
                // Maybe change to lineto
                _this.ctx.moveTo(_this.snake[i - 1]['x'], _this.snake[i - 1]['y']);
                _this.ctx.lineTo(sc['x'], sc['y']);
            }
        });
        this.ctx.lineTo(this.posX, this.posY);
        this.ctx.stroke();
    };
    Player.prototype.generateBlock = function () {
        var block = this.level.generateBlock();
        /** Abstand zwischen schlangen-Kopf & Block */
        var distance = getDistance(this.posX, block['x'], this.posY, block['y']);
        if (distance > block['size'] * 2) {
            this.blocks.push(block);
        }
        else {
            this.generateBlock();
        }
    };
    Player.prototype.pause = function () {
        if (this.paused)
            return this.resume();
        this.paused = true;
        if (!get('sadv-canvas-wrapper').classList.contains('pause'))
            get('sadv-canvas-wrapper').classList.add('pause');
        get('sadv-pause-img').style.backgroundImage = "url(" + this.canvas.toDataURL() + ")";
    };
    Player.prototype.finish = function (full) {
        if (full === void 0) { full = false; }
        this.paused = true;
        this.finished = true;
        if (full)
            get('sadv-canvas-wrapper').classList.add('full-finish');
        if (get('sadv-canvas-wrapper').classList.contains('pause'))
            get('sadv-canvas-wrapper').classList.remove('pause');
        if (!get('sadv-canvas-wrapper').classList.contains('finish'))
            get('sadv-canvas-wrapper').classList.add('finish');
        get('sadv-pause-img').style.backgroundImage = "url(" + this.canvas.toDataURL() + ")";
    };
    Player.prototype.resume = function () {
        this.paused = false;
        if (get('sadv-canvas-wrapper').classList.contains('pause'))
            get('sadv-canvas-wrapper').classList.remove('pause');
    };
    return Player;
}());
/**
 * @class Game
 * @author Fokko Vos & Matthias Rabbe
 * @description Game ist für das Verwalten des Games verantwortlich
 */
var Game = /** @class */ (function () {
    function Game() {
        var _this = this;
        this.levelCount = 1;
        this.handleAnimationFrames = function () {
            window.requestAnimationFrame(_this.handleAnimationFrames);
            if (_this.player && !_this.player.paused) {
                _this.player.move();
                _this.player.updatePercent();
                if (_this.player.checkCollision()) {
                    return _this.finish();
                }
                if (_this.player.score >= _this.player.level.blocksMax) {
                    _this.player.score = _this.player.level.blocksMax;
                    _this.player.percent = 100;
                    events.emit('SADV_GAME_STATS', _this.player);
                    return _this.finish(true);
                }
                _this.player.draw();
            }
        };
        events.on('beforeViewFadeIn', function (view) {
            document.getElementsByTagName('body')[0].setAttribute('data-view', view);
            _this.reset();
            switch (view) {
                case ViewManagerViews.levels:
                    _this.loadLevelsTemplate();
                    break;
                case ViewManagerViews.game:
                    _this.player = new Player(localStorage['sadv-active']);
                    _this.loadGameTemplate();
                    break;
            }
        });
        this.viewManager = new ViewManager();
        window.requestAnimationFrame(this.handleAnimationFrames);
    }
    Game.prototype.start = function (level) {
        localStorage['sadv-active'] = level.toString();
        this.viewManager.fadeIn(ViewManagerViews.game);
    };
    Game.prototype.changeLevel = function (level) {
        if (this.viewManager.getViewName() == ViewManagerViews.game) {
            this.player = new Player(level);
            this.loadGameTemplate();
        }
        else {
            this.start(level);
        }
    };
    Game.prototype.openLevels = function () {
        this.viewManager.fadeIn(ViewManagerViews.levels);
    };
    Game.prototype.finish = function (full) {
        if (full === void 0) { full = false; }
        this.updatePlayer();
        this.player.finish(full);
    };
    Game.prototype.reset = function () {
        this.player = null;
    };
    Game.prototype.loadLevelsTemplate = function () {
        var _this = this;
        while (localStorage['sadv-level-' + this.levelCount] != null && localStorage['sadv-level-' + this.levelCount] != undefined) {
            this.levelCount++;
        }
        var levels = document.createElement('div');
        var _loop_1 = function (i) {
            var level = document.createElement('div');
            level.id = (i + 1).toString();
            level.classList.add('btn-lvl');
            level.setAttribute('data-percent', this_1.calcLevelPercentage(i + 1, localStorage['sadv-level-' + (i + 1)]).toString());
            level.addEventListener('click', function (e) {
                _this.start(i + 1);
            });
            level.innerHTML = '<h1>' + (i + 1).toString() + '</h1>';
            levels.appendChild(level);
        };
        var this_1 = this;
        for (var i = 0; i < this.levelCount; i++) {
            _loop_1(i);
        }
        get('levels').innerHTML = "";
        get('levels').appendChild(levels);
        if (!get('levels').classList.contains('loaded'))
            get('levels').classList.add('loaded');
    };
    Game.prototype.loadGameTemplate = function () {
        var _this = this;
        if (localStorage['sadv-active'] != null && localStorage['sadv-active'] != undefined) {
            if (get('sadv-canvas-wrapper').classList.contains('pause'))
                get('sadv-canvas-wrapper').classList.remove('pause');
            if (get('sadv-canvas-wrapper').classList.contains('finish'))
                get('sadv-canvas-wrapper').classList.remove('finish');
            if (get('sadv-canvas-wrapper').classList.contains('full-finish'))
                get('sadv-canvas-wrapper').classList.remove('full-finish');
            var percent = this.player.percent || 0;
            get('sadv-proggress').setAttribute("data-percent", percent.toString());
            get('sadv-score').innerText = this.player.score.toString();
            get('sadv-max-blocks').innerText = this.player.level.blocksMax.toString();
            get('sadv-btn-resume').addEventListener('click', function () {
                _this.player.resume();
            });
            get('sadv-btn-levels').addEventListener('click', function () {
                _this.openLevels();
            });
            get('sadv-btn-retry').addEventListener('click', function () {
                _this.changeLevel(_this.player.level.num);
            });
            get('sadv-btn-next-level').addEventListener('click', function () {
                _this.changeLevel(_this.player.level.num + 1);
            });
        }
        else {
            this.openLevels();
        }
    };
    Game.prototype.updatePlayer = function () {
        if (localStorage['sadv-level-' + this.player.level.num]) {
            if (!(localStorage['sadv-level-' + this.player.level.num] > this.player.score)) {
                localStorage['sadv-level-' + this.player.level.num] = this.player.score;
            }
        }
        else {
            localStorage['sadv-level-' + this.player.level.num] = this.player.score;
        }
    };
    Game.prototype.calcLevelPercentage = function (level, score) {
        if (!score)
            score = 0;
        var lvl = new Level(level);
        var perc = Math.round(parseInt(score.toString()) / lvl.blocksMax) * 100;
        if (perc > 100)
            perc = 100;
        if (perc < 0)
            perc = 0;
        return perc;
    };
    return Game;
}());
events.on('SADV_GAME_STATS', function (p) {
    if (gameClass.viewManager.getViewName() == ViewManagerViews.game) {
        get('sadv-proggress').setAttribute("data-percent", p.percent.toString());
        get('sadv-score').innerText = p.score.toString();
    }
});
var gameClass = new Game();
