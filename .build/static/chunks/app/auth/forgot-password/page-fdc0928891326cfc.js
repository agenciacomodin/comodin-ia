(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6047],{75879:function(e,t,r){Promise.resolve().then(r.bind(r,85911))},85911:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return p}});var a=r(15444),s=r(89300),i=r(2422),n=r(74678),o=r(34635),l=r(99827),c=r(35798),d=r(98155),u=r(1946),f=r(41084),m=r(64611);function p(){let[e,t]=(0,s.useState)(""),[r,p]=(0,s.useState)(!1),[h,g]=(0,s.useState)(!1),x=async t=>{t.preventDefault(),p(!0);try{let t=await fetch("/api/auth/forgot-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e})}),r=await t.json();r.success?(g(!0),m.ZP.success("\xa1Revisa tu email!")):m.ZP.error(r.message||"Error al enviar el email")}catch(e){m.ZP.error("Error de conexi\xf3n")}p(!1)};return h?(0,a.jsx)("div",{className:"min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4",children:(0,a.jsxs)(l.Zb,{className:"w-full max-w-md",children:[(0,a.jsxs)(l.Ol,{className:"text-center",children:[(0,a.jsx)("div",{className:"mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4",children:(0,a.jsx)(c.Z,{className:"h-6 w-6 text-green-600"})}),(0,a.jsx)(l.ll,{className:"text-2xl",children:"\xa1Email Enviado!"}),(0,a.jsx)(l.SZ,{children:"Si tu email est\xe1 registrado, recibir\xe1s un enlace para restablecer tu contrase\xf1a."})]}),(0,a.jsxs)(l.aY,{className:"space-y-4",children:[(0,a.jsxs)("div",{className:"bg-blue-50 p-4 rounded-lg",children:[(0,a.jsx)("p",{className:"text-sm text-blue-800",children:(0,a.jsx)("strong",{children:"\uD83D\uDCE7 Revisa tu bandeja de entrada"})}),(0,a.jsx)("p",{className:"text-sm text-blue-700 mt-1",children:"El enlace expirar\xe1 en 1 hora por seguridad."})]}),(0,a.jsxs)("div",{className:"bg-gray-50 p-4 rounded-lg",children:[(0,a.jsx)("p",{className:"text-sm text-gray-600",children:(0,a.jsx)("strong",{children:"\xbfNo ves el email?"})}),(0,a.jsxs)("ul",{className:"text-sm text-gray-600 mt-1 space-y-1",children:[(0,a.jsx)("li",{children:"• Revisa tu carpeta de spam"}),(0,a.jsx)("li",{children:"• Verifica que el email sea correcto"}),(0,a.jsx)("li",{children:"• Espera unos minutos m\xe1s"})]})]}),(0,a.jsx)("div",{className:"pt-4",children:(0,a.jsx)(f.default,{href:"/auth/login",children:(0,a.jsxs)(i.z,{variant:"outline",className:"w-full",children:[(0,a.jsx)(d.Z,{className:"mr-2 h-4 w-4"}),"Volver al Login"]})})})]})]})}):(0,a.jsx)("div",{className:"min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4",children:(0,a.jsxs)(l.Zb,{className:"w-full max-w-md",children:[(0,a.jsxs)(l.Ol,{className:"text-center",children:[(0,a.jsx)(l.ll,{className:"text-2xl",children:"\xbfOlvidaste tu contrase\xf1a?"}),(0,a.jsx)(l.SZ,{children:"Ingresa tu email y te enviaremos un enlace para restablecerla"})]}),(0,a.jsx)(l.aY,{children:(0,a.jsxs)("form",{onSubmit:x,className:"space-y-4",children:[(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)(o.Label,{htmlFor:"email",children:"Email"}),(0,a.jsx)(n.I,{id:"email",type:"email",placeholder:"tu@email.com",value:e,onChange:e=>t(e.target.value),required:!0,disabled:r})]}),(0,a.jsx)(i.z,{type:"submit",className:"w-full",disabled:r,children:r?(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(u.Z,{className:"mr-2 h-4 w-4 animate-spin"}),"Enviando..."]}):(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(c.Z,{className:"mr-2 h-4 w-4"}),"Enviar Enlace"]})}),(0,a.jsx)("div",{className:"text-center pt-4",children:(0,a.jsx)(f.default,{href:"/auth/login",children:(0,a.jsxs)(i.z,{variant:"ghost",className:"text-sm",children:[(0,a.jsx)(d.Z,{className:"mr-2 h-4 w-4"}),"Volver al Login"]})})})]})})]})})}},2422:function(e,t,r){"use strict";r.d(t,{d:function(){return l},z:function(){return c}});var a=r(15444),s=r(89300),i=r(21030),n=r(2371),o=r(65522);let l=(0,n.j)("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/90",outline:"border border-input bg-background hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),c=s.forwardRef(({className:e,variant:t,size:r,asChild:s=!1,...n},c)=>{let d=s?i.g7:"button";return(0,a.jsx)(d,{className:(0,o.cn)(l({variant:t,size:r,className:e})),ref:c,...n})});c.displayName="Button"},99827:function(e,t,r){"use strict";r.d(t,{Ol:function(){return o},SZ:function(){return c},Zb:function(){return n},aY:function(){return d},eW:function(){return u},ll:function(){return l}});var a=r(15444),s=r(89300),i=r(65522);let n=s.forwardRef(({className:e,...t},r)=>(0,a.jsx)("div",{ref:r,className:(0,i.cn)("rounded-lg border bg-card text-card-foreground shadow-sm",e),...t}));n.displayName="Card";let o=s.forwardRef(({className:e,...t},r)=>(0,a.jsx)("div",{ref:r,className:(0,i.cn)("flex flex-col space-y-1.5 p-6",e),...t}));o.displayName="CardHeader";let l=s.forwardRef(({className:e,...t},r)=>(0,a.jsx)("h3",{ref:r,className:(0,i.cn)("text-2xl font-semibold leading-none tracking-tight",e),...t}));l.displayName="CardTitle";let c=s.forwardRef(({className:e,...t},r)=>(0,a.jsx)("p",{ref:r,className:(0,i.cn)("text-sm text-muted-foreground",e),...t}));c.displayName="CardDescription";let d=s.forwardRef(({className:e,...t},r)=>(0,a.jsx)("div",{ref:r,className:(0,i.cn)("p-6 pt-0",e),...t}));d.displayName="CardContent";let u=s.forwardRef(({className:e,...t},r)=>(0,a.jsx)("div",{ref:r,className:(0,i.cn)("flex items-center p-6 pt-0",e),...t}));u.displayName="CardFooter"},74678:function(e,t,r){"use strict";r.d(t,{I:function(){return n}});var a=r(15444),s=r(89300),i=r(65522);let n=s.forwardRef(({className:e,type:t,...r},s)=>(0,a.jsx)("input",{type:t,className:(0,i.cn)("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",e),ref:s,...r}));n.displayName="Input"},34635:function(e,t,r){"use strict";r.d(t,{Label:function(){return c}});var a=r(15444),s=r(89300),i=r(4100),n=r(2371),o=r(65522);let l=(0,n.j)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"),c=s.forwardRef(({className:e,...t},r)=>(0,a.jsx)(i.f,{ref:r,className:(0,o.cn)(l(),e),...t}));c.displayName=i.f.displayName},65522:function(e,t,r){"use strict";r.d(t,{cn:function(){return i}});var a=r(32191),s=r(23607);function i(...e){return(0,s.m6)((0,a.W)(e))}},42154:function(e,t,r){"use strict";r.d(t,{Z:function(){return l}});var a=r(89300);let s=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),i=(...e)=>e.filter((e,t,r)=>!!e&&r.indexOf(e)===t).join(" ");var n={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let o=(0,a.forwardRef)(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:s,className:o="",children:l,iconNode:c,...d},u)=>(0,a.createElement)("svg",{ref:u,...n,width:t,height:t,stroke:e,strokeWidth:s?24*Number(r)/Number(t):r,className:i("lucide",o),...d},[...c.map(([e,t])=>(0,a.createElement)(e,t)),...Array.isArray(l)?l:[l]])),l=(e,t)=>{let r=(0,a.forwardRef)(({className:r,...n},l)=>(0,a.createElement)(o,{ref:l,iconNode:t,className:i(`lucide-${s(e)}`,r),...n}));return r.displayName=`${e}`,r}},98155:function(e,t,r){"use strict";r.d(t,{Z:function(){return a}});let a=(0,r(42154).Z)("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]])},1946:function(e,t,r){"use strict";r.d(t,{Z:function(){return a}});let a=(0,r(42154).Z)("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]])},35798:function(e,t,r){"use strict";r.d(t,{Z:function(){return a}});let a=(0,r(42154).Z)("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]])},41084:function(e,t,r){"use strict";r.d(t,{default:function(){return s.a}});var a=r(65558),s=r.n(a)},4100:function(e,t,r){"use strict";r.d(t,{f:function(){return o}});var a=r(89300),s=r(57234),i=r(15444),n=a.forwardRef((e,t)=>(0,i.jsx)(s.WV.label,{...e,ref:t,onMouseDown:t=>{t.target.closest("button, input, select, textarea")||(e.onMouseDown?.(t),!t.defaultPrevented&&t.detail>1&&t.preventDefault())}}));n.displayName="Label";var o=n},64611:function(e,t,r){"use strict";let a,s;r.d(t,{Toaster:function(){return eu},ZP:function(){return ef},Am:function(){return M}});var i,n=r(89300);let o={data:""},l=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||o,c=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,d=/\/\*[^]*?\*\/|  +/g,u=/\n+/g,f=(e,t)=>{let r="",a="",s="";for(let i in e){let n=e[i];"@"==i[0]?"i"==i[1]?r=i+" "+n+";":a+="f"==i[1]?f(n,i):i+"{"+f(n,"k"==i[1]?"":t)+"}":"object"==typeof n?a+=f(n,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=n&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=f.p?f.p(i,n):i+":"+n+";")}return r+(t&&s?t+"{"+s+"}":s)+a},m={},p=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+p(e[r]);return t}return e},h=(e,t,r,a,s)=>{var i;let n=p(e),o=m[n]||(m[n]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(n));if(!m[o]){let t=n!==e?e:(e=>{let t,r,a=[{}];for(;t=c.exec(e.replace(d,""));)t[4]?a.shift():t[3]?(r=t[3].replace(u," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(u," ").trim();return a[0]})(e);m[o]=f(s?{["@keyframes "+o]:t}:t,r?"":"."+o)}let l=r&&m.g?m.g:null;return r&&(m.g=m[o]),i=m[o],l?t.data=t.data.replace(l,i):-1===t.data.indexOf(i)&&(t.data=a?i+t.data:t.data+i),o},g=(e,t,r)=>e.reduce((e,a,s)=>{let i=t[s];if(i&&i.call){let e=i(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":f(e,""):!1===e?"":e}return e+a+(null==i?"":i)},"");function x(e){let t=this||{},r=e.call?e(t.p):e;return h(r.unshift?r.raw?g(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,l(t.target),t.g,t.o,t.k)}x.bind({g:1});let b,y,v,w=x.bind({k:1});function j(e,t){let r=this||{};return function(){let a=arguments;function s(i,n){let o=Object.assign({},i),l=o.className||s.className;r.p=Object.assign({theme:y&&y()},o),r.o=/ *go\d+/.test(l),o.className=x.apply(r,a)+(l?" "+l:""),t&&(o.ref=n);let c=e;return e[0]&&(c=o.as||e,delete o.as),v&&c[0]&&v(o),b(c,o)}return t?t(s):s}}var N=e=>"function"==typeof e,E=(e,t)=>N(e)?e(t):e,k=(a=0,()=>(++a).toString()),C=()=>{if(void 0===s&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");s=!e||e.matches}return s},Z=new Map,$=e=>{if(Z.has(e))return;let t=setTimeout(()=>{Z.delete(e),L({type:4,toastId:e})},1e3);Z.set(e,t)},O=e=>{let t=Z.get(e);t&&clearTimeout(t)},z=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,20)};case 1:return t.toast.id&&O(t.toast.id),{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return e.toasts.find(e=>e.id===r.id)?z(e,{type:1,toast:r}):z(e,{type:0,toast:r});case 3:let{toastId:a}=t;return a?$(a):e.toasts.forEach(e=>{$(e.id)}),{...e,toasts:e.toasts.map(e=>e.id===a||void 0===a?{...e,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let s=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+s}))}}},D=[],R={toasts:[],pausedAt:void 0},L=e=>{R=z(R,e),D.forEach(e=>{e(R)})},P={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},S=(e={})=>{let[t,r]=(0,n.useState)(R);(0,n.useEffect)(()=>(D.push(r),()=>{let e=D.indexOf(r);e>-1&&D.splice(e,1)}),[t]);let a=t.toasts.map(t=>{var r,a;return{...e,...e[t.type],...t,duration:t.duration||(null==(r=e[t.type])?void 0:r.duration)||(null==e?void 0:e.duration)||P[t.type],style:{...e.style,...null==(a=e[t.type])?void 0:a.style,...t.style}}});return{...t,toasts:a}},A=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||k()}),I=e=>(t,r)=>{let a=A(t,e,r);return L({type:2,toast:a}),a.id},M=(e,t)=>I("blank")(e,t);M.error=I("error"),M.success=I("success"),M.loading=I("loading"),M.custom=I("custom"),M.dismiss=e=>{L({type:3,toastId:e})},M.remove=e=>L({type:4,toastId:e}),M.promise=(e,t,r)=>{let a=M.loading(t.loading,{...r,...null==r?void 0:r.loading});return e.then(e=>(M.success(E(t.success,e),{id:a,...r,...null==r?void 0:r.success}),e)).catch(e=>{M.error(E(t.error,e),{id:a,...r,...null==r?void 0:r.error})}),e};var T=(e,t)=>{L({type:1,toast:{id:e,height:t}})},F=()=>{L({type:5,time:Date.now()})},_=e=>{let{toasts:t,pausedAt:r}=S(e);(0,n.useEffect)(()=>{if(r)return;let e=Date.now(),a=t.map(t=>{if(t.duration===1/0)return;let r=(t.duration||0)+t.pauseDuration-(e-t.createdAt);if(r<0){t.visible&&M.dismiss(t.id);return}return setTimeout(()=>M.dismiss(t.id),r)});return()=>{a.forEach(e=>e&&clearTimeout(e))}},[t,r]);let a=(0,n.useCallback)(()=>{r&&L({type:6,time:Date.now()})},[r]),s=(0,n.useCallback)((e,r)=>{let{reverseOrder:a=!1,gutter:s=8,defaultPosition:i}=r||{},n=t.filter(t=>(t.position||i)===(e.position||i)&&t.height),o=n.findIndex(t=>t.id===e.id),l=n.filter((e,t)=>t<o&&e.visible).length;return n.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+s,0)},[t]);return{toasts:t,handlers:{updateHeight:T,startPause:F,endPause:a,calculateOffset:s}}},H=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,V=w`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,W=w`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,Y=j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${H} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${V} 0.15s ease-out forwards;
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
    animation: ${W} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,q=w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,B=j("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${q} 1s linear infinite;
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
}`,G=j("div")`
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
`,K=j("div")`
  position: absolute;
`,Q=j("div")`
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
}`,ee=j("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${X} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,et=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?n.createElement(ee,null,t):t:"blank"===r?null:n.createElement(Q,null,n.createElement(B,{...a}),"loading"!==r&&n.createElement(K,null,"error"===r?n.createElement(Y,{...a}):n.createElement(G,{...a})))},er=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,ea=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,es=j("div")`
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
`,ei=j("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,en=(e,t)=>{let r=e.includes("top")?1:-1,[a,s]=C()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[er(r),ea(r)];return{animation:t?`${w(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${w(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},eo=n.memo(({toast:e,position:t,style:r,children:a})=>{let s=e.height?en(e.position||t||"top-center",e.visible):{opacity:0},i=n.createElement(et,{toast:e}),o=n.createElement(ei,{...e.ariaProps},E(e.message,e));return n.createElement(es,{className:e.className,style:{...s,...r,...e.style}},"function"==typeof a?a({icon:i,message:o}):n.createElement(n.Fragment,null,i,o))});i=n.createElement,f.p=void 0,b=i,y=void 0,v=void 0;var el=({id:e,className:t,style:r,onHeightUpdate:a,children:s})=>{let i=n.useCallback(t=>{if(t){let r=()=>{a(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return n.createElement("div",{ref:i,className:t,style:r},s)},ec=(e,t)=>{let r=e.includes("top"),a=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:C()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...a}},ed=x`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,eu=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:s,containerStyle:i,containerClassName:o})=>{let{toasts:l,handlers:c}=_(r);return n.createElement("div",{style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...i},className:o,onMouseEnter:c.startPause,onMouseLeave:c.endPause},l.map(r=>{let i=r.position||t,o=ec(i,c.calculateOffset(r,{reverseOrder:e,gutter:a,defaultPosition:t}));return n.createElement(el,{id:r.id,key:r.id,onHeightUpdate:c.updateHeight,className:r.visible?ed:"",style:o},"custom"===r.type?E(r.message,r):s?s(r):n.createElement(eo,{toast:r,position:i}))}))},ef=M}},function(e){e.O(0,[6539,5558,2386,7156,1744],function(){return e(e.s=75879)}),_N_E=e.O()}]);