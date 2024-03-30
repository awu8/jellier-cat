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
    this.vel.add(new Vector(0, 0.1));
    this.vel.add(this.acc);
    this.vel.mult(0.99);
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
    let force = (dist - this.len);
    if(dist < this.len) force *= rmul;
    else force *= amul;
    sep.normalize();
    sep.mult(force);
    this.n1.acc.add(sep);
    sep.mult(-1);
    this.n2.acc.add(sep);
  }
  draw() {
    stroke(0);
    strokeWeight(2);
    line(this.n1.pos.x, this.n1.pos.y, this.n2.pos.x, this.n2.pos.y);
  }
}

const amul = 0.1;
const rmul = 0.3;

const nodes = [];
const edges = [];
for(let i = 0; i < 10; i++) {
  for(let j = 0; j < 10; j++) {
    nodes.push(new Node(new Vector(100 + i * 20 + random() * 5, 100 + j * 20 + random() * 5)));
    if(i) {
      edges.push(new Edge(nodes[i * 10 + j], nodes[(i - 1) * 10 + j], 20, amul, rmul));
    }
    if(j) {
      edges.push(new Edge(nodes[i * 10 + j], nodes[i * 10 + j - 1], 20, amul, rmul));
    }
    if(i && j) {
      edges.push(new Edge(nodes[i * 10 + j], nodes[(i - 1) * 10 + j - 1], 20 * sqrt(2), amul, rmul));
      edges.push(new Edge(nodes[i * 10 + j - 1], nodes[(i - 1) * 10 + j], 20 * sqrt(2), amul, rmul));
    }
    if(i && j > 1) {
      edges.push(new Edge(nodes[i * 10 + j], nodes[(i - 1) * 10 + j - 2], 20 * sqrt(5), amul, rmul));
      edges.push(new Edge(nodes[i * 10 + j - 2], nodes[(i - 1) * 10 + j], 20 * sqrt(5), amul, rmul));
    }
    if(i > 1 && j) {
      edges.push(new Edge(nodes[i * 10 + j], nodes[(i - 2) * 10 + j - 1], 20 * sqrt(5), amul, rmul));
      edges.push(new Edge(nodes[i * 10 + j - 1], nodes[(i - 2) * 10 + j], 20 * sqrt(5), amul, rmul));
    }
    if(i > 1) {
      edges.push(new Edge(nodes[i * 10 + j], nodes[(i - 2) * 10 + j], 40, amul, rmul));
    }
    if(j > 1) {
      edges.push(new Edge(nodes[i * 10 + j], nodes[i * 10 + j - 2], 40, amul, rmul));
    }
  }
}

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
      node.vel.add(new Vector(mouseX - pmouseX, mouseY - pmouseY).mult(10 / max(40, Vector.sub(new Vector(mouseX, mouseY), node.pos).mag())));
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
