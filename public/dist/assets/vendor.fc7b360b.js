var Jt=typeof globalThis!="undefined"?globalThis:typeof window!="undefined"?window:typeof global!="undefined"?global:typeof self!="undefined"?self:{};function Qt(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var Yt={exports:{}};(function(t,u){(function(a,i){t.exports=i()})(Jt,function(){return function(a){function i(n){if(e[n])return e[n].exports;var c=e[n]={exports:{},id:n,loaded:!1};return a[n].call(c.exports,c,c.exports,i),c.loaded=!0,c.exports}var e={};return i.m=a,i.c=e,i.p="dist/",i(0)}([function(a,i,e){function n(s){return s&&s.__esModule?s:{default:s}}var c=Object.assign||function(s){for(var T=1;T<arguments.length;T++){var V=arguments[T];for(var et in V)Object.prototype.hasOwnProperty.call(V,et)&&(s[et]=V[et])}return s},m=e(1),E=(n(m),e(6)),l=n(E),y=e(7),d=n(y),b=e(8),f=n(b),w=e(9),z=n(w),N=e(10),ft=n(N),vt=e(11),yt=n(vt),wt=e(14),pt=n(wt),q=[],mt=!1,x={offset:120,delay:0,easing:"ease",duration:400,disable:!1,once:!1,startEvent:"DOMContentLoaded",throttleDelay:99,debounceDelay:50,disableMutationObserver:!1},B=function(){var s=arguments.length>0&&arguments[0]!==void 0&&arguments[0];if(s&&(mt=!0),mt)return q=(0,yt.default)(q,x),(0,ft.default)(q,x.once),q},tt=function(){q=(0,pt.default)(),B()},r=function(){q.forEach(function(s,T){s.node.removeAttribute("data-aos"),s.node.removeAttribute("data-aos-easing"),s.node.removeAttribute("data-aos-duration"),s.node.removeAttribute("data-aos-delay")})},o=function(s){return s===!0||s==="mobile"&&z.default.mobile()||s==="phone"&&z.default.phone()||s==="tablet"&&z.default.tablet()||typeof s=="function"&&s()===!0},g=function(s){x=c(x,s),q=(0,pt.default)();var T=document.all&&!window.atob;return o(x.disable)||T?r():(x.disableMutationObserver||f.default.isSupported()||(console.info(`
      aos: MutationObserver is not supported on this browser,
      code mutations observing has been disabled.
      You may have to call "refreshHard()" by yourself.
    `),x.disableMutationObserver=!0),document.querySelector("body").setAttribute("data-aos-easing",x.easing),document.querySelector("body").setAttribute("data-aos-duration",x.duration),document.querySelector("body").setAttribute("data-aos-delay",x.delay),x.startEvent==="DOMContentLoaded"&&["complete","interactive"].indexOf(document.readyState)>-1?B(!0):x.startEvent==="load"?window.addEventListener(x.startEvent,function(){B(!0)}):document.addEventListener(x.startEvent,function(){B(!0)}),window.addEventListener("resize",(0,d.default)(B,x.debounceDelay,!0)),window.addEventListener("orientationchange",(0,d.default)(B,x.debounceDelay,!0)),window.addEventListener("scroll",(0,l.default)(function(){(0,ft.default)(q,x.once)},x.throttleDelay)),x.disableMutationObserver||f.default.ready("[data-aos]",tt),q)};a.exports={init:g,refresh:B,refreshHard:tt}},function(a,i){},,,,,function(a,i){(function(e){function n(o,g,s){function T(h){var H=W,it=Y;return W=Y=void 0,nt=h,M=o.apply(it,H)}function V(h){return nt=h,O=setTimeout(ct,g),ot?T(h):M}function et(h){var H=h-C,it=h-nt,Gt=g-H;return K?tt(Gt,F-it):Gt}function at(h){var H=h-C,it=h-nt;return C===void 0||H>=g||H<0||K&&it>=F}function ct(){var h=r();return at(h)?_t(h):void(O=setTimeout(ct,et(h)))}function _t(h){return O=void 0,k&&W?T(h):(W=Y=void 0,M)}function It(){O!==void 0&&clearTimeout(O),nt=0,W=C=Y=O=void 0}function xt(){return O===void 0?M:_t(r())}function G(){var h=r(),H=at(h);if(W=arguments,Y=this,C=h,H){if(O===void 0)return V(C);if(K)return O=setTimeout(ct,g),T(C)}return O===void 0&&(O=setTimeout(ct,g)),M}var W,Y,F,M,O,C,nt=0,ot=!1,K=!1,k=!0;if(typeof o!="function")throw new TypeError(b);return g=y(g)||0,m(s)&&(ot=!!s.leading,K="maxWait"in s,F=K?B(y(s.maxWait)||0,g):F,k="trailing"in s?!!s.trailing:k),G.cancel=It,G.flush=xt,G}function c(o,g,s){var T=!0,V=!0;if(typeof o!="function")throw new TypeError(b);return m(s)&&(T="leading"in s?!!s.leading:T,V="trailing"in s?!!s.trailing:V),n(o,g,{leading:T,maxWait:g,trailing:V})}function m(o){var g=typeof o=="undefined"?"undefined":d(o);return!!o&&(g=="object"||g=="function")}function E(o){return!!o&&(typeof o=="undefined"?"undefined":d(o))=="object"}function l(o){return(typeof o=="undefined"?"undefined":d(o))=="symbol"||E(o)&&x.call(o)==w}function y(o){if(typeof o=="number")return o;if(l(o))return f;if(m(o)){var g=typeof o.valueOf=="function"?o.valueOf():o;o=m(g)?g+"":g}if(typeof o!="string")return o===0?o:+o;o=o.replace(z,"");var s=ft.test(o);return s||vt.test(o)?yt(o.slice(2),s?2:8):N.test(o)?f:+o}var d=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(o){return typeof o}:function(o){return o&&typeof Symbol=="function"&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o},b="Expected a function",f=NaN,w="[object Symbol]",z=/^\s+|\s+$/g,N=/^[-+]0x[0-9a-f]+$/i,ft=/^0b[01]+$/i,vt=/^0o[0-7]+$/i,yt=parseInt,wt=(typeof e=="undefined"?"undefined":d(e))=="object"&&e&&e.Object===Object&&e,pt=(typeof self=="undefined"?"undefined":d(self))=="object"&&self&&self.Object===Object&&self,q=wt||pt||Function("return this")(),mt=Object.prototype,x=mt.toString,B=Math.max,tt=Math.min,r=function(){return q.Date.now()};a.exports=c}).call(i,function(){return this}())},function(a,i){(function(e){function n(r,o,g){function s(k){var h=G,H=W;return G=W=void 0,C=k,F=r.apply(H,h)}function T(k){return C=k,M=setTimeout(at,o),nt?s(k):F}function V(k){var h=k-O,H=k-C,it=o-h;return ot?B(it,Y-H):it}function et(k){var h=k-O,H=k-C;return O===void 0||h>=o||h<0||ot&&H>=Y}function at(){var k=tt();return et(k)?ct(k):void(M=setTimeout(at,V(k)))}function ct(k){return M=void 0,K&&G?s(k):(G=W=void 0,F)}function _t(){M!==void 0&&clearTimeout(M),C=0,G=O=W=M=void 0}function It(){return M===void 0?F:ct(tt())}function xt(){var k=tt(),h=et(k);if(G=arguments,W=this,O=k,h){if(M===void 0)return T(O);if(ot)return M=setTimeout(at,o),s(O)}return M===void 0&&(M=setTimeout(at,o)),F}var G,W,Y,F,M,O,C=0,nt=!1,ot=!1,K=!0;if(typeof r!="function")throw new TypeError(d);return o=l(o)||0,c(g)&&(nt=!!g.leading,ot="maxWait"in g,Y=ot?x(l(g.maxWait)||0,o):Y,K="trailing"in g?!!g.trailing:K),xt.cancel=_t,xt.flush=It,xt}function c(r){var o=typeof r=="undefined"?"undefined":y(r);return!!r&&(o=="object"||o=="function")}function m(r){return!!r&&(typeof r=="undefined"?"undefined":y(r))=="object"}function E(r){return(typeof r=="undefined"?"undefined":y(r))=="symbol"||m(r)&&mt.call(r)==f}function l(r){if(typeof r=="number")return r;if(E(r))return b;if(c(r)){var o=typeof r.valueOf=="function"?r.valueOf():r;r=c(o)?o+"":o}if(typeof r!="string")return r===0?r:+r;r=r.replace(w,"");var g=N.test(r);return g||ft.test(r)?vt(r.slice(2),g?2:8):z.test(r)?b:+r}var y=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(r){return typeof r}:function(r){return r&&typeof Symbol=="function"&&r.constructor===Symbol&&r!==Symbol.prototype?"symbol":typeof r},d="Expected a function",b=NaN,f="[object Symbol]",w=/^\s+|\s+$/g,z=/^[-+]0x[0-9a-f]+$/i,N=/^0b[01]+$/i,ft=/^0o[0-7]+$/i,vt=parseInt,yt=(typeof e=="undefined"?"undefined":y(e))=="object"&&e&&e.Object===Object&&e,wt=(typeof self=="undefined"?"undefined":y(self))=="object"&&self&&self.Object===Object&&self,pt=yt||wt||Function("return this")(),q=Object.prototype,mt=q.toString,x=Math.max,B=Math.min,tt=function(){return pt.Date.now()};a.exports=n}).call(i,function(){return this}())},function(a,i){function e(y){var d=void 0,b=void 0;for(d=0;d<y.length;d+=1)if(b=y[d],b.dataset&&b.dataset.aos||b.children&&e(b.children))return!0;return!1}function n(){return window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver}function c(){return!!n()}function m(y,d){var b=window.document,f=n(),w=new f(E);l=d,w.observe(b.documentElement,{childList:!0,subtree:!0,removedNodes:!0})}function E(y){y&&y.forEach(function(d){var b=Array.prototype.slice.call(d.addedNodes),f=Array.prototype.slice.call(d.removedNodes),w=b.concat(f);if(e(w))return l()})}Object.defineProperty(i,"__esModule",{value:!0});var l=function(){};i.default={isSupported:c,ready:m}},function(a,i){function e(b,f){if(!(b instanceof f))throw new TypeError("Cannot call a class as a function")}function n(){return navigator.userAgent||navigator.vendor||window.opera||""}Object.defineProperty(i,"__esModule",{value:!0});var c=function(){function b(f,w){for(var z=0;z<w.length;z++){var N=w[z];N.enumerable=N.enumerable||!1,N.configurable=!0,"value"in N&&(N.writable=!0),Object.defineProperty(f,N.key,N)}}return function(f,w,z){return w&&b(f.prototype,w),z&&b(f,z),f}}(),m=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,E=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,l=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i,y=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,d=function(){function b(){e(this,b)}return c(b,[{key:"phone",value:function(){var f=n();return!(!m.test(f)&&!E.test(f.substr(0,4)))}},{key:"mobile",value:function(){var f=n();return!(!l.test(f)&&!y.test(f.substr(0,4)))}},{key:"tablet",value:function(){return this.mobile()&&!this.phone()}}]),b}();i.default=new d},function(a,i){Object.defineProperty(i,"__esModule",{value:!0});var e=function(c,m,E){var l=c.node.getAttribute("data-aos-once");m>c.position?c.node.classList.add("aos-animate"):typeof l!="undefined"&&(l==="false"||!E&&l!=="true")&&c.node.classList.remove("aos-animate")},n=function(c,m){var E=window.pageYOffset,l=window.innerHeight;c.forEach(function(y,d){e(y,l+E,m)})};i.default=n},function(a,i,e){function n(l){return l&&l.__esModule?l:{default:l}}Object.defineProperty(i,"__esModule",{value:!0});var c=e(12),m=n(c),E=function(l,y){return l.forEach(function(d,b){d.node.classList.add("aos-init"),d.position=(0,m.default)(d.node,y.offset)}),l};i.default=E},function(a,i,e){function n(l){return l&&l.__esModule?l:{default:l}}Object.defineProperty(i,"__esModule",{value:!0});var c=e(13),m=n(c),E=function(l,y){var d=0,b=0,f=window.innerHeight,w={offset:l.getAttribute("data-aos-offset"),anchor:l.getAttribute("data-aos-anchor"),anchorPlacement:l.getAttribute("data-aos-anchor-placement")};switch(w.offset&&!isNaN(w.offset)&&(b=parseInt(w.offset)),w.anchor&&document.querySelectorAll(w.anchor)&&(l=document.querySelectorAll(w.anchor)[0]),d=(0,m.default)(l).top,w.anchorPlacement){case"top-bottom":break;case"center-bottom":d+=l.offsetHeight/2;break;case"bottom-bottom":d+=l.offsetHeight;break;case"top-center":d+=f/2;break;case"bottom-center":d+=f/2+l.offsetHeight;break;case"center-center":d+=f/2+l.offsetHeight/2;break;case"top-top":d+=f;break;case"bottom-top":d+=l.offsetHeight+f;break;case"center-top":d+=l.offsetHeight/2+f}return w.anchorPlacement||w.offset||isNaN(y)||(b=y),d+b};i.default=E},function(a,i){Object.defineProperty(i,"__esModule",{value:!0});var e=function(n){for(var c=0,m=0;n&&!isNaN(n.offsetLeft)&&!isNaN(n.offsetTop);)c+=n.offsetLeft-(n.tagName!="BODY"?n.scrollLeft:0),m+=n.offsetTop-(n.tagName!="BODY"?n.scrollTop:0),n=n.offsetParent;return{top:m,left:c}};i.default=e},function(a,i){Object.defineProperty(i,"__esModule",{value:!0});var e=function(n){return n=n||document.querySelectorAll("[data-aos]"),Array.prototype.map.call(n,function(c){return{node:c}})};i.default=e}])})})(Yt);var oe=Qt(Yt.exports);let A,Ft,p,v,I,U,bt,J,rt,st,Dt,Ot,R,Rt,P,lt,St,Et,Mt,Tt,Q,Nt;const jt=[];let At,qt,kt,Ct,$t,Lt,_,S,gt,ut={},zt,D;const j="appendChild",$="createElement",X="removeChild";var ie=t=>(Ft||Zt(),R&&(clearTimeout(Rt),Vt()),D=t,Ot=t.ytSrc||t.vimeoSrc,qt=t.animationStart,kt=t.animationEnd,Ct=t.onChangeImage,A=t.el,At=!1,Et=A.getAttribute("data-caption"),t.gallery?ee(t.gallery,t.position):Ot||t.iframeSrc?(v=J,ne()):t.imgSrc?(At=!0,st=t.imgSrc,!~jt.indexOf(st)&&ht(!0),v=I,v.src=st):t.audio?(ht(!0),v=bt,v.src=t.audio,Wt("audio file")):t.vidSrc?(ht(!0),t.dimensions&&L(U,`width:${t.dimensions[0]}px`),te(t.vidSrc),Wt("video")):(v=I,v.src=A.tagName==="IMG"?A.src:window.getComputedStyle(A).backgroundImage.replace(/^url|[(|)|'|"]/g,"")),p[j](v),document.body[j](p),{close:Bt,next:()=>Z(1),prev:()=>Z(-1)});function Zt(){let t;function u(e){const n=document[$]("button");return n.className=e,n.innerHTML='<svg viewBox="0 0 48 48"><path d="M28 24L47 5a3 3 0 1 0-4-4L24 20 5 1a3 3 0 1 0-4 4l19 19L1 43a3 3 0 1 0 4 4l19-19 19 19a3 3 0 0 0 4 0v-4L28 24z"/></svg>',n}function a(e,n){const c=document[$]("button");return c.className="bp-lr",c.innerHTML='<svg viewBox="0 0 129 129" height="70" fill="#fff"><path d="M88.6 121.3c.8.8 1.8 1.2 2.9 1.2s2.1-.4 2.9-1.2a4.1 4.1 0 0 0 0-5.8l-51-51 51-51a4.1 4.1 0 0 0-5.8-5.8l-54 53.9a4.1 4.1 0 0 0 0 5.8l54 53.9z"/></svg>',L(c,n),c.onclick=m=>{m.stopPropagation(),Z(e)},c}const i=document[$]("STYLE");i.innerHTML="#bp_caption,#bp_container{bottom:0;left:0;right:0;position:fixed;opacity:0}#bp_container>*,#bp_loader{position:absolute;right:0;z-index:10}#bp_container,#bp_caption,#bp_container svg{pointer-events:none}#bp_container{top:0;z-index:9999;background:rgba(0,0,0,.7);opacity:0;transition:opacity .35s}#bp_loader{top:0;left:0;bottom:0;display:flex;align-items:center;cursor:wait;background:0;z-index:9}#bp_loader svg{width:50%;max-width:300px;max-height:50%;margin:auto;animation:bpturn 1s infinite linear}#bp_aud,#bp_container img,#bp_sv,#bp_vid{user-select:none;max-height:96%;max-width:96%;top:0;bottom:0;left:0;margin:auto;box-shadow:0 0 3em rgba(0,0,0,.4);z-index:-1}#bp_sv{background:#111}#bp_sv svg{width:66px}#bp_caption{font-size:.9em;padding:1.3em;background:rgba(15,15,15,.94);color:#fff;text-align:center;transition:opacity .3s}#bp_aud{width:650px;top:calc(50% - 20px);bottom:auto;box-shadow:none}#bp_count{left:0;right:auto;padding:14px;color:rgba(255,255,255,.7);font-size:22px;cursor:default}#bp_container button{position:absolute;border:0;outline:0;background:0;cursor:pointer;transition:all .1s}#bp_container>.bp-x{padding:0;height:41px;width:41px;border-radius:100%;top:8px;right:14px;opacity:.8;line-height:1}#bp_container>.bp-x:focus,#bp_container>.bp-x:hover{background:rgba(255,255,255,.2)}.bp-x svg,.bp-xc svg{height:21px;width:20px;fill:#fff;vertical-align:top;}.bp-xc svg{width:16px}#bp_container .bp-xc{left:2%;bottom:100%;padding:9px 20px 7px;background:#d04444;border-radius:2px 2px 0 0;opacity:.85}#bp_container .bp-xc:focus,#bp_container .bp-xc:hover{opacity:1}.bp-lr{top:50%;top:calc(50% - 130px);padding:99px 0;width:6%;background:0;border:0;opacity:.4;transition:opacity .1s}.bp-lr:focus,.bp-lr:hover{opacity:.8}@keyframes bpf{50%{transform:translatex(15px)}100%{transform:none}}@keyframes bpl{50%{transform:translatex(-15px)}100%{transform:none}}@keyframes bpfl{0%{opacity:0;transform:translatex(70px)}100%{opacity:1;transform:none}}@keyframes bpfr{0%{opacity:0;transform:translatex(-70px)}100%{opacity:1;transform:none}}@keyframes bpfol{0%{opacity:1;transform:none}100%{opacity:0;transform:translatex(-70px)}}@keyframes bpfor{0%{opacity:1;transform:none}100%{opacity:0;transform:translatex(70px)}}@keyframes bpturn{0%{transform:none}100%{transform:rotate(360deg)}}@media (max-width:600px){.bp-lr{font-size:15vw}}",document.head[j](i),p=document[$]("DIV"),p.id="bp_container",p.onclick=Bt,Dt=u("bp-x"),p[j](Dt),"ontouchstart"in window&&(zt=!0,p.ontouchstart=({changedTouches:e})=>{t=e[0].pageX},p.ontouchmove=e=>{e.preventDefault()},p.ontouchend=({changedTouches:e})=>{if(!Q)return;const n=e[0].pageX-t;n<-30&&Z(1),n>30&&Z(-1)}),I=document[$]("IMG"),U=document[$]("VIDEO"),U.id="bp_vid",U.setAttribute("playsinline",!0),U.controls=!0,U.loop=!0,bt=document[$]("audio"),bt.id="bp_aud",bt.controls=!0,bt.loop=!0,gt=document[$]("span"),gt.id="bp_count",lt=document[$]("DIV"),lt.id="bp_caption",Mt=u("bp-xc"),Mt.onclick=Ht.bind(null,!1),lt[j](Mt),St=document[$]("SPAN"),lt[j](St),p[j](lt),$t=a(1,"transform:scalex(-1)"),Lt=a(-1,"left:0;right:auto"),P=document[$]("DIV"),P.id="bp_loader",P.innerHTML='<svg viewbox="0 0 32 32" fill="#fff" opacity=".8"><path d="M16 0a16 16 0 0 0 0 32 16 16 0 0 0 0-32m0 4a12 12 0 0 1 0 24 12 12 0 0 1 0-24" fill="#000" opacity=".5"/><path d="M16 0a16 16 0 0 1 16 16h-4A12 12 0 0 0 16 4z"/></svg>',J=document[$]("DIV"),J.id="bp_sv",rt=document[$]("IFRAME"),rt.setAttribute("allowfullscreen",!0),rt.allow="autoplay; fullscreen",rt.onload=()=>J[X](P),L(rt,"border:0;position:absolute;height:100%;width:100%;left:0;top:0"),J[j](rt),I.onload=dt,I.onerror=dt.bind(null,"image"),window.addEventListener("resize",()=>{Q||R&&ht(!0),v===J&&Kt()}),document.addEventListener("keyup",({keyCode:e})=>{e===27&&Tt&&Bt(),Q&&(e===39&&Z(1),e===37&&Z(-1),e===38&&Z(10),e===40&&Z(-10))}),document.addEventListener("keydown",e=>{Q&&~[37,38,39,40].indexOf(e.keyCode)&&e.preventDefault()}),document.addEventListener("focus",e=>{Tt&&!p.contains(e.target)&&(e.stopPropagation(),Dt.focus())},!0),Ft=!0}function Xt(){const{top:t,left:u,width:a,height:i}=A.getBoundingClientRect(),e=u-(p.clientWidth-a)/2,n=t-(p.clientHeight-i)/2,c=A.clientWidth/v.clientWidth,m=A.clientHeight/v.clientHeight;return`transform:translate3D(${e}px, ${n}px, 0) scale3D(${c}, ${m}, 0)`}function te(t){Array.isArray(t)?(v=U.cloneNode(),t.forEach(u=>{const a=document[$]("SOURCE");a.src=u,a.type=`video/${u.match(/.(\w+)$/)[1]}`,v[j](a)})):(v=U,v.src=t)}function ee(t,u){let a=D.galleryAttribute||"data-bp";if(Array.isArray(t))_=u||0,S=t,Et=t[_].caption;else{S=[].slice.call(typeof t=="string"?document.querySelectorAll(`${t} [${a}]`):t);const i=S.indexOf(A);_=u===0||u?u:i!==-1?i:0,S=S.map(e=>({el:e,src:e.getAttribute(a),caption:e.getAttribute("data-caption")}))}At=!0,st=S[_].src,!~jt.indexOf(st)&&ht(!0),S.length>1?(p[j](gt),gt.innerHTML=`${_+1}/${S.length}`,zt||(p[j]($t),p[j](Lt))):S=!1,v=I,v.src=st}function Z(t){const u=S.length-1;if(R)return;if(t>0&&_===u||t<0&&!_){if(!D.loop){L(I,""),setTimeout(L,9,I,`animation:${t>0?"bpl":"bpf"} .3s;transition:transform .35s`);return}_=t>0?-1:u+1}if(_=Math.max(0,Math.min(_+t,u)),[_-1,_,_+1].forEach(i=>{if(i=Math.max(0,Math.min(i,u)),ut[i])return;const e=S[i].src,n=document[$]("IMG");n.addEventListener("load",Ut.bind(null,e)),n.src=e,ut[i]=n}),ut[_].complete)return Pt(t);R=!0,L(P,"opacity:.4;"),p[j](P),ut[_].onload=()=>{Q&&Pt(t)},ut[_].onerror=()=>{S[_]={error:"Error loading image"},Q&&Pt(t)}}function Pt(t){R&&(p[X](P),R=!1);const u=S[_];if(u.error)alert(u.error);else{const a=p.querySelector("img:last-of-type");I=v=ut[_],L(I,`animation:${t>0?"bpfl":"bpfr"} .35s;transition:transform .35s`),L(a,`animation:${t>0?"bpfol":"bpfor"} .35s both`),p[j](I),u.el&&(A=u.el)}gt.innerHTML=`${_+1}/${S.length}`,Ht(S[_].caption),Ct&&Ct([I,S[_]])}function ne(){let t;const u="https://",a="autoplay=1";D.ytSrc?t=`${u}www.youtube${D.ytNoCookie?"-nocookie":""}.com/embed/${Ot}?html5=1&rel=0&playsinline=1&${a}`:D.vimeoSrc?t=`${u}player.vimeo.com/video/${Ot}?${a}`:D.iframeSrc&&(t=D.iframeSrc),L(P,""),J[j](P),rt.src=t,Kt(),setTimeout(dt,9)}function Kt(){let t,u;const a=window.innerHeight*.95,i=window.innerWidth*.95,e=a/i,[n,c]=D.dimensions||[1920,1080],m=c/n;m>e?(t=Math.min(c,a),u=t/m):(u=Math.min(n,i),t=u*m),J.style.cssText+=`width:${u}px;height:${t}px;`}function Wt(t){~[1,4].indexOf(v.readyState)?(dt(),setTimeout(()=>{v.play()},99)):v.error?dt(t):Rt=setTimeout(Wt,35,t)}function ht(t){D.noLoader||(t&&L(P,`top:${A.offsetTop}px;left:${A.offsetLeft}px;height:${A.clientHeight}px;width:${A.clientWidth}px`),A.parentElement[t?j:X](P),R=t)}function Ht(t){t&&(St.innerHTML=t),L(lt,`opacity:${t?"1;pointer-events:auto":"0"}`)}function Ut(t){!~jt.indexOf(t)&&jt.push(t)}function dt(t){if(R&&ht(),qt&&qt(),typeof t=="string")return Vt(),D.onError?D.onError():alert(`Error: The requested ${t} could not be loaded.`);At&&Ut(st),v.style.cssText+=Xt(),L(p,"opacity:1;pointer-events:auto"),kt&&(kt=setTimeout(kt,410)),Tt=!0,Q=!!S,setTimeout(()=>{v.style.cssText+="transition:transform .35s;transform:none",Et&&setTimeout(Ht,250,Et)},60)}function Bt(t){const u=t?t.target:p,a=[lt,Mt,U,bt,St,Lt,$t,P];u.blur(),!(Nt||~a.indexOf(u))&&(v.style.cssText+=Xt(),L(p,"pointer-events:auto"),setTimeout(Vt,350),clearTimeout(kt),Tt=!1,Nt=!0)}function Vt(){if((v===J?rt:v).removeAttribute("src"),document.body[X](p),p[X](v),L(p,""),L(v,""),Ht(!1),Q){const u=p.querySelectorAll("img");for(let a=0;a<u.length;a++)p[X](u[a]);R&&p[X](P),p[X](gt),Q=S=!1,ut={},zt||p[X]($t),zt||p[X](Lt),I.onload=dt,I.onerror=dt.bind(null,"image")}D.onClose&&D.onClose(),Nt=R=!1}function L({style:t},u){t.cssText=u}export{oe as A,ie as B};