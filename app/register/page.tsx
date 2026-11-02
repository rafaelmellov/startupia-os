import {renderAuth,type AuthSearchParams} from '../access/render-auth';
export const metadata={title:'Crea tu cuenta — Startupia',robots:{index:false,follow:false}};
export default function Page({searchParams}:{searchParams:AuthSearchParams}){return renderAuth('register',searchParams);}
