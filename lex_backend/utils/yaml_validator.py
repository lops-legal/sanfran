import yaml
from yaml import SafeLoader
from typing import Tuple

def validate_frontmatter(content: str) -> Tuple[bool, str]:
    """Verifica se o SKILL.md começa com frontmatter YAML válido.
    Retorna (True, "") se válido, caso contrário (False, mensagem).
    """
    if not content.startswith("---"):
        return False, "Frontmatter ausente"
    try:
        # captura tudo entre os delimitadores de frontmatter
        end = content.find("---", 3)
        if end == -1:
            return False, "Frontmatter de fechamento ausente"
        yaml_part = content[3:end]
        # Usa o loader seguro para validar o YAML
        yaml.load(yaml_part, Loader=SafeLoader)
        return True, ""
    except yaml.YAMLError as exc:
        return False, f"YAML inválido: {exc}"
