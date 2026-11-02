import {redirect} from 'next/navigation';
import {identity} from '../../lib/supabase/server';
import {requirePaidAccess} from '../../lib/entitlements';
import {HttpError} from '../../lib/http';
import Integrations from './integrations-client';
export default async function Page(){
 const {db,user}=await identity();if(!user)redirect('/access?next=/os');
 let locked=false;
 try{await requirePaidAccess(db,user.id)}catch(error){if(error instanceof HttpError&&[402,403].includes(error.status))locked=true;else throw error}
 if(locked)redirect('/checkout?plan=build');
 return <Integrations/>;
}
