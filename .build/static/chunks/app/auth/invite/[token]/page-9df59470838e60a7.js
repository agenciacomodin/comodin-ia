(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3044],{76926:function(e,t,r){Promise.resolve().then(r.bind(r,49629))},49629:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return m}});var a=r(15444),s=r(89300),i=r(79047),n=r(75762),o=r(64611),l=r(2422),d=r(74678),c=r(34635),u=r(99827);function m({params:e}){let[t,r]=(0,s.useState)(null),[m,f]=(0,s.useState)(!0),[p,h]=(0,s.useState)(!1),[x,g]=(0,s.useState)(null),[b,y]=(0,s.useState)({name:"",fullName:"",phone:"",country:"",password:"",confirmPassword:""}),v=(0,i.useRouter)();(0,s.useEffect)(()=>{w()},[e.token]);let w=async()=>{try{let t=await fetch(`/api/invitations/token/validate?token=${e.token}`),a=await t.json();if(!t.ok)throw Error(a.error||"Invitaci\xf3n no v\xe1lida");if(r(a.invitation),a.invitation.firstName||a.invitation.lastName){let e=[a.invitation.firstName,a.invitation.lastName].filter(Boolean).join(" ");y(t=>({...t,name:a.invitation.firstName||"",fullName:e}))}}catch(e){g(e instanceof Error?e.message:"Error validando invitaci\xf3n")}finally{f(!1)}},N=async r=>{if(r.preventDefault(),t){h(!0),g(null);try{if(!b.name.trim())throw Error("El nombre es requerido");if(!b.password)throw Error("La contrase\xf1a es requerida");if(b.password.length<6)throw Error("La contrase\xf1a debe tener al menos 6 caracteres");if(b.password!==b.confirmPassword)throw Error("Las contrase\xf1as no coinciden");let r=await fetch(`/api/invitations/token/accept?token=${e.token}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:b.name.trim(),fullName:b.fullName.trim()||b.name.trim(),phone:b.phone.trim()||void 0,country:b.country.trim()||void 0,password:b.password,confirmPassword:b.confirmPassword})}),a=await r.json();if(!r.ok)throw Error(a.error||"Error procesando invitaci\xf3n");o.Am.success("\xa1Cuenta creada exitosamente!");let s=await (0,n.signIn)("credentials",{email:t.email,password:b.password,redirect:!1});s?.error?(o.Am.error("Error al iniciar sesi\xf3n. Intenta iniciar sesi\xf3n manualmente."),v.push("/auth/login")):(o.Am.success("\xa1Bienvenido al equipo!"),v.push("/dashboard"))}catch(e){g(e instanceof Error?e.message:"Error desconocido")}finally{h(!1)}}},j=(e,t)=>{y(r=>({...r,[e]:t}))};return m?(0,a.jsx)("div",{className:"min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4",children:(0,a.jsx)("div",{className:"max-w-md w-full",children:(0,a.jsx)(u.Zb,{children:(0,a.jsx)(u.aY,{className:"p-6",children:(0,a.jsxs)("div",{className:"text-center",children:[(0,a.jsx)("div",{className:"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"}),(0,a.jsx)("p",{className:"text-gray-600",children:"Validando invitaci\xf3n..."})]})})})})}):x&&!t?(0,a.jsx)("div",{className:"min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4",children:(0,a.jsx)("div",{className:"max-w-md w-full",children:(0,a.jsx)(u.Zb,{children:(0,a.jsx)(u.aY,{className:"p-6",children:(0,a.jsxs)("div",{className:"text-center",children:[(0,a.jsx)("div",{className:"text-red-500 text-5xl mb-4",children:"❌"}),(0,a.jsx)("h2",{className:"text-xl font-semibold text-gray-900 mb-2",children:"Invitaci\xf3n no v\xe1lida"}),(0,a.jsx)("p",{className:"text-gray-600 mb-4",children:x}),(0,a.jsx)(l.z,{onClick:()=>v.push("/auth/login"),className:"w-full",children:"Ir al inicio de sesi\xf3n"})]})})})})}):(0,a.jsx)("div",{className:"min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4",children:(0,a.jsxs)("div",{className:"max-w-md w-full",children:[(0,a.jsxs)("div",{className:"text-center mb-8",children:[(0,a.jsx)("h1",{className:"text-3xl font-bold text-gray-900 mb-2",children:"COMOD\xcdN IA"}),(0,a.jsx)("p",{className:"text-gray-600",children:"Plataforma de Comunicaci\xf3n y Ventas"})]}),(0,a.jsxs)(u.Zb,{children:[(0,a.jsxs)(u.Ol,{children:[(0,a.jsx)(u.ll,{className:"text-center",children:"\xa1Has sido invitado!"}),(0,a.jsxs)(u.SZ,{className:"text-center",children:[(0,a.jsx)("strong",{children:t?.invitedByName})," te ha invitado a unirte a"," ",(0,a.jsx)("strong",{children:t?.organizationName})," como"," ",(0,a.jsx)("strong",{children:"Agente de Ventas"})]})]}),(0,a.jsxs)(u.aY,{children:[t?.message&&(0,a.jsxs)("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6",children:[(0,a.jsxs)("p",{className:"text-sm text-blue-800 italic",children:['"',t.message,'"']}),(0,a.jsxs)("p",{className:"text-xs text-blue-600 mt-1",children:["- ",t.invitedByName]})]}),(0,a.jsxs)("form",{onSubmit:N,className:"space-y-4",children:[(0,a.jsx)("div",{className:"bg-gray-50 p-3 rounded-lg",children:(0,a.jsxs)("p",{className:"text-sm text-gray-600",children:[(0,a.jsx)("strong",{children:"Email:"})," ",t?.email]})}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c.Label,{htmlFor:"name",className:"text-sm font-medium",children:"Nombre *"}),(0,a.jsx)(d.I,{id:"name",value:b.name,onChange:e=>j("name",e.target.value),placeholder:"Tu nombre",required:!0})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c.Label,{htmlFor:"fullName",className:"text-sm font-medium",children:"Nombre completo"}),(0,a.jsx)(d.I,{id:"fullName",value:b.fullName,onChange:e=>j("fullName",e.target.value),placeholder:"Nombre y apellidos completos"})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c.Label,{htmlFor:"phone",className:"text-sm font-medium",children:"Tel\xe9fono"}),(0,a.jsx)(d.I,{id:"phone",value:b.phone,onChange:e=>j("phone",e.target.value),placeholder:"+52 555 123 4567"})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c.Label,{htmlFor:"country",className:"text-sm font-medium",children:"Pa\xeds"}),(0,a.jsx)(d.I,{id:"country",value:b.country,onChange:e=>j("country",e.target.value),placeholder:"M\xe9xico"})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c.Label,{htmlFor:"password",className:"text-sm font-medium",children:"Contrase\xf1a *"}),(0,a.jsx)(d.I,{id:"password",type:"password",value:b.password,onChange:e=>j("password",e.target.value),placeholder:"M\xednimo 6 caracteres",required:!0})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(c.Label,{htmlFor:"confirmPassword",className:"text-sm font-medium",children:"Confirmar contrase\xf1a *"}),(0,a.jsx)(d.I,{id:"confirmPassword",type:"password",value:b.confirmPassword,onChange:e=>j("confirmPassword",e.target.value),placeholder:"Repite tu contrase\xf1a",required:!0})]}),x&&(0,a.jsx)("div",{className:"bg-red-50 border border-red-200 rounded-lg p-3",children:(0,a.jsx)("p",{className:"text-sm text-red-800",children:x})}),(0,a.jsx)(l.z,{type:"submit",className:"w-full bg-blue-600 hover:bg-blue-700",disabled:p,children:p?(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("div",{className:"animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"}),"Creando cuenta..."]}):"Crear mi cuenta y unirme al equipo"})]}),(0,a.jsx)("div",{className:"mt-6 text-center",children:(0,a.jsxs)("p",{className:"text-xs text-gray-500",children:["Al crear tu cuenta, te unes autom\xe1ticamente a ",(0,a.jsx)("strong",{children:t?.organizationName})]})})]})]})]})})}},2422:function(e,t,r){"use strict";r.d(t,{d:function(){return l},z:function(){return d}});var a=r(15444),s=r(89300),i=r(21030),n=r(2371),o=r(65522);let l=(0,n.j)("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/90",outline:"border border-input bg-background hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),d=s.forwardRef(({className:e,variant:t,size:r,asChild:s=!1,...n},d)=>{let c=s?i.g7:"button";return(0,a.jsx)(c,{className:(0,o.cn)(l({variant:t,size:r,className:e})),ref:d,...n})});d.displayName="Button"},99827:function(e,t,r){"use strict";r.d(t,{Ol:function(){return o},SZ:function(){return d},Zb:function(){return n},aY:function(){return c},eW:function(){return u},ll:function(){return l}});var a=r(15444),s=r(89300),i=r(65522);let n=s.forwardRef(({className:e,...t},r)=>(0,a.jsx)("div",{ref:r,className:(0,i.cn)("rounded-lg border bg-card text-card-foreground shadow-sm",e),...t}));n.displayName="Card";let o=s.forwardRef(({className:e,...t},r)=>(0,a.jsx)("div",{ref:r,className:(0,i.cn)("flex flex-col space-y-1.5 p-6",e),...t}));o.displayName="CardHeader";let l=s.forwardRef(({className:e,...t},r)=>(0,a.jsx)("h3",{ref:r,className:(0,i.cn)("text-2xl font-semibold leading-none tracking-tight",e),...t}));l.displayName="CardTitle";let d=s.forwardRef(({className:e,...t},r)=>(0,a.jsx)("p",{ref:r,className:(0,i.cn)("text-sm text-muted-foreground",e),...t}));d.displayName="CardDescription";let c=s.forwardRef(({className:e,...t},r)=>(0,a.jsx)("div",{ref:r,className:(0,i.cn)("p-6 pt-0",e),...t}));c.displayName="CardContent";let u=s.forwardRef(({className:e,...t},r)=>(0,a.jsx)("div",{ref:r,className:(0,i.cn)("flex items-center p-6 pt-0",e),...t}));u.displayName="CardFooter"},74678:function(e,t,r){"use strict";r.d(t,{I:function(){return n}});var a=r(15444),s=r(89300),i=r(65522);let n=s.forwardRef(({className:e,type:t,...r},s)=>(0,a.jsx)("input",{type:t,className:(0,i.cn)("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",e),ref:s,...r}));n.displayName="Input"},34635:function(e,t,r){"use strict";r.d(t,{Label:function(){return d}});var a=r(15444),s=r(89300),i=r(4100),n=r(2371),o=r(65522);let l=(0,n.j)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),d=s.forwardRef(({className:e,...t},r)=>(0,a.jsx)(i.f,{ref:r,className:(0,o.cn)(l(),e),...t}));d.displayName=i.f.displayName},65522:function(e,t,r){"use strict";r.d(t,{cn:function(){return i}});var a=r(32191),s=r(23607);function i(...e){return(0,s.m6)((0,a.W)(e))}},79047:function(e,t,r){"use strict";var a=r(41206);r.o(a,"usePathname")&&r.d(t,{usePathname:function(){return a.usePathname}}),r.o(a,"useRouter")&&r.d(t,{useRouter:function(){return a.useRouter}}),r.o(a,"useSearchParams")&&r.d(t,{useSearchParams:function(){return a.useSearchParams}})},4100:function(e,t,r){"use strict";r.d(t,{f:function(){return o}});var a=r(89300),s=r(57234),i=r(15444),n=a.forwardRef((e,t)=>(0,i.jsx)(s.WV.label,{...e,ref:t,onMouseDown:t=>{t.target.closest("button, input, select, textarea")||(e.onMouseDown?.(t),!t.defaultPrevented&&t.detail>1&&t.preventDefault())}}));n.displayName="Label";var o=n},64611:function(e,t,r){"use strict";let a,s;r.d(t,{Toaster:function(){return eu},ZP:function(){return em},Am:function(){return T}});var i,n=r(89300);let o={data:""},l=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||o,d=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,c=/\/\*[^]*?\*\/|  +/g,u=/\n+/g,m=(e,t)=>{let r="",a="",s="";for(let i in e){let n=e[i];"@"==i[0]?"i"==i[1]?r=i+" "+n+";":a+="f"==i[1]?m(n,i):i+"{"+m(n,"k"==i[1]?"":t)+"}":"object"==typeof n?a+=m(n,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=n&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=m.p?m.p(i,n):i+":"+n+";")}return r+(t&&s?t+"{"+s+"}":s)+a},f={},p=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+p(e[r]);return t}return e},h=(e,t,r,a,s)=>{var i;let n=p(e),o=f[n]||(f[n]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(n));if(!f[o]){let t=n!==e?e:(e=>{let t,r,a=[{}];for(;t=d.exec(e.replace(c,""));)t[4]?a.shift():t[3]?(r=t[3].replace(u," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(u," ").trim();return a[0]})(e);f[o]=m(s?{["@keyframes "+o]:t}:t,r?"":"."+o)}let l=r&&f.g?f.g:null;return r&&(f.g=f[o]),i=f[o],l?t.data=t.data.replace(l,i):-1===t.data.indexOf(i)&&(t.data=a?i+t.data:t.data+i),o},x=(e,t,r)=>e.reduce((e,a,s)=>{let i=t[s];if(i&&i.call){let e=i(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":m(e,""):!1===e?"":e}return e+a+(null==i?"":i)},"");function g(e){let t=this||{},r=e.call?e(t.p):e;return h(r.unshift?r.raw?x(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,l(t.target),t.g,t.o,t.k)}g.bind({g:1});let b,y,v,w=g.bind({k:1});function N(e,t){let r=this||{};return function(){let a=arguments;function s(i,n){let o=Object.assign({},i),l=o.className||s.className;r.p=Object.assign({theme:y&&y()},o),r.o=/ *go\d+/.test(l),o.className=g.apply(r,a)+(l?" "+l:""),t&&(o.ref=n);let d=e;return e[0]&&(d=o.as||e,delete o.as),v&&d[0]&&v(o),b(d,o)}return t?t(s):s}}var j=e=>"function"==typeof e,E=(e,t)=>j(e)?e(t):e,k=(a=0,()=>(++a).toString()),C=()=>{if(void 0===s&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");s=!e||e.matches}return s},P=new Map,I=e=>{if(P.has(e))return;let t=setTimeout(()=>{P.delete(e),A({type:4,toastId:e})},1e3);P.set(e,t)},O=e=>{let t=P.get(e);t&&clearTimeout(t)},$=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,20)};case 1:return t.toast.id&&O(t.toast.id),{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return e.toasts.find(e=>e.id===r.id)?$(e,{type:1,toast:r}):$(e,{type:0,toast:r});case 3:let{toastId:a}=t;return a?I(a):e.toasts.forEach(e=>{I(e.id)}),{...e,toasts:e.toasts.map(e=>e.id===a||void 0===a?{...e,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let s=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+s}))}}},S=[],z={toasts:[],pausedAt:void 0},A=e=>{z=$(z,e),S.forEach(e=>{e(z)})},R={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},D=(e={})=>{let[t,r]=(0,n.useState)(z);(0,n.useEffect)(()=>(S.push(r),()=>{let e=S.indexOf(r);e>-1&&S.splice(e,1)}),[t]);let a=t.toasts.map(t=>{var r,a;return{...e,...e[t.type],...t,duration:t.duration||(null==(r=e[t.type])?void 0:r.duration)||(null==e?void 0:e.duration)||R[t.type],style:{...e.style,...null==(a=e[t.type])?void 0:a.style,...t.style}}});return{...t,toasts:a}},L=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||k()}),F=e=>(t,r)=>{let a=L(t,e,r);return A({type:2,toast:a}),a.id},T=(e,t)=>F("blank")(e,t);T.error=F("error"),T.success=F("success"),T.loading=F("loading"),T.custom=F("custom"),T.dismiss=e=>{A({type:3,toastId:e})},T.remove=e=>A({type:4,toastId:e}),T.promise=(e,t,r)=>{let a=T.loading(t.loading,{...r,...null==r?void 0:r.loading});return e.then(e=>(T.success(E(t.success,e),{id:a,...r,...null==r?void 0:r.success}),e)).catch(e=>{T.error(E(t.error,e),{id:a,...r,...null==r?void 0:r.error})}),e};var M=(e,t)=>{A({type:1,toast:{id:e,height:t}})},_=()=>{A({type:5,time:Date.now()})},q=e=>{let{toasts:t,pausedAt:r}=D(e);(0,n.useEffect)(()=>{if(r)return;let e=Date.now(),a=t.map(t=>{if(t.duration===1/0)return;let r=(t.duration||0)+t.pauseDuration-(e-t.createdAt);if(r<0){t.visible&&T.dismiss(t.id);return}return setTimeout(()=>T.dismiss(t.id),r)});return()=>{a.forEach(e=>e&&clearTimeout(e))}},[t,r]);let a=(0,n.useCallback)(()=>{r&&A({type:6,time:Date.now()})},[r]),s=(0,n.useCallback)((e,r)=>{let{reverseOrder:a=!1,gutter:s=8,defaultPosition:i}=r||{},n=t.filter(t=>(t.position||i)===(e.position||i)&&t.height),o=n.findIndex(t=>t.id===e.id),l=n.filter((e,t)=>t<o&&e.visible).length;return n.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+s,0)},[t]);return{toasts:t,handlers:{updateHeight:M,startPause:_,endPause:a,calculateOffset:s}}},Z=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,H=w`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,B=w`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,V=N("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Z} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${H} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${B} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,Y=w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,W=N("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${Y} 1s linear infinite;
`,U=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,J=w`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,G=N("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${U} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${J} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,K=N("div")`
  position: absolute;
`,Q=N("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,X=w`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,ee=N("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${X} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,et=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?n.createElement(ee,null,t):t:"blank"===r?null:n.createElement(Q,null,n.createElement(W,{...a}),"loading"!==r&&n.createElement(K,null,"error"===r?n.createElement(V,{...a}):n.createElement(G,{...a})))},er=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,ea=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,es=N("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,ei=N("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,en=(e,t)=>{let r=e.includes("top")?1:-1,[a,s]=C()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[er(r),ea(r)];return{animation:t?`${w(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${w(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},eo=n.memo(({toast:e,position:t,style:r,children:a})=>{let s=e.height?en(e.position||t||"top-center",e.visible):{opacity:0},i=n.createElement(et,{toast:e}),o=n.createElement(ei,{...e.ariaProps},E(e.message,e));return n.createElement(es,{className:e.className,style:{...s,...r,...e.style}},"function"==typeof a?a({icon:i,message:o}):n.createElement(n.Fragment,null,i,o))});i=n.createElement,m.p=void 0,b=i,y=void 0,v=void 0;var el=({id:e,className:t,style:r,onHeightUpdate:a,children:s})=>{let i=n.useCallback(t=>{if(t){let r=()=>{a(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return n.createElement("div",{ref:i,className:t,style:r},s)},ed=(e,t)=>{let r=e.includes("top"),a=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:C()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...a}},ec=g`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,eu=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:s,containerStyle:i,containerClassName:o})=>{let{toasts:l,handlers:d}=q(r);return n.createElement("div",{style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...i},className:o,onMouseEnter:d.startPause,onMouseLeave:d.endPause},l.map(r=>{let i=r.position||t,o=ed(i,d.calculateOffset(r,{reverseOrder:e,gutter:a,defaultPosition:t}));return n.createElement(el,{id:r.id,key:r.id,onHeightUpdate:d.updateHeight,className:r.visible?ec:"",style:o},"custom"===r.type?E(r.message,r):s?s(r):n.createElement(eo,{toast:r,position:i}))}))},em=T}},function(e){e.O(0,[6539,5762,2386,7156,1744],function(){return e(e.s=76926)}),_N_E=e.O()}]);