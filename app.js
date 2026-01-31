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
    encourage: '没关系，跌倒了可以再站起来。我会一直看着你的。',
    comfort: '别难过，我们把这些不开心的事，都变成梦境里的泡泡，戳破它们就好啦。',
    chat_start: '嗯？我在听，你想说什么都可以哦。',
    chat_end: '今天也很开心呢，要记得把快乐也存进记忆里哦。',
    // 互动动作反馈
    touch_head: '哎呀，有点痒…不过，并不讨厌呢。',
    touch_body: '嗯？是想和我玩游戏吗？',
    touch_arm: '牵手吗？好呀，我们一起走。',
  },
  // 动作映射
  motions: {
    idle: 'Idle',
    happy: 'Happy',
    sad: 'Sad',
    angry: 'Angry',
    surprise: 'Surprise',
    thinking: 'Thinking',
    shy: 'Shy',
    wave: 'Wave',
    nod: 'Nod',
    shake: 'Shake'
  }
}
async function chat(text) {
  remember(text)
  const n = normalize(text)
  
  // 1. 表情包匹配
  for(const pack of MEME_PACKS){
    if(containsAny(text, pack.triggers)){
      const line = rand(pack.lines)
      speak(line)
      if(['muyu','bailan','tangping'].includes(pack.key)) gf.mood='平静'
      else if(['rap','dance','ikun','ball'].includes(pack.key)) gf.mood='开心'
      else if(['sheke','emo'].includes(pack.key)) gf.mood='难过'
      else gf.mood='开心'
      updateModel()
      return
    }
  }

  // 2. 数学计算
  const mathExpr = extractMathExpr(text)
  if(mathExpr.length > 2){
    try {
      // 安全计算
      const res = Function('"use strict";return (' + mathExpr + ')')()
      if(res !== undefined && !isNaN(res) && isFinite(res)){
        speak(`让我算算… ${mathExpr} 等于 ${res}。对吗？`)
        gf.mood = '思考'
        updateModel()
        return
      }
    } catch {}
  }
  
  // 3. 基础闲聊匹配
  if(containsAny(text, ['你好','hello','hi','嗨'])) {
    speak(pickRand('hello', ['你好呀！','我在呢。','嗨，今天心情怎么样？']))
    gf.mood = '开心'
  } else if(containsAny(text, ['名字','是谁'])) {
    speak('我是纳西妲，须弥的草神。也是你随时可以倾诉的朋友。')
  } else if(containsAny(text, ['再见','拜拜'])) {
    speak('要走了吗？路上小心，记得想我哦。')
  } else if(containsAny(text, ['喜欢','爱'])) {
    speak('我也很喜欢和你在一起的时光呢。')
    gf.mood = '开心'
  } else if(containsAny(text, ['笨','傻'])) {
    speak('每个人都有不擅长的时候，这正是学习的机会呀。')
    gf.mood = '疑惑'
  } else if(containsAny(text, ['谢谢'])) {
    speak('不用客气，能帮到你就好。')
    gf.mood = '开心'
  } else if(containsAny(text, ['累','休息'])) {
    speak('那就好好休息一下吧，在梦里可是什么烦恼都没有的。')
    gf.mood = '关心'
  } else if(containsAny(text, ['吃','饿'])) {
    speak('要记得按时吃饭哦。我推荐尝尝枣椰蜜糖，很甜的。')
  } else if(containsAny(text, ['早安','早上好'])) {
    speak(NAHIDA_PROFILE.voices.morning)
  } else if(containsAny(text, ['晚安'])) {
    speak(NAHIDA_PROFILE.voices.night)
  } else if(containsAny(text, ['无聊'])) {
    speak(NAHIDA_PROFILE.voices.bored)
  } else if(containsAny(text, ['难过','不开心'])) {
    speak(NAHIDA_PROFILE.voices.comfort)
    gf.mood = '难过'
  } else {
    // 4. 兜底回复
    const score = emotionScore(text)
    if(score > 0.5){
      speak('看起来你现在很难过…想哭就哭出来吧，我会一直陪着你的。')
      gf.mood = '难过'
    } else if(text.endsWith('?') || text.endsWith('？')){
      speak('这是一个值得思考的问题呢…让我们一起找找答案吧。')
      gf.mood = '思考'
    } else {
      const fallback = [
        '嗯嗯，我在听。',
        '原来是这样啊…',
        '这很有趣呢，能多和我说说吗？',
        '你知道吗？每一个想法都像一颗种子，会开出不同的花。',
        '虽然我还没完全听懂，但我能感受到你的心情。'
      ]
      speak(pickRand('fallback', fallback))
      gf.mood = '平静'
    }
  }
  updateModel()
}

