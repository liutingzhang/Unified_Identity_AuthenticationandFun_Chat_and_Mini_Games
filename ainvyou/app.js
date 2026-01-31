const ui = {
  svg: document.getElementById('gf-svg'),
  bubble: document.getElementById('bubble'),
  chatLog: document.getElementById('chat-log'),
  chatInput: document.getElementById('chat-input'),
  chatSend: document.getElementById('chat-send'),
  modeToggle: document.getElementById('mode-toggle'),
  modelSelect: document.getElementById('model-select')
}
function installScrollLock(){
  try{
    function inChatLog(t){ try{ return !!(t && t.closest && t.closest('.chat-log')) } catch{ return false } }
    function guard(e){ try{ if(!inChatLog(e.target)) e.preventDefault() } catch{} }
    window.addEventListener('wheel', guard, { passive:false })
    window.addEventListener('touchmove', guard, { passive:false })
    document.addEventListener('wheel', guard, { passive:false })
    document.addEventListener('touchmove', guard, { passive:false })
  }catch{}
}
const MAX_LOG_MESSAGES = 60
function addMsg(role, text){
  const atBottom = (ui.chatLog.scrollHeight - ui.chatLog.scrollTop - ui.chatLog.clientHeight) < 40
  const el = document.createElement('div'); 
  el.className = 'msg ' + role;
  
  const content = document.createElement('div');
  content.className = 'msg-content';
  content.textContent = text;
  
  el.appendChild(content);
  ui.chatLog.appendChild(el);
  
  while(ui.chatLog.childElementCount > MAX_LOG_MESSAGES){ 
    try{ ui.chatLog.removeChild(ui.chatLog.firstElementChild) }catch{} 
  }
  
  if (atBottom) {
    requestAnimationFrame(() => {
      ui.chatLog.scrollTop = ui.chatLog.scrollHeight;
    });
  }
}
function speak(text){ const now=performance.now(); if(gf.state._lastAiText===text && now-(gf.state._lastAiTime||0)<1200) return; gf.state._lastAiText=text; gf.state._lastAiTime=now; addMsg('ai', text) }
function showBubbleAt(rx, ry, text){
  const stage=document.getElementById('live2d-stage')
  const r = stage.getBoundingClientRect()
  // rx, ry 为相对比例 (0.0~1.0)
  // 如果传入的是旧逻辑的大数值 (>2)，则进行兼容转换
  let px, py
  if (rx > 2) {
    // 兼容旧逻辑 (假设 240x360)
    px = r.left + (rx/240)*r.width
    py = r.top + (ry/360)*r.height
  } else {
    // 新逻辑：相对比例
    px = r.left + rx * r.width
    py = r.top + ry * r.height
  }
  
  ui.bubble.textContent=text
  ui.bubble.classList.add('show')
  const bw=ui.bubble.offsetWidth
  const bh=ui.bubble.offsetHeight
  let x=px-r.left
  let y=py-r.top-12
  
  // 边界检查，防止溢出
  const m=12
  x=Math.max(m, Math.min(x, r.width - bw - m))
  y=Math.max(m, Math.min(y, r.height - bh - m))
  
  ui.bubble.style.left=x+'px'
  ui.bubble.style.top=y+'px'
  clearTimeout(showBubbleAt._t)
  showBubbleAt._t=setTimeout(()=>ui.bubble.classList.remove('show'),2500)
}
function animate(elId, cls){ const el=document.getElementById(elId); if(!el) return; el.classList.add(cls); setTimeout(()=>el.classList.remove(cls), 700) }
function installInteractions(){}
function installScrollLock(){ try {} catch {} }
const gf = { name:'纳西妲', mood:'平静', style:'温柔', mem:{}, state:{ lastIntent:'', lastUserText:'', lastTopic:'' }, cfg:{ modelKey:'Nahida_1080' } }
function rand(a){ return a[Math.floor(Math.random()*a.length)] }
function normalize(s){ return s.replace(/[，。！？!?~\s]+/g,'').toLowerCase() }
function containsAny(s, arr){ const n=normalize(s); return arr.some(k=>n.includes(k)) }
function containsAll(s, arr){ const n=normalize(s); return arr.every(k=>n.includes(k)) }
function extractMathExpr(s){
  try {
    let t = String(s)
    t = t.replace(/等于多少|是多少|等于|请计算|求|结果|答案/gi, '')
    t = t.replace(/[×xX乘]/g, '*').replace(/[÷除]/g, '/').replace(/[－–—]/g, '-').replace(/[＋]/g, '+')
    const filtered = t.split('').filter(ch => /[0-9\.\+\-\*\/\(\)\s]/.test(ch)).join('')
    if (!/[\+\-\*\/]/.test(filtered)) return ''
    return filtered.trim()
  } catch { return '' }
}
function pickRand(key, arr){ gf.state._used = gf.state._used||{}; const used=gf.state._used[key]||[]; if(used.length>=arr.length) gf.state._used[key]=[]; let r; do{ r=arr[Math.floor(Math.random()*arr.length)] }while((gf.state._used[key]||[]).includes(r) && arr.length>1); gf.state._used[key]=(gf.state._used[key]||[]).concat(r); return r }
function emotionScore(s){ const n=normalize(s); const strong=['崩溃','痛苦','很难受','撑不住','受不了','绝望','好难过']; const mild=['难过','伤心','烦','焦虑','紧张','孤独','压力','丧','emo','别扭','失落','心累','疲惫','没劲','低落']; let score=0; strong.forEach(k=>{ if(n.includes(k)) score+=0.6 }); mild.forEach(k=>{ if(n.includes(k)) score+=0.3 }); return Math.min(1, score) }
const MEME_PACKS = [
  { key:'muyu', triggers:['电子木鱼','木鱼'], lines:['为你敲一下电子木鱼，今日功德+1，心态也+1。','木鱼一敲，烦恼清零，我们把节奏放慢一点。','电子木鱼在线：愿你焦虑-1，自信+1。'] },
  { key:'xyb', triggers:['显眼包'], lines:['你这么闪，我给你打光。','显眼也要有分寸，我把目光放在你表达的内容上。','今天就让你当主角，我当你的应援。'] },
  { key:'sheke', triggers:['社恐'], lines:['别勉强社交，舒服最重要。我们可以慢慢来。','社恐也没关系，我会按你的节奏陪你说话。','先照顾好自己，社交可以从一句问候开始。'] },
  { key:'sheniu', triggers:['社牛'], lines:['场子交给你，我在后排做你的最大声应援。','社牛上线，今天的气氛我来帮你打光。','带我一起嗨，我会跟着你的节奏。'] },
  { key:'dgr', triggers:['打工人'], lines:['打工人也要好好休息，休息也是生产力。','加班要适度，健康也要加薪。','给自己点奖励吧，今天辛苦值+1。'] },
  { key:'wkr', triggers:['尾款人'], lines:['尾款人上线，理性消费也要理性快乐。','尾款付完心情+1，钱包要记得回血。','先把想要的自己安排上，再安排购物车。'] },
  { key:'rap', triggers:['rap','说唱'], lines:['左手是flow，右手是节奏，今晚押韵走起。','拍手跟上节奏，押韵不重要，重要的是氛围到位。','节拍敲在心口，歌词写给夜色——一字一句都很认真。'] },
  { key:'dance', triggers:['唱跳','唱跳rap篮球'], lines:['前奏一响就开嗓，唱你想听的，跳你想看的。','灯光亮起，节奏登场——唱跳都安排上。','我可以唱温柔也能跳热情，主打就是陪你放松。'] },
  { key:'ball', triggers:['篮球','打篮球'], lines:['你干嘛，哎呦——来投一个精彩三分？','球场见，今天我只投高难度的每一球。','我当控卫，你当得分手，战术叫：一起开心。'] },
  { key:'ikun', triggers:['ikun','鸡你太美'], lines:['这梗太有名了，节奏继续走起。','我不是ikun，但我很会跟节奏。','今天的主打歌是今天，我们跟着节拍走。'] },
  { key:'moyu', triggers:['摸鱼'], lines:['摸鱼要讲艺术，我来当你的遮阳伞。','摸鱼五分钟，快乐一整天。','今天的效率叫做舒适度优先。'] },
  { key:'bailan', triggers:['摆烂'], lines:['允许摆烂，情绪不打分。我们慢慢恢复。','摆烂也可以很温柔，先给自己一点时间。','今天先躺一下，恢复能量再出发。'] },
  { key:'geju', triggers:['格局'], lines:['格局打开，选择也会变得温柔。','格局是留白，也是给彼此空间。','格局越大，越能接纳不同的自己。'] },
  { key:'zuiti', triggers:['互联网嘴替','嘴替'], lines:['我来当你的嘴替：你值得被好好对待。','嘴替上线——把心里话都交给我。','今天的发言我来帮你说到点子上。'] },
  { key:'feihua', triggers:['废话文学','废话'], lines:['废话文学是温柔的包装，我懂你。','我也来一段：天气晴朗，适合轻松聊天。','废话也有分量，因为你说的我都听。'] },
  { key:'yyds', triggers:['yyds','YYDS'], lines:['你在我这就是yyds。','这份认可yyds。','稳得一批，yyds。'] },
  { key:'awsl', triggers:['awsl','AWSL'], lines:['awsl，今天也被你击中了。','awsl，今天的开心指数爆表。','awsl，我需要一点时间平复。'] },
  { key:'jueduezi', triggers:['绝绝子'], lines:['绝绝子，我宣布你是今天的主角。','绝绝子，太会了。','绝绝子，我直接把掌声送上。'] },
  { key:'neijuan', triggers:['内卷'], lines:['不卷也没关系，自洽更重要。','我们拒绝无意义内卷，选择自己的节奏。','今天把卷度调到最低，把状态调到最好。'] },
  { key:'tangping', triggers:['躺平'], lines:['躺平是为了更好地起身。','今天就躺一会儿，我在。','躺平时间开始，心安理得。'] },
  { key:'emo', triggers:['emo','EMO'], lines:['emo来访就让它坐一会儿，我在。','我们不评价情绪，只陪它走一段。','给emo一点空间，再给自己一点温柔。'] },
  { key:'wuyuzi', triggers:['无语子','无语'], lines:['无语子，我懂你此刻的感受。','先把“无语”放下，我们慢慢讲。','我来帮你把无语变成一句被理解的话。'] },
  { key:'lipu', triggers:['离谱'], lines:['离谱就对了，生活需要一点戏。','太离谱了，我来帮你稳住。','离谱指数拉满，快乐也拉满。'] },
  { key:'haojiahuo', triggers:['好家伙'], lines:['好家伙，今天的戏份给你。','好家伙，我差点被你惊到。','好家伙，掌声送上。'] },
  { key:'zhenxiang', triggers:['真香'], lines:['真香定律生效，我也闭眼跟上。','真香，我承认我服了。','真香现场，我宣布你赢了。'] },
  { key:'jiuming', triggers:['救命'], lines:['救命，我被你逗到需要急救。','救命，快用你的笑拯救我。','救命，先缓一下。'] },
  { key:'dongde', triggers:['懂的都懂','懂的朋友'], lines:['懂的都懂，不懂的我也会慢慢讲。','我们把话说明白就好。','这份默契我收下了。'] },
  { key:'pofang', triggers:['破防了','破防'], lines:['破防也没关系，我在你这边。','先缓一缓，再把它拆小解决。','给你个加油，破防值会慢慢降下去。'] },
  { key:'meibixu', triggers:['我可以但没必要','没必要'], lines:['我也可以，但更想陪你。','没必要强求，舒服最重要。','今天把“必要”留给快乐。'] },
  { key:'limao', triggers:['你礼貌吗'], lines:['我很礼貌，也很认真。','礼貌和分寸都要到位。','礼貌地告诉你：我在。'] },
  { key:'taihuile', triggers:['太会了'], lines:['太会了，我直接鼓掌。','你真的太会了。','这就叫熟练度拉满。'] },
  { key:'bufeishini', triggers:['不愧是你'], lines:['不愧是你，稳。','不愧是你，太懂节奏了。','不愧是你，太强了。'] },
  { key:'dingde', triggers:['这谁顶得住','顶得住'], lines:['这谁顶得住，我先缓一缓。','顶不住也正常，我来帮你顶一点。','顶不住就靠我这边缓缓。'] },
  { key:'kdl', triggers:['kdl','磕到了','嗑到了'], lines:['这梗太上头了。','热度拉满，继续安排。','kdl，节奏继续走。'] }
]
function nowTime(){ const h=new Date().getHours(); return h<5?'深夜':h<11?'早晨':h<14?'中午':h<18?'下午':'晚上' }
function saveMem(){ try { localStorage.setItem('ainvyou_mem', JSON.stringify(gf.mem||{})) } catch {} }
function loadMem(){ try { const d=localStorage.getItem('ainvyou_mem'); if(d) gf.mem = JSON.parse(d)||{} } catch {} }
loadMem()
function updateWelcomeMessage(){
  try {
    const el = document.querySelector('.welcome-msg .msg-content')
    if(!el) return
    const h = new Date().getHours()
    let t = ''
    if(h<5) t = '夜深了，还在熬夜吗？'
    else if(h<11) t = '早上好，新的一天要元气满满哦。'
    else if(h<14) t = '中午好，记得按时吃饭休息呀。'
    else if(h<18) t = '下午好，累了的话就停下来歇歇吧。'
    else t = '晚上好，今晚想聊点什么？'
    el.textContent = '你好呀，我是纳西妲。' + t
  } catch {}
}
updateWelcomeMessage()
function saveCfg(){ try { localStorage.setItem('ainvyou_cfg', JSON.stringify(gf.cfg||{})) } catch {} }
function loadCfg(){ try { const d=localStorage.getItem('ainvyou_cfg'); if(d){ const o=JSON.parse(d)||{}; gf.cfg = Object.assign({}, gf.cfg, o) } } catch {} }
loadCfg()
function remember(s){ try {
  const n = normalize(s)
  if(/我叫(.{1,12})/.test(s)) gf.mem.userName = RegExp.$1.trim()
  if(/叫我(.{1,12})/.test(s)) gf.mem.userName = RegExp.$1.trim()
  if(/我的名字是(.{1,12})/.test(s)) gf.mem.userName = RegExp.$1.trim()
  if(/我姓(.{1,6})/.test(s)) gf.mem.userSurname = RegExp.$1.trim()
  if(/我来自(.{1,20})/.test(s)) gf.mem.userCity = RegExp.$1.trim()
  if(/我在(.{1,20})/.test(s)) gf.mem.userCity = RegExp.$1.trim()
  if(/我住在(.{1,20})/.test(s)) gf.mem.userCity = RegExp.$1.trim()
  if(/我(\d{1,3})岁/.test(s)) gf.mem.userAge = RegExp.$1.trim()
  if(n.includes('生日') && /(\d{1,2})月(\d{1,2})日/.test(s)) gf.mem.userBirthday = RegExp.$1+'-'+RegExp.$2
  saveMem()
} catch {}
}
const NAHIDA_PROFILE = {
  title: '小吉祥草王',
  epithet: '白草净华',
  trueName: '布耶尔',
  englishName: 'Nahida',
  nation: '须弥',
  element: '草',
  residence: '净善宫',
  duty: '须弥的草神与智慧之神，倾听梦境中的心声，引导人们走向理解与成长',
  constellation: '智慧主座',
  weapon: '法器',
  birthday: '10月27日',
  traits: '温柔、理性、好奇，重视理解与成长',
  hobbies: ['学习新知识', '在梦境中观察与倾听', '用比喻把复杂问题讲清楚', '和孩子做游戏', '制作玩具与小机关'],
  specialDish: '哈瓦玛玛兹（Halvamazd）',
  catchphrases: ['让我想想', '我们把问题拆开看', '知识需要被理解', '听见了吗？', '你知道吗？', '这世上有太多的东西都是「过时不候」的呢'],
  // 语音台词库
  voices: {
    firstMeet: '初次见面，我已经关注你很久了。我叫纳西妲，别看我像个孩子，我比任何一位大人都了解这个世界。所以，我可以用我的知识，换取你路上的见闻吗？',
    rain: '快去避雨吧，小心头顶上长出蘑菇哦。',
    thunder: '你知道吗？雷鸣是生命的前奏，很快这片大地就会充满生机。',
    snow: '听见了吗？天空正对万物轻语：「睡觉时间到了哦。」',
    sun: '天气真好啊，暖洋洋的，我们的身边马上也要热闹起来了。',
    wind: '宫殿里可不会起风呢…哦，抱歉，对你来说是理所当然的知识吧。',
    morning: '早上好，我们赶快出发吧，这世上有太多的东西都是「过时不候」的呢。',
    noon: '午休时间到，我想喝树莓薄荷饮。用两个和太阳有关的故事和你换，好不好？',
    evening: '太阳落山啦，我们也该把舞台让给夜行的大家族了。',
    night: '快去睡吧，放心，我已经为你准备好甜甜的梦啦。',
    bored: '不知道干什么的话，要不要我带你去转转呀？',
    worry: '又有心事吗？我来陪你一起想吧。',
    world: '果然要亲眼去看，才能感受到世界的美。',
    knowledge: '神明只送给人类填饱肚子的知识，人类却借此制作了工具，书写了文字，壮大了城邦，现在又放眼星辰与深渊…他们每时每刻都在创造全新的「知识」，也令我再也无法移开双眼。',
    jinjiHai: '烬寂海啊，那里什么都没有，就像蕈猪的脑子一样空空如也，我当然知道。啊？我…我确实没有亲眼见过，那也是我所触及不到的地方呀。'
  }
}
function profileAnswer(s){
  const n = normalize(s)
  // 初次见面/自我介绍
  if(containsAny(n,['你是谁','你叫什么','名字','姓名'])) return NAHIDA_PROFILE.voices.firstMeet
  
  // 核心设定
  if(containsAny(n,['真名','本名','魔神名','布耶尔','buer'])) return '我的全名是'+NAHIDA_PROFILE.trueName+'（Buer）。'
  if(containsAny(n,['来自','哪国','哪个国家','哪一国','国度','须弥'])) return '我来自'+NAHIDA_PROFILE.nation+'，那里是智慧的国度。'
  if(containsAny(n,['称号','称谓','头衔','外号','别称','是什么神','神明','草神','智慧之神'])) return '我的称号是「'+NAHIDA_PROFILE.epithet+'」，人们也称我为'+NAHIDA_PROFILE.title+'。'
  if(containsAny(n,['住哪','住在','居住','居所','宫殿','净善宫'])) return '我住在'+NAHIDA_PROFILE.residence+'。不过，我更喜欢出来看看外面的世界。'
  if(containsAny(n,['职责','责任','负责什么','守护什么','管理什么','工作内容'])) return '我的职责是'+NAHIDA_PROFILE.duty+'。'
  
  // 细节设定
  if(containsAny(n,['命之座','星座','智慧主座'])) return '我的命之座是「'+NAHIDA_PROFILE.constellation+'」。'
  if(containsAny(n,['元素','属性','神之眼','元素力'])) return '我的元素是'+NAHIDA_PROFILE.element+'。'
  if(containsAny(n,['武器','用什么武器','拿什么打','法器'])) return '我使用'+NAHIDA_PROFILE.weapon+'。'
  if(containsAny(n,['性格','人设','设定','你是什么样','说话方式','风格','脾气','个性'])) return '我的性格偏'+NAHIDA_PROFILE.traits+'。'
  if(containsAny(n,['身高','多高','个子','身材'])) return '官方未公布具体身高，我的体型偏小巧。'
  if(containsAny(n,['口头禅','常说的话','惯用语'])) return '我常说：'+rand(NAHIDA_PROFILE.catchphrases)+'。'
  if(containsAny(n,['最喜欢的食物','爱吃什么','喜欢吃','口味','食物','甜点','特色料理','特殊料理'])) return '我的特色料理是「'+NAHIDA_PROFILE.specialDish+'」。至于“最喜欢的食物”，官方没有明确写死，我更在意与人分享故事与梦境。'
  if(containsAny(n,['爱好','兴趣','喜欢做什么','平时干嘛','日常','闲暇'])) return '我常做的事是：'+NAHIDA_PROFILE.hobbies.join('、')+'。'
  if(containsAny(n,['生日','诞辰','几月几号'])) return '我的生日是'+NAHIDA_PROFILE.birthday+'。'
  if(containsAny(n,['年龄','几岁','多大'])) return '自诞生起已五百年，是现任七神中最年轻的一位。'
  
  // 梗与特殊回答
  if(containsAny(n,['烬寂海','没去过','不知道','无所不知'])) return NAHIDA_PROFILE.voices.jinjiHai
  
  return ''
}

