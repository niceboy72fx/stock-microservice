require('dotenv').config({path: './env/.env'})
require('./lib/logger');
import {parseArgvOptions} from "./lib/basics";

interface BootOptions {
    entry: 'app' | 'console'
}

function boot(argv) {
    const options: BootOptions = parseArgvOptions(argv);

    switch (options.entry) {
        case 'app':
            require('./app').mainApp().catch(err => {
                console.error('Main app error', err);
            });
            break;
        case 'console':
            const command = argv[3];
            const args = [];
            for (let i = 4; i < argv.length; i++) {
                args.push(argv[i]);
            }
            require('./console').mainConsole(command, args, options).catch(err => {
                console.error('Main Console error', err);
            })
            break;
    }
}

boot(process.argv);