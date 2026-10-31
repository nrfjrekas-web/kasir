/* Sinkronisasi antrean offline ke server */
async function sync(){const q=await pend();if(!q.length)return toast('Tidak ada antrean');
 try{const rs=await call('syncOfflineTransactions',{events:q});let ok=0,bad=[];for(const r of rs){if(r.status==='done'||r.status==='duplicate'){ok++;await st('q','readwrite',s=>s.delete(r.event_id))}else bad.push(r.status+': '+r.error)}
  toast(`Berhasil ${ok}`+(bad.length?`\nBermasalah (${bad.length}):\n`+bad.join('\n'):''));await loadP();main()}catch(e){toast('Sinkron gagal: '+e.message)}}

addEventListener('online',()=>{if(S.u){sync();}});
async function copyGas(){try{await navigator.clipboard.writeText(GAS);toast('Kode Apps Script disalin.')}catch(e){toast('Gagal menyalin kode.')}}
