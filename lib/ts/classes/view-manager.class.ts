/**
 * @class ViewManager
 * @author Fokko Vos
 * @description ViewManager ist für das Verwalten der Ansicht verantwortlich, Entfernt ansichten aus dem HTML Context & fühgt ansichten in dem HTML Context
 */
class ViewManager {

    private wrapper: string;
    private views: Object;
    private view: HTMLDivElement;
    private viewName: ViewManagerViews | String;

    constructor(wrapper: String = 'wrapper') {
        // Für das einfügen der Views nötig
        this.wrapper = wrapper.toString();
        this.views = {};

        // Views sichern
        let viewsArr = document.getElementsByClassName('view-manager');
        for (const key in viewsArr) {
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

    public getWrapper(): string {
        return this.wrapper;
    }

    public setWrapper(wrapper: string): void {
        this.wrapper = wrapper;
    }

    public getViews(): Object {
        return this.views;
    }

    public setViews(views: Object): void {
        this.views = views;
    }

    public getView(): HTMLDivElement {
        return this.view;
    }

    public setView(view: HTMLDivElement): void {
        this.view = view;
    }

    public getViewName(): String {
        return this.viewName;
    }

    public setViewName(viewName: ViewManagerViews | String): void {
        this.viewName = viewName;
    }

    public fadeOut() {
        // Abbrechen wenn keine Elemente im Wrapper vorhanden sind
        if (get(this.wrapper).children.length == 0) return;
        // Erstes Kind des Wrapper Elements als "Target" markieren
        let elem = (<HTMLDivElement>get(this.wrapper).children[0]);

        // EVENT -> event-handlers::beforeviewFadeOut
        events.emit('beforeViewFadeOut', elem.getAttribute('data-view'));

        this._rTransClasses(elem);

        // Setzt die Klassen welche bennötigt werden
        elem.classList.add('transition-fadeOut', 'transition-500ms', 'transition');

        // Warten bis die Animation vollendet wurde
        setTimeout(() => {

            this._rTransClasses(elem);
            // Entfernt das Element anhand der ID aus dem HTML Context
            if (get(elem.id)) get(elem.id).remove();

            // EVENT -> event-handlers::afterViewFadeOut
            events.emit('afterViewFadeOut');
        }, 500);
    }

    public fadeIn(view: ViewManagerViews): void {
        if (document.getElementsByTagName('body')[0].getAttribute('data-view') == view) return;

        this.fadeOut();

        // HTML View Container
        let elem: HTMLDivElement = this.views[view];

        this._rTransClasses(elem);

        // Setzt die klassen für die CSS Animationen
        elem.classList.add('transition-clearfix', 'transition-fadeIn', 'transition-500ms', 'transition');

        get(this.wrapper).appendChild(elem);

        // EVENT -> event-handlers::beforeViewFadeIn
        events.emit('beforeViewFadeIn', elem.getAttribute('data-view'));

        setTimeout(() => {
            localStorage['sadv-view'] = elem.getAttribute('data-view');
            this.viewName = elem.getAttribute('data-view');
            this.view = elem;
            this._rTransClasses(elem);

            // EVENT -> event-handlers::afterViewFadeIn
            events.emit('afterViewFadeIn', elem.getAttribute('data-view'));
        }, 500);
    }

    // Entfernt alle Transition* Klassen
    private _rTransClasses(elem: HTMLDivElement): void {
        return elem.setAttribute('class', elem.getAttribute('class').replace(/(?:transition-\S*|transition)/g, ''));
    }

}

enum ViewManagerViews {
    levels = 'levels',
    game = 'game'
}