import {readdirSync} from 'node:fs';import {spawnSync} from 'node:child_process';
const tests=readdirSync('tests').filter(file=>file.endsWith('.test.mjs')).sort();let passed=0;
for(const file of tests){const result=spawnSync(process.execPath,['tests/'+file],{stdio:'inherit',timeout:60000});if(result.status!==0){process.stderr.write('Failed: '+file+'\n');process.exit(1)}passed++}
const types=spawnSync(process.execPath,['node_modules/typescript/bin/tsc','--noEmit'],{stdio:'inherit',timeout:60000});if(types.status!==0)process.exit(1);console.log('Quality checks passed: '+passed+' suites + TypeScript. Browser QA is recorded separately.');
