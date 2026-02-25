export const SHAPE_TYPES = {
    SPREAD: 'SPREAD',
    I: 'I',
    HEART: 'HEART',
    U: 'U',
    HEHE: 'HEHE'
};

export function getSpreadPoints(count, range = 10) {
    const points = [];
    for (let i = 0; i < count; i++) {
        points.push({
            x: (Math.random() - 0.5) * range * 2,
            y: (Math.random() - 0.5) * range * 2,
            z: (Math.random() - 0.5) * range * 2
        });
    }
    return points;
}

export function getIPoints(count) {
    const points = [];
    const height = 6;
    const width = 1.5;

    for (let i = 0; i < count; i++) {
        const section = Math.random();
        let x, y, z;

        if (section < 0.2) { // Top bar
            x = (Math.random() - 0.5) * width;
            y = height / 2;
        } else if (section < 0.4) { // Bottom bar
            x = (Math.random() - 0.5) * width;
            y = -height / 2;
        } else { // Center column
            x = (Math.random() - 0.5) * 0.4;
            y = (Math.random() - 0.5) * height;
        }

        z = (Math.random() - 0.5) * 0.5;
        points.push({ x, y, z });
    }
    return points;
}

export function getHeartPoints(count) {
    const points = [];
    for (let i = 0; i < count; i++) {
        // Parametric equations for heart shape
        const t = Math.random() * Math.PI * 2;
        const r = Math.random(); // Inner density

        // x = 16 sin^3(t)
        // y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)

        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

        // Scale down and add some depth/noise
        const scale = 0.2 * r;
        x *= scale;
        y *= scale;
        const z = (Math.random() - 0.5) * 1.5;

        points.push({ x, y: y + 1, z }); // Offset y slightly
    }
    return points;
}

export function getUPoints(count) {
    const points = [];
    const width = 3;
    const height = 4;

    for (let i = 0; i < count; i++) {
        const section = Math.random();
        let x, y, z;

        if (section < 0.3) { // Left vertical
            x = -width / 2;
            y = (Math.random() * height) - (height / 4);
        } else if (section < 0.6) { // Right vertical
            x = width / 2;
            y = (Math.random() * height) - (height / 4);
        } else { // Bottom curve
            const t = Math.PI + (Math.random() * Math.PI);
            x = (Math.cos(t) * width / 2);
            y = (Math.sin(t) * height / 2) - height / 4;
        }

        // Add some thickness
        x += (Math.random() - 0.5) * 0.5;
        y += (Math.random() - 0.5) * 0.5;
        z = (Math.random() - 0.5) * 0.5;

        points.push({ x, y: y + 1, z });
    }
    return points;
}

export function getHehePoints(count) {
    const points = [];
    const spacing = 4;
    const height = 3;
    const width = 1.5;

    const drawLetter = (letter, offsetX, pointsCount) => {
        for (let i = 0; i < pointsCount; i++) {
            let x, y, z;
            const t = Math.random();
            const section = Math.random();

            if (letter === 'h') {
                if (section < 0.4) { // left stem
                    x = 0; y = t * height - height / 2;
                } else if (section < 0.7) { // bump
                    const ang = t * Math.PI;
                    x = Math.sin(ang) * (width / 2);
                    y = Math.cos(ang) * (height / 4) - height / 4;
                } else { // right stem (short)
                    x = width / 2; y = t * (height / 2) - height / 2;
                }
            } else if (letter === 'e') {
                const ang = t * Math.PI * 1.5 - Math.PI * 0.25;
                if (section < 0.7) { // curve
                    x = Math.cos(ang) * (width / 2);
                    y = Math.sin(ang) * (height / 2);
                } else { // middle bar
                    x = (t - 0.5) * width; y = 0;
                }
            }

            z = (Math.random() - 0.5) * 0.5;
            points.push({ x: x + offsetX, y: y + 1, z });
        }
    };

    const countPerLetter = Math.floor(count / 4);
    drawLetter('h', -spacing * 1.5, countPerLetter);
    drawLetter('e', -spacing * 0.5, countPerLetter);
    drawLetter('h', spacing * 0.5, countPerLetter);
    drawLetter('e', spacing * 1.5, countPerLetter);

    while (points.length < count) {
        points.push({ ...points[Math.floor(Math.random() * points.length)] });
    }

    return points;
}
