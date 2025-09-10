(()=>{var e={};e.id=496,e.ids=[496],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},1763:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>x,routeModule:()=>u,serverHooks:()=>g,workAsyncStorage:()=>d,workUnitAsyncStorage:()=>l});var s={};t.r(s),t.d(s,{POST:()=>c});var o=t(6559),n=t(8088),i=t(7719),a=t(2190),p=t(7449);async function c(e){try{let{userText:r,context:t}=await e.json(),s=process.env.GOOGLE_GENERATIVE_AI_API_KEY;if(!s)return a.NextResponse.json({error:"API Keyが設定されていません"},{status:500});let o=new p.ij(s).getGenerativeModel({model:"gemini-1.5-flash"}),n=`
以下のユーザーの敬語表現を詳しく採点してください。

【ユーザーの入力】
"${r}"

【文脈・シチュエーション】
${t||"一般的なビジネス・接客シーン"}

以下のJSON形式で回答してください：
{
  "score": 85,
  "category": "謙譲語",
  "isCorrect": true,
  "explanation": "詳しい解説",
  "goodPoints": ["良い点1", "良い点2"],
  "improvements": ["改善点1", "改善点2"],
  "betterExpressions": ["より良い表現1", "より良い表現2"],
  "grammarCheck": "文法的な指摘があれば"
}

採点基準：
- 100点: 完璧な敬語（尊敬語・謙譲語・丁寧語が適切に使われている）
- 80-99点: とても良い敬語（少し改善の余地がある）
- 60-79点: 一般的な敬語レベル（基本はできているが向上が必要）
- 40-59点: 敬語の使い方に問題がある
- 20-39点: 敬語として不適切
- 0-19点: 敬語になっていない

要件：
- scoreは0-100の数値
- categoryは「尊敬語」「謙譲語」「丁寧語」「普通語」「不適切」のいずれか
- isCorrectは敬語として適切かどうかのboolean
- explanationは敬語の種類と評価理由の詳しい説明
- goodPointsは良かった点（配列）
- improvementsは改善点（配列）
- betterExpressionsはより良い表現の提案（配列）
- grammarCheckは文法的な問題があれば指摘（なければ空文字）
`,i=(await o.generateContent(n)).response.text().match(/\{[\s\S]*\}/);if(i){let e=JSON.parse(i[0]);return a.NextResponse.json(e)}throw Error("Invalid response format")}catch(u){console.error("AI keigo scoring error:",u);let{userText:r}=await e.json(),t=r.includes("です")||r.includes("ます")||r.includes("ございます"),s=r.includes("いらっしゃる")||r.includes("なさる")||r.includes("れる")||r.includes("られる"),o=r.includes("申し上げ")||r.includes("させていただ")||r.includes("伺")||r.includes("拝見"),n=30,i="普通語",p=!1;o?(n=85,i="謙譲語",p=!0):s?(n=85,i="尊敬語",p=!0):t&&(n=70,i="丁寧語",p=!0);let c={score:n,category:i,isCorrect:p,explanation:`${i}が使われています。${p?"適切な敬語表現です。":"もう少し丁寧な表現を心がけましょう。"}`,goodPoints:p?[`${i}を適切に使用`]:[],improvements:p?[]:["「です・ます」を使ってより丁寧に"],betterExpressions:[],grammarCheck:""};return a.NextResponse.json(c)}}let u=new o.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/score-keigo/route",pathname:"/api/score-keigo",filename:"route",bundlePath:"app/api/score-keigo/route"},resolvedPagePath:"C:\\00pro\\keigo\\src\\app\\api\\score-keigo\\route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:d,workUnitAsyncStorage:l,serverHooks:g}=u;function x(){return(0,i.patchFetch)({workAsyncStorage:d,workUnitAsyncStorage:l})}},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6487:()=>{},8335:()=>{},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[447,580,449],()=>t(1763));module.exports=s})();