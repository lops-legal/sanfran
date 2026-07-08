import json
import sys
from datetime import datetime

def json_log(message: str, **kwargs):
    entry = {"timestamp": datetime.utcnow().isoformat(), "msg": message, **kwargs}
    sys.stdout.write(json.dumps(entry, ensure_ascii=False) + "\n")
    sys.stdout.flush()
