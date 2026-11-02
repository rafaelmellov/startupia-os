import {redirect} from 'next/navigation';
import {identity} from '../../lib/supabase/server';
import {requirePaidAccess} from '../../lib/entitlements';
import {HttpError} from '../../lib/http';
import App from '../workspace-app';
export default async function Page(){
 const {db,user}=await identity();if(!user)redirect('/access?next=/os');
 let needsPayment=false;
 try{await requirePaidAccess(db,user.id)}catch(error){if(error instanceof HttpError&&[402,403].includes(error.status))needsPayment=true;else throw error}
 const {data:org,error}=await db.from('organizations').select('id').eq('owner_id',user.id).maybeSingle();
 if(error)throw Error('No se pudo verificar tu startup.');
 if(needsPayment){let plan='build';if(org){const interest=await db.from('plan_interests').select('plan').eq('organization_id',org.id).maybeSingle();if(interest.data?.plan==='growth')plan='growth'}redirect('/checkout?plan='+plan)}
 if(!org)redirect('/onboarding');
 const {data:progress,error:progressError}=await db.from('onboardings').select('completed_at').eq('organization_id',org.id).maybeSingle();
 if(progressError)throw Error('No se pudo recuperar tu progreso.');
 if(!progress?.completed_at)redirect('/onboarding');
 return <App/>;
}
