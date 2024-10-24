/**
 * ExprParser
 * @author quantm@vnpost.vn
 */



const varCharMap = createCharMap('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_.');
const numericMap = createCharMap('0123456789.');
const precedenceMap = {
    '+': 2,
    '-': 2,
    '*': 3,
    '/': 3,
    '^': 3,
    '(': 1,
    ')': 1,
}
const symbolMap = {
    '+': true,
    '-': true,
    '*': true,
    '/': true,
    '^': true,
    '(': true,
    ')': true,
}

const charNameMap = {
    '\t': '[tab]',
    '\n': '[newline]',
    '\r': '[return]',
    ' ': '[space]',
}

function precedence(c): number {
    if (!precedenceMap[c]) {
        return 0;
    }

    return precedenceMap[c]
}

function isOperator(c): boolean {
    if (typeof c !== 'string') {
        return false;
    }
    return symbolMap[c] || false;
}

function createCharMap(input: string) {
    const map = {};
    const len = input.length;
    for (let i = 0; i < len; i++) {
        map[input[i]] = true;
    }

    return map;
}

function isValidChar(c) {
    return varCharMap[c] || false;
}

export class ExprVar {
    name: string
    constructor(name: string) {
        this.name = name;
    }

    toString() {
        return this.name;
    }
}

export class UndefinedVarError extends Error {}
export class ExprSyntaxInvalid extends Error {}

export function parseExprValue(input: any) {
    if (numericMap[input[0]]) {
        const value = input - 0;
        if (isNaN(value)) {
            throw new ExprSyntaxInvalid('Invalid syntax: ' + input)
        }
        return value;
    }

    return new ExprVar(input);
}


export default class ExprParser {
    #cache = {};
    constructor() {
    }

    toPostfixString(expr: string): string {
        return this.toPostfix(expr).map(e => {
            if (e instanceof ExprVar) {
                return e.toString();
            }

            return e.toString();
        }).join('');
    }

    evaluate(expr: string, vars: any = {}) {
        if (typeof expr !== 'string') {
            return '';
        }

        if (expr.length === 0) {
            return '';
        }

        let postfix;
        if (this.#cache[expr]) {
            postfix = this.#cache[expr];
        } else {
            if (expr[0] === '{' && expr[expr.length - 1] === '}') {
                let _expr = expr.substring(1).slice(0,-1);
                postfix = this.toPostfix(_expr);
            } else {
                postfix = this.toPostfix(expr);
            }

            this.#cache[expr] = postfix;
        }

        return this._evaluate(postfix, vars);
    }

    private _evaluate(postfix: Array<any>, vars: any = {}) {
        const stack = [];
        const len  = postfix.length;

        for (let i = 0; i < len; i++) {
            const c = postfix[i];
            if (isOperator(c)) {
                const o1 = stack.pop() || 0;
                const o2 = stack.pop() || 0;

                switch (c) {
                    case '+': stack.push(o1 + o2); break;
                    case '-': stack.push(o2 - o1);break;
                    case '*': stack.push(o1 * o2);break;
                    case '/': stack.push(o1 / o2);break;
                }
            } else {
                if (c instanceof ExprVar) {
                    if (c.name in vars) {
                        stack.push(vars[c.name])
                    } else {
                        throw new UndefinedVarError('Undefined var: ' + c.name)
                    }

                } else {
                    stack.push(c)
                }

            }
        }

        return stack[stack.length - 1];
    }

    tokenizer(expr: string, parseValue = true): string[] {
        const len = expr.length;


        const entries = [];
        let tokens = [];
        for (let i = 0; i < len; i++) {
            const token = expr.charAt(i);
            if (isOperator(token)) {
                if (tokens.length > 0) {
                    entries.push(tokens);
                    tokens = [];
                }

                entries.push(token);

                continue;
            }

            if (isValidChar(token)) {
                tokens.push(token)
            } else {
                let tokenName = charNameMap[token] || token;


                throw new Error('Invalid token: ' + tokenName)
            }
        }

        if (tokens.length) {
            entries.push(tokens)
        }

        const result = entries.map(e => {
            if (Array.isArray(e)) {
                if (parseValue) {
                    return parseExprValue(e.join(''));
                }

                return e.join('');
            }

            return e;
        });


        result.forEach((e, index) => {
            const last = result[index-1];
            const next = result[index + 1];
            if (e === '(' && last && !isOperator(last)) {
                throw new ExprSyntaxInvalid(`Missing operator near ${last.toString()}(`);
            } else if (e === ')' && next && !isOperator(next)) {
                throw new ExprSyntaxInvalid(`Missing operator near )${next.toString()}`);
            }
        });

        return result;
    }

    validateTokenizer(tokens: Array<any>) {
        console.log(tokens)
    }

    toPostfix(expr: string | string[]): Array<any> {
        if (typeof expr === 'string') {
            expr = this.tokenizer(expr);
        }

        const ignored = {
            ' ': true, '\t': true
        };
        const len = expr.length;
        const postfix = [], stack = [];
        for (let i = 0; i < len; i++) {
            const symbol = expr[i]
            if (ignored[symbol]) {
                continue;
            }
            if (!isOperator(symbol)) {
                postfix.push(symbol);
                continue;
            }

            if (symbol === '(') {
                stack.push(symbol);
            } else {
                if (symbol === ')') {

                    let openParenthesesFound = false;
                    while (stack.length > 0) {
                        const value = stack.pop()
                        if (value === '(') {
                            openParenthesesFound = true
                            break;
                        }
                        postfix.push(value);
                    }
                    if (!openParenthesesFound) {
                        throw new ExprSyntaxInvalid('Missing open `(`')
                    }
                } else {
                    const p = precedence(symbol);

                    const lastIndex = stack.length - 1;
                    if (p > precedence(stack[lastIndex])) {
                        stack.push(symbol);
                    } else {
                        while (p <= precedence(stack[stack.length - 1])) {
                            postfix.push(stack.pop());
                            if (stack.length === 0) {
                                break;
                            }
                        }

                        stack.push(symbol);
                    }
                }
            }
        }



        let e;
        while(e = stack.pop()) {
            if (e === '(') {
                throw new ExprSyntaxInvalid('Missing close `(`');
            }
            postfix.push(e);
        }

        return postfix;
    }
}