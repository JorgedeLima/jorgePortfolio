/* ---- vault.js -------------------------------------------------------------
   Encryption + sync for the private pages (finances.html, jobtracker.html).

   The repo is public, so each page ships its data as AES-256-GCM ciphertext
   (ENC). One PBKDF2-SHA-256 derivation of the passphrase gives 64 bytes:
     bytes 0-31  -> the AES key (never leaves the browser)
     bytes 32-63 -> a sync token; Supabase stores only its SHA-256 and checks
                    it before reading or writing that page's row.
   Supabase holds ciphertext only. Without the passphrase there is nothing to
   read and nothing can be overwritten.

   Newest copy wins: the published ENC, this browser's copy and the synced
   copy each carry `updatedAt`, and the latest one is used.
------------------------------------------------------------------------- */
(function(){
  var API='https://ylowdgnkxqzuhxsicuzb.supabase.co/rest/v1/rpc/';
  var APIKEY='sb_publishable_WVxsV8a39ES_96U83iiKZA_zkKrzRSt';
  var te=new TextEncoder(), td=new TextDecoder();

  function b64(u8){ var s=''; for(var i=0;i<u8.length;i++) s+=String.fromCharCode(u8[i]); return btoa(s); }
  function ub64(s){ var b=atob(s), u=new Uint8Array(b.length); for(var i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u; }
  function hex(u8){ return Array.from(u8).map(function(b){ return b.toString(16).padStart(2,'0'); }).join(''); }
  function parse(s){ var o=JSON.parse(atob(String(s).trim())); return {salt:ub64(o.s), iv:ub64(o.i), ct:ub64(o.c), n:o.n||600000}; }
  function newer(a,b){ return a && (!b || (a.updatedAt||'')>(b.updatedAt||'')); }

  async function rpc(fn,body){
    var r=await fetch(API+fn,{method:'POST',headers:{'apikey':APIKEY,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
    if(!r.ok) throw new Error('http '+r.status);
    return r.json();
  }

  /* opts: {doc, enc, ls, onStatus(state,text), onRemote(data)} */
  function create(opts){
    var key=null, salt=null, iter=600000, token=null, version=null;
    var current=null, timer=null, pushing=null, dirty=false;
    var v={published:null};

    function status(s,t){ v.state=s; if(opts.onStatus) opts.onStatus(s,t); }

    async function open(blob){
      var b=parse(blob);
      if(b64(b.salt)!==b64(salt)) throw new Error('salt');
      return JSON.parse(td.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:b.iv},key,b.ct)));
    }
    async function seal(obj){
      var iv=crypto.getRandomValues(new Uint8Array(12));
      var ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:iv},key,te.encode(JSON.stringify(obj))));
      return btoa(JSON.stringify({v:1,n:iter,s:b64(salt),i:b64(iv),c:b64(ct)}));
    }
    v.open=open; v.seal=seal;

    /* Throws on a wrong passphrase. Returns the newest data it can find. */
    v.unlock=async function(pass){
      if(!(window.crypto&&crypto.subtle)) throw new Error('nocrypto');
      var b=parse(opts.enc); salt=b.salt; iter=b.n;
      var base=await crypto.subtle.importKey('raw',te.encode(pass.trim().toLowerCase()),'PBKDF2',false,['deriveBits']);
      var bits=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:salt,iterations:iter,hash:'SHA-256'},base,512));
      key=await crypto.subtle.importKey('raw',bits.slice(0,32),{name:'AES-GCM'},false,['encrypt','decrypt']);
      token=hex(bits.slice(32));
      try{ v.published=await open(opts.enc); }catch(x){ key=null; token=null; throw new Error('wrong'); }
      var best=v.published;
      try{ var l=localStorage.getItem(opts.ls); if(l){ var L=await open(l); if(newer(L,best)) best=L; } }catch(x){}
      try{
        status('syncing','Syncing…');
        var R=await pull();
        if(R && newer(R,best)) best=R;
        status('synced','Synced');
      }catch(x){ status('offline','Offline · saved on this device'); }
      current=JSON.parse(JSON.stringify(best));
      if(newer(current,R)) schedule(0);
      return current;
    };

    async function pull(){
      var r=await rpc('vault_get',{p_id:opts.doc,p_token:token});
      if(!r||!r.ok) throw new Error('forbidden');
      version=r.version;
      if(!r.blob) return null; // row created empty; the first save fills it
      return await open(r.blob);
    }

    /* Call after every change. Saves here at once, syncs a moment later. */
    v.save=function(data){
      current=data; dirty=true;
      seal(data).then(function(blob){ try{ localStorage.setItem(opts.ls,blob); }catch(x){} });
      schedule(1200);
    };
    function schedule(ms){ clearTimeout(timer); dirty=true; timer=setTimeout(push,ms); }

    async function push(){
      if(pushing) { await pushing; }
      if(!dirty||!current) return;
      pushing=(async function(){
        dirty=false; status('syncing','Syncing…');
        try{
          if(version==null){ await pull(); }
          var snap=current, blob=await seal(snap);
          var r=await rpc('vault_put',{p_id:opts.doc,p_token:token,p_blob:blob,p_version:version});
          if(r.ok){ version=r.version; status('synced','Synced'); return; }
          if(r.reason==='conflict'){
            var R=await pull();
            if(newer(R,current)){ current=R; if(opts.onRemote) opts.onRemote(R); status('synced','Updated from another device'); }
            else { dirty=true; timer=setTimeout(push,0); }
            return;
          }
          status('error','Sync refused ('+r.reason+') · saved on this device');
        }catch(x){ dirty=true; status('offline','Offline · saved on this device'); timer=setTimeout(push,30000); }
      })();
      await pushing; pushing=null;
    }

    /* When the tab comes back into view, pick up edits made elsewhere. */
    v.refresh=async function(){
      if(!token||dirty||pushing) return;
      try{
        var R=await pull();
        if(newer(R,current)){ current=R; if(opts.onRemote) opts.onRemote(R); status('synced','Updated from another device'); }
        else status('synced','Synced');
      }catch(x){ status('offline','Offline · saved on this device'); }
    };
    document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible') v.refresh(); });

    v.forgetLocal=function(){ try{ localStorage.removeItem(opts.ls); }catch(x){} };
    v.lock=function(){ key=null; token=null; current=null; location.reload(); };
    return v;
  }

  /* Wires the passphrase gate. onOpen(data) runs once the data is decrypted. */
  function gate(vault,onOpen){
    var form=document.getElementById('gateForm'), input=document.getElementById('pass'), err=document.getElementById('gateErr'), btn=document.getElementById('gateBtn');
    form.addEventListener('submit',async function(e){
      e.preventDefault();
      err.textContent=''; btn.disabled=true; btn.textContent='Unlocking…';
      var data;
      try{ data=await vault.unlock(input.value); }
      catch(x){
        btn.disabled=false; btn.textContent='Unlock';
        err.textContent= x.message==='nocrypto' ? 'Crypto unavailable, needs HTTPS' : 'Not that one';
        input.select(); return;
      }
      input.value='';
      document.getElementById('gate').remove();
      document.getElementById('app').hidden=false;
      onOpen(data);
    });
  }

  window.Vault={create:create,gate:gate};
})();
