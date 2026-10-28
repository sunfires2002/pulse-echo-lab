"""Create a clean source handoff, without .git, production history, admin or backups."""
from pathlib import Path
import json, shutil, sys
root=Path(__file__).resolve().parent.parent
if len(sys.argv)!=2: raise SystemExit('Usage: python3 tools/prepare-repository.py NEW_OUTPUT_DIR')
out=Path(sys.argv[1]).resolve()
if out==root or out in root.parents or out.exists(): raise SystemExit('Use a new destination')
manifest=json.loads((root/'tools/lab-manifest.json').read_text())
for name in manifest['pages']+manifest['source']:
 p=out/name;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/name,p)
print(out)
