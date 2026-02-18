export type AircraftEventsList = {
    aircraft: string;
    categories: EventCategory[];
}

export type EventCategory = {
    name: string;
    events: string[];
};

export const availableEvents = [
    {
        aircraft: "PMDG73X",
        categories: [
            {
                name: "Active",
                events: []
            },
            {
                name: "All Systems",
                events: []
            },
            {
                name: "APU",
                events: [
                    "APU Air",
                    "APU Severe"
                ]
            },
            {
                name: "Automatic Flight",
                events: [
                    "Autothrottle INOP",
                    "Flight Control Channel A INOP",
                    "Flight Control Channel B INOP",
                    "Autoflight System INOP"
                ]
            },
            {
                name: "Doors",
                events: [
                    "Air Stair Hatch",
                    "Door 1Left",
                    "Door 1Right",
                    "Door 2Left",
                    "Door 2Right",
                    "Forward Cargo Door",
                    "Aft Cargo Door"
                ]
            },
            {
                name: "Electrical",
                events: [
                    "Integrated Drive Generator 1",
                    "Integrated Drive Generator 2",
                    "IDG 1 Drive",
                    "IDG 2 Drive",
                    "APU Generator",
                    "Main Battery",
                    "Main Battery Charger",
                    "Aux Battery",
                    "Aux Battery Charger",
                    "Static Inverter",
                    "Transformer Rectifier 1",
                    "Transformer Rectifier 2",
                    "Transformer Rectifier 3",
                    "AC Transfer Bus 1",
                    "AC Transfer Bus 2",
                    "AC Main Bus 1",
                    "AC Main Bus 2",
                    "AC Galley Bus 1",
                    "AC Galley Bus 2",
                    "AC Standby Bus",
                    "AC Ground Service Bus 1",
                    "AC Ground Service Bus 2",
                    "DC Bus 1",
                    "DC Bus 2",
                    "DC Standby Bus",
                    "DC Ground Service Bus",
                    "DC Hot Battery Bus",
                    "DC Hot Battery Bus Switched",
                    "DC Battery Bus"
                ]
            },
            {
                name: "Engine",
                events: [
                    "Electronic Engine Computer 1",
                    "Electronic Engine Computer 2",
                    "Engine 1 Severe Damage",
                    "Engine 2 Severe Damage",
                    "Engine 1 Flame-Out",
                    "Engine 2 Flame-Out",
                    "Engine 1 EGT Exceedance",
                    "Engine 2 EGT Exceedance",
                    "Engine 1 Oil Leak",
                    "Engine 2 Oil Leak",
                    "Engine 1 Oil Pressure",
                    "Engine 2 Oil Pressure",
                    "Engine 1 Oil Temperature",
                    "Engine 2 Oil Temperature",
                    "Engine 1 Vibration",
                    "Engine 2 Vibration",
                    "Engine 1 V1-Cut",
                    "Engine 2 V1-Cut",
                    "Engine 1 Vr-Cut",
                    "Engine 2 Vr-Cut",
                    "Engine 1 V2-Cut",
                    "Engine 2 V2-Cut",
                    "Engine 1 Reverser",
                    "Engine 2 Reverser"
                ]
            },
            {
                name: "Fire",
                events: [
                    "Engine 1 Cowl Overheat",
                    "Engine 2 Cowl Overheat",
                    "Engine 1 Fire",
                    "Engine 2 Fire",
                    "APU Fire",
                    "Forward Cargo Fire",
                    "Aft Cargo Fire"
                ]
            },
            {
                name: "Fire Protection Systems",
                events: [
                    "Engine 1 Fire Loop A",
                    "Engine 2 Fire Loop A",
                    "Engine 1 Fire Loop B",
                    "Engine 2 Fire Loop B",
                    "APU Fire Detection System",
                    "Forward Cargo Fire Loop A",
                    "Aft Cargo Fire Loop A",
                    "Forward Cargo Fire Loop B",
                    "Aft Cargo Fire Loop B",
                    "Wheel Well Fire Detection Loop",
                    "Bottle 1 Squib Left",
                    "Bottle 1 Squib Right",
                    "Bottle 2 Squib Left",
                    "Bottle 2 Squib Right",
                    "APU Bottle Squib",
                    "Cargo Bottle Squib Forward",
                    "Cargo Bottle Squib Aft",
                    "Left Engine Fire Bottle Discharged",
                    "Right Engine Fire Bottle Discharged",
                    "APU Fire Bottle Discharged",
                    "Cargo Fire Bottle 1 Discharged",
                    "Cargo Fire Bottle 2 Discharged"
                ]
            },
            {
                name: "Flight Instruments",
                events: [
                    "Display Unit Left Outboard (Captain's PFD)",
                    "Display Unit Left Inboard (Captain's ND)",
                    "Display Unit Upper (Engine Display)",
                    "Display Unit Lower (Lower Center Display)",
                    "Display Unit Right Inboard (FO's ND)",
                    "Display Unit Right Outboard (FO's PFD)",
                    "DEU 1",
                    "DEU 2",
                    "Standby ADI",
                    "RMI"
                ]
            },
            {
                name: "Fuel",
                events: [
                    "Left Forward Fuel Pump",
                    "Left Aft Fuel Pump",
                    "Center Left Fuel Pump",
                    "Center Right Fuel Pump",
                    "Right Forward Fuel Pump",
                    "Right Aft Fuel Pump",
                    "Fuel Leak",
                    "Crossfeed Valve",
                    "APU Fuel Valve",
                    "Left Spar Valve",
                    "Right Spar Valve",
                    "Left Engine Valve",
                    "Right Engine Valve"
                ]
            },
            {
                name: "Hydraulics",
                events: [
                    "Engine Driven Pump (EDP) 1",
                    "Engine Driven Pump (EDP) 2",
                    "Electric Motor Driven Pump (EMDP) A",
                    "Electric Motor Driven Pump (EMDP) B",
                    "Standby Hydraulic Pump",
                    "Engine Driven Pump (EDP) 1 Leak",
                    "Engine Driven Pump (EDP) 2 Leak",
                    "Electric Motor Driven Pump (EMDP) A Leak",
                    "Electric Motor Driven Pump (EMDP) B Leak",
                    "Standby Hydraulic Leak",
                    "Electric Motor Driven Pump A Overheat",
                    "Electric Motor Driven Pump B Overheat",
                    "A SYS Quantity Refill Required",
                    "B SYS Quantity Refill Required",
                    "Standby System Quantity Refill Required"
                ]
            },
            {
                name: "Ice/Rain Protection",
                events: [
                    "Captain's Pitot Heat",
                    "Left Elevator Pitot Heat",
                    "Left Alpha Vane Heat",
                    "Temp Probe Heat",
                    "Left Wing Anti Ice Valve",
                    "Left Engine Anti Ice Valve",
                    "Left Side Window Heat",
                    "Left Front Window Heat",
                    "Left Side Window Overheat",
                    "Left Front Window Overheat",
                    "FO Pitot Heat",
                    "Right Elevator Pitot Heat",
                    "Right Alpha Vane Heat",
                    "Aux Pitot Heat",
                    "Right Wing Anti Ice Valve",
                    "Right Engine Anti Ice Valve",
                    "Right Side Window Heat",
                    "Right Front Window Heat",
                    "Right Side Window Overheat",
                    "Right Front Window Overheat"
                ]
            },
            {
                name: "Miscellaneous",
                events: [
                    "Transponder 1",
                    "Transponder 2",
                    "TCAS",
                    "Terrain Detection System",
                    "Weather Radar System",
                    "Weather Radar RT Left",
                    "Weather Radar RT Right",
                    "Windshear System",
                    "Integrated Standby Flight Display",
                    "Left Clock Fail",
                    "Right Clock Fail"
                ]
            },
            {
                name: "Navigation",
                events: [
                    "Flight Management Computer Left",
                    "Flight Management Computer Right",
                    "Inertial Reference System Left",
                    "Inertial Reference System Right",
                    "Inertial Reference System Display Unit",
                    "GPS Left",
                    "GPS Right",
                    "Computer Display Unit Left",
                    "Computer Display Unit Right",
                    "ILS Left",
                    "ILS Right",
                    "VOR Left",
                    "VOR Right",
                    "DME Left",
                    "DME Right",
                    "ADF Left",
                    "ADF Right",
                    "Radio Altimeter Left",
                    "Radio Altimeter Right"
                ]
            },
            {
                name: "Pneumatic",
                events: [
                    "Engine 1 Bleed Over Temp",
                    "Engine 2 Bleed Over Temp",
                    "Engine 1 Bleed Over Pressure",
                    "Engine 2 Bleed Over Pressure",
                    "APU Bleed Valve",
                    "Engine 1 Bleed PRSO Valve",
                    "Engine 2 Bleed PRSO Valve",
                    "Left Bleed Duct Leak",
                    "Right Bleed Duct Leak",
                    "Isolation Valve",
                    "Left 9th Stage Bleed Valve",
                    "Right 9th Stage Bleed Valve"
                ]
            },
            {
                name: "Pressurization",
                events: [
                    "Pressure Hull Integrity",
                    "Pax Oxygen Masks Deployed"
                ]
            },
            {
                name: "Wheels and Brakes",
                events: [
                    "Brake",
                    "Tire",
                    "Nose Tire Balance",
                    "Antiskid Alternate Valve",
                    "Antiskid Normal Valve",
                    "Brake System Control Unit",
                    "Brake Temperature System",
                    "Autobrake Control System"
                ]
            }
        ]
    }
];

