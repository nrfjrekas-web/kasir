/* Sinkronisasi antrean offline ke server. quiet=true: tanpa pesan bila antrean kosong */
async function sync(quiet){const q=await pend();if(!q.length){if(!quiet)toast('Tidak ada antrean transaksi');return}
 if($('#sy'))$('#sy').disabled=true;
 try{const rs=await call('syncOfflineTransactions',{events:q});let ok=0,bad=[];for(const r of rs){if(r.status==='done'||r.status==='duplicate'){ok++;await st('q','readwrite',s=>s.delete(r.event_id))}else bad.push(r.status+': '+r.error)}
  if(ok)toast(ok+' transaksi tersinkron','ok');if(bad.length)toast('Bermasalah ('+bad.length+'):\n'+bad.join('\n'),'err');await loadP();main()}
 catch(e){toast('Sinkron gagal: '+e.message,'err');if($('#sy'))$('#sy').disabled=false}}
addEventListener('online',()=>{if(S.u)sync(true).then(main)});
addEventListener('offline',()=>{if(S.u)main()});
