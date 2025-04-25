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
        apply: (t, { 
            amplitude1, frequency1, phase1, 
            amplitude2, frequency2, phase2,
            amplitude3, frequency3, phase3,
            amplitude4, frequency4, phase4,
            amplitude5, frequency5, phase5,
            amplitude6, frequency6, phase6,
            amplitude7, frequency7, phase7,
            amplitude8, frequency8, phase8,
            constant
        }) => {
            //fourier series
            const sine1 = amplitude1 * Math.sin(frequency1 * t + phase1);
            const sine2 = amplitude2 * Math.sin(frequency2 * t + phase2);
            const sine3 = amplitude3 * Math.sin(frequency3 * t + phase3);
            const sine4 = amplitude4 * Math.sin(frequency4 * t + phase4);
            const sine5 = amplitude5 * Math.sin(frequency5 * t + phase5);
            const sine6 = amplitude6 * Math.sin(frequency6 * t + phase6);
            const sine7 = amplitude7 * Math.sin(frequency7 * t + phase7);
            const sine8 = amplitude8 * Math.sin(frequency8 * t + phase8);
            
            return sine1 + sine2 + sine3 + sine4 + sine5 + sine6 + sine7 + sine8 + constant;
        },
        params: { 
            amplitude1: 1, frequency1: 1, phase1: 0, 
            amplitude2: 1, frequency2: 1, phase2: 0,
            amplitude3: 0, frequency3: 1, phase3: 0,
            amplitude4: 0, frequency4: 1, phase4: 0,
            amplitude5: 0, frequency5: 1, phase5: 0,
            amplitude6: 0, frequency6: 1, phase6: 0,
            amplitude7: 0, frequency7: 1, phase7: 0,
            amplitude8: 0, frequency8: 1, phase8: 0,
            constant: 0
        },
    },
    squareWave: {
        apply: (t, { amplitude, frequency, phase, verticalShift }) => {
            const period = 1 / (frequency * (Math.PI * 2));
            const halfPeriod = period / 2;
            const adjustedT = (t + phase) % period;
            return adjustedT < halfPeriod ? amplitude + verticalShift : -amplitude + verticalShift;
        },
        params: { amplitude: 1, frequency: 1, phase: 0, verticalShift: 0 },
    },
    sawtoothWave: {
        apply: (t, { amplitude, frequency, phase, verticalShift }) => {
            const period = 1 / (frequency * (Math.PI * 2));
            const adjustedT = (t + phase) % period;
            return ((2 * amplitude) / period) * adjustedT - amplitude + verticalShift;
        },
        params: { amplitude: 1, frequency: 1, phase: 0, verticalShift: 0 },
    },
    // Add more functions as needed
};