// Cross-city single-stop recommendations.
// Curated mock data for now — each pick is tied to a Boston place via
// `inspiredByPlaceId` so we can later swap in a live recommender.

export type CrossCityCategory =
  | "café"
  | "bookstore"
  | "park"
  | "bar"
  | "museum"
  | "restaurant"
  | "shop"
  | "venue";

export interface CrossCityPick {
  id: string;
  city: string;
  country: string;
  name: string;
  category: CrossCityCategory;
  blurb: string;
  neighborhood: string;
  inspiredByPlaceId: string;
  inspiredByName: string;
}

export const CROSS_CITY_PICKS: CrossCityPick[] = [
  // ─── Paris ─────────────────────────────────────────────────────────────────
  { id: "cc_telescope", city: "Paris", country: "France", name: "Telescope Café", category: "café", neighborhood: "Palais-Royal", blurb: "Tiny counter near the Palais-Royal. Tight espresso, no laptops, big regulars energy.", inspiredByPlaceId: "p_voltage", inspiredByName: "Voltage Coffee" },
  { id: "cc_shakespeare", city: "Paris", country: "France", name: "Shakespeare and Company", category: "bookstore", neighborhood: "Latin Quarter", blurb: "English-language warren on the Seine. Sleep upstairs if you read enough.", inspiredByPlaceId: "p_trident", inspiredByName: "Trident Booksellers" },
  { id: "cc_tuileries", city: "Paris", country: "France", name: "Jardin des Tuileries", category: "park", neighborhood: "1er", blurb: "The original urban garden. Iron chairs, gravel paths, a fountain to nap by.", inspiredByPlaceId: "p_charles_path", inspiredByName: "Charles River Path" },
  { id: "cc_picasso", city: "Paris", country: "France", name: "Musée Picasso", category: "museum", neighborhood: "Marais", blurb: "Hôtel Salé townhouse, the painter's personal collection, way less crowded than the Louvre.", inspiredByPlaceId: "p_mfa", inspiredByName: "Museum of Fine Arts" },
  { id: "cc_septime", city: "Paris", country: "France", name: "Clamato", category: "restaurant", neighborhood: "11e", blurb: "Septime's no-reservations seafood sister. Sit at the bar, order everything raw.", inspiredByPlaceId: "p_modern_pastry", inspiredByName: "Modern Pastry" },
  { id: "cc_perchoir", city: "Paris", country: "France", name: "Le Perchoir", category: "bar", neighborhood: "Ménilmontant", blurb: "Rooftop above the 11e with the best skyline view in town.", inspiredByPlaceId: "p_trillium", inspiredByName: "Trillium Fort Point" },

  // ─── New York ──────────────────────────────────────────────────────────────
  { id: "cc_strand", city: "New York", country: "USA", name: "The Strand", category: "bookstore", neighborhood: "East Village", blurb: "18 miles of books on Broadway. The rare-book room upstairs is the move.", inspiredByPlaceId: "p_mit_press", inspiredByName: "MIT Press Bookstore" },
  { id: "cc_devocion", city: "New York", country: "USA", name: "Devoción", category: "café", neighborhood: "Williamsburg", blurb: "Colombian beans, skylight, the prettiest pour in the city.", inspiredByPlaceId: "p_tatte_harvard", inspiredByName: "Tatte — Harvard" },
  { id: "cc_prospect", city: "New York", country: "USA", name: "Prospect Park", category: "park", neighborhood: "Brooklyn", blurb: "Olmsted's quieter masterpiece. Long Meadow on a Sunday is the city at peace.", inspiredByPlaceId: "p_charles_path", inspiredByName: "Charles River Path" },
  { id: "cc_met", city: "New York", country: "USA", name: "The Met", category: "museum", neighborhood: "Upper East Side", blurb: "Pay what you wish if you live here. Skip the crowds; head for the Astor Court.", inspiredByPlaceId: "p_mfa", inspiredByName: "Museum of Fine Arts" },
  { id: "cc_lilia", city: "New York", country: "USA", name: "Lilia", category: "restaurant", neighborhood: "Williamsburg", blurb: "Missy Robbins's pasta temple. Sit at the bar at 5pm sharp.", inspiredByPlaceId: "p_modern_pastry", inspiredByName: "Modern Pastry" },
  { id: "cc_attaboy", city: "New York", country: "USA", name: "Attaboy", category: "bar", neighborhood: "Lower East Side", blurb: "No menu — tell them what you like. Knock on the unmarked door at 134 Eldridge.", inspiredByPlaceId: "p_trillium", inspiredByName: "Trillium Fort Point" },
  { id: "cc_mcnally", city: "New York", country: "USA", name: "McNally Jackson", category: "bookstore", neighborhood: "Nolita", blurb: "Tightest curation downtown. The magazine wall alone is worth the trip.", inspiredByPlaceId: "p_trident", inspiredByName: "Trident Booksellers" },

  // ─── Tokyo ─────────────────────────────────────────────────────────────────
  { id: "cc_blue_bottle", city: "Tokyo", country: "Japan", name: "Blue Bottle Aoyama", category: "café", neighborhood: "Aoyama", blurb: "Concrete and timber slow-bar. Quietest cortado you'll have all week.", inspiredByPlaceId: "p_voltage", inspiredByName: "Voltage Coffee" },
  { id: "cc_ueno", city: "Tokyo", country: "Japan", name: "Ueno Park", category: "park", neighborhood: "Ueno", blurb: "Cherry blossoms in spring, museums all year, vendors that know you're new.", inspiredByPlaceId: "p_charles_path", inspiredByName: "Charles River Path" },
  { id: "cc_daikanyama", city: "Tokyo", country: "Japan", name: "Tsutaya Daikanyama", category: "bookstore", neighborhood: "Daikanyama", blurb: "Three pavilions of books, vinyl, and stationery. Stay until close.", inspiredByPlaceId: "p_mit_press", inspiredByName: "MIT Press Bookstore" },
  { id: "cc_teamlab", city: "Tokyo", country: "Japan", name: "teamLab Borderless", category: "museum", neighborhood: "Azabudai", blurb: "Walk-through digital art — go on a weekday morning to actually see it.", inspiredByPlaceId: "p_mfa", inspiredByName: "Museum of Fine Arts" },
  { id: "cc_sushi_dai", city: "Tokyo", country: "Japan", name: "Sushi Dai", category: "restaurant", neighborhood: "Toyosu", blurb: "Worth the 5am queue. The omakase is the city's most honest meal.", inspiredByPlaceId: "p_modern_pastry", inspiredByName: "Modern Pastry" },
  { id: "cc_bar_high_five", city: "Tokyo", country: "Japan", name: "Bar High Five", category: "bar", neighborhood: "Ginza", blurb: "Hidetsugu Ueno's basement temple. No menu — describe a mood, get a perfect drink.", inspiredByPlaceId: "p_trillium", inspiredByName: "Trillium Fort Point" },

  // ─── Lisbon ────────────────────────────────────────────────────────────────
  { id: "cc_lx_factory", city: "Lisbon", country: "Portugal", name: "LX Factory", category: "shop", neighborhood: "Alcântara", blurb: "Old printing complex turned shops, bakeries, and that bookstore with the painted ceiling.", inspiredByPlaceId: "p_modern_pastry", inspiredByName: "Modern Pastry" },
  { id: "cc_copenhagen_lisbon", city: "Lisbon", country: "Portugal", name: "Copenhagen Coffee Lab", category: "café", neighborhood: "Príncipe Real", blurb: "Nordic-precise filter, sun-soaked windows, neighborhood feels.", inspiredByPlaceId: "p_voltage", inspiredByName: "Voltage Coffee" },
  { id: "cc_estrela", city: "Lisbon", country: "Portugal", name: "Jardim da Estrela", category: "park", neighborhood: "Estrela", blurb: "Slow Sunday park. Bandstand, ducks, espresso kiosk in the middle.", inspiredByPlaceId: "p_charles_path", inspiredByName: "Charles River Path" },
  { id: "cc_belem", city: "Lisbon", country: "Portugal", name: "Pastéis de Belém", category: "restaurant", neighborhood: "Belém", blurb: "Original 1837 pastel de nata. Yes the line moves fast. Yes it's worth it.", inspiredByPlaceId: "p_modern_pastry", inspiredByName: "Modern Pastry" },
  { id: "cc_a_ginjinha", city: "Lisbon", country: "Portugal", name: "A Ginjinha", category: "bar", neighborhood: "Rossio", blurb: "Standing-room cherry liqueur shop. €1.50 a shot, stained glass, perfect.", inspiredByPlaceId: "p_trillium", inspiredByName: "Trillium Fort Point" },

  // ─── San Francisco ─────────────────────────────────────────────────────────
  { id: "cc_tartine", city: "San Francisco", country: "USA", name: "Tartine Manufactory", category: "café", neighborhood: "Mission", blurb: "Mission corner spot. Morning bun, country bread, sun on the long bench.", inspiredByPlaceId: "p_tatte_harvard", inspiredByName: "Tatte — Harvard" },
  { id: "cc_city_lights", city: "San Francisco", country: "USA", name: "City Lights", category: "bookstore", neighborhood: "North Beach", blurb: "Beat-poet HQ since 1953. Climb to the poetry room upstairs.", inspiredByPlaceId: "p_trident", inspiredByName: "Trident Booksellers" },
  { id: "cc_dolores", city: "San Francisco", country: "USA", name: "Dolores Park", category: "park", neighborhood: "Mission", blurb: "Saturday hill, palm trees, the whole city laid out. Bring snacks.", inspiredByPlaceId: "p_charles_path", inspiredByName: "Charles River Path" },
  { id: "cc_sfmoma", city: "San Francisco", country: "USA", name: "SFMOMA", category: "museum", neighborhood: "SoMa", blurb: "Snøhetta extension is a building in itself. Free under 18.", inspiredByPlaceId: "p_mfa", inspiredByName: "Museum of Fine Arts" },
  { id: "cc_zuni", city: "San Francisco", country: "USA", name: "Zuni Café", category: "restaurant", neighborhood: "Hayes Valley", blurb: "Roast chicken for two. Order it the moment you sit down.", inspiredByPlaceId: "p_modern_pastry", inspiredByName: "Modern Pastry" },
  { id: "cc_bar_agricole", city: "San Francisco", country: "USA", name: "True Laurel", category: "bar", neighborhood: "Mission", blurb: "Lazy Bear's cocktail spinoff. The Cali Spritz alone justifies the trip.", inspiredByPlaceId: "p_trillium", inspiredByName: "Trillium Fort Point" },

  // ─── London ────────────────────────────────────────────────────────────────
  { id: "cc_monmouth", city: "London", country: "UK", name: "Monmouth Coffee", category: "café", neighborhood: "Borough", blurb: "Borough Market's coffee bar. Stand outside with a flat white and a pastry.", inspiredByPlaceId: "p_voltage", inspiredByName: "Voltage Coffee" },
  { id: "cc_daunt", city: "London", country: "UK", name: "Daunt Books Marylebone", category: "bookstore", neighborhood: "Marylebone", blurb: "Edwardian galleried hall, books shelved by country. Travel section is the best in Europe.", inspiredByPlaceId: "p_trident", inspiredByName: "Trident Booksellers" },
  { id: "cc_hampstead", city: "London", country: "UK", name: "Hampstead Heath", category: "park", neighborhood: "Hampstead", blurb: "Mixed bathing ponds, Parliament Hill view, the city's wildest green.", inspiredByPlaceId: "p_charles_path", inspiredByName: "Charles River Path" },
  { id: "cc_tate", city: "London", country: "UK", name: "Tate Modern", category: "museum", neighborhood: "Bankside", blurb: "Free. Turbine Hall installations are the reason to keep coming back.", inspiredByPlaceId: "p_mfa", inspiredByName: "Museum of Fine Arts" },
  { id: "cc_st_john", city: "London", country: "UK", name: "St. John", category: "restaurant", neighborhood: "Smithfield", blurb: "Fergus Henderson's nose-to-tail original. Bone marrow, parsley salad, done.", inspiredByPlaceId: "p_modern_pastry", inspiredByName: "Modern Pastry" },

  // ─── Berlin ────────────────────────────────────────────────────────────────
  { id: "cc_bonanza", city: "Berlin", country: "Germany", name: "Bonanza Coffee", category: "café", neighborhood: "Kreuzberg", blurb: "Roastery and bar on Oderberger. The pioneer of Berlin third-wave.", inspiredByPlaceId: "p_voltage", inspiredByName: "Voltage Coffee" },
  { id: "cc_do_you_read_me", city: "Berlin", country: "Germany", name: "do you read me?!", category: "bookstore", neighborhood: "Mitte", blurb: "Indie magazine and design-book shop. The art-zine wall is a deep hole.", inspiredByPlaceId: "p_trident", inspiredByName: "Trident Booksellers" },
  { id: "cc_tempelhof", city: "Berlin", country: "Germany", name: "Tempelhofer Feld", category: "park", neighborhood: "Tempelhof", blurb: "Decommissioned airport runways turned the city's strangest, biggest park.", inspiredByPlaceId: "p_charles_path", inspiredByName: "Charles River Path" },
  { id: "cc_neues", city: "Berlin", country: "Germany", name: "Neues Museum", category: "museum", neighborhood: "Museum Island", blurb: "Chipperfield's restoration is half the show. Nefertiti is the other half.", inspiredByPlaceId: "p_mfa", inspiredByName: "Museum of Fine Arts" },
];

export const CROSS_CITY_LIST = Array.from(
  new Set(CROSS_CITY_PICKS.map((p) => p.city)),
);

export const CROSS_CITY_CATEGORIES: CrossCityCategory[] = [
  "café",
  "bookstore",
  "restaurant",
  "bar",
  "museum",
  "park",
  "shop",
  "venue",
];

export function picksFor(city: string, category: CrossCityCategory | "all"): CrossCityPick[] {
  return CROSS_CITY_PICKS.filter(
    (p) => p.city === city && (category === "all" || p.category === category),
  );
}
