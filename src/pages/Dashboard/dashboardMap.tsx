"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "@/api";

type Location = {
  name: string;
  lat: number;
  lng: number;
};

export interface Device {
  device_id: string;
  location: string;
  status: string;
}

export interface DevicesResponse {
  devices: Device[];
}

const locations: Location[] = [
  { name: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Bhopal (MP)", lat: 23.2599, lng: 77.4126 },
  { name: "Patna (Bihar)", lat: 25.5941, lng: 85.1376 },
  { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
];

const center: [number, number] = [22.5937, 78.9629];

const parseLatLng = (loc?: string): [number, number] | null => {
  if (!loc) return null;

  const parts = loc.split(",");
  if (parts.length !== 2) return null;

  const lat = Number(parts[0]);
  const lng = Number(parts[1]);

  if (!isFinite(lat) || !isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;

  return [lat, lng];
};

const inSegment = (
  device: [number, number],
  start: [number, number],
  end: [number, number],
) => {
  const [lat, lng] = device;

  const minLat = Math.min(start[0], end[0]);
  const maxLat = Math.max(start[0], end[0]);
  const minLng = Math.min(start[1], end[1]);
  const maxLng = Math.max(start[1], end[1]);

  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
};

export const DashboardMap = () => {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const run = async () => {
      const res = await api.get<DevicesResponse>("/device/all");
      setDevices(res.devices || []);
    };
    run();
  }, []);

  // valid device coords
  const deviceCoords = useMemo(() => {
    return devices
      .map((d) => {
        const coord = parseLatLng(d.location);
        if (!coord) return null;
        return { coord, status: d.status };
      })
      .filter(Boolean) as { coord: [number, number]; status: string }[];
  }, [devices]);

  // segments with stats
  const segments = useMemo(() => {
    const segs = [];

    for (let i = 0; i < locations.length - 1; i++) {
      const start: [number, number] = [locations[i].lat, locations[i].lng];
      const end: [number, number] = [
        locations[i + 1].lat,
        locations[i + 1].lng,
      ];

      const segDevices = deviceCoords.filter((d) =>
        inSegment(d.coord, start, end),
      );

      const active = segDevices.filter((d) => d.status === "active").length;
      const inactive = segDevices.length - active;

      segs.push({
        start,
        end,
        total: segDevices.length,
        active,
        inactive,
      });
    }

    return segs;
  }, [deviceCoords]);

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: 420, width: "100%", borderRadius: 16 }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* markers */}
      {locations.map((loc, i) => (
        <Marker key={i} position={[loc.lat, loc.lng]}>
          <Popup>{loc.name}</Popup>
        </Marker>
      ))}

      {/* segments with hover tooltip */}
      {segments.map((seg, i) => (
        <Polyline
          key={i}
          positions={[seg.start, seg.end]}
          pathOptions={{ dashArray: "8 8", weight: 3 }}
        >
          <Tooltip sticky>
            <div>
              <b>Total:</b> {seg.total} <br />
              <b>Active:</b> {seg.active} <br />
              <b>Inactive:</b> {seg.inactive}
            </div>
          </Tooltip>
        </Polyline>
      ))}
    </MapContainer>
  );
};
