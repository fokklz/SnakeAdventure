events.on('SADV_GAME_STATS', (p: Player) => {
    if (gameClass.viewManager.getViewName() == ViewManagerViews.game) {
        get('sadv-proggress').setAttribute("data-percent", p.percent.toString());
        get('sadv-score').innerText = p.score.toString();
    }
});

var gameClass = new Game();