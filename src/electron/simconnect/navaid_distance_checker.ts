import { ScenarioConditionModifier } from "../../types";

type Position = { lat: number; lon: number; alt: number };

export class NavAidDistanceChecker {
  evaluate(
    modifier: ScenarioConditionModifier,
    value: string,
    navAidPosition: Position,
    currentPosition: Position | null,
    previousPosition: Position | null,
  ): boolean {
    if (!currentPosition || !previousPosition) {
      return false;
    }

    const requiredDistance = parseFloat(value);
    if (isNaN(requiredDistance)) {
      return false;
    }

    const currentDistance = this.calculateDistance(navAidPosition, currentPosition);
    const previousDistance = this.calculateDistance(navAidPosition, previousPosition);

    if (!previousDistance || !currentDistance) {
      return false;
    }

    const increasedThrough =
      previousDistance <= requiredDistance && currentDistance >= requiredDistance;
    const descendedThrough =
      previousDistance >= requiredDistance && currentDistance <= requiredDistance;

    console.log(
      `NavAid Distance Condition - Current: ${currentDistance} nm, Previous: ${previousDistance} nm, Required: ${requiredDistance} nm, IncreasedThrough: ${increasedThrough}, DescendedThrough: ${descendedThrough}`,
    );

    switch (modifier) {
      case "Equals":
        return increasedThrough || descendedThrough;
      case "Increasing through":
        return increasedThrough;
      case "Descending through":
        return descendedThrough;
    }

    return false;
  }

  private calculateDistance(pos1: Position, pos2: Position): number {
    const R = 3440.065; // Earth's radius in nautical miles
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(pos2.lat - pos1.lat);
    const dLon = toRad(pos2.lon - pos1.lon);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(pos1.lat)) *
        Math.cos(toRad(pos2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const surfaceDistanceNm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const FEET_PER_NM = 6076.115;
    const altDiffNm = (pos2.alt - pos1.alt) / FEET_PER_NM;

    return Math.sqrt(surfaceDistanceNm * surfaceDistanceNm + altDiffNm * altDiffNm);
  }
}
