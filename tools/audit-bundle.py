"""Inspect source handoff or Pages artifacts for production clients and credentials."""
from pathlib import Path
import json,re,sys
root=Path(__file__).resolve().parent.parent
if len(sys.argv)!=2: raise SystemExit('Usage: python3 tools/audit-bundle.py OUTPUT_DIR')
out=Path(sys.argv[1]).resolve()
manifest=json.loads((root/'tools/lab-manifest.json').read_text())
allowed=set(manifest['pages']+manifest['source']+['.nojekyll'])
bad=[]
for p in out.rglob('*'):
 if not p.is_file():continue
 name=p.relative_to(out).as_posix()
 if name not in allowed:bad.append(name+': not allowlisted')
 if p.suffix not in ['.js','.html','.css','.json','.yml','.md','.py','.cjs']:continue
 text=p.read_text()
 if re.search(r'-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}|sb_secret_[A-Za-z0-9_]{20,}',text):bad.append(name+': credential-like content')
 # No remote data client can be introduced into runnable browser files.
 if p.suffix in ['.js','.html'] and re.search(r'https?://[^\s\x22\x27<>]*supabase\.(?:co|com)|sb_publishable_|createClient\s*\(|supabase-js@',text):bad.append(name+': remote client or endpoint')
if bad:raise SystemExit('\n'.join(bad))
print('PASS: allowlisted files; no production endpoints, SDK/client creation or credential-like content')
