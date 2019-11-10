import React, {Component} from 'react';
import './App.css';

class RobotMap extends Component {
    private mapCanvas: any;

    componentDidMount() {
        const ctx = this.mapCanvas.getContext('2d');
        ctx.fillStyle = 'rgb(200,0,0)';
        ctx.fillText("some some some", 100, 100);
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
