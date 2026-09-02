import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Prediction, PredictionStats } from '@/lib/types';
import Header from '@/components/layout/Header';
import { generateSuccessRate, formatDate } from '@/lib/utils';

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activePeriod, setActivePeriod] = useState('all-time');

  // Fetch user predictions
  const { data: predictions, isLoading } = useQuery<Prediction[]>({
    queryKey: ['/api/predictions/me'],
  });

  // Calculate stats from predictions
  const calculateStats = (): PredictionStats => {
    if (!predictions || predictions.length === 0) {
      return { successRate: '0%', totalBets: 0, profitLoss: 0 };
    }
    
    const correct = predictions.filter(p => p.isCorrect).length;
    const total = predictions.length;
    const successRate = generateSuccessRate(correct, total);
    
    // Calculate profit/loss (sum of points)
    const profitLoss = predictions.reduce((acc, p) => acc + (p.points || 0), 0);
    
    return {
      successRate,
      totalBets: total,
      profitLoss
    };
  };
  
  const stats = calculateStats();

  return (
    <div className="page-container bg-neutral-50">
      <Header 
        showBackButton={true} 
        title="Storico Previsioni"
        backDestination="/profile"
      />
      
      <div className="p-4">
        <div className="flex overflow-x-auto pb-2 mb-4">
          <button 
            className={`badge-pill mr-2 whitespace-nowrap ${activeFilter === 'all' ? 'active' : 'inactive'}`}
            onClick={() => setActiveFilter('all')}
          >
            Tutti i tornei
          </button>
          <button 
            className={`badge-pill mr-2 whitespace-nowrap ${activeFilter === 'premier' ? 'active' : 'inactive'}`}
            onClick={() => setActiveFilter('premier')}
          >
            Premier League
          </button>
          <button 
            className={`badge-pill mr-2 whitespace-nowrap ${activeFilter === 'liga' ? 'active' : 'inactive'}`}
            onClick={() => setActiveFilter('liga')}
          >
            La Liga
          </button>
        </div>
        
        <div className="flex overflow-x-auto pb-2 mb-4">
          <button 
            className={`badge-pill mr-2 whitespace-nowrap ${activePeriod === 'all-time' ? 'active' : 'inactive'}`}
            onClick={() => setActivePeriod('all-time')}
          >
            All Time
          </button>
          <button 
            className={`badge-pill mr-2 whitespace-nowrap ${activePeriod === 'last-week' ? 'active' : 'inactive'}`}
            onClick={() => setActivePeriod('last-week')}
          >
            Last Week
          </button>
          <button 
            className={`badge-pill mr-2 whitespace-nowrap ${activePeriod === 'last-month' ? 'active' : 'inactive'}`}
            onClick={() => setActivePeriod('last-month')}
          >
            Last Month
          </button>
          <button 
            className={`badge-pill mr-2 whitespace-nowrap ${activePeriod === 'last-year' ? 'active' : 'inactive'}`}
            onClick={() => setActivePeriod('last-year')}
          >
            Last Year
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex justify-between text-sm text-center">
            <div>
              <div className="text-xl font-bold text-primary">{stats.successRate}</div>
              <div className="text-xs text-gray-500">Success rate</div>
            </div>
            <div>
              <div className="text-xl font-bold text-primary">{stats.totalBets}</div>
              <div className="text-xs text-gray-500">Total bets</div>
            </div>
            <div>
              <div className={`text-xl font-bold ${stats.profitLoss >= 0 ? 'text-accent' : 'text-destructive'}`}>
                {stats.profitLoss >= 0 ? `+${stats.profitLoss}` : stats.profitLoss}
              </div>
              <div className="text-xs text-gray-500">Profit/Loss</div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg h-24"></div>
            ))}
          </div>
        ) : predictions && predictions.length > 0 ? (
          predictions.map((prediction) => (
            <div key={prediction.id} className="bg-white rounded-lg shadow-sm p-4 mb-3">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>
                  {formatDate(new Date(prediction.createdAt))} • {prediction.match?.league || 'Unknown League'}
                </span>
                <span className={`font-medium ${prediction.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                  {prediction.isCorrect ? 'CORRECT!' : 'SBAGLIATO'}
                </span>
              </div>
              <div className="font-medium mb-1">
                {prediction.match?.homeTeam || 'Home Team'} vs {prediction.match?.awayTeam || 'Away Team'}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-700">
                  Il tuo Pronostico: <span className="font-semibold">
                    {prediction.prediction === 'home' ? 'Home Win' : 
                     prediction.prediction === 'draw' ? 'Draw' : 'Away Win'}
                  </span>
                </div>
                <div className="text-xs font-semibold text-gray-700">
                  Risultato: {prediction.match?.result || 'N/A'}
                </div>
              </div>
              <div className={`mt-2 text-xs font-medium ${prediction.points && prediction.points >= 0 ? 'text-accent' : 'text-red-500'}`}>
                Punti {prediction.points && prediction.points >= 0 ? 'guadagnati' : 'persi'}: 
                {prediction.points && prediction.points >= 0 ? `+${prediction.points}` : prediction.points}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            Non hai ancora fatto previsioni
          </div>
        )}
      </div>
    </div>
  );
}
