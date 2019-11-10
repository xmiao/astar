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

let MAX_WIDTH: number, MAX_HEIGHT: number;
const destX = 299, destY = 299;

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
        let [x, y] = [sx, sy].map(x => +x || 0);
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
        return [[0, -1, 1], [1, 0, 1], [0, 1, 1], [-1, 0, 1], [1, 1, 1.414], [-1, -1, 1.414], [1, -1, 1.414], [-1, 1, 1.414]]
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
        let d2 = this.getDist(id2);
        // if (d1 === d2) return 0;
        if (d1 < d2) return -1;
        return 1;
    });
    private openList = {} as any;
    private closeList = {} as any;
    private sourceMap: any;

    getDist(id: ID): number {
        let n1 = this.sourceMap.get(id);
        if (!n1) return Infinity;

        let {cost, x, y, parent} = n1;
        let np = this.sourceMap.get(parent) || {};
        let {distance = 0, x: px, y: py} = np;

        // return distance + cost + ((x - destX) ** 2 + (y - destY) ** 2);
        // return distance + cost + Math.sqrt((x - destX) ** 2 + (y - destY) ** 2);
        // return distance + cost + Math.abs(x - destX) + Math.abs(y - destY);
        return distance + cost + Math.abs(x - destX) + Math.abs(y - destY);
    };

    componentDidMount() {
        const ctx = this.mapCanvas.getContext('2d');
        let {width, height} = this.mapCanvas;
        ctx.font = "bold 50px ComicSans";
        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.fillText("ABCDEF", -1, 60);
        ctx.fillText("XXABCDEF", -1, 120);
        ctx.fillText("VVVVSABCDEF", -1, 180);

        // ctx.fillText("VVVABCDEF", -1, 60);
        // ctx.fillText("ABCVVVVVVDEF", -1, 120);
        // ctx.fillText("SABVVVVVVVCDEF", -1, 180);

        const imageData = ctx.getImageData(0, 0, width, height);
        let {data, width: w2, height: h2} = imageData;
        MAX_WIDTH = w2;
        MAX_HEIGHT = h2;
        let d2 = data.map((x: any) => x);
        console.log({w2, width, height, h2});

        // for (let i = 0; i < data.length; i += 4) {
        //     data[i + 0] = 255 - data[i + 0];
        //     data[i + 1] = 255 - data[i + 1];
        //     data[i + 2] = 255 - data[i + 2];
        //     data[i + 3] = 255;
        // }
        // ctx.putImageData(imageData, 0, 0);

        this.sourceMap = new SourceMap(data);

        let curNode: Node | null = this.sourceMap.get("0,0");
        if (!curNode) return;

        curNode.distance = 0;
        this.enterOpenList('', curNode.id);

        let iii = 0;

        omg:
            while (!isEmpty(this.openList)) {
                //find minimum value from the openlist
                //process the closest point
                //find the best candidate
                let curID = this.leaveOpenList();
                if (!curID) return;

                //curID's neighbours go to the openlist.
                const curNode = this.sourceMap.get(curID);
                if (!curNode) return;

                let {distance} = curNode;

                for (let id of this.sourceMap.neighbours(curID)) {
                    const nd = this.sourceMap.get(id);
                    if (!nd) continue;

                    let {cost} = nd;
                    if (cost === Infinity) continue;
                    if (this.closeList[id]) continue;

                    if (iii++ > 100000) break omg;

                    this.enterOpenList(curID, id);

                    if (nd.x === destX && nd.y === destY) break omg;

                    nd.distance = distance + nd.cost;

                    let {x, y} = nd;
                    d2[((y * MAX_WIDTH) + x) * 4 + 1] = 80;
                    d2[((y * MAX_WIDTH) + x) * 4 + 3] = 100;
                }
            }

        for (let id = `${destX},${destY}`; id;) {
            let {parent, x, y} = this.sourceMap.get(id);
            d2[((y * MAX_WIDTH) + x) * 4 + 2] = 100;
            d2[((y * MAX_WIDTH) + x) * 4 + 3] = 255;
            id = parent;
        }

        for (let i = 0; i < data.length * 4; i++) {
            data[i] = d2[i];
        }

        ctx.putImageData(imageData, 0, 0);
    }

    render() {
        const self = this;
        return (
            <div className="rootContent">
                Demonstrating the A* path finding algorithm
                <canvas width="300px" height="300px" className="robotMap" ref={(r) => {
                    self.mapCanvas = r;
                }}/>
            </div>
        );
    }

    private leaveOpenList() {
        let ids = Object.keys(this.openList)
            .sort((id1: ID, id2: ID) => {
                let d1 = this.getDist(id1);
                let d2 = this.getDist(id2);
                if (d1 === d2) return 0;
                if (d1 < d2) return -1;
                return 1;
            });
        let id = ids[0];
        if (!id) return;

        delete this.openList[id];
        this.closeList[id] = 1;

        return id;
    };

    private enterOpenList(parentID: ID, id: ID) {
        if (this.closeList[id] || this.closeList[id]) return;
        const nd = this.sourceMap.get(id);
        nd.parent = parentID;

        this.openList[id] = 1;
    };
}

const App: React.FC = () => {
    return (
        <RobotMap/>
    );
};

export default App;
