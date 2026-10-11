// Preserve only OpenAI's opaque click ID, never page paths or form contents.
// No third-party SDK: automatic contact-field matching is intentionally absent.
export const OPENAI_ADS_ATTRIBUTION_SCRIPT = `(function(){try{if(navigator.globalPrivacyControl===true||navigator.doNotTrack==='1'){document.cookie='__oppref=;Path=/;Max-Age=0;SameSite=Lax;Secure';return;}var id=new URLSearchParams(location.search).get('oppref');if(id&&/^[\\x21-\\x7e]{1,2048}$/.test(id)){document.cookie='__oppref='+encodeURIComponent(id)+';Path=/;Max-Age=2592000;SameSite=Lax;Secure';}}catch(e){}})();`;
