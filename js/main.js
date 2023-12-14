var context = document.querySelector("canvas").getContext("2d");
var GAME, CURSOR;

window.onresize = function() {
	let canvas = context.canvas;

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	if (GAME) GAME.resize();
}

window.onload = function() {
	window.onresize();

	draw();
	setInterval(update, 1);
}

function draw() {
	if (GAME) GAME.draw(context);
	requestAnimationFrame(draw);
}

function update() {
	if (GAME) GAME.update();
}

function displayUI(id) {
  let els = document.getElementsByClassName("ui");
  for (let i=0; i<els.length; i++) {
    els[i].style.display = "none";
  }
  document.getElementById(id).style.display = "block";
}

function pointInRect(point, rect) {
	if (
		point.x >= rect.x1 && point.x <= rect.x2 &&
		point.y >= rect.y1 && point.y <= rect.y2
		) {
		return true;
	}
	return false;
}

function lerp(a, b, t) {
	return (1-t) * a + t * b;
}