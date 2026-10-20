/* MYTHOS · Optional, self-reported MBTI comparison. No type is inferred here. */
(function (root) {
  'use strict';
  const TYPES = Object.freeze(['ISTJ','ISFJ','INFJ','INTJ','ISTP','ISFP','INFP','INTP','ESTP','ESFP','ENFP','ENTP','ESTJ','ESFJ','ENFJ','ENTJ']);
  const NAMES = {AT:'雅典娜',AP:'阿波罗',HM:'赫尔墨斯',AR:'阿尔忒弥斯',PR:'普罗米修斯',OD:'奥德修斯',AC:'阿喀琉斯',DM:'德墨忒尔',DI:'狄俄尼索斯',HP:'赫菲斯托斯',PS:'普赛克',PE:'珀耳塞福涅'};
  const PREFS = {
    E:{name:'外向',axis:'注意与精力',description:'较自然地把注意投向外部的人、事与互动。'},
    I:{name:'内向',axis:'注意与精力',description:'较自然地把注意投向内在的想法与反思。'},
    S:{name:'实感',axis:'接收信息',description:'较先关注具体事实、实际经验与可见细节。'},
    N:{name:'直觉',axis:'接收信息',description:'较先关注信息间的联系、整体与可能性。'},
    T:{name:'思考',axis:'作出决定',description:'较先借助逻辑、一致的原则与客观分析判断。'},
    F:{name:'情感',axis:'作出决定',description:'较先考虑人的处境、关系与重视的价值。'},
    J:{name:'判断',axis:'安排外部生活',description:'较偏好形成安排、作出决定与落实计划。'},
    P:{name:'知觉',axis:'安排外部生活',description:'较偏好保持开放、接收变化与灵活调整。'}
  };
  const AXES = [
    {pair:'E / I',title:'你如何整理精力',question:'一件棘手的事结束后，先找人聊聊，还是先独自整理，会让你更恢复状态？回想具体的一天。'},
    {pair:'S / N',title:'你先抓住哪种信息',question:'学习陌生任务时，你想先看实例、步骤与事实，还是先知道全貌、意义与可能？两种方式都值得使用。'},
    {pair:'T / F',title:'你怎样衡量一个决定',question:'面对意见分歧，你先核对逻辑与一致的标准，还是先考虑不同人的处境与价值？再试着补看另一侧。'},
    {pair:'J / P',title:'你与未定的事怎样相处',question:'一个空闲周末开始前，先定安排更自在，还是保留即兴空间更自在？也看看工作与休息是否不同。'}
  ];
  const side = (echo, watch, action) => ({echo,watch,action});

  // Each archetype has eight independently authored preference-side passages.
  // The 12 × 16 readings combine four of these; no god has a fixed MBTI type.
  const LENSES = {
    AT:{
      E:side('雅典娜的谋略可以在讨论中形成：把观察说出来，让别人一起补全地图。','如果你一开口就进入解题模式，对方此刻想要的是建议，还是被听见？','本周选一次谈话，先询问对方想被陪伴还是一起想办法。'),
      I:side('雅典娜的清醒可以来自安静梳理：先在心里形成判断，再决定如何靠近。','如果你总等想清楚才开口，身边的人可能不知道你也有需要支持的时候。','把一件尚未想通的事告诉信任的人，不必附上完整方案。'),
      S:side('谋略可以从事实长出来：你可能通过具体观察与既有经验建立判断。','如果准备一直延长，可以检查：哪些信息真的会改变决定，哪些只是让你更安心？','给一个待办列出三条关键事实，收集齐后就迈出第一步。'),
      N:side('谋略也可以从联系长出来：你可能先看见全局，再寻找各部分的关系。','如果脑中的模型过于完整，留意现实里有没有一个细节正在推翻它。','请一位同伴指出方案中的一个反例，再调整你的全局图。'),
      T:side('雅典娜的辨析与原则判断相遇时，能把混乱的问题拆成可以讨论的理由。','如果你把关系中的分歧当成论证题，正确的答案未必回答了对方的感受。','做一次决定时，同时写下理由与对相关人的实际影响。'),
      F:side('雅典娜的智慧也可以服务于关怀：你可能先想清怎样的选择更照顾人。','如果你替每个人预想好最优解，关怀会不会不小心越过了对方自己的选择？','帮忙前先问一句：你希望我具体做什么，而不是先给方案。'),
      J:side('清晰安排可以成为雅典娜的铠甲，让判断有落实的次序与边界。','压力大时若你不断加细计划，试着分辨是在推进事情，还是在追求不会出错。','给一项计划标出可以调整的部分，并约定一次复盘时间。'),
      P:side('雅典娜的谋略也能保持开放：先读懂局势，再随新信息改变路径。','压力大时若总有新方案值得比较，保留可能性也可能延迟必要的决定。','为一个悬而未决的问题设定收集信息的截止时间。')
    },
    AP:{
      E:side('阿波罗对卓越的追求可以通过合作排练与公开交流，逐渐找到清晰的表达。','如果你太在意现场的回应，伴侣或同伴是否还有空间说出不合你期待的话？','请重要的人给一次真实反馈，先听完，不急着解释或改进。'),
      I:side('阿波罗的秩序可以来自独处时的反复打磨，让内在标准逐渐成为作品。','如果你只展示完成后的自己，关系里的另一方可能看不到你也会犹豫和疲惫。','分享一份还不完美的草稿，同时说出一个真实的难处。'),
      S:side('阿波罗的卓越可以落实为稳定的基本功：在细节、手感与经验里持续精进。','如果你只允许成熟可靠的方法，新机会是否必须完全熟悉才得到尝试？','在熟练的流程中留出二十分钟，试一种小范围的新做法。'),
      N:side('阿波罗的追求可以由理想图景带动：先看见想创造的整体，再逐步靠近。','如果理想不断提高，已经完成的部分是否总被下一版蓝图迅速盖过？','为当前作品写下完成标准，达成后暂时停止升级目标。'),
      T:side('标准与逻辑结合时，阿波罗式的改进可以拥有清楚、可解释的依据。','如果所有事情都被换成指标，人的不同需求可能被当成需要修正的偏差。','评估方案时加一项：谁会承担成本，他们是否有表达机会？'),
      F:side('审美与价值判断相遇时，你可能在追求优秀之外，也希望成果真正打动人。','如果你希望每个人都满意，理想的作品与现实关系可能一起变得难以完成。','把一次创作的服务对象说具体，接受它不必取悦所有人。'),
      J:side('节奏、标准与安排可以让阿波罗的追求稳步推进，把愿望变成可完成的练习。','压力下若每个空隙都被改进任务填满，休息可能被推迟到永远不来的完美之后。','把一次庆祝和一段休息写进计划，与交付一样认真保留。'),
      P:side('保持开放能让阿波罗的创作继续吸收新灵感，在变化中修正表达。','压力下若每个新想法都要加入作品，探索可能让完成的终点不断后移。','列一个下一版清单，把新点子留在那里，先完成这一版。')
    },
    HM:{
      E:side('赫尔墨斯的连接可以在交流中展开：认识不同的人，也让消息找到去处。','如果你总在回应每一个场合，重要关系是否只能得到你剩下来的注意力？','为一个重要的人留出不被其他消息打断的半小时。'),
      I:side('信使也可以安静地连接世界：先理解双方，再用文字或一对一对话搭桥。','如果你擅长转述别人的想法，却很少表达自己的立场，谁知道你真正想要什么？','在一次私下交流里明确说出自己的偏好，不只总结双方意见。'),
      S:side('赫尔墨斯的机敏可以来自具体线索：知道谁需要什么、流程在哪里卡住。','如果你一直忙着解决眼前的联络，小修小补是否遮住了真正需要改变的关系结构？','记录一个反复出现的沟通堵点，提出一次流程调整。'),
      N:side('赫尔墨斯的联结也可以跨越概念：把不同领域的想法翻译成新的可能。','如果每条新联系都值得追随，连接的广度是否正在挤掉一件事所需的深度？','选一个跨界想法，做出能被别人实际使用的一页说明。'),
      T:side('信使的转译与逻辑相遇时，你可能善于找出各方利益与规则之间的可行接口。','如果协商过于顺畅，关系里的真心是否被处理成了又一项交换条件？','谈合作时除了交换条件，也说明你真正认同这件事的理由。'),
      F:side('信使的敏感与价值判断相遇时，你可能帮助不同的人找到能彼此听懂的语言。','如果维持和气总由你负责，你自己的不同意见是否会被留到最后，甚至被省略？','在一场协调中说清自己的底线，允许它与他人需要不同。'),
      J:side('赫尔墨斯的流动可以由承诺支撑：让消息、约定与交接有清晰的落点。','压力下若你急着替所有人敲定安排，可能会承担原本不属于你的协调责任。','检查一项约定，明确负责人、交付内容和你不承担的部分。'),
      P:side('保持选择与及时变通，能让赫尔墨斯在变化的局面里找到新的通道。','压力下若总想着再找一条路，承诺可能不断延后，归属也就迟迟没有落脚点。','选一件愿意留下来的事，本周为它兑现一个小承诺。')
    },
    AR:{
      E:side('阿尔忒弥斯的自主也可以是向外的：主动结伴探索，同时清楚表达自己的边界。','如果大家习惯了你带头出发，他们是否知道你也会需要结束活动、独自回去？','参加一次活动前，提前说明自己的离开时间与休息需要。'),
      I:side('森林的边界与内在整理相遇时，独处可能帮助你分辨哪些声音真正属于自己。','如果每次需要距离都直接消失，关心你的人可能难以区分休息与拒绝。','需要独处时留一句具体说明，并给出愿意再次联系的时间。'),
      S:side('守界可以从实际生活开始：时间、身体、空间和日常安排都有清楚的界线。','如果边界只靠过去的经验决定，眼前尊重你的人是否也被旧规则一起挡住？','挑一条日常边界，确认它现在保护的需要，而非只沿用旧习惯。'),
      N:side('阿尔忒弥斯的自由也可以是对另一种生活的想象，不让既有角色穷尽自己。','如果独立只存在于远方的理想生活，你今天可调整的一小块空间是否被忽略？','把理想自由写成一个具体安排，本周先落实其中半小时。'),
      T:side('边界与原则判断相遇时，你可能更容易把允许与不允许说得清楚且一致。','如果界线只像一份规则，亲近的人是否知道它保护了你的哪一种真实感受？','说明一条边界时，加一句原因，并给出你愿意的替代方式。'),
      F:side('自主与珍惜关系可以同时成立：你可能希望靠近来自自愿，也尊重对方的选择。','如果担心拒绝会让对方受伤，善意可能让你答应超过自己余力的要求。','练习一次温和的拒绝，不用额外承诺来抵消拒绝本身。'),
      J:side('明确的安排可以守住阿尔忒弥斯的领地，让独处与共同生活都有位置。','压力下若每一段时间都不容改变，保护节奏可能渐渐变成对临时靠近的防备。','在日程里同时保留独处时间与一段可协商的共同时间。'),
      P:side('开放的行动空间能让阿尔忒弥斯随自己的意愿探索，不被过早的安排锁住。','压力下若迟迟不确认约定，自己的自由可能变成别人需要独自承受的不确定。','为一件共同安排设定确认时间，其余部分继续保留弹性。')
    },
    PR:{
      E:side('普罗米修斯的火可以在人群中传递：公开发声、寻找同伴，把原则变成共同议题。','如果你总负责站出来，亲近的人是否有机会照顾你，而不只是被你的坚持鼓舞？','向一位同伴说清最近的消耗，请他分担一项具体任务。'),
      I:side('盗火者也可以安静坚持：反复确认内在信念，再把力量放进长期的行动。','如果所有负担都在心里消化，别人可能只看见坚定，而不知道你已经需要援助。','写一封简短的求助消息，说明目标、难处和可以分担的部分。'),
      S:side('信念可以通过具体改善落地：修补一个真实的不合理，让受影响的人先得到帮助。','如果你只顾眼前每一个急需修复的地方，是否还有时间检查问题为什么不断出现？','为正在解决的问题记下一个反复发生的原因，再提出小改动。'),
      N:side('普罗米修斯的火也像未来的可能：看见现有制度之外，人们还可以怎样生活。','如果未来图景过于辽阔，当下的资源与承受能力可能没有得到同样的重视。','把一个改变愿望缩成两周能验证的小尝试，并列出所需支持。'),
      T:side('反对不合理与原则判断相遇时，你可能要求同一标准适用于每个人。','如果争论只剩是否逻辑自洽，真正受影响的人想要什么可能被辩论声盖住。','提出异议前，分别写下证据和受影响者自己表达的需要。'),
      F:side('盗火与关怀相遇时，你可能更在意谁被遗漏、谁值得获得原本没有的机会。','如果对他人的责任没有尽头，你的善意是否会把个人代价视为理所当然？','为一项帮助设定时间和资源上限，并与合作的人说明。'),
      J:side('把信念写成行动次序，能让普罗米修斯的火持续照亮，而不只闪现一次。','压力下若承诺只能增加不能修改，坚持可能变成一份无法喘息的责任清单。','重新商量一个已超出余力的承诺，保留目标，调整分工或时间。'),
      P:side('灵活的战术可以为盗火找到新路径：目标清楚，方法却不必只有一种。','压力下若总临时补位，变通可能让不合理的系统继续依赖你的额外付出。','解决一次突发任务后，安排复盘，明确下次由谁正式承担。')
    },
    OD:{
      E:side('奥德修斯的应变可以借助沿途的对话：认识环境、建立联盟，也寻找回家的线索。','如果每次交谈都先考虑怎样过关，重要的人是否听过不带策略的真实打算？','在一次亲近的谈话中先说明真实愿望，不先设计对方的反应。'),
      I:side('归途也可以在心里慢慢辨认：通过回顾经历，分清自己真正愿意抵达的地方。','如果所有路线都独自盘算，同行的人是否知道你仍把他们放在未来里？','把一个还在思考的未来安排告诉相关的人，邀请他们一起参与。'),
      S:side('奥德修斯的应变可以建立在具体经验上：读懂眼前条件，再找到能走的下一步。','如果你总用曾经脱险的办法，今天的处境是否已经允许更直接、更安全的表达？','选一个熟悉的应对习惯，核对它在当前情境下是否仍有必要。'),
      N:side('归航的想象让你可能同时看到多条路线，并为尚未出现的变化准备可能性。','如果每条岔路都像新机会，终点会不会随着探索不断向远处移动？','写下这次旅程的一个不变目标，用它筛掉一个诱人的岔路。'),
      T:side('应变与分析结合时，你可能善于比较代价、约束与退路，让艰难局面继续推进。','如果所有选择都像风险计算，信任是否只能等到绝对安全时才有机会发生？','为一项合作同时列出风险措施和愿意给予对方的实际信任。'),
      F:side('归途与价值判断相遇时，你可能用想珍惜的人与生活，为复杂选择辨认方向。','如果为了不让任何人失望而不断转弯，你真正想回去的地方是否越来越模糊？','把一个选择按自己的核心价值排序，再说明无法兼顾的部分。'),
      J:side('一张明确的海图可以支撑归航，让应变有方向，也让同行者知道下一站。','压力下若路线变化就意味着失败，原本帮助你的计划可能反而阻碍调整。','为当前计划写一个替代路径，说明什么情况出现时才启用。'),
      P:side('对变化保持开放，能让奥德修斯在陌生海域抓住未曾预料的出口。','压力下若总把留下决定推迟到下一站，灵活可能掩盖了迟迟不作出的承诺。','为一件真正想抵达的事设一个到站日期，并兑现第一步。')
    },
    AC:{
      E:side('阿喀琉斯的勇气可以向外表达：直接投入、带动同伴，让重视的事得到回应。','如果强烈反应抢在感受之前出现，对方可能只听见战意，而没听见你受伤的地方。','遇到分歧时先说“我在意的是……”，再说明希望怎样处理。'),
      I:side('勇气也可以在安静中聚集：不急着展示，却在认定的重要时刻坚定站出来。','如果受伤后只剩沉默，重要的人可能不知道你需要解释、道歉，还是一点时间。','把一次不愿说出的委屈写成具体请求，交给可以对话的人。'),
      S:side('阿喀琉斯的投入可以落在真实的训练与行动：一步步积累，把力量带到现场。','如果眼前的胜负占据全部注意，一场小失利是否被放大成对整体能力的判断？','把一次失利拆成可改善的动作，只选一个进行针对练习。'),
      N:side('荣耀也可以是一个值得投身的愿景：你可能希望行动最终留下超出当下的意义。','如果故事必须足够耀眼，平凡但重要的过程是否得不到你同样的认可？','记录一件没有掌声却推进目标的小事，说明它为何值得。'),
      T:side('勇气与原则判断相遇时，你可能希望竞争、分工和认可都有清楚的依据。','如果每次争执都要分出输赢，是否有一些你真正珍惜的关系正在承担代价？','争论前先写下要解决的具体问题，另列不愿伤害的东西。'),
      F:side('勇气与价值判断相遇时，你可能愿意为珍惜的人发声，把力量用于保护。','如果保护变成替别人选择战场，关心的人是否真正希望你用这种方式出手？','准备替人争取前，先问对方想要什么帮助、有哪些界限。'),
      J:side('明确目标和行动纪律，可以让阿喀琉斯的强烈投入变成持续的力量。','压力下若必须马上扳回局面，行动速度可能超过你辨认真正需要的速度。','为一次冲动回应设置短暂停顿，等写清诉求后再发送。'),
      P:side('及时回应现场变化，能让阿喀琉斯的勇气拥有抓住机会的敏捷。','压力下若每个刺激都引出立即行动，你是否还来得及判断哪些战场值得进入？','本周遇到一次挑衅时，先选定回应目标，再决定是否回应。')
    },
    DM:{
      E:side('德墨忒尔的照料可以通过共同生活被看见：聚在一起、主动联络，让人有位置。','如果关心总是你发起，关系里是否也有空间让别人先问问你的近况？','让一次联系由对方安排，接到关心时如实说说自己的需要。'),
      I:side('照料也可以安静而细致：记住重要的事，在不张扬的陪伴里维持连接。','如果你期待别人从默默付出中读懂心意，他们可能并不知道你也盼着被回应。','向一个重要的人说明一次你想得到的照顾，不用暗示代替。'),
      S:side('德墨忒尔的滋养可以落实在具体日常：一顿饭、一项安排、一个被记住的需要。','如果日常照料沿用旧习惯，你关心的人是否已经进入需要不同支持的新阶段？','问一个被你照顾的人：现在什么帮助有用，什么已经不需要？'),
      N:side('滋养也可以关注一个人的潜能：看见尚未长成的部分，并愿意为未来留空间。','如果你对对方的未来有完整想象，期待是否会悄悄取代对方自己的生长方向？','把你为对方设想的一件事，改成开放询问并认真听取回答。'),
      T:side('关怀与原则判断相遇时，你可能希望支持有清楚的分工，让照料更加可持续。','如果帮助过于像资源管理，被照顾的人是否仍能表达感受，而不仅是提出需求？','安排照料任务时，同时留出一次不解决问题的倾听。'),
      F:side('德墨忒尔的关怀与重视人的处境相呼应，能让一个人的感受被认真放在心上。','如果他人的情绪决定了你整天的天气，你是否还有空间分辨自己的感受与责任？','写下今日属于自己的一个需要，并在帮助别人之前照顾它。'),
      J:side('稳定的安排能让照顾成为可靠的节奏，使重要的人知道何时可以得到支持。','压力下若你开始替每个人安排生活，可靠是否不小心压缩了彼此各自决定的空间？','为一项家庭安排明确谁来决定、谁来协助，不替所有人拍板。'),
      P:side('随需要调整的照顾，能像四季一样回应变化，为不同状态留出余地。','压力下若所有临时需要都能插入，你的休息是否总是最先被取消的那一项？','为自己的休息保留一段不可随意挪用的时间，再接新的请求。')
    },
    DI:{
      E:side('狄俄尼索斯的鲜活可以在共同体验里展开：音乐、对话与聚会让感受彼此流动。','如果关系总在热闹中发生，你是否也愿意让别人看见安静、没劲或难过的时候？','和一位朋友进行一次不安排娱乐的散步，聊聊真实近况。'),
      I:side('鲜活也可以来自内在体验：独自听音乐、创作或沉浸，让感受拥有自己的空间。','如果每一种情绪都只在内心演出，重要的人是否知道什么时候可以陪你一起承受？','分享一段作品或音乐，并用一句自己的话说明它对应的感受。'),
      S:side('狄俄尼索斯的当下感可以从身体和感官开始：声音、节奏与触感让生活具体起来。','如果总要更强的刺激才觉得鲜活，普通日常里较细微的感受是否被漏掉？','用十分钟认真体验一件普通小事，记录三种不夸张的感受。'),
      N:side('狄俄尼索斯的转化也可以来自想象：把经历变成隐喻，让旧情绪拥有新的表达。','如果每次情绪都需要一个重生故事，缓慢而没有戏剧性的恢复是否难以被接受？','用一个短作品记录平静的一天，不要求它讲出宏大的意义。'),
      T:side('感受与分析可以并存：你可能想理解体验如何发生，再给它一个能持续的形式。','如果分析太快接管了体验，你是否还允许情绪先存在，而不马上解释或归类？','记录一种情绪的身体感受，先不判断原因，稍后再回看。'),
      F:side('鲜活与价值判断相遇时，你可能用共同感受建立亲近，让体验回应人的需要。','如果为了让所有人尽兴而忽略自己的节奏，你的快乐是否变成了一项表演任务？','在一次活动里如实表达自己的状态，允许自己提前休息。'),
      J:side('给灵感与体验安排稳定的容器，可以让狄俄尼索斯的创造不必只靠兴之所至。','压力下若连放松都必须达到效果，你是否又把感受变成了需要完成的任务？','保留一次没有成果要求的创作时间，结束时只记录体验。'),
      P:side('开放与即兴能让狄俄尼索斯捕捉现场的变化，让新感受自然进入生活。','压力下若不断更换体验，新的热闹是否只是让尚未处理的失落继续延后？','一场活动结束后留十分钟安静回顾，再决定是否安排下一场。')
    },
    HP:{
      E:side('赫菲斯托斯的创造可以在协作中展开：讨论、演示和共同制作让技艺连接更多人。','如果每次交流都绕着成果，你是否也能在没有作品可展示时安心地参与关系？','约一次与作品无关的聊天，分享近况而不是进度。'),
      I:side('炉火旁的专注与内在整理相呼应：长时间独立制作，让想法慢慢拥有形状。','如果你总躲在作品之后，重要的人是否知道你想被认可的不只有制作能力？','展示一件作品时，说出创作中一次真实的期待或失落。'),
      S:side('赫菲斯托斯的手艺可以从材料与细节建立：反复试做，积累可靠的制作经验。','如果每一处都值得继续抛光，作品的使用者是否已经需要一个能够试用的版本？','交出一个可使用的小版本，请使用者指出最重要的一处改进。'),
      N:side('造物也可以从尚未存在的可能开始：想象一种新结构，再让工具追上想法。','如果构想不断扩展，你的精力是否被同时打开的许多作品分散了？','选一个最想实现的构想，先做能验证核心想法的最小样品。'),
      T:side('技艺与分析相遇时，你可能善于找出结构中的问题，用实际改进建立可靠性。','如果人际问题也被当成需要维修的机器，对方是否有机会只表达感受而不被修正？','听到倾诉时先复述感受，得到邀请后再提出解决方法。'),
      F:side('造物与价值判断相遇时，作品可能承载对具体人的关心，让心意拥有形状。','如果礼物与付出代替了所有表达，对方是否知道你也希望得到何种回应？','送出帮助或作品时，把心意说清，也把自己的期待说具体。'),
      J:side('稳定工序与完成标准可以保护赫菲斯托斯的专注，让技艺形成持续的产出。','压力下若你不断增加工作来证明价值，休息是否总被视为尚未赚到的奖励？','给一段制作设结束时间，停下后做一件无需证明能力的事。'),
      P:side('试验与临场调整能让赫菲斯托斯顺着材料发现新方法，为意外留下创作空间。','压力下若总能找到新的改法，作品可能一直在制作中，迟迟无法与别人相遇。','为一个实验定下展示日期，让真实反馈进入下一轮制作。')
    },
    PS:{
      E:side('普赛克的提灯可以在对话中点亮：通过直接询问，逐渐看清彼此真实的想法。','如果每一次不安都立刻变成追问，对方是否有足够时间整理并表达自己的回答？','提出一个关键问题后约定回应时间，期间先记录自己的感受。'),
      I:side('提灯也可以先照向内心：通过回想与书写，分清事实、猜测和自己的需要。','如果思考一直没有进入对话，你是否在用内心的推演代替对方真实的声音？','把一个反复猜测的问题写成一句清楚且尊重边界的询问。'),
      S:side('普赛克的求真可以从可观察的细节开始：核实言行，让信任有实际相处作依据。','如果每个小细节都需要解释，观察是否已经变成不可能完成的全面核验？','为一个疑问列出真正需要确认的事实，暂时放下无关细节。'),
      N:side('求真也可以来自意义与联系：你可能想理解一段关系背后更完整的故事。','如果一个细节能引出许多故事，最有吸引力的解释是否被误当成了已知的事实？','把一次猜测分成事实、解释、待询问三栏，再决定下一步。'),
      T:side('提灯与分析相遇时，你可能借助清楚的问题辨认前后矛盾，让交流更明确。','如果关系被要求完全逻辑一致，人正常的犹豫与变化是否也被视为不可信？','讨论一个矛盾时先询问变化的背景，不急着判定谁不真实。'),
      F:side('求真与重视关系相遇时，你可能希望了解能够带来更深的信任与靠近。','如果问清一切是为了保证永远不失去，任何答案可能都无法满足这种保证。','把“你会不会一直如此”改成“此刻我们愿意怎样照顾关系”。'),
      J:side('明确约定可以为普赛克的信任提供可见的支点，让期待不必都靠猜测。','压力下若每个未知都要马上确定，你是否允许关系随着相处逐步展开？','与对方确认一项重要约定，也列出一项可以暂时没有答案的事。'),
      P:side('愿意修正理解能让普赛克的灯照见变化，不把一个人固定在最初的印象里。','压力下若不断打开新解释，理解可能变成没有终点的猜测，而不是实际的相处。','为一次反复推想安排暂停，用一段真实共同活动补充理解。')
    },
    PE:{
      E:side('两界之间的经历可以通过表达被看见：在不同的人群里说出自己仍然共有的需要。','如果你总迅速融入眼前环境，亲近的人是否知道哪些部分其实让你不自在？','向信任的人说明一个不想继续适应的要求，并提出替代方式。'),
      I:side('内在整理可以帮助珀耳塞福涅辨认变化中的自己，不急着用一个身份概括所有经历。','如果不同的自己都只留在心里，你是否缺少一个可以同时看见这些侧面的人？','用一段文字向信任的人分享两个看似不同、却都真实的自己。'),
      S:side('转变可以从具体的生活重新落地：调整作息、空间与小安排，慢慢找回可掌握的部分。','如果只是让现状更能忍受，你是否还有机会问：哪项条件本来就值得被改变？','区分一件需要适应的事和一件可以协商的事，先为后者发声。'),
      N:side('两界的经验也可以打开新的自我理解：看见改变之后，生活还有哪些未写定的可能。','如果一直等待意义完全清楚才行动，今天能够自主的小决定是否又被延后？','不等完整答案，先选一件符合当前愿望的小事并亲自决定。'),
      T:side('辨认自主权也需要清楚分析：区分不可改变的事实、现有约束与可以协商的条件。','如果经历只能被整理成问题清单，其中的失落与复杂感受是否还没有得到位置？','列出可行动事项之后，另写一句这段变化带给你的真实感受。'),
      F:side('转变与价值判断相遇时，你可能希望不同阶段的自己，都能被温柔而具体地理解。','如果为了让旧关系安心而隐藏变化，你自己的新意愿是否迟迟不被允许说出来？','向重要的人说明一项已经改变的需要，不必先为改变道歉。'),
      J:side('重新建立安排可以把主动权带回日常，让两个世界之间的往返有自己的节奏。','压力下若急着固定一个稳定身份，仍在变化的部分是否又被当成需要消除的偏差？','为本周设一个稳定锚点，同时留出一件允许调整的安排。'),
      P:side('容纳变化与多种侧面，能让珀耳塞福涅不急于把新经历塞进旧的自我定义。','压力下若适应总快于表达意愿，灵活是否让别人默认你对所有安排都没有意见？','面对下一项安排，先说出自己的偏好，再考虑怎样配合。')
    }
  };

  const escapeHTML = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normalizeType = value => typeof value === 'string' && TYPES.includes(value.trim().toUpperCase()) ? value.trim().toUpperCase() : '';
  let nextId = 0;
  const bindings = new WeakMap();

  function normalizeInput(input) {
    input = input || {};
    const supplied = typeof input.archetype === 'string' ? {id:input.archetype} : (input.archetype || {});
    const valid = Object.prototype.hasOwnProperty.call(LENSES, supplied.id);
    const archetype = {
      id: valid ? supplied.id : '',
      name: valid ? (typeof supplied.name === 'string' && supplied.name || NAMES[supplied.id]) : '当前原型',
      reflection: typeof supplied.reflection === 'string' ? supplied.reflection : ''
    };
    const evidence = (Array.isArray(input.evidence) ? input.evidence : []).filter(item => item && typeof item.answer === 'string' && item.answer.trim()).slice(0,2).map(item => ({
      question: typeof item.question === 'string' || typeof item.question === 'number' ? String(item.question) : '你的选择',
      answer: item.answer,
      note: typeof item.note === 'string' ? item.note : ''
    }));
    return {archetype,evidence,selectedType:normalizeType(input.selectedType)};
  }

  function evidenceHTML(state) {
    if (!state.evidence.length) return '<p class="mbti-evidence-note">神话一侧来自这次结果；MBTI 一侧由你自行选择。以下是两种叙事视角的对照，不是从神话反推类型。</p>';
    return `<details class="mbti-evidence"><summary>回到这次回答的具体线索</summary><div>${state.evidence.map(item => `<blockquote><span>${escapeHTML(item.question)}</span><p>“${escapeHTML(item.answer)}”</p>${item.note ? `<small>${escapeHTML(item.note)}</small>` : ''}</blockquote>`).join('')}</div><p class="mbti-evidence-note">这些选择支持神话解读；它们不用于判断你的 MBTI 类型。</p></details>`;
  }

  function reportHTML(state) {
    const {archetype,selectedType:type} = state;
    if (!archetype.id) return '<p class="mbti-unavailable">暂时无法载入这个原型的对照内容。你仍可以返回阅读神话故事。</p>';
    if (!type) return `<div class="mbti-unselected"><div class="mbti-section-head"><span class="mbti-kicker">START WITH YOUR EVERYDAY</span><h3>不知道类型，也能从生活开始。</h3><p>不需要猜一个四字母答案。带着${escapeHTML(archetype.name)}的故事，观察下面四个具体时刻。</p></div><div class="mbti-reflections">${AXES.map(axis => `<article><span class="mbti-axis-code">${axis.pair}</span><h4>${axis.title}</h4><p>${axis.question}</p></article>`).join('')}</div>${archetype.reflection ? `<p class="mbti-reflection-anchor"><span>${escapeHTML(archetype.name)}留给你的问题</span>${escapeHTML(archetype.reflection)}</p>` : ''}<p class="mbti-small">这里不收集四组选项，也不会据此生成类型。没有一个字母，比你的具体经验更重要。</p></div>`;
    const letters = type.split('');
    const lens = LENSES[archetype.id];
    const [energy,information,decision,structure] = letters.map(letter => lens[letter]);
    return `<div class="mbti-selected-report" data-mbti-combination="${archetype.id}-${type}">
      <div class="mbti-combination"><span>${escapeHTML(archetype.name)}</span><i aria-hidden="true">×</i><strong>${type}</strong><small>你选择的类型 · ${letters.map(letter => PREFS[letter].name).join(' / ')}</small></div>
      <p class="mbti-premise">以你选择的 ${type} 为前提，看看它如何与${escapeHTML(archetype.name)}的故事并置。下面是编辑性的反思提示，你可以认同、补充，也可以不认同。</p>
      <div class="mbti-preferences">${letters.map(letter => `<article><span>${letter}<small>${PREFS[letter].axis}</small></span><h4>${PREFS[letter].name}</h4><p>${PREFS[letter].description}</p></article>`).join('')}</div>
      <p class="mbti-small mbti-pref-source">偏好不等于能力；每个人都能使用两侧。E/I 不等于社交能力，T/F 不等于是否有感情。定义参考 <a href="https://www.myersbriggs.org/my-mbti-personality-type/the-mbti-preferences/" target="_blank" rel="noopener noreferrer">Myers &amp; Briggs Foundation ↗</a>。</p>
      <div class="mbti-section-head"><span class="mbti-kicker">WHERE THE TWO MEET</span><h3>两种视角，可能在这里呼应。</h3></div>
      <div class="mbti-echoes"><article><span class="mbti-card-label">01 · ${letters[1]} / 如何读懂世界</span><p>${escapeHTML(information.echo)}</p></article><article><span class="mbti-card-label">02 · ${letters[2]} / 怎样作出选择</span><p>${escapeHTML(decision.echo)}</p></article></div>
      <div class="mbti-life-grid">
        <article><span class="mbti-card-label">WORK &amp; DECISIONS</span><h4>工作与决策</h4><p>${escapeHTML(information.watch)}</p><p>${escapeHTML(decision.watch)}</p></article>
        <article><span class="mbti-card-label">CLOSENESS &amp; SPACE</span><h4>亲密关系</h4><p>${escapeHTML(energy.echo)}</p><p>${escapeHTML(energy.watch)}</p></article>
        <article class="mbti-pressure"><span class="mbti-card-label">A TENSION TO NOTICE</span><h4>压力下，留意这处张力</h4><p>${escapeHTML(structure.echo)}</p><p>${escapeHTML(structure.watch)}</p><small>这是一项观察邀请，不表示你在压力下必然如此。</small></article>
      </div>
      <div class="mbti-section-head mbti-week-heading"><span class="mbti-kicker">ONE WEEK, SMALL EXPERIMENTS</span><h3>接下来一周，挑一件试试。</h3><p>无需四项都做。记下什么有用、什么不适合，让真实经验修正标签。</p></div>
      <ol class="mbti-week">${[
        {label:'一次真实交流',letter:letters[0],item:energy},
        {label:'一次具体尝试',letter:letters[1],item:information},
        {label:'一个有意识的决定',letter:letters[2],item:decision},
        {label:'一处节奏调整',letter:letters[3],item:structure}
      ].map((entry,index) => `<li><span class="mbti-week-number">0${index+1}</span><div><h4>${entry.label}<small>${entry.letter}</small></h4><p>${escapeHTML(entry.item.action)}</p></div></li>`).join('')}</ol>
    </div>`;
  }

  function render(input) {
    const state = normalizeInput(input);
    const id = 'myth-mbti-' + (++nextId);
    const serialized = JSON.stringify(state).replace(/[<>&]/g, c => ({'<':'\\u003c','>':'\\u003e','&':'\\u0026'}[c]));
    return `<section class="myth-mbti" aria-labelledby="${id}-title">
      <div class="mbti-heading"><span class="mbti-kicker">MYTHOLOGY MEETS PREFERENCE</span><h2 id="${id}-title" aria-label="神话 × MBTI：同一个你，两种视角">神话 × MBTI<span>同一个你，两种视角</span></h2><p>神话提供故事与动机的隐喻，四组偏好提供观察日常习惯的另一种语言。</p></div>
      <p class="mbti-boundary">这不是官方 MBTI 测评，也不会根据本测试推断你的类型。没有哪位神祇固定对应一种类型。</p>
      <div class="mbti-control"><label for="${id}-select">选择你已知或自我认同的 MBTI 类型<span>可选 · 不确定就留空</span></label><div class="mbti-select-row"><select id="${id}-select" data-mbti-select aria-describedby="${id}-hint" aria-controls="${id}-report"><option value=""${!state.selectedType ? ' selected' : ''}>我还不知道 / 暂不选择</option>${TYPES.map(type => `<option value="${type}"${state.selectedType === type ? ' selected' : ''}>${type} · ${type.split('').map(letter => PREFS[letter].name).join(' / ')}</option>`).join('')}</select><button type="button" data-mbti-clear${!state.selectedType ? ' disabled' : ''}>清除选择</button></div><p id="${id}-hint" class="mbti-control-hint">类型由你提供，只改变这段对照，不改变神话积分与原型结果。</p></div>
      ${evidenceHTML(state)}
      <div id="${id}-report" class="mbti-report" data-mbti-report aria-live="polite" aria-atomic="false">${reportHTML(state)}</div>
      <p class="mbti-footer">两种视角都不必成为边界。你仍可以在具体情境里，选择与习惯不同的行动。</p>
      <script type="application/json" data-mbti-state>${serialized}</script>
    </section>`;
  }

  function bind(container, options) {
    options = options || {};
    if (!container || typeof container.querySelector !== 'function') return null;
    const host = typeof container.matches === 'function' && container.matches('.myth-mbti') ? container : container.querySelector('.myth-mbti');
    if (!host) return null;
    const existing = bindings.get(host);
    if (existing) existing.destroy();
    const stateNode = host.querySelector('[data-mbti-state]');
    const select = host.querySelector('[data-mbti-select]');
    const clear = host.querySelector('[data-mbti-clear]');
    const report = host.querySelector('[data-mbti-report]');
    if (!stateNode || !select || !clear || !report) return null;
    let state;
    try { state = normalizeInput(JSON.parse(stateNode.textContent)); }
    catch (_) { return null; }
    function update(value, notify) {
      state.selectedType = normalizeType(value);
      select.value = state.selectedType;
      clear.disabled = !state.selectedType;
      // Replace only the report, keeping the native select and its focus intact.
      report.innerHTML = reportHTML(state);
      stateNode.textContent = JSON.stringify(state);
      if (notify && typeof options.onChange === 'function') options.onChange(state.selectedType);
      return state.selectedType;
    }
    function changed() { update(select.value, true); }
    function cleared() { update('', true); select.focus({preventScroll:true}); }
    select.addEventListener('change', changed);
    clear.addEventListener('click', cleared);
    const api = {
      getType: () => state.selectedType,
      setType: (value, config) => update(value, Boolean(config && config.notify)),
      destroy: () => {
        select.removeEventListener('change', changed);
        clear.removeEventListener('click', cleared);
        if (bindings.get(host) === api) bindings.delete(host);
      }
    };
    bindings.set(host, api);
    return api;
  }

  const api = {render,bind,normalizeType,types:TYPES,version:'1.0.0'};
  root.MYTH_MBTI = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
}(typeof window !== 'undefined' ? window : globalThis));
