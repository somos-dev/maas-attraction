export const getCategoryIcon = (category: string) => {
  switch (category) {
    case "current": return "crosshairs-gps";
    case "station": return "train";
    case "airport": return "airplane";
    case "recent": return "clock-outline";
    case "favorite": return "star";
    default: return "map-marker";
  }
};
