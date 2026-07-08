import os
import json
from pathlib import Path

class SkillStorage:
    """Armazena skills em disco local no diretório ``skills_repo``.
    Cada skill é salva como ``<skill_id>.md``.
    """
    def __init__(self, base_dir: str = "skills_repo"):
        self.base_path = Path(base_dir)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def _slug(self, title: str) -> str:
        return title.lower().replace(" ", "-")

    def save(self, skill_dict: dict) -> str:
        title = skill_dict.get("title", skill_dict.get("name", "unnamed"))
        skill_id = self._slug(title)
        file_path = self.base_path / f"{skill_id}.md"
        content = skill_dict.get("content", "")
        # Garante que o arquivo seja escrito com UTF-8
        file_path.write_text(content, encoding="utf-8")
        return skill_id

    def load(self, skill_id: str) -> str:
        file_path = self.base_path / f"{skill_id}.md"
        if not file_path.exists():
            raise FileNotFoundError(f"Skill {skill_id} not found")
        return file_path.read_text(encoding="utf-8")
