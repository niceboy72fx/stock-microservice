interface FormatRegex {
    re: string,
    get?: (value: string) => void
}
const noFormat = {
    re: null
}
const FORMAT_REGEX: {[key:string]: FormatRegex} = {
    Y: {
        re: '\\d{4}',
        get(value) {
            return parseInt(value);
        }
    },
    y: noFormat,
    m: {
        re: '\\d{1,2}',
        get(value) {
            return parseInt(value) - 1
        }
    },
    d: {
        re: '\\d{1,2}',
        get(value) {
            return parseInt(value);
        }
    },
    j: noFormat,
    H:  {
        re: '\\d{1,2}',
        get(value) {
            return parseInt(value);
        }
    },
    i: {
        re: '\\d{1,2}',
        get(value) {
            return parseInt(value)
        }
    },
    s:  {
        re: '\\d{1,2}',
        get(value) {
            return parseInt(value);
        }
    },
}
const FORMATS = {
    Y(date: Date) {
        return date.getFullYear();
    },
    y(date: Date) {
        return date.getFullYear().toString().substring(2, 4);
    },
    m(date: Date) {
        return pad10(date.getMonth() + 1)
    },
    n(date: Date) {
        return date.getMonth() + 1;
    },
    d(date: Date) {
        return pad10(date.getDate())
    },
    j(date: Date) {
        return date.getDate();
    },
    H(date: Date){
        return pad10(date.getHours());
    },
    i(date: Date) {
        return pad10(date.getMinutes())
    },
    s(date: Date) {
        return pad10(date.getSeconds())
    },
    t(date: Date) {
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return lastDayOfMonth.getDate();
    }
}


export default class DateTime {
    private readonly _date: Date;

    constructor(date: string | Date = null) {
        if (date instanceof Date) {
            this._date = date;
        } else if (typeof date === 'string') {
            this._date = new Date(Date.parse(date));
        } else {
            this._date = new Date();
        }
    }

    static from(input: string | Date | DateTime): DateTime {
        if (input instanceof Date) {
            return new DateTime(input);
        }

        if (input instanceof DateTime) {
            const d = new Date(input.getTime());
            return DateTime.from(d);
        }

        const d = Date.parse(input);
        return new DateTime(new Date(d));
    }

    static now(): DateTime {
        return new DateTime();
    }

    static travelDays(value: number): DateTime {
        return DateTime.travel(value, 'days');
    }

    static travelSeconds(value: number): DateTime {
        return DateTime.travel(value, 'seconds');
    }

    static validate(input: string, format: string) {
        const d = DateTime.createFromFormat(format, input);
        if (d === null) {
            return false;
        }
        return d.format(format) === input;
    }

    /**
     * @param format
     * @param rawInput
     */
    static createFromFormat(format: string, rawInput: string): DateTime {
        const len = format.length;
        let regExStr = '^';
        const setFunctions = [];

        for (let i = 0; i < len; i++) {
            const c = format.charAt(i);
            if (FORMAT_REGEX[c]) {
                const formatRe = FORMAT_REGEX[c];
                if (  formatRe.re == null) {
                    throw new Error(`Format ${c} is not supported`)
                }

                regExStr += '(' + formatRe.re + ')';
                setFunctions.push({
                    char: c,
                    get: formatRe.get
                });
            } else {
                regExStr += c;
            }
        }
        regExStr += '$';
        const re = new RegExp(regExStr);


        const match = rawInput.match(re)


        if (match) {
            const valueMap: any = {
                Y: null,
                m: null,
                d: null,
            };
            setFunctions.forEach((fn, index) => {
                valueMap[fn.char] = fn.get(match[index + 1])
            });

            const d = new Date(valueMap.Y, valueMap.m, valueMap.d);
            if (d instanceof Date) {
                return new DateTime(d);
            }
        }

        return null;
    }


    private static travel(value: number, unit: 'seconds' | 'days' = 'seconds'): DateTime {
        let dz;
        if (unit === 'days') {
            dz = new Date(Date.now() + value * 1000 * 86400);
        } else  {
            dz = new Date(Date.now() + value * 1000);
        }

        return new DateTime(dz);
    }


    static today(): string {
        const s =  (new DateTime()).toString();
        return s.split(' ')[0];
    }

