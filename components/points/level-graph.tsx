"use client";

type Props = {
  totalPoints: number;
  currentPoints: number;
  level: number;
  currentLevelPoints: number;
  nextLevelAt: number;
  pointsPerLevel: number;
};

export function LevelGraph({
  totalPoints,
  currentPoints,
  level,
  currentLevelPoints,
  nextLevelAt,
  pointsPerLevel,
}: Props) {
  const progress = (currentLevelPoints / pointsPerLevel) * 100;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-4">
        <p className="text-2xl font-bold text-amber-600">
          {totalPoints}
          <span className="ml-1 text-base font-normal text-amber-700">P</span>
        </p>
        <p className="text-amber-800">누적</p>
        <p className="text-slate-600">·</p>
        <p className="text-amber-800">
          사용 가능 <strong className="text-amber-900">{currentPoints} P</strong>
        </p>
      </div>
      <div>
        <p className="mb-1 flex justify-between text-sm text-amber-800">
          <span>레벨 {level}</span>
          <span>
            {currentLevelPoints} / {pointsPerLevel} P → 레벨 {level + 1}
          </span>
        </p>
        <div className="h-4 overflow-hidden rounded-full bg-amber-200">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-500"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
