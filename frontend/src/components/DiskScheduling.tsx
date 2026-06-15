import React, { useState, useEffect, useRef } from 'react';
import './DiskScheduling.css';

interface SeekMovement {
    from: number;
    to: number;
    distance: number;
}

export const DiskScheduling: React.FC = () => {
    // State management for input values
    const [algorithm, setAlgorithm] = useState<string>('First-Come, First-Served (FCFS)');
    const [queueInput, setQueueInput] = useState<string>('98, 183, 37, 122, 14, 124, 65, 67');
    const [initialHead, setInitialHead] = useState<number>(53);
    
    // Processed run results state
    const [sequence, setSequence] = useState<number[]>([]);
    const [movements, setMovements] = useState<SeekMovement[]>([]);
    const [totalMovement, setTotalMovement] = useState<number>(0);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Core Logic Processing Engine (Simulating FCFS by default for the visualization sequence)
    const handleExecuteRun = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert the string input safely into an integer array
        const parsedQueue = queueInput
            .split(',')
            .map(num => parseInt(num.trim(), 10))
            .filter(num => !isNaN(num));

        if (parsedQueue.length === 0) return;

        // Build total head sequence tracking starting path
        const fullSequence = [initialHead, ...parsedQueue];
        setSequence(fullSequence);

        // Generate the computation steps log arrays
        const computedMovements: SeekMovement[] = [];
        let total = 0;

        for (let i = 0; i < fullSequence.length - 1; i++) {
            const from = fullSequence[i];
            const to = fullSequence[i + 1];
            const distance = Math.abs(to - from);
            total += distance;
            
            computedMovements.push({ from, to, distance });
        }

        setMovements(computedMovements);
        setTotalMovement(total);
    };

    // Canvas Plotting Side-Effect Hook
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear view area frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const paddingLeft = 50;
        const paddingRight = 50;
        const paddingTop = 40;
        const paddingBottom = 20;

        const graphWidth = canvas.width - paddingLeft - paddingRight;
        const graphHeight = canvas.height - paddingTop - paddingBottom;
        const maxTracks = 200;

        // Render Scale Timeline Track Axis
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, paddingTop);
        ctx.lineTo(paddingLeft + graphWidth, paddingTop);
        ctx.stroke();

        // Render Axis Markers (0, 50, 100, 150, 200)
        ctx.fillStyle = '#4A5559';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        for (let i = 0; i <= maxTracks; i += 50) {
            let x = paddingLeft + (i / maxTracks) * graphWidth;
            ctx.beginPath();
            ctx.moveTo(x, paddingTop - 4);
            ctx.lineTo(x, paddingTop);
            ctx.stroke();
            ctx.fillText(i.toString(), x, paddingTop - 10);
        }

        if (sequence.length === 0) return;
        const stepY = sequence.length > 1 ? graphHeight / (sequence.length - 1) : 0;

        // Draw Head Path Segment Trace Lines
        ctx.strokeStyle = '#4A5559';
        ctx.lineWidth = 2;
        ctx.beginPath();
        sequence.forEach((track, index) => {
            let x = paddingLeft + (track / maxTracks) * graphWidth;
            let y = paddingTop + (index * stepY);
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Render Nodes Points and Text labels
        sequence.forEach((track, index) => {
            let x = paddingLeft + (track / maxTracks) * graphWidth;
            let y = paddingTop + (index * stepY);

            ctx.fillStyle = index === 0 ? '#3B7A6A' : '#4A5559';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = '#4A5559';
            ctx.font = 'bold 10px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(` (${track})`, x + 6, y + 3);
        });
    }, [sequence]);

    // Load initial slide values on frame mount for showcase
    useEffect(() => {
        const dummyEvent = { preventDefault: () => {} } as React.FormEvent;
        handleExecuteRun(dummyEvent);
    }, []);

    return (
        <div className="disk-scheduling-padding">
            {/* Row 1: Physical Block Grid Map */}
            <section className="disk-card">
                <h4 className="card-title">Physical Disk Block Map (Sector View)</h4>
                <div className="grid-visualizer">
                    <div className="block allocated"></div>
                    <div className="block allocated"></div>
                    <div className="block allocated"></div>
                    <div className="block"></div>
                    <div className="block"></div>
                    <div className="block"></div>
                    <div className="block"></div>
                    <div className="block"></div>
                    <div className="block"></div>
                    <div className="block"></div>
                </div>
            </section>

            {/* Row 2: Form Input Controls Row */}
            <section className="disk-card">
                <h4 className="card-title">Simulation Controls</h4>
                <form onSubmit={handleExecuteRun} className="controls-form">
                    <div className="input-field-group">
                        <label htmlFor="algorithm">Scheduling Algorithm</label>
                        <select 
                            id="algorithm" 
                            value={algorithm} 
                            onChange={(e) => setAlgorithm(e.target.value)}
                        >
                            <option>First-Come, First-Served (FCFS)</option>
                            <option>Shortest Seek Time First (SSTF)</option>
                            <option>SCAN / Elevator</option>
                            <option>C-SCAN</option>
                        </select>
                    </div>

                    <div className="input-field-group" style={{ flex: 0.3 }}>
                        <label htmlFor="head">Initial Head Position</label>
                        <input 
                            type="number" 
                            id="head" 
                            value={initialHead} 
                            onChange={(e) => setInitialHead(parseInt(e.target.value, 10) || 0)}
                        />
                    </div>
                    
                    <div className="input-field-group">
                        <label htmlFor="queue">I/O Request Queue</label>
                        <input 
                            type="text" 
                            id="queue" 
                            value={queueInput} 
                            onChange={(e) => setQueueInput(e.target.value)}
                            placeholder="e.g., 98, 183, 37, 122"
                        />
                    </div>

                    <button type="submit" className="execute-btn">Execute Run</button>
                </form>
            </section>

            {/* Row 3: Expanded Performance Graphic Trace Canvas */}
            <section className="disk-card">
                <h4 className="card-title">Performance Analytics</h4>
                <div className="canvas-container">
                    <canvas ref={canvasRef} width={800} height={320} className="disk-canvas"></canvas>
                </div>
            </section>

            {/* Row 4: Calculation Result Breakdown Table Log */}
            <section className="disk-card">
                <div>
                    <h4 className="card-title" style={{ marginBottom: '4px' }}>Total Head Movement Computation Log</h4>
                    <p className="card-subtitle">Step-by-step trace breakdown of the sector intervals traversed by the disk head.</p>
                </div>

                <div className="table-responsive-wrapper">
                    <table className="movement-matrix-table">
                        <thead>
                            <tr>
                                <th style={{ width: '45%' }}>Head Seek Path Traversed</th>
                                <th style={{ width: '10%' }}></th>
                                <th style={{ width: '45%' }}>Seek Distance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.map((move, index) => (
                                <tr key={index}>
                                    <td>from <span className="bold-track">{move.from}</span> to <span className="bold-track">{move.to}</span></td>
                                    <td className="equals-sign">=</td>
                                    <td className="distance-output">{move.distance} tracks</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="foot-label">Total Head Movement</td>
                                <td className="equals-sign" style={{ color: '#3B7A6A' }}>=</td>
                                <td className="foot-total">{totalMovement} tracks</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </section>
        </div>
    );
};