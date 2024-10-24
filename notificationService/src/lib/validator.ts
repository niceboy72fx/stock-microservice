import {clone, hasOwnProperty, isStringNullOrWhiteSpace, strFormat} from "./utils";
import DateTime from "./core/DateTime";

interface VArg {
    name: string,
    value: any
}

export interface VResult {
    ok: boolean,
    errors: any
}

export enum ConvertDataType {
    int = 'int',
    bigint = 'bigint',
    bool = 'bool',
    string = 'string'
}

export enum RULE {
    REQUIRED = 'validateRequired',
    NOT_EMPTY = 'validateNotEmpty',
    UUID = 'validateUUID',
    TYPE_OF_STRING = 'validateTypeOfString',
    TYPE_OF_NUMBER = 'validateTypeOfNumber',
    TYPE_OF_OBJECT = 'validateTypeOfObject',
    TYPE_OF_ARRAY = 'validateTypeOfArray',
    MIN = 'validateMinValue',
    MAX = 'validateMaxValue',
    IN_RANGE = 'validateInRange',
    IN_LIST = 'validateInList',
    REGEX = 'validateRegex',
    NOT_REGEX = 'validateNotRegex',
    INTEGER = 'validateInteger',
    EMAIL = 'validateEmail',
    MIN_LENGTH = 'validateMinLength',
    MAX_LENGTH = 'validateMaxLength',
    EQUALS = 'validateEquals',
    UNIQUE = 'validateUnique',
    DATE_FORMAT = 'validateDateFormat'
}

// Copy code từ python nên để tạm convention snake
const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
export const ValidatorMethods = {
    validateInList(value, list) {
        if (!Array.isArray(list)) {
            return false;
        }

        return list.indexOf(value) > - 1;
    },
    validateDateFormat(value:string, format: string) {
        return DateTime.validate(value, format);
    },
    validateUUID(value) {
        if (typeof value !== 'string') {
            return false;
        }

        return uuidRegex.test(value);
    },
    validateTypeOfNumber(value) {
        return typeof value === 'number';
    },
    validateTypeOfObject(value) {
        return typeof value === 'object';
    },
    validateTypeOfArray(value) {
        return Array.isArray(value);
    },
    validateTypeOfString(value) {
        return typeof value === 'string';
    },
    validateMinValue(value, minValue) {
        return value >= minValue
    },
    validateMinLength(value, minLength) {
        if (typeof value !== 'string') {
            return false;
        }

        return value.length >= minLength
    },
    validateMaxLength(value, maxLength) {
        if (typeof value !== 'string') {
            return false;
        }

        return value.length <= maxLength
    },
    validateMaxValue(value, maxValue) {
        return value <= maxValue
    },
    validateInRange(value, minValue, maxValue) {
        return value >= minValue && value <= maxValue
    },
    validateRequired(value) {
        if (value === null || value === undefined) {
            return false;
        }

        return true;
    },
    validateNotEmpty(value) {
        if (value == null) {
            return false;
        }

        return !isStringNullOrWhiteSpace(value);
    },
    validateRegex(value, regex) {
        if (regex instanceof RegExp) {
            return regex.test(value)
        }
        return false
    },
    validateNotRegex(value, regex) {
        if (regex instanceof RegExp) {
            return !regex.test(value)
        }
        return true;
    },
    validateEmail(value) {
        if (typeof value !== 'string') {
            return false
        }

        const t = value.split('@')
        if (t.length !== 2) {
            return false
        }

        return /^[\w.]+$/.test(t[0]) && /^[\w.]+$/.test(t[1])
    },
    validateEquals(value, valueEquals) {
        return value === valueEquals
    },
}

export const DataConvertMethods = {
    int(value: any) {
        return parseInt(value) || 0;
    },
    bigint(value: any) {
        return BigInt(value);
    },
    bool(value: any) {
        return !!value;
    },
    string(value: any) {
        if (value == null) {
            return '';
        }

        if (typeof value !== 'string') {
            return value.toString();
        }

        return value;
    }
}

export class ValidateRule {
    rule: RULE
    message: string
    args: Array<any>

    constructor(rule: RULE, message: string, args: Array<VArg> = []) {
        this.rule = rule;
        this.message = message;
        this.args = args;
    }

    async validateAsync (value, field: string) {
        try {
            const [
                validateMethod,
                params,
                argsToFormat
            ] = this.getValidateMethod(value, field);

            let validateRes = await validateMethod(...params);

            return [
                validateRes,
                strFormat(this.message, argsToFormat)
            ]
        } catch (err) {

            console.error(err);
            return [
                false,
                err.message,
            ]
        }

    }

