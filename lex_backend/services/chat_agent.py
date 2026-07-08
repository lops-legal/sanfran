import os
import re
from typing import List, Dict, Optional, Tuple
from .llm_adapter import RealLLMAdapter

class ChatAgent:
    def __init__(self):
        try:
            self.llm = RealLLMAdapter()
        except RuntimeError:
            from .llm_adapter import MockLLMAdapter
            self.llm = MockLLMAdapter()

    def _build_system_prompt(self, context_doc: Optional[Dict] = None) -> str:
        # Load meta_skill_template_temp.md if it exists
        meta_skill_content = ""
        template_path = os.path.join(os.path.dirname(__file__), "..", "..", "meta_skill_template_temp.md")
        if os.path.exists(template_path):
            with open(template_path, "r", encoding="utf-8") as f:
                meta_skill_content = f.read()

        sys_prompt = (
            "Você é a Lex AI, uma assistente jurídica especializada e arquiteta de Skills para a plataforma Sanfran.md.\n"
            "Seu objetivo é guiar o usuário em tarefas jurídicas e, sempre que solicitado ou apropriado, "
            "gerar o rascunho de uma 'Skill' em formato Markdown.\n"
            "Quando for gerar uma skill, coloque todo o conteúdo Markdown dentro de um bloco delimitado por ```markdown ... ```.\n"
            "Sempre seja educada, objetiva e ajude o advogado brasileiro com precisão.\n"
        )
        
        if meta_skill_content:
            sys_prompt += f"\n### DIRETRIZES DE CRIAÇÃO DE SKILL (META-SKILL) ###\nAo gerar uma skill, obedeça às seguintes regras estruturais:\n{meta_skill_content}\n"

        if context_doc:
            sys_prompt += f"\nO usuário anexou o seguinte documento ({context_doc['name']}) para análise:\n---\n{context_doc['text']}\n---\nUse essas informações em suas respostas."
        
        return sys_prompt

    def _extract_markdown_skill(self, response_text: str) -> Tuple[str, Optional[str]]:
        # Regex to find markdown blocks
        pattern = r"```markdown(.*?)```"
        match = re.search(pattern, response_text, re.DOTALL)
        
        if match:
            markdown_content = match.group(1).strip()
            # Remove the markdown block from the conversational text to avoid showing raw code in chat
            clean_text = re.sub(pattern, "*(Rascunho de Skill gerado)*", response_text, flags=re.DOTALL).strip()
            return clean_text, markdown_content
        
        return response_text, None

    def process_chat(self, message: str, history: List[Dict], context_doc: Optional[Dict] = None) -> Tuple[str, Optional[str]]:
        # Format messages for LLM
        messages = [
            {"role": "system", "content": self._build_system_prompt(context_doc)}
        ]
        
        # Map history to proper roles
        for msg in history:
            role = "user" if msg["role"] == "user" else "assistant"
            messages.append({"role": role, "content": msg["text"]})
            
        messages.append({"role": "user", "content": message})
        
        # Call LLM
        response_text = self.llm.generate_chat(messages)
        
        # Parse output
        chat_text, skill_markdown = self._extract_markdown_skill(response_text)
        
        return chat_text, skill_markdown
