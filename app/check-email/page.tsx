import {renderAuth,type AuthSearchParams} from '../access/render-auth';
export const metadata={title:'Revisa tu correo — Startupia',robots:{index:false,follow:false}};
export default function Page({searchParams}:{searchParams:AuthSearchParams}){return renderAuth('check',searchParams);}
