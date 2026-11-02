import {analyticsPaths,privacySignal,type AnalyticsEvent} from './core';
export const CONSENT_KEY='startupia-analytics-consent-v1';
const SESSION_KEY='startupia-analytics-session-v1';
export function browserPrivacySignal(){return typeof navigator!=='undefined'&&privacySignal(navigator.doNotTrack,(navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl)}
export function clearAnalyticsSession(){try{sessionStorage.removeItem(SESSION_KEY)}catch{}}
export function analyticsConsent(){try{return !browserPrivacySignal()&&localStorage.getItem(CONSENT_KEY)==='accepted'}catch{return false}}
export function trackAnalytics(event:AnalyticsEvent,path=window.location.pathname){
 if(!analyticsConsent()){clearAnalyticsSession();return}
 if(!analyticsPaths.includes(path as typeof analyticsPaths[number]))return;
 try{
  let sessionId=sessionStorage.getItem(SESSION_KEY);
  if(!sessionId){sessionId='anon_'+crypto.randomUUID();sessionStorage.setItem(SESSION_KEY,sessionId)}
  void fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({consent:true,event,sessionId,path}),credentials:'same-origin',referrerPolicy:'no-referrer'}).catch(()=>{});
 }catch{/* Optional measurement never interrupts work. */}
}
