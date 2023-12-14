class Cursor {
	constructor(data) {
		if (!data) {
      document.addEventListener("mousemove", this.mousemove.bind(this));
      document.addEventListener("mousedown", this.mousedown.bind(this));
      document.addEventListener("mouseup", this.mouseup.bind(this));
      document.addEventListener("blur", this.mouseup.bind(this));
    }
    
    data = data || {};

		this.down = data.down || false;
		this.rect = data.rect || { x1: null, y1: null, x2: 0, y2: 0 };
		this.points = data.points || 0;
		this.game = null;
    this.playerid = null;

		this.color = data.color || {
			r: 0,
			g: 0,
			b: 255
		}
		this.colorString = "rgb("+this.color.r+","+this.color.g+","+this.color.b+")";
		this.highlightColorString = "rgba("+this.color.r+","+this.color.g+","+this.color.b+", .2)";
  }
  
  data() {
    return {
      down: this.down,
      rect: this.rect,
      points: this.points,
      color: this.color,
      playerid: this.playerid
    }
  }
  
  setData(data) {
    this.down = data.down;
    this.rect = data.rect;
    this.points = data.points;
    this.color = data.color;
  }

	mousemove(e) {
		this.rect.x2 = e.pageX;
		this.rect.y2 = e.pageY;

		if (this.selection) {
			this.selection.setRect(this.rect);
		}
    
    if (this == CURSOR) this.hasUpdate = true;
	}

	mousedown(e) {
		this.rect.x1 = e.pageX;
		this.rect.y1 = e.pageY;
		this.down = true;

		if (this.game) {
			this.selection = this.game.createSelection(this);
		}
    
    if (this == CURSOR) this.hasUpdate = true;
	}

	mouseup(e) {
		this.rect.x1 = null;
		this.rect.y1 = null;
		this.down = false;

		if (this.selection) {
			let newPoints = this.selection.resolve();
			this.points += newPoints;
			this.selection = null;

			if (newPoints > 0) this.game.updateScoreCounters();
		}
    
    if (this == CURSOR) this.hasUpdate = true;
	}

	draw(context) {
		context.beginPath();
		context.rect(this.rect.x2, this.rect.y2, 10, 10);

		if (this.down) {
			context.strokeStyle = this.colorString;
			context.stroke();
		} else {
			context.fillStyle = this.colorString;
			context.fill();
		}
	}
}