    static yesterday(): string {
        const s =  (new DateTime()).addDays(-1).toString();
        return s.split(' ')[0];
    }

    format(format: string): string {
        const len = format.length;
        let output = '';
        for (let i = 0; i < len; i++) {
            const c = format.charAt(i);
            if (FORMATS[c]) {
                output += FORMATS[c](this._date);
            } else {
                output += c;
            }
        }

        return output;
    }

    startOfDay(): DateTime {
        return DateTime.from(this.toDateString() + ' 00:00:00');
    }

    endOfDay(): DateTime {
        return DateTime.from(this.toDateString() + ' 23:59:59');
    }

    endOfWeek():DateTime {
        const day = this._date.getDay();
        const deltaMap = {
            0: 0, // Sun
            6: 1, // Sat
            5: 2, // Fri
            4: 3, // Thu
            3: 4, // Web
            2: 5, // Tue
            1: 6, // Mon
        }

        let last = this._date.getDate() + deltaMap[day];

        const cloneDate = new Date(this._date.getTime());
        cloneDate.setDate(last)

        return new DateTime(cloneDate)
    }

    startOfWeek(): DateTime {
        // First day is monday
        const day = this._date.getDay();
        const deltaMap = {
            0: -6, // Sun
            6: -5, // Sat
            5: -4, // Fri
            4: -3, // Thu
            3: -2, // Web
            2: -1, // Tue
            1: 0, // Mon
        }
        let first = this._date.getDate() + deltaMap[day];

        const cloneDate = new Date(this._date.getTime());
        cloneDate.setDate(first)

        return new DateTime(cloneDate)
    }

    startOfMonth(): DateTime {
        const clone = new Date(this._date.getTime());
        clone.setDate(1);
        return new DateTime(clone);
    }

    startOfYear(): DateTime {
        const clone = new Date(this._date.getFullYear(), 0, 1);
        return new DateTime(clone)
    }

    endOfYear(): DateTime {
        const clone = new Date(this._date.getFullYear(), 11, 31);

        return new DateTime(clone)
    }

    endOfMonth(): DateTime {
        /**
         const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
         return lastDayOfMonth.getDate();
         */
        const clone = new Date(this._date.getFullYear(), this._date.getMonth() + 1, 0);
        return new DateTime(clone);
    }

    year() {
        return this._date.getFullYear();
    }

    month() {
        return this._date.getMonth();
    }

    date() {
        return this._date.getDate();
    }

    hours() {
        return this._date.getHours();
    }

    minutes() {
        return this._date.getMinutes();
    }

    seconds() {
        return this._date.getSeconds();
    }

    getTime() {
        return this._date.getTime();
    }

    addSeconds(value: number): DateTime {
        const d1 = new Date(this._date.getTime() + value * 1000);
        return new DateTime(d1);
    }

    addDays(value: number): DateTime {
        const d1 = new Date(this._date.getTime() + value * 1000 * 86400);
        return new DateTime(d1);
    }

    clone(): DateTime {
        return new DateTime(new Date(this._date.getTime()))
    }

    dayBetween(target: DateTime): number {
        // Math.round((second - first) / (1000 * 60 * 60 * 24));
        return Math.round(Math.abs(this.getTime() - target.getTime()) / 86400000);
    }

    toDateString() {
        const {_date} = this;
        const year = _date.getFullYear().toString();
        const month = pad10(_date.getMonth() + 1);
        const date = pad10(_date.getDate());
        return [year, month, date].join('-');
    }

    toTimeString(): string {
        const {_date} = this;
        const hour = pad10(_date.getHours());
        const minute = pad10(_date.getMinutes())
        const seconds = pad10(_date.getSeconds());
        return [hour, minute, seconds].join(':');
    }

    toString() {
        const {_date} = this;
        const year = _date.getFullYear().toString();
        const month = pad10(_date.getMonth() + 1);
        const date = pad10(_date.getDate());
        const hour = pad10(_date.getHours());
        const minute = pad10(_date.getMinutes())
        const seconds = pad10(_date.getSeconds());
        return [year, month, date].join('-') + ' ' + [hour, minute, seconds].join(':')
    }
}

function pad10(value: number): string {
    if (value < 10) {
        return '0' + value.toString();
    }

    return value.toString();
}