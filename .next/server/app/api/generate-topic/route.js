(()=>{var e={};e.id=837,e.ids=[837],e.modules={629:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>g,routeModule:()=>c,serverHooks:()=>x,workAsyncStorage:()=>l,workUnitAsyncStorage:()=>d});var n={};r.r(n),r.d(n,{POST:()=>u});var a=r(6559),o=r(8088),s=r(7719),i=r(2190),p=r(7449);async function u(e){try{let{existingTopics:t}=await e.json(),r=process.env.GOOGLE_GENERATIVE_AI_API_KEY;if(!r)return i.NextResponse.json({error:"API Keyが設定されていません"},{status:500});let n=new p.ij(r).getGenerativeModel({model:"gemini-1.5-flash"}),a=`
日本語の敬語学習用の新しいトピックを1つ生成してください。

既存のトピック（重複を避けてください）:
${t.join(", ")}

以下のJSON形式で回答してください：
{
  "topic": "○○敬語",
  "question": "具体的なシチュエーションでの敬語の質問",
  "hint": "学習者へのヒント",
  "answer": "最も適切な敬語表現",
  "alternatives": ["他の正解例1", "他の正解例2"],
  "explanation": "敬語の種類と使う理由の詳しい説明",
  "category": "尊敬語/謙譲語/丁寧語"
}

要件：
- 日常生活やビジネスシーンで実際に使える実用的なシチュエーション
- 親しみやすく、面白みのある設定
- 既存のトピックとは異なる新しい視点
- 敬語（尊敬語、謙譲語、丁寧語）の学習に役立つ内容
- answerは実際に使える最も自然な敬語表現
- alternativesは同じ場面で使える他の敬語表現（2つ）
- explanationは敬語の種類、なぜその表現を使うか、相手への敬意を詳しく説明
`,o=(await n.generateContent(a)).response.text().match(/\{[\s\S]*\}/);if(o){let e=JSON.parse(o[0]);return i.NextResponse.json(e)}throw Error("Invalid response format")}catch(r){console.error("AI topic generation error:",r);let e=[{topic:"病院敬語",question:"病院の受付で「診察券をお持ちですか？」を丁寧に言うと？",hint:"お客様（患者様）に対する最上級の敬語を考えてみましょう",answer:"診察券をお持ちでいらっしゃいますでしょうか",alternatives:["診察券はお持ちでございますか","診察券をご持参いただいておりますでしょうか"],explanation:"「お持ちでいらっしゃる」は尊敬語、「でしょうか」で丁寧な疑問形になります",category:"尊敬語"},{topic:"美容院敬語",question:"美容師さんに「もう少し短くしてください」を敬語で言ってみて！",hint:"プロの技術者に対する敬意を込めた表現",answer:"もう少し短くしていただけますでしょうか",alternatives:["もう少し短めにお願いできますでしょうか","もう少し短くお切りいただけますか"],explanation:"「していただく」は謙譲語で、相手への敬意を表現できます",category:"謙譲語"},{topic:"銀行敬語",question:"銀行窓口で「口座を作りたいです」をもっと丁寧に！",hint:"金融機関での正式な手続きの場面",answer:"口座を開設させていただきたいのですが",alternatives:["新規口座の開設をお願いしたいのですが","口座開設の手続きをさせていただけますでしょうか"],explanation:"「開設」という正式な用語と「させていただく」の謙譲語を使用",category:"謙譲語"}],t=e[Math.floor(Math.random()*e.length)];return i.NextResponse.json(t)}}let c=new a.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/generate-topic/route",pathname:"/api/generate-topic",filename:"route",bundlePath:"app/api/generate-topic/route"},resolvedPagePath:"C:\\00pro\\keigo\\src\\app\\api\\generate-topic\\route.ts",nextConfigOutput:"",userland:n}),{workAsyncStorage:l,workUnitAsyncStorage:d,serverHooks:x}=c;function g(){return(0,s.patchFetch)({workAsyncStorage:l,workUnitAsyncStorage:d})}},846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6487:()=>{},8335:()=>{},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[447,580,449],()=>r(629));module.exports=n})();