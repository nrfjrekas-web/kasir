/* Isi API_URL sekali dengan URL Web App (…/exec) sebelum mengunggah; semua perangkat langsung tersambung tanpa input. Kosongkan bila ingin diatur lewat layar Sambungkan. */
const API_URL='https://script.google.com/macros/s/AKfycbxUOBq2Pxk_FsVAxQI4XE1xAwALAucYkneimumQp48NiAKVFraQRHtmtbZcn4Adx-XW/exec';
/* Status aplikasi. URL Web App di localStorage (api), token sesi di sessionStorage */
const S={tok:sessionStorage.t||'',cart:[],tab:'pos',P:[],q:'',api:API_URL||localStorage.api||'',dev:localStorage.dev||(localStorage.dev=crypto.randomUUID())};
