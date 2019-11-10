import React, {Component} from 'react';
import './App.css';

type Node = {
    id: ID;
    parent: ID;
    distance: number; //f = g + h, so distance is g, which is parent's distance + distance to parent.
    x: number;
    y: number;
    cost: number;
};

type ID = string;

const MAX_WIDTH = 500, MAX_HEIGHT = 500;

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

    componentDidMount() {
        debugger;
        const ctx = this.mapCanvas.getContext('2d');
        let {width, height} = this.mapCanvas;
        ctx.font = "bold 20px ComicSans";
        ctx.fillStyle = 'rgb(200,0,0)';
        ctx.fillText("some some some", 20, 50);
        const {data} = ctx.getImageData(0, 0, width, height);

        let sourceMap = new SourceMap(data);

        let curNode: Node | null = sourceMap.get("0,0");
        if (!curNode) return;

        let openList = {} as any;
        let closeList = {} as any;
        curNode.distance = 0;
        curNode.parent = "";
        curNode.cost = 0;

        openList[curNode.id] = 1;

        omg:
            while (!isEmpty(openList)) {
                //find minimum value from the openlist
                //process the closest point

                //find the best candidate
                let shortDist = Infinity;
                let curID = Object.keys(openList)[0];
                for (let ndID in openList) {
                    if (!openList.hasOwnProperty(ndID)) continue;
                    let nd = sourceMap.get(ndID);
                    if (!nd) continue;

                    let {distance, x, y} = nd;
                    let g = distance;
                    let h = Math.abs(MAX_WIDTH - x) + Math.abs(MAX_HEIGHT - y);
                    if (shortDist < g + h) {
                        shortDist = g + h;
                        curID = ndID;
                    }
                }
                if (!curID) return;
                delete openList[curID];
                closeList[curID] = 1;

                //curID's neighbours go to the openlist.
                const curNode = sourceMap.get(curID);
                if (!curNode) return;

                let i = 0;
                for (let id of sourceMap.neighbours(curID)) {
                    // if the node is processed, move on to next node.
                    if (closeList[id]) continue;

                    i++;
                    if (i++ > 1000) break omg;

                    openList[id] = 1;
                    const nd = sourceMap.get(id);
                    if (!nd) continue;

                    nd.parent = curID;
                    nd.distance = curNode.distance + nd.cost;
                }

            }

    }

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
