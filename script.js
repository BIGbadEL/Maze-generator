class Point {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

function len(x1, y1, x2, y2) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}


class line {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        //this.flag = true;
    }

    lenght () {
        return len(this.x1, this.y1, this.x2, this.y2);
    }

    equals(other){
        return (this.x1 == other.x1 &&
                this.y1 == other.y1 &&
                this.x2 == other.x2 &&
                this.y2 == other.y2);
    }

    draw(can) {
        //if(this.flag){
            can.beginPath();
            ctx.strokeStyle = "white";
            can.moveTo(this.x1, this.y1);
            can.lineTo(this.x2, this.y2);
            can.stroke();
        //}
    }

    intersection_point(other){
        const x1 = this.x1;
        const x2 = this.x2;
        const y1 = this.y1;
        const y2 = this.y2;

        const x3 = other.x1;
        const x4 = other.x2;
        const y3 = other.y1;
        const y4 = other.y2;
        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den == 0) return new Point(0, 0);
        const Px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / den;
        const Py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / den;
        return new Point(Px, Py);
    }

    intersection(others) {
        const x1 = this.x1;
        const x2 = this.x2;
        const y1 = this.y1;
        const y2 = this.y2;
        let last = new Point(x2, y2);
        for(let i = 0; i < others.length; i++) {
            const other = others[i];
            const P = this.intersection_point(other);
            if ((P.x - other.x1 > -1 && P.x - other.x2 < 1) || (P.x - other.x1 < 1 && P.x - other.x2 > -1)) {
                if ((P.y - other.y1 > -1 && P.y - other.y2 < 1) || (P.y - other.y1 < 1 && P.y - other.y2 > -1)) {
                    const ray_len =  len(x1, y1, x2, y2);
                    const len2 = len(x2, y2, P.x, P.y); 
                    if (len2 < ray_len) {
                        const temp = len(x1, y1, last.x, last.y);
                        if(temp > len(x1, y1, P.x, P.y)) {
                            last.x = P.x;
                            last.y = P.y;
                        }
                    }
                }
            }  
        }
        //this.flag = !(last.x == this.x2 && last.y == this.y2);
        this.x2 = last.x;
        this.y2 = last.y;
    }

    distance_to_point(point){
        const den = len(this.x1, this.y1, this.x2, this.y2);
        if(den == 0) return;
        const result = Math.abs((this.y2 - this.y1) * point.x - (this.x2 - this.x1) * point.y + this.x2 * this.y1 - this.y2 * this.x1);
        return result / den;
    }
}

function add_if(array, line) {
    for(let i = 0; i < array.lenght; i++){
        if(array[i].equals(line)){
            return;
        }
    }
    array.push(line);
}

class cell {
    constructor(up, down, right, left){
        this.up = up;
        this.down = down;
        this.right = right;
        this.left = left;
    }

    size() {
        return Math.sqrt(Math.min(this.up.lenght(), this.down.lenght(), this.left.lenght(), this.right.lenght()));
    }

    width() {
        return this.up.lenght();
    }
    height() {
        return this.right.lenght();
    }

    addWallsToArray(array) {
        add_if(array, this.up);
        add_if(array, this.down);
        add_if(array, this.right);
        add_if(array, this.left);
    }
}

function rec_div_met(walls_to_fill, cell_to_devide, min_size) {
    if(walls_to_fill.length == 0){
        const height = window.innerHeight;
        const width =  window.innerWidth;
        const up = new line(0, 0, width, 0);
        const down = new line(0, height, width, height);
        const left = new line(0, 0, 0, height);
        const right = new line(width, 0, width, height);
        let first_cell = new cell(up, down, right, left);
        first_cell.addWallsToArray(walls_to_fill);
        rec_div_met(walls_to_fill, first_cell, min_size);
    } else {
        const size = cell_to_devide.size();
        if(size <= min_size + 10){
            return;
        }
        const up = cell_to_devide.up;
        const down = cell_to_devide.down;
        const left = cell_to_devide.left;
        const right = cell_to_devide.right;
        let val = Math.floor((Math.random() * size) / min_size) * min_size;
        if(val == 0){
            val = min_size / 2;
        }
        let new_cell;
        let other_cell;
        if(Math.random() > 0.5){
            const new_right = new line(right.x1, right.y1, right.x2, right.y2 - val);
            const new_left = new line(left.x1, left.y1, left.x2, left.y2 - val);
            const new_down = new line(down.x1, down.y1 - val, down.x2, down.y2 - val);
            new_cell = new cell(up, new_down, new_right, new_left);
            const other_right = new line(right.x1, right.y2 - val, right.x2, right.y2);
            const other_left = new line(left.x1, left.y2 - val, left.x2, left.y2);
            other_cell = new cell(new_down, down, other_right, other_left);
            walls_to_fill.push(new_down);
        } else {
            const new_up = new line(up.x1, up.y1, up.x2 - val, up.y2);
            const new_down = new line(down.x1, down.y1, down.x2 - val, down.y2);
            const new_right = new line(right.x1 - val, right.y1, right.x2 - val, right.y2);
            new_cell = new cell(new_up, new_down, new_right, left);
            const other_up = new line(up.x2 - val, up.y1, up.x2, up.y2);
            const other_down = new line(down.x2 - val, down.y1, down.x2, down.y2);
            other_cell = new cell(other_up, other_down, right, new_right);
            walls_to_fill.push(new_right);
        }
        draw_lines(walls_to_fill, ctx);
        rec_div_met(walls_to_fill, new_cell, min_size);
        rec_div_met(walls_to_fill, other_cell, min_size);
    }
}

function draw_lines(lines, can) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    lines.forEach( element => {
        element.draw(can);
    });
}

var canvas = document.querySelector('canvas'); //temporary
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const thick = ctx.lineWidth;
const wall = new line(100, 100, 200, 200);
const height = window.innerHeight;
const width =  window.innerWidth;
let walls = [];// [new line(500, 550, 500, 600), wall]; //= [wall, wall1, wall3];
const random = false;
if(random){
    for(let i = 0; i < height; i += 200) {
        for(let j = 0; j < width; j += 200) {
            walls.push(new line(j, i, j + Math.random() * 100, i  + Math.random() * 100));
        }
    }
} else {
    rec_div_met(walls, window, 100);
}


draw_lines(walls, ctx);




document.body.addEventListener('mousemove', function (event) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const x = event.clientX, y = event.clientY;
    const center = new Point(x, y);
    ctx.lineWidth = 10;
    draw_lines(walls, ctx);
    ctx.lineWidth = thick;
    const r = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
    for (var i = 0; i < 2 * Math.PI; i += (Math.PI / 360)) {
        const obj = new line(x, y, x + r * Math.cos(i), y + r * Math.sin(i));
        obj.intersection(walls);
        obj.draw(ctx);
    }
}, false);