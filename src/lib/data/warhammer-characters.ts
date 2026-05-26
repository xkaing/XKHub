export type WarhammerEra = '30K' | '40K'

export type WarhammerForceType = '军团' | '战团'

export type WarhammerAllegiance = '叛乱派核心' | '忠诚派核心' | '忠诚派 / 反叛荷鲁斯者' | '军团组织' | '混淆项'

export interface WarhammerCharacter {
  nameCn: string
  nameEn: string
  identity: string
  summary: string
  allegiance: WarhammerAllegiance
  keywords: string[]
  images?: WarhammerCharacterImage[]
}

export interface WarhammerCharacterImage {
  title: string
  kind: '官方棋子图' | '官方设定图' | '官方小说封面'
  url: string
  source: string
  sourceUrl: string
}

export interface WarhammerForce {
  id: string
  era: WarhammerEra
  period: string
  forceType: WarhammerForceType
  legionNumber?: string
  name: string
  nameEn: string
  formerName?: string
  formerNameEn?: string
  laterName?: string
  laterNameEn?: string
  summary: string
  characters: WarhammerCharacter[]
}

export const warhammerForces: WarhammerForce[] = [
  {
    id: '30k-horus-heresy-luna-wolves-sons-of-horus',
    era: '30K',
    period: '荷鲁斯之乱时期',
    forceType: '军团',
    legionNumber: '第十六军团',
    name: '荷鲁斯之子',
    nameEn: 'Sons of Horus',
    formerName: '影月苍狼',
    formerNameEn: 'Luna Wolves',
    laterName: '荷鲁斯之子',
    laterNameEn: 'Sons of Horus',
    summary:
      '第十六军团在大远征时期被称为影月苍狼，荷鲁斯成为战帅后改名为荷鲁斯之子。他们是荷鲁斯之乱的核心军团，也是后来黑色军团的前身。',
    characters: [
      {
        nameCn: '荷鲁斯·卢佩卡尔',
        nameEn: 'Horus Lupercal',
        identity: '第十六军团原体，战帅',
        summary:
          '帝皇最宠爱的儿子之一，大远征后期被任命为战帅。被混沌腐化后发动荷鲁斯之乱，最终在泰拉围城中与帝皇决战。',
        allegiance: '叛乱派核心',
        keywords: ['战帅', '原体', '叛乱源头'],
        images: [
          {
            title: 'Warmaster Horus JoyToy 展示图',
            kind: '官方棋子图',
            url: 'https://assets.warhammer-community.com/articles/40669918-dc11-487f-80fa-ae65be85b35e/wicw1wktozz97xdz.jpg',
            source: 'Warhammer Community',
            sourceUrl:
              'https://www.warhammer-community.com/en-gb/articles/RNo8Fi0B/join-warmaster-horus-and-ezekyle-abaddon-for-a-jolly-joytoy-galaxy-burning/',
          },
          {
            title: 'Warmaster Horus JoyToy 动态展示图',
            kind: '官方棋子图',
            url: 'https://assets.warhammer-community.com/articles/40669918-dc11-487f-80fa-ae65be85b35e/7duidqdwbrb5zboi.jpg',
            source: 'Warhammer Community',
            sourceUrl:
              'https://www.warhammer-community.com/en-gb/articles/RNo8Fi0B/join-warmaster-horus-and-ezekyle-abaddon-for-a-jolly-joytoy-galaxy-burning/',
          },
        ],
      },
      {
        nameCn: '伊泽凯尔·阿巴顿',
        nameEn: 'Ezekyle Abaddon',
        identity: '第一连长，四王议会成员',
        summary:
          '荷鲁斯之子第一连连长，精英终结者贾斯塔林的首领。荷鲁斯死后后来成为黑色军团之主，也就是 40K 的战争大师阿巴顿。',
        allegiance: '叛乱派核心',
        keywords: ['第一连长', '贾斯塔林', '黑色军团之主'],
        images: [
          {
            title: 'Ezekyle Abaddon JoyToy 展示图',
            kind: '官方棋子图',
            url: 'https://assets.warhammer-community.com/articles/40669918-dc11-487f-80fa-ae65be85b35e/3wqv1ylw5cswgvhy.jpg',
            source: 'Warhammer Community',
            sourceUrl:
              'https://www.warhammer-community.com/en-gb/articles/RNo8Fi0B/join-warmaster-horus-and-ezekyle-abaddon-for-a-jolly-joytoy-galaxy-burning/',
          },
          {
            title: 'Ezekyle Abaddon JoyToy 枪械姿态图',
            kind: '官方棋子图',
            url: 'https://assets.warhammer-community.com/articles/40669918-dc11-487f-80fa-ae65be85b35e/8conv1bk9lpf3q3a.jpg',
            source: 'Warhammer Community',
            sourceUrl:
              'https://www.warhammer-community.com/en-gb/articles/RNo8Fi0B/join-warmaster-horus-and-ezekyle-abaddon-for-a-jolly-joytoy-galaxy-burning/',
          },
          {
            title: 'Ezekyle Abaddon 官方授权商品图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/SI-JTF-_---POWH5074__0.jpg?v=1722346877',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-action-figure-sons-of-horus-ezekyle-abaddon-first-captain-of-the-xvith-legion-1-18-scale-preorder-1',
          },
        ],
      },
      {
        nameCn: '加维尔·洛肯',
        nameEn: 'Garviel Loken',
        identity: '第十连连长，四王议会成员',
        summary:
          '《荷鲁斯崛起》核心主角之一。原本是荷鲁斯最受信任的军官之一，后来拒绝叛乱，在伊斯塔万三号成为忠诚派代表人物。',
        allegiance: '忠诚派 / 反叛荷鲁斯者',
        keywords: ['第十连', '忠诚派', '伊斯塔万三号'],
      },
      {
        nameCn: '塔里克·托加顿',
        nameEn: 'Tarik Torgaddon',
        identity: '第二连连长，四王议会成员',
        summary:
          '性格幽默、战技高超，是洛肯的重要朋友。忠于帝皇，在伊斯塔万三号事件中与叛军决裂。',
        allegiance: '忠诚派 / 反叛荷鲁斯者',
        keywords: ['第二连', '洛肯挚友', '伊斯塔万三号'],
      },
      {
        nameCn: '霍鲁斯·阿克西曼德',
        nameEn: 'Horus Aximand',
        identity: '第五连连长，四王议会成员',
        summary: '因长相酷似荷鲁斯被称为“小荷鲁斯”。叛乱后追随战帅，是军团高层的重要指挥官。',
        allegiance: '叛乱派核心',
        keywords: ['小荷鲁斯', '第五连', '叛乱高层'],
        images: [
          {
            title: 'Little Horus Aximand Forge World 展示图',
            kind: '官方棋子图',
            url: 'https://assets.warhammer-community.com/articles/e8c160e9-1c09-4085-91ec-29fab6f68938/gs9boguefdtqbwfz.jpg',
            source: 'Warhammer Community',
            sourceUrl: 'https://www.warhammer-community.com/en-gb/articles/KYxLDxzS/heresy-thursday-little-horus-aximand/',
          },
          {
            title: 'Little Horus Aximand 官方授权商品图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/4_c94a8b4a-fd5c-4a06-971b-8e5e6dbde09f.png?v=1755010585',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-action-figure-sons-of-horus-little-horus-aximand-captain-of-the-5th-company-1-18-scale-preorder',
          },
        ],
      },
      {
        nameCn: '法尔库斯·基布雷',
        nameEn: 'Falkus Kibre',
        identity: '贾斯塔林终结者队长',
        summary: '荷鲁斯之子的精锐终结者军官，阿巴顿麾下重要人物。后期与混沌腐化联系极深。',
        allegiance: '叛乱派核心',
        keywords: ['贾斯塔林', '终结者', '阿巴顿麾下'],
      },
      {
        nameCn: '塞詹努斯',
        nameEn: 'Hastur Sejanus',
        identity: '原第四名四王议会成员',
        summary:
          '在洛肯加入四王议会前，塞詹努斯是荷鲁斯最信任的军官之一。他在“虚假帝国”事件中阵亡，某种意义上是荷鲁斯堕落前的关键损失。',
        allegiance: '军团组织',
        keywords: ['四王议会', '荷鲁斯亲信', '虚假帝国事件'],
      },
      {
        nameCn: '伊格内斯·卡尔诺',
        nameEn: 'Iacton Qruze',
        identity: '老兵，“半听者”',
        summary:
          '影月苍狼旧时代的老兵，不太被年轻军官重视，但最终站在忠诚派一边，后来参与早期灰骑士和游侠骑士相关线索。',
        allegiance: '忠诚派 / 反叛荷鲁斯者',
        keywords: ['老兵', '半听者', '忠诚派幸存者'],
      },
      {
        nameCn: '马尔格赫斯特',
        nameEn: 'Maloghurst the Twisted',
        identity: '荷鲁斯的书记官 / 谋士',
        summary:
          '荷鲁斯身边的核心谋臣，身体残疾但极有影响力。叛乱中负责大量政治、仪式和战略层面的阴暗事务。',
        allegiance: '叛乱派核心',
        keywords: ['书记官', '谋士', '仪式与战略'],
        images: [
          {
            title: 'Maloghurst the Twisted 官方授权商品图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/THHSonsofHorusMaloghursttheTwisted_TheWarmastersEquerrywithLegionStandardandBanestrikeBolter-0K0A3785.png?v=1779108014',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-sons-of-horus-maloghurst-the-twisted-the-warmasters-equerry-with-legion-standard-and-banestrike-bolter-1-18-scale-preorder',
          },
          {
            title: 'Maloghurst the Twisted 侧面展示图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/THHSonsofHorusMaloghursttheTwisted_TheWarmastersEquerrywithLegionStandardandBanestrikeBolter-0K0A3787.png?v=1779108013',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-sons-of-horus-maloghurst-the-twisted-the-warmasters-equerry-with-legion-standard-and-banestrike-bolter-1-18-scale-preorder',
          },
        ],
      },
      {
        nameCn: '阿巴顿麾下贾斯塔林',
        nameEn: 'Justaerin',
        identity: '第一连精锐',
        summary:
          '不是单一人物，但非常著名。穿黑色终结者甲，是第十六军团最恐怖的近卫力量之一，也影响了后来黑色军团的审美。',
        allegiance: '军团组织',
        keywords: ['第一连', '黑色终结者甲', '近卫力量'],
        images: [
          {
            title: 'Justaerin with Carsonran Power Axe',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/2nogylqp9v9stiq2g0mcmd7mtwzzcsavx9vvgl6fp9u2lgsv.jpg?v=1718982559',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-action-figure-sons-of-horus-justaerin-terminator-squad-justaerin-with-carsonran-power-axe-1-18-scale-preorder-1',
          },
          {
            title: 'Justaerin with Lightning Claws',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/SI-JTF-_---POWH5070__0.jpg?v=1722346195',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-action-figure-sons-of-horus-justaerin-terminator-squad-justaerin-with-lightning-claws-1-18-scale-preorder-1',
          },
        ],
      },
      {
        nameCn: '提巴尔特·马尔',
        nameEn: 'Tiberius Marr',
        identity: '荷鲁斯之子军官',
        summary: '荷鲁斯之子军官，参与叛乱后期多场战事，是叛乱派军团体系中的重要指挥官之一。',
        allegiance: '叛乱派核心',
        keywords: ['军官', '叛乱后期', '指挥官'],
        images: [
          {
            title: 'Tybalt Marr 官方授权商品图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/18_d051eb04-6469-48ee-927e-5f22f8987173.png?v=1771327662',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-action-figure-sons-of-horus-tybalt-marr-captain-of-the-18th-company-1-18-scale-preorder',
          },
          {
            title: 'Tybalt Marr 动态展示图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/15_9d9561a2-59bf-49ee-9075-19f7770c74d4.png?v=1771327662',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-action-figure-sons-of-horus-tybalt-marr-captain-of-the-18th-company-1-18-scale-preorder',
          },
        ],
      },
      {
        nameCn: '内罗·维普斯',
        nameEn: 'Nero Vipus',
        identity: '洛肯麾下军士',
        summary: '洛肯麾下军士，在伊斯塔万三号相关忠诚派线中具有代表性。',
        allegiance: '忠诚派 / 反叛荷鲁斯者',
        keywords: ['洛肯麾下', '军士', '忠诚派'],
      },
      {
        nameCn: '梅萨·瓦伦',
        nameEn: 'Mersadie Oliton',
        identity: '记述者',
        summary: '不是阿斯塔特，但与洛肯和第十六军团故事关系很深，是影月苍狼叙事线的重要见证者。',
        allegiance: '忠诚派 / 反叛荷鲁斯者',
        keywords: ['记述者', '洛肯相关', '见证者'],
      },
      {
        nameCn: '连恩德·斯卡瓦尔',
        nameEn: 'Leodrakk / Lheorvine?',
        identity: '常见混淆项',
        summary:
          '有些 40K 黑色军团人物并非 30K 荷鲁斯之子核心成员，整理时容易混进来。30K 重点仍是四王议会、贾斯塔林、洛肯忠诚派线和荷鲁斯亲信。',
        allegiance: '混淆项',
        keywords: ['黑色军团', '资料混淆', '非核心成员'],
      },
    ],
  },
  {
    id: '30k-horus-heresy-raven-guard',
    era: '30K',
    period: '荷鲁斯之乱时期',
    forceType: '军团',
    legionNumber: '第十九军团',
    name: '暗鸦守卫',
    nameEn: 'Raven Guard',
    summary:
      '第十九军团暗鸦守卫由科拉克斯统率，以隐秘行动、斩首打击、快速突袭和特种作战著称。伊斯塔万五号投降场大屠杀后，军团遭受重创，但幸存者继续以分散袭扰和秘密战打击叛军。',
    characters: [
      {
        nameCn: '科拉克斯',
        nameEn: 'Corvus Corax',
        identity: '第十九军团原体',
        summary:
          '暗鸦守卫原体，来自救赎星基亚瓦尔的解放者。荷鲁斯之乱中在伊斯塔万五号遭受惨重损失，之后带领残存军团继续进行游击、潜伏和复仇行动。',
        allegiance: '忠诚派核心',
        keywords: ['原体', '暗鸦之主', '伊斯塔万五号幸存者'],
        images: [
          {
            title: 'Corvus Corax 官方授权商品图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/RavenGuardCorvusCorax_PrimarchoftheXIXLegionwithartificer-craftedlightningtalons_archaeotechpistols_andwhip0K0A3031.png?v=1776093163',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-raven-guard-corvus-corax-primarch-of-the-xix-legion-with-artificer-crafted-lightning-talons-archaeotech-pistols-and-whip-1-18-scale-preorder-exclusive-t-shirt',
          },
          {
            title: 'Corvus Corax 动态展示图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/RavenGuardCorvusCorax_PrimarchoftheXIXLegionwithartificer-craftedlightningtalons_archaeotechpistols_andwhip0K0A3049.png?v=1776182195',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-raven-guard-corvus-corax-primarch-of-the-xix-legion-with-artificer-crafted-lightning-talons-archaeotech-pistols-and-whip-1-18-scale-preorder-exclusive-t-shirt',
          },
        ],
      },
      {
        nameCn: '阿加皮托·内夫',
        nameEn: 'Agapito Nev',
        identity: '暗鸦守卫指挥官，猛禽派系重要人物',
        summary:
          '科拉克斯身边的重要军官之一，和兄弟布兰恩·内夫同属军团高层。在伊斯塔万五号之后，他代表暗鸦守卫旧军团荣誉与幸存者复仇意志的一面。',
        allegiance: '忠诚派核心',
        keywords: ['军团高层', '内夫兄弟', '幸存者'],
      },
      {
        nameCn: '布兰恩·内夫',
        nameEn: 'Branne Nev',
        identity: '暗鸦守卫指挥官，科拉克斯亲信',
        summary:
          '阿加皮托·内夫的兄弟，科拉克斯的重要指挥官之一。荷鲁斯之乱中常与军团重建、基因种子计划和暗鸦守卫幸存者行动联系在一起。',
        allegiance: '忠诚派核心',
        keywords: ['军团重建', '内夫兄弟', '科拉克斯亲信'],
      },
      {
        nameCn: '尼科纳·沙罗金',
        nameEn: 'Nykona Sharrowkyn',
        identity: '暗鸦守卫影袭者 / 杀手',
        summary:
          '暗鸦守卫中极具传奇色彩的刺客型战士，擅长潜伏、精准打击和近距离处决。在破碎军团相关故事中十分活跃，也以和卢修斯等叛军高手的交锋闻名。',
        allegiance: '忠诚派核心',
        keywords: ['刺客', '破碎军团', '卢修斯交锋'],
      },
      {
        nameCn: '凯德斯·奈克斯',
        nameEn: 'Kaedes Nex',
        identity: '“血鸦”，暗鸦守卫莫瑞塔特',
        summary:
          '暗鸦守卫中最著名的莫瑞塔特之一，绰号“血鸦”。以双持手炮和冷酷猎杀闻名，是第十九军团阴影作战与处决战术的代表人物。',
        allegiance: '忠诚派核心',
        keywords: ['血鸦', '莫瑞塔特', '双手炮'],
        images: [
          {
            title: 'Kaedes Nex Warhammer Community 专文头图',
            kind: '官方棋子图',
            url: 'https://assets.warhammer-community.com/thh_kaedes-feb27-1-feature-fvqfq5nhns.jpg',
            source: 'Warhammer Community',
            sourceUrl: 'https://www.warhammer-community.com/en-gb/articles/wj9xgot4/heresy-thursday-the-blood-crow-is-on-the-hunt/',
          },
          {
            title: 'Kaedes Nex Warhammer Community 棋子图',
            kind: '官方棋子图',
            url: 'https://assets.warhammer-community.com/thh_kaedes-feb27-mini-rkxdunefvz.jpg',
            source: 'Warhammer Community',
            sourceUrl: 'https://www.warhammer-community.com/en-gb/articles/wj9xgot4/heresy-thursday-the-blood-crow-is-on-the-hunt/',
          },
          {
            title: 'Kaedes Nex Warhammer Community 设定图',
            kind: '官方设定图',
            url: 'https://assets.warhammer-community.com/thh_kaedes-feb27-art-8fxw5zu2om.jpg',
            source: 'Warhammer Community',
            sourceUrl: 'https://www.warhammer-community.com/en-gb/articles/wj9xgot4/heresy-thursday-the-blood-crow-is-on-the-hunt/',
          },
          {
            title: 'Kaedes Nex 官方授权商品图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/THHRavenGuardKaedesNx_TheBloodCrowwithFulcrumHandCannons-0K0A3811_fdc8c8da-7af0-492f-a152-cb930ba301fb.png?v=1779108439',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-raven-guard-kaedes-nex-the-blood-crow-with-fulcrum-hand-cannons-1-18-scale-preorder',
          },
          {
            title: 'Kaedes Nex 战斗姿态图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/THHRavenGuardKaedesNx_TheBloodCrowwithFulcrumHandCannons-0K0A3799_5e16fb0d-4e4b-4cce-8655-49f362d946fb.png?v=1779108439',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-raven-guard-kaedes-nex-the-blood-crow-with-fulcrum-hand-cannons-1-18-scale-preorder',
          },
          {
            title: 'Kaedes Nex 手炮展示图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/THHRavenGuardKaedesNx_TheBloodCrowwithFulcrumHandCannons-0K0A3804_165493ed-d789-4467-9798-ebf62f70dc92.png?v=1779108439',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-raven-guard-kaedes-nex-the-blood-crow-with-fulcrum-hand-cannons-1-18-scale-preorder',
          },
          {
            title: 'Kaedes Nex 侧身姿态图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/THHRavenGuardKaedesNx_TheBloodCrowwithFulcrumHandCannons-0K0A3806_a37afe54-1511-414c-9354-d719629c7709.png?v=1779108438',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-raven-guard-kaedes-nex-the-blood-crow-with-fulcrum-hand-cannons-1-18-scale-preorder',
          },
          {
            title: 'Kaedes Nex 双枪近景图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/THHRavenGuardKaedesNx_TheBloodCrowwithFulcrumHandCannons-0K0A3808_8bb6a143-da92-4088-92cb-af054b3e2cf7.png?v=1779108439',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-raven-guard-kaedes-nex-the-blood-crow-with-fulcrum-hand-cannons-1-18-scale-preorder',
          },
          {
            title: 'Kaedes Nex 正面近景图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/THHRavenGuardKaedesNx_TheBloodCrowwithFulcrumHandCannons-0K0A3809.png?v=1779108439',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-raven-guard-kaedes-nex-the-blood-crow-with-fulcrum-hand-cannons-1-18-scale-preorder',
          },
          {
            title: 'Kaedes Nex 盔甲细节图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/THHRavenGuardKaedesNx_TheBloodCrowwithFulcrumHandCannons-0K0A3810_ade5a5d5-6eec-4e21-8a95-98ed48b7079c.png?v=1779108439',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-raven-guard-kaedes-nex-the-blood-crow-with-fulcrum-hand-cannons-1-18-scale-preorder',
          },
          {
            title: 'Kaedes Nex 配件展示图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/THHRavenGuardKaedesNx_TheBloodCrowwithFulcrumHandCannons-0K0A3792_7c33aae1-4bcf-40a3-b212-6acda2f7650a.png?v=1779108439',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-raven-guard-kaedes-nex-the-blood-crow-with-fulcrum-hand-cannons-1-18-scale-preorder',
          },
          {
            title: 'Kaedes Nex 替换件展示图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/THHRavenGuardKaedesNx_TheBloodCrowwithFulcrumHandCannons-0K0A3794_07b10723-5ee8-436b-8d70-1b71b2634e29.png?v=1779108440',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-raven-guard-kaedes-nex-the-blood-crow-with-fulcrum-hand-cannons-1-18-scale-preorder',
          },
          {
            title: 'Kaedes Nex 包装展示图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/THHRavenGuardKaedesNx_TheBloodCrowwithFulcrumHandCannons-0K0A3802_12bca938-338f-41d4-9b1b-89e956f0840f.png?v=1779108439',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-raven-guard-kaedes-nex-the-blood-crow-with-fulcrum-hand-cannons-1-18-scale-preorder',
          },
          {
            title: 'Kaedes Nex 背面展示图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/THHRavenGuardKaedesNx_TheBloodCrowwithFulcrumHandCannons-0K0A3769_f7af7c46-443e-48cb-b06b-a6ab1fd202d7.png?v=1779108439',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-raven-guard-kaedes-nex-the-blood-crow-with-fulcrum-hand-cannons-1-18-scale-preorder',
          },
        ],
      },
      {
        nameCn: '阿尔瓦雷克斯·莫恩',
        nameEn: 'Alvarex Maun',
        identity: '舰队指挥官 / 太空战专家',
        summary:
          '暗鸦守卫舰队体系中的重要指挥官，以舰队协调、突袭支援和撤离行动闻名。伊斯塔万五号之后，他代表了军团在轨道与深空层面的生存能力。',
        allegiance: '忠诚派核心',
        keywords: ['舰队指挥', '撤离行动', '太空战'],
      },
      {
        nameCn: '索拉罗·安',
        nameEn: 'Solaro An',
        identity: '暗鸦守卫军官',
        summary:
          '荷鲁斯之乱时期暗鸦守卫军官之一，参与军团幸存者线与特种作战线，是科拉克斯麾下较常被提及的指挥层人物。',
        allegiance: '忠诚派核心',
        keywords: ['军官', '特种作战', '幸存者线'],
      },
      {
        nameCn: '苏库努',
        nameEn: 'Soukhounou',
        identity: '暗鸦守卫军官',
        summary:
          '暗鸦守卫荷鲁斯之乱时期军官，和军团分散作战、秘密任务及伊斯塔万后的复仇行动有关。',
        allegiance: '忠诚派核心',
        keywords: ['军官', '秘密任务', '复仇行动'],
      },
      {
        nameCn: '格瑞斯·阿伦迪',
        nameEn: 'Gherith Arendi',
        identity: '暗鸦守卫幸存者军官',
        summary:
          '暗鸦守卫幸存者线中的重要人物之一，常与军团重建、伊斯塔万五号之后的心理创伤和忠诚派残军行动相连。',
        allegiance: '忠诚派核心',
        keywords: ['幸存者', '军团重建', '忠诚派残军'],
      },
      {
        nameCn: '阿洛尼·特夫',
        nameEn: 'Aloni Tev',
        identity: '暗鸦守卫军官',
        summary:
          '荷鲁斯之乱时期暗鸦守卫人物，出现在军团幸存者与科拉克斯相关故事中，是暗鸦守卫残存力量的一员。',
        allegiance: '忠诚派核心',
        keywords: ['军官', '幸存者', '科拉克斯相关'],
      },
      {
        nameCn: '莫尔·戴森',
        nameEn: 'Mor Deythan',
        identity: '暗鸦守卫精锐暗杀 / 侦察部队',
        summary:
          '不是单一人物，而是暗鸦守卫极具代表性的精锐组织。莫尔·戴森擅长隐蔽渗透、狙击和近距离斩首行动，是第十九军团战法的集中体现。',
        allegiance: '军团组织',
        keywords: ['精锐组织', '渗透', '狙击'],
        images: [
          {
            title: 'Raven Guard Mor Deythan 官方授权商品图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/04a2438a-8f46-4181-aad0-81fc45a261c1.png?v=1775653438',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-raven-guard-mor-deythan-shade-with-nemesis-bolt-rifle-1-18-scale-preorder',
          },
        ],
      },
      {
        nameCn: '黑怒鸦',
        nameEn: 'Dark Fury',
        identity: '暗鸦守卫跳跃突击精锐',
        summary:
          '不是单一人物，而是暗鸦守卫标志性的突击精锐。黑怒鸦以跳跃背包和闪电爪进行高速斩首与近战突袭，体现军团“从阴影中突然杀出”的风格。',
        allegiance: '军团组织',
        keywords: ['跳跃突击', '闪电爪', '斩首打击'],
        images: [
          {
            title: 'Raven Guard Dark Fury 官方授权商品图',
            kind: '官方棋子图',
            url: 'https://cdn.shopify.com/s/files/1/0306/5040/0907/files/562c3b2a-4d52-44c5-b52c-d22b66d5664c.png?v=1775651855',
            source: 'Warhammer Officially Licensed Merchandise',
            sourceUrl:
              'https://merch.warhammer.com/products/joytoy-warhammer-the-horus-heresy-raven-guard-dark-fury-with-lightning-claws-1-18-scale-preorder',
          },
        ],
      },
    ],
  },
]

export const warhammerEraOptions: WarhammerEra[] = ['30K', '40K']

export function getWarhammerForcesByEra(era: WarhammerEra) {
  return warhammerForces.filter((force) => force.era === era)
}

export function getWarhammerCharacterStats() {
  return {
    forces: warhammerForces.length,
    characters: warhammerForces.reduce((sum, force) => sum + force.characters.length, 0),
    eras: new Set(warhammerForces.map((force) => force.era)).size,
  }
}
