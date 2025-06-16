export interface TStop {
  address: string;
  distanceFromStart: number | string;
  lat: number;
  lng: number;
  actualDistanceAdded: number;
}

export interface TRouteData {
  totalDistanceMiles: string;
  totalDuration: string;
  stops: TStop[];
  googleMapsUrl: string;
}
