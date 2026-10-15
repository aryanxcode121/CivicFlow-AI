(function(){
function $(i){return document.getElementById(i)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function tok(t){return t.toLowerCase().replace(/[^a-z0-9\u0900-\u097f\s]/g," ").split(/\s+/).filter(function(w){return w.length>2})}
var CATS=[["Roads & transport","↗"],["Sanitation","✳"],["Street lighting","◒"],["Water & drainage","≈"],["Public spaces","▢"],["Other","+"]];
var KW={"Sanitation":["drain","nali","gandha","garbage","kachra","bin","smell","sewage","naala","overflow","overflowing"],"Roads & transport":["pothole","gadda","road","sadak","bus","crack","footpath"],"Street lighting":["light","streetlight","bijli","pole","andhera","dark"],"Water & drainage":["water","pani","pipe","pipeline","leak","tap","flood"],"Public spaces":["park","bench","garden","playground","tree","toilet"]};
var cases=[
 {id:"CF-1048",ago:"12m ago",title:"Open drain near Shanti Nagar school",loc:"Ward 14 · Shanti Nagar",dept:"Sanitation",st:"Needs review",pri:"High",text:"Nali ka gandha paani school ke paas road par bah raha hai, drain open hai",dup:{id:"CF-1031",sim:78}},
 {id:"CF-1047",ago:"34m ago",title:"Streetlight out on MG Road",loc:"Ward 07 · MG Road",dept:"Street lighting",st:"Assigned",pri:"Medium",text:"Streetlight not working on MG Road, andhera at night"},
 {id:"CF-1046",ago:"1h ago",title:"Pothole cluster by bus stop",loc:"Ward 03 · Central Market",dept:"Roads",st:"In progress",pri:"High",text:"Pothole cluster by bus stop near Central Market, dangerous for bikes"},
 {id:"CF-1045",ago:"2h ago",title:"Overflowing community bin",loc:"Ward 09 · Lakeview",dept:"Waste management",st:"Resolved",pri:"Low",text:"Community bin overflowing at Lakeview, garbage on road"}
];
var nextN=1049,tab="All issues",hiOnly=false,audit=[],dismissed={},health={"Sanitation":18,"Roads & transport":12,"Street lighting":7};
var HC={"Sanitation":"var(--teal)","Roads & transport":"var(--amber)","Street lighting":"var(--blue)"};
function cls(s){return"s-"+s.split(" ")[0]}
function suggest(text,cat){
 var t=tok(text),res=Object.keys(KW).map(function(d){var h=KW[d].filter(function(k){return t.some(function(w){return w===k||(k.length>3&&w.indexOf(k)===0)})});var sc=h.length+(cat===d?1:0);return{dept:d,hits:h,score:sc}});
 res.sort(function(a,b){return b.score-a.score});var sum=res.reduce(function(s,r){return s+r.score},0)||1;
 res.forEach(function(r){r.conf=r.score?Math.round(r.score/sum*100):0});
 return{list:res.slice(0,3),low:res[0].score<2||res[0].conf<45};
}
function findDup(c){var a=tok(c.text),best=null;cases.forEach(function(o){if(o.id===c.id||dismissed[c.id+o.id])return;var b=tok(o.text),i=a.filter(function(w){return b.indexOf(w)>-1}).length,u=a.length+b.length-i,j=u?i/u:0;if(j>=.25&&(!best||j>best.sim/100))best={id:o.id,sim:Math.round(j*100)}});return best}
function now(){return new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
function toast(m){var t=$("toast");t.textContent=m;t.classList.remove("hide");clearTimeout(toast.h);toast.h=setTimeout(function(){t.classList.add("hide")},2800)}
function logA(id,msg){audit.unshift({t:now(),id:id,msg:msg})}

/* overview */
function home(){
 var need=cases.filter(function(c){return c.st==="Needs review"}).length,n=22+need;
 $("needN").textContent=n;$("stripB").textContent=n+" awaiting human review";
 var tabs=["All issues","Needs review","Assigned","In progress"];
 $("tabs").innerHTML=tabs.map(function(x){return '<button class="'+(x===tab?'on':'')+'" data-tab="'+x+'">'+x+'</button>'}).join("");
 var list=cases.filter(function(c){return(tab==="All issues"||c.st===tab)&&(!hiOnly||c.pri==="High")});
 $("queue").innerHTML=list.length?list.map(function(c){return '<button class="row '+cls(c.st)+'" data-open="'+c.id+'"><span class="bar3"></span><span><span class="mono mute" style="font-size:9px">'+c.id+' · '+c.ago+'</span><h4>'+esc(c.title)+'</h4><span class="m">'+c.loc+' · '+c.dept+'</span></span><span class="rt"><span class="bdg">'+c.st+'</span><span class="mono '+(c.pri==="High"?'coral':'mute')+'">'+c.pri+' priority</span></span><span class="mute">›</span></button>'}).join(""):'<p class="empty">Nothing here right now.</p>';
 $("dept").innerHTML=Object.keys(health).map(function(d){var v=health[d];return '<div class="dep" style="--c:'+HC[d]+'"><div><span>'+d+'</span><span class="mono">'+(v<10?'0':'')+v+'</span></div><i style="width:'+Math.min(100,v/20*100)+'%"></i></div>'}).join("");
 $("audit").innerHTML=audit.length?audit.slice(0,6).map(function(a){return '<li><b>'+a.id+'</b> · '+esc(a.msg)+' <span class="mono" style="float:right;font-size:9px">'+a.t+'</span></li>'}).join(""):'<li>No decisions yet. Open a signal and approve, change owner or reject a duplicate. Every action is logged with approver and time.</li>';
}
function openCase(id){
 var c=cases.filter(function(x){return x.id===id})[0],s=suggest(c.text,null),d=c.dup&&!dismissed[c.id+c.dup.id]?c.dup:null,done=c.st==="Resolved";
 $("pan").innerHTML='<button class="x" id="cl" aria-label="Close">×</button><div class="mono coral">'+c.id+' · '+c.ago+' · '+c.st+'</div><h3>'+esc(c.title)+'</h3><div class="mono mute">'+c.loc+' · '+c.pri+' priority</div><div class="quote">“'+esc(c.text)+'”<div class="mono mute" style="margin-top:6px">Original complaint stays visible</div></div>'+
 '<div class="mono mute">Suggested department</div>'+s.list.map(function(r,i){return '<div class="opt"><b'+(i?'':' style="font-size:18px"')+'>'+r.dept+'</b> <span class="mono mute">'+r.conf+'% (illustrative)</span><div class="bar"><i style="width:'+r.conf+'%"></i></div><span class="mute">'+(r.hits.length?'Why: '+r.hits.map(function(h){return '“'+h+'”'}).join(", ")+' match':'No matching words')+'</span></div>'}).join("")+
 (s.low?'<div class="dupb">Low confidence. This goes to the manual queue. Only an officer can choose the owner.</div>':'')+
 (d?'<div class="dupb"><b>Possible duplicate: '+d.id+'</b> · similarity '+d.sim+'% (illustrative). Linking never merges records automatically.</div>':'')+
 (done?'<p class="mute">This case is resolved. No action needed.</p>':'<div class="ar"><button class="ab a" data-act="app"'+(s.low?' disabled':'')+'>Approve</button><select id="chg" aria-label="Department">'+Object.keys(KW).map(function(k){return '<option>'+k+'</option>'}).join("")+'</select><button class="ab c" data-act="chg">Change owner</button>'+(d?'<button class="ab n" data-act="nd">Not duplicate</button>':'')+'</div><p class="mono mute" style="margin-top:14px">No action occurs until the officer chooses.</p>');
 $("mod").classList.remove("hide");$("pan").dataset.id=id;
}
function closeM(){$("mod").classList.add("hide")}
$("mod").addEventListener("click",function(e){var t=e.target;if(t.id==="mod"||t.id==="cl")return closeM();
 var a=t.dataset&&t.dataset.act;if(!a)return;var c=cases.filter(function(x){return x.id===$("pan").dataset.id})[0],s=suggest(c.text,null);
 if(a==="app"){c.st="Assigned";c.dept=s.list[0].dept;logA(c.id,"Owner approved: "+c.dept+" · by Officer RK")}
 if(a==="chg"){c.st="Assigned";c.dept=$("chg").value;logA(c.id,"Owner changed to "+c.dept+" · by Officer RK")}
 if(a==="nd"){dismissed[c.id+c.dup.id]=1;logA(c.id,"Marked not duplicate of "+c.dup.id+" · both stay open")}
 closeM();home();toast("Logged: "+c.id)});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeM();if(!$("pitch").classList.contains("hide")){if(e.key==="ArrowRight")go(1);if(e.key==="ArrowLeft")go(-1)}});
document.addEventListener("click",function(e){var t=e.target.closest&&e.target.closest("[data-tab],[data-open],#filt");if(!t)return;
 if(t.dataset.tab){tab=t.dataset.tab;home()}else if(t.dataset.open)openCase(t.dataset.open);else{hiOnly=!hiOnly;t.textContent=hiOnly?"⛉ High priority only":"⛉ Filter";home()}});
(function(){var m=$("map"),h='<svg viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice"><rect width="300" height="160" fill="#4d5158"/>',i,j;
 for(i=0;i<10;i++)for(j=0;j<5;j++){var w=18+((i*7+j*3)%12),hh=14+((i*5+j*9)%14);h+='<rect x="'+(i*30+6)+'" y="'+(j*32+6)+'" width="'+w+'" height="'+hh+'" fill="'+((i+j)%3?'#8a8f97':'#a4a8af')+'"/>'}
 h+='<path d="M150 0V160M0 80H300M60 0L90 160" stroke="#d6d8dc" stroke-width="4" opacity=".75"/>';
 [[120,50],[190,95],[70,110],[230,40]].forEach(function(p){h+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="4" fill="#ff6a4d"/>'});m.insertAdjacentHTML("afterbegin",h+'</svg>')})();

/* report wizard */
var R={step:1,cat:0,text:"",ward:"Ward 14",chan:"Portal",land:"",photo:false};
var HELP=["A good description gives the system—and the people behind it—a useful starting point.","Location and channel help the system link duplicates and find the right department.","Review what the AI suggests. An officer approves before anything is routed."];
function rep(){
 var st=R.step,T=["Tell us what needs fixing.","Add some context.","Confirm and send."];
 $("rTitle").innerHTML=T[st-1].replace(/(fixing\.|context\.|send\.)/,'<span class="coral">$1</span>').replace("Tell us what needs","Tell us what<br>needs").replace(/needs<br>needs/,"needs");
 $("rNum").innerHTML='0'+st+' <small>/ 03</small>';
 $("stepbar").innerHTML=["Describe","Add context","Confirm"].map(function(x,i){return '<span class="'+(i+1===st?'on':'')+'"><em>0'+(i+1)+'</em>'+x+'</span>'}).join("");
 $("rSide").innerHTML='<b>0'+st+'</b><p>'+HELP[st-1]+'</p>';
 var f="";
 if(st===1)f='<span class="mono lab">What kind of issue is this?</span><div class="cats">'+CATS.map(function(c,i){return '<button class="cat'+(i===R.cat?' on':'')+'" data-cat="'+i+'"><i>'+c[1]+'</i>'+c[0]+'</button>'}).join("")+'</div><label class="mono lab" for="rt">Describe the issue</label><textarea id="rt" maxlength="500" placeholder="What is happening? Include anything that might help the team understand… (English or हिंदी)">'+esc(R.text)+'</textarea><div class="fm mono"><span class="teal" id="cc">'+R.text.length+'/500 characters</span><span class="teal">English · हिंदी accepted</span></div>';
 if(st===2)f='<div class="fld"><label class="mono lab" for="rw">Ward</label><select id="rw">'+["Ward 03","Ward 07","Ward 09","Ward 14"].map(function(w){return '<option'+(w===R.ward?' selected':'')+'>'+w+'</option>'}).join("")+'</select></div><div class="fld"><label class="mono lab" for="rc">How are you reporting?</label><select id="rc">'+["Portal","Phone","WhatsApp","Social","Office"].map(function(w){return '<option'+(w===R.chan?' selected':'')+'>'+w+'</option>'}).join("")+'</select></div><div class="fld"><label class="mono lab" for="rl">Landmark (optional)</label><input id="rl" value="'+esc(R.land)+'" placeholder="Near the school gate, opposite the market…"></div><label style="display:flex;gap:10px;font-size:13px"><input type="checkbox" id="rp" style="width:auto"'+(R.photo?' checked':'')+'> A photo is attached (kept as the original)</label>';
 if(st===3){var s=suggest(R.text,CATS[R.cat][0]),tmp={id:"new",text:R.text},d=findDup(tmp);
  f='<div class="sum"><div><span>Issue type</span><span>'+CATS[R.cat][0]+'</span></div><div><span>Description</span><span>'+esc(R.text||"(empty)")+'</span></div><div><span>Location</span><span>'+R.ward+(R.land?' · '+esc(R.land):'')+'</span></div><div><span>Channel</span><span>'+R.chan+(R.photo?' · photo':'')+'</span></div></div>'+
  '<div class="ai"><div class="mono y">AI suggestion · illustrative</div>'+(s.low?'<h3>Manual review</h3><p>Not enough evidence to suggest an owner. An officer will choose.</p>':'<h3>'+s.list[0].dept+'</h3><p>Why: '+(s.list[0].hits.length?s.list[0].hits.map(function(h){return '“'+h+'”'}).join(", ")+' match this department':'based on the issue type you chose')+'. Confidence '+s.list[0].conf+'% (illustrative).</p>')+(d?'<p class="y">Possible duplicate: '+d.id+' ('+d.sim+'% similar)</p>':'')+'<p>No action occurs until an officer approves.</p></div>';}
 f+='<div class="rfoot"><button class="btn o" data-r="back">'+(st===1?'Cancel':'Back')+'</button><button class="btn" data-r="next">'+(st===3?'Send to officer review':'Continue')+' →</button></div><p class="mono coral" id="rErr" style="margin-top:12px"></p>';
 $("rForm").innerHTML=f;
}
$("rForm").addEventListener("input",function(e){if(e.target.id==="rt"){R.text=e.target.value;$("cc").textContent=R.text.length+"/500 characters"}});
$("rForm").addEventListener("click",function(e){var t=e.target.closest("[data-cat],[data-r]");if(!t)return;
 if(t.dataset.cat){R.cat=+t.dataset.cat;rep();return}
 sync();
 if(t.dataset.r==="back"){if(R.step===1){nav("#/");return}R.step--;rep();return}
 if(R.step===1&&R.text.trim().length<8){$("rErr").textContent="Please describe the issue in a few words first.";return}
 if(R.step<3){R.step++;rep();return}
 var s=suggest(R.text,CATS[R.cat][0]),id="CF-"+(nextN++),c={id:id,ago:"Just now",title:R.text.length>46?R.text.slice(0,44)+"…":R.text,loc:R.ward+(R.land?" · "+R.land:""),dept:s.low?CATS[R.cat][0]:s.list[0].dept,st:"Needs review",pri:"Medium",text:R.text};
 var d=findDup(c);if(d)c.dup=d;cases.unshift(c);if(health[c.dept]!==undefined)health[c.dept]++;
 logA(id,"Report captured via "+R.chan+". Sent to officer review.");R={step:1,cat:0,text:"",ward:"Ward 14",chan:"Portal",land:"",photo:false};
 tab="All issues";nav("#/");toast("Report "+id+" sent to officer review")});
function sync(){var w=$("rw"),c=$("rc"),l=$("rl"),p=$("rp");if(w)R.ward=w.value;if(c)R.chan=c.value;if(l)R.land=l.value;if(p)R.photo=p.checked}

/* pitch */
var S=[
 {k:"01 The friction",h:'Civic problems are <span class="coral">everywhere.</span>',p:"But the path from a resident’s signal to a department’s action is often invisible, fragmented, and slow. One pothole on Ward 12 became five records: #1042, #1088, #1121, #1137, #1140.",v:'<span class="mono coral" style="font-size:9px">The status quo</span><span class="w">Resident</span><span class="w">Portal</span><span class="w">Department</span><span class="w">Spreadsheet</span><span class="w" style="color:#e9a820;border:0;margin-left:260px">?</span><span class="tagc">Where does the signal go?</span>'},
 {k:"02 The decision",h:'Two linked failures: <span class="coral">identity + ownership.</span>',p:"Not another all-in-one civic portal. A focused intelligence layer for the hand-off.",v:'<div class="pt"><em>01</em><div><b>Do these reports describe the same real-world incident?</b><span>Link likely duplicates; never merge automatically.</span></div></div><div class="pt"><em>02</em><div><b>Who is most likely responsible for fixing it?</b><span>Rank top departments and show the reason.</span></div></div><p class="mono" style="color:#9a9da6;margin-top:22px">Status transparency follows from better case identity + ownership.</p>'},
 {k:"03 The product",h:'An inbox becomes a <span class="coral">reviewable decision.</span>',p:"A narrow V1 designed around one rule: no high-impact action without an accountable officer.",v:[["Capture","One record format"],["Match","Find likely duplicates"],["Recommend","Top 3 owners + reasons"],["Review","Officer approves or edits"],["Track","Status + appeal"]].map(function(x,i){return '<div class="pt"><em>0'+(i+1)+'</em><div><b>'+x[0]+'</b><span>'+x[1]+'</span></div></div>'}).join("")+'<p class="mono" style="color:#e9a820;margin-top:18px">Always log: input · AI output · confidence · reason · approver · timestamp</p>'},
 {k:"04 Proof, not promises",h:'A credible V1 is defined by what it <span class="coral">refuses to automate.</span>',p:"Targets are proposed acceptance criteria, not achieved performance. AI score alone can never close, reject or down-rank a complaint.",v:'<div class="pt"><em>≥85%</em><div><b>True duplicates in top 3</b><span>English, Hindi and mixed-language pairs</span></div></div><div class="pt"><em>≥90%</em><div><b>Correct owner in top 3</b><span>Compared with a keyword baseline</span></div></div><div class="pt"><em>100%</em><div><b>Human gate blocks unapproved actions</b><span>Approver ID logged every time</span></div></div><p class="mono" style="color:#9a9da6;margin-top:18px">Out of scope: auto-close · priority scoring · live municipal integration · unvalidated image/voice</p><a class="cta" href="#/report">Try the prototype →</a>'}];
var P=0;
function pitch(){var s=S[P];$("slide").style.animation="none";void $("slide").offsetWidth;$("slide").style.animation="";
 $("slide").innerHTML='<div><div class="mono"><span class="coral">'+s.k.slice(0,2)+'</span> '+s.k.slice(3)+'</div><h1>'+s.h+'</h1><p class="s">'+s.p+'</p><div class="cn">0'+(P+1)+' <small>/ 0'+S.length+'</small></div></div><div class="vis">'+s.v+'</div>';
 $("dots").innerHTML=S.map(function(_,i){return '<i class="'+(i===P?'on':'')+'"></i>'}).join("")}
function go(d){P=Math.max(0,Math.min(S.length-1,P+d));pitch()}
$("prev").onclick=function(){go(-1)};$("next").onclick=function(){go(1)};

/* router */
function route(h){h=(typeof h==="string"&&h)||location.hash||"#/";var p=h==="#/report"?"report":h==="#/pitch"?"pitch":"home";
 $("v-home").classList.toggle("hide",p!=="home");$("v-report").classList.toggle("hide",p!=="report");$("pitch").classList.toggle("hide",p!=="pitch");
 document.querySelector(".top").classList.toggle("hide",p==="pitch");$("foot").classList.toggle("hide",p==="pitch");
 ["home","report","pitch"].forEach(function(x){$("n-"+x).classList.toggle("on",x===p)});
 if(p==="home")home();if(p==="report")rep();if(p==="pitch"){P=0;pitch()}window.scrollTo(0,0)}
function nav(h){try{history.replaceState(null,"",h)}catch(e){}route(h)}
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest('a[href^="#/"]');if(!a)return;e.preventDefault();nav(a.getAttribute("href"))},true);
window.addEventListener("hashchange",function(){route()});route();
})();
