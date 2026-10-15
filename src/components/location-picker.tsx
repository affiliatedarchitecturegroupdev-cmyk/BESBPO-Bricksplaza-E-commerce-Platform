import { useMemo, useState, type MouseEvent } from "react";
import { searchPlaces, type Place } from "@/data/places";
import { EXPRESS_RADIUS_KM, nearestSuppliers, type Pin, type SupplierPin } from "@/lib/express";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SPAN_KM = 45;

export function LocationPicker({
  pin,
  suppliers,
  onChange,
  compact,
}: {
  pin: (Pin & { label: string }) | null;
  suppliers: SupplierPin[];
  onChange: (pin: Pin & { label: string }) => void;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [geoError, setGeoError] = useState("");
  const matches = useMemo(() => searchPlaces(query), [query]);
  const center = pin ?? { lat: -26.0, lng: 28.1 };
  const nearby = pin ? nearestSuppliers(pin, suppliers).slice(0, 5) : [];

  function fromClick(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const kmLng = (x - 0.5) * 2 * SPAN_KM;
    const kmLat = (0.5 - y) * 2 * SPAN_KM;
    const lat = center.lat + kmLat / 110.574;
    const lng = center.lng + kmLng / (111.32 * Math.cos((center.lat * Math.PI) / 180));
    onChange({ lat, lng, label: "Dropped pin" });
  }

  function locate() {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("This browser has no location service.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "Your location" }),
      () => setGeoError("Location was blocked. Search a town or drop a pin."),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a town"
          aria-label="Search a town"
        />
        <Button type="button" variant="outline" onClick={locate}>
          Use my location
        </Button>
      </div>
      {geoError && <p className="text-sm text-clay">{geoError}</p>}
      {matches.length > 0 && (
        <ul className="overflow-hidden rounded-lg border border-line bg-paper">
          {matches.map((place) => (
            <li key={`${place.name}-${place.province}`}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-card"
                onClick={() => {
                  choose(place);
                  setQuery("");
                }}
              >
                <span>{place.name}</span>
                <span className="text-muted">{place.province}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div
        className={`relative aspect-square cursor-crosshair overflow-hidden rounded-xl border border-line bg-[#e7efe4] ${compact ? "w-full max-w-sm" : "w-full"}`}
        onClick={fromClick}
        role="application"
        aria-label="Map. Click to set the delivery pin. The ring is 30 km."
      >
        <span className="pointer-events-none absolute left-1/2 top-1/2 size-[66%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-clay/50 bg-clay/10" />
        <span className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-paper/90 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-mortar">
          {EXPRESS_RADIUS_KM} km ring
        </span>
        {suppliers.map((supplier) => {
          const point = project(supplier, center);
          if (!point) return null;
          return (
            <span
              key={supplier.id}
              className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-kiln ring-2 ring-paper"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              title={supplier.name}
            />
          );
        })}
        {pin && (
          <span className="pointer-events-none absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-clay ring-2 ring-paper" />
        )}
      </div>
      <p className="text-xs text-muted">
        {pin
          ? `${pin.label} · ${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}. Click the map to move the pin.`
          : "Search a town, use your location, or click the map. Black dots are supplier pins."}
      </p>
      {nearby.length > 0 && (
        <ul className="space-y-1 text-sm">
          {nearby.map((supplier) => (
            <li key={supplier.id} className="flex justify-between gap-3">
              <span>
                {supplier.name}
                <span className="text-muted"> · {supplier.city}</span>
              </span>
              <span className={supplier.km <= EXPRESS_RADIUS_KM ? "text-ok" : "text-muted"}>
                {supplier.km.toFixed(1)} km{supplier.km <= EXPRESS_RADIUS_KM ? " · in range" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  function choose(place: Place) {
    onChange({ lat: place.lat, lng: place.lng, label: `${place.name}, ${place.province}` });
  }
}

function project(point: Pin, center: Pin) {
  const kmLat = (point.lat - center.lat) * 110.574;
  const kmLng = (point.lng - center.lng) * 111.32 * Math.cos((center.lat * Math.PI) / 180);
  const x = 50 + (kmLng / SPAN_KM) * 50;
  const y = 50 - (kmLat / SPAN_KM) * 50;
  if (x < 2 || x > 98 || y < 2 || y > 98) return null;
  return { x, y };
}
