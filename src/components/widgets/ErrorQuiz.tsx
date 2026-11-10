// Built in task 3.5.
type Props = {
  level: number;
  quiz: { q: string; code?: string; options: string[]; answer: number; why: string }[];
  strings: Record<string, string>;
  lines: { hit: readonly string[]; miss: readonly string[] };
};
export default function ErrorQuiz(_props: Props) {
  return null;
}
