export const parametricFunctions = {
    sineWave: {
        apply: (t, { amplitude, frequency, phase, verticalShift }) =>
            amplitude * Math.sin(frequency * t + phase) + verticalShift,
        params: { amplitude: 1, frequency: 1, phase: 0, verticalShift: 0 },
    },
    cosineWave: {
        apply: (t, { amplitude, frequency, phase, verticalShift }) =>
            amplitude * Math.cos(frequency * t + phase) + verticalShift,
        params: { amplitude: 1, frequency: 1, phase: 0, verticalShift: 0 },
    },
    linear: {
        apply: (t, { slope, intercept }) => slope * t + intercept,
        params: { slope: 1, intercept: 0 },
    },
    quadratic: {
        apply: (t, { a, b, c }) => a * t * t + b * t + c,
        params: { a: 1, b: 0, c: 0 },
    },
    cubic: {
        apply: (t, { a, b, c, d }) => a * t * t * t + b * t * t + c * t + d,
        params: { a: 1, b: 0, c: 0, d: 0 },
    },
    bounce: {
        apply: (t, { height, frequency }) => {
            const adjusted = t * frequency;
            const integer = Math.floor(adjusted);
            const fraction = adjusted - integer;
            // Parabolic arc for each bounce segment
            return height * 4 * fraction * (1 - fraction);
        },
        params: { height: 1, frequency: 1 },
    },
    // Add more functions as needed
};