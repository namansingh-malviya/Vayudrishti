// Inverse Distance Weighting (IDW) spatial interpolation

export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface PointWithValue {
  lat: number;
  lng: number;
  value: number;
}

export function interpolateIDW(
  targetLat: number,
  targetLng: number,
  points: PointWithValue[],
  power: number = 2.0
): number {
  if (points.length === 0) return 180; // default baseline

  let sumWeights = 0;
  let sumWeightedValues = 0;

  for (const pt of points) {
    const dist = haversineDistanceKm(targetLat, targetLng, pt.lat, pt.lng);
    if (dist < 0.05) {
      // Direct match
      return pt.value;
    }
    const weight = 1 / Math.pow(dist, power);
    sumWeights += weight;
    sumWeightedValues += weight * pt.value;
  }

  if (sumWeights === 0) return points[0].value;
  return sumWeightedValues / sumWeights;
}
