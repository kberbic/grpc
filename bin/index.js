#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const { exec } = require('child_process');

const {
    capitalize,
    execAsync,
    parse
} = require('./templates.js');

const PATH = path.resolve(__dirname, '../');
const data = fs.readFileSync(`${PATH}/package.json`, {encoding: 'utf8'});
const dataOfPackage = JSON.parse(data);

const program = new Command();
program.version(dataOfPackage.version);

program
    .option('-s, --service  <name>', 'Service name without \'Service\' keyword')
    .option('-p, --port <number>', 'Service port number - REQUIRED')
    .option('-d, --database  <type>', 'Add database configuration, support: mongodb, postgres')
    .option('-a, --auth  <type>', 'Add init auth on service, support: jwt, auth0, okta');

program.parse(process.argv);

if(!program.service){
    console.log("Missing service name -s");
    process.exit(0);
}

if(!program.port){
    console.log("Missing service port -p");
    process.exit(0);
}

console.log(`Generate configuration for ${capitalize(program.service)}Service`);

const {
    PROTO_TEMPLATE,
    SERVICE_TEMPLATE,
    TEST_TEMPLATE,
    MONGODB_MODEL_TEMPLATE,
    POSTGRES_MODEL_TEMPLATE,
    ENVIRONMENT_TEMPLATE,
    DOCKER_TEMPLATE
} = parse(program);

let MIDDLEWARES = 'correlation,';
let ENV_TEMPLATE = ENVIRONMENT_TEMPLATE;

async function run() {


    await execAsync(`mkdir -p ${program.service}`);
    await execAsync(`mkdir -p ${program.service}/interfaces`);
    await execAsync(`cp -a ${PATH}/.service/. ${program.service}/.`);
    await execAsync(`rm -rf ${program.service}/node_modules`);
    await execAsync(`rm -rf ${program.service}/__tests__/*`);
    await execAsync(`mkdir -p ${program.service}/__tests__/services`);

    fs.writeFileSync(
        `${program.service}/interfaces/${program.service}.proto`,
        PROTO_TEMPLATE,
        {encoding: 'utf8'});

    fs.writeFileSync(
        `${program.service}/services/${program.service}.service.js`,
        SERVICE_TEMPLATE,
        {encoding: 'utf8'});

    fs.writeFileSync(
        `${program.service}/__tests__/services/${program.service}.service.spec.js`,
        TEST_TEMPLATE,
        {encoding: 'utf8'});

    if (program.auth) {
        await execAsync(`cp -a ${PATH}/.providers/${program.auth}/${program.auth}.js ${program.service}/modules/.`);
        if (program.auth === 'auth0') {
            MIDDLEWARES += ' auth0([]),'
            ENV_TEMPLATE += `
AUTH0_DOMAIN=
AUTH0_AUDIENCE=
    `;
        } else if (program.auth === 'jwt') {
            MIDDLEWARES += ' jwt([]),'
            ENV_TEMPLATE += `
JWT_SECRET=00000000
    `;
        } else {
            console.log("Wrong auth parameter, only support: jwt and auth0");
            process.exit(0);
        }
    }

    if (program.database) {
        await execAsync(`cp -a ${PATH}/.database/${program.database}/index.js ${program.service}/models/.`);
        let modelPath = `${program.service}/models/${program.service}.model.js`;
        if (program.database === 'mongodb') {
            ENV_TEMPLATE += `
MONGO_DATABASE_URI=mongodb://localhost:27017/${program.service}
    `;
        } else if (program.database === 'postgres') {
            ENV_TEMPLATE += `
POSTGRES_DATABASE_URI=postgres://postgres:password@localhost:5432/${program.service}
    `;
        } else {
            console.log("Wrong database parameter, only support: mongodb and postgres");
            process.exit(0);
        }

        fs.writeFileSync(
            modelPath,
            program.database === 'mongodb' ? MONGODB_MODEL_TEMPLATE : POSTGRES_MODEL_TEMPLATE,
            {encoding: 'utf8'});
    }

    fs.writeFileSync(
        `${program.service}/Dockerfile`,
        DOCKER_TEMPLATE,
        {encoding: 'utf8'});

    fs.writeFileSync(
        `${program.service}/.env.local`,
        ENV_TEMPLATE,
        {encoding: 'utf8'});

// Update package.json
    let pkg = fs.readFileSync(
        `${program.service}/package.json`, {encoding: 'utf8'});

    fs.writeFileSync(
        `${program.service}/package.json`,
        pkg.replace("{service}", `${capitalize(program.service)}Service`),
        {encoding: 'utf8'});

// Update modules
    let modules = fs.readFileSync(
        `${program.service}/modules/index.js`, {encoding: 'utf8'});

    fs.writeFileSync(
        `${program.service}/modules/index.js`,
        `
    ${program.auth ? `import ${program.auth} from './${program.auth}.js'` : ''}
    ${modules.replace("correlation,", MIDDLEWARES)}
    `,
        {encoding: 'utf8'});

    console.log("Install modules")

    exec(`cd ${program.service}; npm install`, (err) => {
        if (err) return console.log(err);
        console.log("Finished");
    }).stdout
        .pipe(process.stdout);
}

run();