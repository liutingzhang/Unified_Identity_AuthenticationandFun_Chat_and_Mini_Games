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
  '听到这个消息，我的心里好像也开出了一朵小花。快乐是可以传染的，现在的我也被你感染了呢。',
  '这真是值得庆祝的一刻！如果是在须弥，我们可能会为此举办一个小小的花神诞祭呢。',
  '你的开心就像一阵清风，吹散了周围所有的沉闷。真希望这样的时刻能像梦境一样，一直延续下去。',
  '太棒了！就像是解开了一个复杂的谜题，得到了最完美的答案。这种成就感，我懂的。',
  '看着你这么开心，我也觉得世界变得更可爱了一点。谢谢你让我见证了这份美好。'
]

// 简单的对话逻辑 (模拟)
// 实际上这里应该调用 server.py 的 API，或者直接在前端做简单的关键词匹配
// 为了让项目即插即用，这里先实现一个简单版本
async function chat(text){
  const n = normalize(text)
  
  // 1. 设定问答
  const profileRes = profileAnswer(text)
  if(profileRes) { speak(profileRes); return }

  // 2. 算术
  const mathExpr = extractMathExpr(text)
  if(mathExpr && mathExpr.length>2){
    try {
      const res = eval(mathExpr) // 安全起见仅本地运行
      speak(`是 ${res} 吗？`)
      return
    } catch {}
  }
  
  // 3. 情绪/meme
  // ... (简化)
  
  // 4. 调用后端 (如果 server.py 在运行)
  try {
    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ text })
    })
    const data = await res.json()
    if(data && data.reply){
        speak(data.reply)
        return
    }
  } catch(e) {
      // 后端不在线，使用本地 fallback
      if(containsAny(n, ['你好','hello','hi'])) { speak('你好呀，我是纳西妲。'); return }
      if(containsAny(n, ['再见','拜拜'])) { speak('再见，要做个好梦哦。'); return }
      
      // 随机回复
      speak('我在听呢。') 
  }
}

// Bind events
ui.chatSend.addEventListener('click', ()=>{
    const t = ui.chatInput.value.trim()
    if(!t) return
    addMsg('user', t)
    ui.chatInput.value = ''
    chat(t)
})
ui.chatInput.addEventListener('keypress', (e)=>{
    if(e.key === 'Enter') ui.chatSend.click()
})

// Init
console.log('App initialized')
