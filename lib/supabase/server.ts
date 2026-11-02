import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';

export async function database(){
 const jar=await cookies();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw Error('Configura la conexión segura con Supabase.');
 return createServerClient(url,key,{cookies:{getAll:()=>jar.getAll(),setAll:values=>{try{for(const {name,value,options} of values)jar.set(name,value,options)}catch{/* Server components cannot write cookies; route handlers refresh them. */}}}});
}

export async function identity(){
 const db=await database();
 const {data:{user},error}=await db.auth.getUser();
 return {db,user:error?null:user};
}
