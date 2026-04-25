import cafe from "@/assets/detour-cafe.jpg";
import bookstore from "@/assets/detour-bookstore.jpg";
import park from "@/assets/detour-park.jpg";
import market from "@/assets/detour-market.jpg";

export const STARTER_DETOURS = [
  {
    id: "slow-cafe",
    title: "Slow morning in Kendall",
    duration: "75 min",
    stamp: "Quiet AM",
    image: cafe,
    stops: ["Bourbon Coffee", "Galaxy plaza bench", "MIT bookstore"],
    tone: "stamp-blue",
  },
  {
    id: "river-loop",
    title: "Charles River side-loop",
    duration: "60 min",
    stamp: "On Foot",
    image: park,
    stops: ["Longfellow bridge", "Memorial Drive", "Cambridge boat dock"],
    tone: "stamp-green",
  },
  {
    id: "bookstore-detour",
    title: "Bookstore + a long lunch",
    duration: "90 min",
    stamp: "Slow Read",
    image: bookstore,
    stops: ["Harvard Book Store", "Felipe's rooftop", "Brattle alley"],
    tone: "stamp-red",
  },
  {
    id: "market-bites",
    title: "Market bites in Central",
    duration: "55 min",
    stamp: "Tasty",
    image: market,
    stops: ["H-Mart aisle 4", "Mamaleh's window", "Central library steps"],
    tone: "jewel-amber",
  },
];
