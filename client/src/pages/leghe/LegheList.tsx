// src/components/tournaments/TorneiList.tsx
import { Tournament } from '@/lib/types';
import LegaCard from './LegaCard';

type Props = {
  tournaments: Tournament[];
};

//controllare sturuutura singolo torneo

export default function LegheList({ tournaments }: Props) {
  return (
    <div className="grid gap-3">
      {tournaments.map((t) => (
        <LegaCard key={t._id || t.id} tournament={t} />
      ))}
    </div>
  );
}
