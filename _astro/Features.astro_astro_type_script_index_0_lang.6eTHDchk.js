import{t as e}from"./messages.CT_YhQeE.js";var t=document.getElementById(`task-journey`);if(t){let n=Array.from(t.querySelectorAll(`.journey-step`)),r=n.map(e=>e.querySelector(`[data-journey-anchor]`)),i=n.map(e=>e.querySelector(`.journey-screen`)),a=window.matchMedia(`(prefers-reduced-motion: reduce)`),o=(e,t=0,n=1)=>Math.min(n,Math.max(t,e)),s=(e,t,n)=>e+(t-e)*n,c=e=>e*e*(3-2*e),l=.05,u=.72,d=.9,f=d,p=e=>({x:e.left+e.width/2,y:e.top+e.height/2}),m=e;if(n.length===5&&r.every(Boolean)){let e=document.createElement(`div`);e.className=`journey-flyer`,e.id=`journey-flyer`,e.setAttribute(`aria-hidden`,`true`),e.innerHTML=`
      <div class="jf-plate"></div>

      <div class="jf-face" data-face="gantt">
        <div class="gv-row is-sel jf-gantt-row">
          <span class="gv-name">${m(`flow_task_name`)}</span>
          <span class="jf-gantt-period">
            <span>${m(`flow_field_period_label`)}</span>
            <b>${m(`flow_field_period_value`)}</b>
          </span>
        </div>
      </div>

      <div class="jf-face" data-face="kanban">
        <div class="uic ac-blue">
          <div class="uic-top jf-new"><span class="uic-pill">${m(`flow_field_process_value`)}</span></div>
          <div class="uic-t">${m(`flow_task_name`)}</div>
          <div class="uic-tags jf-new"><span class="u-tag tg-front">${m(`mock_tag_front`)}</span></div>
          <div class="uic-foot">
            <span class="u-date"><i class="u-cal"></i>2026-08-06</span>
            <span class="uic-sp"></span>
            <span class="u-pri"><i class="u-pb">I</i>78</span>
          </div>
        </div>
      </div>

      <div class="jf-face jf-note" data-face="note">
        <div class="nv-doc jf-note-doc">
          <div class="nv-crumb">${m(`mock_project`)} / ${m(`flow_field_process_value`)}</div>
          <div class="nv-h1"><i></i><b>${m(`flow_task_name`)}</b></div>
          <div class="nv-meta"><span>${m(`flow_field_period_value`)}</span><span>${m(`flow_field_process_value`)}</span></div>
          <div class="jf-note-copy jf-new">
            <p><b>${m(`flow_field_memo_label`)}</b></p>
            <p>${m(`flow_field_memo_value`)}</p>
            <p>${m(`mock_note_p2`)}</p>
          </div>
        </div>
      </div>

      <div class="jf-face" data-face="matrix">
        <div class="uic ac-blue jf-matrix-card">
          <div class="uic-top"><span class="uic-pill">${m(`flow_field_process_value`)}</span><span class="uic-score jf-new">75</span></div>
          <div class="uic-t">${m(`flow_task_name`)}</div>
          <div class="uic-foot jf-new"><span class="u-pri"><i class="u-pb">I</i>${m(`flow_field_priority_value`)}</span></div>
          <div class="uic-prog"><span class="u-track"><i></i></span><span class="uic-pct">0%</span></div>
        </div>
      </div>

      <div class="jf-face" data-face="whiteboard">
        <div class="wb-card jf-whiteboard-card">
          <div class="wb-card-h"><i class="u-pb">I</i><span>${m(`flow_task_name`)}</span></div>
          <div class="wb-card-m jf-new"><span>${m(`flow_field_period_value`)}</span><span>${m(`mock_owner_name`)}</span></div>
          <div class="wb-card-p jf-new"><span class="u-track"><i></i></span><b>0%</b></div>
        </div>
      </div>`,t.append(e);let h=e.querySelector(`.jf-plate`),g=Array.from(e.querySelectorAll(`.jf-face`)),_=g.map(()=>({width:228,height:132})),v=window.innerWidth*.3,y=window.innerWidth*.7,b=e=>e%2==1?y:v,x=0;function S(){let n=e.style.display,r=e.style.visibility;e.style.display=`block`,e.style.visibility=`hidden`,_=g.map(e=>({width:e.offsetWidth,height:e.offsetHeight}));let i=t.closest(`.container`)?.getBoundingClientRect(),a=Math.max(..._.map(e=>e.width))/2+24,s=i?i.left:0,c=i?i.right:window.innerWidth,l=Math.max(a,(c-s)*.26);v=o(s+l,a,window.innerWidth-a),y=o(c-l,a,window.innerWidth-a),e.style.display=n,e.style.visibility=r}function C(){let e=window.innerHeight-80-56;n.forEach(t=>{let n=t.querySelector(`.journey-panel`);if(!n)return;n.style.removeProperty(`--journey-panel-scale`);let r=n.offsetHeight;if(!r)return;let i=Math.min(1,e/r);n.style.setProperty(`--journey-panel-scale`,i.toFixed(3))})}function w(){e.style.display=`none`,e.style.opacity=`0`,e.classList.remove(`is-active`),g.forEach(e=>{e.style.opacity=`0`,e.classList.remove(`is-incoming`,`is-revealed`)})}function T(){n.forEach(e=>{e.classList.remove(`is-current`,`is-back`,`is-departing`,`is-arrived`,`is-panel-visible`),e.style.removeProperty(`--journey-panel-opacity`),e.style.removeProperty(`--journey-panel-p`),e.style.removeProperty(`--journey-entry-y`)})}function E(){if(x=0,!t.hasAttribute(`data-enhanced`))return;let a=window.innerHeight,m=n.map(e=>e.getBoundingClientRect()),v=m.map((e,t)=>{let n=i[t]?i[t].getBoundingClientRect().height:0,r=Math.max(1,e.height-n-104);return o((104-e.top)/r)}),y=0;m.forEach((e,t)=>{e.top<=a*.5&&(y=t)});let S=-1;for(let e=0;e<n.length-1;e+=1)v[e]>f&&(S=e);let C=null;if(S>=0){let e=r[S].getBoundingClientRect(),t=r[S+1].getBoundingClientRect(),n=p(e),i=p(t),s=a*.34,c=a*.78,l=a*.5,u=o((v[S]-f)/.14),d=o((c-i.y)/Math.max(1,c-l));C={index:S,from:n,to:i,holdY:s,a:u,s:d}}n.forEach((e,t)=>{let n=v[t],r=o((n-l)/.47000000000000003),i=n<=u?1:1-c(o((n-u)/.18000000000000005)),s=n<l?0:i;e.style.setProperty(`--journey-panel-p`,r.toFixed(4)),e.style.setProperty(`--journey-panel-opacity`,s.toFixed(4));let f=t>0?v[t-1]:.99,p=c(o((f-d)/.08999999999999997)),m=t>0?(1-p)*a*.45:0;e.style.setProperty(`--journey-entry-y`,`${m.toFixed(2)}px`),e.classList.toggle(`is-current`,t===y),e.classList.toggle(`is-back`,n>l),e.classList.toggle(`is-panel-visible`,s>.001),e.classList.toggle(`is-departing`,!!C&&t===C.index&&C.a>0),e.classList.toggle(`is-arrived`,!!C&&t===C.index+1&&C.s>=.88)});let T=C&&v[C.index+1]>l;if(!C||C.a<=0||C.s>=1||T){w();return}let E=C.index,D=E+1,O=c(C.s),k=c(C.a),A=C.s>0?s(b(D),C.to.x,O):s(C.from.x,b(D),k),j=C.s>0?s(C.holdY,C.to.y,O):s(C.from.y,C.holdY,k),M=s(_[E].width,_[D].width,O),N=s(_[E].height,_[D].height,O),P=o(C.a/.3),F=1-o((C.s-.88)/.12),I=1-o((C.s-.15)/.3),L=o((C.s-.35)/.35);e.style.display=`block`,e.style.visibility=`visible`,e.style.width=`${Math.max(_[E].width,_[D].width)+72}px`,e.style.height=`${Math.max(_[E].height,_[D].height)+72}px`,e.style.transform=`translate(${A}px, ${j}px) translate(-50%, -50%)`,e.style.opacity=String(P*F),e.classList.add(`is-active`),h.style.width=`${M}px`,h.style.height=`${N}px`,g.forEach((e,t)=>{e.style.opacity=t===E?String(I):t===D?String(L):`0`,e.classList.toggle(`is-incoming`,t===D),e.classList.toggle(`is-revealed`,t===D&&C.s>=.43)})}function D(){x||=window.requestAnimationFrame(E)}function O(){let e=!a.matches;t.toggleAttribute(`data-enhanced`,e),e?(S(),C(),D()):(x&&window.cancelAnimationFrame(x),x=0,T(),w(),n.forEach(e=>{e.querySelector(`.journey-panel`)?.style.removeProperty(`--journey-panel-scale`)}))}window.addEventListener(`scroll`,D,{passive:!0}),window.addEventListener(`resize`,()=>{S(),C(),D()}),a.addEventListener(`change`,O),document.fonts?.ready&&document.fonts.ready.then(()=>{S(),C(),D()}),O()}}