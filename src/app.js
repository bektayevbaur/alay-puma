(function(){
// Адрес веб-приложения Google Apps Script (Развернуть → Веб-приложение → URL, заканчивается на /exec)
var API='{{API}}';
var root=document.getElementById('ap'), f=document.getElementById('ap-f'), msg=document.getElementById('ap-msg'), btn=document.getElementById('ap-send');
var L='kk';
var T={
 kk:{need:'Белгіленген өрістерді толтырыңыз',send:'Жіберілуде…',ok:'Дайын! Купон белсендірілді. Alay.pro командасы жақын арада хабарласады.',code:'Мұндай код табылмады. Купондағы кодты тексеріңіз.',used:'Бұл код бұрын белсендірілген.',phone:'Бұл нөмірге сертификат бұрын берілген.',server:'Қате шықты. Кейінірек қайталап көріңіз немесе @alay.pro-ға жазыңыз.',noapi:'Форма әлі қосылмаған.'},
 ru:{need:'Заполните отмеченные поля',send:'Отправляем…',ok:'Готово! Купон активирован. Команда Alay.pro скоро свяжется с вами.',code:'Такой код не найден. Проверьте код на купоне.',used:'Этот код уже активирован.',phone:'На этот номер сертификат уже выдан.',server:'Что-то пошло не так. Попробуйте позже или напишите в @alay.pro.',noapi:'Форма ещё не подключена.'}
};
window.apLang=function(l){
 L=l==='ru'?'ru':'kk'; root.classList.toggle('ru',L==='ru');
 document.getElementById('ap-b-kk').classList.toggle('on',L==='kk');
 document.getElementById('ap-b-ru').classList.toggle('on',L==='ru');
 root.querySelectorAll('option[data-kk]').forEach(function(o){o.textContent=o.getAttribute('data-'+L);});
};
var q=new URLSearchParams(location.search);
var c=q.get('code')||q.get('q5_textbox3');
if(c){document.getElementById('ap-code').value=c; root.classList.add('has-code');
 document.getElementById('ap-codeval').textContent=c; document.getElementById('ap-codeok').hidden=false;}
var st=document.getElementById('ap-sticky');
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){st.classList.toggle('off',e.isIntersecting);});},{threshold:0.05});io.observe(document.getElementById('ap-form'));}
apLang(q.get('lang')==='ru'?'ru':'kk');
var model=document.getElementById('ap-model'), other=document.getElementById('ap-other');
model.addEventListener('change',function(){other.hidden=model.value!=='other';});

function shrink(file){return new Promise(function(res,rej){
 var r=new FileReader(); r.onerror=rej; r.onload=function(){
  var img=new Image(); img.onerror=rej; img.onload=function(){
   var m=1600,s=Math.min(1,m/Math.max(img.width,img.height)),cv=document.createElement('canvas');
   cv.width=Math.round(img.width*s); cv.height=Math.round(img.height*s);
   cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
   res({name:file.name.replace(/\.[^.]+$/,'')+'.jpg',data:cv.toDataURL('image/jpeg',0.82).split(',')[1]});
  }; img.src=r.result;}; r.readAsDataURL(file);});}

function say(t,cls){msg.textContent=t;msg.className='full ap-msg '+(cls||'');}

f.addEventListener('submit',function(e){
 e.preventDefault();
 var bad=false;
 f.querySelectorAll('[required]').forEach(function(el){
  var ok=el.type==='checkbox'?el.checked:String(el.value).trim()!=='';
  el.classList.toggle('bad',!ok); if(!ok) bad=true;});
 if(bad){say(T[L].need,'err');return;}
 if(!API||API.indexOf('{{')===0){say(T[L].noapi,'err');return;}
 var d={}; new FormData(f).forEach(function(v,k){if(k!=='photos') d[k]=v;});
 d.phone=(d.cc||'').replace(' RU','')+' '+String(d.phone).replace(/[^\d]/g,'');
 d.country=d.cc; delete d.cc;
 d.lang=L; d.utm_source=q.get('utm_source')||'alaypro_site'; d.utm_campaign=q.get('utm_campaign')||'alay_puma_2026';
 btn.disabled=true; say(T[L].send);
 var files=Array.prototype.slice.call(document.getElementById('ap-photos').files,0,3);
 Promise.all(files.map(shrink)).then(function(ph){
  d.photos=ph;
  return fetch(API,{method:'POST',body:JSON.stringify(d)});
 }).then(function(r){return r.json();}).then(function(r){
  if(r.ok){say(T[L].ok,'ok'); f.reset(); apLang(L); other.hidden=true;}
  else say(T[L][r.err]||T[L].server,'err');
 }).catch(function(){say(T[L].server,'err');}).then(function(){btn.disabled=false;});
});
})();
