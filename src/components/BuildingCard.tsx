import React from 'react';

interface Building {
  id: string;
  name: string;
  address: string;
  rtuCount: number;
}

interface BuildingCardProps {
  building: Building;
}

export default function BuildingCard({ building }: BuildingCardProps) {
  return (
    <div className="mb-3 p-3 border rounded-xl shadow hover:shadow-md transition-shadow">
      <p className="font-bold text-lg">{building.name}</p>
      <p className="text-gray-600">{building.address}</p>
      <p className="mt-1">RTUs Detected: <strong>{building.rtuCount}</strong></p>
    </div>
  );
}
