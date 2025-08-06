// C:\Users\NoriakiM\projects\roulette-frontend\src\SetupScreen.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SetupScreen = () => {
    const navigate = useNavigate();
    const [type, setType] = useState('');
    const [segments, setSegments] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('http://localhost:8080/api/hello', { credentials: 'include' })
            .then(res => res.text())
            .then(data => console.log('Hello API:', data))
            .catch(err => {
                console.error('Hello API Error:', err);
                setError('APIエラー: ' + err.message);
            });
    }, []);

    const handleSubmit = () => {
        if (!type) {
            setError('ルーレットの種類を選んでください！');
            return;
        }
        if (type === 'text' && (!segments || segments.split(',').length < 2)) {
            setError('少なくとも2つの選択肢を入力してください！');
            return;
        }
        if (type === 'number' && (!start || !end || parseInt(start) > parseInt(end))) {
            setError('有効な範囲を入力してください！');
            return;
        }
        setError('');
        const body = type === 'text'
            ? { type, segments: segments.split(',').map(s => s.trim()) }
            : { type, start: parseInt(start), end: parseInt(end) };
        console.log('Sending JSON:', JSON.stringify(body));
        fetch('http://localhost:8080/api/roulette', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(body),
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                return res.json();
            })
            .then(data => {
                console.log('Roulette API Response:', data);
                navigate('/roulette', {
                    state: {
                        segments: type === 'text' 
                            ? segments.split(',').map(s => s.trim())
                            : Array.from({ length: parseInt(end) - parseInt(start) + 1 }, 
                                (_, i) => String(i + parseInt(start))),
                        result: data.result
                    }
                });
            })
            .catch(err => {
                console.error('Roulette API Error:', err);
                setError('APIエラー: ' + err.message);
            });
    };

    return (
        <div className="p-4 max-w-md mx-auto bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center">ルーレット設定</h1>
            {error && <p className="text-red-500 text-center bg-red-100 p-2 rounded">{error}</p>}
            <div className="my-4">
                <label className="block text-gray-700">ルーレットの種類</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="border p-2 rounded w-full"
                >
                    <option value="">選択してください</option>
                    <option value="text">テキスト（例：ピザ,寿司）</option>
                    <option value="number">数値範囲（例：1～6）</option>
                </select>
            </div>
            {type === 'text' ? (
                <div className="my-4">
                    <label className="block text-gray-700">選択肢（カンマ区切り）</label>
                    <input
                        value={segments}
                        onChange={(e) => setSegments(e.target.value)}
                        placeholder="ピザ,寿司,ラーメン"
                        className="border p-2 rounded w-full"
                    />
                </div>
            ) : type === 'number' ? (
                <div className="my-4 flex gap-4">
                    <div>
                        <label className="block text-gray-700">開始</label>
                        <input
                            type="number"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            placeholder="1"
                            className="border p-2 rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">終了</label>
                        <input
                            type="number"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            placeholder="6"
                            className="border p-2 rounded w-full"
                        />
                    </div>
                </div>
            ) : null}
            <button
                onClick={handleSubmit}
                disabled={!type}
                className="bg-blue-500 text-white p-2 rounded w-full disabled:bg-gray-300"
            >
                ルーレットを回す！
            </button>
        </div>
    );
};

export default SetupScreen;