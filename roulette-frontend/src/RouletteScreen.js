import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const RouletteScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [result, setResult] = useState(location.state?.result || '');
    const [segments, setSegments] = useState(location.state?.segments || [1, 2, 3, 4, 5, 6]);;
    const canvasRef = useRef(null);
    const colors = ['#FF6B6B', '#4ECDC4', '#45B751', '#96CEB4', '#FFEEAD', '#D4A5A5'];
    useEffect(() => {
        const audio = new Audio('http://freesound.org/data/previews/120/120374_2157667-lq.mp3');
        if (!result){
            fetch('http://localhost:8080/api/roulette', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(location.state || {type: 'number', start: 1, end: 6}),
                credentials: 'include'
            })
                .then(res => {
                    if(!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                    return res.json(); 
                })
                .then(data => {
                    setResult(data.result);
                    audio.play();
                })
                .catch(err => {
                    console.error('Error: ', err);
                    setResult('エラー: ' + err.message);
                });
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let startAngle = 0;
        let speed = 0.1;
        const spin = () => {
            ctx.clearReact(0, 0, canvas.width, canvas.height);
            const arc = 2 * Math.PI / segments.length;
            segments.forEach((seg, i) => {
                ctx.beginPath();
                ctx.arc(100, 100, 80, startAngle, startAngle + arc);
                ctx.lineTo(100, 100);
                ctx.fillStyle = colors[i % colors.length];
                ctx.fill();
                ctx.save();
                ctx.translate(100, 100);
                ctx.rotate(startAngle + arc / 2);
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(seg, 60, 0);
                ctx.restore();
                startAngle += arc;
            });
            startAngle += speed;
            speed *= 0.99;
            if (speed > 0.01) {
                requestAnimationFrame(spin);
            } else {
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`結果: ${result || 'スピン中'}`, 100, 100);
            }
        };
        requestAnimationFrame(spin);
    }, [segments, result]);
    return (
        <div className="p-4 max-w-md mx-auto bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center">ルーレット</h1>
            <canvas ref={canvasRef} width="200" height="200" className="mx-auto" />
            <p className="text-center">結果: {result || 'スピン中...'}</p>
            <p>ルーレットが回る</p>
            <button 
                onClick={() => navigate('/')}
                className="bg-gray-500 text-white p-2 rounded mx-auto block"
            >
                設定に戻る
            </button> 
        </div>
    );
};
export default RouletteScreen;