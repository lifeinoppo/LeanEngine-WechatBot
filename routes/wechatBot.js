var router = require('express').Router();
// 引用 wechat 库，详细请查看 https://github.com/node-webot/wechat
var wechat = require('wechat');

var qiniubucket = require('./qiniubucket.js');

// for extend to support cloud storage of message
var AV = require('leanengine');
var news = AV.Object.extend('news');
var Answer = AV.Object.extend('answers');


// voice reply , the book of answer
var answer_array = 
["W_yMCFcsqaxu3Ft6ASiJD4chSwbzYClOyfVj_JMkAuRkI3VnRImHyusNwd9DKsYP"
,"w8uRSysDA11B3OI2KhnBqIc2eMrKoHrhfbwC3kUZw3-YW4csW-AL9_3iUn8WBy-c"
,"sFN8s2uqNdifGp3cj3nm-xeoJ9iAsNqBRGmGAgNuRFfyDp2ZKTr2s0KfHggGEZ_o"
,"I5PTUjWwVekwe8vbEfgfq-40lQfhAZKKIa6rS64ScLWMj390hzeLi3xwuc0ePvHc"
,"fBDvj8vvGddUcnxWbFN3PGIcHDOTol0VUk0BwTXjLmUFUmbAOwp65OMSCg3v_3ND"
,"QTmlN0RrDlxgoDnYqJmk72fBuzlAp0Hmqe9qorHMJLmYcKtZ22Gnl7PCf_VO9mGr"
,"Z-AtoNy1mv6V4Xp8n8BthcP51lPwcSI_TADLgRF847yhanbcm2LN-36AYa9Wv7dU"
,"-U3bZYOvSO2xLOa7cOWG0pFxdB_Vs_1M3RGJ74oP2233epGPJA7RFYyU_uLnzyP1"
,"SPSca73-AY7e0McQ4RpHNfL_Fst_75JIZh9Dzy9IzRNEWMcoQWxfISUke_hr5xGR"
,"rCo-enOprU94sN55RnJom8lzU_MS9AegKUM8-j2xqtuxcq3rfYJoYAIpz814CvWY"
,"D6q5W0KPt-RaD8TOLJ4iMvtlkLMRNbMgyBQbymeLPZjluXcZw-0A_Klnj-6NYZYq"
,"J68PWw6UAqFm0MHN1N5q8gxUbeCJzSC7PdjA71OMH906fmWhWzI75JWO5gMl_LnC"
,"1mDVe7qvwxqKgat2okvjxQ23P_8_C5LMZjwWXKdKY6BG96p71JoQdA1lQlzG-Vlp"
,"9zFpH-G6wSCl9ohkY9O7tTBew0JIPcd5GzJ4QfJXDQSdusiIrbWZ4NG3y8Ww3gvm"
,"jl13oe9bERooEc1TYQI-g0xy32MqppwDZ1TK3NYy43uSiZB7WY2tefyZwdYg75GL"
,"wpt1OxsB2So44dIOJWugm6ZzFHXg3bhPkWZ3Z_OLeoRpdxSGk11WgQC_sPYAXNHi"
,"16Uz_S9ZWfH-53ZgXw3JquuUZyccghoiVJWqunfESUX9fnnhw6RjOIItNZ9Ds00X"
,"BRy1sGXvlMxuY70DlBVw8aDE0fsDRF_4_uZ08ujCelKRKBeBOfVMdZTj8ULmH7fS"
,"mjh6XutTCjFnXNZO-HRufaUyPH4Dwed6YhCAll6UM2Ygw87LwRCLKc0_sdTiwOzB"
,"xF91sxgj9Ygrqiy0soYrlEv4JJ0470XXoDJUOcuIOds-CtMdp7774edO6t4WGkgE"
,"olGAgNjIBheL_WrKapqQeAzlSjGhhQ3KHoCJr7AypwSXbZ55B2UAsokyE0kj4NwK"
,"GxPB6rICj0LZLFYATYCcdu2fP2nBHoVbnQC-Naq2En9rx07gibTbnXS0spVYSRio"
,"93S5f2KXFwwZtsUpOk5Rx4DUASf1RfMJwtZ-VR1YvU1IeoqUUyMLZmfjIxZM472U"
,"sc45iH_cqRAXgeUjavHdXcrM2RdNBKBs3ciSny-vNHCH4xP2JbHQYTGoiJmUuEEz"
,"TCStM8iS9X23y0Kirpj_1abNfFJkp8Cz6A81k2RlNkxkiD2hHtgYqUGKJWzKD31W"
,"OAyFAQK7E0zzK1CxtY2wA5DNOwafmeNuE-uXCc71QYNQiShLSCZRANUoqLaKD4We"
,"eEa-eW3NCtWUwZiHktX2Vs3GoEnAStqWMaXeMF4fLVWcG6u58Yrm70v1EU4i04Q2"
,"Vg_BqGUAwwETYTmSXJdmSoMzSxIBTkNhWqkACL5FpvLKSGUuk-WYb3eVHr63h4gl"
,"ux_vXhWXTCpC5tZxCASNgwLzseoAZH2qWWlRZ1RcTmZyHLH1WcqihA9h_fofKhBV"
,"bkXkDUrRa2rIjD8QsSJpo-RpI7S1EcZQBZTRfhRXCn3q821fmw1YHPlGfkJBMRjE"
,"tOgXWPly3IMaven6JWWmEPQUZ0odYCoeqB7YfrJxuQBi2ReomELpgVGmAvptbULO"
,"l27N96iEwlDW8IcDCaO26wQQiQt2Yv1Iup0L29MjuNh5ZKOwGP64BMA9xb6HAXbP"
,"K3WlBldbPWQk-Opv2GM_P1MLNf6vVbAGe2auNf8SUL6IiI-5dTqaVRQ_h1ecuHcE"
,"hHUbbC23HF42zSpkSDjlpvXy-3lcFr7Vw7Ds4f1FTZgusQIMVJe8BAc7vt4rVrBj"
,"ziHBGOj0_dv_RAvPKJa_KOdOwKHIJSwHzzeH1YPysRlmayGPCWhPaZ2LOFiJ6G8E"
,"bEA83yezos7Rzpz7r1awbSRe5RRpidCRhTe8cNoEcPZCvvCJ1x90PdF7pVQVfaoF"
,"Yd_ZBeJeX2rJaChH0lP0wLU9zLRr_RiZ4ahUdXygeajzKmMKJDi5MyDSltEW1r7V"
,"zp28RQr0oom-zZRTaTFVUwEZPvSzWHlu9b_Xplde67HxuSBGe8Z_p_Hf53htL_BK"
,"06saI41jjB5dd_9QofyItJhc75VCGQMHiUhO1ClysRScIiavPKRxhNYixR6XNrn4"
,"l2EcyC5nulMfKIFlfPh08qVf64G9dLi9yBrq4xf2yadFc6R8nqp12baxi_8BwXlk"
,"_Vg_10lMkccN7sL5NgdwJSWpTTaNeZ2bWgvH-lL8eMEQTULrVwELJok6wqEnbJhK"
,"XcNcMk3kxPyt2fKN-Ng7tYQ4tKCIOXA2S6ym2FrKeNZXOTB3GJb8E2zFdqWalTNS"
,"CWpHDqXo3spchmuqG_CWeBWUj4XmOe3BBdTzBlJO5E44w_BRs0533iOLg0dTJ7OM"
,"RJN1Nw2wERuQLTjRseeR_Fd_gPGKbeVKeeL_CYNfsY9IpB5FkFvfhVmt5W-tOIYx"
,"FyMkb_EChGVjsJHOgBn1NjnFNyUk3nI8vMr_qe50xk32mgkam9_pJce7BUdAlByP"
,"xZfAD2bUGhQXGfqQfKI6JzYAweRg29MFTMVIOsc-YmB-SYHvY8OaMXaCyRv8a1zk"
,"YSXUUUzNMtM0PdZaA197JWSx8sv0OMGEyhVBitcDNJjfXE3VtxORMo-FaGvkvVM0"
,"q4zfeAxQFLBiIpsqQZiObWMoYiQofRcNh50Uz8CfSwLPrOYfrNLkSrVtykWOzVXz"
,"N6OhRYFVeLA8DyzEecaM6zC_bCBN68VvVtxIft4MU0cjVOfyFA805LUZYLMSkN4B"
,"TCStM8iS9X23y0Kirpj_1W9UbGYtlXeSyXHlJCd22iLInGmVcFErh-_4p9SeqnJ-"
,"_HlcRfeeOeQMDrqeCFqs1zprXSOOECveKAcyeernAsPzoclHnSN7FWUJP--WSnxv"
,"T-OJMWVlP9eiDOZEF5APIgaDPKMWL02FmiNvhPX9n8YwVuO4M_dIu7-h0ptLsLzR"
,"T9Sr8fP0vH-qzrfQ4nbYSnmzcvvu47-JLg2iQCXHFfd8Tsax-7HCugl1phwBHDuY"
,"pzSp2hh0HlQLtSPYriVJthD3hEeKlaMofPVPeZFOOG07b-1nmuAKecb002fdCbLT"
,"26zu6u6g7zYgC0bOnxceBfgRXReY49XjGzjUZbWCCxV0ptrqscFt83ftWJXxBDBn"
,"93S5f2KXFwwZtsUpOk5Rx0vNUQYZwcy-HOcCNjxlwg3gWhAl_chbM0qoBm7AvSUn"
,"aMBk7p4NVOVnGBqRgcNnbvu77gaVCyR0yLmnXrUG42-8560hEkG7oYvALSIJXw-v"
,"KtiVDvDfV91NLKifHmQcZtQI3nIGyNpWV68s7v0oMq3BWRc8qRRDri60kq64kjjj"
,"zpBF6T4whLnVXb04Qda_sVioymKdgghK-84od7F9gTxDZcdqVTV7RJ8sy5RH3nSS"
,"6EnFYPdL4LuV9XS9GaVNW5_P-FKnwO-aZfWnEgtuJYFG4PgLw0xQqRVjgoxnvJ9Q"
,"cMt6yhWLpRICCqaFD6zQxZVzDVmEwjgTj3IobMWTTtAIJq6Svtpr-nWiPIRtAzYk"
,"6NAcQn42Xg3VKDwSB0e2qxIjVAjxdGTtwqJW6WH7u0IMl9NMFYr-yotLcBz2D-im"
,"I5PTUjWwVekwe8vbEfgfqyz5LQLFYBP3xz-shzHvmMJTIZerYnVgd6DbM0G9F_r-"
,"6GVdE26JIeT-VNdQxwdQHFT-65xzZ2QZADvyBm46cAP0RI4qApGa-jPUqPdsmIn-"
,"boi37PUwQermbdFOp6xIiiDgtQH4cssJilAmBrgoIub8m0oS1NY1GMf48a9kuYr6"
,"cSKmNn0SXDW26IrZIs-vvtaKzWG9BbEPKGT7opLiYqKIMdmkmhpNntb1FLLW6AdP"
,"ghXhkhyi1Cos2ziPmBHTKTk8hvhA6AXZUo81vDnJwjeJPeSqPb4Gdlygv7WB4h8C"
,"d4Fk6Iv4j6DeychKdLclNYtd0hh37YFpOKgwbxq3T7U9_S8Ypw7Kb6KmKg0unEI1"
,"nAom47mKfy6FA0s5iDQqR0IyOsdQYaHvEV00roSdvceqveusS9ISJgvb-OZ94YhY"
,"Pot9DhSVNzBj1LQZU4JFFLMxiZWYYRHlZ5j-pxmytKpDxahuMjYhVRYdbxQAhpIe"
,"_RWrGcK3M_4uxbnpk4Pz3wDop6uzxJ5wbPs4FkcgiXrC9eEjjqek5Z9tmIG3rE_3"
,"b-yy8hb7mC3ROhr0HZKv98RjMufGTbBMtM1mEj0jCPIFMuPD8XWAgtY-rYSQ2KZm"
,"EzR7UgaPc0oR9ehtW-xvQxVWgXFPSXfXpi-1XiBDpq1LmjmtVipAPaghSufphOVS"
,"jznAP7q6Lb447e8CmvANDaeFupQTXlLreeg13NYFiu4gFLjk5q8aFV94I9AuLx3q"
,"34aWsNIeHloHt-Fr58KhXT-iGDs6VgGmNRTLMHQI6TRqXnIMJnzA3O9BRa6fcqiH"
,"6idzCKPSDLFR7x_w_XywkU405D9Sne33bt9URGVwXc5q7KTpxw64WCVO1hfTWBv-"
,"rnIxGj_4F9GQx2K4z-Fc8FqnF6Ii3DM1ziDgRhBsXEd_dsZgvY_AmxrIdtp5pWKZ"
,"LUZReEb7cGUR7vo3vVclLl3Vj0Ykfzb7N2_yVAolGUtAdruNqP3S2DhEfIysKj2q"
,"2RrnnPM1921aPLNw3dc2qmHe1LvXD8Xo_aSjYyeW-s27DABxxcs6fhDuYOOi5CN3"
,"QRZy0QtepdhbGQn0NHZXxM976-vaDE0BGqwcBhphlN2h8chLtHS3A2zDFdiuYIYD"
,"SFl7RS8x10ALT8RUrZPMrtKxtleDTEgHz84onnSGvcW7uLXNOyP2PhbNUdgbQ8uH"
,"tYwHcVvFbgeC-q5gcbxwkhPhOJx9DCLZyk6z_nbzytCqs8awKFJJRmm4SR_vW9uH"
,"eXwlO59hKhrcpxLQ-p2-4VPhah4yg3FkG1TuCBXEbnthmzMy6xNTi_I2eVvHS-nM"
,"1CmLXnbJK0LYpnQIDEbxS_fyrh-fv_Mw_N5ZpJqY1XIx8UjMzS8DqmjpzzuT0CTu"
,"9tCrAryorLKTNLiLp7roRNzXvfQmV7ypKuVYR-9xFVkL91Bh3aDQrBQ0YMZsSExH"
,"medDpxDpudEXbvwAXP4EnxG7bkVx-bfSy7XTWU1XCw7Ub2HWU1C2ufqbbWiiRBMg"
,"lxuZdTkDsMrxQrGePIVCFXS6ffxps725wg4-wDRGPpKLy5GGNBFAuQonmqMisyF2"
,"A1nSsRPSiFCDCZyjLZC06yJPdzsmu7TXQbMCsNck4qLGfK4XitjPHqABqQXaGsou"
,"3XPUxFTyalkmk7KihdY5G8uSOsv3zvChaCdZQKAeCrSMADaaK1IGnEE-aEpApORx"
,"qPbHYjEtB49qVGcuJs5rrD0uAS3jkwKbrqSyoWAmhs9c8Eez8VjHS2545YJEA57B"
,"BvbfJ_WLfm7QFcZG6muQKH1rVBDWhhnbN9WqCr3_Qvt720w7XrifkEgW5PJNkqhn"
,"78NvjufOST_z6DcSKVBpkwpthZk1rufPxpZF-qHXbuoG3wacj7Jd6BD89TSgqJx1"
,"QeyQOmLOPA-lZpyerxfN37xyQgZsuL-C_TotvAZ8M4yO6ZRsDe1qiWllFpmL2WNZ"
,"1LH__JV3dLCSaQ2oovKTzudlfmDqodxbDfaMVYV7-HNUpQD_0F2susg8o7uqDY3d"
,"VDwOCEvHM9mfUiSpw3PiQ86OvMBQolezgl3mY2roPJJAQQG3O9RD5JxNtsNlWJ_Z"
,"3da1MS5NX5AtF41mfKNMUUxfRzq6aSp5CQ_eXDBVaCI6rq8N1fjZULbZ9XQ9AscE"
,"SPSca73-AY7e0McQ4RpHNUt40SWRT5YSMItcRh31SfqcdvOMX5lUVHlt-TSISmLK"
,"SZlAqd2i6LYNKvs2XxjIn3zIj-togWWRQnNsPqzaUtnzhwpZNuJREs3VJaTB0ubU"
,"V5Yre6oqiaKhDCLw3t3zrHlGO_wz8S8vVTpk-AoU-fOfc4S7MXt49G4mC0FXwQC4"
,"-nk2qwJJzEHx8vTAfjiLoT9MGRWoFo0ty7Rvi_mD4s4PBH-U5nAKabK7qIid2Xsu"
,"pzSp2hh0HlQLtSPYriVJtm7jc1O8zp7azwEnTPKbQvepOQvw9b2LjS3IpjCZKrdw"
,"Vt0_XPCP8TxvzY4ypHbwsQJ-VeIA7QjggHKaiVQSw2zKGbsAznXtazYocvugyyla"
,"CzHVEJ4SaeLkT2Ciyznzvr2FcHIPAzQOE87Oq86HlbkhT__Zf-KJY968pIMlIKOZ"
,"xZfAD2bUGhQXGfqQfKI6J7Ufn_6vG9HU3PKw3hec7YvbJhc79YQlNxhZLW5k3dSL"
,"X3PwvFpZBXtG7GdvwApL5XDDoaeqlYqaoSxEU_XrmGQxngWJxzvGZbQcYYqBkeqk"
,"CyRn-YwgOfyuy4Jl2JaT9LkwoNFB0ZUoUNJgKdlwy4BArgm26ZBBfBYjQ4p2OKQw"
,"dPC73aGRvScoGGp6mV6qYpyNYuSMtXcf_Q5CuwsBHFZk_guGiVBMvtBpg52OSuz_"
,"XaxTmnkM0aDfnAFwexDShTpz4Mh9eUDx-Wbxh0VVY-qfcE_o3N97X4mz3zP4FKwi"
,"hwniukYHohFo_GturqWMQP9iRoUfO6ZgjATbHakjm777MDQnlrA1JPoFMCKJavsS"
,"W9fUUMgbo43zh_1E-HO61T1jMeznA-TLSn8e2wzrYIiPPwjJsM1tQiupqQki3di0"
,"YSXUUUzNMtM0PdZaA197Jf-ZuU17rj4d0caago2Y8ktEtOBfO8ZzDe1aKB67xUYp"
,"3yORlvjpqWaR1020BfCLv2avrztl-wpoRNTpLBb0dqO19KxMSFSz57fZRWZGe5vC"
,"2gWN2vSrWus2xIZce-oxIW7sk6FAqbtEyHqh-UYL9-6SdP4OImy1nmA76vvCp6x1"
,"kv6wVnA1q4YB8hCdX4lTXv7mYFn0a-7TgXkl7YUxAI-rLDDpzMQLL6TgRJcRlRjT"
,"Eb8SE4I0k4c1yNQqmG9BbWed0V5k0gl5AdIf-BYW9meAtgNJhsaRJkFCIZYdymCn"
,"svo1OnlUxEUcQzRaJNgvKwOB67DxsbtvAUdz002umbEDItOlCzCd9HpWCgQTBAbB"
,"8zTAv484Leio_lFweG8qeZXQ-ukJ_aRXFy2tTwE3VN2gVw9xRl1upgvu6Z6swiBI"
,"typ9tbssowPwTArZ01_ibn3zAuWfiAVHO0x17L7XUAZ25ClS6cBo5PmWIamaXkNK"
,"5LvVIFmbkPvRrU_LqwW0KYncnAicEyn9c4uwzsDsarhVg5miSAk-iZ83rqOHGC-n"
,"hyFucZKTdIp_epIzfiR5IQufI1lXDWvjw0-gJ4IhFlOSy3ss97O0wW7rcrtK_IVN"
,"UC0CmoW3Ims78D74pNJ026PguYW7SXQdaaQDWff1wvoNpWeKpAuwSuJgZRyFQ78e"
,"N6QdPzy8aYv4gmWNdpNGXzvLuqn3hm2lAjIlcrbu4HH7EwNhLkInDH4ACWILMVLh"
,"L4Nt42esiIbKdH-Smou3o76WiIpm2kX7UIqzOP-7Eza-Y3FQ6QzSJi-Xmyq0o6kU"
,"KG6sfzCLFcUVK4VZEKqOQ-GfBmIy_UJNpxCyPSbtv640xAQfq2GTcbxcIlx5bBcx"
,"523C1yFwYPO90RA7WDT_jp3hLX_X5dus3Kvti59nI_xYQDD3Zg3kNRHKxf5XDH_-"
,"iCTLkhHTeah9Or68O8b4VNPtq7uH6L6Ndyx4Lfvuf86IX0WeRrZd06SvyO0cB_Ab"
,"T8H1R-atG45baTbQFFZZouf1PuEKz95wYD0FTuNdMRpECOxt4sfO3dgZCkbrFt_E"
,"Yol33HdYxTlvRAGn3TusgVu7Kfxguz-MSZeZ2AYkRhFKQM5yssCo5TJ6U52gcN6X"
,"YdS5akRKjzGlG9j-wn4BR2vOxgUpFceQ1sbhANkSAZToMfaj1m3lBKh7xaAWeQSb"
,"qxovLnqGPYf7RFXQorEQKcz7t_u82B9NWwZewdcQHJ4QkEnpXuAK8wqTRUvS5z4H"
,"5LvVIFmbkPvRrU_LqwW0KXurGlCEPkp9VkVkoFXw9LNeuHu5xUHyMciM9gqjXug2"
,"pElSs_qZAnTLZZarQUf2MxcYVI8D_NYiXZMA2r-xYCZucMnHL0S3bnUuop1vuhn5"
,"Mms6fEF3pg-IHIzjHPPHRRAFFvbOEwgkdDenzaX9reoTFaLadf7Sx7togMfXGKhb"
,"hO7w6yNuSedh9crEJD690MZiz55ynGZD4YDcILaxkZ75mZGfW3Hje6zjsxCAscGJ"
,"IntNj0KFsC3nREg12O8xc7eZSAtqnRqFLMHl5BQL1uNwZ0EGB1aIGfRxQMGnYT5C"
,"NPOv4Qo7hnZ22GkO2wqDzltK4fzC7mtPCnIY9DBMQ7_5axynNDhndsoxeHiWXTJx"
,"KuCVmx4MLdYiEZlSmE1_udNp4-_m0zCW5HOmIvS86Qb1ZBs40T95wwKklpkfhTaB"
,"OjoXjPO3Ctxoe6dR2lWwJf7n9eLBHDPuh9jLRphWCdPVkHBiXnLFIQbBb0nhi9oL"
,"PAC0Bg00elnv3Wo9kRcPuweaMuJZ9Xg_hrzEnikfTAmpNqng9Kq4LOSVrkJGuE9K"
,"peZUBwsK8bp51OIsnbVS_5rKf7KHtjryP84ya-jpNLvOmFwHikMkM13oe3SdwJVd"
,"2IJQK9M1KyRmKPELp09G5ybTQujTYRPPpsUNiyIjCmnbgUmE00qEbH1L0nw38FD0"
,"V7a5H8oOxvhRzuNkmx9nem6f9JdBb8UoEtpuVul1EbCn-J3Z4ZVyC6_YPz18MgdY"
,"Kgdlvlql9kq50e6v8D-_-KNCa47ZNpycrmWq4nGwKVnFXhQbAFZ5bbqcAXuCngL7"
,"K_pGbYQuvssekXOTC25a_dl6KON50flk9RxPZ24-llFpLGS3UcYHNEXGCXjsNAq8"
,"FZPnRwda93eWvYocV9e3a_wYUzWmeJoKwQgnl4QyQKP0xuV5Q60rosyGat53_01P"
,"fEKnrsQzMyyo_ch9nr7JFrKJY4m3MgwnrUZrGpQjFLJ-F66maXPDb6RwzjZ2d9ai"
,"RCM_LjxGln_cL_yficcuZgazqXtkwqvgopC13Jz-7IHjrxqGYkuLD8qGayAY3TeU"
,"2I-TB4ZHDev06ER2sGq0pvFiIgkFymubSG5J0M6E0Afs5Dj484uxVj7Kuw1N6zSz"
,"q56a2QkNvPSFLtCvYK1FmJnC8tUuTQjS7LHvc_7P-bOrpMHDQA43fOyR-5dWZCRM"
,"A1nSsRPSiFCDCZyjLZC06yZ7ghW0FYNofNgNAILdaV_q49UsB4FrDOALZZ8wscnV"
,"0UzLrP1GbfU1ZbmmXEp6CVy8GbPAt9bthJk2kNFikitXdMFJvX5laYMfxPwcSZsF"
,"sNvXYiFghfNgXm9QJUFMDRei0a1yFtY5ckHsviNO7AmBYB3b9viBM4H2FwBaGAqz"
,"nXJR1jYEq-PUCwI4uSGG7Ln3BScCb3mT5NMXaWy0Rs8GXg8pFlmeWcLEs-zcTRjL"
,"OE_BYNfX_TkwKjin3Li8jcH7xmXQqmBXgSJmLhvh5sW74mbogfvjASit23ELBAfB"
,"WCgoQVrWUQIlfR4fCWS6ihXZe30DBPE6lpvFqVh6Nzig7lnmV-GzFcXH2RKNP520"
,"aVIsteHsGo1nPuYf2xzEjDFq4bUCUA29eCul_8gvAkBCKIcSi40MAAA3yiy2vC-s"
,"Hs1MJ6-1I9pGZ8ntsI0jEgxMo6i1tJe4GYk8Cvnvh71-c2AQlRRmwddl249KkYWP"
,"j83vjq-6Gn04BjrUAjrZU1ljYUEpFsr1tT7Fo__VdJ54vA9U4cwQKx3-e19xE-g_"
,"7DM-I-ItuZM8ZxdODi5okIZ9UhDe1uQTRny_8wBlr5f5ehaqARpMuH-BzyZpOaAV"
,"ghXhkhyi1Cos2ziPmBHTKduBCftZggLjCgvhttG9PPqem25H8q1oQSndvXfX3I7a"
,"_HJm4cLSG32IsY6BUVhT52wScRnaVsbPZNgcj7pefWreQiCXVp7ovjDqiUGPVzb5"
,"i0-_Ppp3Ze0fHpxxnV0-IWzyowZ_dgeeckz2XbCWW7a6lvEgkIOJHhFlIxVizTLY"
,"yeT_dUny_CthfI6FxqGspGpZ0lgTKkQQOXTVPQGtn3VQAbHg7KWPSSGibYn1ZDRK"
,"enCTJIAj5kVNPvJZg83IpTm1zbRtJE_Rci_bcRKh-UvQReTNQI9qOt_0dWwSobnr"
,"jgW7IKtP_K96OIHCVm9FzSz2FcfbW3X4miD7LwkeRgf8_6rO1eMRqg66cN7jz9x2"
,"98AU2759acaZLx2dkYqxCMCZbmPjQd5Anec8EwuKIUIY90iXum21c7CUQRRv2lbh"
,"itAWeFM0HlZPA2sCKFB2KzvrHP_Z5oIW5Ytwk10_LKEU0AsjU0vZaALDFAMdx5SB"
,"pZwDOBDlYkHd8Q0RxRQTgzrOq-gzhZ3cNqmyKQTvpS6eFRwIjPI9KsDjVHjBPbGa"
,"owM6lVJObl-svvN2yoXWWyU3z_cVru3dZhNxwvB_Ut8GOFLgXBFoivDDwt6BXY2G"
,"E05wEJGi_RmVq8vPyBQALRKDfREL408p4OOXX_86PfL_eW82atz4iHi2KkB4StJZ"
,"ziHBGOj0_dv_RAvPKJa_KFm8DKcD-4483SiUlg1xjF40KkGG53uBG8WPHPgdmiEz"
,"V9mEugQNg2cYF3ZoKfe7xXQaRRVn5mJqLcyNYFj0wWkpwHcakwMT4jRuDwzeVSee"
,"9L32yaRhxWjYqMF9y4qi5GqbObrIAFpRcrNPqmtVn9Kqjy5vzjHp3aQkrtnKy135"
,"kkCodu--r8pnkp_eHJ7KEXYoD6EUzMC0yLUw4aAaSTC__lxMkhxinp9kFIm-7jgu"
,"T9Sr8fP0vH-qzrfQ4nbYSpIkhciZbTjaYYSJAaBTjhmk_IWf1ZwTZmwF2awI_pfl"
,"POBE5iS-qFTu5bbODNTnbsESzJfl7FXIiofbIKzHBrzh4fozo1gubiR-IE28t3mA"
,"3eMMNZMuhLn3_uoJa2MtppU0ux-lT_OOu5ecIBAiGnT_AryOg9QfIwHMJwPautYv"
,"l7ClQ1zxzjmdgWvIYfV05VyHpPVI6v-3YOP8jo4lDkXswkM5ZP9VDRp9gnaMgdmx"
,"26iIVx_ix2WaPI2VItTZexJIk_8V0T9Xld6GCghonGthIWR6OguXClht3cnvTEW3"
,"Kgdlvlql9kq50e6v8D-_-OEDQky2u7aIqBp-XWmHAN-JDo7fuV18BoaGcTeXZOUi"
,"A1nSsRPSiFCDCZyjLZC06xDJlAV8tMm0Zm4WjRCaUtqwWCHHjm5nv3k7zCxx0Rsi"
,"94RqG4cHUF_VK_OWYptP9DK6u7oXXOFZ4efxIeSPb56mTEWjmj7ey_aCOZkRgW6R"
,"9Ro2Reyn0ZEHaF2iD3gaof-k6yHiHhtr2B_gOgv6uS5T2o6rNljTkl7x-EQL-yUK"
,"hyFucZKTdIp_epIzfiR5IUjQsdCFpfuDzFIHpZCB3NIwi_Aq5v19VLK_GppupK5y"
,"HTDU0etxCxCsMF7isRMEE6NOHheqeZdeArnFB40saO1yR-N5cyeUcGRHvoE_NphY"
,"tFd8Azp9YkDhO-5Fx7GqRJqmZD8SXYdcYDf4bPc6_UrANKB_Hg2F_wxQvNQJ0wL8"
,"2Yh_lOetWiAcF509Ugl_TbjZ2htbZ5Uo2-G6JLetc9ME6o_6Y5ekD3bn_pBUdkX-"
,"hMSsqbNBs752AJ2Ec_bYO2J800pg5WtNyVSE3JcP_YkffECM3gHb5OLGR6nstWHt"
,"7Cpqy7sXYp_AhL3whDJX8lXWBxfHu1cEZ1Iwn0qxUMo4eapQIk3rXSgod0vnrgXt"
,"94RqG4cHUF_VK_OWYptP9MOJdTmwtdaS1IZ5LnblwSWB8YzLj251kemS9yVJwaAa"
,"dFKUETpBcIy6LKiOzPiiV0suCWwrtNGxh6zIawn30TMDl84JZQg0tOQaDPE77RpW"
,"Ir2w_cIbit7gotMYGBImlzRV8wWw-Cir6hyARJozQ_kr8nbs-zlIhK3i6p2Ft54L"
,"VUXyaV31jj_pCK8rVNErFXVbPSxNY6CJ1Y1LIHFtQbWPSWWJ0DbmHYVHczf0YXYM"
,"tG-2GUKG6HpQfUnjIKIeLGiEntLwKomqxHdyWQQqFbpL7myKa2WGlOJGncRGozjX"
,"RqKw_isFZbyJer02eblb5oK5A1-l7xOkFm5g8QbzaXd5zl8_WRZrKPTWPnTIyvBz"
,"Lkn-VmfGNOuPd20LlvfDJAyrJpoLIVuBr7uaDAZalz_4369Fc_QMMAipoa-F7WzA"
,"NcVBkhUM7jXcmBVWNAj3b7suPOJVyRbCVpgdxXdNilSzkaUZ4Aj8vBrozsRdyV2i"
,"SDj_CfOqEkpVBd7rQc1zCDIYL3Eyfpw3lmRNEvcAqfL6aw3T1UFrypNvUSQZ_qJJ"
,"RE-1n3HlbHS18X9NNalfDCwUBlzS1kvuFcaFax9muT0HqkuhESjD9u3ScP2bC1zC"
,"HIGgpEqG5laImkQyoviPBpuLER6pJ9mf4_RCmW2ZRE1aV601cpUUj984Cjz1bjl7"
,"G5voP95KB6hSSDbF9tzNtTgfHaqRBqI8wjdSIJMCq43RoHpaAZGZpFBsHL1QnFEL"
,"wgPDzA4Ht7okfApYVmjNk3CGVoaKqN7csfwKu1M5Ev-g6wWBWhogy6ZneErv-e7_"
,"Yr3JnjYZMgn8NSXKwoRTIcQpk5mWJuia_ygKKzpqNWCbfOf8NLCF6rJZfCcgeA-_"
,"LxAqyd6g8go0k83luYiNITbXlzOygusZ659MW0uRGBqU6x1SFVLrMeHj30yu_LMI"
,"NPjUtE3oI4GUSWpCDzaxiezRzw71PicYcMyZwfzT8qg5_LpemF614B3mat34Sm_m"
,"je5mut9s89AgT8Z8Xfaurtq9PIATaijKyTaGtrcb9Jm60Ufj75ZPqnD18iOLROvB"
,"25PsaGzWWU1hwbIJYfPqw2NrBtZ74sshgPGYAAn4XwHpewmpI_U9RPmt54EaWPQ2"
,"BTBt4GiPO3B401E0Zn1cK7IQFZbZMtwtTB-8D8szIDPDA4-E0qr3gAC0CsViY5M7"
,"YzefiNQ6ds5sYfpaVTAR6Z7gkSEJ6EANGp4b_yDJJMl1d4wiL2dr9gTqCU8OVfYo"
,"QPVZgZM1tFwIjPAQKgglVz0s8i1UuMFIIIVHE5z_AQ6GX1ZBM79XQuAknZyuLb2p"
,"1mDVe7qvwxqKgat2okvjxSuneM3hMXYBOw7N6axvY_F4LAl9ifUnXOcJFFP8PxYL"
,"w84RTGpOcesAeoR5gj3Khb1bhul-DywzY3Pve6mB0ghLw4kyMGnBLmO0un0ZQhgF"
,"BScDbIWE5qItfE0jE7plHI4rvzL4ql4KWgT6MilMPTs1opktVLklqEz_H76VHg65"
,"TtOoCjUvq41GpjTW1FpP5ODRBYEwVH9XMJGsis9jjMogTkkN703noFkZi-wI5KyG"
,"T49wNhYSnl5eC3ObJtlQ-eih2jsJLVv664ZnrIqyiDF2M-TPNTQceBx03lDU1h9u"
,"5qOFlRjx1PcPbDPEGwFeH_ZSMhZAkOSM252ncFBWWzY8VjhJ8jaJ0SCuDLw-NjjN"
,"QeWucPqufReVd7pGGH7DbQflwz9U0PycXMZ2bg7g5b0NKh5y39QHVXYNjhyhHrss"
,"oMyI5KzjBzLEcskuDt92wjpMSHnmPwgdQRNzXLWhhHCYFAAgKCnb6YIJwJgeosOg"
,"xF91sxgj9Ygrqiy0soYrlO4o4SKYmpxw9P2fJ2NtTF03_UMrhxQqhuL_vc8NU7M3"
,"HVGYuGew3QfkKa9fVckCwFEyKA1L6I-XpsIhl-GYq6eT0OuJOHECMWk53uHgSIVQ"
,"qEjMhmw8GCv8oSoNlmAhI77ImMUP_b5-tRQtjH-XBgZOYOtAUN8mUmFa6ALpbLDL"
,"q3NnFGJjH56gtKGcnj38fHRcGHWy6L9-usFs1z3R-z5gfxSlZwttaJI1YU0b4Fyz"
,"94RqG4cHUF_VK_OWYptP9Jg1VogBzNM6gGh-zB7r1GNt4e1RabFDmMvHXqiJKrJd"
,"MAHfV_xRG2g-KvTq7vvgg8v9wCTnuaOsCc5xKHuAdMWQ-0cp7pXKtOkZJsoIYtjp"
,"4AjEvM9iQ_Y4xVDYM3oOWw-W_yiBXF0Y53Nvo20tUh5ibopK9JoQ4YkkZCPeIRT3"
,"2RJ204Z_qbE2CHajPZ9mtCChrdp4YiJQlLCpkp5AJF94mtlao_KX5_HfoK_kJsAH"
,"xLbPo0Qu761dOGOzFtVF6_9mfN4GnwdK70HUgviPlx4yuSYMkmvX36DsgB8BnOie"
,"2RrnnPM1921aPLNw3dc2qgCeqBiuT1dfOBdxFDszpyg05VlGByV_g6woW09VTxv0"
,"Oszi_u_-P2eVsjHL7jDodeRyeHOljw0Us8PwQFE650mNbjdrdVnkH3ubjlDq8_4e"
,"jR9seYlkqSUhdOrxjJuO6LNIsUsNKglK3zRmjG1KJrMRDt-HFwQZFkpfQF8wajeq"
,"3w78ljZfEdaXKITjV6i0HE1k2DeMDeDYG639dKA1po8Bme7Fcc0dgLyAc9no9Ex6"
,"qcr0Oqo2zS8HUcPLm5vRyPfUGi9EnvyAC0VdSE6LhPPbSo0URBHHgDIbMhJbrka0"
,"RqKw_isFZbyJer02eblb5jGx7jxGha_35f8Yhmvb28BSkB8aw3Fi_JKJPXhcMxFb"
,"EQ_O4u2uBdVGiryMecmYq3RGC6n6F1YyfQ8N1P9kFuCBvWtt_JO6-xQfJVlO5m_L"
,"dOwGegwnuGNziPjFcR2iS4y7WNUV_fTn4MPKcAjgOjRwtyOK5hKRHsykHevu9wrB"
,"p8Q1TCle9IoXkZwriG-6tMFek5xNXhbQ5Jo9_Ojcbvx1JOJ4nXG2sIJpzxd87j7z"
,"J6-inwKDoyQP02NEHIRhabKyAjVfRoS0yfrDlJKqUxBL1dbJXO1Mfm6N6e118Jk-"
,"E4MHok5Kb2S5LNIS_oSAiG7Vh4zCJVkiOQJ85ld1tClpsp3SWUQm3Pak1cgnDWWp"
,"LmfObq6n63gKGjVjg4GT8CmwMM6upYXI_l6Z2h2Jmu-TgHBvyVc5SugOeQu05jY7"
,"Egf0NO_jVOSgEFxAFVa5rqLXHq9Y6ROKK8r_wA0hwz8YLv8NkEk34EVoT2gClRQ3"
,"bvb14eUwDP9md3LnwKowkd0Ui0iFbUPBRsBboKkoOK91JXhRmtFzG4V3-niCRJeV"
,"5OTDQKNoICwNV7leVCMEzAShKAKEKEd4wjUZj2bEBgOPjbF2HGgMoVEITZbCHtKw"
,"uJNQdrVf2SCQnh-8a450cE2xt9vn2YGFbDt9AX_f7XfB3O6_K42GIqBMIAwxjvPF"
,"n4QLtzrhPsL5Ded50EZ-S6IiDrcwE3pyCqTahbks8n9mdae11tzn_-gvESrJ0kjq"
,"l5qqNc68jXwdv4VP7jU2vwNcv147JseqLLOyergpVb2goj_XckLVTPfXvojYgcpP"
,"s35idW7XXutDkZasFIk9P90zY6ouMgi9ssDH-TcQiHcxJlEAxXFCaPq8JuOtG7AR"
,"TLsf3a-cFf-36lGXZEHJu5j_08sWxs3KK-PSMRno0oZul7wF5mHQVkbfkGTKZpbt"
,"-pIpK2jmVjiAGZZx5uPb93cUxrALcWWbgE1BXGbbcppN3VMzWATru9FE7-UVPNoP"
,"rPjzrlB0cz3mj5JiAKfk8g2XyrevNOaxzh6nTpY518i8dzTD2BclW-3gABnWmCA4"
,"cMt6yhWLpRICCqaFD6zQxSa4iUGA_n2k69LJot8OzMRxOYBXi0MKHDjG7QOcQgBU"
,"vKJUEVIFkwLwbX116xMARjXogrQK1SyK_O1FJ0XyTIyluppiGFlGmp9ZG2LIfVtp"
,"J1M6Pr1UudS1lwHTksdJ-QbTV2lKKo_saBI6DR5HB0gmRRnqBOTbgO2dRe1MAc06"
,"aVIsteHsGo1nPuYf2xzEjIq8aCgCIDi6LiuIHGQOSKpEEfy9w-IUxjLSm9T6Pqrx"
,"w84RTGpOcesAeoR5gj3KhRj8SmKQjRXtUSP71EAxnx3TDxlNfXovxVdbI1CNJhig"
,"5euNUd6i5ZMkZdpoFTxvXSo9iuD24cjk2NWUyQvskh0kE7G-10RGTHvxPJsDFBuO"
,"WCgoQVrWUQIlfR4fCWS6iu4KeosrRLvelkS5QAVKpaSu7cGc9XuxjggibncPxEWV"
,"sVg4EjZx_TOk4up3V2jnCGPZ5_N-aOFNGMhK1KnDuKKYrz03XkIXjNLFOq9r7gjG"
,"2I-TB4ZHDev06ER2sGq0prm1qtGhjaCp-tF-WoPGGCGAR32XeDNI80hWoTq0wNg7"
,"TtOoCjUvq41GpjTW1FpP5L5rvZ_edfG8V6xP2cbaDtjPdY8EKnATuuTCX9NbhX75"
,"pZwDOBDlYkHd8Q0RxRQTg38zeNLkyAPogVPbRKw7YJMUCg8ms-z8LZs1UqNh6ymU"
,"Hb2KLSN8p8kmdspcSQcPY6g-QQAtly1ZeKOVvtDON3E1Ep6E6D6Rf5KVgwcZmDMe"
,"MTWRWePCXVehZgcWmu7OvCppsUAo-a9ItF7KgrBMmzpdzpxhMWvOXW8QhM_9uWW0"
,"Nzj3ypVd6NW0omOm5z1a5xCv7PDC1_Dy2hhFfZzmk4fpFbiJXgTbXmSp4hifkfbt"
,"oiUdxZ0VOGQVcBKMYvE2LXKDT62lOBmK56wi3mZeZ9yPPM6uQ7DW_EtmeI0vCovh"
,"POBE5iS-qFTu5bbODNTnbpB9ef6NvM2toXq5WlsoymZwaaAwB3yg2TVCI3UIDtBx"
,"GksngQ25cpG0N5Hnvqtu6TidfAE0s7gPrj2_D8_V0oXcqOnw86-Jh7frPxxbxzah"
,"3da1MS5NX5AtF41mfKNMUQbBGG4ob0xfjZdUCwOIz9tFmHhOQHKWtfDKvGdy-zK2"
,"T8H1R-atG45baTbQFFZZon04NQDGKOHKdnd5ZD3bp4NgiVGY0orPLpEYzbxAB3m7"
,"pElSs_qZAnTLZZarQUf2M9y9dLCP23FmVKkenBKQyVKXauptI3pGxb9osZ9eKuQl"
,"Kgdlvlql9kq50e6v8D-_-Ox5P5iuc83xAdhYCudj3BNVsFX5s6e83hVvXcG7hbjE"
,"8G2oR0F_OchqeOo93nTOvqi0pxBAdHsXlEJnfAqQ2ZL5WiYIY9jcI9t9vuGDBWsM"
,"gkk4mlM1B9dNDITjOsutmL2V1FrfZaBJdd7gDmXVTRDdEW9AHP9kiipuPflURXJt"
,"Nw6PZx5TbbiKp--maD2sOszIuySNmgSCqKnFuPoXVG0bEbGGY2QL-lSPb2G8wm-x"
,"msGEdnTu1iGIrUikyPazl0ih0CbcteI9H0vyhzQjElHg3VMDpBtUQ2dnBwSZ9ysm"
,"xMvzEJ3zdi6e1FVfOFLkx8oFsGtChE5bXdAeIQoyYO_nnpyTy_3FGyLu3UaB0Rjt"
,"0sSqLx-DgRk2TFgvuP5nFhhJtdOpa0wTNzJ41itk3lUETazCkdTTBthIfmY7IdyO"
,"7PKR0kLd6wE2K6-4cIAwXy-wPHiaIXP605628YTyJUhw4fZXV8rpVzl7ASfjyPGo"
,"OC4Qw_OtJUCj87e_JDG-sBw0lhkXoMa-udFhA0IkXENw8D_3UiQYVWKf2XzMyCWi"
,"kMNfLvGjgPWxH7YjLzl46m0qsrUHkH0_m-6EyMGHivZMOgrtqzNE433b136fkDOe"
,"3da1MS5NX5AtF41mfKNMUak8xFmU8yaWzAxunrfc5qcuD0UIyfO5qhEgnfkN6mU1"
,"BTBt4GiPO3B401E0Zn1cKxcafu-sWgWN09B_teIW-pHFFEbpJhDxYzVvIy_e1X4f"
,"pXvPs4ugGUHIJNCrlpFgARFPlWTSdDyiJ8Ols6Y70Am-_sbiOJZifT1mdZv5rPxw"
,"25PsaGzWWU1hwbIJYfPqwzi90pf3FxDBeH6LDlQomOVH_MeCOYWk1qIxJxmYopFW"
,"VZ4IBjxza1_-2O97QRUcKGzh87zk9dTzRNgXN4bqhf9KfxoNRxhI2qh2y03aTpFG"
,"YrcbxQO3j12_vlxIWuCS7zv6ShuAPHuAWq9OvG7fVZL64Q8TNTooq2TwuVT14vwu"
,"JKOG-ROWUZeSEsQjBCY3pxAl2kKKX7fyJJ89x3Ccz_6yavBG53f0iJyWMmqdBhMa"
,"vJZZrkHJvAOlhB-kQlC2IcXD4vcAJyYNIfgcofl6gIXrt5Owykn-ENTawWUpeZsE"
,"N6QdPzy8aYv4gmWNdpNGX3OauiKvs8i9vpdWQqyom0EJsIgk1iXK3E9qpsbRjZJ3"
,"jni1wysW2jQxzzFcOm13VEQyOYIGtGRlKlAhd4Led7ZYQttb4zvVLTbKBTPm6iV6"
,"hPnq4wXRimrECP7VASXIfeIw_Aqj-leEgBUK7SMGbaAUvqoIdSnVVd_xtC8YSC9E"
,"J6-inwKDoyQP02NEHIRhaYjL6aEPH5Y_imn4FkWTwTdwRE2GhQeTZo-QW6lt96ZE"
,"hslhl-v3yG9o0jPP_RX5NVQNbWOw4Fsz_Ml2-A1jYw2Je_ttgE-e5HNQxxn_OVP4"
,"ZljqPxAZ0v1D32BV6-h1it17rbGzT55K_WxBnnivARKCAaDxsEjidTV-RnsTPhwr"
,"wgPDzA4Ht7okfApYVmjNk99SZbaghG0oL3DIlt_U14DxzPUxlPyOoYQ-O3nIbZTz"
,"n9XlXIVrhfAsOHyhIiBCb_k2FdUtelzIkUCKM0Rwh3x_ooHOlEN7heZqa3M6dJWq"
,"YpdafDEtmmZ6NjPoukbZqSmwbv0_5gzNFir9XUhmGqEsSN-eQX7zQ404RQDR-clP"
,"khjqC3of20igoaoAQ67YEJi77tuBmwEexJ7TD4Ll9bZv8YEcHCjpoyneVX0VznXE"
,"yhy58wPz-peZf7wekxVVDM1N7tTB3QzZURkYdwJa9Cm8udx3ZgBViVYfXVke3Jrq"
,"h58L7y38BYqphMEyLuoytqXE_EvpnzdFXTyAmGFaf7e08xI44hAMEUCpX-QbdTvr"
,"kceIn_k8HSjLwZ3Xp7eOMaAPxaFnZMD1BHEhcv3DqmdylcxpyLNsCYbZE54GQKE-"
,"nDBeIzyIDbEL5_XTpMFE7J-nvM4NBmgJlHfnqQyIrwdo3Rq3GQdvS9HZkqgrDgOs"
,"CzHVEJ4SaeLkT2CiyznzvmcCWw2T-o53fpYN_ZgyQRmHhASuqWsuIFEKTdHTUTk3"
,"tbEJ03D0sxlCBPloNZSRGo4CNko2tO0w1BvB-LAZOLggyoNvmt9Med4rqraYJCVa"
,"dge3qFbipYSqocHZqfey3ulP0MDe3zRQRQe9p9LEwmjaOXvb5fZJyM6cnC2O593V"
,"OW2DOX8yBDnFbQTjNvBeqpkyvkQBqz8kJ1kd4jDF8aMm6du8G8fXgXLS9tlVKIbE"
,"dwC6jK0zXOqJSSBjgpzA10smcxVYIskb4WsVe2y20Qmyqx9CyQVBFC0AINfagzZx"
,"2RJ204Z_qbE2CHajPZ9mtHIkkH89upkfOrRF3WVPzJfsvWiNwyheYz__AdkoAjml"
,"DxA_HNchwPBhn5Jzso1wFMukZw-la5dCbpaOHnKyZvk3njrGD40_Z-7m4SVKwtFn"
,"ANbFSLic-YxSTetb6GoO6YqPdlRNHdRZk6G9JTUP5qOM_PTji5xpckaj6sQTHB7Z"
,"WrM3OQQvciQ8x59UemwtF7Enxx5cOo8KT3NjFe1EsIwgpW7v0k8NdwJcOr-WXPEt"
,"POBE5iS-qFTu5bbODNTnbq3PZQGY77fXNYcuX3KWSekrNgWpxEiuNrtLU0XGOHM8"
,"QECsV6jhLexXVnY8LfjNCfXM7GU9oSzZMaXJbzb0wU3Yl2o6KJu9kIfnQFiX5Z5u"
,"GksngQ25cpG0N5Hnvqtu6bmpxUNTSywQJUaAJLJ63EDjeRKDs_rmvwQ0QilM5EYy"
,"LKKONTUt1TrAt-F_T53vfBYu_QC5PVr5D1fBJxIhi7D40eoooad6vx23Q_99ed0i"
,"dwC6jK0zXOqJSSBjgpzA1_WJpzYP5LNkoFbCuIJNODUKLwI1Pq_JpzNcWFmRnEtY"
,"TtOoCjUvq41GpjTW1FpP5CTjM4YXnRRXfd2LserkZVrwCkcJbMGpOEZE5Ry5IGhx"
,"YR_cU5eGtgObIOZ6L1AkIdHjOaoev3yPSVk_4ZNhBXW034qJ8brUQjb9vwtV8l0x"
,"GxPB6rICj0LZLFYATYCcdnyQChEhxSxQpVOQvrfDf3bSWIyr2nmeRFDErPfWh_l2"
,"Yop6iTNptjJIi5oA1BMcbFxg-c8KYuFhfut4IN6gWg3RvF4nplddnhcKu1wjb4Al"
,"hpUDUp9e9tkPPjr2QjuU-XmrEOsbLxElRd2JA8xd8b92KMLuIGSsGFT0pf_IhTvO"
,"V9mEugQNg2cYF3ZoKfe7xYrwr3PGqLmDp54WGHssZISGxCaZJ0JzKbcoGzMHOiYO"
,"Gw8a9cpXA-w9unIuk3C-0azEu3gaprP6purYycshWUhq4cGcSc5CPZWnKT5SaN_C"
,"LUZReEb7cGUR7vo3vVclLsaFmXNcPF7Q7VjrRlcf5NyBWm9JTFu9PPbb7_lLqbxf"
,"1CmLXnbJK0LYpnQIDEbxS6IZinJaWaU0u6rCs6sMl3g40jwAeJgP52FSA8t3JxYI"
,"Nw6PZx5TbbiKp--maD2sOs5xXOad_jPfBB23--FNfTQHGC1Jhn3HiFoCAccTHStl"
,"JYNUtGgSxWK4ScZm58ZzlKLo2ave4mjPUqDuhZCzDA8oIKLFhhzRTkIWXS7h62zI"
,"rPjzrlB0cz3mj5JiAKfk8hQoWdzQOokjamlS5_8KsvPjUlD2ivMBdOvBTGpfT_Ei"
,"98AU2759acaZLx2dkYqxCJHDDvPiU4ymq8O80IbqsTWQBA-8o-i2PoMSJwiThIWm"
,"J1M6Pr1UudS1lwHTksdJ-UZ3CLYiyVd6u2w6H_Tm_eLzjuAcvV2QjjIEezs0LfFd"
,"N6OhRYFVeLA8DyzEecaM63-yG5TcL0X4hEU8pDCsF88LrOJ47_tNIXd6V7UshM8D"
,"A1nSsRPSiFCDCZyjLZC067Q9I50oXkS7v62w-Vo_DUAZygARcV9rWsZ_jMtQ-dim"
,"POBE5iS-qFTu5bbODNTnbisSRTwwxsxsdRmQJf-GGyh0IhxdzFU66Ib-NTY3teRV"
,"w8uRSysDA11B3OI2KhnBqFLzE7711HjNeYpCygv3aNeT8GqvhOjdEQNB_qQt8f1O"
,"tbEJ03D0sxlCBPloNZSRGhqmdKd0d3NEAtHbW4H57Lo-A4ROuMp1q6yejS75qxOv"
,"TtOoCjUvq41GpjTW1FpP5OTwIioagBTBBT_cBtPbGu9cU-19TLN8q0zs23uRPQ5L"
,"Pk1zDlMSnfGjsaJJ6oNPwW7L_WhkF4eRIMjrV_ZnQZhrzKYzN2wggAavBO58HOkQ"
,"NiDBcr2AYRFPH6YnYEcosQuRJZy_jUe-M0_7AGh9aBtGT102xgafpX1onexAj280"
,"Mms6fEF3pg-IHIzjHPPHReWnCi_CI_sKgKGuTdKhJErtB93lU8FI0rqdirSEjS4N"
,"1LH__JV3dLCSaQ2oovKTzmRxLbUqboX8WZ5FV5igTIRRvrBwRcN_SAGjjyrDmYtl"
,"9Mj02w5bnMt5aY4t_nsPrhC12l7kRBhCA2CsQLxkjKUjDjo0vEPA06_9dZ-rOV9X"
,"E05wEJGi_RmVq8vPyBQALb3OmKKfQw5RsLMKI5O0iLRHMOgJ_kAJfvmL__azbVLU"
,"1CmLXnbJK0LYpnQIDEbxS8-FJ-fuOofnE3wK-6OyWOTExmt_maZg7tLIq9ta_QUf"
,"y-_rgFO8NCqFmX8G7VZZAwN56Ar7oNyy5XuxsgiSyPx-XXVzcYLkgPN_h81Rud1c"
,"C5OB3kOSWp0eome2uMPHDYBqQZcsjfc6cX9_azO8Z1on9dCfUZgxYG0v3brMxyaX"
,"krLDz1tG8d_xeqhCs6ARgNyn9_ZRGwdIJ1ss8MHzlCsYuplYv19pZho_WTInLsi4"
,"2Yh_lOetWiAcF509Ugl_TXak7Kd5pptOCrsLQ8eCTL7b83udB-DLVBKbxDvzWPrT"
,"pXvPs4ugGUHIJNCrlpFgAc5oaQ1e1C7rEa445A9Y1DtLZ4W_tyl90Na7KKUfmGS6"
,"qcr0Oqo2zS8HUcPLm5vRyKlIaE0cfXApSasURA7lkWAtCwN7Br0bIELUki-Bv0b7"
,"430fKqMfqtkhpABk-2gcSCcM2lvNavnyfDS0TS-X-y7lODCyfrabxX6oJm_Zr0oj"
,"tVa1cz77HZAHYG5u8Jh3INcDj9xFZgilc-phbQmAg6FZL526sMHyvIkhT-pTTA2F"
,"diqDa0XfBnpnYcS_UbIIuTe_6TcE_rNwqz9RWgNT9dkqvmxvaPTTdbfITTy6PceW"
,"kecwnNNGNZKLs67hSUHppxg1tCrJtdhp7_rVfCSXHKtpF1MrRSzWw8jJsjjHbvl4"
,"p38Y2LRM8OsE2OkFiQo_3Rl2mnt-IFtttZPrXsishYRwCpDgjWZ3mR_Zf7kjY0UB"
,"itAWeFM0HlZPA2sCKFB2KxfEAhOSq_pFODwMLcNp36oMdloVueh4DZiOQW8tM30A"
,"vJh2IDFqMSvG1r1WcTnJTg-XEhxc4dqMSTLUF-ecrrLV5P_yd0gkXpHcI9BCYhZj"
,"5ZEjIvf__jWkaGJhCQNWZ5DjPiPwQSPszY0SYXm7_a8BDrnB5zd6_fwyuOS6dHQu"
,"tzx9Zy915a0YN_GeaHFoHuZEjOWWKXetsNklPslhcsiOMEXxRfduLXBhM5rX5mYu"
,"MNVl9qtU480zxGEVQ-escV2gRQFmZ7f8ZEDBR4Uq_NPR1Q5hegRWx8U_RMb7FYAL"
,"Mms6fEF3pg-IHIzjHPPHRSmCT2LCgQ40MDLRohSa2soKs1SCw9wB5Iew5K7U1T8c"
,"OT4wDp1kGh4Q3aLr6pY0d1A9Pl3EOCbEiMwVxDRex5Jh59kbGJsttoW_gs1GvVDB"
,"DgK-8lHlEh8uDTKTyJaj6QB67uLS3zbyRVzZZEZ8VcLn7NGX1tI02P06NXboJXK5"
,"le3tHZu3ST3juneCtfpKU6D1_TWlB2X6gLkyFJjLW1ucDtA3Xygn-JZOCGCWA1K-"
,"9L32yaRhxWjYqMF9y4qi5Pa6Mm_bHqvwD5qjg44xiquNnvEumcC0hMXIc9uWHWXe"
,"93S5f2KXFwwZtsUpOk5Rx9tX7NoH5bfksZiwMkgBqa3hoSHb_avrpYh9qyOT_Hu3"
,"sNvXYiFghfNgXm9QJUFMDXtveWZnTrfUy_4JTeT1TZWSYYoc5Ka3MVGtXrQn_SaF"
,"FZPnRwda93eWvYocV9e3a3uhTALPKiSF03wcGmt0_HT3U6ymfmejsBx_H1tLo3QT"
,"98AU2759acaZLx2dkYqxCNNQaaueRoIZsQNyQ3KNHWWLJbJRr4QJxOLm_i4wYzQt"
,"9Mj02w5bnMt5aY4t_nsPrlG3gjmvrfEkacw442aMZZWPZcEUZh6myIiJq8eHYl3m"
,"qsHkt3Q7rhBwKe_fMzEUY3GvBFG4qGGTA-QaZgbNXPFIzWqhg3d-0jr0uC_LdHyi"
,"T8H1R-atG45baTbQFFZZooV5h5aRoEcyVXxlENJB1SZ4d-O0KjRfRJE77FRbHEh_"
,"yIArF4mRPJbmfGptj9pRUQfk6voTFrQCF_P_9fS2nlD1zbxDIHzUvqYHCjEEQ0sa"
,"uXtrVGBGM4m2jZxeAIKm5aIGBu6l3JpUnlX2T5kjFLINZBGSChPzfgJdEwtDZ8BK"
,"PbnlprgFOd4BD9_pfGEAZmwHPR5RJ4I1U42_8tT12mWFM9YgYaMd_TbrBuAgJDVU"
,"juZkHKHN3whjpvYPAZhmpu6HlK5qldhRPPp5J2P75dBh4gd2xF6Gip_aQPMIqF-9"
,"LmfObq6n63gKGjVjg4GT8Pm_1P1yBLIZXmCcHdIszhO1xEElPPrX89hYQ6H_W7xO"
,"G5voP95KB6hSSDbF9tzNtXklNG0gIRUOVqIZpR7RcBhzVqY3QxTNCI7lyVqLSYDx"
,"V7a5H8oOxvhRzuNkmx9nehxNO52cgqrEMoT2L_u9LA3fNNp5nEYLmBhgB6z49nGB"
,"wlSe6M31wmac1XrOFN6xFnTks7LNRrSrn0xM0uH9ToMb1oyqF3gu8yx9ninevetS"
,"4L6-iMpYQrIOaEsx6p3CuJ0X_1Cj_zSSKArHvG29ht5boBK9ADkx1ugxU420AzK_"
,"vKJUEVIFkwLwbX116xMARjsU-oD5i-KQPpTX0KIQr2k121NYlLycMD0PykI8IBfD"
,"LUZReEb7cGUR7vo3vVclLoe5IkCuAwvgYSR-B-KdGA06jViQBeLVXp1KhAONoQhQ"
,"6GVdE26JIeT-VNdQxwdQHFtOEmNOaAwhUPeOh9OQhvRUuiZCJPSSCoAS9BKVnmNY"
,"h58L7y38BYqphMEyLuoytud_Eqk9FszZEiv0mKbqIc399cee-GUdR0Kl8GycJS3t"
,"9CA6ZHtq1i6BPTXC0iD_oNqDDJ_Msewt-SHKq4PkmY19O2KNcyboMWxv64sxq_Zk"
,"dAwFQ37YgtVrKoJt0M5fG920gTlq0AnumoZM1cUOHpGRTqBQf6xsAzef9m5llM1R"
,"6F3w5rjFxZZxctI8ThWdaZDzuNzbKEYO9Z7VuSQxBMyMSQdWK_dQdM5XRIMxPLbz"
,"06saI41jjB5dd_9QofyItMqa-0WDnCjfTzggBBJdfcQiSpskPlFSLbePbh6ZCGCH"
,"yeT_dUny_CthfI6FxqGspKe5XkQO8EdLbe5C6y81Ohkj99WGnfpn6xXneeYcJ7eb"
,"bUv3Sp8XkMIGDVDVBRc4WSdCzpNpN5wTIPEgu6pYHr0pDrBO3ua77w9ckKuHrkT8"
,"5qOFlRjx1PcPbDPEGwFeH_ZSMhZAkOSM252ncFBWWzY8VjhJ8jaJ0SCuDLw-NjjN"
,"QeWucPqufReVd7pGGH7DbQflwz9U0PycXMZ2bg7g5b0NKh5y39QHVXYNjhyhHrss"];


