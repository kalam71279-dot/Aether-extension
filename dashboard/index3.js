const $ = id => document.getElementById(id);

function updateClock(){
  const now = new Date();
  const seconds = now.getSeconds() + now.getMilliseconds()/1000;
  const minutes = now.getMinutes() + seconds/60;
  const hours = (now.getHours()%12) + minutes/60;
  document.querySelector('.hour').style.transform = `translateX(-50%) rotate(${hours*30}deg)`;
  document.querySelector('.minute').style.transform = `translateX(-50%) rotate(${minutes*6}deg)`;
  document.querySelector('.second').style.transform = `translateX(-50%) rotate(${seconds*6}deg)`;
}
setInterval(updateClock, 100);
updateClock();

function buildMiniCalendar(){
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  $('monthName').textContent = now.toLocaleString('en-US',{month:'long'});
  $('yearName').textContent = y;
  const first = new Date(y,m,1).getDay();
  const days = new Date(y,m+1,0).getDate();
  const prevDays = new Date(y,m,0).getDate();
  const cells=[];
  for(let i=0;i<42;i++){
    const n=i-first+1;
    let text=n, cls='';
    if(n<=0){text=prevDays+n;cls='dim'}
    else if(n>days){text=n-days;cls='dim'}
    if(n===now.getDate() && i>=first && i<first+days) cls+=' today';
    if(n===24 && m===7 && y===2026) cls+=' active';
    cells.push(`<span class="${cls}">${text}</span>`);
  }
  $('miniCalendar').innerHTML = cells.join('');
  $('dateNumber').textContent = now.getDate();
  $('monthShort').textContent = now.toLocaleString('en-US',{month:'long'});
  $('weekday').textContent = now.toLocaleString('en-US',{weekday:'long'});
}
buildMiniCalendar();

function buildWeekCalendar(){
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(today);
  const eventDetails = {1:['Disclosure Day','The Mandalorian and...','10'],2:['The Last Sunrise','Toxic: A Fairy Tale for...','2'],4:['Colony','Copycat vs. Acme','12']};
  const days = [];
  for(let i=0;i<4;i++){
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dayName = date.toLocaleString('en-US',{weekday:'short'}).toUpperCase();
    const isToday = date.getTime() === today.getTime();
    const relativeDay = Math.round((date.getTime() - today.getTime()) / 86400000);
    const details = eventDetails[date.getDay()];
    let eventMarkup = '<span class="event">No events</span>';
    if(isToday) eventMarkup = '<span class="event-icon">•</span><span class="event">Today</span>';
    else if(details && relativeDay >= 0 && relativeDay < 7) eventMarkup = `<span class="event-icon">▣</span><span class="event">${details[0]}</span><span class="event">${details[1]}</span><span class="badge">${details[2]}</span>`;
    days.push(`<article class="day ${dayName.toLowerCase()}${isToday ? ' today' : ''}"><div class="day-label">${dayName}</div><div class="day-number">${date.getDate()}<span class="dot"></span></div><div class="events">${eventMarkup}</div></article>`);
  }
  $('weekCalendar').innerHTML = days.join('');
}
buildWeekCalendar();

$('searchBox').addEventListener('keydown', e=>{
  if(e.key==='Enter'){
    const q=e.target.value.trim();
    if(!q)return;
    if(q.startsWith('http://') || q.startsWith('https://')) location.href=q;
    else window.open('https://www.google.com/search?q='+encodeURIComponent(q),'_blank');
  }
});

const backdrop=$('modalBackdrop');
$('addNote').onclick=()=>{backdrop.style.display='grid';$('noteText').focus()};
$('cancelNote').onclick=()=>backdrop.style.display='none';
$('saveNote').onclick=()=>{
  const text=$('noteText').value.trim();
  if(text){
    localStorage.setItem('forestDashboardNote',text);
    document.querySelector('#addNote .feature-copy b').textContent='Saved note';
    document.querySelector('#addNote .feature-copy span').textContent=text.slice(0,28)+(text.length>28?'...':'');
  }
  $('noteText').value='';
  backdrop.style.display='none';
};
backdrop.addEventListener('click',e=>{if(e.target===backdrop)backdrop.style.display='none'});

const saved=localStorage.getItem('forestDashboardNote');
if(saved){
  document.querySelector('#addNote .feature-copy b').textContent='Saved note';
  document.querySelector('#addNote .feature-copy span').textContent=saved.slice(0,28)+(saved.length>28?'...':'');
}
