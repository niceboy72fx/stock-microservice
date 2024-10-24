import SampleCommand from './commands/Sample';
import {sleep} from "../lib/utils";

const COMMAND = {
    sample: SampleCommand,
};

export async function mainConsole(command: string, args: Array<string>, options:any = {}) {
    if (COMMAND[command]) {
        const value = await COMMAND[command](args, options);
        if (value && value > 0) {
            await sleep(value * 1000);
        }
        process.exit(0);
        //process.exit(0);
    } else {
        console.error('No command specified');
        process.exit(0);
    }
}
