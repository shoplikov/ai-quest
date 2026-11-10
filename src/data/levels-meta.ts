// Map facts for every level, from docs/spec/levels.md and docs/spec/i18n.md.
// Used only as a fallback while a level file does not exist yet; once
// src/content/levels/<lang>/<id>-<slug>.mdx exists, its frontmatter wins.
import type { Lang } from '../i18n';

export type LevelMeta = {
  id: number;
  slug: string;
  weeks: number;
  landmark: 'tent' | 'doors' | 'workshop' | 'harbour' | 'library' | 'lighthouse' | 'book' | 'rocket';
  emoji: string;
  title: Record<Lang, string>;
  badge: Record<Lang, string>;
};

export const levelsMeta: LevelMeta[] = [
  { id: 1, slug: 'terminal', weeks: 1, landmark: 'tent', emoji: '🏕️', title: { en: 'Terminal & Linux', ru: 'Терминал и Linux' }, badge: { en: 'Shell Sherpa', ru: 'Проводник по шеллу' } },
  { id: 2, slug: 'ports', weeks: 1, landmark: 'doors', emoji: '🚪', title: { en: 'Networking & Ports', ru: 'Сети и порты' }, badge: { en: 'Port Whisperer', ru: 'Заклинатель портов' } },
  { id: 3, slug: 'backend', weeks: 2, landmark: 'workshop', emoji: '🛠️', title: { en: 'Backend with FastAPI', ru: 'Бэкенд на FastAPI' }, badge: { en: 'Endpoint Artisan', ru: 'Мастер эндпоинтов' } },
  { id: 4, slug: 'docker', weeks: 1, landmark: 'harbour', emoji: '📦', title: { en: 'Docker & Compose', ru: 'Docker и Compose' }, badge: { en: 'Container Tamer', ru: 'Укротительница контейнеров' } },
  { id: 5, slug: 'data', weeks: 1, landmark: 'library', emoji: '📚', title: { en: 'Data layer', ru: 'Слой данных' }, badge: { en: 'Keeper of Rows', ru: 'Хранительница строк' } },
  { id: 6, slug: 'llm', weeks: 1, landmark: 'lighthouse', emoji: '🗼', title: { en: 'LLM serving', ru: 'Работа с LLM' }, badge: { en: 'Token Tactician', ru: 'Тактик токенов' } },
  { id: 7, slug: 'rag', weeks: 3, landmark: 'book', emoji: '📖', title: { en: 'Production RAG', ru: 'RAG в продакшене' }, badge: { en: 'Retrieval Ranger', ru: 'Следопыт поиска' } },
  { id: 8, slug: 'ship', weeks: 1, landmark: 'rocket', emoji: '🚀', title: { en: 'Ship it', ru: 'Запуск в продакшен' }, badge: { en: 'Production Pal', ru: 'Своя в продакшене' } },
];
