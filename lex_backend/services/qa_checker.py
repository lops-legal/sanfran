import yaml
import json
import re
from typing import Dict
from lex_backend.services.llm_adapter import RealLLMAdapter, MockLLMAdapter
from lex_backend.utils.yaml_validator import validate_frontmatter

class QAChecker:
    """Validador de qualidade das Skills (Fase 2).
    Substitui a execução de scripts bash por análises determinísticas em Python (estrutura)
    e avaliação adversarial via LLM (descoberta, implementação, especialização).
    """

    def __init__(self):
        try:
            self.adapter = RealLLMAdapter()
        except Exception:
            self.adapter = MockLLMAdapter()

    def _run_structural_checks(self, content: str) -> Dict[str, bool]:
        """Realiza validações determinísticas da estrutura (Dimensão 2)."""
        checks = {
            "has_frontmatter": False,
            "has_name": False,
            "has_description": False,
            "name_is_valid": False,
            "description_length_ok": False,
            "has_h2_headers": False,
            "has_normas": False,
            "has_autonomia": False,
            "no_windows_paths": True,
        }

        # Check frontmatter
        if content.startswith("---"):
            end = content.find("---", 3)
            if end != -1:
                checks["has_frontmatter"] = True
                yaml_part = content[3:end]
                try:
                    data = yaml.safe_load(yaml_part)
                    if isinstance(data, dict):
                        checks["has_name"] = "name" in data
                        checks["has_description"] = "description" in data
                        if "name" in data and isinstance(data["name"], str):
                            # Name format: no spaces, alphanumeric and hyphens/underscores
                            name_val = data["name"]
                            checks["name_is_valid"] = bool(re.match(r"^[a-zA-Z0-9_\-]+$", name_val))
                        if "description" in data and isinstance(data["description"], str):
                            desc_len = len(data["description"])
                            checks["description_length_ok"] = 20 <= desc_len <= 500
                except Exception:
                    pass

        # Check markdown content
        checks["has_h2_headers"] = "## " in content
        
        content_lower = content.lower()
        checks["has_normas"] = "norma" in content_lower or "clt" in content_lower or "cdc" in content_lower or "lgpd" in content_lower
        checks["has_autonomia"] = "autonomia" in content_lower or "limite" in content_lower
        
        if "\\" in content:
            checks["no_windows_paths"] = False

        return checks

    def run(self, skill: dict) -> Dict:
        """Executa a avaliação completa nas 4 dimensões."""
        content = skill.get("content", "")
        if not content:
            return {"error": "Conteúdo da skill vazio"}

        # 1. Dimensão Estrutura (Deterministic Linter)
        struct = self._run_structural_checks(content)
        passed_checks = sum(1 for v in struct.values() if v)
        total_checks = len(struct)
        
        # Converte para nota 0-3
        ratio = passed_checks / total_checks
        if ratio >= 0.9:
            structure_score = 3
        elif ratio >= 0.7:
            structure_score = 2
        elif ratio >= 0.5:
            structure_score = 1
        else:
            structure_score = 0

        # 2. Avaliação Adversarial via LLM (Descoberta, Implementação, Especialização)
        prompt = (
            "Você é um Auditor de Qualidade de Skills Jurídicas de IA altamente rigoroso (adversarial).\n"
            "Seu trabalho é encontrar falhas e avaliar criticamente a qualidade da skill abaixo.\n\n"
            f"SKILL:\n---\n{content}\n---\n\n"
            "Avalie a skill nas 3 dimensões (atribua uma nota de 0 a 3 para cada uma):\n"
            "1. discovery: Descoberta (Nome claro, descrição específica para ativação em terceira pessoa).\n"
            "2. implementation: Implementação (Instruções práticas, passo a passo, tratamento de casos extremos).\n"
            "3. specialization: Especialização (Profundidade de domínio, citações normativas específicas, armadilhas reais).\n\n"
            "Retorne APENAS um JSON válido contendo as notas e justificativas, seguindo o exemplo abaixo:\n"
            "{\n"
            "  \"discovery\": {\"score\": 3, \"justification\": \"...\"},\n"
            "  \"implementation\": {\"score\": 2, \"justification\": \"...\"},\n"
            "  \"specialization\": {\"score\": 3, \"justification\": \"...\"}\n"
            "}"
        )

        try:
            response = self.adapter.generate(prompt).strip()
            if "{" in response:
                response = response[response.find("{"):response.rfind("}")+1]
            eval_data = json.loads(response)
        except Exception:
            # Fallback em caso de falha do LLM
            eval_data = {
                "discovery": {"score": 2, "justification": "Avaliação padrão."},
                "implementation": {"score": 2, "justification": "Avaliação padrão."},
                "specialization": {"score": 2, "justification": "Avaliação padrão."}
            }

        discovery = eval_data.get("discovery", {}).get("score", 2)
        implementation = eval_data.get("implementation", {}).get("score", 2)
        specialization = eval_data.get("specialization", {}).get("score", 2)

        # 3. Score Final (0-100)
        total_sum = discovery + implementation + structure_score + specialization
        final_score = round((total_sum / 12) * 100)

        report = {
            "discovery": {
                "score": discovery,
                "justification": eval_data.get("discovery", {}).get("justification", "")
            },
            "implementation": {
                "score": implementation,
                "justification": eval_data.get("implementation", {}).get("justification", "")
            },
            "structure": {
                "score": structure_score,
                "justification": f"{passed_checks}/{total_checks} verificações estruturais aprovadas."
            },
            "specialization": {
                "score": specialization,
                "justification": eval_data.get("specialization", {}).get("justification", "")
            },
            "final_score": final_score,
            "structural_checks": struct,
            "design_pattern": "revisor_auditor",
            "justifications": {
                "discovery": eval_data.get("discovery", {}).get("justification", ""),
                "implementation": eval_data.get("implementation", {}).get("justification", ""),
                "structure": f"Passou em {passed_checks} de {total_checks} verificações.",
                "specialization": eval_data.get("specialization", {}).get("justification", "")
            }
        }

        return report
