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
        apply: (t, { height, frequency, floor, phase }) => {
            t += phase;
            const adjusted = t * ((frequency) / (Math.PI*2));
            const integer = Math.floor(adjusted);
            const fraction = adjusted - integer;
            // Parabolic arc for each bounce segment
            return height * 4 * fraction * (1 - fraction) + floor;
        },
        params: { height: 1, frequency: 1, floor: 0, phase: 0 },
    },
    fourierSeries: {
        apply: (t, { amplitude1, frequency1, phase1, amplitude2, frequency2, phase2 }) => {
            //fourier series
            const sine1 = amplitude1 * Math.sin(frequency1 * t + phase1);
            const sine2 = amplitude2 * Math.sin(frequency2 * t + phase2);
            return sine1 + sine2;

        },
        params: { amplitude1: 1, frequency1: 1, phase1: 0, amplitude2: 1, frequency2: 1, phase2: 0 },
    },
    squareWave: {
        apply: (t, { amplitude, frequency, phase, verticalShift }) => {
            const period = 1 / frequency;
            const halfPeriod = period / 2;
            const adjustedT = (t + phase) % period;
            return adjustedT < halfPeriod ? amplitude + verticalShift : -amplitude + verticalShift;
        },
        params: { amplitude: 1, frequency: 1, phase: 0, verticalShift: 0 },
    },
    sawtoothWave: {
        apply: (t, { amplitude, frequency, phase, verticalShift }) => {
            const period = 1 / frequency;
            const adjustedT = (t + phase) % period;
            return ((2 * amplitude) / period) * adjustedT - amplitude + verticalShift;
        },
        params: { amplitude: 1, frequency: 1, phase: 0, verticalShift: 0 },
    },
    // Add more functions as needed
};