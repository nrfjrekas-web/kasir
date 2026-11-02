/* Isi API_URL dengan URL Web App (…/exec) milik pemilik sebelum mengunggah. Kasir tidak pernah melihat atau mengisi ini. */
const API_URL='';
/* Status aplikasi. URL Web App di localStorage (api), token sesi di sessionStorage */
const S={tok:sessionStorage.t||'',cart:[],tab:'pos',P:[],q:'',api:API_URL,dev:localStorage.dev||(localStorage.dev=crypto.randomUUID())};
