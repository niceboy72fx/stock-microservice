const {  pad, run, cleanUp } = require('./lib');

async function main() {

    const date = new Date;
    const version = date.getFullYear() + '' + pad(date.getMonth() + 1) + '' + pad(date.getDate());
    const tag = 'v' + version;
    const localTag = 'vnpd/edw-core-account'
    const repo = 'containerregistry.vietnampost.vn/ewallet-vnpd/qr-payment-socket-sẻver';

    await run(`docker build --network=host -t ${localTag}:${tag} -f Dockerfile.build .`);
    await run(`docker tag ${localTag}:${tag} ${repo}:${tag}`);
    await run(`docker tag ${localTag}:${tag} ${repo}:latest`);
    await run(`docker push ${repo}:latest`)

}

main().catch(err => {
    console.error(err)
})