import {renderAuth,type AuthSearchParams} from '../access/render-auth';
export const metadata={title:'Recupera tu acceso — Startupia',robots:{index:false,follow:false}};
export default function Page({searchParams}:{searchParams:AuthSearchParams}){return renderAuth('reset',searchParams);}
