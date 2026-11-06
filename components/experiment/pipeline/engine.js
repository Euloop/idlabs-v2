/* eslint-disable */
// @ts-nocheck
/* X "For You" pipeline — scroll-driven diagram (v26).
   Ported from the supplied x-for-you-pipeline.html: only v26 and the helpers it
   uses are kept (v7 sourcing, v10 scoring, v17 selection). Drawing code is
   unchanged; changes are limited to: element lookups scoped to the given <svg>,
   an optional zoom boost B for narrow screens, and the chapter label/progress
   dots removed from the in-SVG HUD (the page renders its own step label). */

export function createPipeline(svg) {
const R1=n=>Math.round(n*10)/10;
const clamp=(v,a,b)=>Math.max(a===undefined?0:a,Math.min(b===undefined?1:b,v));
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const lerp=(a,b,u)=>a+(b-a)*u;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
function along(pts,u){let L=0;const d=[];for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);d.push(l);L+=l;}
  let r=clamp(u)*L;for(let i=0;i<d.length;i++){if(r<=d[i]||i===d.length-1){const v=d[i]?clamp(r/d[i]):0;return [lerp(pts[i][0],pts[i+1][0],v),lerp(pts[i][1],pts[i+1][1],v)];}r-=d[i];}}
const XP=(x,y,r,c)=>'<path class="'+c+'" d="M'+R1(x-r)+' '+R1(y)+'H'+R1(x+r)+'M'+R1(x)+' '+R1(y-r)+'V'+R1(y+r)+'"/>';
const DOT=(x,y,r,c,op)=>'<circle class="'+c+'" cx="'+R1(x)+'" cy="'+R1(y)+'" r="'+r+'"'+(op!==undefined?' opacity="'+R1(op*10)/10+'"':'')+'/>';
const TT=(x,y,s,c,a)=>'<text class="'+c+'" x="'+R1(x)+'" y="'+R1(y)+'" text-anchor="'+(a||'middle')+'">'+s+'</text>';
function plane(cx,cy,W,H){const p={cx:cx,cy:cy,W:W,H:H,n:[]};p.P=(u,v)=>[cx+u*0.5,cy-v-u*0.3];return p;}
function grid(p,nu,nv,mu,mv){mu=mu===undefined?.2:mu;mv=mv===undefined?.12:mv;
  for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const u=nu===1?0:lerp(-p.W/2+p.W*mu,p.W/2-p.W*mu,i/(nu-1)),v=nv===1?0:lerp(p.H/2-p.H*mv,-p.H/2+p.H*mv,j/(nv-1));const q=p.P(u,v);p.n.push({x:q[0],y:q[1],live:true});}
  return p;}
function outl(p,c){const k=[[-p.W/2,p.H/2],[p.W/2,p.H/2],[p.W/2,-p.H/2],[-p.W/2,-p.H/2]].map(q=>p.P(q[0],q[1]));return '<path class="'+c+'" d="M'+k.map(q=>R1(q[0])+' '+R1(q[1])).join('L')+'Z"/>';}
function RO(x,y,val,title,rows){let s='<text class="rt" x="'+x+'" y="'+y+'"><tspan class="rg">['+val+']</tspan> '+title+' <tspan class="rg">+</tspan></text>';
  rows.forEach((r,i)=>{s+=TT(x+70,y+24+i*19,r[0],'rk','end')+TT(x+82,y+24+i*19,r[1],r[2]||'rv','start');});return s;}
