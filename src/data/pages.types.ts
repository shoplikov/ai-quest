// Text of the pages that are not levels: boss, skills, glossary,
// cheat-sheet index, mentor guide, 404. One object per language.
// Strings may use inline markdown (`code`, **bold**).

export type MentorSection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
  table?: { head: string[]; rows: string[][] };
};

export type Pages = {
  boss: {
    kicker: string;
    title: string;
    time: string;
    tagline: string;
    story: string[];
    reqTitle: string;
    reqIntro: string;
    /** Twelve lines; their ids are r1…r12 by position. */
    requirements: string[];
    archTitle: string;
    archIntro: string;
    rubricTitle: string;
    rubricIntro: string;
    rubricHead: string[];
    rubric: string[][];
    finishButton: string;
    finishHint: string;
    certKicker: string;
    certLead: string;
    certBody: string;
    certSigned: string;
    certPrint: string;
    kindNote: string;
    backToMap: string;
    xpToast: string;
  };
  skills: {
    title: string;
    intro: string;
    columns: [string, string, string];
    ratingLegend: string;
    ratings: [string, string, string, string];
    radarTitle: string;
    radarDesc: string;
    you: string;
    target: string;
    middleTitle: string;
    middle: string[];
    level: string;
    readOnly: string;
  };
  glossary: {
    title: string;
    intro: string;
    filterLabel: string;
    filterPlaceholder: string;
    empty: string;
    level: string;
    analogy: string;
  };
  cheatsheets: {
    title: string;
    intro: string;
    level: string;
    open: string;
  };
  mentor: {
    title: string;
    lead: string;
    sections: MentorSection[];
  };
  notFound: {
    title: string;
    line: string;
    back: string;
  };
};
