import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const segments = [
  { label: '5% OFF', color: '#fca5a5', value: 5, weight: 30 },
  { label: '10% OFF', color: '#f87171', value: 10, weight: 25 },
  { label: '15% OFF', color: '#ef4444', value: 15, weight: 15 },
  { label: '20% OFF', color: '#dc2626', value: 20, weight: 10 },
  { label: '25% OFF', color: '#b91c1c', value: 25, weight: 3 },
  { label: '30% OFF', color: '#991b1b', value: 30, weight: 1 },
  { label: '0% OFF', color: '#4b5563', value: 0, weight: 8 },
];

const Discount = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<{ label: string, value: number } | null>(null);
  const navigate = useNavigate();

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setPrize(null);

    const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
    let randomNum = Math.random() * totalWeight;
    let winningIndex = 0;
    for (let i = 0; i < segments.length; i++) {
      if (randomNum < segments[i].weight) {
        winningIndex = i;
        break;
      }
      randomNum -= segments[i].weight;
    }

    const sliceAngle = 360 / segments.length;
    const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.7); // +/- 35% of slice
    
    // Calculate angle so that winning segment is at the top (0 degrees)
    const targetAngle = 360 - (winningIndex * sliceAngle + (sliceAngle / 2)) + randomOffset;
    
    const totalSpins = 5; 
    // We want the final rotation to be: current rotation (rounded to nearest 360) + totalSpins*360 + targetAngle
    const currentRot = rotation;
    const currentFullSpins = Math.floor(currentRot / 360) * 360;
    const newRotation = currentFullSpins + (360 * (totalSpins + 1)) + targetAngle;
    
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setPrize(segments[winningIndex]);
    }, 5000);
  };

  const sliceA = 360 / segments.length;
  const gradient = segments.map((s, i) => `${s.color} ${i * sliceA}deg ${(i + 1) * sliceA}deg`).join(', ');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F5] overflow-hidden p-4">
      {/* Hidden Nav just to go back if needed, but the page is private */}
      <div className="absolute top-6 left-6 cursor-pointer" onClick={() => navigate('/')}>
        <img src="/logo-black.png" alt="ShipOS Logo" className="h-8 w-auto opacity-50 hover:opacity-100 transition-opacity" />
      </div>

      <div className="text-center mb-10 z-10">
        <h1 className="text-5xl font-extrabold text-[#1A1A1A] mb-4 tracking-tight">Secret Spinner!</h1>
        <p className="text-gray-600 text-lg">Spin the wheel to get a special lifetime discount (up to 30% OFF).</p>
      </div>

      <div className="relative w-80 h-80 sm:w-96 sm:h-96 mb-12">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-black z-20 drop-shadow-xl"></div>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-white z-20"></div>

        {/* Wheel */}
        <div 
          className="w-full h-full rounded-full border-[10px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative transition-transform"
          style={{
             background: `conic-gradient(${gradient})`,
             transform: `rotate(${rotation}deg)`,
             transitionDuration: '5s',
             transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.15, 1)'
          }}
        >
          {/* Inner Circle / Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-inner z-10 border-4 border-gray-100"></div>
          
          {/* Labels */}
          {segments.map((s, i) => {
            return (
              <div 
                key={i}
                className="absolute top-0 left-1/2 w-10 h-1/2 origin-bottom -translate-x-1/2 flex items-start justify-center pt-6 drop-shadow-md z-0"
                style={{ transform: `rotate(${i * sliceA + (sliceA / 2)}deg)` }}
              >
                <span className="text-white font-extrabold text-xl" style={{ transform: 'rotate(-90deg) translateX(-15px) translateY(10px)' }}>
                  {s.value > 0 ? `${s.value}%` : (s.value === 0 ? '0%' : 'NOPE')}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col items-center min-h-[120px]">
        {!prize && (
          <Button 
            onClick={handleSpin} 
            disabled={isSpinning}
            className="px-12 h-14 bg-[#d75a34] hover:bg-[#c54e2a] text-white rounded-none font-bold text-xl tracking-wide transition-all duration-300 hover:scale-105 shadow-[0_6px_20px_rgba(215,90,52,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpinning ? 'Spinning...' : 'SPIN NOW'}
          </Button>
        )}

        {prize && prize.value > 0 && (
          <div className="text-center animate-in zoom-in fade-in duration-500">
            <div className="flex items-center justify-center gap-2 mb-2">
              <PartyPopper className="w-8 h-8 text-[#d75a34]" />
              <h2 className="text-3xl font-bold text-primary">You won {prize.label}!</h2>
              <PartyPopper className="w-8 h-8 text-[#d75a34]" />
            </div>
            <p className="text-gray-600 mb-4">Use code <span className="font-mono font-bold bg-black text-white px-2 py-1 rounded-none">SHIPOS{prize.value}</span> at checkout.</p>
            <Button onClick={() => navigate(`/claim-discount?amount=${prize.value}`)} className="px-8 bg-black text-white rounded-none hover:bg-gray-800">
              Claim & Sign Up
            </Button>
          </div>
        )}

        {prize && prize.value <= 0 && (
          <div className="text-center animate-in zoom-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Better luck next time!</h2>
            <p className="text-gray-600 mb-4">The spinner landed on <strong>{prize.label}</strong>.</p>
            <Button onClick={handleSpin} className="px-8 bg-[#d75a34] text-white rounded-none hover:bg-[#c54e2a]">
              Try Again
            </Button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Discount;