    getValidateMethod(value, field: string) {
        const validateMethod = ValidatorMethods[this.rule]
        const args: any = {};
        args.value = value;
        const params = [value]
        this.args.forEach((arg: VArg) => {
            args[arg.name] = arg.value == null ? null : arg.value.toString();
            params.push(arg.value);
        })

        const argsToFormat = clone(args)
        argsToFormat.field = field;
        return [
            validateMethod,
            params,
            argsToFormat
        ]
    }

    validate(value, field: string) {
        try {
            const [
                validateMethod,
                params,
                argsToFormat
            ] = this.getValidateMethod(value, field);

            let validateRes = validateMethod(...params);
            return [
                validateRes,
                strFormat(this.message, argsToFormat)
            ]
        } catch (err) {


            return [
                false,
                err.message,
            ]
        }
    }
}

export class ValidateField {
    name: string
    convertTo: ConvertDataType;
    required_rule: ValidateRule | null
    rules: Array<ValidateRule>

    constructor(name: string) {
        this.name = name
        this.required_rule = null
        this.rules = []
    }

    convertToInt() {
        this.convertTo = ConvertDataType.int;
        return this;
    }

    convertToBool() {
        this.convertTo = ConvertDataType.bool;
        return this;
    }

    convertToString() {
        this.convertTo = ConvertDataType.string;
        return this;
    }


    convertToBigInt() {
        this.convertTo = ConvertDataType.bigint;
        return this;
    }

    required(message: string = '{field} is required') {
        this.required_rule = new ValidateRule(RULE.REQUIRED, message)
        return this
    }

    equals(valueEquals: string, message: string = '{field} is not equals {valueEquals}') {
        this.required_rule = new ValidateRule(RULE.EQUALS, message, [
            {
                name: 'valueEquals',
                value: valueEquals
            }
        ])
        return this
    }

    minLength(minLength, message: string = 'Minimum length of {field} is {minLength}') {
        this.rules.push(new ValidateRule(RULE.MIN_LENGTH, message, [{
            name: 'minLength',
            value: minLength
        }]));
        return this;
    }

    maxLength(maxLength, message: string = 'Maximum length of {field} is {maxLength}') {
        this.rules.push(new ValidateRule(RULE.MAX_LENGTH, message, [{
            name: 'maxLength',
            value: maxLength
        }]));
        return this;
    }


    minValue(minValue, message: string = 'Minimum value of {field} is {minValue}') {
        this.rules.push(new ValidateRule(RULE.MIN, message, [{
            name: 'minValue',
            value: minValue
        }]));
        return this;
    }
    maxValue(maxValue, message: string = 'Maximum value of {field} is {maxValue}') {
        this.rules.push(new ValidateRule(RULE.MAX, message, [{
            name: 'maxValue',
            value: maxValue
        }]));
        return this;
    }

    inRange(minValue, maxValue, message: string = '{field} value must in range {minValue} {maxValue}') {
        this.rules.push(new ValidateRule(RULE.IN_RANGE, message, [
            { name: 'minValue', value: minValue },
            { name: 'maxValue', value: maxValue },
        ]));
        return this;
    }

    inList(list, message: string = '{field} value is not in list {list}') {
        this.rules.push(new ValidateRule(RULE.IN_LIST, message, [
            { name: 'list', value: list },
        ]));
        return this;
    }

    regex(pattern: RegExp, message: string = '{field} value must match {pattern}') {
        this.rules.push(new ValidateRule(RULE.REGEX, message, [{
            name: 'pattern',
            value: pattern
        }]));

        return this;
    }

    notRegex(pattern: RegExp, message: string = '{field} value must match {pattern}') {
        this.rules.push(new ValidateRule(RULE.NOT_REGEX, message, [{
            name: 'pattern',
            value: pattern
        }]));

        return this;
    }

    notEmpty(message: string = '{field} must not empty') {
        this.rules.push(new ValidateRule(RULE.NOT_EMPTY, message));
        return this;
    }

    email(message: string = '{field} is not a valid email address') {
        this.rules.push(new ValidateRule(RULE.EMAIL, message));
        return this;
    }

    typeOfString(message: string = '{field} is not a string'){
        this.rules.push(new ValidateRule(RULE.TYPE_OF_STRING, message));
        return this;
    }

    typeOfNumber(message: string = '{field} is not a number'){
        this.rules.push(new ValidateRule(RULE.TYPE_OF_NUMBER, message));
        return this;
    }

    typeOfObject(message: string = '{field} is not an object'){
        this.rules.push(new ValidateRule(RULE.TYPE_OF_OBJECT, message));
        return this;
    }

