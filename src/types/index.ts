export interface EventWithVenue {
  id: string;
  title: string;
  artist: string | null;
  date: Date | string;
  doorsTime: Date | string | null;
  showTime: Date | string | null;
  ticketUrl: string | null;
  price: string | null;
  genre: string | null;
  imageUrl: string | null;
  description: string | null;
  source: string;
  isPopUp: boolean;
  venue: {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
    website: string | null;
  };
}

export interface VenueData {
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
  lat: number;
  lng: number;
  capacity?: number;
  website?: string;
  scrapeUrl?: string;
}

export type Genre =
  | "Rock"
  | "Hip-Hop"
  | "Blues"
  | "Country"
  | "R&B"
  | "Pop"
  | "Jazz"
  | "Folk"
  | "Electronic"
  | "Metal"
  | "Gospel"
  | "Soul"
  | "Indie"
  | "Comedy"
  | "Other";
