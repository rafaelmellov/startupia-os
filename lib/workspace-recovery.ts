import type {Workspace} from '../app/model';
import {validWorkspace} from './workspace-validation';
export type Backup={state:Workspace;baseVersion:number;pending:boolean};
export function chooseRecovery(cloud:{state:Workspace|null;version:number},backup:Backup|null){if(!backup?.pending||!validWorkspace(backup.state))return 'cloud';if(JSON.stringify(backup.state)===JSON.stringify(cloud.state))return 'cloud';return backup.baseVersion===cloud.version?'recover':'conflict'}
export function backupKey(scope:string){if(!/^[a-f0-9]{64}$/.test(scope))throw Error('No se pudo verificar la cuenta del workspace.');return 'startupia-build:'+scope}
