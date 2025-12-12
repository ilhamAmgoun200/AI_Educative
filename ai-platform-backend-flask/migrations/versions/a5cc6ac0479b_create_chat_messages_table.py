"""Create chat_messages table

Revision ID: a5cc6ac0479b
Revises: 200d6eef42b8
Create Date: 2025-11-29 22:00:00
"""
from alembic import op
import sqlalchemy as sa


revision = 'a5cc6ac0479b'
down_revision = '13c7d7a4a37c'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'chat_messages',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_ai', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['students.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
    )


def downgrade():
    op.drop_table('chat_messages')
