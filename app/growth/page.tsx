import {redirect} from 'next/navigation';
import {identity} from '../../lib/supabase/server';
import {requirePaidAccess} from '../../lib/entitlements';
import {HttpError} from '../../lib/http';
import Growth from './growth-client';
export default async function Page(){
 const {db,user}=await identity();
 if(!user)redirect('/access?plan=growth&next=%2Fcheckout%3Fplan%3Dgrowth');
 let locked=false;
 try{locked=!(await requirePaidAccess(db,user.id)).entitlements.growth}catch(error){if(error instanceof HttpError&&[402,403].includes(error.status))locked=true;else throw error}
 if(locked)redirect('/checkout?plan=growth');
 return <Growth/>;
}
