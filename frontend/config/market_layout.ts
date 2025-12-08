
// Layout configuration for Bamenda Main Market Lines
// Coordinates are approximated based on the center point (5.9631, 10.1591)

export interface LineLayout {
    id: string;
    coordinates: [number, number][]; // Array of [lat, lng] points forming a polygon
    labelPosition: [number, number]; // [lat, lng] for the label center
    color: string;
}

const CENTER_LAT = 5.9631;
const CENTER_LNG = 10.1591;

const BLOCK_WIDTH = 0.00025;
const BLOCK_HEIGHT = 0.00015;
const GAP_X = 0.00005;
const GAP_Y = 0.00005;

// Helper to create a rectangle polygon
const createRect = (topLeftLat: number, topLeftLng: number, width: number, height: number): [number, number][] => {
    return [
        [topLeftLat, topLeftLng],
        [topLeftLat, topLeftLng + width],
        [topLeftLat - height, topLeftLng + width],
        [topLeftLat - height, topLeftLng]
    ];
};

const getCenter = (rect: [number, number][]): [number, number] => {
    const lat = (rect[0][0] + rect[2][0]) / 2;
    const lng = (rect[0][1] + rect[2][1]) / 2;
    return [lat, lng];
};

export const MARKET_LAYOUT: Record<string, LineLayout> = {};

// Left Group: 1 Column (LI - LV)
// Stacked vertically on the left side
const startY = CENTER_LAT + (BLOCK_HEIGHT * 2.5);
const leftGroupIds = ['LV', 'LIV', 'LIII', 'LII', 'LI'];

// Use a fixed X for the left column. 
// Right column is at CENTER_LNG + 0.0005
// Let's place Left column symmetrically at CENTER_LNG - 0.0005 - BLOCK_WIDTH
const leftGroupX = CENTER_LNG - 0.0005 - BLOCK_WIDTH;

leftGroupIds.forEach((id, index) => {
    const y = startY - (index * (BLOCK_HEIGHT + GAP_Y));
    const rect = createRect(y, leftGroupX, BLOCK_WIDTH, BLOCK_HEIGHT);

    MARKET_LAYOUT[id] = {
        id,
        coordinates: rect,
        labelPosition: getCenter(rect),
        color: '#60a5fa' // Tailwind blue-400
    };
});

// Right Group: 1 Column (L10 - L1)
// Separated by "Main Entrance" road
const rightGroupIds = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'];
const rightGroupX = CENTER_LNG + 0.0005; // Shift right

rightGroupIds.forEach((id, index) => {
    const y = startY - (index * (BLOCK_HEIGHT + GAP_Y)); // Align top with left group
    const rect = createRect(y, rightGroupX, BLOCK_WIDTH, BLOCK_HEIGHT);
    MARKET_LAYOUT[id] = {
        id,
        coordinates: rect,
        labelPosition: getCenter(rect),
        color: '#f472b6' // Pink-400 for variety
    };
});

// Main Entrance Coordinates (Approximate bottom center of the road/map area)
// Adjusted to be visually below the market lines
export const MAIN_ENTRANCE: [number, number] = [CENTER_LAT - 0.0020, CENTER_LNG];

// Define the main road network with junctions
// Central vertical road runs from entrance up through the market center
const CENTRAL_ROAD_LNG = CENTER_LNG;

// Key junctions in the market
export const JUNCTIONS = {
    ENTRANCE: MAIN_ENTRANCE,
    // Junction at bottom (near LI and L1)
    BOTTOM_CENTER: [CENTER_LAT - 0.0015, CENTRAL_ROAD_LNG] as [number, number],
    // Junction at middle (near LIII and L5)
    MIDDLE_CENTER: [CENTER_LAT, CENTRAL_ROAD_LNG] as [number, number],
    // Junction at top (near LV and L10)
    TOP_CENTER: [CENTER_LAT + 0.0015, CENTRAL_ROAD_LNG] as [number, number],
    // Left side access points
    LEFT_BOTTOM: [CENTER_LAT - 0.0015, leftGroupX + BLOCK_WIDTH] as [number, number],
    LEFT_MIDDLE: [CENTER_LAT, leftGroupX + BLOCK_WIDTH] as [number, number],
    LEFT_TOP: [CENTER_LAT + 0.0015, leftGroupX + BLOCK_WIDTH] as [number, number],
    // Right side access points
    RIGHT_BOTTOM: [CENTER_LAT - 0.0015, rightGroupX] as [number, number],
    RIGHT_MIDDLE: [CENTER_LAT, rightGroupX] as [number, number],
    RIGHT_TOP: [CENTER_LAT + 0.0015, rightGroupX] as [number, number],
};

// Helper function to calculate distance between two points (in meters, approximate)
export const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const lat1 = point1[0];
    const lng1 = point1[1];
    const lat2 = point2[0];
    const lng2 = point2[1];

    // Haversine formula for distance calculation
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

// Helper to get path from Entrance to Line Center using road network
export const getPathToLine = (lineId: string): [number, number][] => {
    const line = MARKET_LAYOUT[lineId];
    if (!line) return [];

    const destination = line.labelPosition;
    const path: [number, number][] = [MAIN_ENTRANCE];

    // Determine which side and approximate position
    const isLeftSide = ['LI', 'LII', 'LIII', 'LIV', 'LV'].includes(lineId);
    const lineY = destination[0];

    // Route through central road to appropriate junction, then to line
    if (lineY < CENTER_LAT - 0.001) {
        // Bottom section (LI, L1)
        path.push(JUNCTIONS.BOTTOM_CENTER);
        if (isLeftSide) {
            path.push(JUNCTIONS.LEFT_BOTTOM);
        } else {
            path.push(JUNCTIONS.RIGHT_BOTTOM);
        }
    } else if (lineY < CENTER_LAT + 0.001) {
        // Middle section (LII-LIII, L2-L5)
        path.push(JUNCTIONS.BOTTOM_CENTER);
        path.push(JUNCTIONS.MIDDLE_CENTER);
        if (isLeftSide) {
            path.push(JUNCTIONS.LEFT_MIDDLE);
        } else {
            path.push(JUNCTIONS.RIGHT_MIDDLE);
        }
    } else {
        // Top section (LIV-LV, L6-L10)
        path.push(JUNCTIONS.BOTTOM_CENTER);
        path.push(JUNCTIONS.MIDDLE_CENTER);
        path.push(JUNCTIONS.TOP_CENTER);
        if (isLeftSide) {
            path.push(JUNCTIONS.LEFT_TOP);
        } else {
            path.push(JUNCTIONS.RIGHT_TOP);
        }
    }

    // Final point: the destination line
    path.push(destination);

    return path;
};

// Get all main roads for visualization
export const getMainRoads = (): [number, number][][] => {
    return [
        // Central vertical road
        [JUNCTIONS.ENTRANCE, JUNCTIONS.BOTTOM_CENTER, JUNCTIONS.MIDDLE_CENTER, JUNCTIONS.TOP_CENTER],
        // Bottom horizontal roads
        [JUNCTIONS.LEFT_BOTTOM, JUNCTIONS.BOTTOM_CENTER, JUNCTIONS.RIGHT_BOTTOM],
        // Middle horizontal roads
        [JUNCTIONS.LEFT_MIDDLE, JUNCTIONS.MIDDLE_CENTER, JUNCTIONS.RIGHT_MIDDLE],
        // Top horizontal roads
        [JUNCTIONS.LEFT_TOP, JUNCTIONS.TOP_CENTER, JUNCTIONS.RIGHT_TOP],
    ];
};