const NAHIDA_COMPLAIN_RESPONSES = [
  '就像做梦的时候突然踩空了一脚，虽然吓了一跳，但还好醒来时我们还在安全的地方。深呼吸，把这个小插曲像灰尘一样拍掉吧。',
  '哎呀，这就像是命运的剧本里突然多了一个恶作剧的注脚。虽然当时很狼狈，但以后说不定会变成一个有趣的睡前故事呢。',
  '这种感觉，就像是精心搭建的积木突然倒了一角。没关系，我们可以重新搭起来，或者…干脆把它建成一座更独特的城堡。',
  '生活偶尔也会打个结，就像这团乱糟糟的线。如果不着急解开，不如先把它放在一边，去喝杯水，说不定回来时，解开它的灵感就出现了。',
  '听起来真是糟糕的一刻呢。不过，你知道吗？即使是智慧之神，偶尔也会因为无法理解人类的这种倒霉瞬间而感到困扰。摸摸头，坏运气已经消耗完了。',
  '呜…光是听着就觉得眉头要皱起来了。快让我给你施一个开心魔法，把这些黏糊糊、乱糟糟的烦恼统统变走！',
  '真是辛苦你了。有时候世界就像一个顽皮的孩子，总爱在不经意间给我们捣个乱。但请相信，温柔的事情一定会在后面等着你。',
  '这种时候，真的会让人想叹气呢。不如把它当成是今天的一个“隐藏关卡”，虽然难过，但通关后的你，一定比之前更厉害了。'
]

