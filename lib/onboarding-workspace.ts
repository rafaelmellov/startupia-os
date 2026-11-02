import {emptyEntry,initial,type Workspace} from '../app/model';
import {stageNames,type OnboardingState} from './journey-validation';
/** Apply confirmed onboarding context without replacing existing startup records. */
export function workspaceFromOnboarding(state:OnboardingState,existing?:Workspace|null):Workspace{
 const ws=structuredClone(existing||initial);
 ws.profile={...ws.profile,name:state.startup,founder:state.founder,idea:state.idea,problem:state.problem,audience:state.audience,model:state.sector,stage:stageNames[state.stage]};
 ws.mvp={...ws.mvp,problem:state.problem,audience:state.audience,solution:state.idea};
 const labels:Record<string,string>={validate:'Validar mi idea',build:'Definir mi MVP',customers:'Conseguir clientes',organize:'Ordenar mi trabajo',decide:'Tomar mejores decisiones',grow:'Medir y crecer'};
 ws.records.goals=ws.records.goals||[];
 for(const goal of state.goals)if(!ws.records.goals.some(item=>item.id==='onboarding-'+goal))ws.records.goals.push({...emptyEntry(labels[goal]),id:'onboarding-'+goal,description:'Prioridad elegida por el fundador.',target:1});
 return ws;
}
