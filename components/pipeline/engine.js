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
  const th=racks(SX,TY+14),ca=grid(plane(920,290,200,280),6,8);
  const towerN=[];[-14,14].forEach(dx=>{for(let k=0;k<4;k++)towerN.push(nd(SX+dx,PY-24+k*16));});
  const sheetIn=[nd(842,232),nd(842,350)];
  const REM=[3,8,14,19,26,31,37,44],hyT=i=>.44+.14*((i%6)/5)+.02*((i/6|0)/7);
  let S=ELL(cx,cy,r,r,'pl');
  S+=th.st+LNS(th.n.map(q=>[q,TO]),'e')+DOT(TO.x,TO.y,2.4,'tg');
  S+=[-14,14].map(dx=>LN(SX+dx,PY-24,SX+dx,PY+24,'pl')).join('')+towerN.map(q=>DOT(q.x,q.y,2.2,'tg')).join('')+LNS(towerN.map(q=>[q,PO]),'e')+DOT(PO.x,PO.y,2.4,'tg');
  S+=LN(TO.x,TO.y,sheetIn[0].x,sheetIn[0].y,'e3')+LN(PO.x,PO.y,sheetIn[1].x,sheetIn[1].y,'e3');
  S+=outl(ca,'pl')+TT(cx,476,'ALL POSTS','cp')+TT(SX,138,'THUNDER','cp')+TT(SX,446,'PHOENIX','cp');
  const quad=(a,c,b)=>'M'+R1(a[0])+' '+R1(a[1])+'Q'+R1(c[0])+' '+R1(c[1])+' '+R1(b[0])+' '+R1(b[1]);
  const LY=ca.cy+ca.H/2+ca.W*.15+24,L=10;
  return {st:S,dyn:t=>{const ph=((t%L)+L)%L/L,f=clamp(ph*2.6),fillN=Math.floor(f*48),a=ang(t),PP=P.map(p=>pj(p,a)),flow=ph<.4;let s='';
    PP.forEach((q,i)=>{if(capOf[i]>=0){if(q.f>0)s+=XP(q.x,q.y,2.2,'xs');}else s+=DOT(q.x,q.y,q.f>0?1.1:.8,q.f>0?'tg':'dt');});
    CAP.forEach((c,k)=>{const q=pj(c,a);if(q.f<=.05)return;const cc=[(q.x+TIN[0])/2,Math.min(q.y,TIN[1])-40];
      s+='<path class="e3" d="'+quad([q.x,q.y],cc,TIN)+'"/>';if(flow)for(let j=0;j<2;j++){const u=(t*.35+j*.5+k*.17)%1,pp=qb([q.x,q.y],cc,TIN,u);s+=XP(pp[0],pp[1],2.4,'x');}});
    M.forEach((m,j)=>{const q=PP[m];if(q.f<=0)return;const cc=[(q.x+PIN[0])/2,Math.max(q.y,PIN[1])+30];
      s+='<path class="e3" d="'+quad([q.x,q.y],cc,PIN)+'"/>'+DOT(q.x,q.y,2.4,'tg');if(flow){const u=(t*.35+j*.29)%1,pp=qb([q.x,q.y],cc,PIN,u);s+=DOT(pp[0],pp[1],2,'tg');}});
    if(flow)for(let j=0;j<3;j++){const u=(t*.45+j/3)%1;s+=XP(lerp(TO.x,sheetIn[0].x,u),lerp(TO.y,sheetIn[0].y,u),2.4,'x');const v=(t*.45+j/3+.16)%1;s+=DOT(lerp(PO.x,sheetIn[1].x,v),lerp(PO.y,sheetIn[1].y,v),2,'tg');}
    const fo=ease(seg(ph,.68,.8));
    ca.n.forEach((q,i)=>{if((i*29)%48>=fillN){s+=i%2?DOT(q.x,q.y,1.6,'dt'):XP(q.x,q.y,3.5,'xg');return;}
      const h=ease(seg(ph,hyT(i),hyT(i)+.05)),gone=REM.indexOf(i)>=0;
      if(h<=0){s+=i%2?DOT(q.x,q.y,2.6,'tg'):XP(q.x,q.y,4.5,'x');return;}
      const cls=gone&&fo>0?'xg':'x',op=gone?1-.75*fo:1;
      if(i%2&&h<1)s+=DOT(q.x,q.y,2.6*(1-h),'tg');
      s+='<g opacity="'+R1((i%2?h:1)*op*10)/10+'">'+XR(q.x,q.y,4.5,(i%2?Math.PI/4:h*Math.PI/4),cls)+'</g>';});
    const st=ph<.42?0:ph<.66?1:2;
    s+=TT(ca.cx-62,LY,'COLLECT','cp'+(st===0?' on':''))+TT(ca.cx,LY,'HYDRATE','cp'+(st===1?' on':''))+TT(ca.cx+62,LY,'FILTER','cp'+(st===2?' on':''));
    const T=st===0?[Math.round(f*1500).toLocaleString('en-US'),'CANDIDATES']:st===1?['+3','HYDRATED']:['×','FILTERED'];
    return s+RO(1000,60,T[0],T[1],[['+','thunder'],['•','phoenix'],['×','hydrated'],['faded ×','filtered out']]);}};
}
function v10Scoring(){
  const IN=hcol(140,290,6,250),C1=hcol(320,290,8,280),C2=hcol(470,290,8,280),HD=hcol(620,290,5,210);
  const SG=nd(850,290),DV=nd(985,290),EX=1110,HN=['P(like)','P(reply)','P(repost)','P(profile)','P(not int.)'];
  let S=LNS(C1.flatMap(q=>IN.map(p=>[p,q])),'e4')+LNS(C2.flatMap(q=>C1.map(p=>[p,q])),'e4')+LNS(HD.flatMap(q=>C2.map(p=>[p,q])),'e4');
  S+=LNS(HD.slice(0,4).map(q=>[nd(q.x+122,q.y),SG]),'e4')+LN(HD[4].x+92,HD[4].y,SG.x,SG.y,'fn');
  S+=LN(SG.x+16,SG.y,DV.x-16,DV.y,'pl')+LN(DV.x+16,DV.y,EX,DV.y,'pl')+'<path class="pl" d="M'+(EX-5)+' '+(DV.y-4)+'L'+EX+' '+DV.y+'L'+(EX-5)+' '+(DV.y+4)+'"/>';
  S+=IN.map(q=>XR(q.x,q.y,4.2,Math.PI/4,'x')).join('')+C1.concat(C2).map(q=>XP(q.x,q.y,4,'x')).join('');
  S+=HD.map((q,i)=>DOT(q.x,q.y,4.5,'oc')+TT(q.x+12,q.y+4,HN[i],'hk','start')).join('');
  S+=DOT(SG.x,SG.y,16,'oc')+TT(SG.x,SG.y+5.5,'Σ','sg')+DOT(DV.x,DV.y,16,'oc')+TT(DV.x,DV.y+5,'×','sg');
  S+=TT(140,486,'CANDIDATES','cp')+TT(420,486,'PHOENIX SCORER','cp')+TT(SG.x,486,'WEIGHTED SCORER','cp')+TT(DV.x,486,'AUTHOR DIVERSITY','cp');
  const SP=7,D=6.6,fr=x=>x-Math.floor(x);
  const post=k=>{const r=j=>fr(k*.618+j*.377+.13);return {i:(k*5+2)%6,a:(k*3+1)%8,b:(k*5+4)%8,
    v:[.06+.12*r(1),.01+.04*r(2),.01+.03*r(3),.02+.05*r(4),.002+.008*r(5)],S:.45+.5*r(6),rep:k%3===2};};
  const f2=v=>v<.01?v.toFixed(3).slice(1):v.toFixed(2).slice(1);
  return {st:S,dyn:t=>{let s='',atHead=null,atSig=null,atDiv=null;const k0=Math.floor(t/SP);
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
      if(m&&!(u>=.46&&u<.8))s+=XR(m[0],m[1],4.5,Math.PI/4,'x');
      else if(m&&u>=.8)s+='<g opacity="'+R1((1-seg(u,.92,1))*10)/10+'">'+XR(m[0],m[1],4.5,Math.PI/4,'x')+'</g>';}
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
  S+=TT(270,476,'TOP-K BY SCORE','cp')+TT((G1+G2)/2,476,'VISIBILITY FILTER','cp')+TT(FX+FW/2,476,'FEED','cp');
  const L=9;
  return {st:S,dyn:t=>{const ph=((t%L)+L)%L/L,rise=ease(seg(ph,0,.08)),srt=ease(seg(ph,.1,.24)),cut=seg(ph,.27,.34);let s='';
    for(let r=0;r<n;r++){const x=lerp(bx(perm.indexOf(r)),bx(r),srt),h=H[r]*rise,kept=r<K;if(h<.5)continue;
      s+='<rect class="'+((!kept&&cut>0)?'xg':'x')+'" x="'+R1(x)+'" y="'+R1(base-h)+'" width="'+BW+'" height="'+R1(h)+'" rx="2"/>';}
    if(cut>0)s+='<g opacity="'+R1(cut*10)/10+'">'+LN(X0-10,cutY,bx(n-1)+BW+10,cutY,'gt')+'</g>';
    let drop=0;
    for(let r=0;r<K;r++){const st=.38+r*.07,u=seg(ph,st,st+.12);if(u<=0)continue;const top=[bx(r)+BW/2,base-H[r]],gate=[(G1+G2)/2,AY];
      if(r===SPAM){const a=seg(u,0,.6),d=seg(u,.6,1);drop=d;const m=a<1?along([top,[590,AY],gate],ease(a)):[gate[0],AY+d*100];if(d<1)s+='<g opacity="'+R1((1-.7*d)*10)/10+'">'+XR(m[0],m[1],4.5,Math.PI/4,d>0?'xg':'x')+'</g>';continue;}
      const j=r<SPAM?r:r-1,sl=slot(j),end=[sl[0]+FW/2,sl[1]+SH/2];
      if(u<1){const m=along([top,[590,AY],gate,[800,AY],end],ease(u));s+=XR(m[0],m[1],4.5,Math.PI/4,'x');}else s+=RC(sl[0],sl[1],FW,SH,3,'x');}
    if(drop>0)s+='<g opacity="'+R1(Math.min(1,drop*2)*10)/10+'">'+TT((G1+G2)/2,AY+122,'removed','rk')+'</g>';
    return s;}};
}
/* ================= v26 · funnel stretches with the stages, closes like before ================= */
function v26Story(){
  const src0=v7Sourcing(),src={st:src0.st,dyn:t=>{const s=src0.dyn(t),i=s.indexOf('<text class="rt"');return i>=0?s.slice(0,i):s;}};
  const sco=v10Scoring(),sel=v17Select(),SC=[src,sco,sel];
  const K=.42,OC=[0,1046,1517],OF=[0,1012,2104],ZO=.58;
  const cy=290,X0=800,Xa=1772,X1=1815,R0=250,Ra=72,Rn=72,ER=.3;
  const P2=(x,r,a)=>[x+r*ER*Math.cos(a),cy+r*Math.sin(a)];
  const arc=(x,r,a0,a1,n)=>{const p=[];for(let i=0;i<=n;i++)p.push(P2(x,r,a0+(a1-a0)*i/n));return p;};
  const pth=(pts,c,z)=>'<path class="'+c+'" d="M'+pts.map(p=>R1(p[0])+' '+R1(p[1])).join('L')+(z?'Z':'')+'"/>';
  const H=Math.PI/2,rc=x=>lerp(R0,Ra,(x-X0)/(Xa-X0));
  const top=[[X0,cy-R0],[Xa,cy-Ra],[X1,cy-Rn]],bot=top.map(p=>[p[0],2*cy-p[1]]).reverse();
  let F=pth(top.concat(arc(X1,Rn,-H,H,24),bot,arc(X0,R0,H,-H,40)),'fw',1)+pth(top,'x')+pth(bot,'x');
  [-.7,0,.7].forEach(a=>F+=pth([P2(X0,R0,a),P2(Xa,Ra,a)],'pl'));
  {const x=lerp(X0,Xa,.5),r=rc(x);F+=pth(arc(x,r,-H,H,30),'x');for(let k=-6;k<=6;k++){const p=P2(x+8,r*.985,k*.24);F+=DOT(p[0],p[1],2,'tg');}}
  F+=pth(arc(Xa,Ra,-H,H,24),'x')+pth(arc(X0,R0,0,2*Math.PI,90),'mouth',1)+pth(arc(X0+6,R0*.9,0,2*Math.PI,90),'pl',1)+pth(arc(X1,Rn,0,2*Math.PI,40),'endo',1);
  const FL=X0-R0*ER,FR=X1+Rn*ER;
  let ST='<defs><linearGradient id="gM" gradientUnits="userSpaceOnUse" x1="'+FL+'" y1="0" x2="'+(X0+10)+'" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>'+
    '<linearGradient id="gE" gradientUnits="userSpaceOnUse" x1="'+X1+'" y1="0" x2="'+FR+'" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'+
    '<clipPath id="cw" clipPathUnits="userSpaceOnUse"><rect id="cwr" x="'+(FL-6)+'" y="-2000" width="'+(FR-FL+20)+'" height="5000"/></clipPath></defs>';
  ST+='<g id="scnG" class="scn"><path id="cl1" class="e3" d=""/><path id="cl2" class="e3" d=""/><g id="dfl"></g>';
  SC.forEach((S,k)=>ST+='<g id="sg'+k+'">'+S.st+'<g id="sd'+k+'"></g></g>');
  ST+='</g><g id="funG" clip-path="url(#cw)">'+F+'</g><g id="ovG"></g>';
  /* camera: zoom only on the way in and the way out, flat pans in between */
  const KP=[0,.24,.5,.76,1],KX=[1035,600,OF[1]+560,OF[2]+515,1035];
  const cr=(p0,p1,p2,p3,u)=>.5*(2*p1+(-p0+p2)*u+(2*p0-5*p1+4*p2-p3)*u*u+(-p0+3*p1-3*p2+p3)*u*u*u);
  const spl=(A,P)=>{let i=0;while(i<KP.length-2&&P>KP[i+1])i++;const u=clamp((P-KP[i])/(KP[i+1]-KP[i])),g=k=>A[Math.max(0,Math.min(A.length-1,k))];return cr(g(i-1),g(i),g(i+1),g(i+2),u);};
  const zAt=P=>P<.24?Math.exp(lerp(Math.log(ZO),0,ease(P/.24))):P>.76?Math.exp(lerp(0,Math.log(ZO),ease((P-.76)/.24))):1;
  const CH=['OVERVIEW','01  SOURCING','02  SCORING','03  SELECTION','OVERVIEW'];
  let E=null,frame=0,lastHud='';
  return {st:ST,dyn:(t,P,B)=>{P=P||0;B=B||1;
    if(!E||!E.scn.isConnected){const q=id=>svg.querySelector('#'+id);E={scn:q('scnG'),fl:q('dfl'),fun:q('funG'),cw:q('cwr'),ov:q('ovG'),c1:q('cl1'),c2:q('cl2'),sg:[0,1,2].map(k=>q('sg'+k)),sd:[0,1,2].map(k=>q('sd'+k))};}
    const cx=spl(KX,P),z=zAt(P);B=1+(B-1)*ease(clamp((z-ZO)/(1-ZO)));const w=1200/(z*B),h=560/(z*B),vx=cx-w/2,vy=280-h/2;
    svg.setAttribute('viewBox',R1(vx)+' '+R1(vy)+' '+R1(w)+' '+R1(h));
    const m=ease(clamp((z-ZO)/(1-ZO))),sk=[1,lerp(K,1,m),lerp(K,1,m)],ox=[0,lerp(OC[1],OF[1],m),lerp(OC[2],OF[2],m)];
    for(let k=1;k<3;k++)E.sg[k].setAttribute('transform','translate('+R1(ox[k])+' '+cy+') scale('+sk[k].toFixed(4)+') translate(0 '+(-cy)+')');
    const a1=[1022,290],b1=[ox[1]+128*sk[1],290],a2=[ox[1]+1112*sk[1],290],b2=[ox[2]+66*sk[2],290+10*sk[2]];
    E.c1.setAttribute('d','M'+R1(a1[0])+' '+a1[1]+'L'+R1(b1[0])+' '+b1[1]);E.c2.setAttribute('d','M'+R1(a2[0])+' '+a2[1]+'L'+R1(b2[0])+' '+R1(b2[1]));
    E.scn.style.setProperty('--to',clamp((z-.66)/.3).toFixed(2));
    E.fun.setAttribute('transform','translate('+X0+' 0) scale('+lerp(1,(2800-X0)/(X1-X0),m).toFixed(4)+' 1) translate('+(-X0)+' 0)');
    const wipe=ease(seg(z,.64,1));
    if(wipe>=.999)E.fun.style.display='none';else{E.fun.style.display='';const L=lerp(FL-6,FR+8,wipe);E.cw.setAttribute('x',R1(L));E.cw.setAttribute('width',R1(FR+12-L));}
    frame++;
    if(frame%2===0){
      SC.forEach((S,k)=>{const x0=k?ox[k]:0,wd=1200*sk[k],vis=!(x0+wd<vx||x0>vx+w);E.sg[k].style.display=vis?'':'none';
        if(vis&&!(wipe<.02&&k>0))E.sd[k].innerHTML=S.dyn(t+k*3.1);});
      let f='';if(wipe>.02)[[a1,b1],[a2,b2]].forEach(sg=>{for(let j=0;j<2;j++){const u=(t*.22+j/2)%1;f+=XR(lerp(sg[0][0],sg[1][0],u),lerp(sg[0][1],sg[1][1],u),4,Math.PI/4,'x');}});E.fl.innerHTML=f;}
    const lo=1-clamp((z-.64)/.2),fz=(9.5/(z*B)).toFixed(1),ci=P<.12?0:P<.37?1:P<.63?2:P<.88?3:4,FEEDX=ox[2]+895*sk[2];
    let s='';
    if(lo>.01){const Ls=[[300,490,'ALL POSTS'],[620,128,'THUNDER'],[612,472,'PHOENIX'],[FEEDX,cy+(476-cy)*sk[2]+30,'FEED']];
      s+='<g opacity="'+lo.toFixed(2)+'">'+Ls.map(l=>'<text class="cp" x="'+R1(l[0])+'" y="'+R1(l[1])+'" text-anchor="middle" style="font-size:'+fz+'px">'+l[2]+'</text>').join('')+'</g>';}
    if(P<.04)s+='<text class="cp" x="'+R1(vx+w/2)+'" y="'+R1(vy+h-28/(z*B))+'" text-anchor="middle" style="font-size:'+fz+'px" opacity="'+(1-P/.04).toFixed(2)+'">SCROLL TO LOOK INSIDE</text>';
    if(s!==lastHud){E.ov.innerHTML=s;lastHud=s;}
    return '';}};
}
  const story = v26Story();
  return {
    /** static markup for the <svg> */
    markup: story.st,
    /** advance one frame: t = seconds (looping micro-animation), P = scroll progress 0–1, B = zoom boost */
    render: (t, P, B) => story.dyn(t, P, B),
    /** chapter index used by the step label: 0 overview, 1 sourcing, 2 scoring, 3 selection, 4 overview */
    chapter: (P) => (P < .12 ? 0 : P < .37 ? 1 : P < .63 ? 2 : P < .88 ? 3 : 4),
  };
}
