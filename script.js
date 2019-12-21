class Point {
    constructor(x, y) {
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
        this.debugBrake();
        //this.flag = true;
    }

    debugBrake() {
        if (isNaN(this.x1) || isNaN(this.x2) || isNaN(this.y1) || isNaN(this.y2)) {
            return this.length();
        }
    }

    length() {
        return len(this.x1, this.y1, this.x2, this.y2);
    }

    equals(other) {
        return (this.x1 === other.x1 &&
            this.y1 === other.y1 &&
            this.x2 === other.x2 &&
            this.y2 === other.y2);
    }

    draw(can, color = "white") {
        //if(this.flag){
        can.beginPath();
        ctx.strokeStyle = color;
        can.moveTo(this.x1, this.y1);
        can.lineTo(this.x2, this.y2);
        can.stroke();
        //}
    }

    intersection_point(other) {
        const x1 = this.x1;
        const x2 = this.x2;
        const y1 = this.y1;
        const y2 = this.y2;

        const x3 = other.x1;
        const x4 = other.x2;
        const y3 = other.y1;
        const y4 = other.y2;
        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den === 0) return new Point(0, 0);
        const Px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / den;
        const Py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / den;
        return new Point(Px, Py);
    }

    intersection(others, degugDraw = false) {
        const x1 = this.x1;
        const x2 = this.x2;
        const y1 = this.y1;
        const y2 = this.y2;
        let result = false;
        let last = new Point(x2, y2);
        for (let i = 0; i < others.length; i++) {
            const other = others[i];
            const P = this.intersection_point(other);
            if ((P.x - other.x1 > -1 && P.x - other.x2 < 1) || (P.x - other.x1 < 1 && P.x - other.x2 > -1)) {
                if ((P.y - other.y1 > -1 && P.y - other.y2 < 1) || (P.y - other.y1 < 1 && P.y - other.y2 > -1)) {
                    const ray_len = len(x1, y1, x2, y2);
                    const len2 = len(x2, y2, P.x, P.y);
                    if (len2 < ray_len) {
                        const temp = len(x1, y1, last.x, last.y);
                        if (temp > len(x1, y1, P.x, P.y)) {
                            last.x = P.x;
                            last.y = P.y;
                            result = true;
                            if(degugDraw){
                                others[i].draw(ctx, "red");
                            }
                        }
                    }
                }
            }
        }
        this.x2 = last.x;
        this.y2 = last.y;
        return result;
    }

    contains_point(point){
        return point.x >= this.x1 && point.x <= this.x2 && point.y >= this.y1 && point.y <= this.y2;
    }

}

function add_if(array, line) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].equals(line)) {
            return;
        }
    }
    array.push(line);
}

class cell {
    constructor(up, down, right, left) {
        this.up = up;
        this.down = down;
        this.right = right;
        this.left = left;
    }

    size() {
        return Math.sqrt(Math.min(this.up.length(), this.down.length(), this.left.length(), this.right.length()));
    }

    width() {
        return Math.sqrt(this.up.length());
    }

    height() {
        return Math.sqrt(this.right.length());
    }

    addWallsToArray(array) {
        add_if(array, this.up);
        add_if(array, this.down);
        add_if(array, this.right);
        add_if(array, this.left);
    }
}

class element {
    constructor(point, size) {
        this.start = point;
        this.step = size;
    }

    goDown(maze) {
        const x1 = this.start.x + this.step / 2;
        const y1 = this.start.y + this.step / 2;
        const x2 = x1;
        const y2 = y1 + this.step;
        const path = new line(x1, y1, x2, y2);
        if (!path.intersection(maze)) {
            return new element(new Point(this.start.x, this.start.y + this.step), this.step);
        }
    }

    goRight(maze) {
        const x1 = this.start.x + this.step / 2;
        const y1 = this.start.y + this.step / 2;
        const x2 = x1 + this.step;
        const path = new line(x1, y1, x2, y1);
        path.draw(ctx, "pink");
        if (!path.intersection(maze)) {
            return new element(new Point(this.start.x + this.step, this.start.y), this.step);
        }
    }

