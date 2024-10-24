const {exec} = require('child_process');

function pad(number) {
    if (number < 10) {
        return '0' + number;
    }

    return number.toString();
}

function run(command, returnData = false) {
    console.log('\x1b[36m%s\x1b[0m', '[' + command + ']')
    return new Promise((resolve, reject) => {
        var process = exec(command);

        process.stdout.on('data', function (data) {
            if (returnData) {
                resolve(data);
            } else {
                console.log(data.toString());
            }
        });

        process.stderr.on('data', function (data) {
            if (returnData) {
                reject(data);
            } else {
                console.log(data.toString());
            }
        });

        if (!returnData) {
            process.on('exit', function () {
                resolve()
            });
        }

    })

}


function sleep(time) {
    return new Promise((resolve => {
        setTimeout(function () {
            resolve();
        }, time)
    }))
}

async function cleanUp (keyword) {
    const raw = await run(`docker images --format "{{json . }}"`, true);
    const lines = raw.split('\n');
    const matches = [];
    lines.forEach((line, index) => {
        if (index > 0) {
            line = line.trim();
            if (line) {
                const o = JSON.parse(line);
                if (o.Repository.indexOf(keyword) >= 0) {
                    matches.push(o)
                }
            }
        }
    });

    matches.shift();

    if (matches.length === 0) {
        console.warn('No image to clear');
    }

    const len = matches.length;
    for (let i = 0; i < len; i++) {
        const imageId = matches[i].ID;
        await run(`docker image rm -f ` + imageId);
    }

}

module.exports = {
    pad, run, sleep, cleanUp
}
