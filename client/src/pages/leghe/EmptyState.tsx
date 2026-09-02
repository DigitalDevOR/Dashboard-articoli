// src/components/tournaments/EmptyState.tsx
type Props = {
  message: string;
};

export default function EmptyState({ message }: Props) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