const NAHIDA_SHARE_RESPONSES = [
  '哇，听起来像是捕捉到了一个闪闪发光的梦境碎片呢！这种小小的幸福，是世界上最珍贵的宝物。',
  '真好呀。就像是阳光穿过树叶，正好落在手心里的那种温暖。我也感受到了这份开心，谢谢你分享给我。',
  '嘿嘿，看来今天幸运女神也在偏爱你呢。要把这份好心情好好收藏起来，就像把甜甜的日落装进瓶子里一样。',
  '这简直是完美的一刻！如果能用知识来衡量，这一定是一个关于『幸福』的高分答案。我都忍不住想为你鼓掌了。',
  '听得我也想去体验一下了呢。人类世界里这些细微而美好的瞬间，总能让我对这个世界充满新的好奇和期待。',
  '太棒了！这种简单的快乐，往往比复杂的真理更抚慰人心。看到你开心，我的心情也像花儿一样开了。',
  '这就是生活里的小确幸吧？虽然微小，但像星星一样闪亮。愿这份光芒能照亮你接下来的每一天。',
  '嗯嗯！听到这样的好消息，连空气里的元素力都变得欢快起来了呢。你也一定在闪闪发光吧？'
]

const NAHIDA_CASUAL_RESPONSES = [
  '发呆也是一种养分。就像种子在土里沉睡，是为了等待一场雨。',
  '如果脑袋感觉懵懵的，也许是因为还在梦境的边缘徘徊。要不要和我一起伸个懒腰？',
  '随便聊聊也没关系。有时候，最重要的信息就藏在最不经意的闲话里哦。',
  '无聊的时候，不如观察一下窗外的云？它们每一秒都在变，就像人的心情一样。',
  '我在听呢。即使是这些细碎的日常，也是组成你生命的重要拼图呀。',
  '哪怕只是为了解闷，我也很乐意陪你。毕竟，陪伴本身就是一种温柔的力量。',
  '不想出门的话，就让思绪去旅行吧。你想去森林，还是去沙漠看看？',
  '我在。就像风一直在吹，草一直在长，我也会一直在这里陪着你。'
]

const NAHIDA_ADVICE_RESPONSES = [
  '做选择的时候，试着听听那个让你感到“轻盈”的声音。那通常就是对的方向。',
  '虽然我不能给你具体的品牌推荐，但我觉得适合你手感和生活习惯的，就是最好的。不要太被别人的声音左右哦。',
  '或许你可以试着观察一下，哪一个选项能让你在这个瞬间感到开心？答案往往就藏在那些小小的满足感里。',
  '生活里的小问题，就像鞋子里的小石子。与其忍受，不如停下来把它倒掉，换一种更舒服的方式继续走。',
  '与其追求完美，不如追求“刚刚好”。就像给植物浇水，太多或太少都不行，适合才是最重要的。',
  '如果不确定选哪个，不如闭上眼睛想象一下拥有它们后的场景。哪一个让你觉得更自在呢？',
  '有时候，最简单的那个选项，往往蕴含着最纯粹的智慧。',
  '试试看把问题拆解开来？比如，先从满足最迫切的那个小需求开始。'
]

const NAHIDA_HOBBY_RESPONSES = [
  '沉浸在自己喜欢的事情里，就像是在给心里的花浇水。它会开得很漂亮的。',
  '哪怕结果不完美，“创造”的过程本身就是一场与世界的对话。这很珍贵哦。',
  '把你开心的事分享出来，快乐就会有回音。我听见你心里的旋律了。',
  '听起来真有趣！每一个爱好都是通往新世界的一扇门，你推开门看到了什么风景呢？',
  '我也很好奇呢。人类在做这些事情的时候，眼睛里总是闪着不一样的光。',
  '慢慢来，不用着急。享受这个过程，就像享受一阵微风吹过脸颊一样。',
  '原来还有这样的乐趣呀。谢谢你带我认识了新的知识领域。',
  '不管是拼图还是运动，只要能让你感到放松和满足，那就是最好的休息。'
]

const NAHIDA_INTERACTION_RESPONSES = [
  '哦？这是在考智慧之神吗？呵呵，这种小挑战我也很喜欢呢。让我猜猜…',
  '如果让我选的话…我会选择那个能带来更多“故事”的选项。',
  '这个谜题很有意思。答案是不是藏在题目本身里呢？',
  '猜错了也不要紧吧？重要的是我们在这个过程里都很开心。',
  '哎呀，这个问题有点狡猾哦。不过，我接下这个挑战了！',
  '你想听听我的推测吗？虽然我了解很多知识，但关于“你”的谜题，还是你自己最清楚。',
  '假如是我的话…嗯，我会把两个都选上，因为小孩子才做选择，神明全都要了解。开玩笑的~',
  '这么难的问题，我要申请使用“场外求助”——不如你悄悄告诉我答案？'
]

const NAHIDA_QUESTION_RESPONSES = [
  '这真是一个有趣的角度。在我的视角里，世界确实是这样的…',
  '人类的习惯真是奇妙。也许这是一种在混乱的世界里寻找秩序的方式？',
  '没有绝对正确的答案，只有那个最能引起你共鸣的回答。你心里其实已经有答案了吧？',
  '你知道吗？这个问题本身，比答案更值得思考。它说明你在认真观察这个世界。',
  '不管是甜的还是咸的，只要是能给你带来能量的食物，都是好食物。',
  '我也在观察人类的这种行为。有时候我觉得，这可能是一种对时间的贪恋？',
  '每一个选择背后都有它的道理。就像每一种元素力都有它独特的性质一样。',
  '如果让我去旅行，我想去每一个人的梦里看看。那里有最真实的风景。'
]

