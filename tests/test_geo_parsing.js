function parseGeoCoords(rawLat, rawLon) {
  let lat = parseFloat(String(rawLat || '').replace(/[^\d.-]/g, ''));
  let lon = parseFloat(String(rawLon || '').replace(/[^\d.-]/g, ''));
  if (String(rawLat || '').toUpperCase().includes('S')) lat = -Math.abs(lat);
  if (String(rawLon || '').toUpperCase().includes('W')) lon = -Math.abs(lon);
  return { lat, lon, isValid: !isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0) };
}

console.log('Test numeric:', parseGeoCoords(41.8902, 12.4922));
console.log('Test string with S/W:', parseGeoCoords("33.8688 S", "151.2093 E"));
console.log('Test plain string:', parseGeoCoords("35.6762", "139.6503"));
