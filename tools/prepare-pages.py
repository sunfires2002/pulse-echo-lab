"""Build an allowlisted Pages directory. Existing destinations are never overwritten."""
from pathlib import Path
import json, shutil, sys
root=Path(__file__).resolve().parent.parent
out=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else root/'dist'
if out==root or out in root.parents: raise SystemExit('Choose a separate output directory')
if out.exists(): raise SystemExit('Output already exists; use a new destination')
for name in json.loads((root/'tools/lab-manifest.json').read_text())['pages']:
 p=out/name;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/name,p)
(out/'.nojekyll').touch()
print(out)