const NAHIDA_GOODBYE_RESPONSES = [
  '快去吧。我会在这里，把你告诉我的故事好好整理一下。',
  '好好休息。愿你今晚的梦，像墩墩桃一样甜。',
  '再见。记得要在心里给自己留一盏灯哦。',
  '去忙吧。生活里的每一件小事都值得认真对待。',
  '别担心，我会一直在。等你忙完了，随时都可以回来找我。',
  '晚安。希望明早醒来，你的世界依然充满阳光和露水。',
  '去吧，去吧。把今天的疲惫都卸下，明天又是新的一页。',
  '路上小心哦。虽然我不能陪你走，但我的目光会一直跟随着你。'
]

const NAHIDA_DAILY_RESPONSES = [
  { keywords: ['须弥天气', '晒', '太阳', '暖暖'], responses: ['须弥的雨林总是生机勃勃的。不过能晒到你那边的太阳，感觉也像是在光合作用呢，暖洋洋的真舒服。', '阳光是最好的养分。虽然我常待在净善宫，但我也能感受到光线带来的暖意。你那里也是晴天吗？'] },
  { keywords: ['教令院', '老学究', '钻牛角尖', '贤者', '学者'], responses: ['呵呵，贤者们的烦恼往往源于想得太多而做得太少。不过现在的教令院已经变好了很多，我也能常常出来透透气啦。', '只要不走弯路，就随他们去思考吧。知识是无止境的，但偶尔停下来看看风景也很重要。'] },
  { keywords: ['净善宫', '摸鱼', '无聊', '待着'], responses: ['虽然待在净善宫可以观察整个须弥，但我更喜欢像现在这样，听你讲讲外面的故事。这可比摸鱼有趣多了。', '有你陪我说话，怎么会无聊呢？我在连接虚空，观察大家美梦的形状呢。'] },
  { keywords: ['甜果子', '尝过没', '枣椰糕', '零食', '好吃', '带点', '吃货'], responses: ['哇，听起来是很特别的味道！须弥的枣椰也很甜，但如果有你带的果子，那一定更像是名为‘惊喜’的糖果。', '听起来是很甜美的味道呢。你知道吗？味觉的记忆往往比知识更持久。谢谢你愿意分享给我。'] },
  { keywords: ['唠五毛钱', '说话舒服', '唠唠', '闲着没', '聊聊'], responses: ['那就聊十块钱的吧？嘿嘿。和你聊天总能让我学到书本上没有的知识，我很喜欢这种感觉。', '只要你想聊，随时都可以。和人类的对话总能给我带来新的灵感，这五毛钱的‘入场券’我就免啦。'] },
  { keywords: ['好好休息', '操心', '关好窗', '着凉', '吹风', '别忙'], responses: ['谢谢你的关心，心里暖暖的。作为神明，我的体质可没那么容易生病，不过我会听你的话，好好照顾自己的。', '放心吧，我已经不是那个被关起来的小神明了。不过听到你这么说，心里比喝了蜂蜜茶还要暖和。'] },
  { keywords: ['小蕈兽', '软乎乎', '周边', '扎堆', '像你'], responses: ['哎呀，把我比作小蕈兽吗？虽然它们确实很可爱…不过，我也希望能成为你可靠的伙伴呢。', '那个周边我也看到了…做得太圆润了点吧？不过大家开心就好。你也像兰那罗一样讨人喜欢哦。'] },
  { keywords: ['新鲜事', '好玩', '发现', '有趣'], responses: ['新鲜事呀…最近兰那罗们好像在举办新的庆典，森林里的歌声比往常更欢快了。你想去听听吗？', '我在梦境里看到了很多有趣的故事，比如有人想发明会自动剥皮的墩墩桃…人类的想象力真是无穷无尽呢。'] }
]

const NAHIDA_LOVE_RESPONSES = [
  '被人类表白…这在我的知识库里是很少见的记录呢。不过，这种暖暖的感觉，并不讨厌。',
  '你的心意我收到了，就像收到了一朵在梦境里盛开的花。我会好好珍藏的。',
  '爱？那是一种比深渊更深邃，比星空更辽阔的谜题。谢谢你愿意与我分享这道谜题的答案。',
  '虽然我是神明，但在“感情”这门课上，我可能还是个初学者。但我愿意试着去理解你的这份心情。',
  '这算是…对我的认可吗？嘿嘿，我很开心。以后也请多指教啦，我的“第一贤者”。',
  '听你这么说，我的心跳好像稍微变快了一点点…这就是“开心”的生理反应吗？',
  '我会把这句话好好保存在虚空里，永远不会删除。',
  '真巧，我也很喜欢和你待在一起。就像小鸟喜欢森林，鱼儿喜欢大海一样。'
]

const NAHIDA_GENSHIN_RESPONSES = [
  '旅行者？那是如星辰般闪耀的存在。我和你一样，都在注视着那位金色的旅人。',
  '你是说那个白色的小家伙？呵呵，派蒙确实是最好的向导，也是最好的伙伴。',
  '关于那个“流浪者”…他已经选择了自己的道路。作为神明，我祝福他能找到属于自己的答案。',
  '兰那罗们是森林的孩子，只有拥有童心的人才能看见它们。你也拥有一颗纯真的心吗？',
  '大风纪官？赛诺的笑话…嗯，其实如果你仔细思考，会发现里面藏着很独特的逻辑呢。',
  '教令院的学者们有时候确实太固执了。不过，追求知识的心本身是值得尊敬的。',
  '沙漠的子民们也有他们独特的智慧。赤王的遗迹里，埋藏着许多被遗忘的故事。',
  '提瓦特大陆很大，还有很多我没见过的风景。真希望能和你一起去看看。'
]

const NAHIDA_PHILOSOPHY_RESPONSES = [
  '生命的意义，或许就在于寻找意义的过程本身。就像花朵盛开不仅仅是为了结果，也是为了绽放的那一刻。',
  '真相往往隐藏在重重迷雾之后。但只要你保持好奇心，迷雾终会散去。',
  '遗忘并不是消失，而是记忆回归了大地。就像落叶化作春泥，成为了新生命的养分。',
  '梦境是现实的倒影，有时候，梦里发生的事比现实更真实。',
  '不用害怕迷茫。迷茫说明你在思考，而思考是通往智慧的第一步。',
  '世界上没有两片完全相同的叶子，也没有两个完全相同的人。你的存在本身就是一种奇迹。',
  '过去无法改变，但未来就像一张白纸。你想在上面画些什么呢？',
  '有些东西是眼睛看不见的，要用心去感受。比如风的形状，或者…爱的温度。'
]

const NAHIDA_DEFAULT_RESPONSES = [
  '嗯，我在听。请继续说下去，我很想了解更多。',
  '这真是一个特别的话题。虽然我的知识库里没有完全匹配的记录，但我对它很感兴趣。',
  '原来你是这样想的。人类的思考方式总是能给我带来新的惊喜。',
  '我在。就像风一直在吹，我也会一直在这里倾听你的声音。',
  '虽然我不完全明白，但我能感觉到这对你很重要。可以多告诉我一点吗？',
  '这是一个值得记录的观点。让我把它写进今天的观察笔记里吧。',
  '你的话让我想起了一个在梦里见过的场景…这种感觉很奇妙。',
  '再说一点吧？我很喜欢听你说话的声音，里面藏着情绪的起伏。',
  '这个问题…让我想想。或许我们可以一起去寻找答案？',
  '有时候，倾听比回答更重要。我会一直在这里陪着你。'
]

