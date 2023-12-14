class Selection {
	constructor(game, cursor) {
		this.game = game || GAME;
		this.index = this.game.selections.length;
		this.sum = 0;

		this.destructionDuration = 300;
		this.blinkFactor = .04;
		this.destructionTimer = 0;

		this.cursor = cursor;
		
		this.game.selections.push(this);
	}

	setRect(rect) {
		let x = Math.min(rect.x1, rect.x2);
		let y = Math.min(rect.y1, rect.y2);

		this.rect = {
			x1: x,
			y1: y,
			x2: Math.max(rect.x1, rect.x2),
			y2: Math.max(rect.y1, rect.y2)
		}

		let width = this.rect.x2 - x;
		let height = this.rect.y2 - y;

		this.drawRect = {
			x: x,
			y: y,
			width: width,
			height: height
		};

		this.calculateSelected();

		return this.drawRect;
	}

	calculateSelected() {
		this.sum = 0;
		this.grid = [];
		for (let y=0; y<this.game.rows; y++) {
			this.grid[y] = [];
			for (let x=0; x<this.game.columns; x++) {
				let pos = this.game.gridPositions[y][x];

				if (pointInRect(pos, this.rect)) {
					this.grid[y][x] = 1;
					this.sum += this.game.grid[y][x];
				} else {
					this.grid[y][x] = 0;
				}
			}
		}
	}

	resolve() {
		if (this.game.over) return;

		let points = 0;

		let minX = Infinity;
		let maxX = 0;
		let particles = [];

		if (this.sum == 10) {
			for (let y=0; y<this.game.rows; y++) {
				for (let x=0; x<this.game.columns; x++) {
          if (this.game.grid[y][x] == null) continue;
					if (this.grid[y][x] == 1) {
						particles.push(new AppleParticle(this.game, x, y, this.game.grid[y][x]));

						if (x > maxX) maxX = x;
						if (x < minX) minX = x;

						this.game.grid[y][x] = null;
						points++;
					}
				}
			}
		}

		let medianX = (minX + maxX) / 2;
		for (let p of particles) {
			if (p.x < medianX) {
				p.velocity.x = -1;
			} else if (p.x > medianX) {
				p.velocity.x = 1;
			} else {
				p.velocity.x = Math.random() * 2 - 1;
			}
		}

		this.game.points += points;

		if (points != 0) {
			this.destructionTimer = this.destructionDuration;
		} else {
			this.destroy();
		}

		return points;
	}

	update(dt) {
		if (this.destructionTimer > 0) {
			this.destructionTimer -= dt;

			if (this.destructionTimer <= 0) {
				this.destroy();
			}
		}
	}

	draw(context) {
		if (!this.drawRect) return;

		context.strokeStyle = this.cursor.colorString;
		context.beginPath();
		context.rect(Math.round(this.drawRect.x), Math.round(this.drawRect.y), Math.round(this.drawRect.width), Math.round(this.drawRect.height));
		context.stroke();

		if (this.destructionTimer >= 0 && Math.sin(this.destructionTimer * this.blinkFactor) > 0) {
			context.fillStyle = this.cursor.highlightColorString;
			context.fill();
		}
	}

	destroy() {
		for (let i=this.index+1; i<this.game.selections.length; i++) {
			this.game.selections[i].index--;
		}
		this.game.selections.splice(this.index, 1);
	}
}