import React from 'react';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const RouletteScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || '');
  const canvasRef = useRef(null);

  const segments = useMemo(() => {
    return location.state?.segments ||
           (location.state?.type === 'number' ?
             Array.from({ length: (location.state?.end ?? 6) - (location.state?.start ?? 1) + 1 },
               (_, i) => String(i + (location.state?.start ?? 1))) :
             ['1', '2', '3', '4', '5', '6']);
  }, [location.state]);

  const colors = useMemo(() => {
    return segments.map((_, i) => `hsl(${(i * 360) / segments.length}, 70%, 60%)`);
  }, [segments]);
  // ルーレットの数字
  const rouletteNumbers = Array.from({ length: 37}, (_, i) => i);
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  const handleSpin = useCallback(async () => {
    setResult('');
    const audio = new Audio('https://freesound.org/data/previews/120/120374_2157667-lq.mp3');
    try {
            const requestBody = {
                type: location.state?.type || 'number'
                , start: location.state?.start ?? 1
                , end: location.state?.end ?? 6
                , segments: location.state?.segments || null,
            };
            console.log('Sending request with body: ', requestBody);
            const response = await fetch('http://localhost:8080/api/roulette', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                credentials: 'include',
            });
        console.log("Response status: ", response.status, response.statusText);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }
        const data = await response.json();
        console.log("Response data: ", data);
        if(!data.result) throw new Error('Invalid response: result missing');
        setResult(data.result);
        audio.play().catch(err => console.error('Audio play failed: ', err));
    } catch(error) {
        console.error('Fetch error: ', error);
        setResult(`サーバーエラー： ${error.message}`);
    }
  }, [location.state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let startAngle = 0;
    let speed = 0.2;
    let animationFrame;

    const drawRoulette = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        ctx.font = 'boled 16px Arial';
        ctx.fillText(seg, 60, 0);
        ctx.restore();
        startAngle += arc;
      });
    };

    const spin = () => {
      drawRoulette();
      startAngle += speed;
      speed *= 0.98;
      if (result && speed <= 0.005) {
        const targetIndex = segments.indexOf(result);
        startAngle = (targetIndex * (2 * Math.PI / segments.length)) % (2 * Math.PI);
        drawRoulette();
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`結果: ${result}`, 100, 100);
      } else if (speed > 0.005) {
        animationFrame = requestAnimationFrame(spin);
      }
    };

    animationFrame = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(animationFrame);
  }, [segments, result, colors]);

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-100 rounded-lg shadow-md animate-fade-in">
      <h1 className="text-2xl font-bold text-center">ルーレット</h1>
      <canvas ref={canvasRef} width="200" height="200" className="mx-auto" aria-hidden="true" />
      {/* ベッティングテーブル */}
      <div className='roulette-table mt-4'>
        {/* 数字エリア（0-36） */}
        <div className='number-grid'>
            <div className='number zero'>0</div>
            {rouletteNumbers.slice(1).map((num) => (
                <div
                    key={num}
                    className={clsx('number', redNumbers.includes(num) ? 'red' : 'black')}
                >
                    {num}
                </div>
            ))}
        </div>
      {/* 外部ベッドエリア */}
      <div className='outside-bets'>
        <div className='bet option'>Red</div>
        <div className='bet option'>Black</div>
        <div className='bet option'>Even</div>
        <div className='bet option'>Odd</div>
        <div className='bet option'>1-18</div>
        <div className='bet option'>19-36</div> 
        <div className='bet option'>1st 12</div>
        <div className='bet option'>2nd 12</div>
        <div className='bet option'>3rd 12</div>
      </div>
    </div>
    <p className={clsx('text-center', result ? 'animate-bounce' : '')} role="status">
        結果: {result || 'スピン中...'}
    </p>
      <button
        onClick={handleSpin}
        className="bg-blue-500 text-white p-2 rounded-lg mx-auto block transition duration-300 ease-in-out hover:bg-blue-600 hover:scale-105 active:scale-95"
        aria-label="ルーレットをスピン"
      >
        もう一度スピン
      </button>
      <button
        onClick={() => navigate('/')}
        className="bg-gray-500 text-white p-2 rounded-lg mx-auto block mt-2 transition duration-300 ease-in-out hover:bg-gray-600 hover:scale-105 active:scale-95"
        aria-label="設定画面に戻る"
      >
        設定に戻る
      </button>
    </div>
  );
};

export default React.memo(RouletteScreen);