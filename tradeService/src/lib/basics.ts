import {isNumeric} from "./utils";

const boolValMap = {
    'null': false,
    'true': true,
    'false': false,
    'undefined': false,
    'yes': true,
    'no': false,
    '1': true,
    '0': false
};

export function envBoolVal(value): boolean {
    if (boolValMap.hasOwnProperty(value)) {
        return boolValMap[value];
    }

    return false;
}

export function envIntVal(value: string, defaultValue: number = 0): number {
    let v = parseInt(value) || defaultValue;

    return v;
}

export function envIntValMax(value: string, maxValue: number = null): number {
    let v = parseInt(value) || 0;
    if (maxValue != null) {
        if (v > maxValue) {
            return maxValue;
        }
    }

    return v;
}

export function envIntValMin(value: string, minValue: number = null): number {
    let v = parseInt(value) || 0;
    if (minValue != null) {
        if (v < minValue) {
            return minValue;
        }
    }

    return v;
}

export function deepFreeze(object) {
    if (!object) {
        return object
    }

    if (typeof object !== 'object') {
        return object;
    }

    // Retrieve the property names defined on object
    const propNames = Reflect.ownKeys(object);

    // Freeze properties before freezing self
    for (const name of propNames) {
        const value = object[name];

        if ((value && typeof value === "object") || typeof value === "function") {
            deepFreeze(value);
        }
    }

    return Object.freeze(object);
}

export function printConfigStatus(name: string, value: any, maxLength: number = 30, tag = 'Config:') {
    if (typeof value === 'boolean') {
        value = value ? 'ON' : 'OFF';
    }

    if (name.length < maxLength) {
        for (let i = name.length; i < maxLength; i++) {
            name += ".";
        }
    }

    console.log(`${tag} ${name}${value}`);
}

export function parseArgvOptions(argv: Array<string>): any {
    const len = argv.length;
    const result = {};
    const basicValueMap: Object = {
        'true': true,
        'false': false,
    }

    for (let i = 0; i < len; i++) {
        if (argv[i].substring(0, 2) === '--') {
            const t = argv[i].split('=');
            const key = t[0].replace(/^--/g, '');
            let v: any = t[1] ?? null;
            if (basicValueMap.hasOwnProperty(v)) {
                v = basicValueMap[v];
            } else if (v === null) {
                v = true;
            } else if (isNumeric(v)) {
                v = v - 0;
            }

            result[key] = v;
        }
    }

    return result;
}