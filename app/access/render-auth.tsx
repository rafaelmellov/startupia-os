import AuthPage, {type AuthMode} from './auth-page';
export type AuthSearchParams=Promise<Record<string,string|string[]|undefined>>;
export async function renderAuth(mode:AuthMode, searchParams:AuthSearchParams, legacy=false){
 const query=await searchParams;
 const value=(key:string)=>typeof query[key]==='string'?query[key] as string:undefined;
 const legacyModes:Record<string,AuthMode>={register:'register',reset:'reset',password:'password'};
 return <AuthPage mode={legacy&&['register','reset','password'].includes(value('mode')||'')?legacyModes[value('mode')!]:mode} plan={value('plan')} next={value('next')} expired={!!value('error')} recovery={value('recovery')==='1'}/>;
}
