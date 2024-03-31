new Q5("global");

const pi = Math.PI;

class Node {
  constructor(pos, fixed = false) {
    this.pos = pos;
    this.vel = new Vector(0, 0);
    this.acc = new Vector(0, 0);
    this.fixed = fixed;
  }
  update() {
    if(this.fixed) return;
    this.acc.add(new Vector(0, 0.2));
    // if(this.acc.mag() > 5) this.acc.setMag(5);
    // if(this.vel.mag() > 7) this.vel.setMag(7);
    this.vel.add(this.acc);
    this.vel.mult(0.99);
    if(this.pos.y > 700 - 4) {
      this.vel.y *= 0.8;
      if(this.vel.y > 0) this.vel.y *= -0.3;
    }
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  draw() {
    stroke(0);
    strokeWeight(8);
    point(this.pos.x, this.pos.y);
  }
}

class Edge {
  constructor(n1, n2, len, amul, rmul) {
    this.n1 = n1;
    this.n2 = n2;
    this.len = len;
    this.amul = amul;
    this.rmul = rmul;
  }
  update() {
    const sep = Vector.sub(this.n2.pos, this.n1.pos);
    const dist = sep.mag();
    let force;
    if(dist < this.len) force = min(0, dist - max(6, this.len)) * rmul;
    else force = max(0, dist - (this.len)) * amul;
    sep.normalize();
    sep.mult(force);
    this.n1.acc.add(sep);
    sep.mult(-1);
    this.n2.acc.add(sep);
    const veldiff = Vector.sub(this.n2.vel, this.n1.vel);
    this.n1.acc.add(veldiff.mult(0.4));
    this.n2.acc.add(veldiff.mult(-0.4));
  }
  draw() {
    stroke(0);
    strokeWeight(0.5);
    line(this.n1.pos.x, this.n1.pos.y, this.n2.pos.x, this.n2.pos.y);
  }
}

const amul = 0.3;
const rmul = 0.3;

const targetArea = 25000;

const nodes = [];
const edges = [];
for(let i = 0; i < 40; i++) {
  nodes.push(new Node(new Vector(150, 150).add(new Vector(0, 89).rotate(pi / 20 * i)), false));
}
for(let i = 0; i < nodes.length; i++) {
  edges.push(new Edge(nodes[i], nodes[(i + 1) % nodes.length], 1, amul, rmul));
}
const orderednodes = [...nodes];

function shuffle(a) {
  for(let i = a.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function polygonArea(vertices) {
  let total = 0;

  for(let i = 0, l = vertices.length; i < l; i++) {
    let addX = vertices[i].x;
    let addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
    let subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
    let subY = vertices[i].y;

    total += (addX * addY * 0.5);
    total -= (subX * subY * 0.5);
  }

  return Math.abs(total);
}

createCanvas(800, 800);

function main() {
  background(255);
  fill(100);
  noStroke();
  rect(0, 700, 800, 100);
  shuffle(edges);
  if(mouseIsPressed) {
    for(const node of nodes) {
      const d = new Vector(mouseX - pmouseX, mouseY - pmouseY);
      if(d.mag() > 10) d.setMag(10);
      node.acc.add(d.mult(20 / max(80, Vector.sub(new Vector(mouseX, mouseY), node.pos).mag())));
    }
  }
  for(const edge of edges) {
    edge.update();
  }
  const area = polygonArea(orderednodes.map(node => node.pos));
  for(let i = 0; i < nodes.length; i++) {
    const prv = orderednodes[(i - 1 + nodes.length) % nodes.length].pos;
    const cur = orderednodes[i].pos;
    const nxt = orderednodes[(i + 1) % nodes.length].pos;
    const norm1 = Vector.sub(cur, nxt).rotate(pi / 2).normalize();
    const norm2 = Vector.sub(prv, cur).rotate(pi / 2).normalize();
    const bisector = norm1.add(norm2).normalize();
    stroke(255, 0, 0);
    strokeWeight(1);
    if(keyIsPressed) line(cur.x, cur.y, cur.x + norm1.x * 50, cur.y + norm1.y * 50);
    const force = (targetArea - area) * 0.001;
    orderednodes[i].acc.add(bisector.mult(force));
  }
  shuffle(nodes);
  for(const node of nodes) {
    node.update();
  }
  if(keyIsPressed) {
    for(const edge of edges) {
      edge.draw();
    }
    for(const node of nodes) {
      node.draw();
    }
  } else {
    let hull = orderednodes.map(node => node.pos);
    fill(255);
    noStroke();
    beginShape();
    for(const point of hull) {
      vertex(point.x, point.y);
    }
    endShape(CLOSE);
    // stroke(0, 0, 0, 128);
    stroke(0);
    strokeWeight(8);
    const h = i => hull[(i + hull.length) % hull.length];
    let hull2 = [];
    for(let i = 0; i < hull.length; i++) {
      hull2.push(h(i));
      let num = round(h(i).dist(h(i + 1)) / 5);
      for(let j = 1; j < num; j++) {
        hull2.push(Vector.sub(h(i + 1), h(i)).mult(j / num).add(h(i)));
      }
    }
    hull = hull2;
    for(let _ = 0; _ < 3; _++) {
      hull2 = [];
      for(let i = 0; i < hull.length; i++) {
        hull2.push(Vector.add(Vector.add(h(i), h(i + 1)), h(i - 1)).div(3));
      }
      hull = hull2;
    }
    for(let i = 0; i < hull.length; i++) {
      // stroke(255, 0, 0);
      // point(h(i).x, h(i).y);
      line(h(i).x, h(i).y, h(i + 1).x, h(i + 1).y);
      // bezier(h(i).x, h(i).y, h(i + 1).x, h(i + 1).y, h(i + 1).x, h(i + 1).y, h(i + 2).x, h(i + 2).y);
    }
  }
  requestAnimationFrame(main);
}

main();
