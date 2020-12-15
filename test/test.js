function a(b, c) {
  console.log(this);
  return b + c;
}

function z() {
  console.log(...arguments);
  this.my = 123132123;
  return a.apply({a: "this"}, arguments);
}

console.log(z(2, 2));