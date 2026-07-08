"""Utility package for lex_backend.

Exporta a função :func:`contains_windows_path` do módulo ``path_sanitizer``.
"""

from .path_sanitizer import contains_windows_path

__all__ = ["contains_windows_path"]