// 简单的模型状态更新模拟 (实际需要 Live2D API)
function updateModel(){
  // 这里可以调用 live2d 模型的动作触发接口
  // 例如: model.motion('TapBody')
  console.log('Update Model Mood:', gf.mood)
  
  // 简单触发一个动作
  try {
    if(window.l2dModel){
      let motionGroup = 'Idle'
      if(gf.mood === '开心') motionGroup = 'Happy' // 假设有 Happy 组
      else if(gf.mood === '难过') motionGroup = 'Sad'
      else if(gf.mood === '思考') motionGroup = 'Thinking'
      else if(gf.mood === '关心') motionGroup = 'Nod'
      else if(gf.mood === '疑惑') motionGroup = 'Thinking'
      
      // 随机触发该组的一个动作
      window.l2dModel.motion(motionGroup)
    }
  } catch(e) { console.error(e) }
}

async function initLive2D() {
  const stage = document.getElementById('live2d-stage')
  if(!stage) return
  stage.classList.remove('hidden')

  try {
    // 检查 PIXI 是否加载
    if(!window.PIXI) {
       console.error('PIXI not loaded')
       return
    }
    
    // 初始化 Live2D
    // 注意: 这里假设使用了 pixi-live2d-display 库
    // 实际路径需要根据 fetch_libs.py 下载的路径调整
    // 纳西妲模型路径 (假设用户已经上传了模型到 assets/live2d/Nahida_1080)
    const modelUrl = 'assets/live2d/Nahida_1080/Nahida_1080.model3.json' 
    
    // 如果没有 Nahida，尝试加载 fetch_libs 下载的 Hiyori 示例
    // const modelUrl = 'assets/live2d/Hiyori/Hiyori.model3.json'

    const model = await PIXI.live2d.Live2DModel.from(modelUrl)
    window.l2dModel = model
    
    const app = new PIXI.Application({
      view: document.createElement('canvas'),
      transparent: true,
      autoDensity: true,
      resizeTo: stage
    })
    stage.appendChild(app.view)
    
    app.stage.addChild(model)
    
    // 调整模型大小和位置
    const scaleX = stage.clientWidth / model.width
    const scaleY = stage.clientHeight / model.height
    const scale = Math.min(scaleX, scaleY) * 0.9 // 留一点边距
    
    model.scale.set(scale)
    model.x = (stage.clientWidth - model.width) / 2
    model.y = (stage.clientHeight - model.height) / 2 + (stage.clientHeight * 0.1) // 稍微靠下

    // 绑定点击事件
    model.on('hit', (hitAreas) => {
      if(hitAreas.includes('Body')){
        model.motion('TapBody')
        speak(NAHIDA_PROFILE.voices.touch_body)
      } else if(hitAreas.includes('Head')){
        model.motion('TapHead')
        speak(NAHIDA_PROFILE.voices.touch_head)
      }
    })

    // 问候
    setTimeout(() => {
        speak(NAHIDA_PROFILE.voices.firstMeet)
        model.motion('Start')
    }, 1000)

  } catch (e) {
    console.error('Live2D init failed:', e)
    addMsg('ai', 'Live2D 模型加载失败，请检查 assets 目录是否完整。')
  }
}

// 事件绑定
ui.chatSend.addEventListener('click', () => {
  const t = ui.chatInput.value.trim()
  if(t){
    addMsg('user', t)
    ui.chatInput.value = ''
    chat(t)
  }
})
ui.chatInput.addEventListener('keypress', (e) => {
  if(e.key === 'Enter') ui.chatSend.click()
})

// 初始化
window.addEventListener('load', () => {
    // 延迟一点初始化 Live2D 以确保库加载
    setTimeout(initLive2D, 500)
})