    goLeft(maze) {
        const x1 = this.start.x + this.step / 2;
        const y1 = this.start.y + this.step / 2;
        const x2 = x1 - this.step;
        const path = new line(x2, y1, x1, y1);
        if (!path.intersection(maze)) {
            return new element(new Point(this.start.x - this.step, this.start.y), this.step);
        }
    }

    goUp(maze) {
        const x1 = this.start.x + this.step / 2;
        const y1 = this.start.y + this.step / 2;
        const x2 = x1;
        const y2 = y1 - this.step;
        const path = new line(x1, y1, x2, y2);
        if (!path.intersection(maze)) {
            return new element(new Point(this.start.x, this.start.y - this.step), this.step);
        }
    }

    equals(other) {
        return this.start.x === other.start.x && this.start.y === other.start.y;
    }


    draw(col = "blue", padding = 2) {
        ctx.fillStyle = col;
        ctx.strokeStyle = "green";
        ctx.fillRect(this.start.x + padding, this.start.y + padding, this.step - 2 * padding, this.step - 2 * padding);
        ctx.beginPath();
        ctx.rect(this.start.x + padding, this.start.y + padding, this.step - 2 * padding, this.step - 2 * padding);
        ctx.stroke();
    }

    hash() {
        let hash = 100000 * this.start.x;
        hash += this.start.y;
        return hash;
    }
}

class grid {
    constructor(size, height, width, start_element) {
        this.elements = [];
        this.size = size;
        for(let i = 0; i < width; i += size) {
            for(let j = 0; j < height; j += size) {
                const temp  = new element(new Point(i, j), size);
                if(!start_element.equals(temp))
                    this.elements.push(temp);
            }
        }
    }

