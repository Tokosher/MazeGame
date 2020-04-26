const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0;

const { world } = engine;

const cellsX = 10;
const cellsY = 10;
let width = window.innerWidth;
let height = window.innerHeight;

const unitLengthX = width/cellsX;
const unitLengthY = height/cellsY;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls

const walls = [
    Bodies.rectangle(width*.5, 0, width, 2, {isStatic: true}), // top x y height width
    Bodies.rectangle(0, width*.5, 2, width, {isStatic: true}), // left
    Bodies.rectangle(width*.5, height, width, 2, {isStatic: true}), // bottom
    Bodies.rectangle(width, height*.5, 2, height, {isStatic: true}), // right
];

World.add(world, walls);

// generation map
const startCol = Math.floor(Math.random() * cellsX);
const startRow = Math.floor(Math.random() * cellsY);

const randomizer = (arr) => {
    let count = arr.length;
    while(count > 0) {
        let indx = Math.floor(Math.random() * count);

        count--;

        let temp = arr[count];
        arr[count] = arr[indx];
        arr[indx] = temp;
    }

    return arr;

};

const grid = Array(cellsY)
    .fill(null)
    .map(() => Array(cellsX).fill(false));

const verticals = Array(cellsY)
    .fill(null)
    .map(() => Array(cellsY - 1).fill(false));

const horizontals = Array(cellsY - 1)
    .fill(null)
    .map(() => Array(cellsX).fill(false));

const stepCell = (row,col) => {
    if(grid[row][col]) return;

    grid[row][col] = true;

    const neight = randomizer([
        [row-1, col, 'up'],
        [row, col + 1, 'right'],
        [row+1, col, 'down'],
        [row, col - 1, 'left'],
    ]);

    for(let neigh of neight) {
        let [nextRow, nextColumn, direction] = neigh;

        if(nextRow < 0 || nextRow >= cellsY || nextColumn < 0 || nextColumn >= cellsX) {
            continue;
        }

        if(grid[nextRow][nextColumn]) {
            continue;
        }

        if(direction === 'left') {
            verticals[row][col - 1] = true;
        } else if(direction === 'right') {
            verticals[row][col] = true;
        } else if(direction === 'up') {
            horizontals[row - 1][col] = true;
        } else if(direction === 'down') {
            horizontals[row][col] = true;
        }

        stepCell(nextRow, nextColumn);

    }

};

stepCell(startRow,startCol);

horizontals.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
        if(col) return;

        const wall = Bodies.rectangle(
            colIndex*unitLengthX + unitLengthX/2,
            rowIndex*unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'Indigo',
                }
            }
        );
        World.add(world, wall)
    })
});

verticals.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
        if(col) return;

        const wall = Bodies.rectangle(
            colIndex*unitLengthX + unitLengthX,
            rowIndex*unitLengthY + unitLengthY/2,
            5,
            unitLengthY,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'Indigo',
                }
            }
        );
        World.add(world, wall)
    })
});


const goal = Bodies.rectangle(
    width - unitLengthX/2,
    height - unitLengthY/2,
    unitLengthX*0.7,
    unitLengthY*0.7,
    {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'Lime',
        }
    }
);

World.add(world, goal);

// Ball

const ballRadius = (unitLengthX + unitLengthY)/2*0.25;

const ball = Bodies.circle(
    unitLengthX/2,
    unitLengthY/2,
    ballRadius,
    {
        label: 'ball',
        render: {
            fillStyle: 'RoyalBlue',
        }
    }
);

World.add(world, ball);

document.addEventListener('keydown', (e) => {
    const {x, y} = ball.velocity;

    if(e.keyCode === 87) {

        Body.setVelocity(ball, {x,y:y-5})

    }
    if(e.keyCode === 65) {

        Body.setVelocity(ball, {x: x - 5,y})
    }
    if(e.keyCode === 83) {

        Body.setVelocity(ball, {x,y:y+5})
    }
    if(e.keyCode === 68) {

        Body.setVelocity(ball, {x: x + 5,y})
    }
});

// In case 'Win'

Events.on(engine, 'collisionStart', e => {

    e.pairs.forEach(e => {
        const [ball, goal] = [e.bodyB.label, e.bodyA.label];
        if(ball === 'ball' && goal === 'goal') {
            document.querySelector('.win').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach((e) => {
                if(e.label === "wall") Body.setStatic(e, false);
            })

        }
    });

});