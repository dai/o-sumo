/**
 * Kimarite data: the 82 official winning techniques of sumo,
 * officially recognized by the Japan Sumo Association since 2001.
 *
 * Source: aggregated from the official JSA guide and Wikipedia.
 * Hand-curated for stability. No runtime fetch.
 */

export type KimariteCategory =
  | 'kihon'
  | 'nage'
  | 'kake'
  | 'hineri'
  | 'sori'
  | 'tokushu';

export interface Kimarite {
  id: string;
  nameJa: string;
  reading: string;
  romaji: string;
  english: string;
  descriptionJa: string;
  descriptionEn: string;
  category: KimariteCategory;
}

export const KIMARITE_LIST: readonly Kimarite[] = [
  { id: 'abisetaoshi', nameJa: '浴びせ倒し', reading: 'あびせたおし', romaji: 'abisetaoshi', english: 'backward force down', descriptionJa: '相手に張り付いたまま自分の体を反り気味にして前へ倒し込み、相手を後ろから土俵に倒す。', descriptionEn: 'Pushes the opponent down to the dohyō back-first by leaning forward while grappling.', category: 'kihon' },
  { id: 'oshidashi', nameJa: '押し出し', reading: 'おしだし', romaji: 'oshidashi', english: 'frontal push out', descriptionJa: 'まわしを持たずに、両手の力だけで相手を土俵の外へ押し出す最も基本的な決まり手。', descriptionEn: 'Pushes the opponent out of the ring using the arms, without holding their mawashi or extending the arms.', category: 'kihon' },
  { id: 'oshitaoshi', nameJa: '押し倒し', reading: 'おしたおし', romaji: 'oshitaoshi', english: 'frontal push down', descriptionJa: 'まわしを持たずに相手を押すが、相手の足が浮いて倒れることで決まる。', descriptionEn: 'Similar to an oshidashi, except that the opponent falls down (as opposed to standing).', category: 'kihon' },
  { id: 'tsukidashi', nameJa: '突き出し', reading: 'つきだし', romaji: 'tsukidashi', english: 'frontal thrust out', descriptionJa: '相手を両手または片手で突き、土俵の外へ押し出す。まわしを持たない。', descriptionEn: 'Uses a single or multiple hand thrusts to force the opponent out of the ring without maintaining any contact.', category: 'kihon' },
  { id: 'tsukitaoshi', nameJa: '突き倒し', reading: 'つきたおし', romaji: 'tsukitaoshi', english: 'frontal thrust down', descriptionJa: '突き出した勢いで相手を倒れさせる。突き出しと似ているが土俵内で崩れる。', descriptionEn: 'Similar to a tsukidashi, except that the opponent falls down (as opposed to standing).', category: 'kihon' },
  { id: 'yorikiri', nameJa: '寄り切り', reading: 'よりきり', romaji: 'yorikiri', english: 'frontal force out', descriptionJa: 'まわしを取って相手に寄りかかり、そのまま土俵の外へ押し出す。最も多い決まり手。', descriptionEn: 'Forces the opponent out of the ring with a grip on the mawashi. The most common kimarite in sumo.', category: 'kihon' },
  { id: 'yoritaoshi', nameJa: '寄り倒し', reading: 'よりたおし', romaji: 'yoritaoshi', english: 'frontal crush out', descriptionJa: '寄り切りの流れで相手を倒しながら土俵の外へ出す。', descriptionEn: 'Similar to a yorikiri, except that the opponent falls down out of the ring as a result, effectively crushing him out.', category: 'kihon' },
  { id: 'ipponzeoi', nameJa: '一本背負い', reading: 'いっぽんぜおい', romaji: 'ipponzeoi', english: 'one-armed shoulder throw', descriptionJa: '相手の手首を取り、自分の背中に背負うように投げる柔道形式の投げ。', descriptionEn: 'Moves backwards to the side and pulls the opponent past the attacker and out of the ring by grabbing and pulling his arm with both hands.', category: 'nage' },
  { id: 'kakenage', nameJa: '掛け投げ', reading: 'かけなげ', romaji: 'kakenage', english: 'hooking inner thigh throw', descriptionJa: '自分の足を相手の内ももにかけ、両腕で抱えてから投げる。', descriptionEn: 'Lifts the opponent\'s thigh with one\'s leg, grasps them with both arms, and throws the off-balance opponent down.', category: 'nage' },
  { id: 'koshinage', nameJa: '腰投げ', reading: 'こしなげ', romaji: 'koshinage', english: 'hip throw', descriptionJa: '自分の腰に相手を引きつけて背中から倒し投げる柔道と同系の技。', descriptionEn: 'Bends over and pulls the opponent over the attacker\'s hip, then throws them to the ground on their back.', category: 'nage' },
  { id: 'kotenage', nameJa: '小手投げ', reading: 'こてなげ', romaji: 'kotenage', english: 'armlock throw', descriptionJa: '相手の伸ばした腕に自分の腕を巻きつけて、まわしを取らずに投げる。', descriptionEn: 'Wraps the arm around the opponent\'s extended arm, then throws them to the ground without touching their mawashi.', category: 'nage' },
  { id: 'kubinage', nameJa: '首投げ', reading: 'くびなげ', romaji: 'kubinage', english: 'headlock throw', descriptionJa: '相手の頭や首を両腕で抱え込み、捻りながら投げる。', descriptionEn: 'Wraps the opponent\'s head (or neck) in the arms, then throws them down.', category: 'nage' },
  { id: 'nichonage', nameJa: '二丁投げ', reading: 'にちょうなげ', romaji: 'nichōnage', english: 'body drop throw', descriptionJa: '外側から相手の両膝付近に自分の足を巻きつけ、両足を持ち上げて投げる。', descriptionEn: 'Extends the right (left) leg around the outside of the opponent\'s right (left) knee, sweeping both legs off the surface and throwing them down.', category: 'nage' },
  { id: 'shitatedashinage', nameJa: '下手出し投げ', reading: 'したてだしなげ', romaji: 'shitatedashinage', english: 'pulling underarm throw', descriptionJa: '下からまわしを取り、前方や斜め下に引き出して投げる。', descriptionEn: 'Extends the arm under the opponent\'s arm to grab the mawashi while dragging them forwards and/or to the side.', category: 'nage' },
  { id: 'shitatenage', nameJa: '下手投げ', reading: 'したてなげ', romaji: 'shitatenage', english: 'underarm throw', descriptionJa: '下からまわしを取り、横を向いて引き倒すように投げる。', descriptionEn: 'Extends the arm under the opponent\'s arm to grab the mawashi, turns sideways, and pulls the opponent down to throw them.', category: 'nage' },
  { id: 'sukuinage', nameJa: '掬い投げ', reading: 'すくいなげ', romaji: 'sukuinage', english: 'beltless arm throw', descriptionJa: '相手の脇の下から背中側に手を回し、まわしを取らずに投げる。', descriptionEn: 'Extends the arm under the opponent\'s armpit and across their back while turning sideways, forcing the opponent forward without touching the mawashi.', category: 'nage' },
  { id: 'tsukaminage', nameJa: 'つかみ投げ', reading: 'つかみなげ', romaji: 'tsukaminage', english: 'lifting throw', descriptionJa: 'まわしを持って相手を持ち上げ、自分の頭上を通して背後に投げる。', descriptionEn: 'Grabs the opponent\'s mawashi, lifts their body off the surface, pulls them past the attacker, and throws them down.', category: 'nage' },
  { id: 'uwatedashinage', nameJa: '上手出し投げ', reading: 'うわてだしなげ', romaji: 'uwatedashinage', english: 'pulling overarm throw', descriptionJa: '上手からまわしを取り、前方や斜め下に引き出して投げる。', descriptionEn: 'Extends the arm over the opponent\'s arm/back to grab the mawashi while pulling them forwards to the ground.', category: 'nage' },
  { id: 'uwatenage', nameJa: '上手投げ', reading: 'うわてなげ', romaji: 'uwatenage', english: 'overarm throw', descriptionJa: '上手からまわしを取り、横を向いて引き倒すように投げる。', descriptionEn: 'Extends the arm over the opponent\'s arm to grab the mawashi, then throws the opponent to the ground while turning sideways.', category: 'nage' },
  { id: 'yaguranage', nameJa: '櫓投げ', reading: 'やぐらなげ', romaji: 'yaguranage', english: 'inner thigh throw', descriptionJa: '互いにまわしを掴んだ状態から足を相手の股下に差し入れて持ち上げ、横に倒す。', descriptionEn: 'Pushes a leg up under the opponent\'s groin, lifts them off, and throws them down on their side.', category: 'nage' },
  { id: 'ashitori', nameJa: '足取り', reading: 'あしとり', romaji: 'ashitori', english: 'leg pick', descriptionJa: '相手の足を持ち上げてバランスを崩し、土俵の外へ押し出す。', descriptionEn: 'Grabs one of the opponent\'s legs, causing a loss of balance, enabling the rikishi to force the opponent out of the ring.', category: 'kake' },
  { id: 'chongake', nameJa: 'ちょん掛け', reading: 'ちょんがけ', romaji: 'chongake', english: 'pulling heel hook', descriptionJa: '自分の踵で相手の踵を引っかけ、上体を引き倒して後ろ向きに倒す。', descriptionEn: 'Trips the opponent through one of their heels using the attacker\'s own heel, forcing the opponent to fall down back-first.', category: 'kake' },
  { id: 'kawazugake', nameJa: '河津掛け', reading: 'かわづがけ', romaji: 'kawazugake', english: 'hooking backward counter throw', descriptionJa: '自分の足を相手の逆側の足に絡め、上体を抱えてから後方へ倒す。', descriptionEn: 'Wraps one leg around the opposite-side leg of the opponent and trips them backwards while grasping their upper body.', category: 'kake' },
  { id: 'kekaeshi', nameJa: '蹴返し', reading: 'けかえし', romaji: 'kekaeshi', english: 'minor inner foot sweep', descriptionJa: '相手の足の内側を蹴り、引き落として崩す。', descriptionEn: 'Kicks the inside of the opponent\'s foot, usually accompanied by a quick pull that causes them to lose balance.', category: 'kake' },
  { id: 'ketaguri', nameJa: '蹴手繰り', reading: 'けたぐり', romaji: 'ketaguri', english: 'pulling inside ankle sweep', descriptionJa: '立ち合い直後に相手の足を外側に蹴り、捻りながら倒す。', descriptionEn: 'Directly after the tachi-ai, the attacker kicks the opponent\'s legs to the outside and thrusts or twists them down to the dohyō.', category: 'kake' },
  { id: 'kirikaeshi', nameJa: '切り返し', reading: 'きりかえし', romaji: 'kirikaeshi', english: 'twisting backward knee trip', descriptionJa: '相手の膝の裏に自分の足を入れ、横・後ろへ捻りながら投げる。', descriptionEn: 'Places the leg behind the opponent\'s knee, then twists them sideways and backwards, sweeping them over the attacker\'s leg.', category: 'kake' },
  { id: 'komatasukui', nameJa: '小股掬い', reading: 'こまたすくい', romaji: 'komatasukui', english: 'over thigh scooping body drop', descriptionJa: '投げた相手が片足を出したところをすくい上げて投げる。', descriptionEn: 'When an opponent responds to being thrown by putting a leg forward, the attacker grabs the underside of the thigh and lifts it up.', category: 'kake' },
  { id: 'kozumatori', nameJa: '小褄取り', reading: 'こづまとり', romaji: 'kozumatori', english: 'ankle pick', descriptionJa: '相手の足首を前側から持ち上げて倒す。', descriptionEn: 'Lifts the opponent\'s ankle from the front, causing them to fall.', category: 'kake' },
  { id: 'mitokorozeme', nameJa: '三所攻め', reading: 'みところぜめ', romaji: 'mitokorozeme', english: 'triple attack force out', descriptionJa: '相手の内股・腿・胸元の三方向を同時に攻めて倒す極めて稀な技。', descriptionEn: 'Wraps one leg around the opponent\'s inside leg, grabs the other leg behind the thigh, and thrusts the head into the chest — a triple attack.', category: 'kake' },
  { id: 'nimaigeri', nameJa: '二枚蹴り', reading: 'にまいげり', romaji: 'nimaigeri', english: 'ankle kicking twist down', descriptionJa: '片足を踏み外した相手のもう一方の足首を外側から蹴り、倒す。', descriptionEn: 'Kicks an off-balance opponent on the outside of their standing leg\'s foot, then throws them down.', category: 'kake' },
  { id: 'omata', nameJa: '大股', reading: 'おおまた', romaji: 'ōmata', english: 'thigh scooping body drop', descriptionJa: '小股掬いをかわした相手のもう片方の足をすくい上げて投げる。', descriptionEn: 'When the opponent escapes from a komatsukui by extending the other foot, the attacker switches to lift the other off-balance foot and throws them down.', category: 'kake' },
  { id: 'sotogake', nameJa: '外掛け', reading: 'そとがけ', romaji: 'sotogake', english: 'outside leg trip', descriptionJa: '自分のふくらはぎを相手のふくらはぎに外側から巻きつけ、後ろへ倒す。', descriptionEn: 'Wraps the calf around the opponent\'s calf from the outside and drives them over backwards.', category: 'kake' },
  { id: 'sotokomata', nameJa: '外小股', reading: 'そこま た', romaji: 'sotokomata', english: 'outer thigh scooping body drop', descriptionJa: '投げをかわした相手の腿を外側から持ち上げて投げる。', descriptionEn: 'Directly after a nage is avoided, grabs the opponent\'s thigh from the outside, lifts it, and throws them down on their back.', category: 'kake' },
  { id: 'susoharai', nameJa: '裾払い', reading: 'すそはらい', romaji: 'susoharai', english: 'rear foot sweep', descriptionJa: '投げをかわした相手の腿の下を膝で掬い、土俵に倒す。', descriptionEn: 'Directly after a nage is avoided, drives the knee under the opponent\'s thigh and pulls them down to the surface.', category: 'kake' },
  { id: 'susotori', nameJa: '裾取り', reading: 'すそとり', romaji: 'susotori', english: 'toe pick', descriptionJa: '投げをかわした相手の足首を掴んで引き倒す。', descriptionEn: 'Directly after a nage is avoided, grabs the ankle of the opponent and pulls them down to the surface.', category: 'kake' },
  { id: 'tsumatori', nameJa: '褄取り', reading: 'つまとり', romaji: 'tsumatori', english: 'rear ankle pick', descriptionJa: '前へ崩れた相手の足を後ろから引き、後ろ向きに倒す。', descriptionEn: 'As the opponent loses balance to the front, the attacker grabs the leg and pulls it back, ensuring the opponent falls.', category: 'kake' },
  { id: 'uchigake', nameJa: '内掛け', reading: 'うちがけ', romaji: 'uchigake', english: 'inside leg trip', descriptionJa: '自分のふくらはぎを相手のふくらはぎに内側から絡め、後ろへ倒す。', descriptionEn: 'Wraps the calf around the opponent\'s calf from the inside and forces them down on their back.', category: 'kake' },
  { id: 'watashikomi', nameJa: '渡し込み', reading: 'わたしこみ', romaji: 'watashikomi', english: 'thigh grabbing push down', descriptionJa: '片手で相手の腿や膝の裏を掴み、もう片方の手で押して倒す。', descriptionEn: 'Grabs the underside of the opponent\'s thigh or knee with one hand and pushes with the other arm, forcing the opponent out or down.', category: 'kake' },
  { id: 'amiuchi', nameJa: '網打ち', reading: 'あみうち', romaji: 'amiuchi', english: 'the fisherman\'s throw', descriptionJa: '相手の両腕を自分の両腕で引き寄せ、前方へ倒す。網を投げる動作に似ている。', descriptionEn: 'Pulls on the opponent\'s arms with both arms, causing them to fall forward; named after casting a fishing net.', category: 'hineri' },
  { id: 'gasshohineri', nameJa: '合掌捻り', reading: 'がっしょうひねり', romaji: 'gasshōhineri', english: 'clasped hand twist down', descriptionJa: '両手を相手の背中で合わせ、横へ捻り倒す。', descriptionEn: 'Both hands clasp around the opponent\'s back, twisting them over sideways.', category: 'hineri' },
  { id: 'harimanage', nameJa: '波離間投げ', reading: 'はりまなげ', romaji: 'harimanage', english: 'backward belt throw', descriptionJa: '相手の背中の上を掴んでまわしを引き、前方や横に引き倒す。', descriptionEn: 'Reaches over the opponent\'s back to grab the mawashi, pulling them over in front or beside the attacker.', category: 'hineri' },
  { id: 'kainahineri', nameJa: '腕捻り', reading: 'かいなひねり', romaji: 'kainahineri', english: 'two-handed arm twist down', descriptionJa: '相手の伸ばした腕を両腕で抱え、肩で捻って倒す。', descriptionEn: 'Wraps both arms around the opponent\'s extended arm and forces them down by way of the attacker\'s shoulder.', category: 'hineri' },
  { id: 'katasukashi', nameJa: '肩透かし', reading: 'かたすかし', romaji: 'katasukashi', english: 'under-shoulder swing down', descriptionJa: '相手の肩と腕を両手で掴み、自分の肩の下を潜り抜けて倒す。', descriptionEn: 'Wraps both hands around the opponent\'s arm, grasping the shoulder and forcing them down.', category: 'hineri' },
  { id: 'kotehineri', nameJa: '小手捻り', reading: 'こてひねり', romaji: 'kotehineri', english: 'arm locking twist down', descriptionJa: '相手の腕を捻って巻き込み、土俵に倒す。', descriptionEn: 'Twists the opponent\'s arm down, causing a fall.', category: 'hineri' },
  { id: 'kubihineri', nameJa: '首捻り', reading: 'くびひねり', romaji: 'kubihineri', english: 'head twisting throw', descriptionJa: '相手の頭や首を両手で掴み、捻って倒す。', descriptionEn: 'Twists the opponent\'s head or neck down, causing a fall.', category: 'hineri' },
  { id: 'makiotoshi', nameJa: '巻き落とし', reading: 'まきおとし', romaji: 'makiotoshi', english: 'twist down', descriptionJa: 'まわしを取らず、相手の崩れた体勢に反応して捻り倒す。', descriptionEn: 'Reacts quickly to the opponent\'s actions, twisting the off-balance body down to the dohyō without grasping the mawashi.', category: 'hineri' },
  { id: 'osakate', nameJa: '大逆手', reading: 'おおさかて', romaji: 'ōsakate', english: 'backward twisting overarm throw', descriptionJa: '自分の腕の上に伸びた相手の腕を巻き込み、捻って倒す。', descriptionEn: 'Takes the opponent\'s arm extended over the attacker\'s arm and twists it downward, then throws the body in the same direction.', category: 'hineri' },
  { id: 'sabaori', nameJa: '鯖折り', reading: 'さばおり', romaji: 'sabaori', english: 'forward force down', descriptionJa: 'まわしを掴んだまま引き下げ、相手の膝から崩して倒す。', descriptionEn: 'Grabs the opponent\'s mawashi while pulling out and down, forcing the opponent\'s knees to the dohyō.', category: 'hineri' },
  { id: 'sakatottari', nameJa: '逆とったり', reading: 'さかとったり', romaji: 'sakatottari', english: 'arm bar throw counter', descriptionJa: 'とったりを逆方向から返す返し技。相手の腕を逆に極めながら倒す。', descriptionEn: 'Wraps one arm around the opponent\'s extended arm while grasping the wrist with the other hand, twisting and forcing them down — the "anti-tottari".', category: 'hineri' },
  { id: 'shitatehineri', nameJa: '下手捻り', reading: 'したてひねり', romaji: 'shitatehineri', english: 'twisting underarm throw', descriptionJa: '下手からまわしを取り、引き下げて捻り倒す。', descriptionEn: 'Extends an arm under the opponent\'s arm to grasp the mawashi, then pulls it down until the opponent falls or touches their knee to the dohyō.', category: 'hineri' },
  { id: 'sotomuso', nameJa: '外無双', reading: 'そとむそう', romaji: 'sotomusō', english: 'outer thigh propping twist down', descriptionJa: '片手で相手の外側膝を掴み、自分の膝に相手を預けて捻り倒す。', descriptionEn: 'Uses the left (right) hand to grab the outside of the opponent\'s right (left) knee and twisting them over the attacker\'s left (right) knee.', category: 'hineri' },
  { id: 'tokkurinage', nameJa: '徳利投げ', reading: 'とっくりなげ', romaji: 'tokkurinage', english: 'two handed head twist down', descriptionJa: '相手の首や頭の両側を両手で掴み、捻って倒す。', descriptionEn: 'Grasps the opponent\'s neck or head with both hands and twists them down to the dohyō.', category: 'hineri' },
  { id: 'tottari', nameJa: 'とったり', reading: 'とったり', romaji: 'tottari', english: 'arm bar throw', descriptionJa: '相手の伸ばした片腕を両腕で抱え込み、自分の前に倒す大逆転技。', descriptionEn: 'Wraps both arms around the opponent\'s extended arm and forces them forward down to the dohyō.', category: 'hineri' },
  { id: 'tsukiotoshi', nameJa: '突き落とし', reading: 'つきおとし', romaji: 'tsukiotoshi', english: 'thrust down', descriptionJa: '相手の両腕を掴んだまま押し下げ、重心を崩して捻り倒す。', descriptionEn: 'Twists the opponent down to the dohyō by forcing the arms off the opponent\'s center of gravity.', category: 'hineri' },
  { id: 'uchimuso', nameJa: '内無双', reading: 'うちむそう', romaji: 'uchimusō', english: 'inner thigh propping twist down', descriptionJa: '片手で相手の外側膝を掴み、内側に預けて捻り倒す。外無双の対称技。', descriptionEn: 'Uses the left (right) hand to grab the outside of the opponent\'s left (right) knee and twisting them down.', category: 'hineri' },
  { id: 'uwatehineri', nameJa: '上手捻り', reading: 'うわてひねり', romaji: 'uwatehineri', english: 'twisting overarm throw', descriptionJa: '上手からまわしを取り、引き下げて捻り倒す。', descriptionEn: 'Extends the arm over the opponent\'s arm to grasp the mawashi, then pulls it down until the opponent falls or touches their knee to the dohyō.', category: 'hineri' },
  { id: 'zubuneri', nameJa: 'ずぶねり', reading: 'ずぶねり', romaji: 'zubuneri', english: 'head pivot throw', descriptionJa: '捻り技の最中に頭を相手の胸に押し当て、体勢を崩して倒す。', descriptionEn: 'Uses the head to thrust an opponent down during a hineri.', category: 'hineri' },
  { id: 'izori', nameJa: '居反り', reading: 'いぞり', romaji: 'izori', english: 'backwards body drop', descriptionJa: '突進してくる相手の膝裏やまわしを抱えて後ろへ倒し、自分の上に相手を崩す。', descriptionEn: 'Dives under the opponent\'s charge, grabs behind one or both knees or the mawashi, and pulls them up and over backwards.', category: 'sori' },
  { id: 'kakezori', nameJa: '掛け反り', reading: 'かけぞり', romaji: 'kakezori', english: 'hooking backwards body drop', descriptionJa: '頭を相手の腕や体の下に潜り込ませ、自分の足の上へ相手を倒す。', descriptionEn: 'Puts the head under the opponent\'s extended arm and body, forcing them backwards over the attacker\'s legs.', category: 'sori' },
  { id: 'shumokuzori', nameJa: '撞木反り', reading: 'しゅもくぞり', romaji: 'shumokuzori', english: 'bell hammer backwards body drop', descriptionJa: 'たすき反りと同じ体勢から自分を先に後ろへ倒し、相手を先に着地させる。', descriptionEn: 'From the same position as a tasukizori, throws themselves backwards so the opponent lands first. Named for the shape of Japanese bell hammers.', category: 'sori' },
  { id: 'sototasukizori', nameJa: '外たすき反り', reading: 'そとたすきぞり', romaji: 'sototasukizori', english: 'outer reverse backwards body drop', descriptionJa: '一方の腕を相手の腕に、もう一方を相手の足に掛け、横・後ろへ倒す。', descriptionEn: 'With one arm around the opponent\'s arm and one around their leg, lifts them and throws them sideways and backwards.', category: 'sori' },
  { id: 'tasukizori', nameJa: 'たすき反り', reading: 'たすきぞり', romaji: 'tasukizori', english: 'reverse backwards body drop', descriptionJa: '相手の腕と足を抱えて肩に担ぎ上げ、後ろへ反り倒す。和装のたすきに由来。', descriptionEn: 'With one arm around the opponent\'s arm and one around the leg, lifts the opponent perpendicular across the shoulders and throws them down.', category: 'sori' },
  { id: 'tsutaezori', nameJa: '伝え反り', reading: 'つたえぞり', romaji: 'tsutaezori', english: 'underarm forward body drop', descriptionJa: '伸ばした相手の腕を背後に回して捻り、自分の背後に倒す珍しい技。', descriptionEn: 'Shifts the extended opponent\'s arm around and twists them behind the attacker\'s back and down to the dohyō. An uncommon move associated primarily with Ura Kazuki.', category: 'sori' },
  { id: 'hatakikomi', nameJa: '叩き込み', reading: 'はたきこみ', romaji: 'hatakikomi', english: 'slap down', descriptionJa: '相手の肩・背中・腕を手で叩き落とし、土俵に伏せさせる。', descriptionEn: 'Slaps down the opponent\'s shoulder, back, or arm and forces them to fall forwards touching the clay.', category: 'tokushu' },
  { id: 'hikiotoshi', nameJa: '引き落とし', reading: 'ひきおとし', romaji: 'hikiotoshi', english: 'hand pull down', descriptionJa: '相手の肩・腕・まわしを引いて前へ崩し、土俵に伏せさせる。', descriptionEn: 'Pulls on the opponent\'s shoulder, arm, or mawashi and forces them to fall forwards touching the clay.', category: 'tokushu' },
  { id: 'hikkake', nameJa: '引っ掛け', reading: 'ひっかけ', romaji: 'hikkake', english: 'arm grabbing force out', descriptionJa: '後退しながら相手の腕を両手で掴み、自分の脇下を通して引き出す。', descriptionEn: 'While moving backwards to the side, the opponent is pulled past the attacker and out of the dohyō by grabbing and pulling their arm with both hands.', category: 'tokushu' },
  { id: 'kimedashi', nameJa: '極め出し', reading: 'きめだし', romaji: 'kimedashi', english: 'arm barring force out', descriptionJa: '相手の両腕と肩を自分の腕で固め、土俵の外へ押し出す。', descriptionEn: 'Immobilizes the opponent\'s arms and shoulders with the attacker\'s arms and forces them out of the dohyō.', category: 'tokushu' },
  { id: 'kimetaoshi', nameJa: '極め倒し', reading: 'きめたおし', romaji: 'kimetaoshi', english: 'arm barring force down', descriptionJa: '相手の両腕と肩を自分の腕で固め、土俵へ倒す。極め出しの倒す版。', descriptionEn: 'Immobilizes the opponent\'s arms and shoulders with the attacker\'s arms and forces them down.', category: 'tokushu' },
  { id: 'okuridashi', nameJa: '送り出し', reading: 'おくりだし', romaji: 'okuridashi', english: 'rear push out', descriptionJa: '相手の背後から押して、土俵の外へ送り出す。', descriptionEn: 'Pushes an off-balance opponent out of the dohyō from behind.', category: 'tokushu' },
  { id: 'okurigake', nameJa: '送り掛け', reading: 'おくりがけ', romaji: 'okurigake', english: 'rear leg trip', descriptionJa: '相手の背後から足首を掛け、前へ崩して倒す。', descriptionEn: 'Trips an opponent\'s ankle up from behind.', category: 'tokushu' },
  { id: 'okurihikiotoshi', nameJa: '送り引き落とし', reading: 'おくりひきおとし', romaji: 'okurihikiotoshi', english: 'rear pull down', descriptionJa: '相手の背後から引き、前へ倒す。引き落としの裏側版。', descriptionEn: 'Pulls an opponent down from behind.', category: 'tokushu' },
  { id: 'okurinage', nameJa: '送り投げ', reading: 'おくりなげ', romaji: 'okurinage', english: 'rear throw down', descriptionJa: '相手の背後から投げ飛ばす。', descriptionEn: 'Throws an opponent from behind.', category: 'tokushu' },
  { id: 'okuritaoshi', nameJa: '送り倒し', reading: 'おくりたおし', romaji: 'okuritaoshi', english: 'rear push down', descriptionJa: '相手の背後から押して、土俵に倒す。', descriptionEn: 'Knocks down an opponent from behind.', category: 'tokushu' },
  { id: 'okuritsuridashi', nameJa: '送り吊り出し', reading: 'おくりつりだし', romaji: 'okuritsuridashi', english: 'rear lift out', descriptionJa: '背後からまわしを持ち上げ、土俵の外へ吊り出す。', descriptionEn: 'Picks up the opponent by the mawashi from behind and throws them out of the dohyō.', category: 'tokushu' },
  { id: 'okuritsuriotoshi', nameJa: '送り吊り落とし', reading: 'おくりつりおとし', romaji: 'okuritsuriotoshi', english: 'rear lifting body slam', descriptionJa: '背後からまわしを持ち上げ、土俵に叩きつける。', descriptionEn: 'Picks up the opponent by the mawashi from behind and slams them onto the dohyō.', category: 'tokushu' },
  { id: 'sokubiotoshi', nameJa: '素首落とし', reading: 'そくびおとし', romaji: 'sokubiotoshi', english: 'head chop down', descriptionJa: '首の後ろ側を押し下げて、相手を土俵に伏せさせる。', descriptionEn: 'Pushes the opponent\'s head down from the back of the neck.', category: 'tokushu' },
  { id: 'tsuridashi', nameJa: '吊り出し', reading: 'つりだし', romaji: 'tsuridashi', english: 'frontal lift out', descriptionJa: '正面からまわしを持ち上げ、土俵の外へ吊り出す。', descriptionEn: 'While wrestlers face each other, one picks up the opponent by the mawashi and delivers them outside of the dohyō.', category: 'tokushu' },
  { id: 'tsuriotoshi', nameJa: '吊り落とし', reading: 'つりおとし', romaji: 'tsuriotoshi', english: 'frontal lifting body slam', descriptionJa: '正面からまわしを持ち上げ、土俵に叩きつける。', descriptionEn: 'While wrestlers face each other, one picks up the opponent by the mawashi and slams them onto the dohyō.', category: 'tokushu' },
  { id: 'ushiromotare', nameJa: '後ろもたれ', reading: 'うしろもたれ', romaji: 'ushiromotare', english: 'backward lean out', descriptionJa: '相手が背後にいる状態で相手を押し出し、土俵の外へ送り出す。', descriptionEn: 'While the opponent is behind the rikishi, they back up and push the opponent out of the dohyō.', category: 'tokushu' },
  { id: 'utchari', nameJa: 'うっちゃり', reading: 'うっちゃり', romaji: 'utchari', english: 'backward pivot throw', descriptionJa: '土俵際で体を後ろへ反らせ、相手の体を捻って土俵の外へ出す大逆転技。', descriptionEn: 'Near the edge of the dohyō, bends backwards and twists the opponent\'s body until they step out.', category: 'tokushu' },
  { id: 'waridashi', nameJa: '割り出し', reading: 'わりだし', romaji: 'waridashi', english: 'upper-arm force out', descriptionJa: '腕を相手の体の上から交差させ、足を相手の足にかけて押し出す。', descriptionEn: 'Pushes one foot of the opponent out of the ring from the side, extending the arm across the opponent\'s body and using the leg to force them off balance.', category: 'tokushu' },
  { id: 'yobimodoshi', nameJa: '呼び戻し', reading: 'よびもどし', romaji: 'yobimodoshi', english: 'pulling body slam', descriptionJa: '相手の「内引き」に反応し、腰を掴んで引き倒す返し技。', descriptionEn: 'Reacts to the opponent\'s reaction to an inside pull, pulling them off by grabbing around the waist before throwing them down.', category: 'tokushu' }
];

export const CATEGORY_ORDER: readonly KimariteCategory[] = [
  'kihon',
  'nage',
  'kake',
  'hineri',
  'sori',
  'tokushu',
];

export const CATEGORY_COUNTS: Readonly<Record<KimariteCategory, number>> = {
  kihon: 7,
  nage: 13,
  kake: 18,
  hineri: 19,
  sori: 6,
  tokushu: 19,
};

export function getKimariteByCategory(): Record<KimariteCategory, Kimarite[]> {
  const grouped: Record<KimariteCategory, Kimarite[]> = {
    kihon: [],
    nage: [],
    kake: [],
    hineri: [],
    sori: [],
    tokushu: [],
  };
  for (const k of KIMARITE_LIST) {
    grouped[k.category].push(k);
  }
  return grouped;
}

export function getKimariteById(id: string): Kimarite | undefined {
  return KIMARITE_LIST.find((k) => k.id === id);
}
