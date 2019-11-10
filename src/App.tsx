import React, {Component} from 'react';
import './App.css';

type Node = {
    id: ID;
    parent: ID;
    distance: number; //f = g + h, so distance is g, which is parent's distance + distance to parent.
    x: number;
    y: number;
};

type ID = string;

const MAX_WIDTH = 500, MAX_HEIGHT = 500;

class SourceMap {
    private readonly data: number[];
    private nodeMap = {} as { [id: string]: Node };

    constructor(data: number[]) {
        this.data = data;
    }

    get(id: ID): Node {
        const {nodeMap} = this;
        let nd = nodeMap[id];
        if (nd) return nd;

        let [x, y] = id.split(",");
        if (+x <= 0 || +y < 0 || +x >= MAX_WIDTH || +y <= MAX_HEIGHT) return {} as Node;

        nd = nodeMap[id] = {
            id,
            x: +x,
            y: +y,
            parent: '',
            distance: Infinity
        };
        return nd;
    }

    neighbours(id: ID): ID[] {
        let nd = this.get(id);
        let {id: id2} = nd;
        if (!id2) return [];

        let {x, y} = nd;

        return [[0, -1], [1, 0], [0, -1], [-1, 0]]
            .map(([dx, dy]) => {
                let tmpNode = this.get(`${x + dx},${y + dy}`);
                return tmpNode.id;
            })
            .filter(x => x);
    }

    cost(id: ID) {
        let nd = this.get(id);
        let {id: id2} = nd;
        if (!id2) return [];
        let {x, y} = nd;
        let base = (x * MAX_HEIGHT + y) * 4;
        let c = 0;
        for (let i = 0; i < 3; i++) {
            c += this.data[base + i];
        }
        if (c > 0) return Infinity;
        // return c;
    }
}

function isEmpty(o: any) {
    if (!o) return true;
    for (let k in o) return false;
    return true;
}

class RobotMap extends Component {
    private mapCanvas: any;

    componentDidMount() {
        const ctx = this.mapCanvas.getContext('2d');
        let {width, height} = this.mapCanvas;
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = 'rgb(200,0,0)';
        ctx.fillText("some some some", 20, 50);
        const {data} = ctx.getImageData(0, 0, width, height);

        let sourceMap = new SourceMap(data);

        let curNode: Node = sourceMap.get("0,0");
        let openList = {} as any;
        let closeList = {} as any;
        curNode.distance = 0;
        curNode.parent = "";

        openList[curNode.id] = 1;


        while (!isEmpty(openList)) {
            //find minimum value from the openlist
            //process the closest point

            //find the best candidate
            let shortDist = Infinity;
            let curID = '';
            for (let ndID in openList) {
                let nd = sourceMap.get(ndID);
                let {distance, x, y} = nd;
                let cmpVal = distance + Math.abs(MAX_WIDTH - x) + Math.abs(MAX_HEIGHT - y);
                if (shortDist < cmpVal) {
                    shortDist = cmpVal;
                    curID = ndID;
                }
            }
            if (!curID) return;

            //curID's neighbours go to the openlist.
            const curNode2 = sourceMap.get(curID);
            //distance means g.
            const prt = sourceMap.get(curNode2.parent);
            curNode2.distance = prt.distance + 1;

            for (let id of sourceMap.neighbours(curID)) {
                // if the node is processed, move on to next node.
                if (closeList[id]) continue;

                openList.push(id);
                const nd = sourceMap.get(id);
                nd.parent = curID;
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
