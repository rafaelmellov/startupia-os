import {identity} from '../../../../lib/supabase/server';
import {requirePaidAccess} from '../../../../lib/entitlements';
import {HttpError,json,readJson,sameOrigin} from '../../../../lib/http';
import {validWorkspace} from '../../../../lib/workspace-validation';
import {parseProposal} from '../../../../lib/ai/core';
import {failure} from '../../../../lib/ai/server';
import {uid} from '../../../model';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{
 sameOrigin(request);const {db,user}=await identity();if(!user)throw new HttpError(401,'Inicia sesión para continuar.');
 const {organizationId}=await requirePaidAccess(db,user.id),body=await readJson(request,300000);
 if(!body||typeof body!=='object'||Array.isArray(body)||body.confirmed!==true||!Number.isInteger(body.version)||body.version<0||(body.messageId!==undefined&&(typeof body.messageId!=='string'||body.messageId.length>100)))throw new HttpError(400,'Confirma una propuesta válida antes de aplicar cambios.');
 const current=await db.from('workspaces').select('state,version').eq('organization_id',organizationId).single();if(current.error||!validWorkspace(current.data?.state))throw new HttpError(503,'No se pudo recuperar tu workspace.');
 const alreadyApplied=typeof body.plan?.id==='string'&&current.data.state.actions?.some((action:any)=>action.id===body.plan.id);
 if(!alreadyApplied&&current.data.version!==body.version)throw new HttpError(409,'Tu workspace cambió. Actualiza el contexto antes de aplicar la propuesta.');
 let result;try{result=parseProposal(current.data.state,body.plan)}catch(error){throw new HttpError(422,error instanceof Error?error.message:'La propuesta no se pudo validar.');}
 if(result.replayed)return json({state:result.workspace,version:current.data.version,receipt:result.receipt,replayed:true});
 const content='Cambios guardados: '+result.receipt.title+'. Puedes revisarlos y deshacerlos desde el historial mientras no existan ediciones posteriores.';
 const found=body.messageId&&result.workspace.messages.some(m=>m.id===body.messageId);
 result.workspace.messages=(found?result.workspace.messages.map(m=>m.id===body.messageId?{...m,content,actionId:result.receipt.id}:m):[...result.workspace.messages,{id:uid(),role:'assistant' as const,content,provider:'workspace',status:'complete' as const,actionId:result.receipt.id}]).slice(-1000);
 if(!validWorkspace(result.workspace))throw new HttpError(422,'La propuesta supera los límites del workspace. Divide los cambios.');
 const saved=await db.rpc('save_workspace',{org:organizationId,p_state:result.workspace,expected_version:current.data.version});if(saved.error)throw new HttpError(['PT409','40001'].includes(saved.error.code)?409:503,'No se pudo confirmar el guardado. Actualiza el contexto antes de volver a aplicar.');
 if(!Number.isInteger(saved.data)||saved.data<=current.data.version)throw new HttpError(503,'El guardado no devolvió una confirmación válida. Actualiza el contexto antes de continuar.');
 return json({state:result.workspace,version:saved.data,receipt:result.receipt,replayed:false});
 }catch(error){return failure(error)}}
