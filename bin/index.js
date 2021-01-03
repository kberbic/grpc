#!/usr/bin/env node

const { exec } = require('child_process');
const args = process.argv.splice(2);

exec(`chmod +x ms.sh; sh ms.sh ${args.join(" ")}`).stdout.pipe(process.stdout);