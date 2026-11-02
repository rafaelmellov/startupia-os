import {cpSync,mkdirSync,rmSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
const target=resolve(process.argv[2]||'../sites/startupia-platform');
// Run the official Sites project-setup helper in an empty target first. The target's
// manifest and deployment integration are retained; business code comes from here.
if(target===process.cwd())throw Error('Use a separate Sites deployment checkout.');
const targetPackage=JSON.parse(readFileSync(join(target,'package.json'),'utf8'));
const sourcePackage=JSON.parse(readFileSync('package.json','utf8'));
for(const dir of ['app','lib','public','experience']){if(dir!=='lib')rmSync(join(target,dir),{recursive:true,force:true});mkdirSync(join(target,dir),{recursive:true});cpSync(dir,join(target,dir),{recursive:true});}
for(const file of ['next.config.ts','postcss.config.mjs'])cpSync(file,join(target,file));
Object.assign(targetPackage.dependencies,sourcePackage.dependencies);
targetPackage.packageManager=sourcePackage.packageManager;
targetPackage.scripts["install:ci"]="pnpm install --frozen-lockfile";
writeFileSync(join(target,'package.json'),JSON.stringify(targetPackage,null,2)+'\n');
writeFileSync(join(target,'SOURCE-PROVENANCE.md'),'# Source provenance\nBusiness code is synchronized from the canonical GitHub repository rafaelmellov/startupia-os using scripts/prepare-sites.mjs. Sites is the publication target; Supabase remains the shared backend.\n');
console.log('Sites application source synchronized. Runtime environment files are not copied.');
