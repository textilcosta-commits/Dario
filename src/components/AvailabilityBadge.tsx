import React from 'react';
import { AvailabilityStatus } from '../types';

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  meters?: number | null;
  className?: string;
  showMeters?: boolean;
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  status,
  meters,
  className = '',
  showMeters = false
}) => {
  switch (status) {
    case 'disponible':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${className}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>Disponible {showMeters && meters ? `(${meters} m)` : ''}</span>
        </span>
      );

    case 'poco_stock':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80 ${className}`}>
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span>Poco stock {showMeters && meters ? `(${meters} m)` : ''}</span>
        </span>
      );

    case 'agotado':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/80 ${className}`}>
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>Agotado</span>
        </span>
      );

    case 'dado_de_baja':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-300 ${className}`}>
          <span className="w-2 h-2 rounded-full bg-stone-500 shrink-0" />
          <span>Dado de baja</span>
        </span>
      );

    case 'consultar':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200 ${className}`}>
          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
          <span>Consultar disponibilidad</span>
        </span>
      );
  }
};
