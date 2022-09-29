/**
 * @class Game
 * @author Fokko Vos & Matthias Rabbe
 * @description Game ist für das Verwalten des Games verantwortlich
 */
class Game {

    viewManager: ViewManager;
    player: Player;

    levelCount: number = 1;

    constructor() {
        events.on('beforeViewFadeIn', (view: ViewManagerViews) => {
            document.getElementsByTagName('body')[0].setAttribute('data-view', view);

            this.reset();

            switch (view) {
                case ViewManagerViews.levels:
                    this.loadLevelsTemplate();
                    break;
                case ViewManagerViews.game:
                    this.player = new Player(localStorage['sadv-active']);
                    this.loadGameTemplate();
                    break;
            }
        });

        this.viewManager = new ViewManager();

        window.requestAnimationFrame(this.handleAnimationFrames);
    }

    start(level: Number) {
        localStorage['sadv-active'] = level.toString();
        this.viewManager.fadeIn(ViewManagerViews.game);
    }

    changeLevel(level: Number) {
        if (this.viewManager.getViewName() == ViewManagerViews.game) {
            this.player = new Player(level);
            this.loadGameTemplate();
        } else {
            this.start(level);
        }
    }

    openLevels() {
        this.viewManager.fadeIn(ViewManagerViews.levels);
    }

    finish(full: Boolean = false) {
        this.updatePlayer();
        this.player.finish(full);
    }

    reset() {
        this.player = null;
    }

    loadLevelsTemplate() {
        while (localStorage['sadv-level-' + this.levelCount] != null && localStorage['sadv-level-' + this.levelCount] != undefined) {
            this.levelCount++;
        }

        let levels = document.createElement('div');

        for (let i = 0; i < this.levelCount; i++) {
            let level = document.createElement('div');
            level.id = (i + 1).toString();
            level.classList.add('btn-lvl');
            level.setAttribute('data-percent', this.calcLevelPercentage(i + 1, localStorage['sadv-level-' + (i + 1)]).toString());

            level.addEventListener('click', (e) => {
                this.start(i + 1);
            });

            level.innerHTML = '<h1>' + (i + 1).toString() + '</h1>';
            levels.appendChild(level);
        }

        get('levels').innerHTML = "";
        get('levels').appendChild(levels);
        if (!get('levels').classList.contains('loaded')) get('levels').classList.add('loaded');
    }

    loadGameTemplate() {
        if (localStorage['sadv-active'] != null && localStorage['sadv-active'] != undefined) {
            if (get('sadv-canvas-wrapper').classList.contains('pause')) get('sadv-canvas-wrapper').classList.remove('pause');
            if (get('sadv-canvas-wrapper').classList.contains('finish')) get('sadv-canvas-wrapper').classList.remove('finish');
            if (get('sadv-canvas-wrapper').classList.contains('full-finish')) get('sadv-canvas-wrapper').classList.remove('full-finish');

            let percent = this.player.percent || 0;

            get('sadv-proggress').setAttribute("data-percent", percent.toString());
            get('sadv-score').innerText = this.player.score.toString();
            get('sadv-max-blocks').innerText = this.player.level.blocksMax.toString();

            get('sadv-btn-resume').addEventListener('click', () => {
                this.player.resume();
            });

            get('sadv-btn-levels').addEventListener('click', () => {
                this.openLevels()
            });

            get('sadv-btn-retry').addEventListener('click', () => {
                this.changeLevel(this.player.level.num);
            })

            get('sadv-btn-next-level').addEventListener('click', () => {
                this.changeLevel(this.player.level.num + 1);
            });
        } else {
            this.openLevels();
        }
    }

    updatePlayer() {
        if (localStorage['sadv-level-' + this.player.level.num]) {
            if (!(localStorage['sadv-level-' + this.player.level.num] > this.player.score)) {
                localStorage['sadv-level-' + this.player.level.num] = this.player.score;
            }
        } else {
            localStorage['sadv-level-' + this.player.level.num] = this.player.score;
        }
    }

    calcLevelPercentage(level: Number, score: Number) {
        if (!score) score = 0;
        let lvl = new Level(level);
        let perc = Math.round(parseInt(score.toString()) / lvl.blocksMax) * 100;

        if (perc > 100) perc = 100;
        if (perc < 0) perc = 0;
        return perc;
    }

    handleAnimationFrames = () => {
        window.requestAnimationFrame(this.handleAnimationFrames);

        if (this.player && !this.player.paused) {

            this.player.move();
            this.player.updatePercent();

            if (this.player.checkCollision()) {
                return this.finish();
            }

            if (this.player.score >= this.player.level.blocksMax) {
                this.player.score = this.player.level.blocksMax;
                this.player.percent = 100;
                events.emit('SADV_GAME_STATS', this.player);
                return this.finish(true);
            }

            this.player.draw();

        }
    }

}