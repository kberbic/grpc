#!/usr/bin/env node

const path = require('path');
const { exec } = require('child_process');
const args = process.argv.splice(2);

const PATH = path.resolve(__dirname, '../');
const command = `chmod +x ${PATH}/ms.sh; sh ${PATH}/ms.sh ${args.join(" ")} -x ${PATH}`;

exec(command, (err)=> err && console.log(err))
    .stdout
    .pipe(process.stdout);