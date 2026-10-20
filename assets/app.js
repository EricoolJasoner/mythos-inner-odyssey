(() => {
  'use strict';
  const { archetypes, questions } = window.MYTH_DATA;
  const byId = Object.fromEntries(archetypes.map(a => [a.id, a]));
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = value => String(value).padStart(2,'0');
  const STORAGE_KEY = 'mythos.quiz.v1';
  const chapters = [
    {name:'境遇',en:'THE EVERYDAY',copy:'在平常的选择里，\n找到你惯常的方式。'},
    {name:'抉择',en:'THE CHOICE',copy:'你所珍惜的，\n也塑造着你的方向。'},
    {name:'回响',en:'THE ECHO',copy:'穿过过往的回声，\n听见真正想要的。'},
    {name:'命运',en:'THE TURNING POINT',copy:'故事还未落幕。\n这一页，交给你。'}
  ];
  let answers = Array(21).fill(null), current = 0, mode = 'home', report = null, activeResultId = null;
  let storageAvailable = true, toastTimer, selectedMbti = '';
  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && saved.version === 1 && Array.isArray(saved.answers) && saved.answers.length === questions.length && saved.answers.every((v,i) => v === null || Number.isInteger(v) && v >= 0 && v < questions[i].options.length)) {
        answers = saved.answers;
        current = Number.isInteger(saved.current) && saved.current >= 0 && saved.current < 21 ? saved.current : 0;
        selectedMbti = window.MYTH_MBTI.normalizeType(saved.mbti);
      }
    } catch (_) { storageAvailable = false; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,answers,current,mbti:selectedMbti})); }
    catch (_) { storageAvailable = false; }
    $('#quiz-save-note').textContent = storageAvailable ? '进度自动保存在此设备，可随时返回修改。' : '当前浏览器无法保存进度。请保持页面打开，完成本次探索。';
  }
  function updateStartLabels() {
    const count = answers.filter(v => v !== null).length;
    $('[data-start-label]').textContent = count === 21 ? '查看我的神话原型' : count ? `继续我的探索 · ${count}/21` : '寻找我的神话原型';
  }
  function toast(message) {
    clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('visible');
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500);
  }
  function showView(next) {
    mode = next;
    $('#home-view').hidden = next !== 'home'; $('#quiz-view').hidden = next !== 'quiz'; $('#result-view').hidden = next !== 'result';
    document.body.dataset.view = next;
    window.scrollTo({top:0,behavior:'instant'});
    updateStartLabels();
  }
  function home() { showView('home'); $('#hero-title').setAttribute('tabindex','-1'); $('#hero-title').focus({preventScroll:true}); }
  function start() {
    $$('dialog[open]').forEach(d => d.close());
    if (answers.every(v => v !== null)) { finish(); return; }
    const firstGap = answers.findIndex(v => v === null);
    current = firstGap < 0 ? 0 : firstGap;
    showView('quiz'); renderQuestion();
  }
  function portrait(id, extra='') {
    return `<span class="portrait-window ${extra}"><img src="${window.MYTH_ASSETS.portraits[id]}" alt="${esc(byId[id].name)}的古典雕塑肖像" width="250" height="302" loading="eager"></span>`;
  }
  function evidenceFor(id) {
    return report ? report.evidence.filter(e=>e.primary===id||e.secondary===id)
      .sort((x,y)=>Number(y.primary===id)-Number(x.primary===id)||x.questionId-y.questionId).slice(0,2) : [];
  }
  function comparisonMarkup(id) {
    const selected=evidenceFor(id), story=window.MYTH_STORIES[id];
    if(!selected.length) return '<p class="story-note">本次选择没有为这一原型提供直接线索。你可以阅读它的故事，但不据此认定你们相似。</p>';
    const indirect=selected.every(e=>e.primary!==id);
    return `<h4>你的答案，为什么指向这个故事</h4><div class="story-evidence">${selected.map(e=>`<div><span>Q${pad(e.questionId)} · ${esc(questions[e.questionId-1].theme)}${e.primary!==id?' · 次级线索':''}</span><blockquote>“${esc(e.text)}”</blockquote><p>${esc(window.MYTH_ANSWER_NOTES[e.questionId-1][e.optionIndex])}</p></div>`).join('')}</div><h4>你与${byId[id].name}的相似之处</h4><p class="story-connection">${esc(story.similarity)}</p>${indirect?'<p class="story-note">这些答案也包含这一原型的侧面，支持程度较弱，适合作为补充阅读。</p>':''}`;
  }
  function storySource(story) {
    return `<p class="story-source">故事据：<a href="${story.url}" target="_blank" rel="noopener noreferrer">${esc(story.source)} ↗</a>${story.extraUrl?` · <a href="${story.extraUrl}" target="_blank" rel="noopener noreferrer">海盗故事原典 ↗</a>`:''}</p>`;
  }
  function resultStories(ids) {
    return `<section class="story-section"><span class="eyebrow">THE MYTH & YOUR REFLECTION</span><h2 class="result-heading">你与诸神，相似在哪里？</h2><p class="story-intro">每一个出现在这次解读里的名字，都有自己的故事。展开阅读神话，也看看你的选择如何与它呼应。</p>${ids.map(id=>{const a=byId[id],s=window.MYTH_STORIES[id];return `<details class="myth-story" ${id===activeResultId?'open':''}><summary><span><small>${a.en}</small><strong>${a.name}</strong><em>${s.title}</em></span><span class="story-toggle" aria-hidden="true">＋</span></summary><div class="myth-story-body"><h4>先听这个神话</h4>${s.story.map(p=>`<p>${esc(p)}</p>`).join('')}${comparisonMarkup(id)}${storySource(s)}</div></details>`;}).join('')}</section>`;
  }
  function renderAtlas() {
    $('#archetype-grid').innerHTML = archetypes.map((a,i) => `<button class="archetype-card" data-archetype="${a.id}" aria-label="阅读${esc(a.name)}的故事">${portrait(a.id)}<span class="card-topline"><h3>${a.name}</h3><span class="card-num">${pad(i+1)}</span></span><span class="card-en">${a.en}</span><span class="card-subline"><span>${a.role}</span><span class="card-arrow" aria-hidden="true">↗</span></span></button>`).join('');
    $$('.archetype-card').forEach(b => b.addEventListener('click',() => openArchetype(b.dataset.archetype)));
  }
  function openArchetype(id) {
    const a = byId[id], s=window.MYTH_STORIES[id];
    $('#detail-content').innerHTML = `<div class="detail-layout"><div class="detail-art">${portrait(id)}</div><div class="detail-body"><span class="eyebrow">${a.role}</span><h2 id="detail-title">${a.name}</h2><div class="detail-en">${a.en} / ${a.roman}</div><p class="detail-tagline">${s.title}</p><h3>神话故事</h3>${s.story.map(p=>`<p>${esc(p)}</p>`).join('')}${mode==='result'?comparisonMarkup(id):`<h3>这个故事，映照什么</h3><p>${s.similarity}</p>`}<h3>故事的转身</h3><p>${a.turning}</p>${storySource(s)}<button class="button button-gold" id="detail-start">${mode==='result'?'返回我的解读':'寻找我的神话原型'} <span aria-hidden="true">↗</span></button></div></div>`;
    $('#detail-dialog').setAttribute('aria-labelledby','detail-title');
    $('#detail-dialog').showModal(); $('#detail-start').addEventListener('click',mode==='result'?()=>$('#detail-dialog').close():start);
  }
  function renderQuestion() {
    const q = questions[current], chapterIndex = current < 18 ? Math.floor(current/6) : 3, chapter = chapters[chapterIndex];
    $('#quiz-count').textContent = `${pad(current+1)} / 21`;
    $('#chapter-label').textContent = `${chapter.name} · ${chapter.en}`;
    $('#chapter-number').textContent = ['I','II','III','IV'][chapterIndex];
    $('#chapter-copy').innerHTML = chapter.copy.replace('\n','<br>');
    $('#chapter-steps').innerHTML = chapters.map((c,i)=>`<span class="${i === chapterIndex ? 'active' : ''}" aria-label="${c.name}${i === chapterIndex ? '，当前章节' : ''}"></span>`).join('');
    $('#question-theme').textContent = `${pad(q.id)} — ${q.theme}`;
    $('#question-title').textContent = q.title;
    $('#answer-options').innerHTML = '<legend class="sr-only">请选择一个答案</legend>' + q.options.map((o,i) => `<label class="option"><input type="radio" name="answer" value="${i}" ${answers[current] === i ? 'checked' : ''}><span class="option-letter" aria-hidden="true">${'ABCD'[i]}</span><span class="option-text">${esc(o.text)}</span><span class="option-check" aria-hidden="true"></span></label>`).join('');
    $$('#answer-options input').forEach(input => input.addEventListener('change',() => choose(Number(input.value))));
    $('#previous-question').disabled = current === 0;
    $('#next-question').disabled = answers[current] === null;
    $('#next-question').innerHTML = current === 20 ? '揭开我的神话 <span aria-hidden="true">✦</span>' : '下一题 <span aria-hidden="true">→</span>';
    updateProgress(); save(); $('#question-title').focus({preventScroll:true});
  }
  function updateProgress() {
    const count = answers.filter(v => v !== null).length;
    $('#quiz-progress').style.transform = `scaleX(${count/21})`;
    $('.progress-track').setAttribute('aria-valuenow',count);
    $('.progress-track').setAttribute('aria-valuetext',`已完成 ${count} 题，共 21 题`);
  }
  function choose(index) {
    answers[current] = index;
    $$('#answer-options input').forEach((input,i) => { input.checked = i === index; });
    $('#next-question').disabled = false; updateProgress(); save();
  }
  function next() {
    if (answers[current] === null) return;
    if (current === 20) { finish(); return; }
    current++; renderQuestion();
  }
  function finish() {
    try { report = window.MYTH_SCORING.score(answers,questions,archetypes); }
    catch (_) { toast('还有选择没有完成，请先答完全部题目。'); start(); return; }
    activeResultId = report.primary || report.tiedIds[0];
    showView('result'); renderResult(); save();
  }
  function resultLabel() {
    if (report.tiedIds.length) return '并列原型';
    if (report.dualIds.length === 2) return '双生原型';
    if (report.closeIds.length > 2) return '多种接近的倾向';
    return '你的神话原型';
  }
  function resultNames() {
    const ids = report.tiedIds.length ? report.tiedIds : report.dualIds.length === 2 ? report.dualIds : report.closeIds.length > 2 ? report.closeIds : [report.primary];
    return ids.map(id => byId[id].name).join(' × ');
  }
  function renderResult(focusHeading=true) {
    const a = byId[activeResultId], rows = report.ranked;
    const candidateIds = report.tiedIds.length ? report.tiedIds : report.dualIds.length ? report.dualIds : report.closeIds.length > 2 ? report.closeIds : [report.primary];
    const evidence = report.evidence.filter(e => e.primary === a.id || e.secondary === a.id).sort((x,y)=>Number(y.primary===a.id)-Number(x.primary===a.id)||x.questionId-y.questionId).slice(0,2);
    const tabs = candidateIds.length > 1 ? `<div class="tie-tabs" aria-label="查看相近原型的解读">${candidateIds.map(id=>`<button data-result-id="${id}" aria-pressed="${id === a.id}">${byId[id].name}</button>`).join('')}</div>` : '';
    let pair;
    if (report.tiedIds.length) pair = `<strong>${report.tiedIds.map(id=>byId[id].name).join('、')}</strong> 的总分与命运题得分均相同。本次保留并列，你可以逐一阅读，而不必被一个名字定义。`;
    else if (report.closeIds.length > 2) pair = `<strong>${report.closeIds.map(id=>byId[id].name).join('、')}</strong> 之间相差不超过 2 分。你的选择呈现出多种接近的方式；当前展开的是${a.name}。`;
    else if (report.dualIds.length === 2) pair = `<strong>${report.dualIds.map(id=>byId[id].name).join(' × ')}</strong> 的分差不超过 2 分。${byId[report.dualIds[0]].keywords[0]}与${byId[report.dualIds[1]].keywords[0]}，都在你的选择中留下了回声。`;
    else if (report.secondary) pair = `次级倾向 · <strong>${byId[report.secondary].name}</strong><br>${byId[report.secondary].tagline}`;
    else pair = `次级倾向并列 · <strong>${report.secondaryTiedIds.map(id=>byId[id].name).join('、')}</strong><br>它们代表这次选择中同样明显的另一种反应方式。`;
    const storyIds=[...new Set([activeResultId,...candidateIds,...(report.secondary?[report.secondary]:report.secondaryTiedIds)])];
    const titles = ['你擅长的','你反复追逐的','需要留意的'];
    const traits = [a.gift,a.fixation,a.shadow];
    $('#result-view').innerHTML = `<div class="result-intro"><div class="result-topline"><button class="text-btn" id="result-home">← 返回图鉴</button><span class="eyebrow">YOUR MYTH, UNFOLDED</span></div><div class="result-stage"><div class="result-portrait">${portrait(a.id)}<div class="portrait-serial"><span>ARCHETYPE ${pad(archetypes.indexOf(a)+1)}</span><span>MYTHOS COLLECTION</span></div></div><div class="result-lead"><span class="eyebrow">${resultLabel()} · ${a.role}</span><h1 id="result-title" tabindex="-1">${a.name}</h1><div class="result-en">${a.en}</div><p class="result-tagline">${a.tagline}</p><div class="tags">${a.keywords.map(k=>`<span>${k}</span>`).join('')}</div><p class="result-pair">${pair}</p>${tabs}<div class="result-actions"><button class="button button-gold" data-save-card>收藏结果卡 <span aria-hidden="true">↓</span></button><button class="button button-outline" data-copy-result>复制分享文案 <span aria-hidden="true">↗</span></button><a class="text-btn mbti-jump" href="#mbti-comparison">加入我的 MBTI 对照 ↓</a></div></div></div></div>
    <div class="result-body">${resultStories(storyIds)}<div id="mbti-comparison"></div><span class="eyebrow">THE GIFT & THE PRICE</span><h2 class="result-heading">让你发光的，也需要被照看。</h2><div class="trait-grid">${traits.map((t,i)=>`<article><span class="index">0${i+1} / ${['GIFT','DESIRE','SHADOW'][i]}</span><h3>${titles[i]}</h3><p>${t}</p></article>`).join('')}</div>
    <section class="evidence-section"><span class="eyebrow">IN YOUR OWN WORDS</span><h2 class="result-heading">你的选择，留下了线索。</h2><div class="evidence-grid">${evidence.map(e=>`<article class="evidence-card"><span>Q${pad(e.questionId)} · ${esc(questions[e.questionId-1].theme)}</span><blockquote>“${esc(e.text)}”</blockquote></article>`).join('')}</div><p class="evidence-note">以上来自你本次的真实选择。它们为这段解读提供线索，不意味着你在所有情境下都会如此。${report.tieBreakUsed ? '本次最高总分相同时，使用命运题得分确定了排列顺序。' : ''}</p></section>
    <section><span class="eyebrow">YOUR STORY IN THREE ACTS</span><h2 class="result-heading">命运三幕。下一幕还未写定。</h2><div class="acts-grid">${a.acts.map((act,i)=>`<article><span class="act-number">${['I','II','III'][i]}</span><h3>${['回望 · 你走过的路','此刻 · 值得问自己的','转身 · 另一种可能'][i]}</h3><p>${act}</p></article>`).join('')}</div><aside class="myth-anchor"><h3>神话原点<br><span class="eyebrow">THE MYTH</span></h3><p>${a.myth}</p></aside></section>
    <section class="result-turn"><div><span class="eyebrow">THE TURNING POINT</span><h3>你的转机</h3><p>${a.turning}</p></div><div><span class="eyebrow">ONE SMALL STEP</span><h3>从一个小行动开始</h3><p>${a.action}</p></div></section>
    <details class="score-details"><summary>展开这次选择的原型分布与计分说明</summary><p>下方为原始积分，按总分、命运题得分排列。每题总共计 3 分，全卷共 63 分；分数不是匹配概率。人物可得分机会仍有差异，结果适合用于叙事探索。</p><div class="score-bars">${rows.map(r=>`<button class="score-bar" data-story-id="${r.id}" aria-label="阅读${byId[r.id].name}的故事与答题关联"><span>${byId[r.id].name} ↗</span><span class="score-bar-track"><span style="width:${r.raw/rows[0].raw*100}%"></span></span><span class="score-bar-score">${r.raw}</span></button>`).join('')}</div><p>第二高分不等于潜意识，最低分不代表你与谁相克。所有解读都可以被你自己的经验补充或修正。</p></details></div>
    <div class="result-closing"><span class="eyebrow">A NOTE TO YOURSELF</span><blockquote>“${a.closing}”</blockquote><button class="button button-gold" data-save-card>把这句话留给自己 <span aria-hidden="true">↓</span></button><p class="share-note">保存一张包含原型与寄语的图片，不包含原始答题记录。</p><button class="text-btn" id="review-answers">回看并修改我的选择 →</button></div>`;
    const mbtiHolder=$('#mbti-comparison');
    mbtiHolder.innerHTML=window.MYTH_MBTI.render({
      archetype:a,
      evidence:evidence.map(e=>({question:`Q${pad(e.questionId)} · ${questions[e.questionId-1].theme}`,answer:e.text,note:window.MYTH_ANSWER_NOTES[e.questionId-1][e.optionIndex]})),
      selectedType:selectedMbti
    });
    window.MYTH_MBTI.bind(mbtiHolder,{onChange:type=>{selectedMbti=type;save();}});
    $$('[data-story-id]').forEach(b=>b.addEventListener('click',()=>openArchetype(b.dataset.storyId)));
    $('#result-home').addEventListener('click',home);
    $('#review-answers').addEventListener('click',()=>{current=0;showView('quiz');renderQuestion();});
    $$('[data-save-card]').forEach(b=>b.addEventListener('click',saveResultCard));
    $$('[data-copy-result]').forEach(b=>b.addEventListener('click',copyResult));
    $$('[data-result-id]').forEach(b=>b.addEventListener('click',()=>{activeResultId=b.dataset.resultId;renderResult(false);const active=$(`[data-result-id="${activeResultId}"]`);active?.focus({preventScroll:true});}));
    if (focusHeading) $('#result-title').focus({preventScroll:true});
  }
  function download(url,name) { const a = document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove(); }
  function publicSiteUrl(href) {
    const fallback='https://ericooljasoner.github.io/mythos-inner-odyssey/';
    try {
      const page=new URL(href),host=page.hostname.toLowerCase();
      const local=/^(localhost|0\.0\.0\.0|\[?::1\]?)$/.test(host)||/\.(localhost|local|test|invalid)$/.test(host)||/^(127|10)\./.test(host)||/^192\.168\./.test(host)||/^169\.254\./.test(host)||/^172\.(1[6-9]|2\d|3[01])\./.test(host);
      return /^https?:$/.test(page.protocol)&&!local?new URL('./',page).href:fallback;
    } catch (_) { return fallback; }
  }
  const PUBLIC_URL=publicSiteUrl(window.location.href);
  async function shareSite() {
    const text='21 道选择，遇见你的神话原型。还有神话故事与 MBTI 性格对照。';
    if(navigator.share){
      try{await navigator.share({title:'MYTHOS · 神话中的你',text,url:PUBLIC_URL});return;}
      catch(error){if(error.name==='AbortError')return;}
    }
    try{await navigator.clipboard.writeText(PUBLIC_URL);toast('测试链接已复制，发给朋友就能开始。');}
    catch(_){window.prompt('复制这个链接，发给朋友：',PUBLIC_URL);}
  }
  async function copyResult() {
    const a = byId[activeResultId];
    const names=resultNames(), reading=names===a.name?'':`\n当前阅读：${a.name}。\n`;
    const content = `我在 MYTHOS 的神话探索中遇见了「${names}」。\n${reading}\n${a.tagline}\n${a.closing}\n\n21 道选择，12 个神话故事，还可以结合自己的 MBTI 看深入对照。\n一起试试：${PUBLIC_URL}\n#MYTHOS #神话人格 #自我探索`;
    try { await navigator.clipboard.writeText(content); toast('分享文案已复制。'); }
    catch (_) {
      const textarea=document.createElement('textarea');textarea.value=content;textarea.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.append(textarea);textarea.select();let ok=false;try{ok=document.execCommand('copy');}catch(_){}textarea.remove();
      if(ok)toast('分享文案已复制。');else{download(URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'})),'MYTHOS-分享文案.txt');toast('已将分享文案保存为文本。');}
    }
  }
  function wrapText(ctx,text,maxWidth) {
    let lines=[],line=''; for(const char of [...text]){if(char==='\n'){lines.push(line);line='';continue;}if(ctx.measureText(line+char).width>maxWidth && line){lines.push(line);line=char;}else line+=char;}if(line)lines.push(line);return lines;
  }
  function loadCardImage(src) {
    return new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Image unavailable'));img.src=src;
    });
  }
  async function saveResultCard() {
    const buttons=$$('[data-save-card]');buttons.forEach(b=>b.disabled=true);
    $('#export-image').hidden=true;$('#export-download').hidden=true;$('#export-status').textContent='正在制作你的结果卡…';
    $('#export-dialog').showModal();
    try {
      const a=byId[activeResultId], canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1600;
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('canvas');
      const img=await loadCardImage(window.MYTH_ASSETS.portraits[a.id]);
      if(document.fonts) await document.fonts.ready;
      ctx.fillStyle='#0b1d1e';ctx.fillRect(0,0,1080,1600);
      ctx.strokeStyle='#8d7e57';ctx.lineWidth=1;ctx.strokeRect(36,36,1008,1528);
      ctx.textAlign='center';ctx.fillStyle='#d8bd83';ctx.font='28px Georgia';ctx.fillText('M Y T H O S',540,100);
      ctx.font='16px sans-serif';ctx.fillStyle='#a7b6a6';ctx.fillText('神 话 中 的 你',540,140);
      ctx.drawImage(img,270,185,540,652);
      const gradient=ctx.createLinearGradient(0,735,0,860);gradient.addColorStop(0,'rgba(11,29,30,0)');gradient.addColorStop(1,'#0b1d1e');ctx.fillStyle=gradient;ctx.fillRect(200,735,680,130);
      ctx.fillStyle='#d8bd83';ctx.font='19px sans-serif';ctx.fillText(`${resultLabel()} · ${a.role}`,540,870);
      ctx.fillStyle='#f2eee4';ctx.font='66px "Songti SC", "SimSun", serif';ctx.fillText(a.name,540,968);
      ctx.font='22px Georgia';ctx.fillStyle='#d8bd83';ctx.fillText(a.en,540,1015);
      ctx.font='32px "Songti SC", "SimSun", serif';const lines=wrapText(ctx,a.closing,820);lines.forEach((line,j)=>ctx.fillText(line,540,1100+j*52));
      ctx.strokeStyle='#627158';ctx.beginPath();ctx.moveTo(420,1213);ctx.lineTo(660,1213);ctx.stroke();
      ctx.fillStyle='#b7c3b2';ctx.font='22px sans-serif';ctx.fillText(a.keywords.join('   /   '),540,1265);
      const ids=report.tiedIds.length?report.tiedIds:report.closeIds.length>1?report.closeIds:[];
      if(ids.length>1){ctx.font='18px sans-serif';const label=(report.tiedIds.length?'并列：':'相近倾向：')+ids.map(id=>byId[id].name).join(' · ');wrapText(ctx,label,900).slice(0,3).forEach((line,j)=>ctx.fillText(line,540,1320+j*30));}
      ctx.fillStyle='#d8bd83';ctx.font='24px "Songti SC", "SimSun", serif';ctx.fillText('21 道选择 · 遇见你的神话原型',540,1450);
      ctx.font='16px sans-serif';ctx.fillStyle='#9bab9e';ctx.fillText('一场自我探索。神话是镜子，下一幕由你来写。',540,1500);
      const shareUrl=new URL(PUBLIC_URL),shareAddress=shareUrl.hostname+shareUrl.pathname;
      let addressFontSize=16;ctx.font=`${addressFontSize}px Georgia`;
      while(addressFontSize>12&&ctx.measureText(shareAddress).width>900){addressFontSize--;ctx.font=`${addressFontSize}px Georgia`;}
      ctx.fillStyle='#d8bd83';ctx.fillText(shareAddress,540,1537,900);
      const url=canvas.toDataURL('image/png');
      $('#export-image').src=url;$('#export-image').alt=`${a.name}的神话结果卡`;$('#export-image').hidden=false;
      $('#export-download').href=url;$('#export-download').download=`MYTHOS-${a.name}-神话结果卡.png`;$('#export-download').hidden=false;
      $('#export-status').textContent='手机可长按下方图片保存，也可以截图；电脑可点击下载图片。';
    } catch (_) { $('#export-status').textContent='结果卡暂未生成，请关闭后重试，或截图收藏结果页。'; }
    finally {buttons.forEach(b=>b.disabled=false);}
  }
  $$('.brand,.footer-brand').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();home();}));
  $('[data-atlas-link]').addEventListener('click',e=>{e.preventDefault();showView('home');requestAnimationFrame(()=>$('#archetypes').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));});
  $$('[data-start]').forEach(button=>button.addEventListener('click',start));
  $$('[data-share-site]').forEach(button=>button.addEventListener('click',shareSite));
  $$('[data-method]').forEach(button=>button.addEventListener('click',()=>$('#method-dialog').showModal()));
  $$('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  $$('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}}));
  $('#pause-quiz').addEventListener('click',()=>{save();home();});
  $('#previous-question').addEventListener('click',()=>{if(current>0){current--;renderQuestion();}});
  $('#next-question').addEventListener('click',next);
  $('#poster-download').addEventListener('click',()=>download(window.MYTH_ASSETS.poster,'MYTHOS-十二神话原型海报.jpg'));
  $('#clear-progress').addEventListener('click',()=>{answers=Array(21).fill(null);current=0;report=null;activeResultId=null;selectedMbti='';try{localStorage.removeItem(STORAGE_KEY);}catch(_){}$('#result-view').replaceChildren();$('#method-dialog').close();home();toast('本地答题记录与 MBTI 偏好已清除。');});
  document.addEventListener('keydown',e=>{
    if(mode!=='quiz'||$('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
    if(e.key==='Enter'&&!e.target.closest('button,a,summary')){e.preventDefault();next();return;}
    const key=e.key.toLowerCase();const index='abcd'.indexOf(key);const number='1234'.indexOf(key);
    if(key.length===1&&(index>=0||number>=0)){e.preventDefault();const chosen=index>=0?index:number;choose(chosen);$(`#answer-options input[value="${chosen}"]`).focus();}
  });
  restore();renderAtlas();updateStartLabels();
})();
