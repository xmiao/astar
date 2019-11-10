import React, {Component} from 'react';
import './App.css';

type Node = {
    id?: string;
    parent?: Node | null;
    distance?: number;
    x: number;
    y: number;
    cost: 0;
    neighbour?: Node[];
};

class RobotMap extends Component {
    private mapCanvas: any;

    componentDidMount() {
        const ctx = this.mapCanvas.getContext('2d');
        let {width, height} = this.mapCanvas;
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = 'rgb(200,0,0)';
        ctx.fillText("some some some", 20, 50);
        const {data} = ctx.getImageData(0, 0, width, height);
        console.log(data);

        let map = {} as any;

        for (let w = 0; w < width; w++) {
            for (let h = 0; h < width; w++) {
                const p = (w * width + h) * 4;
                let td = 0;
                for (let i = 0; i < 3; i++) {
                    td += data[p + i];
                }

                let {[w]: {[h]: nd} = {}} = map;


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
