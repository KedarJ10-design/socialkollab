import { PROJECTS } from "../data/studio-data.js";
import { initPlateDepth } from "./plate-depth.js";

const $=(i)=>document.getElementById(i),qa=(s)=>[...document.querySelectorAll(s)],sa=(e,k,v)=>e.setAttribute(k,v),on=(e,t,f,o)=>e.addEventListener(t,f,o),rd=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const pl=(e,c,o)=>{e.classList.remove(c);if(!o){void e.offsetWidth;e.classList.add(c);}},by=new Map(PROJECTS.map((p)=>[p.id,p]));

function swap(im,pv,md,p,o,ok){
  const go=()=>{if(ok&&!ok())return;if(pv){pv.src=im.getAttribute("src")||im.src;pl(pv,"is-leaving",o);}im.src=p.specimen;im.alt=`${p.name} live website screenshot`;if(md)pl(md,"is-revealing",o);};
  const pr=new Image();pr.src=p.specimen;pr.complete||o?go():(pr.onload=pr.onerror=go);
}

function initHeroStage(){
  const bs=qa("[data-stage-btn]"),im=$("stage-img"),tt=$("stage-title"),lk=$("stage-live-link");
  if(!bs.length||!im||!tt||!lk)return;
  const wp=document.querySelector(".stage-tabs"),md=$("stage-media"),pv=$("stage-img-prev"),sc=$("stage-sector"),lc=$("stage-location");
  const cur=()=>bs.find((b)=>b.getAttribute("aria-pressed")==="true")||bs[0];
  let aid=cur().dataset.stageBtn,gn=0;
  const sy=(b)=>{if(!wp||!b)return;const w=bs.some((x)=>Math.abs(x.offsetTop-bs[0].offsetTop)>4),st=wp.style;st.setProperty("--tab-x",`${b.offsetLeft}px`);st.setProperty("--tab-w",`${b.offsetWidth}px`);st.setProperty("--tab-o",w?"0":"1");wp.classList.toggle("has-indicator",!w);};
  sy(cur());setTimeout(()=>wp?.classList.add("is-ready"),32);document.fonts?.ready.then(()=>sy(cur()));on(window,"resize",()=>sy(cur()),{passive:true});
  bs.forEach((b)=>on(b,"click",()=>{
    const id=b.dataset.stageBtn,p=id&&id!==aid?by.get(id):null;if(!p)return;
    aid=id;const g=++gn;bs.forEach((x)=>sa(x,"aria-pressed",String(x===b)));sy(b);swap(im,pv,md,p,rd(),()=>g===gn);
    tt.textContent=p.name;if(sc)sc.textContent=p.sectorLabel;if(lc)lc.textContent=p.location;lk.href=p.url;lk.textContent=`Visit ${p.domain} ↗`;
  }));
}

function initWorkSpotlightAndFilters(){
  const sb=qa("[data-spotlight-btn]"),im=$("spotlight-img"),pv=$("spotlight-img-prev"),md=$("spotlight-media"),tt=$("spotlight-title"),sm=$("spotlight-summary"),ix=$("spotlight-index"),sc=$("spotlight-sector"),lc=$("spotlight-location"),lk=$("spotlight-link");
  let as=sb[0]?.dataset.spotlightBtn||"",sg=0;
  const sel=(id)=>{
    const p=id&&id!==as?by.get(id):null;if(!p||!im||!tt)return;
    as=id;const g=++sg;sb.forEach((b)=>sa(b,"aria-pressed",String(b.dataset.spotlightBtn===id)));swap(im,pv,md,p,rd(),()=>g===sg);
    if(ix)ix.textContent=`${p.index} · LIVE PRODUCTION`;if(sc)sc.textContent=p.sectorLabel;if(lc)lc.textContent=p.location;
    tt.textContent=p.subname?`${p.name} — ${p.subname}`:p.name;if(sm)sm.textContent=p.summary;if(lk){lk.href=p.url;lk.textContent=`Visit ${p.domain} ↗`;}
  };
  sb.forEach((b)=>on(b,"click",()=>sel(b.dataset.spotlightBtn)));
  const bs=qa("[data-filter-btn]"),cs=qa("[data-project-card]"),cn=$("work-visible-count");
  if(!bs.length||!cs.length)return;
  bs.forEach((bt)=>on(bt,"click",()=>{
    const ct=bt.dataset.filterBtn||"all";let n=0;
    cs.forEach((c)=>{const sh=ct==="all"||c.dataset.category===ct;c.hidden=!sh;if(sh)n+=1;});
    sb.forEach((b)=>{b.hidden=!(ct==="all"||b.dataset.category===ct);});
    const fv=sb.find((b)=>!b.hidden);if(fv)sel(fv.dataset.spotlightBtn);
    bs.forEach((b)=>sa(b,"aria-pressed",String(b===bt)));if(cn)cn.textContent=String(n).padStart(2,"0");
  }));
}

initHeroStage();initWorkSpotlightAndFilters();initPlateDepth();