const ELL=(cx,cy,rx,ry,c)=>'<ellipse class="'+c+'" cx="'+R1(cx)+'" cy="'+R1(cy)+'" rx="'+R1(rx)+'" ry="'+R1(ry)+'"/>';
const LN=(x1,y1,x2,y2,c)=>'<path class="'+c+'" d="M'+R1(x1)+' '+R1(y1)+'L'+R1(x2)+' '+R1(y2)+'"/>';
const RC=(x,y,w,h,r,c)=>'<rect class="'+c+'" x="'+R1(x)+'" y="'+R1(y)+'" width="'+R1(w)+'" height="'+R1(h)+'" rx="'+r+'"/>';
const LNS=(pairs,c)=>{let d='';pairs.forEach(p=>d+='M'+R1(p[0].x)+' '+R1(p[0].y)+'L'+R1(p[1].x)+' '+R1(p[1].y));return d?'<path class="'+c+'" d="'+d+'"/>':'';};
const nd=(x,y)=>({x:x,y:y,live:true});
const qb=(a,c,b,u)=>[(1-u)*(1-u)*a[0]+2*(1-u)*u*c[0]+u*u*b[0],(1-u)*(1-u)*a[1]+2*(1-u)*u*c[1]+u*u*b[1]];
function racks(cx,cy){let s='';const n=[];[-26,0,26].forEach(dx=>{const x=cx+dx;for(let k=0;k<5;k++){const y=cy-k*7;s+='<path class="'+(k===4?'x':'pl')+'" d="M'+R1(x-10)+' '+R1(y)+'L'+x+' '+R1(y-5)+'L'+R1(x+10)+' '+R1(y)+'L'+x+' '+R1(y+5)+'Z"/>';}n.push(nd(x,cy-28));});return {st:s,n:n};}
const hcol=(cx,cy,k,span)=>Array.from({length:k},(_,i)=>nd(cx,k===1?cy:cy-span/2+span*i/(k-1)));
const XR=(x,y,r,a,c)=>{const ca=Math.cos(a)*r,sa=Math.sin(a)*r;return '<path class="'+c+'" d="M'+R1(x-ca)+' '+R1(y-sa)+'L'+R1(x+ca)+' '+R1(y+sa)+'M'+R1(x+sa)+' '+R1(y-ca)+'L'+R1(x-sa)+' '+R1(y+ca)+'"/>';};
function v7Sourcing(){
  const cx=300,cy=290,r=150,N=280,ang=t=>.45*Math.sin(t*.25),B=.32,cb=Math.cos(B),sb=Math.sin(B);
  const nrm=v=>{const l=Math.hypot(v[0],v[1],v[2]);return v.map(q=>q/l);};
  const P=[],ga=Math.PI*(3-Math.sqrt(5));for(let i=0;i<N;i++){const y=1-2*(i+.5)/N,rr=Math.sqrt(1-y*y),th=i*ga;P.push([Math.cos(th)*rr,y,Math.sin(th)*rr]);}
  const pj=(p,a)=>{const ca=Math.cos(a),sa=Math.sin(a),X=p[0]*ca+p[2]*sa,Z=-p[0]*sa+p[2]*ca;return {x:cx+r*X,y:cy-r*(p[1]*cb+Z*sb),f:Z*cb-p[1]*sb};};
  const CAP=[nrm([.42,.5,.76]),nrm([-.6,.05,.8]),nrm([.45,-.55,.7])],CT=.935;
  const capOf=P.map(p=>{for(let c=0;c<3;c++)if(p[0]*CAP[c][0]+p[1]*CAP[c][1]+p[2]*CAP[c][2]>CT)return c;return -1;});
  const M=[];for(let i=11;i<N&&M.length<4;i+=61)if(capOf[i]<0)M.push(i);
  const SX=620,TY=190,PY=390,OX=664,TO=nd(OX,TY),PO=nd(OX,PY),TIN=[SX-34,TY-14],PIN=[SX-34,PY-12];
  const th=racks(SX,TY+14),ca=grid(plane(979,290,200,280),6,8); /* experiment: grid +59 (was 920) so the stage's right edge lines up with the others */
  const towerN=[];[-14,14].forEach(dx=>{for(let k=0;k<4;k++)towerN.push(nd(SX+dx,PY-24+k*16));});
  const sheetIn=[nd(901,232),nd(901,350)];
  const REM=[3,8,14,19,26,31,37,44],hyT=i=>.44+.14*((i%6)/5)+.02*((i/6|0)/7);
  let S=ELL(cx,cy,r,r,'pl');
  S+=th.st+LNS(th.n.map(q=>[q,TO]),'e')+DOT(TO.x,TO.y,2.4,'tg');
  S+=[-14,14].map(dx=>LN(SX+dx,PY-24,SX+dx,PY+24,'pl')).join('')+towerN.map(q=>DOT(q.x,q.y,2.2,'tg')).join('')+LNS(towerN.map(q=>[q,PO]),'e')+DOT(PO.x,PO.y,2.4,'tg');
  S+=LN(TO.x,TO.y,sheetIn[0].x,sheetIn[0].y,'e3')+LN(PO.x,PO.y,sheetIn[1].x,sheetIn[1].y,'e3');
  S+=outl(ca,'pl')+TT(cx,476,'ALL POSTS','cp')+TT(SX,138,'THUNDER','cp')+TT(SX,446,'PHOENIX','cp');
  const quad=(a,c,b)=>'M'+R1(a[0])+' '+R1(a[1])+'Q'+R1(c[0])+' '+R1(c[1])+' '+R1(b[0])+' '+R1(b[1]);
  const LY=ca.cy+ca.H/2+ca.W*.15+24,L=10;
  /* highlighted post (scrubbed, q 0 → 1): appears on the globe, goes out of network via
     Phoenix, lands in grid cell HI, is hydrated and survives the filter */
  const HI=21,HP0=[390,345],HC=[488,418];
  const anchors={post:HP0,live:HP0,thunder:[SX+26,TY-16],phoenix:[SX+14,PY+24],node:[ca.n[HI].x,ca.n[HI].y]};
  return {st:S,anchors,dyn:(t,q)=>{const SCRUB=q!==undefined,ph=SCRUB?q*.86:((t%L)+L)%L/L,f=clamp(ph*2.6),fillN=Math.floor(f*48),a=ang(t),PP=P.map(p=>pj(p,a)),flow=ph<.4;let s='';
    PP.forEach((q,i)=>{if(capOf[i]>=0){if(q.f>0)s+=XP(q.x,q.y,2.2,'xs');}else s+=DOT(q.x,q.y,q.f>0?1.1:.8,q.f>0?'tg':'dt');});
    CAP.forEach((c,k)=>{const q=pj(c,a);if(q.f<=.05)return;const cc=[(q.x+TIN[0])/2,Math.min(q.y,TIN[1])-40];
      s+='<path class="e3" d="'+quad([q.x,q.y],cc,TIN)+'"/>';if(flow)for(let j=0;j<2;j++){const u=(t*.35+j*.5+k*.17)%1,pp=qb([q.x,q.y],cc,TIN,u);s+=XP(pp[0],pp[1],2.4,'x');}});
    M.forEach((m,j)=>{const q=PP[m];if(q.f<=0)return;const cc=[(q.x+PIN[0])/2,Math.max(q.y,PIN[1])+30];
      s+='<path class="e3" d="'+quad([q.x,q.y],cc,PIN)+'"/>'+DOT(q.x,q.y,2.4,'tg');if(flow){const u=(t*.35+j*.29)%1,pp=qb([q.x,q.y],cc,PIN,u);s+=DOT(pp[0],pp[1],2,'tg');}});
    if(flow)for(let j=0;j<3;j++){const u=(t*.45+j/3)%1;s+=XP(lerp(TO.x,sheetIn[0].x,u),lerp(TO.y,sheetIn[0].y,u),2.4,'x');const v=(t*.45+j/3+.16)%1;s+=DOT(lerp(PO.x,sheetIn[1].x,v),lerp(PO.y,sheetIn[1].y,v),2,'tg');}
    const fo=ease(seg(ph,.68,.8));
    ca.n.forEach((q,i)=>{if(SCRUB&&i===HI&&q.live)return;if((i*29)%48>=fillN){s+=i%2?DOT(q.x,q.y,1.6,'dt'):XP(q.x,q.y,3.5,'xg');return;}
      const h=ease(seg(ph,hyT(i),hyT(i)+.05)),gone=REM.indexOf(i)>=0;
      if(h<=0){s+=i%2?DOT(q.x,q.y,2.6,'tg'):XP(q.x,q.y,4.5,'x');return;}
      const cls=gone&&fo>0?'xg':'x',op=gone?1-.75*fo:1;
      if(i%2&&h<1)s+=DOT(q.x,q.y,2.6*(1-h),'tg');
      s+='<g opacity="'+R1((i%2?h:1)*op*10)/10+'">'+XR(q.x,q.y,4.5,(i%2?Math.PI/4:h*Math.PI/4),cls)+'</g>';});
    if(SCRUB){const n=ca.n[HI];let p=null;
      if(q>=.04&&q<.14)p=HP0;
      else if(q>=.14&&q<.3)p=qb(HP0,HC,PIN,ease(seg(q,.14,.3)));
      else if(q>=.3&&q<.36){const v=seg(q,.3,.36);p=[lerp(PIN[0],PO.x,v),lerp(PIN[1],PO.y,v)];}
      else if(q>=.36&&q<.46)p=along([[PO.x,PO.y],[sheetIn[1].x,sheetIn[1].y],[n.x,n.y]],ease(seg(q,.36,.46)));
      anchors.live=p||(q>=.46?[n.x,n.y]:HP0);
      if(p)s+='<circle class="hr" cx="'+R1(p[0])+'" cy="'+R1(p[1])+'" r="7"/>'+DOT(p[0],p[1],3,'hb');
      if(q>=.46){const h=ease(seg(ph,hyT(HI),hyT(HI)+.05));
        s+='<circle class="hr" cx="'+R1(n.x)+'" cy="'+R1(n.y)+'" r="9"/>'+(h<=0?DOT(n.x,n.y,3,'hb'):XR(n.x,n.y,5,Math.PI/4,'xb'));}}
    const st=ph<.42?0:ph<.66?1:2;
    s+=TT(ca.cx-62,LY,'COLLECT','cp'+(st===0?' on':''))+TT(ca.cx,LY,'HYDRATE','cp'+(st===1?' on':''))+TT(ca.cx+62,LY,'FILTER','cp'+(st===2?' on':''));
    const T=st===0?[Math.round(f*1500).toLocaleString('en-US'),'CANDIDATES']:st===1?['+3','HYDRATED']:['×','FILTERED'];
    return s+RO(1000,60,T[0],T[1],[['+','thunder'],['•','phoenix'],['×','hydrated'],['faded ×','filtered out']]);}};
}
function v10Scoring(){
  /* experiment: columns pulled closer (was IN 140, C1 320, C2 470, heads 620, Σ 850, × 985,
     arrow 1110) so the stage spans the same width as Sourcing and Selection (~870 units)
     and shares their centre */
  const IN=hcol(188,290,6,250),C1=hcol(345,290,8,280),C2=hcol(481,290,8,280),HD=hcol(617,290,5,210);
  const SG=nd(826,290),DV=nd(961,290),EX=1066,HN=['P(like)','P(reply)','P(repost)','P(profile)','P(not int.)'];
  let S=LNS(C1.flatMap(q=>IN.map(p=>[p,q])),'e4')+LNS(C2.flatMap(q=>C1.map(p=>[p,q])),'e4')+LNS(HD.flatMap(q=>C2.map(p=>[p,q])),'e4');
  S+=LNS(HD.slice(0,4).map(q=>[nd(q.x+122,q.y),SG]),'e4')+LN(HD[4].x+92,HD[4].y,SG.x,SG.y,'fn');
  S+=LN(SG.x+16,SG.y,DV.x-16,DV.y,'pl')+LN(DV.x+16,DV.y,EX,DV.y,'pl')+'<path class="pl" d="M'+(EX-5)+' '+(DV.y-4)+'L'+EX+' '+DV.y+'L'+(EX-5)+' '+(DV.y+4)+'"/>';
  S+=IN.map(q=>XR(q.x,q.y,4.2,Math.PI/4,'x')).join('')+C1.concat(C2).map(q=>XP(q.x,q.y,4,'x')).join('');
  S+=HD.map((q,i)=>DOT(q.x,q.y,4.5,'oc')+TT(q.x+12,q.y+4,HN[i],'hk','start')).join('');
  S+=DOT(SG.x,SG.y,16,'oc')+TT(SG.x,SG.y+5.5,'Σ','sg')+DOT(DV.x,DV.y,16,'oc')+TT(DV.x,DV.y+5,'×','sg');
  S+=TT(IN[0].x,486,'CANDIDATES','cp')+TT((C1[0].x+C2[0].x)/2,486,'PHOENIX SCORER','cp')+TT(SG.x,486,'WEIGHTED SCORER','cp')+TT(DV.x,486,'AUTHOR DIVERSITY','cp');
  const SP=7,D=6.6,fr=x=>x-Math.floor(x);
  const post=k=>{const r=j=>fr(k*.618+j*.377+.13);return {i:(k*5+2)%6,a:(k*3+1)%8,b:(k*5+4)%8,
    v:[.06+.12*r(1),.01+.04*r(2),.01+.03*r(3),.02+.05*r(4),.002+.008*r(5)],S:.45+.5*r(6),rep:k%3===2};};
  const f2=v=>v<.01?v.toFixed(3).slice(1):v.toFixed(2).slice(1);
  /* scrubbed (U 0 → 1): only post 0 runs, drawn as the highlighted post */
  const anchors={post:[IN[2].x,IN[2].y],heads:[HD[4].x,HD[4].y],sigma:[SG.x,SG.y-16],div:[DV.x,DV.y-16]};
  return {st:S,anchors,dyn:(t,U)=>{const SCRUB=U!==undefined,mc=SCRUB?'xb':'x';if(SCRUB)t=U*D;let s='',atHead=null,atSig=null,atDiv=null;const k0=Math.floor(t/SP);
    if(SCRUB&&U<.08)s+='<circle class="hr" cx="'+IN[2].x+'" cy="'+IN[2].y+'" r="9"/>';
    for(let k=k0;k>k0-Math.ceil(D/SP)-1;k--){if(k<0)continue;const u=(t-k*SP)/D;if(u<0||u>1)continue;const p=post(k);
      const A=IN[p.i],B=C1[p.a],Cn=C2[p.b],op=1-seg(u,.78,.95),grow=(u0,u1)=>seg(u,u0,u1);
      let g='',m=null;
      if(u<.08)s+=DOT(A.x,A.y,8,'oc2');
      const g1=grow(.06,.2);if(g1>0)C1.forEach(q=>g+=LN(A.x,A.y,lerp(A.x,q.x,g1),lerp(A.y,q.y,g1),q===B?'trk':'trk2'));
      const g2=grow(.2,.34);if(g2>0)g+=LN(B.x,B.y,lerp(B.x,Cn.x,g2),lerp(B.y,Cn.y,g2),'trk');
      const g3=grow(.34,.46);if(g3>0)HD.forEach(q=>g+=LN(Cn.x,Cn.y,lerp(Cn.x,q.x,g3),lerp(Cn.y,q.y,g3),'trk'));
      const g4=grow(.5,.6);if(g4>0)HD.forEach((q,i)=>g+=LN(q.x+122,q.y,lerp(q.x+122,SG.x,g4),lerp(q.y,SG.y,g4),i===4?'fn':'trk'));
      const g5=grow(.64,.7);if(g5>0)g+=LN(SG.x+16,SG.y,lerp(SG.x+16,DV.x-16,g5),SG.y,'trk');
      if(op>0)s+='<g opacity="'+R1(op*10)/10+'">'+g+'</g>';
      if(u<.2)m=[lerp(A.x,B.x,ease(g1)),lerp(A.y,B.y,ease(g1))];
      else if(u<.34)m=[lerp(B.x,Cn.x,ease(g2)),lerp(B.y,Cn.y,ease(g2))];
      else if(u<.46)m=[lerp(Cn.x,HD[0].x,ease(g3)),lerp(Cn.y,(HD[0].y+HD[4].y)/2,ease(g3))];
      else if(u<.6){if(!atHead)atHead=p;}
      else if(u<.64){m=[SG.x,SG.y];}
      if(u>=.6&&u<.74&&!atSig)atSig=p;
      if(u>=.7&&u<.86&&!atDiv)atDiv=p;
      if(u>=.7){const x=lerp(DV.x,EX,ease(seg(u,.8,1)));if(u>=.8)m=[x,DV.y];}
      if(m&&!(u>=.46&&u<.8))s+=XR(m[0],m[1],4.5,Math.PI/4,mc);
      else if(m&&u>=.8)s+='<g opacity="'+R1((1-seg(u,.92,1))*10)/10+'">'+XR(m[0],m[1],4.5,Math.PI/4,mc)+'</g>';}
    if(atHead)HD.forEach((q,i)=>s+=DOT(q.x,q.y,2.2,'tg')+TT(q.x+92,q.y+4,f2(atHead.v[i]),'hv','start'));
    if(atSig)s+=DOT(SG.x,SG.y,20,'oc2')+TT(SG.x,SG.y+42,'S = '+atSig.S.toFixed(2),'sv');
    if(atDiv){const f=atDiv.rep?.55:1;s+=DOT(DV.x,DV.y,20,'oc2')+TT(DV.x,DV.y+42,'× '+f.toFixed(2),'sv')+TT(DV.x,DV.y+58,atDiv.rep?'repeat author':'new author','rk');}
    return s;}};
}
function v17Select(){
  const H=[220,190,165,145,128,113,99,86,74,63],n=H.length,K=6,SPAM=2,base=400,BW=24,BG=14,X0=80,perm=[6,2,8,0,4,9,1,5,3,7];
  const bx=i=>X0+i*(BW+BG),cutY=base-106,AY=290,G1=650,G2=672,FX=840,FW=110,SH=18,SG=10,slot=j=>[FX,AY-70+j*(SH+SG)];
  let S=LN(500,AY,590,AY,'pl')+'<path class="pl" d="M585 '+(AY-4)+'L590 '+AY+'L585 '+(AY+4)+'"/>';
  S+=LN(G1,200,G1,380,'gt')+LN(G2,200,G2,380,'gt')+LN(730,AY,800,AY,'pl')+'<path class="pl" d="M795 '+(AY-4)+'L800 '+AY+'L795 '+(AY+4)+'"/>';
  for(let j=0;j<K-1;j++){const p=slot(j);S+=RC(p[0],p[1],FW,SH,3,'xg');}
  S+=TT(270,476,'SELECTION','cp')+TT((G1+G2)/2,476,'POST-SELECTION FILTERS','cp')+TT(FX+FW/2,476,'FEED','cp');
  const L=9;
  /* scrubbed (q 0 → 1): rank HR is the highlighted post — above the cut, through the gate, into slot 2 */
  const HR=1,anchors={bar:[bx(HR)+BW/2,base-H[HR]],gate:[(G1+G2)/2,200],slot:[FX+FW,slot(HR)[1]+SH/2]};
  return {st:S,anchors,dyn:(t,q)=>{const SCRUB=q!==undefined,ph=SCRUB?q*.92:((t%L)+L)%L/L,rise=1/* experiment: bars always visible; sort / cut / flow brought forward so it is never idle */,srt=ease(seg(ph,.02,.14)),cut=seg(ph,.16,.22);let s='';
    for(let r=0;r<n;r++){const x=lerp(bx(perm.indexOf(r)),bx(r),srt),h=H[r]*rise,kept=r<K;if(h<.5)continue;
      s+='<rect class="'+(SCRUB&&r===HR?'xb':(!kept&&cut>0)?'xg':'x')+'" x="'+R1(x)+'" y="'+R1(base-h)+'" width="'+BW+'" height="'+R1(h)+'" rx="2"/>';}
    if(cut>0)s+='<g opacity="'+R1(cut*10)/10+'">'+LN(X0-10,cutY,bx(n-1)+BW+10,cutY,'gt')+'</g>';
    let drop=0;
    for(let r=0;r<K;r++){const st=.24+r*.08,u=seg(ph,st,st+.12);if(u<=0)continue;const top=[bx(r)+BW/2,base-H[r]],gate=[(G1+G2)/2,AY];
      if(r===SPAM){const a=seg(u,0,.6),d=seg(u,.6,1);drop=d;const m=a<1?along([top,[590,AY],gate],ease(a)):[gate[0],AY+d*100];if(d<1)s+='<g opacity="'+R1((1-.7*d)*10)/10+'">'+XR(m[0],m[1],4.5,Math.PI/4,d>0?'xg':'x')+'</g>';continue;}
      const j=r<SPAM?r:r-1,sl=slot(j),end=[sl[0]+FW/2,sl[1]+SH/2];
      const hc=SCRUB&&r===HR?'xb':'x';
      if(u<1){const m=along([top,[590,AY],gate,[800,AY],end],ease(u));s+=XR(m[0],m[1],4.5,Math.PI/4,hc);}else s+=RC(sl[0],sl[1],FW,SH,3,hc);}
    if(drop>0)s+='<g opacity="'+R1(Math.min(1,drop*2)*10)/10+'">'+TT((G1+G2)/2,AY+122,'removed','rk')+'</g>';
    return s;}};
}
/* ================= v31 · zoom through the globe, funnel lines erased to reveal the stages =================
   Overview (small, centred): the ALL POSTS globe on the left, posts flowing from it into a
   solid ring funnel, a few reaching the FEED slots on the right.
   Zoom in: the camera zooms into the globe until it is exactly the Sourcing stage's globe
   (same dots, same rotation, same size and place). Meanwhile the funnel turns to a skeleton
   and its lines are erased along their paths left → right (pen strokes), and the rest of the Sourcing stage (Thunder, Phoenix,
   the candidate grid) is revealed behind that front.
   Stage to stage: the outgoing stage moves left and fades, the incoming one comes in from
   the right (never more than two on screen). Selection is held to the end (no zoom out).  */