    contains_element(el) {
        for(let i = 0; i < this.elements.length; i++){
            if(this.elements[i].equals(el)){
                this.elements.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    add_and_delete(to_add, to_delete) {
        for(let i = 0; i < this.elements.length; i++){
            if(this.elements[i].equals(to_delete)){
                this.elements.splice(i, 1);
                break;
            }
        }
        this.elements.push(to_add);
    }
}

function random_form_to(start, end) {
    return Math.random() * (end - start) + start;
}


function add_random_horizontal_wall_to_maze(walls_to_fill, cell_to_devide, min_size, size, doors) {
    const up = cell_to_devide.up;
    const down = cell_to_devide.down;
    const left = cell_to_devide.left;
    const right = cell_to_devide.right;
    if (size <= min_size) {
        return;
    }
    const val = Math.floor(random_form_to(min_size, Math.sqrt(right.length()) - min_size) / min_size) * min_size;//Math.floor(random_form_to(min_size, Math.sqrt(down.length()) - min_size) / min_size) * min_size;
    const new_right = new line(right.x1, right.y1, right.x2, right.y2 - val);
    const new_left = new line(left.x1, left.y1, left.x2, left.y2 - val);
    let new_down = new line(down.x1, down.y1 - val, down.x2, down.y2 - val);
    const new_cell = new cell(up, new_down, new_right, new_left);
    const other_right = new line(right.x1, right.y2 - val, right.x2, right.y2);
    const other_left = new line(left.x1, left.y2 - val, left.x2, left.y2);
    const other_cell = new cell(new_down, down, other_right, other_left);
    let door_pos = Math.floor((Math.random() * (Math.sqrt(new_down.length()) - min_size)) / min_size) * min_size;
    if (door_pos >= Math.sqrt(new_down.length())) {
        return;
    }
    const l_part = new line(new_down.x1, new_down.y1, new_down.x1 + door_pos, new_down.y2);
    if (l_part.x1 > l_part.x2) {
        return;
    }
    const p_part = new line(l_part.x2 + min_size, l_part.y1, new_down.x2, new_down.y2);
    if (p_part.x1 > p_part.x2) {
        return;
    }
    doors.push(new line(l_part.x2, l_part.y2, p_part.x1, p_part.x2));
    if (!(l_part.x1 === l_part.x2 && l_part.y1 === l_part.y2)) {
        walls_to_fill.push(l_part);
    }
    if (!(p_part.x1 === p_part.x2 && p_part.y1 === p_part.y2)) {
        walls_to_fill.push(p_part);
    }
    draw_lines(walls_to_fill, ctx);
    rec_div_met(walls_to_fill, new_cell, min_size, doors);
    rec_div_met(walls_to_fill, other_cell, min_size, doors);
}

function add_random_vertical_wall_to_maze(walls_to_fill, cell_to_devide, min_size, size, doors) {
    const up = cell_to_devide.up;
    const down = cell_to_devide.down;
    const left = cell_to_devide.left;
    const right = cell_to_devide.right;
    const val =  Math.floor(random_form_to(min_size, Math.sqrt(down.length()) - min_size) / min_size) * min_size;//Math.floor(Math.sqrt(down.length()) / 2 / min_size) * min_size;
    const new_up = new line(up.x1, up.y1, up.x2 - val, up.y2);
    const new_down = new line(down.x1, down.y1, down.x2 - val, down.y2);
    let new_right = new line(right.x1 - val, right.y1, right.x2 - val, right.y2);
    const new_cell = new cell(new_up, new_down, new_right, left);
    const other_up = new line(up.x2 - val, up.y1, up.x2, up.y2);
    const other_down = new line(down.x2 - val, down.y1, down.x2, down.y2);
    const other_cell = new cell(other_up, other_down, right, new_right);
    let door_pos = Math.floor((Math.random() * (Math.sqrt(new_right.length()) - min_size)) / min_size) * min_size;
    if (door_pos >= Math.sqrt(new_right.length())) {
        return;
    }
    const t_part = new line(new_right.x1, new_right.y1, new_right.x2, new_right.y1 + door_pos);
    if (t_part.y1 > t_part.y2) {
        return;
    }
    const d_part = new line(t_part.x1, t_part.y2 + min_size, new_right.x2, new_right.y2);
    if (d_part.y1 > d_part.y2) {
        return;
    }
    doors.push(new line(t_part.x2, t_part.y2, d_part.x1, d_part.x2));
    if (!(d_part.x1 === d_part.x2 && d_part.y1 === d_part.y2)) {
        walls_to_fill.push(d_part);
    }
    if (!(t_part.x1 === t_part.x2 && t_part.y1 === t_part.y2)) {
        walls_to_fill.push(t_part);
    }
    draw_lines(walls_to_fill, ctx);
    rec_div_met(walls_to_fill, new_cell, min_size, doors);
    rec_div_met(walls_to_fill, other_cell, min_size, doors);
}

function roundUp(val, to) {
    return Math.floor(val / to) * to;
}

function rec_div_met(walls_to_fill, cell_to_devide, min_size, doors, h = 0) {
    if (walls_to_fill.length === 0) {
        const height = roundUp(window.innerHeight - h, min_size);
        const width = roundUp(window.innerWidth, min_size);
        const up = new line(0, 0, width, 0);
        const down = new line(0, height, width, height);
        const left = new line(0, 0, 0, height);
        const right = new line(width, 0, width, height);
        let first_cell = new cell(up, down, right, left);
        first_cell.addWallsToArray(walls_to_fill);
        rec_div_met(walls_to_fill, first_cell, min_size, doors);
    } else {
        let size = cell_to_devide.height();
        if (cell_to_devide.height() <= min_size + 10 || cell_to_devide.width() <= min_size + 10) {
            return;
        }
        if (size > cell_to_devide.width()) {
            if (size <= min_size) {
                size = cell_to_devide.width();
                if (size <= min_size) {
                    return;
                }
                add_random_vertical_wall_to_maze(walls_to_fill, cell_to_devide, min_size, size, doors);
                return;
            }
            add_random_horizontal_wall_to_maze(walls_to_fill, cell_to_devide, min_size, size, doors);
        } else {
            size = cell_to_devide.width();
            if (size <= min_size) {
                size = cell_to_devide.height();
                if (size <= min_size) {
                    return;
                }
                add_random_horizontal_wall_to_maze(walls_to_fill, cell_to_devide, min_size, size, doors);
                return;
            }
            add_random_vertical_wall_to_maze(walls_to_fill, cell_to_devide, min_size, size, doors);
        }
    }
}

function draw_lines(lines, can) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    // lines.forEach(element => {
    //     element.draw(can);
    // });
    for(let i = 0; i < lines.length; i++){
        if(i === lines.length - 1) {
            lines[i].draw(can, "red");
        } else {
            lines[i].draw(can);
        }
    }
}

function move_handler_helper(new_element) {
    if(new_element === undefined) return;
    Grid.add_and_delete(new_element, startElement);
    paths = [[new_element]];
    set_of_elements_to_draw.add(startElement);
    startElement = new_element;
}

function move_handler(event) {
    const x = event.key;
    switch(x) {
        case "ArrowLeft":
            move_handler_helper(startElement.goLeft(walls));
            break;
        case "ArrowRight":
            move_handler_helper(startElement.goRight(walls));
            break;
        case "ArrowUp":
            move_handler_helper(startElement.goUp(walls));
            break;
        case "ArrowDown":
            move_handler_helper(startElement.goDown(walls));
            break;
    }
    on_mouse_move();
}


function solve_helper(new_element, copy, path_to_fill){
    if (new_element !== undefined) {
        if (Grid.contains_element(new_element)) {
            path_to_fill.push([...copy]);
            path_to_fill[path_to_fill.length - 1].push(new_element);
            set_of_elements_to_draw.add(new_element);
            return 1;
        }
    }
    return 0;
}

function solve_maze(path_to_fill, walls, finale_element){
    path_to_fill.forEach((elements, index) => {
        // const index = path_to_fill.length - 1;
        // const elements = path_to_fill[index];

        const last_element = elements[elements.length - 1];
        if(last_element.equals(finale_element) ){
            path_to_fill.splice(0, index);
            path_to_fill.splice(1, path_to_fill.length - 1);
            path_to_fill[0].forEach(elem => {
                solution_path.add(elem);
            });
            on_mouse_move();
            clearInterval(solve_maze_interval_id);
            return;
        }
        const copy = [...elements];
        let temp = last_element.goDown(walls);
        let flag = 0;
        if (temp !== undefined) {
            if (Grid.contains_element(temp)) {
                elements.push(temp);
                set_of_elements_to_draw.add(temp);
                flag += 1;
            }
        }
        temp = last_element.goRight(walls);
        flag += solve_helper(temp, copy, path_to_fill);
        temp = last_element.goUp(walls);
        flag += solve_helper(temp, copy, path_to_fill);
        temp = last_element.goLeft(walls);
        flag += solve_helper(temp, copy, path_to_fill);
        if (flag === 0 && path_to_fill.length > 1) {
            path_to_fill.splice(index, 1);
        }
    });
    on_mouse_move();
}

function draw_path(path_to_draw) {

    set_of_elements_to_draw.forEach(elem => {
        elem.draw()
    });

    solution_path.forEach(elem => {
        elem.draw("yellow");
    });
}

function start_pos_handler() {
    choose_start = true;
    choose_final = false;
}

function final_pos_handler() {
    choose_start = false;
    choose_final = true;
}

function on_mouse_move(event) {
    let x, y;
    const ui = document.querySelector('#ui');
    if (event === undefined) {
        x = last_X;
        y = last_Y;
    } else {
        x = event.clientX;
        y = event.clientY - ui.clientHeight;
    }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    draw_lines(walls, ctx);
    draw_path(paths);
    finalElement.draw('green');
    startElement.draw('red');
    ctx.lineWidth = thick;
    const r = R;
    if(draw_light){
        x = startElement.start.x + size_of_cell / 2;
        y = startElement.start.y + size_of_cell / 2;
        Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
        for (let i = 0; i < 2 * Math.PI; i += (Math.PI / 100)) {
            const obj = new line(x, y, x + r * Math.cos(i), y + r * Math.sin(i));
            obj.intersection(walls);
            obj.draw(ctx);
        }
    }

    last_X = x;
    last_Y = y;
}

function on_mouse_clicked(event) {
    const ui = document.querySelector('#ui');
    const x = event.clientX;
    const y = event.clientY - ui.clientHeight;
    if (choose_final) {
        finalElement = new element(new Point(roundUp(x, size_of_cell), roundUp(y, size_of_cell)), size_of_cell);
        clear_handler();
        on_mouse_move();
    } else if (choose_start) {
        startElement = new element(new Point(roundUp(x, size_of_cell), roundUp(y, size_of_cell)), size_of_cell);
        clear_handler();
        on_mouse_move();
    }
}

let canvas;
let ctx;
let thick;
let walls = [];
let paths = [[]];
let size_of_cell = 20;
const solution_path = new Set();
let Grid;
const set_of_elements_to_draw = new Set();
let last_X = 0;
let last_Y = 0;
let R = 100;
let finalElement;
let startElement;
let solve_maze_interval_id;
let draw_light = false;
let choose_start = false;
let choose_final = false;

function solve_handler() {
    solve_maze_interval_id = setInterval(solve_maze, 10, paths, walls, finalElement);
}

function light_handler() {
    draw_light = !draw_light;
    on_mouse_move();
}

function clear_handler() {
    clearInterval(solve_maze_interval_id);
    paths = [[startElement]];
    solution_path.forEach(el => solution_path.delete(el));
    set_of_elements_to_draw.forEach(el => set_of_elements_to_draw.delete(el));
    Grid = new grid(size_of_cell, roundUp(window.innerHeight, size_of_cell), roundUp(window.innerWidth, size_of_cell), startElement);
    on_mouse_move();
}

function new_maze_handler() {
    clear_handler();
    const ui = document.querySelector('#ui');
    walls = [];
    rec_div_met(walls, window, size_of_cell, [], ui.clientHeight);
}

function range_handler() {
    const slider = document.querySelector("#sizer");
    size_of_cell = parseInt(slider.value);
    set_up();
}

function change_handler() {
    const size_holder = document.querySelector("#size");
    const slider = document.querySelector("#sizer");
    size_holder.innerHTML = slider.value;
}

function set_up(){
    const slider = document.querySelector("#sizer");
    const sizer_div = document.querySelector("#sizer_div");
    const buttons = document.querySelectorAll(".example_a");
    const legend = document.querySelector("#legend");
    let size_of_slider = 0;
    buttons.forEach(button => size_of_slider += button.clientWidth);
    sizer_div.clientWidth = size_of_slider;
    slider.style.width = size_of_slider + "px";
    legend.style.margin = "0px 0px 0px " + (window.innerWidth - size_of_slider) / 2 + "px";
    slider.value = size_of_cell;
    slider.min = 20;
    slider.max = 100;
    canvas = document.querySelector('canvas');
    const ui = document.querySelector('#ui');
    ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - ui.clientHeight;
    const height = window.innerHeight - ui.clientHeight;
    const width = window.innerWidth;
    finalElement = new element(new Point(roundUp(window.innerWidth, size_of_cell) - size_of_cell, roundUp(window.innerHeight - ui.clientHeight, size_of_cell) - size_of_cell), size_of_cell);
    startElement = new element(new Point(0, 0), size_of_cell);
    paths = [[startElement]];
    Grid = new grid(size_of_cell, roundUp(window.innerHeight, size_of_cell), roundUp(window.innerWidth, size_of_cell), startElement);
    set_of_elements_to_draw.forEach(elem => set_of_elements_to_draw.delete(elem));
    solution_path.forEach(elem => solution_path.delete(elem));
    set_of_elements_to_draw.add(paths[0][0]);
    const kinput = document.querySelector('body');
    kinput.onkeydown = move_handler;


    const random = false;
    if (random) {
        for (let i = 0; i < height; i += 200) {
            for (let j = 0; j < width; j += 200) {
                walls.push(new line(j, i, j + Math.random() * 100, i + Math.random() * 100));
            }
        }
    } else {
        walls = [];
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        rec_div_met(walls, window, size_of_cell, [], ui.clientHeight);
    }
    draw_lines(walls, ctx);
    on_mouse_move();
    //document.body.addEventListener('mousemove', on_mouse_move, false);
    document.querySelector("#maze").addEventListener('mousedown', on_mouse_clicked);
    window.addEventListener("wheel", event => {
        R += event.deltaY / 25.0;
        on_mouse_move(event);
    });
}