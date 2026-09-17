const LEVELS=[
 {name:'1 · Первые звуки',type:'sound',items:['А','У','О','М','С']},
 {name:'2 · Первые слияния',type:'blend',items:['АМ','УМ','ОМ','АС','УС']},
 {name:'3 · Согласный + гласный',type:'blend',items:['МА','МУ','МО','СА','СУ','СО']},
 {name:'4 · Открытые слоги',type:'blend',items:['НА','НО','ЛА','ЛУ','РА','РО']},
 {name:'5 · Простые слова',type:'word',items:['МАМА','ЛУНА','ОСА','САМА','МЫЛО']},
 {name:'6 · Короткие слова',type:'word',items:['ДОМ','КОТ','СОН','МАК','НОС']},
 {name:'7 · Слова длиннее',type:'word',items:['РЫБА','УТКА','ЛИСА','РУКА','НОГА']},
 {name:'8 · Сочетания согласных',type:'word',items:['СТОЛ','СЛОН','КРАН','МОСТ','ЛИСТ']},
 {name:'9 · Короткие фразы',type:'phrase',items:['МАМА ТУТ','КОТ СПИТ','ЛИСА ТАМ','ЭТО ДОМ']},
 {name:'10 · Первое чтение',type:'phrase',items:['МАМА ДОМА.','КОТ СПИТ.','У ЛЕНЫ КОТ.','ВОТ НАШ ДОМ.']}
];
const VOWELS='АУОЫИЭЯЮЕЁ';
let state=JSON.parse(localStorage.getItem('chtenie-progress')||'null')||{level:0,known:{},seen:{},session:0,index:0};
const $=id=>document.getElementById(id); const lesson=$('lesson'), label=$('stageLabel'), picture=$('picture');
function save(){localStorage.setItem('chtenie-progress',JSON.stringify(state))}
function colored(text){return [...text].map(c=>/[А-ЯЁ]/.test(c)?`<span class="letter ${VOWELS.includes(c)?'vowel':'consonant'}">${c}</span>`:c).join('')}
function current(){let l=LEVELS[state.level];return l.items[state.index%l.items.length]}
function render(){let l=LEVELS[state.level],item=current();label.textContent=l.name;picture.classList.add('hidden');$('nextBtn').classList.add('hidden');$('readBtn').classList.remove('hidden');
 if(l.type==='sound') lesson.innerHTML=colored(item);
 else if(l.type==='blend'){let [a,b]=item;lesson.innerHTML=`<div class="blend"><div class="track"><span class="moving letter ${VOWELS.includes(a)?'vowel':'consonant'}">${a}</span></div><span class="target letter ${VOWELS.includes(b)?'vowel':'consonant'}">${b}</span></div>`}
 else lesson.innerHTML=`<div class="word">${colored(item)}</div>`;
 $('progressBar').style.width=((state.session%5+1)/5*100)+'%';save()}
function speak(text,rate=.72){speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(text.toLowerCase());u.lang='ru-RU';u.rate=rate;speechSynthesis.speak(u)}
function help(){let l=LEVELS[state.level],item=current();if(l.type==='blend'){let box=document.querySelector('.blend');box.classList.remove('animating');void box.offsetWidth;box.classList.add('animating');let a=item[0],b=item[1];speak(a==='М'?'ммммм':a,0.55);setTimeout(()=>speak(item,.65),1300)}else speak(item)}
function mastered(){let item=current();state.known[item]=(state.known[item]||0)+1;state.seen[item]=(state.seen[item]||0)+1;state.session++;advance(true)}
function advance(success=false){let l=LEVELS[state.level];let weak=l.items.map((x,i)=>({i,n:state.known[x]||0})).sort((a,b)=>a.n-b.n);if(success&&state.session%5===0&&weak.filter(x=>x.n>=1).length>=4&&state.level<LEVELS.length-1){state.level++;state.index=0}else{let candidates=weak.slice(0,Math.min(3,weak.length));let pick=candidates[Math.floor(Math.random()*candidates.length)];state.index=pick.i}render()}
$('helpBtn').onclick=help;$('readBtn').onclick=mastered;$('nextBtn').onclick=()=>advance(false);$('homeBtn').onclick=()=>{state.level=0;state.index=0;render()};
function showParent(){ $('childScreen').classList.add('hidden');$('parentScreen').classList.remove('hidden');let learned=Object.values(state.known).filter(n=>n>0).length;$('stats').innerHTML=`<div class="stat"><strong>${learned}</strong><span>освоено</span></div><div class="stat"><strong>${state.session}</strong><span>прочитано самостоятельно</span></div>`;$('levelSelect').value=state.level}
$('parentBtn').onclick=showParent;$('backBtn').onclick=()=>{$('parentScreen').classList.add('hidden');$('childScreen').classList.remove('hidden');render()};
LEVELS.forEach((l,i)=>$('levelSelect').add(new Option(l.name,i)));$('levelSelect').onchange=e=>{state.level=+e.target.value;state.index=0;save()};$('resetBtn').onclick=()=>{if(confirm('Сбросить весь прогресс?')){state={level:0,known:{},seen:{},session:0,index:0};save();showParent()}};
render();