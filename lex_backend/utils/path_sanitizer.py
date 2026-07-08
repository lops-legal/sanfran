import re

def contains_windows_path(text: str) -> bool:
    """Detecta caminhos do Windows (ex.: C:\\algo ou /c/Users)."""
    pattern = r"[a-zA-Z]:\\|/c/|/d/|/e/"
    return bool(re.search(pattern, text))