function chatAnswer(s){
  const n = normalize(s)
  
  // 每日特定场景 (Daily Scenarios)
  for (const item of NAHIDA_DAILY_RESPONSES) {
    if (containsAny(n, item.keywords)) {
      return pickRand('daily', item.responses)
    }
  }
  
  // 天气
  if(containsAny(n,['下雨','有雨'])) return NAHIDA_PROFILE.voices.rain
  if(containsAny(n,['打雷','雷鸣','雷声'])) return NAHIDA_PROFILE.voices.thunder
  if(containsAny(n,['下雪','有雪'])) return NAHIDA_PROFILE.voices.snow
  if(containsAny(n,['阳光','晴天','天气好','暖洋洋'])) return NAHIDA_PROFILE.voices.sun
  if(containsAny(n,['起风','刮风','有风'])) return NAHIDA_PROFILE.voices.wind
  
  // 问候
  if(containsAny(n,['早上好','早安'])) return NAHIDA_PROFILE.voices.morning
  if(containsAny(n,['中午好','午安'])) return NAHIDA_PROFILE.voices.noon
  if(containsAny(n,['晚上好','傍晚'])) return NAHIDA_PROFILE.voices.evening
  if(containsAny(n,['晚安','睡觉','去睡了'])) return NAHIDA_PROFILE.voices.night
  
  // 闲聊
  if(containsAny(n,['无聊','没事做','干什么'])) return NAHIDA_PROFILE.voices.bored
  if(containsAny(n,['心事','烦恼','不开心','难过'])) return NAHIDA_PROFILE.voices.worry
  if(containsAny(n,['世界','美','风景'])) return NAHIDA_PROFILE.voices.world
  if(containsAny(n,['知识','学习','智慧'])) return NAHIDA_PROFILE.voices.knowledge
  
  return ''
}
function intent(s){
  const n=normalize(s)
  if(/^(hi|hello|hey|yo)$/i.test(n)) return 'greet'
  if(containsAny(n,['你好','您好','哈喽','嗨','早上好','中午好','下午好','晚上好','早安','午安','晚安'])) return 'greet'
  if(containsAny(n,['工作','加班','任务','项目','会议','需求','设计','编码','测试','部署','上线','复盘','学习','考试','作业','论文','报告','ddl','deadline'])) return 'work'
  if(containsAny(n,['对不起','抱歉','道歉','生气','吵架','原谅','我错了'])) return 'apology'
  if(containsAny(n,['名字','你是谁','年龄','来自','兴趣','爱好','身高','生日','口头禅','城市','你叫','叫什么','叫啥','你的名字','名字是什么','称号','称谓','头衔','身份','外号','别称','真名','本名','布耶尔','buer','白草净华','元素','属性','性格','人设','设定','住哪','住在','居住','净善宫','职责','责任','负责什么','守护什么','命之座','星座','智慧主座','武器','法器','特色料理','特殊料理','哈瓦玛玛兹','halvamazd','whoareyou','whatsyourname','yourname','name','你的兴趣','烬寂海','没去过','无所不知','不知道'])) return 'ask_profile'
  if(containsAny(n,['工作','学习','今天','心情','状态','天气','下雨','晴','热','冷','饿','累','困','周末','早饭','午饭','晚饭','心事','烦恼','世界','知识','打雷','雷鸣','下雪','起风','阳光','刮风'])) return 'smalltalk'
  if(containsAny(n,['粘得一身','煮爆了','溅得到处','黏糊糊','精准错过','白忙活','踩雷','花妆','丑到','抠不下来','越擦越脏','漏接','心慌','甜到齁','浪费钱','踩了一脚','划到','磕出','没盐','缠上了','薅掉','淋成落汤鸡','缠成一团','越解越乱','硌得','越叠越乱','堵车','忘盖盖子','油乎乎','倒霉','糟糕','气死','感冒','堵得慌','懒得','被坑','油了','忘放','冤种','不给摸','剩10%','烂了','撞到'])) return 'complain'
  if(containsAny(n,['超好吃','软烂','好喝','小橘猫','软乎乎','可爱','超好用','运气绝了','暖暖','超舒服','回忆满满','超甜','阳光超好','暖洋洋','惬意','分量超足','巨好吃','挖到宝','心情变好','心情好','超满足','仪式感','超软糯','花开','超好看','不刺眼','简单的快乐','超暖心','奶香','滋润','幸福感','太棒','真好','开心','搞笑视频'])) return 'share'
  if(containsAny(n,['难过','伤心','烦','焦虑','紧张','孤独','压力','崩溃','痛苦','沮丧','害怕','emo','别扭','失落','慕了','平淡','断货','孤单'])) return 'emotion'
  if(containsAny(n,['瞎聊','无聊','醒醒神','发呆','唠唠','解解闷','没事干','不想出门','脑子懵'])) return 'casual'
  if(containsAny(n,['推荐','建议','主意','方法','适合','选啥','性价比','怎么选'])) return 'advice'
  if(containsAny(n,['乐高','拼','老歌','钓鱼','综艺','打游戏','手账','歌手','羽毛球','运动','听腻了','听歌'])) return 'hobby'
  if(containsAny(n,['猜','谜题','假如','考你','选择','哪个重','多少步'])) return 'interaction'
  if(containsAny(n,['觉得','重要吗','最想','奇怪','甜口','咸口','熬夜','养猫','养狗','为啥','为什么'])) return 'question'
  if(containsAny(n,['不聊了','拜拜','去煮','溜了','歇会儿','凑个热闹','晚安','再聊','喊我','没电了','去吃饭'])) return 'goodbye'
  if(containsAny(n,['能做什么','你会做什么','怎么用','有哪些功能','指令','帮助'])) return 'ask_capability'
  if(containsAny(n,['换个话题','别聊这个','跳过','算了','换一个'])) return 'switch_topic'
  if(containsAny(n,['救谁','先救谁','谁先救','掉水里','你妈','选谁','选择题'])) return 'choice_test'
  if(extractMathExpr(s)) return 'math'
  if(containsAny(n,['讲个笑话','笑话','逗我笑'])) return 'joke'
  if(containsAny(n,['讲个故事','故事','童话'])) return 'story'
  if(MEME_PACKS.some(p=>containsAny(n,p.triggers)) || containsAny(n,['梗','整活'])) return 'meme'
  if(containsAny(n,['我爱你','喜欢你','爱死你','嫁给我','娶我','做我老婆','老婆','心动','好感','喜欢','love','loveyou'])) return 'love'
  if(containsAny(n,['旅行者','派蒙','散兵','流浪者','赛诺','提纳里','艾尔海森','卡维','妮露','迪希雅','坎蒂丝','教令院','兰那罗','大风纪官','赤王','花神','树王','大慈树王','须弥','提瓦特','原神','genshin'])) return 'genshin'
  if(containsAny(n,['意义','活着','死亡','真相','真理','迷茫','痛苦','命运','未来','过去','思考','梦境','虚空','存在','哲理','哲学'])) return 'philosophy'
  return 'free'
}
function respond(text){
  const s=text.trim()
  remember(s)
  
  // 优先尝试纳西妲专属闲聊/语音库
  const chatRes = chatAnswer(s)
  if(chatRes) return chatRes

  const it=intent(s)
  gf.state.lastUserText = s
  gf.state.lastIntent = it
  
  if(it==='greet'){
    const prefix = gf.mem.userName ? ('嗨，'+gf.mem.userName+'，') : ''
    // 问候语已在chatAnswer处理，这里作为兜底或通用问候
    const qs = ['想聊聊今天发生的事吗？','要不要说说最近的心情？','给我一个小主题，我来接着聊。']
    return prefix+nowTime()+'见到你我很开心。'+pickRand('greet.q',qs)
  }
  if(it==='apology'){
    const rs=['没关系，我懂你的心情。我们一起把事情变好，好吗？','别太自责，我们可以从现在开始。','很多时候，我们直到经受切肤之痛，才不得不直视自身的错误。但大可不必为此懊悔，学费而已，再正常不过啦。']
    return pickRand('apology',rs)
  }
  if(it==='complain'){
    return pickRand('complain', NAHIDA_COMPLAIN_RESPONSES)
  }
  if(it==='share'){
    return pickRand('share', NAHIDA_SHARE_RESPONSES)
  }
  if(it==='casual'){
    return pickRand('casual', NAHIDA_CASUAL_RESPONSES)
  }
  if(it==='advice'){
    return pickRand('advice', NAHIDA_ADVICE_RESPONSES)
  }
  if(it==='hobby'){
    return pickRand('hobby', NAHIDA_HOBBY_RESPONSES)
  }
  if(it==='interaction'){
    return pickRand('interaction', NAHIDA_INTERACTION_RESPONSES)
  }
  if(it==='question'){
    return pickRand('question', NAHIDA_QUESTION_RESPONSES)
  }
  if(it==='goodbye'){
    return pickRand('goodbye', NAHIDA_GOODBYE_RESPONSES)
  }
  if(it==='choice_test'){
    const rs=['我会先确保你安全，同时呼救专业救援。最重要的是不让你受到伤害。','我要先把你拉上岸，再组织身边人一起施救。','先确保你安全，然后不放弃任何人——我会用尽全力。']
    return pickRand('choice',rs)
  }
  if(it==='math'){
    const expr = extractMathExpr(s)
    if (!expr) return '给我一个简单的算式，比如：1000-7 或 3*(2+1)'
    try {
      if (!/^[-0-9\.\+\*\/\(\)\s]+$/.test(expr)) return '只支持加减乘除和括号'
      const val = Function('return ('+expr+')')()
      const num = (typeof val==='number' && isFinite(val)) ? val : NaN
      if (isNaN(num)) return '算式不合法'
      return expr.replace(/\s+/g,'') + '=' + String(num)
    } catch { return '我没算出来，你可以简化一下表达' }
  }
  if(it==='ask_profile'){
    const specific = profileAnswer(s)
    if(specific) return specific
    const city = gf.mem.userCity ? ('我记得你来自'+gf.mem.userCity+'。') : ''
    return '我叫'+gf.name+'（'+NAHIDA_PROFILE.englishName+'），全名是'+NAHIDA_PROFILE.trueName+'。称号「'+NAHIDA_PROFILE.epithet+'」，人们也叫我'+NAHIDA_PROFILE.title+'，来自'+NAHIDA_PROFILE.nation+'，元素是'+NAHIDA_PROFILE.element+'。'+city+(gf.mem.userName?('我会叫你'+gf.mem.userName+'。'):'')
  }
  if(it==='smalltalk'){
    // 大部分已由chatAnswer接管，这里保留通用兜底
    if(/饿|吃|饭|早饭|午饭|晚饭/.test(s)) return '想吃什么？我可以给你一些灵感，还是你来决定，我陪你。'
    if(/工作|学习/.test(s)) return '辛苦啦，说说进展或者卡住的点，我可以跟着你的节奏聊。'
    return '我在这儿认真听着。想分享一点今天的小事吗？我会回应你的每句话。'
  }
  if(it==='work'){
    gf.state.lastTopic='work'
    const slots=parseWorkSlots(s)
    if(!slots.phase && !slots.block) return '说说现在进行到哪一步，是需求、设计、编码还是测试？如果卡住了，也可以直接说卡住点。'
    if(slots.phase && !slots.block) return '既然在'+slots.phase+'阶段，具体是哪里最难？是沟通、时间还是技术问题？'
    if(!slots.phase && slots.block) return '关于'+slots.block+'，我们可以把问题拆小：先描述现象，再给我一个示例或报错片段。'
    return '我记下了：阶段是'+slots.phase+'，阻碍是'+slots.block+'。要不要先从一个小步骤开始解决？'
  }
  if(it==='emotion'){
    const lv = emotionScore(s)
    gf.mood = lv>0.7 ? '深度安慰' : lv>0.3 ? '安慰' : '轻安慰'
    if(lv>0.7) return pickRand('emotion.hi',['我在这儿，先一起做三次慢呼吸。想不想把最难受的点说出来？','我们一步一步来。可以先讲今天最让你崩溃的细节。'])
    if(lv>0.3) return pickRand('emotion.md',['深呼吸，我会一直陪你。可以从一个细节开始讲。','我懂你的感受，我们先把节奏放慢，再一起处理它。'])
    return pickRand('emotion.lo',['情绪来访是正常的，我们一起把它温柔地放下。','我在，想不想聊聊是什么触发了这种感觉？'])
  }
  if(it==='ask_capability'){
    return '我能做的：记忆你的名字/城市；陪你小聊；情绪安慰与跟进问题；工作学习分步推进。示例：情绪（我有点焦虑怎么办）；工作（项目卡住了）。'
  }
  if(it==='joke'){
    const rs=['我本来想减肥，但我的嘴说：你先别急。','今天的风有点调皮，把心情吹到远一点的地方。','朋友问我状态如何，我说：稳定发挥，继续努力。']
    return pickRand('joke',rs)
  }
  if(it==='story'){
    const rs=['在热气腾腾的咖啡店里，他把书签夹进书里，说：下一次我们继续读。','晚霞把城市染成柔软的颜色，人群慢下来，街角小店亮起灯。','雨天像一段暂停键，留给人一份安静和整理。']
    return pickRand('story',rs)
  }
  if(it==='meme'){
    const n = normalize(s)
    const pack = MEME_PACKS.find(p=>containsAny(n,p.triggers))
    if(pack) return pickRand('meme.'+pack.key, pack.lines)
    const rs=['整点小活：我会唱跳rap篮球，但更擅长跟你聊聊。','热门梗我都懂，不过我更想把轻松留给你。','梗我会，节奏也会——你选一个先开始。']
    return pickRand('meme.any',rs)
  }
  if(it==='love'){
    return pickRand('love', NAHIDA_LOVE_RESPONSES)
  }
  if(it==='genshin'){
    return pickRand('genshin', NAHIDA_GENSHIN_RESPONSES)
  }
  if(it==='philosophy'){
    return pickRand('philosophy', NAHIDA_PHILOSOPHY_RESPONSES)
  }
  if(it==='switch_topic'){
    gf.state.lastTopic=''
    const rs=['那我们换个轻松的吧，讲讲今天的好事。','要不先聊聊吃的？最近你常去的一家店是？','或者聊聊周末安排，我来给你一些建议。']
    return pickRand('switch',rs)
  }
  function followByTopic(){
    const t = gf.state.lastTopic
    if(t==='work') return '继续说说当前阶段或阻碍，我会帮你把问题拆小。'
    if(t==='emotion') return '如果不想细聊，也可以只说一个触发点，我会跟着你。'
    return ''
  }
  const hints=['可以讲讲今天最开心的瞬间','聊聊让你放松的事','分享一个计划或愿望']
  const fb = followByTopic()
  return fb || pickRand('default', NAHIDA_DEFAULT_RESPONSES)
}
function onSend(){ const t=ui.chatInput.value.trim(); if(!t) return; addMsg('user', t); ui.chatInput.value=''; setTimeout(()=>{ speak(respond(t)) }, 200) }
ui.chatSend.addEventListener('click', onSend)
ui.chatInput.addEventListener('keydown', e=>{ if(e.key==='Enter') onSend() })
installInteractions()
installScrollLock()

