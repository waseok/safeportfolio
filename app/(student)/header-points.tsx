"use client";

import { PointsCountUp } from "@/components/points/points-count-up";

export function HeaderPoints({ value }: { value: number }) {
  return (
    <span className="text-sm font-black text-white">
      <PointsCountUp value={value} duration={600} /> P
    </span>
  );
}
