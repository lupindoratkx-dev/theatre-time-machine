/* V4：同一事件协议、两条独立路线。教学模型比较条件，不声明唯一历史因果。 */
(function (T) {
  'use strict';
  const cam = (target=[0,1,-.6],distance=25,yaw=-.35,pitch=.72)=>({target,distance,yaw,pitch});
  const city = cam([26,1,1],33,-.38,.88);
  const eye = cam([0,1.45,-5],13,0,.055);
  const make = (id, branch, speaker, title, problem, from, to, choices, en, zh, teachingPoint, extra={}) => ({
    id, branch, speaker, title, problem, from,
    choices: choices.map(([text,consequence,effect],i)=>({text,consequence,effect:effect||'adopt',adopt:!effect})),
    successfulChoice: choices.findIndex(x=>!x[2]),
    consequence: choices.find(x=>!x[2])[1],
    transition: {duration:1800}, camera: cam(), sceneMutation:to,
    discovery:{en,zh,text:teachingPoint}, teachingPoint, ...extra
  });
  const italy = [
    make('ITALY_01_HUMANISM','italy','humanist','重新看见古代','这些古代遗迹，只是过去留下的废墟吗？手稿、测绘与古典文本可以互相解释。','it-study','it-research',[
      ['只把它们看作破败的旧建筑','遗迹轮廓还在，建筑组织与古典文本之间的联系尚未被研究。','ruins'],
      ['重新研究，作为理解古典文化的范本','测绘、平面和复原线叠加在遗迹草图上。古代逐渐成为可研究、可解释的对象。']
    ],'HUMANISM','人文主义与古典研究','古典文化在长期传承中被重新研究和解释。这不是某一天突然“发现古代”，也不是古代知识此前完全消失。',{camera:cam([0,.8,0],13,-.4,.85)}),
    make('ITALY_02_UNIFIED_SPACE','italy','humanist','演的戏变了','今天尝试一部发生在古代城市里的喜剧。天堂、宫殿、地狱与圣墓并置的场地，可以怎样重新组织？','city-mansions','city-unified',[
      ['保留全部宗教象征景屋','并置仍可承载表演约定，但眼前这些宗教地点并不对应这部城市喜剧的视觉要求。','keep-mansions'],
      ['把分散地点收拢为统一的虚构城市','景屋先收拢，天堂和地狱逐渐淡出，共同表演地带变得集中。']
    ],'UNIFIED VISUAL SPACE','从多地点并置到统一视觉环境','这次变化来自一类古典戏剧实验的需求。中世纪的并置传统仍然存在；统一视觉环境是一种新的选择。',{camera:city}),
    make('ITALY_03_COURT','italy','patron','谁来组织新的戏剧实验？','古典文本研究、制作费用与受邀观看，需要怎样的组织环境？','city-unified','it-hall',[
      ['沿用教会礼仪安排','礼仪仍有自己的演出需要；本次古典戏剧研究需要另一种组织支持。','church'],
      ['由宫廷或人文主义学院组织','公共空间逐渐退远，镜头来到一间尚未布置舞台的大厅。'],
      ['只扩大原有城市节庆','公共节庆继续发展；本次邀请制实验的资源和观看安排尚未落实。','festival']
    ],'COURT / ACADEMY','演出制度与空间一起改变','宫廷与学院是意大利古典戏剧实验的重要环境，并非全部演出的唯一组织者。进入大厅与赞助、研究和社交安排密切相关。'),
    make('ITALY_04_FRONTAL_VIEWING','italy','builder','大厅还不是剧场','演员和贵族散落在大厅里。今晚的城市喜剧，需要怎样组织表演与观看？','it-hall','it-frontal',[
      ['演员居中，观众从四周观看','人物真正围成一圈。这种多向观看可以成立；要共享一幅城市构图，还需调整观看方向。','ring'],
      ['演员到大厅一端，观众朝向同一方向','演员向尽头移动，座位转向并排列，简单的平台逐渐升起。']
    ],'FRONTAL VIEWING','正面观看','先组织演员与观众，再发展视觉技术。共享一个主要观看方向，为后续依赖预设视点的透视实验提供条件。'),
    make('ITALY_05_PERSPECTIVE','italy','designer','有限舞台，怎样容下一座城市？','假设舞台纵深约 15 米——这是本题设定。剧本却需要一条很深的街道。','it-frontal','it-perspective',[
      ['建造几十栋完整房屋','足尺建筑挤满平台；空间并未因此向远方延伸。','full-size'],
      ['利用视觉规律组织纵深','向右调整五档滑杆。观察道路收窄、房屋和窗口递减，辅助线汇向共同消失点。']
    ],'PERSPECTIVE','有限空间里的透视街道','尺度递减、遮挡和线条汇聚共同制造纵深。这个单消失点模型是一种基本实验，不能涵盖所有意大利剧场。',{activity:'perspective',camera:eye}),
    make('ITALY_06_GIANT_ACTOR_BUG','italy','actor','演员为什么像“巨人”？','看演员从台前走进街道。身体没有变大，为什么后面的房屋显得那么小？','it-perspective','it-zones',[
      ['演员的身体真的变大了','演员保持同一尺度。请比较身旁房屋，而不是只比较远近。','giant-repeat'],
      ['布景缩小了，幻觉空间不能当作真实街道','前部真实表演区与后部透视景区被分别标出，演员回到可表演的前区。']
    ],'REAL SPACE / ILLUSION','真实表演区与视觉幻觉区','透视布景的比例并不总能容纳同尺度演员走向深处。分区是理解这类布景的一种方式，并非所有演出都禁止演员进入后区。',{intro:'giant',camera:eye}),
    make('ITALY_07_VIEWPOINT_BUG','italy','audience','换个座位，城市就变了？','中央看到的街道很完整。试着把观看位置移到侧面，再回中央。','it-zones','it-viewpoint',[
      ['每个位置都应当看见相同构图','镜头移到侧面后，景片厚度、支撑与真实间隔暴露出来。','side'],
      ['移动视点，比较中央与侧面','先去一侧，再回到中央。记录这两个位置，找到本模型的理想视点。']
    ],'IDEAL VIEWPOINT','透视依赖预设的观看位置','视点实验连接了前面的正面观看。主要视觉轴线把观众位置与布景构图联系起来；真实剧场可采用更复杂的透视安排。',{activity:'viewpoint',camera:eye}),
    make('ITALY_08_FRAMED_STAGE','italy','designer','画面的边界开始出现','主要观看方向已经明确，台内是一座虚构城市。怎样进一步组织这个视觉世界的边缘？','it-viewpoint','it-framed',[
      ['把观众重新分到景片四周','离轴观看使构图改变，也更容易看见布景背面。','ring'],
      ['逐渐强化左右与上方的视觉边界','两侧边界与顶部横梁生长，舞台越来越像一个被框定的画面。']
    ],'PROSCENIUM DEVELOPMENT','台口与框景边界逐渐明确','这是空间逻辑的比较，不是现代镜框舞台一次完成的发明动画。透视、台口和专用室内剧场的发展在年代与实践上相互交错。'),
    make('ITALY_09_PERMANENT_THEATRE','italy','patron','让演出有更持久的空间','每次都重新搭建吗？持续的学院与宫廷演出，让专用空间成为一种可能。','it-framed','it-olimpico',[
      ['每场都从头搭建','临时演出仍可成立；构件收起后，下次需要重新组织场地。','temporary'],
      ['投入长期使用的室内演出空间','切换到奥林匹克剧场的类型示意：固定座席、古典建筑立面与透视街景相结合。']
    ],'TEATRO OLIMPICO · 1585','古典复兴与新的视觉系统','奥林匹克剧场由学院委建、帕拉迪奥设计；斯卡莫齐为 1585 年首演制作透视街景。模型仅示意中央街道，实物有多条。它不是现代镜框舞台的完成形态。',{camera:cam([0,1,-1],27,.2,.68)}),
    make('ITALY_10_CHANGEABLE_SCENERY','italy','designer','固定城市，能演所有地点吗？','离开奥林匹克个案，比较另一类布景实验：明天是宫殿，后天是森林，怎样改变眼前世界？','it-changeable-fixed','it-changeable',[
      ['每次都保留同一座城市','场景仍是城市。新的地点需要通过另一套视觉或表演约定建立。','fixed'],
      ['采用可拆换、组合的景片','依次切换城市、宫殿与森林，观察建筑框架保留而景物轮廓改变。']
    ],'CHANGEABLE SCENERY','剧场成为制造视觉世界的机器','可变布景经不同实验逐渐发展，后来形成更复杂的机械系统。这不是把奥林匹克剧场的固定街景直接拆改；三种切换只示意可更换的原则。',{activity:'scenery'})
  ];
  const england = [
    make('ENGLAND_01_TRAVELLING_PLAYERS','england','performer','从仍在演出的城市出发','大厅、节庆和临时场地中，流动演员持续活动。如果演戏逐渐成为职业，最需要什么？','city-players','en-players',[
      ['只增加一次节庆的装饰','节庆更醒目了，但持续排练、剧目和收入仍需要组织。','festival'],
      ['形成能持续排练、巡演和经营的组织','携带道具与服装的演员开始聚拢。这条路线从演出实践继续生长。']
    ],'CONTINUITY OF PERFORMANCE','流动表演与职业化','职业化剧团是英国公共剧场成长的重要动力之一。宗教演出、世俗表演、大厅与城市娱乐并非同一条线先后消失。'),
    make('ENGLAND_02_COMPANY','england','manager','把几位演员变成一支剧团','加入表演者、乐师与协作人员，再联系一位贵族赞助者。点击角色，观察他们组成稳定团队。','en-players','en-company',[
      ['各自接演，每次临时碰面','人物仍然分散，排练与剧目协调没有形成持续安排。','scatter'],
      ['分工合作，建立职业剧团','依次加入成员与赞助标记。图标代表组织关系，不是各剧团统一的人员编制。']
    ],'PROFESSIONAL COMPANY','职业剧团','英国剧团的职业组织、赞助与城市商业环境相互联系。贵族名义赞助在当时具有保护与身份作用，具体安排因剧团和年代而异。',{activity:'company'}),
    make('ENGLAND_03_INN_YARD','england','manager','剧团有了，专用剧院还没有','剧团在贵族大厅、市政空间与旅馆院落等场所演出。这里有院落和楼廊，平台放在哪里？','en-travel','en-inn',[
      ['把平台放在入口，挡住通行','平台占据前侧入口，观众进出与演出互相干扰。','entry-block'],
      ['试着把平台移到院子一端','拖动平台滑杆到院落后端，留出院中站席和周边观看位置。']
    ],'INN YARD','临时公共演出空间','围合院落、多层观看与一端平台，有助于理解空间连续性。不是所有旅馆都如此演出，也不能据此断言环球剧场直接复制旅馆。',{activity:'platform',intro:'travel'}),
    make('ENGLAND_04_PUBLIC_THEATRE','england','manager','为什么建设专门剧院？','剧团有稳定剧目，城市有持续付费观看的需求。怎样减少对借用场地的依赖？','en-inn','en-public',[
      ['一直临时寻找可借用的院子','流动演出仍可继续，但场地安排和收入预期较难稳定。','borrow'],
      ['建设供持续商业演出使用的场所','拖动形态滑杆：客房退去，观看楼廊、院中站席与固定平台逐渐明确。']
    ],'PUBLIC THEATRE · 1576','从借用场地到专用公共剧场','1576 年 The Theatre 是重要节点，并非英国首个演出建筑。变形用于比较组织与空间关系，不是旅馆直接变成该建筑的考古复原。',{activity:'morph'}),
    make('ENGLAND_05_THRUST_STAGE','england','actor','舞台可以更靠近观众吗？','楼廊、院落和后台已形成。怎样让演员与前方、左右的观众都更接近？','en-public','en-thrust',[
      ['退回建筑深处，只面对一侧','演员远离院中人群，台前与侧方的交流距离增大。','retreat'],
      ['让舞台向院落伸出','平台向人群中伸出。切到演员视角，依次看向三个方向的观众。']
    ],'THRUST STAGE','伸出式舞台与三面观看','这里没有唯一适合所有观众的正面。演员仍会组织交流重心，但需通过站位、转身和语言回应多个观看方向。',{activity:'actor-view'}),
    make('ENGLAND_06_OPEN_STAGE','england','actor','同样要换地点，答案一样吗？','第一场是宫殿，第二场是森林，第三场是战场。三面观众围近的舞台，怎样换地点？','en-thrust','en-open',[
      ['搬入整套复杂透视景片','景片挡住一部分侧向观看，演员的交流面缩小。这个空间没有围绕那套布景体系组织。','scenery-conflict'],
      ['用语言、表演与少量关键道具建立地点','切换三个场景：建筑基本不变，王座、树枝、旗帜和台词建立新的地点。']
    ],'OPEN STAGE','以表演与语言创造空间','相对开放的舞台并非没有视觉手段。服装、道具、音乐与机关也参与演出；这里比较的是建立地点的不同重心。',{activity:'props'}),
    make('ENGLAND_07_VERTICAL_COSMOLOGY','england','performer','旧有空间观念消失了吗？','回想并置的天堂、人间和地狱。选择一个词，再点击舞台上方、表面或下方，把它放入新位置。','en-flashback','en-cosmos',[
      ['认为新剧场已经切断所有旧观念','建筑改变并不意味着戏剧观念完全消失。试着寻找重新组织的方式。','forget'],
      ['在新舞台中比较这些象征位置','将 Heaven、Earth、Hell 放入三个高度，观察水平并置与垂直分层的差别。']
    ],'VERTICAL STAGE COSMOLOGY','象征观念的重新组织','Heavens、舞台与台下活板门可联系上、中、下的象征。图中移开部分地面以展示台下。与中世纪并置景屋的比较不证明直接建筑起源。',{activity:'cosmos',intro:'flashback',camera:cam([0,1,-1],22,-.48,.55)}),
    make('ENGLAND_08_GLOBE','england','manager','这座剧场怎样形成？','职业组织、不同场所的演出、商业观众与空间实践，在长期发展中共同塑造公共剧场。','en-cosmos','en-globe',[
      ['只需要一张完美的平面图','图纸安排构件，却不能独自解释谁演出、谁观看以及剧场如何维持。','plan-only'],
      ['把演出组织、观众与空间联系起来','屋盖与三层楼廊逐渐完整，伸出的舞台依然与院中观众相接。']
    ],'GLOBE-TYPE THEATRE','环球式公共剧场','1599 年第一座环球剧场开幕。这里展示类型而非精确复原；同时的英国也有室内剧场、宫廷演出等实践，不能用一种形式代表整个国家。')
  ];
  T.BRANCH = {
    storageKey:'theatre-time-machine-v4-story', legacyKey:'theatre-time-machine-v3-story',
    routes:{italy,england}, names:{italy:'意大利',england:'英国'},
    colors:{italy:'#dbc59d',england:'#dbac96'},
    mapCamera:cam([26,.5,1],33,-.15,1.17), compareCamera:cam([0,1,-.5],30,0,.72),
    routeCamera:cam(),
    keywords:{italy:['HUMANISM','COURT','FRONTAL','PERSPECTIVE','VIEWPOINT','FRAMED SPACE','VISUAL ILLUSION'],england:['PLAYERS','COMPANY','INN YARD','PUBLIC THEATRE','THRUST','OPEN STAGE','ACTOR–AUDIENCE']},
    summary:{italy:'宫廷与学院实验，把古典文本、集中观看与视觉布景联系起来。',england:'职业剧团与商业观众，推动开放舞台与多向交流的空间组织。'},
    sources:[
      ['Nordic Theatre Studies · The Power of Illusion：透视与英国宫廷实践','https://tidsskrift.dk/nts/article/download/24303/21303/56248'],
      ['Teatro Olimpico · 学院、帕拉迪奥与 1585 年透视街景','https://www.teatrolimpicovicenza.it/en/the-theatre/introduction'],
      ['Shakespeare’s Globe · 公共剧场、旅馆与 1576 年 The Theatre','https://www.shakespearesglobe.com/discover/shakespeares-world/playhouses/'],
      ['Shakespeare’s Globe · Heavens、活板门与舞台效果','https://www.shakespearesglobe.com/discover/shakespeares-world/special-effects/'],
      ['Shakespeare’s Globe · 第一座环球剧场','https://www.shakespearesglobe.com/discover/shakespeares-world/the-globe/']
    ]
  };
})(window.TTM);
