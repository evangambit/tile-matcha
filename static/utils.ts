namespace TileGame {

export function makeTag(tag: string, innerHTML: string = '', style: Object = {}, attr: Object = {}) {
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

export function modifyTag(tag: HTMLElement, f: (tag: HTMLElement) => void) {
  f(tag);
  return tag;
}

export class Vec3 {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  toString() {
    return `(${this.x}, ${this.y}, ${this.z})`;
  }
}

export function shuffle(A) {
  for (let i = A.length - 1; i > 0; --i) {
    let j = Math.floor(Math.random() * (i + 1));
    let tmp = A[i];
    A[i] = A[j];
    A[j] = tmp;
  }
}

}  // namespace Second