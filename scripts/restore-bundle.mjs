import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, normalize, isAbsolute } from 'node:path';
import { gunzipSync } from 'node:zlib';

const sourceDir = join(process.cwd(), 'source');
const parts = readdirSync(sourceDir).filter(name => /^bundle-\d+\.b64$/.test(name)).sort();
if (!parts.length) throw new Error('Doit source bundle is missing.');
const packed = Buffer.from(parts.map(name => readFileSync(join(sourceDir, name), 'utf8').trim()).join(''), 'base64');
const tar = gunzipSync(packed);
let offset = 0;
let restored = 0;
while (offset + 512 <= tar.length) {
  const header = tar.subarray(offset, offset + 512);
  if (header.every(byte => byte === 0)) break;
  const readText = (start, length) => header.subarray(start, start + length).toString('utf8').replace(/\0.*$/s, '').trim();
  const name = readText(0, 100);
  const prefix = readText(345, 155);
  const path = normalize(prefix ? `${prefix}/${name}` : name);
  const size = Number.parseInt(readText(124, 12) || '0', 8);
  const type = readText(156, 1);
  const dataStart = offset + 512;
  if (path && !isAbsolute(path) && path !== '..' && !path.startsWith(`..${process.platform === 'win32' ? '\\\\' : '/'}`) && (type === '' || type === '0')) {
    const target = join(process.cwd(), path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, tar.subarray(dataStart, dataStart + size));
    restored++;
  }
  offset = dataStart + Math.ceil(size / 512) * 512;
}
if (!restored) throw new Error('Doit source bundle had no files to restore.');
console.log(`Restored ${restored} Doit source files.`);

const overlayDir = join(process.cwd(), 'overrides');
if (existsSync(overlayDir)) {
  let overlaid = 0;
  const applyOverlay = (directory, relative = '') => {
    for (const item of readdirSync(directory, { withFileTypes: true })) {
      const source = join(directory, item.name);
      const relPath = join(relative, item.name);
      if (item.isDirectory()) {
        applyOverlay(source, relPath);
      } else if (item.isFile()) {
        const target = join(process.cwd(), relPath);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, readFileSync(source));
        overlaid++;
      }
    }
  };
  applyOverlay(overlayDir);
  console.log(`Applied ${overlaid} Doit override files.`);

  const pagePath = join(process.cwd(), 'app', 'page.tsx');
  if (existsSync(pagePath)) {
    let page = readFileSync(pagePath, 'utf8');
    const oldChatEffect = "useEffect(()=>{if(!db||!selectedGroup)return;const fetchMessages=async()=>{const r=await db.from('group_messages').select('*').eq('group_id',selectedGroup).order('created_at',{ascending:true}).limit(100);if(!r.error)setMessages(r.data||[]);};void fetchMessages();const timer=window.setInterval(fetchMessages,10000);return()=>window.clearInterval(timer);},[db,selectedGroup]);";
    const newChatEffect = "useEffect(()=>{if(!db||!selectedGroup)return;const fetchMessages=async()=>{const r=await db.from('group_messages').select('*').eq('group_id',selectedGroup).order('created_at',{ascending:true}).limit(100);if(!r.error)setMessages(r.data||[]);};void fetchMessages();const channel=db.channel(\`doit-group-\${selectedGroup}\`).on('postgres_changes',{event:'*',schema:'public',table:'group_messages',filter:\`group_id=eq.\${selectedGroup}\`},()=>void fetchMessages()).subscribe();const fallback=window.setInterval(()=>void fetchMessages(),15000);return()=>{window.clearInterval(fallback);void db.removeChannel(channel);};},[db,selectedGroup]);";
    if (!page.includes(oldChatEffect) && !page.includes("doit-group-")) {
      throw new Error('Doit chat patch could not find the original message polling effect.');
    }
    if (page.includes(oldChatEffect)) page = page.replace(oldChatEffect, newChatEffect);

    const syncEffect = "useEffect(()=>{if(!db||!user)return;let refreshTimer:number|undefined;const refresh=()=>{if(refreshTimer)window.clearTimeout(refreshTimer);refreshTimer=window.setTimeout(()=>void load(user),300);};const channel=db.channel(\`doit-user-sync-\${user.id}\`).on('postgres_changes',{event:'*',schema:'public',table:'posts'},refresh).on('postgres_changes',{event:'*',schema:'public',table:'events'},refresh).on('postgres_changes',{event:'*',schema:'public',table:'event_invites'},refresh).on('postgres_changes',{event:'*',schema:'public',table:'friendships'},refresh).on('postgres_changes',{event:'*',schema:'public',table:'notifications'},refresh).subscribe();return()=>{if(refreshTimer)window.clearTimeout(refreshTimer);void db.removeChannel(channel);};},[db,user,load]);";
    if (!page.includes('doit-user-sync-')) {
      const anchor = "useEffect(()=>{if(user) void load(user);},[user,load]);";
      if (!page.includes(anchor)) throw new Error('Doit sync patch could not locate the user data loading effect.');
      page = page.replace(anchor, anchor + syncEffect);
    }

    const oldBrand = "function Brand({compact=false}:{compact?:boolean}){return <div className={compact?'brand compact-brand':'brand'}><span className=\"brand-mark\">d<span>.</span></span>{!compact&&<span><b>doit</b><small>MENOS PANTALLA. MÁS VIDA.</small></span>}</div>;}";
    const newBrand = "function Brand({compact=false,hero=false}:{compact?:boolean;hero?:boolean}){const src=compact?'/doit-icon.svg':'/doit-horizontal.svg';return <div className={['brand',compact?'compact-brand':'',hero?'brand-hero':''].filter(Boolean).join(' ')}><img className=\"doit-brand-image\" src={src} alt=\"Doit — Real connections\" /></div>;}";
    if (!page.includes(oldBrand) && !page.includes('doit-brand-image')) {
      throw new Error('Doit brand patch could not find the original brand component.');
    }
    if (page.includes(oldBrand)) page = page.replace(oldBrand, newBrand);
    page = page.replace('<section className="auth-art"><Brand/>', '<section className="auth-art"><Brand hero/>');

    const oldSessionEffect = "useEffect(()=>{if(!db){setLoading(false);return;}let alive=true;db.auth.getSession().then(({data})=>{if(alive){setUser(data.session?.user||null);setLoading(false);}});const {data:l}=db.auth.onAuthStateChange((_e,s)=>{setUser(s?.user||null);setLoading(false);if(!s?.user){setProfile(null);setPosts([]);setPlans([]);setGroups([]);}});return()=>{alive=false;l.subscription.unsubscribe();};},[db]);";
    const newSessionEffect = "useEffect(()=>{if(!db){setLoading(false);return;}let alive=true;void db.auth.getSession().then(({data})=>{if(alive){setUser(data.session?.user||null);setLoading(false);}}).catch((error)=>{console.error('Doit session restore failed:',error);if(alive)setLoading(false);});const {data:l}=db.auth.onAuthStateChange((_e,s)=>{setUser(s?.user||null);setLoading(false);if(!s?.user){setProfile(null);setPosts([]);setPlans([]);setGroups([]);}});return()=>{alive=false;l.subscription.unsubscribe();};},[db]);";
    if (page.includes(oldSessionEffect)) page = page.replace(oldSessionEffect,newSessionEffect);

    writeFileSync(pagePath, page);
    console.log('Enabled realtime user sync and group chat with polling fallback.');
  }
}