var config = {
  token: process.env.token,
  appid: process.env.AppID,
  encodingAESKey: process.env.encodingAESKey,
  qingid : process.env.qingid,
  qingsecret : process.env.qingsecret,
  baiduak : process.env.baidu_ak,
  baidusk : process.env.baidu_sk
};

var WechatAPI = require('wechat-api');
var api = new WechatAPI(process.env.AppID,
  process.env.secretKey);

var ocr = require('baidu-ocr-api-another').create(config.baiduak,config.baidusk);

router.use('/', wechat(config.token).image(function(message, req, res, next) {
  // message为图片内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359124971',
  // MsgType: 'image',
  // PicUrl: 'http://mmsns.qpic.cn/mmsns/bfc815ygvIWcaaZlEXJV7NzhmA3Y2fc4eBOxLjpPI60Q1Q6ibYicwg/0',
  // MediaId: 'media_id',
  // MsgId: '5837397301622104395' }}).voice(function(message, req, res, next) {
  // TODO
      
  ocr.scan({
    url:message.PicUrl, // 支持本地路径
    type:'text',
  }).then(function (result) {

    var anew = new news();
    anew.set('content', result['results']['words']);
    anew.save();
   
   res.reply({
        type: "text",
        content: result['results']['words']
    });


  }).catch(function (err) {
    console.log('err', err);
  })    
  



}).text(function(message, req, res, next) {
  // message为文本内容
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125035',
  // MsgType: 'text',
  // Content: 'http',
  // MsgId: '5837397576500011341' }
  var keyArray = ['你好', '约吗','泼辣','七头牛'];
  var content = message.Content;
  var keyIndex = keyArray.indexOf(content);
  switch (keyIndex) {
    case 0:
      {
        res.reply({
          type: "text",
          content: '您好，大家好才是真的好！'
        });

      }
      break;
    case 1:
      {
        res.reply({
          type: "text",
          content: '不约，不约，叔叔我们不约！'
        });

      }
      break;
    case 2:
      {
        // for pic uploading test

          var ndwejdj = 0;
      }
      break;
    case 3:
      {
        // for pic uploading test

          
          var filePath = 'http://ppe.oss-cn-shenzhen.aliyuncs.com/collections/36/4/thumb.jpg';
          var bucket = 'from-wechat';
          var key = 'test_file1.jpg';
          var token = qiniubucket.uptoken(bucket,key);
          qiniubucket.uploadFile(token,key,filePath);
          

      }
      break;
    default:
      res.reply([
        {title:'Bilibili',  description:'Bilibili', picurl:'http://i1.hdslb.com/promote/d088cfcb7689f8c5d23cb88caca0c73b.jpg', url : 'http://search.bilibili.com/all?keyword='+content },
        {title:'SouGou',  description:'SouGou', picurl:'https://www.sogou.com/images/logo/new/search400x150.png', url : 'http://weixin.sogou.com/weixin?type=2&query='+content+'&ie=utf8&_sug_=n' },
        {title:'github',  description:'github', picurl:'https://assets-cdn.github.com/images/modules/about/about-header.jpg', url :  'https://github.com/search?utf8=✓&q='+content },
        {title:'BiYing',  description:'BiYing', picurl:'http://cn.bing.com/sa/simg/sw_mg_l_4e_ly_cn.png', url : 'http://cn.bing.com/search?q='+content },
        {title:'ximalaya',  description:'ximalaya', picurl:'http://s1.xmcdn.com/lib/open_static/1.0.0/css/img/common/inside-Logo-grey.png', url : 'http://www.ximalaya.com/search/'+content },
        {title:'ZHIHU',  description:'zhihu', picurl:'http://static.zhihu.com/static/revved/img/index/logo.6837e927.png', url : 'http://zhihu.sogou.com/zhihu?ie=utf8&p=73351201&query='+content },
        {title:'1haodian',  description:'1haodian', picurl:'http://d7.yihaodianimg.com/N07/M07/AE/F3/CgQIz1ZyfEqAaJj8AAAPqOO2cwQ12100.png', url : 'http://search.yhd.com/c0-0/k'+content },
        {title:'WeiBo',  description:'Weibo', picurl:'http://img.t.sinajs.cn/t6/style/images/global_nav/WB_logo_b.png', url : 'http://s.weibo.com/weibo/'+content+'&Refer=index'} 
         ]);
      break;
  }
}).voice(function(message, req, res, next) {
  // message为音频内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'voice',
  // MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
  // Format: 'amr',
  // MsgId: '5837397520665436492' }
        // save the Mediaid of the answer
        /*
        var answer = new Answer();
        answer.set('content', message.MediaId);
        answer.save();
        */

        var bias = answer_array.length-1;
        var random_index = new Number(Math.random()*bias).toFixed(0); 

        res.reply({
          type: "voice",
          content: {
            mediaId: answer_array[random_index]
          }
        });
   

}).video(function(message, req, res, next) {
  // message为视频内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'video',
  // MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
  // ThumbMediaId: 'media_id',
  // MsgId: '5837397520665436492' }
  // TODO
        
}).shortvideo(function(message, req, res, next) {
  // message为短视频内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'shortvideo',
  // MediaId: 'OMYnpghh8fRfzHL8obuboDN9rmLig4s0xdpoNT6a5BoFZWufbE6srbCKc_bxduzS',
  // ThumbMediaId: 'media_id',
  // MsgId: '5837397520665436492' }
  // TODO
}).location(function(message, req, res, next) {
  // message为链接内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'link',
  // Title: '公众平台官网链接',
  // Description: '公众平台官网链接',
  // Url: 'http://1024.com/',
  // MsgId: '5837397520665436492' }
  // TODO
       
}).link(function(message, req, res, next) {
  // message为链接内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'link',
  // Title: '公众平台官网链接',
  // Description: '公众平台官网链接',
  // Url: 'http://1024.com/',
  // MsgId: '5837397520665436492' }
  // TODO
}).event(function(message, req, res, next) {
  // message为事件内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'event',
  // Event: 'LOCATION',
  // Latitude: '23.137466',
  // Longitude: '113.352425',
  // Precision: '119.385040',
  // MsgId: '5837397520665436492' }
  // TODO
}).device_text(function(message, req, res, next) {
  // message为设备文本消息内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'device_text',
  // DeviceType: 'gh_d3e07d51b513'
  // DeviceID: 'dev1234abcd',
  // Content: 'd2hvc3lvdXJkYWRkeQ==',
  // SessionID: '9394',
  // MsgId: '5837397520665436492',
  // OpenID: 'oPKu7jgOibOA-De4u8J2RuNKpZRw' }
  // TODO
}).device_event(function(message, req, res, next) {
  // message为设备事件内容
  // { ToUserName: 'gh_d3e07d51b513',
  // FromUserName: 'oPKu7jgOibOA-De4u8J2RuNKpZRw',
  // CreateTime: '1359125022',
  // MsgType: 'device_event',
  // Event: 'bind'
  // DeviceType: 'gh_d3e07d51b513'
  // DeviceID: 'dev1234abcd',
  // OpType : 0, //Event为subscribe_status/unsubscribe_status时存在
  // Content: 'd2hvc3lvdXJkYWRkeQ==', //Event不为subscribe_status/unsubscribe_status时存在
  // SessionID: '9394',
  // MsgId: '5837397520665436492',
  // OpenID: 'oPKu7jgOibOA-De4u8J2RuNKpZRw' }
  // TODO
}).middlewarify());

module.exports = router;
