import type {AnchorHTMLAttributes} from 'react';
// Native navigation works in both Next.js and the Sites Worker runtime, including
// entry from a standalone HTML landing or an email callback.
export default function SiteLink(props:AnchorHTMLAttributes<HTMLAnchorElement>){return <a {...props}/>}