    typeOfArray(message: string = '{field} is not an array'){
        this.rules.push(new ValidateRule(RULE.TYPE_OF_ARRAY, message));
        return this;
    }


    uuid(message: string = '{field} is not a valid uuid string'){
        this.rules.push(new ValidateRule(RULE.UUID, message));
        return this;
    }

    unique(table: string, message: string = '{field} already exists', field: string = null, ignoredId: any = null) {
        if (!field) {
            field = this.name;
        }

        this.rules.push(new ValidateRule(RULE.UNIQUE, message, [
            { name: 'table', value: table},
            { name: 'field', value: field},
            { name: 'ignoredId', value: ignoredId},
        ]));
        return this;
    }

    dateFormat(format: string, message: string = '{field} is not a valid date format {format}') {
        this.rules.push(new ValidateRule(RULE.DATE_FORMAT, message, [
            { name: 'format', value: format},
        ]));
        return this;
    }
}

export class Validator {
    _data: any;
    _fields: Array<ValidateField> = []
    _result: VResult | null

    constructor(data) {
        this._data = data;
    }

    Field(name: string): ValidateField {
        return new ValidateField(name)
    }

    addRule(rule: ValidateField) {
        this._fields.push(rule)
    }

    addRules(rules: Array<ValidateField>) {
        rules.forEach((rule) => {
            this._fields.push(rule)
        })
        return this;
    }

    getErrors() {
        return this._result.errors;
    }

    getValue(field: ValidateField, value: any) {
        if (field.convertTo) {

        }
    }

    convertValues() {
        this._fields.forEach(field => {
            if (field.convertTo) {
                const value = this._data[field.name];
                this._data[field.name] = DataConvertMethods[field.convertTo](value)
            }
        })
    }

    async validateAsync (): Promise<boolean> {
        this._result = {
            ok: false,
            errors: {}
        }
        const errors = {}
        const len = this._fields.length;

        for (let i = 0; i < len; i++) {
            const field = this._fields[i];
            let field_in_data = hasOwnProperty(this._data, field.name);
            const value = this._data[field.name] ?? null;
            if (field.convertTo) {
                this._data[field.name] = DataConvertMethods[field.convertTo](value)
            }


            const error_messages = [];
            if (field.required_rule) {
                const [validate_ok, message] = field.required_rule.validate(value, field.name)

                if (!validate_ok) {
                    error_messages.push(message)
                }
            }

            if (field_in_data) {
                const ruleLen = field.rules.length;
                for (let k = 0; k < ruleLen; k++) {
                    const rule = field.rules[k];
                    let validate_ok, message;

                    if (rule.rule === RULE.UNIQUE) {
                        [validate_ok, message] = await rule.validateAsync(value, field.name);
                    } else {
                        [validate_ok, message] = rule.validate(value, field.name);
                    }

                    if (!validate_ok) {
                        error_messages.push(message)
                    }
                }
            }

            if (error_messages.length > 0) {
                errors[field.name] = error_messages;
            }

        }

        this._result.errors = errors;
        this._result.ok = Object.keys(errors).length === 0;

        return this._result.ok;
    }

    validate(): boolean {
        this._result = {
            ok: false,
            errors: {}
        }
        const errors = {}
        const len = this._fields.length;

        for (let i = 0; i < len; i++) {
            const field = this._fields[i];
            let field_in_data = hasOwnProperty(this._data, field.name);
            const value = this._data[field.name] ?? null;

            if (field.convertTo) {
                this._data[field.name] = DataConvertMethods[field.convertTo](value)
            }

            const error_messages = [];
            if (field.required_rule) {
                const [validate_ok, message] = field.required_rule.validate(value, field.name)

                if (!validate_ok) {
                    error_messages.push(message)
                }
            }

            if (field_in_data) {
                const ruleLen = field.rules.length;
                for (let k = 0; k < ruleLen; k++) {
                    const rule = field.rules[k];
                    if (rule.rule === RULE.UNIQUE) {
                        throw new Error('Validator: validateAsync is required for rule: UNIQUE')
                    }
                    const [validate_ok, message] = rule.validate(value, field.name);
                    if (!validate_ok) {
                        error_messages.push(message)
                    }
                }
            }

            if (error_messages.length > 0) {
                errors[field.name] = error_messages;
            }

        }

        this._result.errors = errors;
        this._result.ok = Object.keys(errors).length === 0;

        return this._result.ok;
    }

    fails(): boolean {
        return !this.validate();
    }

    async failsAsync() {
        return !await this.validateAsync();
    }
}

