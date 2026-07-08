"""Add title to lex_sessions, sync lex_interactions with models.py (content column)

Coloque este arquivo em: services/db/migrations/versions/0002_sessions_title.py
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0002_sessions_title"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade():
    # lex_sessions: título exibido no histórico ("Nova Conversa", ou o
    # resumo da primeira mensagem do usuário — ver lógica em routes/sessions.py)
    op.add_column(
        "lex_sessions",
        sa.Column("title", sa.String, nullable=False, server_default="Nova Conversa"),
    )
    # lex_sessions: updated_at para ordenar o histórico por atividade recente
    # (sem isso, a lista sempre voltaria ordenada por created_at, e uma
    # conversa antiga retomada hoje apareceria no fim da lista).
    op.add_column(
        "lex_sessions",
        sa.Column("updated_at", sa.String, server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    # lex_interactions: o models.py atual já declara `content` (Text) — a
    # migration 0001 nunca criou essa coluna, então a tabela real e o ORM
    # estavam dessincronizados. Adicionando aqui para alinhar.
    op.add_column(
        "lex_interactions",
        sa.Column("content", sa.Text, nullable=True),
    )


def downgrade():
    op.drop_column("lex_interactions", "content")
    op.drop_column("lex_sessions", "updated_at")
    op.drop_column("lex_sessions", "title")
