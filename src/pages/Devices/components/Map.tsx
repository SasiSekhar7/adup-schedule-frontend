import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import { LatLngLiteral } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

// Fix Leaflet marker icon issue
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import LocationCell from "./LocationCell";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const SearchControl = ({
  onSearch,
}: {
  onSearch: (pos: LatLngLiteral) => void;
}) => {
  const map = useMap();
  const controlRef = useRef<any>(null);

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider,
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: false,
    });

    map.addControl(searchControl);
    controlRef.current = searchControl;

    map.on("geosearch/showlocation", (result: any) => {
      const { x: lng, y: lat } = result.location;
      onSearch({ lat, lng });
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onSearch]);

  return null;
};

const Map = ({
  onLocationSelect,
}: {
  onLocationSelect: (pos: LatLngLiteral) => void;
}) => {
  const [position, setPosition] = useState<LatLngLiteral>({
    lat: 20.5937,
    lng: 78.9629,
  });

  const handlePositionChange = (pos: LatLngLiteral) => {
    setPosition(pos);
    onLocationSelect(pos);
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        handlePositionChange(e.latlng);
      },
    });

    return <Marker position={position} />;
  };

  return (
    <div>
      <MapContainer
        center={position}
        zoom={5}
        style={{ height: "400px", width: "100%", marginTop: "1rem" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <SearchControl onSearch={handlePositionChange} />
        <LocationMarker />
      </MapContainer>

      <div style={{ marginTop: "10px", fontFamily: "monospace" }}>
        <strong>Location:</strong>
        <br />
        <LocationCell cords={position.lat + "," + position.lng} />
      </div>
    </div>
  );
};

export default Map;
