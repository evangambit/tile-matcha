/// <reference path='./utils.ts' />

namespace Second {


const kTilesPerSide = 15;
const kPadding = '20px';
const kBottomPanelHeight = '10vh';
const kBoardSize = `min(calc(100vh - ${kBottomPanelHeight} - ${kPadding} * 2), calc(100vw - ${kPadding} * 2))`;
const kTileSize = `calc(${kBoardSize} / ${kTilesPerSide / 2 + 2})`;
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
  "noun-cocktail-991797.svg",
  "noun-doughnut-991778.svg",
  "noun-fish-991796.svg",
  "noun-garlic-991782.svg",
  "noun-grapes-991771.svg",
  "noun-meat-991793.svg",
  "noun-pineapple-991766.svg",
  "noun-pizza-991789.svg",
  "noun-soda-991779.svg",
  "noun-strawberry-991758.svg",
  // "noun-tea-991763.svg",
  // "noun-watermelon-991761.svg",
];


// animals by IYIKON from <a href="https://thenounproject.com/browse/icons/term/animals/" target="_blank" title="animals Icons">Noun Project</a> (CC BY 3.0)

class Tile extends HTMLElement {
  pos: Vec3;
  kind: number;
  isTransitioning: boolean;
  _onmousedown: (e: PointerEvent) => void;
  constructor(pos: Vec3, kind: number) {
    super();
    this.pos = pos;
    this.kind = kind;
    this.style.boxSizing = 'border-box';
    this.style.position = 'absolute';
    this.style.left = `calc(${kTileSize} / 2 * ${pos.x + 1.5 - pos.z * 0.03})`;
    this.style.top = `calc(${kTileSize} / 2 * ${pos.y + 1.5 + pos.z * 0.12})`;
    this.style.zIndex = `${10 + pos.z}`;
    this.style.width = kTileSize;
    this.style.height = kTileSize;
    this.style.border = '1px solid black';
    this.style.boxSizing = 'border-box';
    this.style.transform = 'translate(-50%, -50%)';

    this._onmousedown = (e: PointerEvent) => {
      if (this.can_be_clicked()) {
        this.classList.add('stored');
        update_store();
      }
    };
    this.addEventListener('transitionstart', () => {
      this.isTransitioning = true;
    });
    this.addEventListener('transitionend', () => {
      this.isTransitioning = false;
      this.style.transitionDuration = '0s';
      maybe_remove_from_store();
    });
  }
  connectedCallback() {
    this.addEventListener('pointerdown', this._onmousedown);

    this.appendChild(modifyTag(makeTag('img'), (img) => {
      (<HTMLImageElement>img).src = `./icons/${kIconUrls[this.kind]}`;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      // img.style.filter = 'invert(1)';
    }));

    // if (this.kind == 0) {
    //   this.style.backgroundColor = '#a00';
    // } else if (this.kind == 1) {
    //   this.style.backgroundColor = '#0a0';
    // } else if (this.kind == 2) {
    //   this.style.backgroundColor = '#00a';
    // } else if (this.kind == 3) {
    //   this.style.backgroundColor = '#a0a';
    // } else if (this.kind == 4) {
    //   this.style.backgroundColor = '#0aa';
    // } else if (this.kind == 5) {
    //   this.style.backgroundColor = '#aa0';
    // }
    this.style.backgroundColor = '#fff';
  }
  disconnectedCallback() {
    this.removeEventListener('pointerdown', this._onmousedown);
  }
  number_blocking() {
    if (document.getElementsByClassName('stored').length >= kStorageSize) {
      return 999;
    }
    let tiles = <Array<Tile>>Array.from(document.getElementsByTagName('second-tile'));
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
customElements.define('second-tile', Tile);

function update_store() {
  let stored = <Array<Tile>>Array.from(document.querySelectorAll('.stored'));
  stored.sort((a, b) => {
    return (<Tile>a).kind - (<Tile>b).kind;
  });
  let remaining = stored.length;
  for (let i = 0; i < stored.length; ++i) {
    let e = <HTMLElement>stored[i];
    e.style.transitionDuration = '0.4s';
    // e.style.top = `calc(${kBoardSize} + ${kPadding} + ${kTileSize} * 0.05)`;
    e.style.top = ``;
    e.style.bottom = `calc(${kTileSize} * -0.45)`;
    e.style.left = `calc(${kStorageLeft} + ${i + 0.5} * ${kTileSize} * 1.1)`;
  }

  let arr = <Array<Tile>>Array.from(document.getElementsByTagName('second-tile'));
  for (let tile of arr) {
    const n = tile.number_blocking();
    if (n === 0) {
      tile.style.backgroundColor = 'white';
    } else if (n === 1) {
      tile.style.backgroundColor = '#666';
    } else {
      tile.style.backgroundColor = '#333';
    }
  }
}

export function maybe_remove_from_store() {
  let stored = <Array<Tile>>Array.from(document.querySelectorAll('.stored'));
  stored = stored.filter(x => !x.isTransitioning);
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
      }
    }
  }
  if (toRemove.length === 0) {
    return;
  }
  for (let ele of toRemove) {
    ele.style.transitionDuration = '0.4s';
    ele.style.opacity = '0';
    ele.classList.remove('stored');
    ele.classList.add('removed');
  }
  update_store();
}

function shuffle(A) {
  for (let i = A.length - 1; i > 0; --i) {
    let j = Math.floor(Math.random() * (i + 1));
    let tmp = A[i];
    A[i] = A[j];
    A[j] = tmp;
  }
}

const kStorageWidth = `calc(${kTileSize} * ${kStorageSize} * 1.1)`;
const kStorageLeft = `calc((${kBoardSize} - ${kStorageWidth}) / 2)`;

export function main(docid) {

  let board = modifyTag(makeDiv(''), (div) => {
    // Make div the largest square that can fit on the board.
    div.style.position = 'absolute';
    div.style.width = kBoardSize;
    div.style.height = `calc(${kBoardSize} + ${kBottomPanelHeight})`;
    // Center div
    div.style.left = '50%';
    div.style.top = kPadding;
    div.style.transform = 'translate(-50%, 0)';
    // Etc.
    div.style.overflow = 'hidden';
  });
  document.body.appendChild(board);

  let storage = modifyTag(makeDiv(''), (div) => {
    // Make div the largest square that can fit on the board.
    div.style.position = 'absolute';
    div.style.width = kStorageWidth;
    div.style.backgroundColor = 'white';
    div.style.height = `calc(${kTileSize} * 1.1)`;
    // Center div
    div.style.left = kStorageLeft;
    div.style.top = kBoardSize;
    // Etc.
    div.style.border = '1px solid white';
    div.style.overflow = 'hidden';
  });
  board.appendChild(storage);

  const has_conflicts = (x, y, z) => {
    let arr = <Array<Tile>>Array.from(document.getElementsByTagName('second-tile'));
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
    let x = Math.floor(Math.random() * (kTilesPerSide - 4)) + 2;
    let y = Math.floor(Math.random() * (kTilesPerSide - 4)) + 2;
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

  update_store();
}

}  //  namespace Second
