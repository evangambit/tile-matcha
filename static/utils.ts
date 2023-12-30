namespace Second {

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

export function makeDiv(innerHTML: string, style: Object = {}, attr: Object = {}) {
  return <HTMLDivElement>makeTag('DIV', innerHTML, style, attr);
}

export function open_url_in_tab(url: string) {
  window.open(url, '_blank');
}

// Immutable.
export class Vec2 {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

// Immutable.
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

}  // namespace Second