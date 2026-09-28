// Shared room and window dimensions used across the room, trim, foundation,
// corner-shadow, window and camera-control modules so every piece of the
// building agrees on the same measurements.

export const roomWidth = 14;
export const roomDepth = 12;
export const roomHeight = 6.5;

// The front wall (with the window) sits 0.12 inside the nominal depth, so the
// floor, ceiling and side walls must stop there instead of poking through it.
export const frontWallInset = 0.12;
export const interiorDepth = roomDepth - frontWallInset;
export const interiorCenterZ = -frontWallInset / 2;

export const frameW = 2.8;
export const frameH = 2.8;

export const windowCenterX = 0;
export const windowCenterY = 3.2;

export const frontZ = roomDepth / 2 - 0.12;

export const windowLeft = windowCenterX - frameW / 2;
export const windowRight = windowCenterX + frameW / 2;
export const windowBottom = windowCenterY - frameH / 2;
export const windowTop = windowCenterY + frameH / 2;

export const frontSideWidth = roomWidth / 2 - frameW / 2;

export const backZ = -roomDepth / 2;
