new Q5("global");

const pi = Math.PI;

class Node {
  constructor(pos, fixed = false) {
    this.pos = pos;
    this.vel = new Vector(0, 0);
    this.acc = new Vector(0, 0);
    this.fixed = fixed;
  }
  update(substeps) {
    if(this.fixed) return;
    // if(this.acc.mag() > 5) this.acc.setMag(5);
    // if(this.vel.mag() > 7) this.vel.setMag(7);
    this.vel.mult(Math.pow(0.99, 1 / substeps));
    this.pos.add(Vector.mult(this.vel, 1 / substeps));
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

function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

function decompose(vec, norm) {
  norm.normalize();
  const proj = norm.copy().mult(vec.dot(norm));
  const perp = vec.copy().sub(proj);
  return [proj, perp];
}

class Line {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  collision(node) {
    if(distToSegment(node.pos, this.start, this.end) < 14) {
      const [proj, perp] = decompose(node.vel, Vector.sub(this.end, this.start));
      node.vel = perp.copy().mult(perp.angleBetween(Vector.sub(this.end, this.start).rotate(pi / 2)) < 0.1 ? -0.5 : 1).add(proj);
    }
  }
  draw() {
    stroke(0);
    strokeWeight(20);
    line(this.start.x, this.start.y, this.end.x, this.end.y);
  }
}

class Polygon {
  constructor(vertices) {
    this.lines = [];
    for(let i = 0; i < vertices.length; i++) {
      this.lines.push(new Line(vertices[i], vertices[(i + 1) % vertices.length]));
    }
  }
  collision(node) {
    for(const line of this.lines) {
      line.collision(node);
    }
  }
  draw() {
    for(const line of this.lines) {
      line.draw();
    }
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

const bisectors = [];
for(let i = 0; i < nodes.length; i++) {
  bisectors.push(new Vector(0, 0));
}

const width = windowWidth - 50;
const height = windowHeight - 50;

const polys = [];
polys.push(new Polygon([new Vector(-500, height - 50),
                        new Vector(width + 500, height - 50),
                        new Vector(width + 500, height),
                        new Vector(-500, height),]));
polys.push(new Polygon([new Vector(-500, -500),
                        new Vector(0, -500),
                        new Vector(0, height),
                        new Vector(-500, height),]));
polys.push(new Polygon([new Vector(width, -500),
                        new Vector(width + 500, -500),
                        new Vector(width + 500, height),
                        new Vector(width, height),]));
polys.push(new Polygon([new Vector(-500, -500),
                        new Vector(width + 500, -500),
                        new Vector(width + 500, 0),
                        new Vector(-500, 0),]));
polys.push(new Polygon([new Vector(100, 400),
                        new Vector(400, 500),
                        new Vector(100, 600),]));
polys.push(new Polygon([new Vector(700, -100),
                        new Vector(800, -100),
                        new Vector(800, height - 80),
                        new Vector(700, height - 80),]));

createCanvas(width, height);

function main() {
  background(255);
  stroke(0);
  strokeWeight(2);
  fill(100);
  noStroke();
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
  
  // const area = polygonArea(nodes.map(node => node.pos));
  let total = 0;

  for(let i = 0, l = vertices.length; i < l; i++) {
    let addX = nodes[i].pos.x + nodes[i].vel.x;
    let addY = nodes[(i + 1) % nodes.length].pos.y + nodes[(i + 1) % nodes.length].vel.y;
    let subX = nodes[(i + 1) % nodes.length].pos.x + nodes[(i + 1) % nodes.length].vel.x;
    let subY = nodes[i].pos.y + nodes[i].vel.y;

    total += (addX * addY * 0.5);
    total -= (subX * subY * 0.5);
  }

  const area = Math.abs(total);
  // calculate area but using psychic powers
  
  for(let i = 0; i < nodes.length; i++) {
    const prv = nodes[(i - 1 + nodes.length) % nodes.length].pos;
    const cur = nodes[i].pos;
    const nxt = nodes[(i + 1) % nodes.length].pos;
    const norm1 = Vector.sub(cur, nxt).rotate(pi / 2).normalize();
    const norm2 = Vector.sub(prv, cur).rotate(pi / 2).normalize();
    bisectors[i] = norm1.add(norm2).normalize();
    const force = (targetArea - area) * 0.001;
    nodes[i].acc.add(bisectors[i].copy().mult(force));
  }
  for(const node of nodes) {
    node.acc.add(new Vector(0, 0.2));
    node.vel.add(node.acc);
  }
  for(let _ = 0; _ < 10; _++) {
    for(const poly of polys) {
      for(const node of nodes) {
        poly.collision(node);
      }
    }
    for(const node of nodes) {
      node.update(10);
    }
  }
  if(keyIsPressed) {
    for(const edge of edges) {
      edge.draw();
    }
    for(const node of nodes) {
      node.draw();
    }
    stroke(255, 0, 0);
    strokeWeight(1);
    for(let i = 0; i < nodes.length; i++) {
      const cur = nodes[i].pos;
      const bisector = bisectors[i];
      line(cur.x, cur.y, cur.x + bisector.x * 50, cur.y + bisector.y * 50);
    }
  } else {
    let hull = nodes.map(node => node.pos);
    fill(255);
    noStroke();
    beginShape();
    for(const point of hull) {
      vertex(point.x, point.y);
    }
    endShape(CLOSE);
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
      line(h(i).x, h(i).y, h(i + 1).x, h(i + 1).y);
    }
  }
  for(const poly of polys) {
    poly.draw();
  }
  // setTimeout(main, 300);
  requestAnimationFrame(main);
}

main();
