/** Town centres for the location picker. The 30 km check uses the pin the buyer confirms, not the postcode. */
export type Place = { name: string; province: string; lat: number; lng: number };

export const PLACES: Place[] = [
  { name: "Johannesburg", province: "Gauteng", lat: -26.2041, lng: 28.0473 },
  { name: "Sandton", province: "Gauteng", lat: -26.1076, lng: 28.0567 },
  { name: "Midrand", province: "Gauteng", lat: -25.989, lng: 28.127 },
  { name: "Pretoria", province: "Gauteng", lat: -25.7479, lng: 28.2293 },
  { name: "Centurion", province: "Gauteng", lat: -25.8601, lng: 28.1892 },
  { name: "Kempton Park", province: "Gauteng", lat: -26.1011, lng: 28.2306 },
  { name: "Edenvale", province: "Gauteng", lat: -26.1408, lng: 28.1522 },
  { name: "Germiston", province: "Gauteng", lat: -26.2259, lng: 28.1708 },
  { name: "Soweto", province: "Gauteng", lat: -26.2485, lng: 27.854 },
  { name: "Randburg", province: "Gauteng", lat: -26.0936, lng: 27.9917 },
  { name: "Roodepoort", province: "Gauteng", lat: -26.1625, lng: 27.8725 },
  { name: "Alberton", province: "Gauteng", lat: -26.2672, lng: 28.122 },
  { name: "Boksburg", province: "Gauteng", lat: -26.214, lng: 28.259 },
  { name: "Benoni", province: "Gauteng", lat: -26.1885, lng: 28.3207 },
  { name: "Krugersdorp", province: "Gauteng", lat: -26.0858, lng: 27.7751 },
  { name: "Vereeniging", province: "Gauteng", lat: -26.6731, lng: 27.9261 },
  { name: "Durban", province: "KwaZulu-Natal", lat: -29.8587, lng: 31.0218 },
  { name: "Pinetown", province: "KwaZulu-Natal", lat: -29.813, lng: 30.861 },
  { name: "Hillcrest", province: "KwaZulu-Natal", lat: -29.778, lng: 30.763 },
  { name: "Kloof", province: "KwaZulu-Natal", lat: -29.787, lng: 30.832 },
  { name: "Cato Ridge", province: "KwaZulu-Natal", lat: -29.742, lng: 30.601 },
  { name: "Pietermaritzburg", province: "KwaZulu-Natal", lat: -29.6006, lng: 30.3794 },
  { name: "Umhlanga", province: "KwaZulu-Natal", lat: -29.725, lng: 31.086 },
  { name: "Ballito", province: "KwaZulu-Natal", lat: -29.539, lng: 31.214 },
  { name: "Richards Bay", province: "KwaZulu-Natal", lat: -28.7807, lng: 32.0383 },
  { name: "Cape Town", province: "Western Cape", lat: -33.9249, lng: 18.4241 },
  { name: "Stellenbosch", province: "Western Cape", lat: -33.9321, lng: 18.8602 },
  { name: "Paarl", province: "Western Cape", lat: -33.7342, lng: 18.9621 },
  { name: "George", province: "Western Cape", lat: -33.9881, lng: 22.453 },
  { name: "Gqeberha", province: "Eastern Cape", lat: -33.9608, lng: 25.6022 },
  { name: "East London", province: "Eastern Cape", lat: -33.0153, lng: 27.9116 },
  { name: "Mthatha", province: "Eastern Cape", lat: -31.5889, lng: 28.7844 },
  { name: "Bloemfontein", province: "Free State", lat: -29.0852, lng: 26.1596 },
  { name: "Welkom", province: "Free State", lat: -27.977, lng: 26.735 },
  { name: "Polokwane", province: "Limpopo", lat: -23.9045, lng: 29.4689 },
  { name: "Mbombela", province: "Mpumalanga", lat: -25.4753, lng: 30.9694 },
  { name: "eMalahleni", province: "Mpumalanga", lat: -25.8738, lng: 29.221 },
  { name: "Rustenburg", province: "North West", lat: -25.6544, lng: 27.243 },
  { name: "Mahikeng", province: "North West", lat: -25.8652, lng: 25.6442 },
  { name: "Kimberley", province: "Northern Cape", lat: -28.7282, lng: 24.7499 },
  { name: "Upington", province: "Northern Cape", lat: -28.4478, lng: 21.2561 },
];

export function searchPlaces(query: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return PLACES.filter((place) => place.name.toLowerCase().includes(q) || place.province.toLowerCase().includes(q)).slice(0, 8);
}
