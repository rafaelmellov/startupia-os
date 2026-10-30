import {NextResponse} from "next/server";
export function GET(){return NextResponse.json({app:"startupia-os",status:"running",integrations:"not_verified"},{headers:{"Cache-Control":"no-store"}})}
