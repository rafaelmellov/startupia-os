export const analyticsEvents = ['page_view','workspace_saved','onboarding_completed','mentor_requested'] as const;
export type AnalyticsEvent = typeof analyticsEvents[number];
export const analyticsPaths = ['/os','/growth','/mentors','/integrations','/pricing','/product','/onboarding','/account'] as const;
export function validAnalyticsInput(value:unknown): value is {consent:true;event:AnalyticsEvent;sessionId:string;path:string} {
 if(!value || typeof value!=='object' || Array.isArray(value))return false;
 const b=value as Record<string,unknown>;
 return Object.keys(b).every(k=>['consent','event','sessionId','path'].includes(k)) && b.consent===true && analyticsEvents.includes(b.event as AnalyticsEvent) && typeof b.sessionId==='string' && /^anon_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(b.sessionId) && analyticsPaths.includes(b.path as typeof analyticsPaths[number]);
}
export function analyticsPayload(input:unknown,token:string) {
 if(!validAnalyticsInput(input))throw Error('Invalid analytics input');
 return {api_key:token,distinct_id:input.sessionId,event:input.event,properties:{path:input.path,$process_person_profile:false,$geoip_disable:true}};
}
export function privacySignal(dnt:string|null|undefined,gpc:unknown){return dnt==='1'||gpc===true||gpc==='1'}
export function createRateLimiter(max=30,windowMs=60_000,capacity=10_000){
 const entries=new Map<string,{count:number;until:number}>();
 return (key:string,now=Date.now())=>{
  for(const [id,entry] of entries)if(entry.until<=now)entries.delete(id);
  const entry=entries.get(key);
  if(entry){if(entry.count>=max)return false;entry.count++;return true}
  if(entries.size>=capacity)return false;
  entries.set(key,{count:1,until:now+windowMs});return true;
 };
}
