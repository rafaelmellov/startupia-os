import type {Attachment} from './attachments';
export async function storeOriginals(files:File[],attachments:Attachment[]){
 const stored:Attachment[]=[],errors:string[]=[];
 for(const attachment of attachments){
  const original=files.find(f=>f.name===attachment.name&&f.size===attachment.size);
  if(!original){errors.push(attachment.name+': no pudimos asociar el original.');continue}
  try{const response=await fetch('/api/files/'+attachment.id,{method:'PUT',headers:{'Content-Type':'application/octet-stream','X-File-Name':encodeURIComponent(original.name)},body:original,signal:AbortSignal.timeout(30000)});const data:any=await response.json();if(!response.ok||data.stored!==true)throw Error(data.error||'No se confirmó el almacenamiento.');stored.push(attachment)}catch(error:any){errors.push(attachment.name+': '+(error.message||'no se pudo guardar el original.'))}
 }
 return {attachments:stored,errors};
}
