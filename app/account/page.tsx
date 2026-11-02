import {redirect} from 'next/navigation';
import {identity} from '../../lib/supabase/server';
import {AccountPanel} from '../ecosystem';
export default async function Account(){
 const {user}=await identity();if(!user)redirect('/access');
 return <main className="product-page"><nav><a href="/os">← Mi workspace</a><a href="/integrations">Conexiones ↗</a></nav><h1>Tu cuenta Startupia.</h1><AccountPanel/></main>;
}
