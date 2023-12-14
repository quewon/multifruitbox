class Game {
	constructor(gamedata) {
    gamedata = gamedata || {};
    
		this.timeLimit = gamedata.timeLimit || 120 * 1000;
		this.columns = gamedata.columns || 17;
		this.rows = gamedata.rows || 10;
    this.padding = gamedata.padding || {
			x: 1,
			y: 1
		}
		this.gridSpacing = gamedata.gridSpacing || {
			x: 1.5,
			y: 1.5
		}

		this.cursors = [];
		this.particles = [];
    
    this.restart();

		if (gamedata.time) {
      this._previousDate = gamedata._previousDate;
      this.time = gamedata.time;
      this.points = gamedata.points;
      this.over = gamedata.over;
      this.grid = gamedata.grid;
      
      if (this.over) {
        displayUI("gameover");
      }
      
      this.updateScoreCounters();
    }

		this.resize();
	}
  
  data() {
    return {
      timeLimit: this.timeLimit,
      columns: this.columns,
      rows: this.rows,
      padding: this.padding,
      gridSpacing: this.gridSpacing,
      _previousDate: this._previousDate,
      time: this.time,
      points: this.points,
      over: this.over,
      grid: this.grid
    }
  }
  
	addCursor(cursor) {
		cursor.game = this;
    cursor.index = this.cursors.length;
		this.cursors.push(cursor);
	}

	restart() {
    this._previousDate = new Date().getTime();
		this.time = 0;
		this.points = 0;
		this.over = false;

		this.grid = [];
		for (let y=0; y<this.rows; y++) {
			this.grid[y] = [];
			for (let x=0; x<this.columns; x++) {
				this.grid[y][x] = Math.ceil(Math.random() * 9);
			}
		}

		this.selections = [];

		displayUI("game");
		this.updateScoreCounters();
	}

	resize() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    
		let columns = this.columns + this.padding.x * 2;
		let rows = this.rows + this.padding.y * 2;

		let cellSize = Math.min(
			width / columns / this.gridSpacing.x,
			height / rows / this.gridSpacing.y
		);
		this.radius = cellSize / 2;

		let gridDrawSpacing = {
			x: Math.floor(this.gridSpacing.x * cellSize),
			y: Math.floor(this.gridSpacing.y * cellSize)
		}

		let gridDrawOffset = {
			x: (width - (gridDrawSpacing.x * columns)) / 2,
			y: (height - (gridDrawSpacing.y * rows)) / 2
		}

		this.gridPositions = [];
		for (let y=0; y<this.rows; y++) {
			this.gridPositions[y] = [];
			for (let x=0; x<this.columns; x++) {
				this.gridPositions[y][x] = {
					x: gridDrawOffset.x + (x + this.padding.x) * gridDrawSpacing.x + this.radius,
					y: gridDrawOffset.y + (y + this.padding.y) * gridDrawSpacing.y + this.radius
				}
			}
		}

		let fontSize = this.radius * 1.2;
		context.font = "bold "+fontSize+"px sans-serif";
		context.textAlign = "center";
		context.textBaseline = "middle";
	}

	updateScoreCounters() {
		let els = document.getElementsByClassName("score");
		for (let i=0; i<els.length; i++) {
			els[i].textContent = this.points;
		}
	}

	update() {
    let now = new Date().getTime();
    let dt = now - this._previousDate;
    this._previousDate = now;
    
		this.time += dt;

		for (let sel of this.selections) {
			sel.update(dt);
		}

		for (let p of this.particles) {
			p.update(dt);
		}

		if (!this.over && this.time >= this.timeLimit) {
			this.time = this.timeLimit;
			this.over = true;

			displayUI("gameover");
		}
	}

	drawApple(context, x, y, number, selected) {
		context.beginPath();
		context.arc(x, y, this.radius, 0, Math.PI * 2);

		if (selected) {
			context.fillStyle = "orange";
			context.fill();
		}

		context.strokeStyle = "black";
		context.stroke();

		context.fillStyle = "black";
		context.fillText(number, x, y + 2);
	}

	draw(context) {
		context.resetTransform();
		context.scale(window.devicePixelRatio, window.devicePixelRatio);

		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		context.fillStyle = "lightyellow";
		context.fillRect(0, lerp(0, context.canvas.height, this.time/this.timeLimit), context.canvas.width, context.canvas.height);

		for (let y=0; y<this.rows; y++) {
			for (let x=0; x<this.columns; x++) {
				if (this.grid[y][x] == null) continue;

				let pos = this.gridPositions[y][x];

				let selected = false;
				if (!this.over) {
					for (let sel of this.selections) {
						if (sel.grid) {
							if (sel.grid[y][x] == 1) {
								selected = true;
								break;
							}
						}
					}
				}

				this.drawApple(context, pos.x, pos.y, this.grid[y][x], selected);
			}
		}

		for (let p of this.particles) {
			p.draw(context);
		}

		if (!this.over) {
			for (let sel of this.selections) {
				sel.draw(context);
			}
		}

		for (let cursor of this.cursors) {
			cursor.draw(context);
		}
	}

	createSelection(cursor) {
		return new Selection(this, cursor);
	}
}