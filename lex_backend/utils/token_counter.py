import re

def approximate_token_count(text: str) -> int:
    """Aproxima o número de tokens usando a heurística caracteres/4.
    É suficiente para orçamentos rápidos quando tiktoken não está disponível.
    """
    if not text:
        return 0
    # Remove espaços excessivos
    clean = re.sub(r"\s+", " ", text)
    return max(1, len(clean) // 4)
