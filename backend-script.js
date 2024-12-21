const graph = {
    "ISLAMABAD": [
        {destination: "LAHORE", cost: 4},
        {destination: "MURREE", cost: 3},
    ],
    "LAHORE": [
        {destination: "KARACHI", cost: 7},
        {destination: "PESHAWAR", cost: 4},
        {destination: "ISLAMABAD", cost: 4},
    ],
    "KARACHI": [
        {destination: "LAHORE", cost: 7},
    ],
    "MURREE": [
        {destination: "ISLAMABAD", cost: 3},
        {destination: "GUJRANWALA", cost: 8},
    ],
    "GUJRANWALA": [
        {destination: "PESHAWAR", cost: 5},
        {destination: "MURREE", cost: 8}
    ],
    "PESHAWAR": [
        {destination: "GUJRANWALA", cost: 5},
        {destination: "LAHORE", cost: 4}
    ]
};
const positions = {
    "ISLAMABAD": {x: 50, y: 70},
    "LAHORE": {x: 175, y: 70},
    "KARACHI": {x: 300, y: 70},
    "MURREE": {x: 175, y: 150},
    "GUJRANWALA": {x: 450, y: 150},
    "PESHAWAR": {x: 400, y: 170},
}

const reselAllBtn = document.getElementById('reset-graph-btn');
const createNodeForm = document.getElementById('create-edge-form');
const startTraversingBtn = document.getElementById('start-traversing-btn');

const canvas = document.getElementById("graph-canva");
const ctx = canvas.getContext('2d');

const priorityQueueList = document.getElementById('priority-queue');

createNodeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const source = document.getElementById('source').value.toUpperCase();
    const destination = document.getElementById('destination').value.toUpperCase();
    const cost = parseInt(document.getElementById('cost').value.toUpperCase(), 10);
    
    addEdge(source, destination, cost);
});

function addEdge(source, destination, cost) {
    if (!graph[source]) graph[source] = [];
    if (!graph[destination]) graph[destination] = [];
    if (!positions[source]) positions[source] = randomPosition();
    if (!positions[destination]) positions[destination] = randomPosition();

    graph[source].push({ destination, cost });
    graph[destination].push({ destination: source, cost });
    createNodeForm.reset();
    drawGraph();
}

function randomPosition() {
    return { x: Math.random() * 200 + 50, y: Math.random() * 500 + 50 };
}

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const visited = new Set();
    for (const source in graph) {
        if(!visited.has(source)) {
            visited.add(source);
            for (const edge of graph[source]) {
                const destination = edge.destination;
                if(!visited.has(destination)) {
                    const start = positions[source];
                    const end = positions[destination];
        
                    ctx.beginPath(); 
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.strokeStyle = 'black'
                    ctx.lineWidth = 2
                    ctx.stroke();
                    ctx.closePath();
        
                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    ctx.font = "11px Ariel"
                    ctx.fillStyle = 'black';
                    ctx.fillText(edge.cost, midX, midY - 5);
                }
            }
        }
    }

    for (const key in positions) {
        const {x, y} = positions[key];
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.closePath();
        
        ctx.fillStyle = 'green';
        ctx.fillText(key, x - 15, y - 27);
    }
}

reselAllBtn.addEventListener('click', () => {
    document.getElementById('source').value = "";
    document.getElementById('destination').value = "";
    document.getElementById('cost').value = 0;
    priorityQueueList.innerHTML = '';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

startTraversingBtn.addEventListener('click', () => {
    const algorithm = document.getElementById('algorithm').value;

    const start = document.getElementById('starting-node').value.toUpperCase();
    const goal = document.getElementById('goal-node').value.toUpperCase();
    let queue;

    if (algorithm === "BFS")
        queue = [BFS(start, goal)];
    else if (algorithm === "DFS")
        queue = [DFS(start, goal)];
    else if (algorithm === "UCS")
        queue = uniformCostSearch(start, goal);

    updateQueueUI(queue);
});

function updateQueueUI(queue) {
    priorityQueueList.innerHTML = '';
    for (const item of queue[0].path) {
        const li = document.createElement('li');
        li.textContent = `${item}`;
        priorityQueueList.appendChild(li);
    }
    const li = document.createElement('li');
    li.textContent = `Overall Cost: ${queue[0].cost}`
    priorityQueueList.appendChild(li);
}

function BFS(start, goal) {
    const visited = new Set();
    const queue = [{node: start, cost: 0, path: [start]}];

    while(queue.length > 0) {
        const current = queue.shift();

        if(!visited.has(current.node)) {
            visited.add(current.node);

            if(current.node === goal)
                return {
                    cost: current.cost,
                    path: current.path
                };

            for (const neighbor of graph[current.node] || []) {
                if(!visited.has(neighbor.destination)) {
                    queue.push({
                        node: neighbor.destination,
                        cost: current.cost + neighbor.cost,
                        path: [...current.path, neighbor.destination]
                    })
                } 
            }
        }
    }
}

function DFS(start, goal) {
    const visited = new Set();
    const stack = [{node: start, cost: 0, path: [start]}];

    while(stack.length > 0) {
        const current = stack.pop();

        if(!visited.has(current.node)) {
            visited.add(current.node);

            if(current.node === goal)
                return {
                    cost: current.cost,
                    path: current.path
                };

            for (const neighbor of graph[current.node] || []) {
                if(!visited.has(neighbor.destination)) {
                    stack.push({
                        node: neighbor.destination,
                        cost: current.cost + neighbor.cost,
                        path: [...current.path, neighbor.destination]
                    })
                }
            }
        }
    }
}

function uniformCostSearch(start, goal) {
    const visited = new Set();
    const queue = [{node: start, cost: 0, path: [start]}];
    const paths = [];

    while(queue.length > 0) {
        queue.sort((a, b) => a.cost - b.cost);
        const current = queue.shift();
        
        if(current.node === goal) {
            paths.push({
                cost: current.cost,
                path: current.path,
            });
            continue;
        }

        if(!visited.has(current.node)) {
            visited.add(current.node);

            for (const neighbor of graph[current.node] || []) {
                if (!visited.has(neighbor.destination)) {
                    queue.push({
                        node: neighbor.destination,
                        cost: current.cost + neighbor.cost,
                        path: [...current.path, neighbor.destination]
                    });
                } 
            }
        }
    }

    return paths;
}

drawGraph();