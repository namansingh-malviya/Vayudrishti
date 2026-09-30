export function formatRemainingTime(dueAt: string): { text: string; isUrgent: boolean; isExpired: boolean } {
  const due = new Date(dueAt).getTime();
  const now = Date.now();
  const diff = due - now;

  if (diff <= 0) {
    const expiredHours = Math.abs(Math.floor(diff / (3600 * 1000)));
    return {
      text: `Overdue by ${expiredHours}h`,
      isUrgent: true,
      isExpired: true
    };
  }

  const hours = Math.floor(diff / (3600 * 1000));
  const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));

  return {
    text: `${hours}h ${minutes}m remaining`,
    isUrgent: hours < 4,
    isExpired: false
  };
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}

export function formatSourceLabel(source: string): string {
  const map: Record<string, string> = {
    waste_burning: 'Open Waste Burning',
    industrial: 'Industrial Stack Plume',
    stubble: 'Agricultural Crop Residue',
    vehicular_corridor: 'Heavy Freight Corridor',
    construction_dust: 'Uncovered Construction Dust',
    garbage_burning: 'Open Garbage Burning',
    industrial_plume: 'Industrial Exhaust',
    road_dust: 'Road Dust Suspension',
    construction: 'Demolition & Excavation Dust',
    biomass: 'Biomass Burning'
  };
  return map[source] || source;
}
