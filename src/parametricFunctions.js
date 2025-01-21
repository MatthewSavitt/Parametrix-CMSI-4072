export const parametricFunctions = {
    sineWave: {
        apply: (t, { amplitude, frequency, phase, verticalShift }) =>
            amplitude * Math.sin(frequency * t + phase) + verticalShift,
        params: { amplitude: 1, frequency: 2 * Math.PI, phase: 0, verticalShift: 0 },
    },
    linear: {
        apply: (t, { slope, intercept }) => slope * t + intercept,
        params: { slope: 1, intercept: 0 },
    },
    // Add other functions here...
};