function v31Story(){
  const src0=v7Sourcing(),src={st:src0.st,anchors:src0.anchors,dyn:(t,q)=>{const s=src0.dyn(t,q),i=s.indexOf('<text class="rt"');return i>=0?s.slice(0,i):s;}};
  const SC=[src,v10Scoring(),v17Select()];
  const OFF=[15,-20,95],CX=600,CY=280,D=110;

  /* Emil's strong ease-in-out, cubic-bezier(0.77, 0, 0.175, 1) — stage-to-stage slides. */
  const bez=(x1,y1,x2,y2)=>{const A=(a,b)=>1-3*b+3*a,Bq=(a,b)=>3*b-6*a,C=a=>3*a,
    f=(t,a,b)=>((A(a,b)*t+Bq(a,b))*t+C(a))*t,df=(t,a,b)=>3*A(a,b)*t*t+2*Bq(a,b)*t+C(a);
    return x=>{if(x<=0)return 0;if(x>=1)return 1;let t=x;for(let i=0;i<6;i++){const d=df(t,x1,x2);if(Math.abs(d)<1e-6)break;t-=(f(t,x1,x2)-x)/d;}return f(clamp(t),y1,y2);};};
  const EIO=bez(.77,0,.175,1),fr=x=>x-Math.floor(x);

  /* ---- world geometry (overview), centred on x = 600 ---- */
  const GX=280,GR=68,X0=445,XS=565,XW=675,XE=775,X1=880,R0=95,RW=12,RE=75,EX=.17,SL=930,SR=990;
  /* anchors: the stage point that the world point turns into */
  const A0={w:[GX,CY],l:[300,290],r:150/GR};          /* sourcing globe centre (radius 150 vs 68) */
  const ZO=2.6,A2={w:[960,CY],l:[895,285],r:ZO};      /* selection feed slots, drawn ZO× smaller in the overview */
  const rad=x=>x<=XW?RW+(R0-RW)*Math.pow(clamp((XW-x)/(XW-X0)),1.7):RW+(RE-RW)*Math.pow(clamp((x-XW)/(X1-XW)),1.7);
  const RINGS=[];
  for(let i=0;i<=24;i++)RINGS.push(lerp(X0,XW,i/24));for(let i=1;i<=16;i++)RINGS.push(lerp(XW,X1,i/16));
  const RG=RINGS.map(x=>({x,c:x===X0||x===X1?'rim':Math.abs(x-XW)<18?'rw':'rf'})).concat([{x:XS,c:'mk'},{x:XE,c:'mk'}]);
  const pts=a=>a.map(p=>R1(p[0])+' '+R1(p[1])).join('L');
  const arc=(x,r,a0,a1)=>{const n=Math.max(2,Math.ceil(Math.abs(a1-a0)*8)),p=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;p.push([x+r*EX*Math.cos(a),CY+r*Math.sin(a)]);}return p;};
  const H=Math.PI/2;
  const PROF=Array.from({length:61},(_,i)=>lerp(X0,X1,i/60));
  const BODY='M'+pts(PROF.map(x=>[x,CY-rad(x)]))+'L'+pts(PROF.slice().reverse().map(x=>[x,CY+rad(x)]))+'Z';
  const sy=x=>{const v=(x-SL)/(SR-SL);return [CY-lerp(80,96,v),CY+lerp(74,86,v)];};
  /* feed slots: the selection stage's slots (x 840, w 110, h 18, every 28 from y 220) scaled by 1/ZO about the anchor */
  const wS=(lx,ly)=>[A2.w[0]+(lx-A2.l[0])/ZO,A2.w[1]+(ly-A2.l[1])/ZO];
  const slotC=j=>wS(895,229+j*28);
  let SCREEN='<path class="gs" d="M'+SL+' '+R1(sy(SL)[0])+'L'+SR+' '+R1(sy(SR)[0])+'L'+SR+' '+R1(sy(SR)[1])+'L'+SL+' '+R1(sy(SL)[1])+'Z"/>',SLOTS='';
  for(let j=0;j<5;j++){const p=wS(840,220+j*28);SLOTS+=RC(p[0],p[1],110/ZO,18/ZO,3/ZO,'xg');}
  const LABELS=TT(GX,425,'ALL POSTS','cp')+TT((X0+XS)/2,425,'SOURCING','cp')+TT(XW,425,'SCORING','cp')+TT((XE+X1)/2,425,'SELECTION','cp')+TT((SL+SR)/2,425,'FEED','cp');
  const GROUND='<path class="gl" d="M150 392Q600 418 1050 386"/>';

  /* ---- the overview as pen strokes ----
     Every line is a polyline that is traced along its own path (like a pen) on the way in and
     erased along its path on the way out. Each stroke owns a window of the progress 0 → 1;
     strokes are staggered left → right, rings trace round from the top (front half first,
     then the back half). Fills only exist once the lines are there. */
  const nr=x=>(x-X0)/(X1-X0);
  const poly=(p,cls,a,b,o)=>{const L=[0];for(let i=1;i<p.length;i++)L.push(L[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]));return {p,L,T:L[L.length-1]||1,cls,a,b,o};};
  const cut=(S,f0,f1)=>{if(f1<=f0+1e-4)return '';const T=S.T,l0=f0*T,l1=f1*T,p=S.p,L=S.L,out=[];
    const at=l=>{let i=1;while(i<L.length-1&&L[i]<l)i++;const v=L[i]===L[i-1]?0:(l-L[i-1])/(L[i]-L[i-1]);return [lerp(p[i-1][0],p[i][0],v),lerp(p[i-1][1],p[i][1],v)];};
    out.push(at(l0));for(let i=0;i<L.length;i++)if(L[i]>l0&&L[i]<l1)out.push(p[i]);out.push(at(l1));return 'M'+pts(out);};
  const ell=(x,r,a0,a1)=>{const n=Math.max(4,Math.ceil(Math.abs(a1-a0)*14)),q=[];for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n;q.push([x+r*EX*Math.cos(t),CY+r*Math.sin(t)]);}return q;};
  const STK=[];
  STK.push(poly(Array.from({length:41},(_,i)=>{const x=lerp(150,1050,i/40),v=i/40;return qb([150,392],[600,418],[1050,386],v);}),'gl',0,.9,'aux'));
  STK.push(poly(Array.from({length:73},(_,i)=>{const t=-H+i/72*2*Math.PI;return [GX+GR*Math.cos(t),CY+GR*Math.sin(t)];}),'pl',0,.28,'globe'));
  STK.push(poly(PROF.map(x=>[x,CY-rad(x)]),'pf',.14,.86,''),poly(PROF.map(x=>[x,CY+rad(x)]),'pf',.14,.86,''));
  RG.slice().sort((p,q)=>p.x-q.x).forEach(g=>{const o=.14+.56*nr(g.x),r=rad(g.x),rim=g.c==='rim',fc=rim||g.c==='mk'?'x':g.c;
    STK.push(poly(ell(g.x,r,-H,H),fc,o,o+.1,''));STK.push(poly(ell(g.x,r,H,3*H),rim?'x':'rb',o+.1,o+.16,rim?'':'back'));});
  const sq=[[SL,sy(SL)[0]],[SR,sy(SR)[0]],[SR,sy(SR)[1]],[SL,sy(SL)[1]],[SL,sy(SL)[0]]];
  STK.push(poly(sq,'gs',.72,.92,''));
  for(let j=0;j<5;j++){const q=wS(840,220+j*28),w=110/ZO,h=18/ZO;STK.push(poly([[q[0],q[1]],[q[0]+w,q[1]],[q[0]+w,q[1]+h],[q[0],q[1]+h],[q[0],q[1]]],'xg',.8+j*.03,.9+j*.02,''));}
  /* drawn: 0 → 1 traces every stroke in; erased: 0 → 1 erases them (globe outline excepted) */
  const strokes=(drawn,erased,solid)=>{let s='';
    if(solid>.01)s+='<path class="fw" d="'+BODY+'" opacity="'+solid.toFixed(2)+'"/><ellipse class="fin" cx="'+X0+'" cy="'+CY+'" rx="'+R1(R0*EX)+'" ry="'+R0+'" opacity="'+solid.toFixed(2)+'"/>';
    STK.forEach(S=>{const d=seg(drawn,S.a,S.b),e=S.o==='globe'?0:seg(erased,S.a,S.b);if(d<=e)return;
      const op=S.o==='back'?1-solid:1;if(op<.02)return;
      s+='<path class="'+S.cls+'" d="'+cut(S,e,d)+'"'+(op<1?' opacity="'+op.toFixed(2)+'"':'')+'/>';});
    return s;};
  /* world x of the erase front (rings left of it are gone) — the stage is revealed behind it */
  const eraseFront=er=>X0+(X1-X0)*clamp((er-.14)/.62)+(er>.76?(SR-X1+40)*seg(er,.76,.92):0);

  /* the ALL POSTS globe — the same points, caps and rotation as the Sourcing stage's globe,
     so at the end of the zoom it is that globe. Marks keep a constant screen size (÷Z). */
  const GN=280,GP=[],ga=Math.PI*(3-Math.sqrt(5)),cb=Math.cos(.32),sb=Math.sin(.32),gang=t=>.45*Math.sin(t*.25);
  for(let i=0;i<GN;i++){const y=1-2*(i+.5)/GN,rr=Math.sqrt(1-y*y),th=i*ga;GP.push([Math.cos(th)*rr,y,Math.sin(th)*rr]);}
  const nrm=v=>{const l=Math.hypot(v[0],v[1],v[2]);return v.map(q=>q/l);};
  const CAP=[nrm([.42,.5,.76]),nrm([-.6,.05,.8]),nrm([.45,-.55,.7])];
  const capOf=GP.map(p=>{for(let c=0;c<3;c++)if(p[0]*CAP[c][0]+p[1]*CAP[c][1]+p[2]*CAP[c][2]>.935)return c;return -1;});
  const globe=(t,Z)=>{const a=gang(t),ca=Math.cos(a),sa=Math.sin(a);let s='';
    GP.forEach((p,i)=>{const X=p[0]*ca+p[2]*sa,Zz=-p[0]*sa+p[2]*ca,f=Zz*cb-p[1]*sb,x=GX+GR*X,y=CY-GR*(p[1]*cb+Zz*sb);
      if(capOf[i]>=0){if(f>0)s+=XP(x,y,2.2/Z,'xs');}else s+=DOT(x,y,(f>0?1.1:.8)/Z,f>0?'tg':'dt');});return s;};

  /* posts: globe → funnel mouth; a few come out the far end into a feed slot */
  const NP=36,PT=Array.from({length:NP},(_,i)=>({ph:i/NP,s:(fr(i*.618+.21)*2-1),keep:i%6===0,slot:(i/6|0)%5}));
  const posts=(t,end)=>{let s='';PT.forEach(p=>{const u=fr(t*.07+p.ph);
    if(!end&&u<.42){const v=u/.42,th=p.s*1.05,a=[GX+GR*.9*Math.cos(th),CY+GR*.9*Math.sin(th)],b=[X0,CY+p.s*R0*.65],q=qb(a,[(a[0]+b[0])/2,a[1]],b,ease(v));
      s+=DOT(q[0],q[1],p.ph?1.4:2.4,p.ph?'tg':'hb',Math.min(seg(v,0,.15),1-seg(v,.88,1)));}
    if(end&&p.keep&&u>=.72){const v=(u-.72)/.28,a=[X1,CY+p.s*RE*.55],b=slotC(p.slot),q=qb(a,[(a[0]+b[0])/2,a[1]],b,ease(v));
      s+=DOT(q[0],q[1],p.ph?1.6:2.4,p.ph?'tg':'hb',Math.min(seg(v,0,.12),1-seg(v,.9,1)));}});return s;};

  /* ---- scroll timeline (P 0 → 1) ----
     overview hold · zoom into the globe · sourcing · → scoring · → selection, held to the end */
  /* overview · zoom · sourcing story · → · scoring story · → · selection story (held to the end).
     In each story window the highlighted post is scrubbed through the stage (q 0 → 1). */
  const TR=[[.05,.18],[.38,.45],[.65,.72]],HW=[[.18,.38],[.45,.65],[.72,.95]];
  const chapter=P=>P<.115?0:P<.415?1:P<.685?2:3;

  /* ---- stage progress (as on main) ----
     Each stage's story (highlighted post, notes, leaders) is scrubbed by the scroll: q 0 → 1
     across its window HW[j]. ACT: the stage's notes may show (window plus a short tail in
     which notes that run to the end of the stage write themselves out). */
  const QS=[0,0,0],ACT=[false,false,false],TAILP=.03;
  const stageQ=P=>{for(let j=0;j<3;j++){QS[j]=seg(P,HW[j][0],HW[j][1]);ACT[j]=P>=HW[j][0]-.005&&(j===2||P<=HW[j][1]+TAILP);}};
  const OUT=u=>1-seg(u,0,.55),IN=u=>seg(u,.45,1),EDGE=140;

  /* ---- notes ----
     Short explanations, shown one at a time as the highlighted post reaches each point.
     Text is HTML over the SVG (SectionTwo.tsx, typewriter); the page measures where each text
     actually sits (setRects) and the leader is drawn from the text edge facing the anchor:
     a short horizontal stub towards the anchor, then straight to it, ending in a dot.
     Coordinates are SVG units. Copy is the step names of the client's pipeline figure, one short line each; one note at a time. */
  const AN=(j,a)=>[SC[j].anchors[a][0]+OFF[j],SC[j].anchors[a][1]];
  const NOTE=(id,st,text,a,x,y,w,win)=>({id,st,text,a,x,y,w,win});
  const NOTES=[
    NOTE('n1a',1,'Candidate sources',()=>AN(0,'live'),486,462,200,[.02,.14]),
    NOTE('n1t',1,'In-network',AN(0,'thunder'),700,96,160,[.14,.26]),
    NOTE('n1b',1,'Out-of-network',AN(0,'phoenix'),700,494,200,[.26,.46]),
    NOTE('n1c',1,'Candidate hydration',AN(0,'node'),1100,250,125,[.46,.77]),
    NOTE('n1d',1,'Pre-scoring filters',AN(0,'node'),1100,250,125,[.77,1]),
    NOTE('n2b',2,'Scoring',AN(1,'heads'),640,500,200,[.3,.62]),
    NOTE('n2c',2,'Weighted sum',AN(1,'sigma'),866,170,200,[.62,1]),
    NOTE('n3a',3,'Selection',AN(2,'bar'),300,70,200,[.1,.33]),
    NOTE('n3b',3,'Post-selection filters',AN(2,'gate'),806,110,200,[.33,.47]),
    NOTE('n3c',3,'Ranked For You timeline',AN(2,'slot'),1084,300,110,[.47,1]),
  ];
  /* note progress 0 → 1 by scroll: writes in over the start of its window, out over the end
     (a note that runs to the end of its stage writes out in the stage's tail instead) */
  const noteProg=(P,I)=>{const out={};if(I<1)return out;const c=chapter(P);if(!c)return out;const j=c-1;if(!ACT[j])return out;stageQ(P);const q=QS[j];
    NOTES.forEach(n=>{if(n.st!==c)return;const w0=n.win[0],w1=n.win[1],len=w1-w0;
      const a=seg(q,w0,w0+Math.min(.12,len*.45));
      const b=w1<1?1-seg(q,w1-Math.min(.05,len*.2),w1):(j<2?1-seg(P,HW[j][1],HW[j][1]+TAILP):1);
      const p=Math.min(a,b);if(p>0)out[n.id]=p;});return out;};
  const visible=(P,I)=>new Set(Object.keys(noteProg(P,I)));
  /* rects: { id: [left, top, right, bottom] } in SVG units, measured by the page */
  let RECTS={},LDR={};
  const anc=n=>typeof n.a==='function'?n.a():n.a;
  const leaderOf=n=>{const r=RECTS[n.id]||[n.x,n.y,n.x+n.w,n.y+40],a=anc(n),y=r[1]+10;
    const right=a[0]>r[2]?1:a[0]<r[0]?0:(a[0]>(r[0]+r[2])/2?1:0);
    const sx=right?r[2]+10:r[0]-10,room=Math.abs(a[0]-sx),stub=Math.min(18,room*.45)*(right?1:-1);
    return poly([[sx,y],[sx+stub,y],a],'ld',0,1,'');};
  const setRects=R=>{RECTS=R||{};LDR={};};
  /* leaders draw with the note's progress: the line over its first 45%, then the text types */
  const leaders=prog=>{let s='';
    NOTES.forEach(n=>{const p=prog[n.id]||0;if(p<=0)return;const l=seg(p,0,.45);
      const live=typeof n.a==='function',L=live?leaderOf(n):LDR[n.id]||(LDR[n.id]=leaderOf(n)),e=ease(l),a=anc(n);
      s+='<path class="ld" d="'+cut(L,0,e)+'"/>';if(e>=1)s+=DOT(a[0],a[1],1.8,'ldd');});
    return s;};

  /* soft-edged reveal mask for the Sourcing stage, in its own coordinates */
  const MASK=id=>'<linearGradient id="'+id+'g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>'+
    '<mask id="'+id+'" maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="7000" height="7000"><rect x="-3000" y="-3000" width="7000" height="7000" fill="url(#'+id+'g)"/></mask>';
  let ST='<defs>'+MASK('mg')+'</defs>';
  ST+='<g id="wG"><g id="wL">'+LABELS+'</g><g id="wQ"></g><g id="wF"></g><g id="wE"></g><g id="wGl"></g></g>';
  SC.forEach((S,k)=>ST+='<g id="sg'+k+'" style="opacity:0">'+S.st+'<g id="sd'+k+'"></g></g>');
  ST+='<g id="ovG"></g>';

  let E=null,frame=0,lastHint='',lastF='';
  /* I = the diagram drawing itself in (0 → 1) before the scroll story starts */
  return {st:ST,notes:NOTES.map(n=>({id:n.id,text:n.text,x:n.x,y:n.y,w:n.w})),visible,noteProg,chapter,setRects,dyn:(t,P,B,RM,I)=>{P=P||0;B=B||1;I=I===undefined?1:I;
    if(!E||!E.w.isConnected){const q=id=>svg.querySelector('#'+id);
      E={w:q('wG'),l:q('wL'),q:q('wQ'),f:q('wF'),e:q('wE'),gl:q('wGl'),ov:q('ovG'),mg:q('mgg'),
         sg:[0,1,2].map(k=>q('sg'+k)),sd:[0,1,2].map(k=>q('sd'+k))};}
    stageQ(P);
    const u=TR.map(r=>seg(P,r[0],r[1])),e=u.map(EIO),M=RM?0:1,v=u[0];
    const inWorld=P<TR[0][1];
    const setG=(g,a,b)=>{g.setAttribute('x1',R1(a));g.setAttribute('x2',R1(b));};

    /* camera on the zoom: the globe's screen position eases from the overview to where the
       stage globe sits, while Z grows exponentially to the radius ratio — so the overview
       globe becomes the Sourcing globe */
    /* experiment: the overview sits at Z0 (scaled about the centre) so it spans the same width
       as the three stages; the zoom starts from there and still lands on the Sourcing globe */
    const Z0=1.12,SX0=[CX+Z0*(A0.w[0]-CX),CY+Z0*(A0.w[1]-CY)];
    let Z=Z0,sx=SX0,cx=A0.w[0]-(SX0[0]-CX)/Z0,cy=A0.w[1]-(SX0[1]-CY)/Z0;
    const S0=[CX+(A0.l[0]-(CX-OFF[0]))*B,CY+(A0.l[1]-CY)*B],Zend=A0.r*B;
    if(inWorld&&!RM){const zc=ease(v);Z=Math.exp(lerp(Math.log(Z0),Math.log(Zend),zc));sx=[lerp(SX0[0],S0[0],zc),lerp(SX0[1],S0[1],zc)];cx=A0.w[0]-(sx[0]-CX)/Z;cy=A0.w[1]-(sx[1]-CY)/Z;}

    /* pen progress: draw in during the intro; on the zoom the fill goes first, then the lines erase */
    const drawn=RM?1:I,erased=RM?0:seg(v,.1,.85),solid=I<1?seg(I,.88,1):1-seg(v,0,.15);
    const aux=I<1?seg(I,.85,1):1-seg(v,0,.25);

    svg.setAttribute('viewBox','0 0 1200 560');
    E.w.style.display=inWorld&&I>0?'':'none';
    if(inWorld&&I>0){
      E.w.setAttribute('transform','translate('+CX+' '+CY+') scale('+Z.toFixed(4)+') translate('+R1(-cx)+' '+R1(-cy)+')');
      E.l.style.opacity=aux.toFixed(3);E.q.style.opacity=aux.toFixed(3);E.e.style.opacity=aux.toFixed(3);
      E.gl.style.opacity=(I<1?seg(I,.08,.35):1-seg(v,.85,1)).toFixed(3);
      const key=drawn.toFixed(4)+'|'+erased.toFixed(4)+'|'+solid.toFixed(2);if(key!==lastF){E.f.innerHTML=strokes(drawn,erased,solid);lastF=key;}}

    /* stages */
    const op=[Math.min(seg(v,.25,.6),OUT(u[1])),Math.min(IN(u[1]),OUT(u[2])),IN(u[2])];
    if(RM)op[0]=Math.min(IN(v),OUT(u[1]));
    const dx=[-D*e[1],D*(1-e[1]-e[2]),D*(1-e[2])];
    op.forEach((o,j)=>{const g=E.sg[j],on=o>.001;g.style.opacity=o.toFixed(3);g.style.display=on?'':'none';if(!on)return;
      if(j===0&&inWorld&&!RM){/* ride the world globe, revealed behind the erase front */
        const sc=Z/A0.r,fs=CX+(eraseFront(erased)-cx)*Z,fl=A0.l[0]+(fs-sx[0])/sc;
        g.setAttribute('transform','translate('+R1(sx[0])+' '+R1(sx[1])+') scale('+sc.toFixed(4)+') translate('+(-A0.l[0])+' '+(-A0.l[1])+')');
        setG(E.mg,fl,fl+EDGE);g.setAttribute('mask','url(#mg)');}
      else{g.removeAttribute('mask');
        g.setAttribute('transform','translate('+R1(CX+dx[j]*M)+' '+CY+') scale('+B.toFixed(4)+') translate('+(-(CX-OFF[j]))+' '+(-CY)+')');}});

    frame++;
    if(frame%2===0){
      if(inWorld&&I>0){E.gl.innerHTML=globe(t,Z);if(aux>.01){E.q.innerHTML=posts(t,false);E.e.innerHTML=posts(t,true);}}
      SC.forEach((S,j)=>{if(op[j]>.001)E.sd[j].innerHTML=S.dyn(t+j*3.1,QS[j]);});}
    const hs=leaders(noteProg(P,I)); /* experiment: no "scroll to look inside" hint */
    if(hs!==lastHint){E.ov.innerHTML=hs;lastHint=hs;}
    return '';}};
}
  const story = v31Story();
  return {
    /** static markup for the <svg> */
    markup: story.st,
    /** advance one frame: t = seconds (looping micro-animation), P = scroll progress 0–1, B = zoom boost for stages, reduced = prefers-reduced-motion */
    render: (t, P, B, reduced, intro) => story.dyn(t, P, B, reduced, intro),
    /** chapter: 0 overview, 1 sourcing, 2 scoring, 3 selection (switches mid-transition) */
    chapter: story.chapter,
    /** notes: { id, text, x, y, w } in SVG units — the page renders the text */
    notes: story.notes,
    /** measured text boxes { id: [l, t, r, b] } in SVG units; leaders start from them */
    setRects: (r) => story.setRects(r),
    /** { id: progress 0–1 } of the callouts at P: leader over the first 45%, text after */
    noteProgress: (P, I) => story.noteProg(P, I),
    /** ids of the callouts visible at P (I = intro progress) */
    visible: (P, I) => story.visible(P, I),
  };
}
