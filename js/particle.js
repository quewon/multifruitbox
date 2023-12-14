class AppleParticle {
	constructor(game, x, y, number) {
		let pos = game.gridPositions[y][x];

		this.x = x;
		this.y = y;
		this.position = {
			x: pos.x,
			y: pos.y,
		}
		this.velocity = {
			x: 0,
			y: -1 * Math.random() * 3 - 1
		}
		this.number = number;

		this.game = game;
		this.index = this.game.particles.length;
		this.game.particles.push(this);

		this.gravity = 8;
	}

	update(dt) {
		this.velocity.y += dt/1000 * this.gravity;

		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		if (this.position.y - this.game.radius >= window.innerHeight) {
			this.destroy();
		}
	}

	draw(context) {
		this.game.drawApple(context, this.position.x, this.position.y, this.number, true);
	}

	destroy() {
		for (let i=this.index+1; i<this.game.particles.length; i++) {
			this.game.particles[i].index--;
		}
		this.game.particles.splice(this.index, 1);
	}
}