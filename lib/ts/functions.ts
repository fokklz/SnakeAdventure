/**
 * @author Fokko Vos
 * @description Verschiedene Globale Anpassungen & Überprüfungen, Bereitstellung verschwiedener GLobaler Funktionen
 */

var indexOf;
var events;

interface String {
    startsWith(searchString): Boolean;
}

/**
 * @description Wenn window.requestAnimationFrame nicht definiert, wird diese Funktion mit der Timeout Funktion immitiert
 */
if ((typeof window.requestAnimationFrame) === 'undefined') {
    window.requestAnimationFrame = (callback) => {
        return setTimeout(callback, 1000 / 60);
    }
}

/**
 * @description Fix für indexOf in Arrays wenn nicht existent
 */
if ((typeof Array.prototype.indexOf) === 'function') {
    indexOf = function (haystack, needle) {
        return haystack.indexOf(needle);
    };
} else {
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
        let position = 0;
        return this.indexOf(searchString, position) === position;
    }
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
function get(id): HTMLElement {
    return document.getElementById(id);
}

/**
 * @description Erstellt eine Random einzigartige ID
 * 
 * @returns String
 */
function generateUUID(): string {
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
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}