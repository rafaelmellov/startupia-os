import ts from 'typescript';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
const cache=new Map();
export function compiledURL(path){path=resolve(path);if(cache.has(path))return cache.get(path);let source=readFileSync(path,'utf8').replaceAll('import.meta.env.DEV','false');let code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;code=code.replace(/(from\s*['"])(\.[^'"]+)(['"])/g,(_,a,p,z)=>{let target=resolve(dirname(path),p);if(!existsSync(target))target+='.ts';return a+compiledURL(target)+z});const url='data:text/javascript;base64,'+Buffer.from(code).toString('base64');cache.set(path,url);return url}
export const loadTS=path=>import(compiledURL(path));
