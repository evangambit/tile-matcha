var TileGame;
(function (TileGame) {
    function makeTag(tag, innerHTML = '', style = {}, attr = {}) {
        let r = document.createElement(tag);
        r.innerHTML = innerHTML;
        for (let k in style) {
            r.style[k] = style[k];
        }
        for (let k in attr) {
            r.setAttribute(k, attr[k]);
        }
        return r;
    }
    TileGame.makeTag = makeTag;
    function modifyTag(tag, f) {
        f(tag);
        return tag;
    }
    TileGame.modifyTag = modifyTag;
    class Vec3 {
        constructor(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        toString() {
            return `(${this.x}, ${this.y}, ${this.z})`;
        }
    }
    TileGame.Vec3 = Vec3;
    function shuffle(A) {
        for (let i = A.length - 1; i > 0; --i) {
            let j = Math.floor(Math.random() * (i + 1));
            let tmp = A[i];
            A[i] = A[j];
            A[j] = tmp;
        }
    }
    TileGame.shuffle = shuffle;
})(TileGame || (TileGame = {})); // namespace Second
/// <reference path='./utils.ts' />
var TileGame;
(function (TileGame) {
    const kTilesPerSide = 13;
    const kPadding = '1.5em';
    const kBottomPanelHeight = '10vh';
    const kBoardWidth = `min(calc(100vh - ${kBottomPanelHeight} - ${kPadding} * 2), calc(100vw - ${kPadding} * 2))`;
    const kBoardHeight = `calc(${kBoardWidth} + ${kBottomPanelHeight})`;
    const kTileSize = `calc(${kBoardWidth} / ${kTilesPerSide / 2 + 2})`;
    const kStorageSize = 7;
    const kIconUrls = [
        "🐼",
        "🦊",
        "🐶",
        "🐱",
        "🐢",
        "🦋",
        "🐙",
        "🦧",
        "🐳",
        "🐄",
        "🐎",
        "🦢",
        "🦥",
        "🦨",
        "🐓",
        "🦬",
        "🐿",
        // "🦔",
    ];
    class Tile extends HTMLElement {
        constructor(pos, kind) {
            super();
            this.pos = pos;
            this.kind = kind;
            this.style.left = `calc(${kTileSize} / 2 * ${pos.x + 1.5 - pos.z * 0.03})`;
            this.style.top = `calc(${kTileSize} / 2 * ${pos.y + 1.5 + pos.z * 0.12})`;
            this.style.zIndex = `${pos.z}`;
            this.style.width = kTileSize;
            this.style.height = kTileSize;
            this.style.overflow = 'hidden';
            this.style.backgroundColor = 'white';
            this._onmousedown = (e) => {
                if (this.classList.contains('removed') || this.classList.contains('stored')) {
                    return;
                }
                if (this.can_be_clicked()) {
                    this.classList.add('stored');
                    update_positions();
                }
            };
        }
        connectedCallback() {
            this.addEventListener('pointerdown', this._onmousedown);
            this.appendChild(TileGame.makeTag('div', kIconUrls[this.kind], {
                "font-size": `calc(${kTileSize})`,
                "text-align": "center",
                "position": "absolute",
                "top": "-0.12em",
            }, {}));
        }
        disconnectedCallback() {
            this.removeEventListener('pointerdown', this._onmousedown);
        }
        number_blocking() {
            if (document.getElementsByClassName('stored').length >= kStorageSize) {
                return 999;
            }
            let tiles = Array.from(document.getElementsByTagName('tilegame-tile'));
            let r = 0;
            for (let tile of tiles) {
                if (tile === this) {
                    continue;
                }
                if (tile.classList.contains('stored')) {
                    continue;
                }
                if (tile.classList.contains('removed')) {
                    continue;
                }
                if (Math.abs(this.pos.x - tile.pos.x) > 1.5) {
                    continue;
                }
                if (Math.abs(this.pos.y - tile.pos.y) > 1.5) {
                    continue;
                }
                if (tile.pos.z > this.pos.z) {
                    r += tile.number_blocking() + 1;
                }
            }
            return r;
        }
        can_be_clicked() {
            return this.number_blocking() == 0;
        }
    }
    customElements.define('tilegame-tile', Tile);
    function update_positions() {
        let stored = Array.from(document.querySelectorAll('.stored'));
        stored.sort((a, b) => {
            return a.kind - b.kind;
        });
        let dict = {};
        for (let e of stored) {
            if (e.kind in dict) {
                dict[e.kind].push(e);
            }
            else {
                dict[e.kind] = [e];
            }
        }
        let toRemove = [];
        for (let k in dict) {
            if (dict[k].length >= 3) {
                for (let i = 0; i < 3; ++i) {
                    toRemove.push(dict[k][i]);
                    dict[k][i].classList.remove('stored');
                    dict[k][i].classList.add('removed');
                    stored.splice(stored.indexOf(dict[k][i]), 1);
                }
            }
        }
        for (let i = 0; i < stored.length; ++i) {
            let e = stored[i];
            e.style.transitionDuration = '0.4s';
            e.style.top = `calc(${kBoardWidth} + ${kTileSize} * 0.55)`;
            e.style.left = `calc(${kStorageLeft} + ${i + 0.5} * ${kTileSize} * 1.1)`;
            e.ontransitionend = () => {
                e.style.transitionDuration = '0s';
            };
        }
        for (let ele of toRemove) {
            ele.style.transitionDuration = '0.4s';
            ele.style.opacity = '0';
            ele.ontransitionend = () => {
                ele.remove();
            };
        }
        // Update lighting.
        let arr = Array.from(document.getElementsByTagName('tilegame-tile'));
        for (let tile of arr) {
            const n = tile.number_blocking();
            if (n === 0) {
                tile.style.filter = 'brightness(100%)';
            }
            else if (n === 1) {
                tile.style.filter = 'brightness(50%)';
            }
            else {
                tile.style.filter = 'brightness(25%)';
            }
        }
    }
    const kStorageWidth = `calc(${kTileSize} * ${kStorageSize} * 1.1)`;
    const kStorageLeft = `calc((${kBoardWidth} - ${kStorageWidth}) / 2)`;
    function main() {
        document.body.appendChild(TileGame.modifyTag(TileGame.makeTag('div', '', {
            position: 'absolute',
            top: '0.25em',
            right: '0.25em',
        }, {}), (element) => {
            element.innerHTML = `Game by <a href="https://github.com/evangambit">Morgan Redding</a>`;
        }));
        let board = TileGame.modifyTag(TileGame.makeTag('div'), (div) => {
            // Make div the largest square that can fit on the board.
            div.style.position = 'absolute';
            div.style.width = kBoardWidth;
            div.style.height = kBoardHeight;
            // Center div
            div.style.left = '50%';
            div.style.top = kPadding;
            div.style.transform = 'translate(-50%, 0)';
            // Etc.
            div.style.overflow = 'hidden';
        });
        document.body.appendChild(board);
        let storage = TileGame.modifyTag(TileGame.makeTag('div'), (div) => {
            // Make div the largest square that can fit on the board.
            div.style.position = 'absolute';
            div.style.width = kStorageWidth;
            div.style.backgroundColor = 'white';
            div.style.height = `calc(${kTileSize} * 1.1)`;
            // Center div
            div.style.left = kStorageLeft;
            div.style.top = kBoardWidth;
            // Etc.
            div.style.border = '1px solid white';
            div.style.overflow = 'hidden';
        });
        board.appendChild(storage);
        const has_conflicts = (x, y, z) => {
            let arr = Array.from(document.getElementsByTagName('tilegame-tile'));
            return arr.filter((tile) => {
                if (tile.pos.z !== z) {
                    return false;
                }
                if (Math.abs(tile.pos.x - x) > 1.5) {
                    return false;
                }
                if (Math.abs(tile.pos.y - y) > 1.5) {
                    return false;
                }
                return true;
            }).length > 0;
        };
        let kinds = [];
        for (let i = 0; i < 20; ++i) {
            const kind = Math.random() * kIconUrls.length | 0;
            for (let j = 0; j < 3; ++j) {
                kinds.push(kind);
            }
        }
        TileGame.shuffle(kinds);
        let numRetries = 0;
        while (kinds.length > 0 && numRetries < 100) {
            let x = Math.floor(Math.random() * (kTilesPerSide));
            let y = Math.floor(Math.random() * (kTilesPerSide));
            let z = 0;
            let kind = kinds.pop();
            while (has_conflicts(x, y, z)) {
                ++z;
            }
            if (z > 6) {
                kinds.push(kind);
                numRetries++;
                continue;
            }
            let tile = new Tile(new TileGame.Vec3(x, y, z), kind);
            board.appendChild(tile);
        }
        if (numRetries >= 100) {
            console.log('Failed to generate board.');
        }
        update_positions();
    }
    TileGame.main = main;
})(TileGame || (TileGame = {})); //  namespace TileGame
