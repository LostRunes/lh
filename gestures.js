export function detectGesture(landmarks) {
    if (!landmarks || landmarks.length === 0) return 'NONE';

    // Landmarks for finger tips:
    // Thumb: 4, Index: 8, Middle: 12, Ring: 16, Pinky: 20
    // Landmarks for finger MCP (base):
    // Thumb: 2, Index: 5, Middle: 9, Ring: 13, Pinky: 17

    const isFingerExtended = (tipIdx, baseIdx) => {
        // Simple heuristic: tip is higher than base (y is smaller in MediaPipe)
        // Adjust for hand orientation? MediaPipe y is 0 at top, 1 at bottom.
        return landmarks[tipIdx].y < landmarks[baseIdx].y - 0.05;
    };

    const indexExtended = isFingerExtended(8, 5);
    const middleExtended = isFingerExtended(12, 9);
    const ringExtended = isFingerExtended(16, 13);
    const pinkyExtended = isFingerExtended(20, 17);
    const thumbExtended = landmarks[4].x < landmarks[3].x - 0.05 || landmarks[4].x > landmarks[3].x + 0.05; // horizontal for thumb

    // Gesture Rules:

    // 1. OPEN PALM (Spread)
    if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
        return 'SPREAD';
    }

    // 2. PEACE SIGN (U)
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
        return 'U';
    }

    // 3. INDEX ONLY (I)
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        return 'I';
    }

    // 4. HEHE (Index + Pinky)
    if (indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
        return 'HEHE';
    }

    // 5. CLOSED FIST (Heart) - Note: Thumb might be folded or not
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        return 'HEART';
    }

    return 'NONE';
}
