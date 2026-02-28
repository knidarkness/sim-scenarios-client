export type ScenarioConditionModifier =
  | "Equals"
  | "Descending through"
  | "Increasing through"
  | null;

export interface ScenarioCondition {
  modifier: ScenarioConditionModifier;
  value: string | null;
}

export interface ScenarioConditionWithText extends ScenarioCondition {
  text: string | null;
}

export interface ScenarioConditions {
  altitude: ScenarioCondition;
  altitudeAgl: ScenarioCondition;
  speed: ScenarioCondition;
  landingGear: ScenarioCondition;
  flapPosition: ScenarioCondition;
  navAidDistance: ScenarioConditionWithText;
}

export interface ActiveScenarioItem {
  name: string;
  isActive: boolean;
  conditions: ScenarioConditions;
  delaySeconds?: number | null;
}

export interface ActiveScenarioData {
  _id: string;
  events: ActiveScenarioItem[];
  token: string;
  user: string;
  aircraft: string;
}

export type ConditionKey = keyof ScenarioConditions;

export const CONDITION_LABELS: Record<ConditionKey, string> = {
  altitude: "Altitude (MSL)",
  altitudeAgl: "Altitude (AGL)",
  speed: "Speed",
  landingGear: "Landing Gear",
  flapPosition: "Flap Position",
  navAidDistance: "NavAid Distance",
};
