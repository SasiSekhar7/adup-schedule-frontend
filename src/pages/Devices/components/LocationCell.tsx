import { useEffect, useState } from "react";


async function getAddressFromCoordinates(lat, lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.display_name || "Unknown Location";
    } catch (error) {
      console.error("Error fetching location:", error);
      return "Unknown Location";
    }
  }

  
const LocationCell = ({ cords }) => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchLocation = async () => {
        const [lat, lon] = cords.split(",").map(Number);
        const result = await getAddressFromCoordinates(lat, lon);
        setLocation(result);
        setLoading(false);
      };
  
      fetchLocation();
    }, [cords]);
  
    return <div>{loading ? "Loading..." : location}</div>;
  };

  export default LocationCell;