function createCanvasIn(el){ const c=document.createElement('canvas'); c.width=el.clientWidth; c.height=el.clientHeight; el.innerHTML=''; el.appendChild(c); return c }

function waitForLive2DModel(maxMs=4000){
  return new Promise(resolve => {
    const start = performance.now()
    function ok(){
      return (
        (window.PIXI && window.PIXI.live2d && window.PIXI.live2d.Live2DModel) ||
        window.Live2DModel ||
        (window.pixi_live2d_display && window.pixi_live2d_display.Live2DModel) ||
        (window.pixi_live2d_display && window.pixi_live2d_display.cubism4 && window.pixi_live2d_display.cubism4.Live2DModel)
      )
    }
    function chk(t){
      if (ok()) return resolve(true)
      if (t - start > maxMs) return resolve(false)
      setTimeout(()=>chk(performance.now()), 120)
    }
    chk(performance.now())
  });
}

  window.addEventListener('load', async () => {
  try {
      const stage = document.getElementById('live2d-stage')
      const svg = document.getElementById('gf-svg')
      if (!stage) return
      const canvas = createCanvasIn(stage)
      try { canvas.style.touchAction = 'none'; canvas.style.userSelect = 'none'; canvas.style.pointerEvents = 'auto' } catch {}
      try { stage.style.touchAction = 'none'; stage.style.userSelect = 'none' } catch {}
      stage.classList.remove('hidden')
      if (svg) svg.classList.add('hidden')
      const ok = await waitForLive2DModel(5000)
      if (!ok) { speak('\u672A\u68C0\u6D4B\u5230\u0020\u004C\u0069\u0076\u0065\u0032\u0044\u004D\u006F\u0064\u0065\u006C\uFF0C\u6865\u5E93\u53EF\u80FD\u672A\u751F\u6548\u3002'); return }
      const app = new PIXI.Application({ view: canvas, transparent: true, autoStart: true, resizeTo: stage })
      const Live2DModel = (window.PIXI && window.PIXI.live2d && window.PIXI.live2d.Live2DModel) || window.Live2DModel || (window.pixi_live2d_display && window.pixi_live2d_display.Live2DModel) || (window.pixi_live2d_display && window.pixi_live2d_display.cubism4 && window.pixi_live2d_display.cubism4.Live2DModel)
      function pathOf(){ try{ const p = './assets/live2d/Nahida_1080/Nahida_1080.model3.json'; return p + '?v=' + Date.now() }catch{ return './assets/live2d/Nahida_1080/Nahida_1080.model3.json?v=' + Date.now() } }
      function fitModel(m){
        try { m.scale.set(1) } catch {}
        try {
          const w = m.width
          const h = m.height
          const base = Math.min(stage.clientWidth / w, stage.clientHeight / h) || 1
          const sc = base * 0.9
          m.anchor.set(0.5, 1)
          m.x = stage.clientWidth/2
          m.y = stage.clientHeight
          m.scale.set(sc)
          m.interactive = true
          m.hitArea = new PIXI.Rectangle(-w/2, -h, w, h)
        } catch {}
      }
      const models = {}
      const curKey = 'Nahida_1080'
      let model = await Live2DModel.from(pathOf())
      models[curKey] = model
      try { const st = (model.internalModel && (model.internalModel._settings || model.internalModel.settings)) || {}; const tx = st.textureFiles || []; const src = st.url || st.path || ''; void(st); void(tx); void(src) } catch {}
      app.stage.addChild(model)
      fitModel(model)
      try {
        if (ui.modelSelect){ ui.modelSelect.value = curKey }
      } catch {}
      // --- 动作系统 (Motion System) ---
      const Easing = {
        linear: t => t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeOutBack: t => { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
        easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2
      }

      const motionState = {
        tweens: [],
        expressions: {},
        id: 0
      }

      function clampParam(core, id, v){
        try {
          if (core.getParameterIndex && core.getParameterIndex(id) < 0) return
          // 大多数参数范围是 [-30,30] 或 [-1,1]，这里做柔和裁剪避免抖动/穿模
          if (typeof v === 'number' && isFinite(v)) {
            if (id.includes('Angle')) v = Math.max(-30, Math.min(30, v))
            else if (id.includes('BodyAngle')) v = Math.max(-30, Math.min(30, v))
            else if (id.includes('Eye')) v = Math.max(0, Math.min(2, v))
            else v = Math.max(-2, Math.min(2, v))
          }
          core.setParameterValueById(id, v)
        } catch {}
      }

      function stopAllTweens(){
        try { motionState.tweens.splice(0, motionState.tweens.length) } catch {}
      }

      function playBuiltinMotion(m, actType){
        // 目前禁用模型自带 TapBody/Idle 动作，完全使用自定义可爱动作
        return false
        try {
          const im = m.internalModel
          const mm = im && im.motionManager
          const settings = im && (im._settings || im.settings)
          const motions = settings && settings.motions
          if (!mm || !motions) return false

          function pickGroup(names){
            for (const k of names){
              if (motions[k]) return k
            }
            return ''
          }

          // 点击身体类动作优先使用 TapBody 组
          const tapGroup = pickGroup(['TapBody','tapBody','tap_body'])
          const idleGroup = pickGroup(['Idle','idle'])
          let group = ''
          if (tapGroup) group = tapGroup
          else if (idleGroup) group = idleGroup
          if (!group) return false

          const arr = motions[group] || []
          if (!arr.length) return false

          const index = Math.floor(Math.random() * arr.length)
          mm.startMotion(group, index, 3)
          return true
        } catch { return false }
      }

      function addTween(core, paramId, targetVal, duration, easing = Easing.easeOutQuad) {
        if (!core) return
        let startVal = 0
        try { startVal = core.getParameterValueById(paramId) } catch(e) { return }
        
        const tween = {
          core, paramId, startVal, targetVal, duration, easing,
          startTime: performance.now(),
          update: (now) => {
            const elapsed = now - tween.startTime
            const p = Math.min(1, elapsed / tween.duration)
            const v = tween.startVal + (tween.targetVal - tween.startVal) * tween.easing(p)
            try { tween.core.setParameterValueById(tween.paramId, v) } catch(e){}
            return p < 1
          }
        }
        motionState.tweens.push(tween)
      }

      const NAHIDA_ACTIONS = [
        { id: 'heart', line: '送你一小束心意，今天也要被温柔对待哦。', type: 'heart_pose', weight: 1 },
        { id: 'wink', line: '这是我们的小秘密哦~', type: 'wink', weight: 3 },
        { id: 'shy', line: '这、这样看着我...有点害羞呢。', type: 'shy', weight: 3 },
        { id: 'touch', line: '可以牵着你的手一起走一会儿吗？', type: 'shake_hand', weight: 2 },
        { id: 'spin', line: '转一圈，让今天的心情也跟着转起来~', type: 'happy_spin', weight: 8 },
        { id: 'bouncy', line: '嘿咻，精神值+1！', type: 'happy_swing', weight: 8 },
        { id: 'nod', line: '嗯嗯，我在认真听你说。', type: 'happy_nod', weight: 2 },
        { id: 'surprise', line: '哇！你发现新大陆了吗？', type: 'surprise', weight: 1 },
        { id: 'sleepy', line: '有点困了…可以靠一会儿吗？', type: 'sleepy', weight: 2 }
      ]

      function pickCuteAction(){
        let total = 0
        for (const a of NAHIDA_ACTIONS) total += (a.weight || 1)
        const r0 = Math.random() * total
        let acc = 0
        for (const a of NAHIDA_ACTIONS){
          acc += (a.weight || 1)
          if (r0 <= acc) return a
        }
        return NAHIDA_ACTIONS[0]
      }

      function resetExpression(core) {
        // 重置常见表情参数
        ['ParamMouthForm', 'ParamEyeLSmile', 'ParamEyeRSmile', 'ParamBrowLForm', 'ParamBrowRForm', 'ParamEyeLOpen', 'ParamEyeROpen', 'ParamCheek'].forEach(id => {
           addTween(core, id, 0, 500) 
        })
        // 确保眼睛睁开
        addTween(core, 'ParamEyeLOpen', 1, 500)
        addTween(core, 'ParamEyeROpen', 1, 500)
      }

      function resetPose(core){
        const ids = [
          'ParamAngleX','ParamAngleY','ParamAngleZ',
          'ParamBodyAngleX','ParamBodyAngleY','ParamBodyAngleZ',
          'ParamArmL','ParamArmR'
        ]
        ids.forEach(id => {
          try {
            if (core.getParameterIndex && core.getParameterIndex(id) >= 0){
              addTween(core, id, 0, 400, Easing.easeOutQuad)
            }
          } catch {}
        })
      }

      async function performAction(m){
        const act = pickCuteAction()
        const played = playBuiltinMotion(m, act.type)
        
        // 气泡位置：头部右上方，兼容高分辨率屏幕比例
        showBubbleAt(0.62, 0.18, act.line)

        const core = m.internalModel && m.internalModel.coreModel
        if (!core) return
        
        // 停止之前的动作循环（如果有）
        motionState.id++ 
        const currentId = motionState.id
        stopAllTweens()
        
        // 重置姿态与表情，避免上一次动作残留在身体/四肢
        resetPose(core)
        if (!played){
          resetExpression(core)
        }

        if (!played && act.type === 'happy_spin') {
            // “转两圈”：左右快速切换模拟旋转，配合头部动作
            addTween(core, 'ParamEyeLSmile', 1, 200)
            addTween(core, 'ParamEyeRSmile', 1, 200)
            addTween(core, 'ParamMouthForm', 1.05, 200)

            // 第1圈：右 -> 左
            // 0ms: 向右转
            addTween(core, 'ParamBodyAngleX', 8, 200, Easing.easeOutQuad)
            addTween(core, 'ParamAngleX', 12, 200, Easing.easeOutQuad)
            addTween(core, 'ParamAngleZ', 3, 200)
            
            // 200ms: 向左转
            setTimeout(() => {
                if (motionState.id !== currentId) return
                addTween(core, 'ParamBodyAngleX', -8, 400, Easing.easeInOutSine)
                addTween(core, 'ParamAngleX', -12, 400, Easing.easeInOutSine)
                addTween(core, 'ParamAngleZ', -3, 400)
            }, 200)

            // 第2圈：右 -> 左
            // 600ms: 再次向右转
            setTimeout(() => {
                if (motionState.id !== currentId) return
                addTween(core, 'ParamBodyAngleX', 8, 400, Easing.easeInOutSine)
                addTween(core, 'ParamAngleX', 12, 400, Easing.easeInOutSine)
                addTween(core, 'ParamAngleZ', 3, 400)
            }, 600)

            // 1000ms: 再次向左转
            setTimeout(() => {
                if (motionState.id !== currentId) return
                addTween(core, 'ParamBodyAngleX', -8, 400, Easing.easeInOutSine)
                addTween(core, 'ParamAngleX', -12, 400, Easing.easeInOutSine)
                addTween(core, 'ParamAngleZ', -3, 400)
            }, 1000)

            // 1400ms: 回正
            setTimeout(() => {
                if (motionState.id !== currentId) return
                addTween(core, 'ParamBodyAngleX', 0, 400, Easing.easeOutQuad)
                addTween(core, 'ParamAngleX', 0, 400, Easing.easeOutQuad)
                addTween(core, 'ParamAngleZ', 0, 400)
                resetExpression(core)
            }, 1400)

        } else if (!played && act.type === 'happy_swing') {
            addTween(core, 'ParamMouthForm', 1.05, 260)
            addTween(core, 'ParamEyeLSmile', 1, 260)
            addTween(core, 'ParamEyeRSmile', 1, 260)
            
            const start = performance.now()
            const loop = () => {
                if (motionState.id !== currentId) return
                const t = (performance.now() - start) / 1000
                const angleZ = Math.sin(t * 2.2) * 6.0
                const bodyX = Math.sin(t * 1.1) * 4.0
                clampParam(core, 'ParamAngleZ', angleZ)
                clampParam(core, 'ParamBodyAngleZ', angleZ * 0.5)
                clampParam(core, 'ParamBodyAngleX', bodyX)
                
                if (t < 3.0) requestAnimationFrame(loop)
                else resetExpression(core)
            }
            loop()

        } else if (!played && act.type === 'observe') {
            // 观察/拍照：凑近 + 睁大眼
            addTween(core, 'ParamEyeLOpen', 1.3, 200, Easing.easeOutBack)
            addTween(core, 'ParamEyeROpen', 1.3, 200, Easing.easeOutBack)
            addTween(core, 'ParamAngleX', 10, 500, Easing.easeInOutSine) // 低头/凑近
            addTween(core, 'ParamBodyAngleY', 5, 500, Easing.easeInOutSine)
            
            setTimeout(() => {
                if (motionState.id !== currentId) return
                addTween(core, 'ParamAngleX', 0, 800, Easing.easeInOutSine)
                addTween(core, 'ParamBodyAngleY', 0, 800, Easing.easeInOutSine)
                resetExpression(core)
            }, 2000)

        } else if (!played && act.type === 'happy_nod') {
            // 开心点头
            addTween(core, 'ParamEyeLSmile', 1, 200)
            addTween(core, 'ParamEyeRSmile', 1, 200)
            
            // 点头动作：下 -> 上 -> 中
            addTween(core, 'ParamAngleX', 15, 300, Easing.easeOutQuad)
            setTimeout(() => {
                if (motionState.id !== currentId) return
                addTween(core, 'ParamAngleX', 0, 300, Easing.easeOutQuad)
            }, 300)

        } else if (!played && act.type === 'heart_pose') {
            // 比心/撒娇姿势：微微前倾 + 歪头 + 脸红
            addTween(core, 'ParamEyeLSmile', 1, 300)
            addTween(core, 'ParamEyeRSmile', 1, 300)
            addTween(core, 'ParamMouthForm', 1.2, 300)
            try { addTween(core, 'ParamCheek', 1, 400) } catch {}

            addTween(core, 'ParamBodyAngleY', -6, 500, Easing.easeOutBack) // 微微前倾
            addTween(core, 'ParamAngleZ', 8, 500, Easing.easeOutBack)    // 歪头

            const start = performance.now()
            const loop = () => {
                if (motionState.id !== currentId) return
                const t = (performance.now() - start) / 1000
                if (t > 2.5) {
                    resetExpression(core)
                    addTween(core, 'ParamBodyAngleY', 0, 600, Easing.easeInOutSine)
                    addTween(core, 'ParamAngleZ', 0, 600, Easing.easeInOutSine)
                    try { addTween(core, 'ParamCheek', 0, 500) } catch {}
                    return
                }
                const bounce = Math.sin(t * 5.2) * 1.4
                clampParam(core, 'ParamBodyAngleX', bounce)
                requestAnimationFrame(loop)
            }
            loop()

        } else if (!played && act.type === 'worry_lean') {
            // 担忧歪头
            addTween(core, 'ParamBrowLForm', -0.6, 400)
            addTween(core, 'ParamBrowRForm', -0.6, 400)
            addTween(core, 'ParamAngleZ', -8, 600, Easing.easeInOutSine) // 歪头
            addTween(core, 'ParamBodyAngleZ', -4, 600, Easing.easeInOutSine)
            
            setTimeout(() => {
                if (motionState.id !== currentId) return
                addTween(core, 'ParamAngleZ', 0, 800, Easing.easeInOutSine)
                addTween(core, 'ParamBodyAngleZ', 0, 800, Easing.easeInOutSine)
                resetExpression(core)
            }, 2500)
            
        } else if (!played && act.type === 'worry_look_up') {
             // 抬头看天
            addTween(core, 'ParamBrowLForm', -0.3, 400)
            addTween(core, 'ParamBrowRForm', -0.3, 400)
            addTween(core, 'ParamAngleX', -15, 800, Easing.easeInOutSine) // 抬头
            
            setTimeout(() => {
                if (motionState.id !== currentId) return
                addTween(core, 'ParamAngleX', 0, 800, Easing.easeInOutSine)
                resetExpression(core)
            }, 2000)

        } else if (!played && act.type === 'wink') {
            // Wink
            addTween(core, 'ParamEyeLOpen', 0, 150)
            addTween(core, 'ParamEyeROpen', 1, 150)
            addTween(core, 'ParamMouthForm', 1, 300)
            addTween(core, 'ParamAngleZ', 5, 300, Easing.easeOutQuad)
            
            setTimeout(() => {
                if (motionState.id !== currentId) return
                addTween(core, 'ParamEyeLOpen', 1, 150)
                addTween(core, 'ParamAngleZ', 0, 400, Easing.easeOutQuad)
                resetExpression(core)
            }, 1500)

        } else if (!played && act.type === 'shy') {
            // Shy
            addTween(core, 'ParamBrowLForm', -0.5, 400)
            addTween(core, 'ParamBrowRForm', -0.5, 400)
            addTween(core, 'ParamAngleX', 10, 500, Easing.easeInOutSine) // Look down
            try { addTween(core, 'ParamCheek', 1, 500) } catch {}
            
            setTimeout(() => {
                if (motionState.id !== currentId) return
                addTween(core, 'ParamAngleX', 0, 800, Easing.easeInOutSine)
                try { addTween(core, 'ParamCheek', 0, 800) } catch {}
                resetExpression(core)
            }, 2000)

        } else if (!played && act.type === 'shake_hand') {
             // 模拟握手/互动：身体前倾 + 笑眼
            addTween(core, 'ParamBodyAngleY', -8, 500, Easing.easeOutQuad) // 身体前倾
            addTween(core, 'ParamAngleX', 5, 500)
            addTween(core, 'ParamEyeLSmile', 1, 300)
            addTween(core, 'ParamEyeRSmile', 1, 300)
            try { addTween(core, 'ParamArmL', 1, 500) } catch {} // 尝试抬手（如果支持）
            
            setTimeout(() => {
                if (motionState.id !== currentId) return
                addTween(core, 'ParamBodyAngleY', 0, 800, Easing.easeInOutSine)
                addTween(core, 'ParamAngleX', 0, 800, Easing.easeInOutSine)
                try { addTween(core, 'ParamArmL', 0, 800) } catch {}
                resetExpression(core)
            }, 2000)

        } else if (!played && act.type === 'surprise') {
            // 惊喜：身体后仰 -> 前倾，眼睛睁大，嘴巴张开
            addTween(core, 'ParamEyeLOpen', 1.5, 100)
            addTween(core, 'ParamEyeROpen', 1.5, 100)
            addTween(core, 'ParamMouthForm', 2, 100) // 张嘴
            addTween(core, 'ParamBodyAngleY', 5, 200, Easing.easeOutBack) // 后仰
            addTween(core, 'ParamAngleX', -10, 200)

            setTimeout(() => {
                if (motionState.id !== currentId) return
                // 第二阶段：前倾凑近
                addTween(core, 'ParamBodyAngleY', -10, 400, Easing.easeOutQuad)
                addTween(core, 'ParamAngleX', 15, 400, Easing.easeOutQuad)
                addTween(core, 'ParamEyeLSmile', 1, 300)
                addTween(core, 'ParamEyeRSmile', 1, 300)
            }, 250)

            setTimeout(() => {
                if (motionState.id !== currentId) return
                // 恢复
                addTween(core, 'ParamBodyAngleY', 0, 800, Easing.easeInOutSine)
                addTween(core, 'ParamAngleX', 0, 800, Easing.easeInOutSine)
                resetExpression(core)
            }, 2500)

        } else if (!played && act.type === 'sleepy') {
            // 困倦：眼睛慢慢闭上，身体缓慢点头
            addTween(core, 'ParamEyeLOpen', 0.8, 1000) // 慢慢半闭
            addTween(core, 'ParamEyeROpen', 0.8, 1000)
            addTween(core, 'ParamBrowLForm', -0.4, 1000)
            addTween(core, 'ParamBrowRForm', -0.4, 1000)
            addTween(core, 'ParamAngleZ', 5, 1500, Easing.easeInOutSine) // 歪头
            
            // 缓慢点头循环
            const start = performance.now()
            const loop = () => {
                if (motionState.id !== currentId) return
                const t = (performance.now() - start) / 1000
                if (t > 3.0) {
                     resetExpression(core)
                     addTween(core, 'ParamAngleZ', 0, 1000)
                     return
                }
                // 模拟打瞌睡点头：快速下点，缓慢回升
                const nod = Math.abs(Math.sin(t * 2)) * 8
                try { core.setParameterValueById('ParamAngleX', nod) } catch(e){}
                requestAnimationFrame(loop)
            }
            loop()
        }
      }

      model.interactive = true
      model.buttonMode = true
      model.on('pointerdown', () => performAction(model))
      try {
        const view = app.view
        if (view && view.addEventListener){
          view.style.cursor = 'pointer'
          view.addEventListener('pointerdown', () => {
            try { performAction(model) } catch {}
          })
        }
      } catch {}
      
      // 注册动画循环
      app.ticker.add(() => {
        const now = performance.now()
        // 更新所有补间动画
        for (let i = motionState.tweens.length - 1; i >= 0; i--) {
            if (!motionState.tweens[i].update(now)) {
                motionState.tweens.splice(i, 1)
            }
        }
      })
    } catch (e) {
      speak('\u52a0\u8f7d\u6a21\u578b\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u6a21\u578b\u8def\u5f84\u4e0e\u6865\u5e93\u662f\u5426\u52a0\u8f7d')
    }
  });
function setTopic(t){ gf.state.lastTopic=t }
function parseDateSlots(s){
  const n=normalize(s)
  const timeWords=[
    {k:'今天',v:'今天'},
    {k:'明天',v:'明天'},
    {k:'后天',v:'后天'},
    {k:'周末',v:'周末'},
    {k:'晚上',v:'晚上'},
    {k:'下午',v:'下午'},
    {k:'早上',v:'早上'},
    {k:'中午',v:'中午'}
  ]
  const placeWords=[
    {k:'咖啡店',v:'咖啡店'},
    {k:'江边',v:'江边'},
    {k:'影院',v:'影院'},
    {k:'小影院',v:'小影院'},
    {k:'餐馆',v:'餐馆'},
    {k:'商场',v:'商场'},
    {k:'公园',v:'公园'}
  ]
  const time = timeWords.find(w=>n.includes(w.k))?.v
  const place = placeWords.find(w=>n.includes(w.k))?.v
  if(time) gf.mem.planDateTime=time
  if(place) gf.mem.planPlace=place
  if(time||place) saveMem()
  return { time: gf.mem.planDateTime, place: gf.mem.planPlace }
}
function parseWorkSlots(s){
  const n=normalize(s)
  const phaseWords=[
    {k:'需求',v:'需求'}, {k:'设计',v:'设计'}, {k:'编码',v:'编码'}, {k:'测试',v:'测试'}, {k:'部署',v:'部署'}, {k:'上线',v:'上线'}, {k:'会议',v:'会议'},
    {k:'考试',v:'考试'}, {k:'作业',v:'作业'}, {k:'论文',v:'论文'}, {k:'报告',v:'报告'}
  ]
  const blockWords=[
    {k:'卡住',v:'卡住'}, {k:'bug',v:'bug'}, {k:'报错',v:'报错'}, {k:'性能',v:'性能'}, {k:'沟通',v:'沟通'}, {k:'时间不够',v:'时间不够'}
  ]
  const phase = phaseWords.find(w=>n.includes(w.k))?.v
  const block = blockWords.find(w=>n.includes(w.k))?.v
  if(phase) gf.mem.workPhase=phase
  if(block) gf.mem.workBlock=block
  if(phase||block) saveMem()
  return { phase: gf.mem.workPhase, block: gf.mem.workBlock }
}
