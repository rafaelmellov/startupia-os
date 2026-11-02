import type {Attachment} from './attachments';
import {emptyEntry,uid,type Workspace,type Message} from './model';
export type SentFile={id:string;documentId:string;name:string;type:string;size:number;characters:number;truncated?:boolean};
export type ChatSubmission={messageId:string;question:string;files:Attachment[];links:string[]};
export function validSentFiles(files:unknown):boolean{return files===undefined||Array.isArray(files)&&files.length<=5&&files.every(f=>f&&typeof f.id==='string'&&typeof f.documentId==='string'&&typeof f.name==='string'&&f.name.length<=500&&typeof f.type==='string'&&Number.isFinite(f.size)&&f.size>=0&&Number.isInteger(f.characters)&&f.characters>=0&&f.characters<=18000&&(f.truncated===undefined||typeof f.truncated==='boolean'))}
export function canSubmit(text:string,files:Attachment[],links:string[],reading:boolean,busy:boolean){return !reading&&!busy&&!!(text.trim()||files.length||links.length)}
export function prepareSubmission(workspace:Workspace,input:string,files:Attachment[],links:string[]):{workspace:Workspace;submission:ChatSubmission}{
 if(files.length>5||files.some(f=>!f.text.trim()||f.text.length>18000||f.name.length>500))throw Error('Revisa los archivos antes de enviarlos.');
 const question=input.trim()||(files.length?'Resume brevemente los archivos adjuntos y propone un siguiente paso para mi startup. Distingue datos aportados y supuestos.':'Revisa estos enlaces de referencia. Si no tienes su contenido, indícalo antes de sacar conclusiones.');
 if(question.length>8000)throw Error('Divide esta consulta en partes de menos de 8.000 caracteres.');
 const documents=[...(workspace.records.documents||[])];const sent:SentFile[]=files.map(file=>{const existing=file.documentId?documents.find(d=>d.id===file.documentId):undefined;const documentId=existing?.id||file.id;if(!existing&&!documents.some(d=>d.id===documentId))documents.push({...emptyEntry(file.name),id:documentId,description:file.text,tag:'Texto de archivo adjunto'});return {id:file.id,documentId,name:file.name,type:file.type,size:file.size,characters:file.text.length,...(file.truncated?{truncated:true}:{})}});
 const messageId=uid();const message:Message={id:messageId,role:'user',content:question,...(sent.length?{files:sent}:{}),...(links.length?{links:[...links]}:{})};const next={...workspace,records:{...workspace.records,documents},messages:[...workspace.messages,message].slice(-1000)};
 if(new TextEncoder().encode(JSON.stringify(next)).length>880000)throw Error('Tu espacio está cerca del límite de guardado. Exporta y reduce contenido antes de enviar más archivos.');
 return {workspace:next,submission:{messageId,question,files:structuredClone(files),links:[...links]}};
}
export function restoreSubmission(workspace:Workspace,message:Message):ChatSubmission{
 const files=(message.files||[]).map(file=>{const doc=(workspace.records.documents||[]).find(d=>d.id===file.documentId);if(!doc)throw Error('Uno de los textos adjuntos fue archivado. Restáuralo o vuelve a adjuntarlo.');return {...file,text:doc.description.slice(0,18000)}});
 return {messageId:message.id,question:message.content,files,links:message.links||[]};
}
