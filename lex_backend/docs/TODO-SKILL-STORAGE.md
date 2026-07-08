# TODO – Skill Storage

- Definir interface ``SkillStorage.save(skill_id: str, content: str)`` e ``load``.
- Implementar persistência inicial em disco (pasta ``skills_repo``).
- Planejar “backend” futuro: Git repository ou API de armazenamento central.
- Garantir que o caminho salvo é compatível com o script QA (não deve conter barras invertidas).
- Escrever testes que criem e leiam skills temporárias.
