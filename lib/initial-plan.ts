import type {database} from './supabase/server';
export const commercialPlan=(value:unknown):'build'|'growth'|null=>value==='build'||value==='growth'?value:null;
// A commercial preference never changes entitlements or the subscription table.
export async function recordInitialPlan(db:Awaited<ReturnType<typeof database>>,userId:string,value:unknown){
 const plan=commercialPlan(value);if(!plan)return;
 let result=await db.from('organizations').select('id').eq('owner_id',userId).maybeSingle();
 if(result.error)throw result.error;
 if(!result.data){const created=await db.from('organizations').insert({owner_id:userId}).select('id').single();
  if(created.error?.code==='23505')result=await db.from('organizations').select('id').eq('owner_id',userId).single();
  else result=created;
 }
 if(result.error||!result.data)throw Error('No se pudo preparar tu organización.');
 const saved=await db.from('plan_interests').upsert({organization_id:result.data.id,plan},{onConflict:'organization_id',ignoreDuplicates:true});
 if(saved.error)throw saved.error;
}
