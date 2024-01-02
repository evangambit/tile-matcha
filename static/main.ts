/// <reference path='./utils.ts' />

// Build with "$ sass static/css:dist && tsc"

namespace TileGame {


const kTilesPerSide = 15;
const kPadding = '1.5em';
const kBottomPanelHeight = '10vh';
const kBoardWidth = `min(calc(100vh - ${kBottomPanelHeight} - ${kPadding} * 2), calc(100vw - ${kPadding} * 2))`;
const kBoardHeight = `calc(${kBoardWidth} + ${kBottomPanelHeight})`;
const kTileSize = `calc(${kBoardWidth} / ${kTilesPerSide / 2 + 2})`;
const kStorageSize = 7;

const kIconUrls = [
  "noun-apple-991791.svg",
  "noun-banana-991759.svg",
  "noun-cake-991787.svg",
  "noun-candy-991790.svg",
  "noun-cheese-991774.svg",
  "noun-cherry-991775.svg",
  "noun-chili-peppers-991757.svg",
  "noun-cocktail-991788.svg",
  "noun-doughnut-991778.svg",
  "noun-fish-991796.svg",
  "noun-garlic-991782.svg",
  "noun-pineapple-991766.svg",
  "noun-pizza-991789.svg",
  "noun-soda-991779.svg",
  "noun-strawberry-991758.svg",
  "noun-watermelon-991761.svg",
];


class Tile extends HTMLElement {
  pos: Vec3;
  kind: number;
  isTransitioning: boolean;
  _onmousedown: (e: PointerEvent) => void;
  constructor(pos: Vec3, kind: number) {
    super();
    this.pos = pos;
    this.kind = kind;
    this.style.left = `calc(${kTileSize} / 2 * ${pos.x + 1.5 - pos.z * 0.03})`;
    this.style.top = `calc(${kTileSize} / 2 * ${pos.y + 1.5 + pos.z * 0.12})`;
    this.style.zIndex = `${pos.z}`;
    this.style.width = kTileSize;
    this.style.height = kTileSize;

    this._onmousedown = (e: PointerEvent) => {
      if (this.can_be_clicked()) {
        this.classList.add('stored');
        update_positions();
      }
    };
  }
  connectedCallback() {
    this.addEventListener('pointerdown', this._onmousedown);
    this.appendChild(makeTag('img', '', {}, {
      src: `./icons/${kIconUrls[this.kind]}`
    }));
  }
  disconnectedCallback() {
    this.removeEventListener('pointerdown', this._onmousedown);
  }
  number_blocking() {
    if (document.getElementsByClassName('stored').length >= kStorageSize) {
      return 999;
    }
    let tiles = <Array<Tile>>Array.from(document.getElementsByTagName('tilegame-tile'));
    let r = 0;
    for (let tile of tiles) {
      if (tile.isTransitioning || tile === this) {
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
  let stored = <Array<Tile>>Array.from(document.querySelectorAll('.stored'));
  stored.sort((a, b) => {
    return (<Tile>a).kind - (<Tile>b).kind;
  });

  let dict = {};
  for (let e of stored) {
    if (e.kind in dict) {
      dict[e.kind].push(e);
    } else {
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
  let arr = <Array<Tile>>Array.from(document.getElementsByTagName('tilegame-tile'));
  for (let tile of arr) {
    const n = tile.number_blocking();
    if (n === 0) {
      tile.style.backgroundColor = '#fff';
    } else if (n === 1) {
      tile.style.backgroundColor = '#999';
    } else {
      tile.style.backgroundColor = '#666';
    }
  }
}

const kStorageWidth = `calc(${kTileSize} * ${kStorageSize} * 1.1)`;
const kStorageLeft = `calc((${kBoardWidth} - ${kStorageWidth}) / 2)`;

export function main() {
  document.body.appendChild(modifyTag(makeTag('div', '', {
    position: 'absolute',
    top: '0.25em',
    right: '0.25em',
  }, {}), (element: HTMLElement) => {
    element.innerHTML = `Icons by IYIKON from <a href="https://thenounproject.com/" target="_blank" title="Strawberry Icons">Noun Project</a> (CC BY 3.0)`;
  }));

  document.body.appendChild(modifyTag(makeTag('div', '', {
    position: 'absolute',
    bottom: '0.25em',
    right: '0.25em',
  }, {}), (element: HTMLElement) => {
    element.innerHTML = `Code by <a href="https://github.com/evangambit">Morgan Redding</a>`;
  }));

  let board = modifyTag(makeTag('div'), (div) => {
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

  let storage = modifyTag(makeTag('div'), (div) => {
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
    let arr = <Array<Tile>>Array.from(document.getElementsByTagName('tilegame-tile'));
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
  shuffle(kinds);

  let numRetries = 0;
  while (kinds.length > 0 && numRetries < 100) {
    let x = Math.floor(Math.random() * (kTilesPerSide - 2)) + 1;
    let y = Math.floor(Math.random() * (kTilesPerSide - 2)) + 1;
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
    let tile = new Tile(new Vec3(x, y, z), kind);
    board.appendChild(tile);
  }

  if (numRetries >= 100) {
    console.log('Failed to generate board.');
  }

  update_positions();
}

}  //  namespace TileGame
