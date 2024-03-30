new Q5("global");

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
    if(this.vel.mag() > 7) this.vel.setMag(7);
    this.vel.add(this.acc);
    this.vel.mult(0.97);
    if(this.pos.y > 700 - 4 && this.vel.y > 0) {
      this.vel.y *= -0.1;
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
    if(dist < this.len) force = min(0, dist - max(6, this.len - 10)) * rmul;
    else force = max(0, dist - (this.len + 10)) * amul;
    sep.normalize();
    sep.mult(force);
    this.n1.acc.add(sep);
    sep.mult(-1);
    this.n2.acc.add(sep);
  }
  draw() {
    stroke(0);
    strokeWeight(0.5);
    line(this.n1.pos.x, this.n1.pos.y, this.n2.pos.x, this.n2.pos.y);
  }
}

const amul = 0.1;
const rmul = 0.4;

const nodes = [];
const edges = [];
// for(let i = 0; i < 10; i++) {
//   for(let j = 0; j < 10; j++) {
//     nodes.push(new Node(new Vector(100 + i * 20 + random() * 5, 100 + j * 20 + random() * 5)));
//     if(i) {
//       edges.push(new Edge(nodes[i * 10 + j], nodes[(i - 1) * 10 + j], 20, amul, rmul));
//     }
//     if(j) {
//       edges.push(new Edge(nodes[i * 10 + j], nodes[i * 10 + j - 1], 20, amul, rmul));
//     }
//     if(i && j) {
//       edges.push(new Edge(nodes[i * 10 + j], nodes[(i - 1) * 10 + j - 1], 20 * sqrt(2), amul, rmul));
//       edges.push(new Edge(nodes[i * 10 + j - 1], nodes[(i - 1) * 10 + j], 20 * sqrt(2), amul, rmul));
//     }
//     if(i && j > 1) {
//       edges.push(new Edge(nodes[i * 10 + j], nodes[(i - 1) * 10 + j - 2], 20 * sqrt(5), amul, rmul));
//       edges.push(new Edge(nodes[i * 10 + j - 2], nodes[(i - 1) * 10 + j], 20 * sqrt(5), amul, rmul));
//     }
//     if(i > 1 && j) {
//       edges.push(new Edge(nodes[i * 10 + j], nodes[(i - 2) * 10 + j - 1], 20 * sqrt(5), amul, rmul));
//       edges.push(new Edge(nodes[i * 10 + j - 1], nodes[(i - 2) * 10 + j], 20 * sqrt(5), amul, rmul));
//     }
//     if(i > 1) {
//       edges.push(new Edge(nodes[i * 10 + j], nodes[(i - 2) * 10 + j], 40, amul, rmul));
//     }
//     if(j > 1) {
//       edges.push(new Edge(nodes[i * 10 + j], nodes[i * 10 + j - 2], 40, amul, rmul));
//     }
//   }
// }

const r = 200;
for(let i = 0; i < 100000; i++) {
  let pos = new Vector(100 + random() * r, 100 + random() * r);
  if(new Vector(100 + r / 2, 100 + r / 2).dist(pos) > r / 2 || nodes.some(node => node.pos.dist(pos) < 12)) continue;
  nodes.push(new Node(pos));
}
console.log(nodes.length);

for(let i = 0; i < nodes.length; i++) {
  for(let j = i + 1; j < nodes.length; j++) {
    edges.push(new Edge(nodes[i], nodes[j], nodes[i].pos.dist(nodes[j].pos), amul, rmul));
  }
}
console.log(edges.length);
edges.sort((a, b) => a.len - b.len);
edges.length = floor(Math.pow(nodes.length, 1.3) * 3);
console.log(edges.length);

function shuffle(a) {
  for(let i = a.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

createCanvas(800, 800);

function main() {
  background(255);
  fill(0);
  strokeWeight(0);
  rect(0, 700, 800, 100);
  shuffle(edges);
  if(mouseIsPressed) {
    for(const node of nodes) {
      const d = new Vector(mouseX - pmouseX, mouseY - pmouseY);
      if(d.mag() > 4) d.setMag(4);
      node.acc.add(d.mult(20 / max(80, Vector.sub(new Vector(mouseX, mouseY), node.pos).mag())));
    }
  }
  for(const edge of edges) {
    edge.update();
  }
  shuffle(nodes);
  for(const node of nodes) {
    // const oldPos = node.pos.copy();
    // const oldVel = node.vel.copy();
    node.update();
    // for(const node2 of nodes) {
    //   if(node === node2) {
    //     continue;
    //   }
    //   if(node2.pos.dist(node.pos) < 6) {wsl
    //     node.pos = oldPos;
    //     node.vel = oldVel;
    //     break;
    //   }
    // }
    node.draw();
  }
  for(const edge of edges) {
    edge.draw();
  }
  // setTimeout(main, !mouseIsPressed ? 50 : 1000);
  requestAnimationFrame(main);
}

main();
