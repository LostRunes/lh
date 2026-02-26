export const SHAPE_TYPES = {
    SPREAD: 'SPREAD',
    I: 'I',
    HEART: 'HEART',
    U: 'U',
    HEHE: 'HEHE',
    PHOTO: 'PHOTO'
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
    const spacing = 3.5;
    const height = 3;
    const width = 1.8; // Slightly narrower for elegance

    const drawLetter = (letter, offsetX, pointsCount) => {
        for (let i = 0; i < pointsCount; i++) {
            let x, y, z;
            const t = Math.random();
            const section = Math.random();

            if (letter === 'h') {
                if (section < 0.5) { // Left Stem (Tall)
                    x = -width / 3;
                    y = (t - 0.5) * height;
                } else if (section < 0.8) { // Arch Shoulder
                    // Smooth curve from left stem to right leg
                    const ang = (1 - t) * Math.PI;
                    x = Math.cos(ang) * (width / 3);
                    y = Math.sin(ang) * (height / 4);
                } else { // Right Leg (Short)
                    x = width / 3;
                    y = (t * 0.5 - 0.5) * height;
                }
            } else if (letter === 'e') {
                if (section < 0.3) { // Middle Bar
                    x = (t - 0.5) * width / 2;
                    y = 0;
                } else { // Circle Curve
                    const ang = t * Math.PI * 1.7; // 1.7 for an open bottom
                    x = (Math.cos(ang) * width / 4);
                    y = (Math.sin(ang) * width / 4);
                }
            }

            z = (Math.random() - 0.5) * 0.5;
            points.push({ x: x + offsetX, y: y + 0.5, z });
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

export async function getPhotoPoints(count) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = '/photo.png';

        img.onload = () => {

            const size = 350;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = size;
            canvas.height = size;

            ctx.drawImage(img, 0, 0, size, size);

            const imageData = ctx.getImageData(0, 0, size, size);
            const data = imageData.data;

            const getBrightness = (x, y) => {
                const i = (y * size + x) * 4;
                return (data[i] + data[i + 1] + data[i + 2]) / 3;
            };

            const rawPoints = [];

            for (let y = 1; y < size - 1; y++) {
                for (let x = 1; x < size - 1; x++) {

                    const current = getBrightness(x, y);

                    const right = getBrightness(x + 1, y);
                    const bottom = getBrightness(x, y + 1);

                    const diff = Math.abs(current - right) + Math.abs(current - bottom);

                    // Edge threshold
                    if (diff > 40) {

                        rawPoints.push({
                            x: (x - size / 2) * 0.05,
                            y: -(y - size / 2) * 0.05,
                            z: (Math.random() - 0.5) * 0.8
                        });
                    }
                }
            }

            const sampled = [];

            for (let i = 0; i < count; i++) {
                sampled.push(
                    rawPoints[Math.floor(Math.random() * rawPoints.length)]
                );
            }

            resolve(sampled);
        };
    });
}
