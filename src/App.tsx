import React, {Component} from 'react';
import './App.css';
import {MinHeap} from './minheap';

type Node = {
    id: ID;
    parent: ID;
    distance: number; //f = g + h, so distance is g, which is parent's distance + distance to parent.
    x: number;
    y: number;
    cost: number;
};

type ID = string;

const MAX_WIDTH = 200, MAX_HEIGHT = 200;

class SourceMap {
    private readonly data: number[];
    private nodeMap = {} as { [id: string]: Node };

    constructor(data: number[]) {
        this.data = data;
    }

    get(id: ID): Node | null {
        const {nodeMap} = this;
        let nd = nodeMap[id];
        if (nd) return nd;

        let [sx, sy] = id.split(",");
        let [x, y] = [+sx, +sy];
        if (x < 0 || y < 0 || x >= MAX_WIDTH || y >= MAX_HEIGHT) return null;
        id = `${x},${y}`;
        nd = nodeMap[id];
        if (nd) return nd;

        let base = (y * MAX_WIDTH + x) * 4;
        let c = 0;
        for (let i = 0; i < 3; i++) {
            c += this.data[base + i];
        }
        nd = nodeMap[id] = {
            id, x, y,
            parent: '',
            cost: c > 0 ? Infinity : 1,
            distance: Infinity
        };
        return nd;
    }

    neighbours(id: ID): ID[] {
        let nd = this.get(id);
        if (!nd) return [];

        let {x, y} = nd;
        return [[0, -1], [1, 0], [0, 1], [-1, 0]]
            .map(([dx, dy]) => {
                let tmpNode = this.get(`${x + dx},${y + dy}`);
                if (!tmpNode) return '';
                return tmpNode.id;
            })
            .filter(x => x);
    }
}

function isEmpty(o: any) {
    if (!o) return true;
    // noinspection LoopStatementThatDoesntLoopJS
    for (let k in o) return false;
    return true;
}

class RobotMap extends Component {
    private mapCanvas: any;
    minHeap = new MinHeap([], (id1: ID, id2: ID) => {
        let d1 = this.getDist(id1);
        let d2 = this.getDist(id1);
        if (d1 === d2) return 0;
        if (d1 < d2) return -1;
        return 1;
    });
    private openList = {} as any;
    private closeList = {} as any;
    private sourceMap: any;

    getDist(id: ID): number {
        let n1: Node | null = this.sourceMap.get(id);
        if (!n1) return Infinity;
        let {distance, x, y} = n1;
        return distance + Math.sqrt((x - MAX_WIDTH) ** 2 + (y - MAX_HEIGHT) ** 2);
    };

    componentDidMount() {
        const ctx = this.mapCanvas.getContext('2d');
        let {width, height} = this.mapCanvas;
        ctx.font = "bold 20px ComicSans";
        ctx.fillStyle = 'rgb(200,0,0)';
        ctx.fillText("some some some", 20, 50);
        const {data} = ctx.getImageData(0, 0, width, height);

        let sourceMap = new SourceMap(data);

        let curNode: Node | null = sourceMap.get("0,0");
        if (!curNode) return;

        curNode.distance = 0;
        curNode.parent = "";
        curNode.cost = 0;

        this.enterOpenList(curNode.id);

        ctx.moveTo(MAX_WIDTH, MAX_HEIGHT);
        ctx.lineTo(MAX_WIDTH + 1, MAX_HEIGHT + 1);
        ctx.stroke();

        let iii = 0;

        omg:
            while (!isEmpty(this.openList)) {
                //find minimum value from the openlist
                //process the closest point

                //find the best candidate
                let shortDist = Infinity;
                let curID = Object.keys(this.openList)[0];
                for (let ndID in this.openList) {
                    let nd = sourceMap.get(ndID);
                    if (!nd) continue;

                    let {distance, x, y} = nd;
                    let g = distance;
                    let h = Math.sqrt((x - MAX_WIDTH) ** 2 + (y - MAX_HEIGHT) ** 2);
                    if (shortDist > g + h) {
                        shortDist = g + h;
                        curID = ndID;
                    }
                }
                if (!curID) return;
                this.leaveOpenList(curID);

                //curID's neighbours go to the openlist.
                const curNode = sourceMap.get(curID);
                if (!curNode) return;

                for (let id of sourceMap.neighbours(curID)) {
                    // if the node is processed, move on to next node.
                    if (this.closeList[id]) continue;

                    iii++;
                    if (iii > 10000) break omg;

                    this.enterOpenList(id);
                    const nd = sourceMap.get(id);
                    if (!nd) continue;
                    if (nd.x === MAX_WIDTH && nd.y === MAX_HEIGHT) break omg;
                    nd.parent = curID;
                    nd.distance = curNode.distance + nd.cost;

                    ctx.moveTo(nd.x, nd.y);
                    ctx.lineTo(nd.x + 1, nd.y + 1);
                    ctx.stroke();
                }
            }
    }

    private enterOpenList(id: ID) {
        if (this.closeList[id]) return;
        // delete this.closeList[id];
        this.openList[id] = 1;
        this.minHeap.push(id);
    };

    private leaveOpenList(id: ID) {
        delete this.openList[id];
        this.closeList[id] = 1;
        return this.minHeap.pop();
    };

    render() {
        const self = this;
        return (
            <div className="rootContent">
                Demonstrating the A* path finding algorithm
                <canvas width="500px" height="500px" className="robotMap" ref={(r) => {
                    self.mapCanvas = r;
                }}/>
            </div>
        );
    }
}

const App: React.FC = () => {
    return (
        <RobotMap/>
    );
};

export default App;
