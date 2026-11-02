export const planPrices={build:17,growth:37} as const;
export const mentorRate=197;
export const stageNames:Record<string,string>={idea:'Idea',validation:'Validación',mvp:'MVP',clients:'Primeros clientes',traction:'Tracción',exploring:'Idea'};
export type OnboardingState={step:number;furthest:number;stage:string;founder:string;startup:string;sector:string;idea:string;problem:string;audience:string;difficulty:string;team:string;goals:string[];time:string;completed:boolean};
const goalKeys=['validate','build','customers','organize','decide','grow'];
export function onboardingState(value:any,complete=false):OnboardingState|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const limits:Record<string,number>={stage:30,founder:80,startup:100,sector:100,idea:1200,problem:1200,audience:400,difficulty:1200,team:20,time:10};
 const out:any={};
 for(const [key,max] of Object.entries(limits)){const v=value[key]??'';if(typeof v!=='string'||v.length>max)return null;out[key]=v.trim()}
 for(const k of ['step','furthest']){if(!Number.isInteger(value[k])||value[k]<0||value[k]>5)return null;out[k]=value[k]}
 if(value.stage&&!stageNames[value.stage]||!['solo','small','team'].includes(out.team)||!['2','5','10'].includes(out.time))return null;
 if(!Array.isArray(value.goals)||value.goals.length>3||!value.goals.every((g:any)=>goalKeys.includes(g))||new Set(value.goals).size!==value.goals.length)return null;
 out.goals=value.goals;out.completed=complete;
 if(complete&&(!out.stage||out.founder.length<2||out.startup.length<2||!out.sector||out.idea.length<15||out.problem.length<10||!out.audience||!out.goals.length))return null;
 return out;
}
export function mentorRequest(value:any){
 if(!value||typeof value!=='object'||!Number.isInteger(value.hours)||value.hours<1||value.hours>8)return null;
 const out:any={hours:value.hours,total:value.hours*mentorRate};
 for(const [key,max] of Object.entries({name:100,email:200,challenge:2000,availability:500,specialty:100,mentorId:100})){const v=value[key]??'';if(typeof v!=='string'||v.length>max)return null;out[key]=v.trim()}
 if(out.name.length<2||!/^\S+@\S+\.\S+$/.test(out.email)||out.challenge.length<20||out.availability.length<5||!['Estrategia y validación','Producto y MVP','Ventas y crecimiento'].includes(out.specialty))return null;
 return out as {hours:number;total:number;name:string;email:string;challenge:string;availability:string;specialty:string;mentorId:string};
}
