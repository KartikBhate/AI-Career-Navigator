import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Compass, GraduationCap, RotateCcw, Sparkles, Target, Wrench, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type Intake = {
  level: string;
  program: string;
  year: string;
  skills: string[];
  interests: string[];
  interestDetails: string;
  career: string;
  studyTime: string;
};

type RoadmapStep = {
  number: string;
  title: string;
  detail: string;
};

type CareerRequirement = {
  name: string;
  aliases: string[];
  why: string;
};

type CareerTrack = {
  name: string;
  keywords: string[];
  interests: string[];
  requirements: CareerRequirement[];
  experiment: (intake: Intake) => string;
};

type PersonalizedRoadmap = {
  trackName: string;
  missingSkills: CareerRequirement[];
  steps: RoadmapStep[];
};

const stepItems = [
  { label: 'Education', hint: 'Your starting point', icon: GraduationCap },
  { label: 'Skills', hint: 'What comes naturally', icon: Wrench },
  { label: 'Interests', hint: 'What pulls you in', icon: Compass },
  { label: 'Direction', hint: 'Where you are headed', icon: Target },
  { label: 'Review', hint: 'Your signal so far', icon: Check },
];

const skillSuggestions = ['Research', 'Writing', 'Figma', 'Python', 'Public speaking', 'Data analysis', 'Project planning', 'Video editing'];
const interestOptions = ['Making things', 'Understanding people', 'Technology', 'Visual stories', 'The natural world', 'Business & money', 'Social impact', 'Learning how things work'];
const roleSuggestions = ['Product designer', 'Data analyst', 'UX researcher', 'Software engineer', 'Creative strategist', 'Climate researcher'];

const careerTracks: CareerTrack[] = [
  {
    name: 'Software engineering',
    keywords: ['software engineer', 'software developer', 'developer', 'frontend', 'front-end', 'backend', 'back-end', 'full stack', 'web developer', 'programmer', 'coding'],
    interests: ['Technology', 'Learning how things work', 'Making things'],
    requirements: [
      { name: 'Programming fundamentals', aliases: ['programming', 'coding', 'python', 'javascript', 'typescript', 'java', 'c++', 'ruby', 'go'], why: 'to turn an idea into reliable, readable code' },
      { name: 'Git & collaboration', aliases: ['git', 'github', 'version control', 'collaboration'], why: 'to work safely on projects with other people' },
      { name: 'Testing & debugging', aliases: ['testing', 'debugging', 'debug', 'data structures', 'algorithms'], why: 'to make your work dependable instead of just functional once' },
      { name: 'Shipping a small product', aliases: ['deployment', 'deploy', 'api', 'web development', 'cloud', 'docker'], why: 'to show that you can take a project from idea to something usable' },
    ],
    experiment: (intake) => `build a tiny ${intake.interests[0]?.toLowerCase() || 'student'} tool and publish the first working version`,
  },
  {
    name: 'Data analytics',
    keywords: ['data analyst', 'data analytics', 'analytics', 'business intelligence', 'bi analyst', 'data scientist', 'quantitative'],
    interests: ['Technology', 'Business & money', 'Learning how things work', 'The natural world'],
    requirements: [
      { name: 'SQL', aliases: ['sql', 'database', 'postgres', 'mysql'], why: 'to answer real questions from more than a spreadsheet' },
      { name: 'Data cleaning', aliases: ['data cleaning', 'excel', 'spreadsheets', 'google sheets', 'pandas', 'data analysis'], why: 'to make messy information trustworthy before interpreting it' },
      { name: 'Statistics & experimentation', aliases: ['statistics', 'stats', 'math', 'a/b testing', 'experimentation'], why: 'to separate a meaningful pattern from a coincidence' },
      { name: 'Data storytelling', aliases: ['data storytelling', 'tableau', 'power bi', 'data visualization', 'visualization', 'charts'], why: 'to help a non-technical audience act on your findings' },
    ],
    experiment: (intake) => `find a small public dataset about ${intake.interests[0]?.toLowerCase() || 'a topic you care about'} and publish one clear finding`,
  },
  {
    name: 'Product design',
    keywords: ['product designer', 'product design', 'ux/ui', 'ui/ux', 'ux designer', 'ui designer', 'interaction designer', 'design lead'],
    interests: ['Making things', 'Understanding people', 'Visual stories', 'Technology'],
    requirements: [
      { name: 'User research', aliases: ['user research', 'research', 'interviews', 'user interviews'], why: 'to design from real needs instead of assumptions' },
      { name: 'Interaction design', aliases: ['interaction design', 'ux', 'wireframing', 'wireframes', 'prototyping', 'figma'], why: 'to make the path through a product clear and usable' },
      { name: 'Visual communication', aliases: ['visual design', 'visual stories', 'typography', 'graphic design', 'illustration'], why: 'to give your ideas a coherent, understandable form' },
      { name: 'Portfolio storytelling', aliases: ['portfolio', 'case study', 'storytelling', 'writing', 'presentation'], why: 'to make your decisions visible to a hiring team' },
    ],
    experiment: (intake) => `redesign one ${intake.interests[0]?.toLowerCase() || 'student'} experience, interview one person, and document the decisions`,
  },
  {
    name: 'UX research',
    keywords: ['ux researcher', 'user researcher', 'ux research', 'user research', 'researcher', 'qualitative research'],
    interests: ['Understanding people', 'Social impact', 'Learning how things work'],
    requirements: [
      { name: 'Interview technique', aliases: ['interviews', 'user interviews', 'interviewing', 'communication'], why: 'to ask useful questions without steering the answer' },
      { name: 'Research methods', aliases: ['research methods', 'research', 'qualitative research', 'surveys', 'usability testing'], why: 'to choose evidence that fits the question' },
      { name: 'Qualitative synthesis', aliases: ['synthesis', 'analysis', 'thematic analysis', 'data analysis', 'note taking'], why: 'to turn many conversations into a defensible pattern' },
      { name: 'Insight storytelling', aliases: ['storytelling', 'writing', 'presentation', 'presentations', 'public speaking'], why: 'to help a team understand what to do next' },
    ],
    experiment: (intake) => `speak with two people about how they experience ${intake.interests[0]?.toLowerCase() || 'a familiar product'} and turn the repeated needs into a brief`,
  },
  {
    name: 'Climate & sustainability work',
    keywords: ['climate', 'sustainability', 'sustainable', 'environment', 'environmental', 'conservation', 'renewable energy', 'clean energy'],
    interests: ['The natural world', 'Social impact', 'Learning how things work'],
    requirements: [
      { name: 'Domain literacy', aliases: ['climate', 'environment', 'environmental science', 'sustainability', 'science'], why: 'to frame your work around the right physical and social context' },
      { name: 'Evidence & research', aliases: ['research', 'research methods', 'literature review', 'science'], why: 'to ground recommendations in credible evidence' },
      { name: 'Data analysis', aliases: ['data analysis', 'python', 'statistics', 'sql', 'excel'], why: 'to work confidently with the numbers behind the story' },
      { name: 'Communicating evidence', aliases: ['writing', 'public speaking', 'visual stories', 'data storytelling', 'presentation'], why: 'to make an urgent topic clear to the people who can act' },
    ],
    experiment: (intake) => `translate one ${intake.interests[0]?.toLowerCase() || 'climate'} question into a short, evidence-backed explainer`,
  },
  {
    name: 'Marketing & creative strategy',
    keywords: ['marketing', 'marketer', 'creative strategist', 'content strategist', 'brand strategist', 'communications', 'social media'],
    interests: ['Visual stories', 'Understanding people', 'Business & money', 'Making things'],
    requirements: [
      { name: 'Audience research', aliases: ['research', 'user research', 'market research', 'interviews', 'understanding people'], why: 'to build for a real audience rather than an imagined one' },
      { name: 'Clear copywriting', aliases: ['writing', 'copywriting', 'content writing', 'communication', 'storytelling'], why: 'to turn a strategy into words people remember' },
      { name: 'Content planning', aliases: ['content strategy', 'project planning', 'social media', 'marketing', 'campaigns'], why: 'to make ideas consistent enough to travel' },
      { name: 'Measuring response', aliases: ['analytics', 'data analysis', 'statistics', 'a/b testing', 'experimentation'], why: 'to learn what is working instead of guessing' },
    ],
    experiment: (intake) => `create a small campaign for a ${intake.interests[0]?.toLowerCase() || 'student'} idea and compare two messages with real readers`,
  },
];

function Home() {
  const [step, setStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [intake, setIntake] = useState<Intake>({
    level: '',
    program: '',
    year: '',
    skills: [],
    interests: [],
    interestDetails: '',
    career: '',
    studyTime: '',
  });

  const updateIntake = (patch: Partial<Intake>) => {
    setIntake((current) => ({ ...current, ...patch }));
    setValidationMessage('');
  };

  const addSkill = (value: string) => {
    const skill = value.trim().replace(/,$/, '');
    if (!skill || intake.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      setSkillInput('');
      return;
    }
    updateIntake({ skills: [...intake.skills, skill] });
    setSkillInput('');
  };

  const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addSkill(skillInput);
    }
    if (event.key === 'Backspace' && !skillInput && intake.skills.length) {
      updateIntake({ skills: intake.skills.slice(0, -1) });
    }
  };

  const toggleInterest = (interest: string) => {
    const selected = intake.interests.includes(interest);
    updateIntake({
      interests: selected
        ? intake.interests.filter((item) => item !== interest)
        : [...intake.interests, interest],
    });
  };

  const validateStep = () => {
    if (step === 0 && (!intake.level || !intake.program || !intake.year)) {
      setValidationMessage('Add your program, level, and expected graduation year to continue.');
      return false;
    }
    if (step === 1 && intake.skills.length === 0) {
      setValidationMessage('Add at least one skill. It can be something you learned in class, at work, or on your own.');
      return false;
    }
    if (step === 2 && intake.interests.length === 0) {
      setValidationMessage('Choose at least one interest so we can spot the themes in your answers.');
      return false;
    }
    if (step === 3 && (!intake.career.trim() || !intake.studyTime)) {
      setValidationMessage('Add a direction and a realistic weekly study rhythm to continue.');
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    if (step === stepItems.length - 1) {
      setComplete(true);
      return;
    }
    setStep((current) => current + 1);
    setValidationMessage('');
  };

  const restart = () => {
    setStep(0);
    setComplete(false);
    setValidationMessage('');
    setSkillInput('');
    setIntake({ level: '', program: '', year: '', skills: [], interests: [], interestDetails: '', career: '', studyTime: '' });
  };

  if (complete) {
    return <CompletionState intake={intake} onRestart={restart} />;
  }

  return (
    <div className="noise min-h-[100dvh] flow-shell">
      <div className="grid min-h-[100dvh] lg:grid-cols-[310px_minmax(0,1fr)]">
        <ProgressRail currentStep={step} onJump={(nextStep) => { setStep(nextStep); setValidationMessage(''); }} />
        <main className="relative flex min-w-0 flex-col">
          <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12 lg:py-7">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-secondary text-accent shadow-sm">
                <Sparkles size={17} strokeWidth={2.4} />
              </div>
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.19em] text-secondary">pathfinder</span>
            </div>
            <div className="hidden items-center gap-2 text-secondary lg:flex">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em]">Private career studio</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
              <span className="hidden sm:inline">Progress</span>
              <span className="font-mono text-secondary">{step + 1}</span>
              <span className="text-muted-foreground/60">/</span>
              <span className="font-mono">{stepItems.length}</span>
            </div>
          </header>
          <MobileStepBar currentStep={step} onJump={(nextStep) => { setStep(nextStep); setValidationMessage(''); }} />

          <div className="mx-auto flex w-full max-w-[850px] flex-1 flex-col px-5 pb-8 sm:px-8 lg:px-12 lg:pb-14">
            <div className="mb-9 h-1.5 overflow-hidden rounded-full bg-muted lg:mb-12">
              <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: `${((step + 1) / stepItems.length) * 100}%` }} />
            </div>
            <div className="flex-1">
              <StepContent
                step={step}
                intake={intake}
                updateIntake={updateIntake}
                skillInput={skillInput}
                setSkillInput={setSkillInput}
                addSkill={addSkill}
                handleSkillKeyDown={handleSkillKeyDown}
                toggleInterest={toggleInterest}
                onEdit={setStep}
              />
            </div>
            <div className="mt-10 border-t border-border/80 pt-5 sm:mt-14 sm:pt-6">
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  data-testid="button-back"
                  onClick={() => { setValidationMessage(''); setStep((current) => Math.max(0, current - 1)); }}
                  disabled={step === 0}
                  className="group inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-bold text-muted-foreground transition-colors hover:text-secondary disabled:invisible"
                >
                  <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                  Back
                </button>
                <div className="flex flex-col items-end gap-2">
                  {validationMessage && <p data-testid="text-validation-message" className="text-right text-xs font-semibold text-destructive">{validationMessage}</p>}
                  <button
                    type="button"
                    data-testid="button-next"
                    onClick={goNext}
                    className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-secondary px-5 text-sm font-bold text-secondary-foreground shadow-[0_7px_0_hsl(228_35%_12%/0.13)] transition-all hover:-translate-y-0.5 hover:bg-primary active:translate-y-0 active:shadow-none sm:px-7"
                  >
                    {step === stepItems.length - 1 ? 'Build my path' : 'Save & continue'}
                    <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ProgressRail({ currentStep, onJump }: { currentStep: number; onJump: (step: number) => void }) {
  return (
    <aside className="hidden flex-col justify-between bg-secondary px-8 py-9 text-secondary-foreground lg:flex">
      <div>
        <div className="mb-20 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-accent text-secondary shadow-[4px_4px_0_hsl(37_88%_58%/0.25)]">
            <Sparkles size={19} strokeWidth={2.4} />
          </div>
          <span className="font-mono text-[12px] font-medium uppercase tracking-[0.2em]">pathfinder</span>
        </div>
        <div className="mb-8">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-sidebar-primary">Your starting point</p>
          <h1 className="max-w-[230px] font-serif text-[41px] leading-[.96] tracking-[-0.035em]">Make the next move feel less foggy.</h1>
        </div>
        <p className="max-w-[220px] text-sm leading-6 text-secondary-foreground/65">A few honest answers are enough to start turning your interests into a direction.</p>
        <nav className="mt-16" aria-label="Intake progress">
          <ol className="space-y-1">
            {stepItems.map((item, index) => {
              const Icon = item.icon;
              const isCurrent = currentStep === index;
              const isDone = currentStep > index;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    data-testid={`button-jump-step-${index}`}
                    disabled={index > currentStep}
                    onClick={() => onJump(index)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${isCurrent ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-secondary-foreground/55 hover:bg-sidebar-accent/60 hover:text-secondary-foreground'} disabled:cursor-default disabled:hover:bg-transparent`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs transition-colors ${isDone ? 'border-sidebar-primary bg-sidebar-primary text-sidebar-primary-foreground' : isCurrent ? 'border-accent text-accent' : 'border-secondary-foreground/20'}`}>
                      {isDone ? <Check size={14} strokeWidth={3} /> : <Icon size={15} />}
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{item.label}</span>
                      <span className="block text-[10px] text-current/55">{item.hint}</span>
                    </span>
                    {isCurrent && <ChevronRight size={15} className="ml-auto text-accent" />}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-secondary-foreground/35">Take your time · 2–3 min</p>
    </aside>
  );
}

function MobileStepBar({ currentStep, onJump }: { currentStep: number; onJump: (step: number) => void }) {
  return (
    <nav className="flex gap-1.5 overflow-x-auto px-5 pb-1 sm:px-8 lg:hidden" aria-label="Mobile intake progress">
      {stepItems.map((item, index) => (
        <button
          type="button"
          key={item.label}
          data-testid={`button-mobile-step-${index}`}
          disabled={index > currentStep}
          onClick={() => onJump(index)}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-bold transition-colors ${index === currentStep ? 'border-secondary bg-secondary text-secondary-foreground' : index < currentStep ? 'border-primary/30 bg-primary/8 text-primary' : 'border-border bg-card/40 text-muted-foreground/50'}`}
        >
          <span className="font-mono text-[9px]">{String(index + 1).padStart(2, '0')}</span>
          {item.label}
          {index < currentStep && <Check size={12} strokeWidth={3} />}
        </button>
      ))}
    </nav>
  );
}

function StepContent({
  step,
  intake,
  updateIntake,
  skillInput,
  setSkillInput,
  addSkill,
  handleSkillKeyDown,
  toggleInterest,
  onEdit,
}: {
  step: number;
  intake: Intake;
  updateIntake: (patch: Partial<Intake>) => void;
  skillInput: string;
  setSkillInput: (value: string) => void;
  addSkill: (value: string) => void;
  handleSkillKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  toggleInterest: (interest: string) => void;
  onEdit: (step: number) => void;
}) {
  if (step === 0) {
    return (
      <section className="flow-panel" key="education">
        <StepEyebrow number="01" label="The basics" />
        <h2 className="mt-5 max-w-[640px] font-serif text-[clamp(3.2rem,8vw,5.9rem)] leading-[.88] tracking-[-0.045em] text-secondary">Start with where you are.</h2>
        <p className="mt-6 max-w-[510px] text-[15px] leading-7 text-muted-foreground">No perfect plan required. Tell us what you’re studying and we’ll meet you there.</p>
        <div className="mt-10 grid max-w-[650px] gap-5 sm:mt-12 sm:grid-cols-[1fr_1fr]">
          <Field label="What are you studying?" hint="Your degree, program, or focus">
            <input data-testid="input-program" value={intake.program} onChange={(event) => updateIntake({ program: event.target.value })} placeholder="e.g. Environmental science" className="field-input" />
          </Field>
          <Field label="What level are you in?" hint="Choose the closest match">
            <select data-testid="select-level" value={intake.level} onChange={(event) => updateIntake({ level: event.target.value })} className="field-input appearance-none">
              <option value="">Select level</option>
              <option value="First year">First year</option>
              <option value="Second year">Second year</option>
              <option value="Third year">Third year</option>
              <option value="Final year">Final year</option>
              <option value="Graduate student">Graduate student</option>
              <option value="Recently graduated">Recently graduated</option>
            </select>
          </Field>
          <Field label="Expected graduation" hint="A year is plenty">
            <input data-testid="input-graduation-year" value={intake.year} onChange={(event) => updateIntake({ year: event.target.value })} placeholder="e.g. 2027" inputMode="numeric" maxLength={4} className="field-input" />
          </Field>
        </div>
        <SideNote text="Your answers stay focused on your goals — there’s no résumé scoring here." />
      </section>
    );
  }

  if (step === 1) {
    return (
      <section className="flow-panel" key="skills">
        <StepEyebrow number="02" label="Your toolkit" />
        <h2 className="mt-5 max-w-[640px] font-serif text-[clamp(3.2rem,8vw,5.9rem)] leading-[.88] tracking-[-0.045em] text-secondary">Name what you can do.</h2>
        <p className="mt-6 max-w-[520px] text-[15px] leading-7 text-muted-foreground">Class projects, side quests, part-time jobs — it all counts. Add the skills you reach for most.</p>
        <div className="mt-10 max-w-[680px] sm:mt-12">
          <div data-testid="container-skill-entry" className="tag-input-wrap" onClick={() => document.getElementById('skill-entry')?.focus()}>
            {intake.skills.map((skill, index) => (
              <span data-testid={`tag-skill-${index}`} key={skill} className="tag-pill">
                {skill}
                <button type="button" data-testid={`button-remove-skill-${index}`} aria-label={`Remove ${skill}`} onClick={() => updateIntake({ skills: intake.skills.filter((item) => item !== skill) })} className="tag-remove"><X size={13} /></button>
              </span>
            ))}
            <input id="skill-entry" data-testid="input-skill" value={skillInput} onChange={(event) => setSkillInput(event.target.value)} onKeyDown={handleSkillKeyDown} placeholder={intake.skills.length ? 'Add another skill' : 'Type a skill and press Enter'} className="min-w-[180px] flex-1 bg-transparent py-2 text-sm font-semibold outline-none placeholder:text-muted-foreground/65" />
          </div>
          <div className="mt-6">
            <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Try one of these</p>
            <div className="flex flex-wrap gap-2">
              {skillSuggestions.map((skill) => (
                <button type="button" data-testid={`button-suggest-skill-${skill.toLowerCase().replaceAll(' ', '-')}`} key={skill} onClick={() => addSkill(skill)} disabled={intake.skills.includes(skill)} className="suggestion-chip disabled:cursor-default disabled:opacity-40">
                  <span className="text-primary">+</span>{skill}
                </button>
              ))}
            </div>
          </div>
        </div>
        <SideNote text="A useful signal beats a long list. Three to six skills is a great place to begin." />
      </section>
    );
  }

  if (step === 2) {
    return (
      <section className="flow-panel" key="interests">
        <StepEyebrow number="03" label="Your signal" />
        <h2 className="mt-5 max-w-[640px] font-serif text-[clamp(3.2rem,8vw,5.9rem)] leading-[.88] tracking-[-0.045em] text-secondary">Follow the tug.</h2>
        <p className="mt-6 max-w-[530px] text-[15px] leading-7 text-muted-foreground">Pick the topics or kinds of problems you would happily spend a free afternoon exploring.</p>
        <div className="mt-10 grid max-w-[700px] grid-cols-1 gap-2.5 sm:mt-12 sm:grid-cols-2">
          {interestOptions.map((interest, index) => {
            const selected = intake.interests.includes(interest);
            return (
              <button type="button" data-testid={`button-interest-${index}`} key={interest} onClick={() => toggleInterest(interest)} className={`interest-card ${selected ? 'interest-card-selected' : ''}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs transition-all ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-transparent'}`}><Check size={14} strokeWidth={3} /></span>
                <span className="text-left text-sm font-bold">{interest}</span>
              </button>
            );
          })}
        </div>
        <Field label="Want to add a little context?" hint="Optional — a project, question, or rabbit hole">
          <textarea data-testid="textarea-interest-details" value={intake.interestDetails} onChange={(event) => updateIntake({ interestDetails: event.target.value })} placeholder="I keep coming back to..." rows={3} className="field-input resize-none leading-6" />
        </Field>
      </section>
    );
  }

  if (step === 3) {
    return (
      <section className="flow-panel" key="direction">
        <StepEyebrow number="04" label="A north star" />
        <h2 className="mt-5 max-w-[680px] font-serif text-[clamp(3.2rem,8vw,5.9rem)] leading-[.88] tracking-[-0.045em] text-secondary">What sounds worth trying?</h2>
        <p className="mt-6 max-w-[530px] text-[15px] leading-7 text-muted-foreground">It can be a specific job, a broad field, or simply the type of impact you want to make. We’ll help sharpen it.</p>
        <div className="mt-10 max-w-[700px] sm:mt-12">
          <textarea data-testid="textarea-career" value={intake.career} onChange={(event) => updateIntake({ career: event.target.value })} placeholder="e.g. I’d love to design tools that make climate data easier to understand." rows={5} className="field-input resize-none text-[16px] leading-7" />
          <Field label="How much time can you make each week?" hint="Choose a pace you can keep">
            <select data-testid="select-study-time" value={intake.studyTime} onChange={(event) => updateIntake({ studyTime: event.target.value })} className="field-input appearance-none">
              <option value="">Select weekly time</option>
              <option value="2–3 hours">2–3 hours</option>
              <option value="4–6 hours">4–6 hours</option>
              <option value="7–10 hours">7–10 hours</option>
              <option value="10+ hours">10+ hours</option>
            </select>
          </Field>
          <div className="mt-6">
            <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Or start with a role</p>
            <div className="flex flex-wrap gap-2">
              {roleSuggestions.map((role) => (
                <button type="button" data-testid={`button-suggest-role-${role.toLowerCase().replaceAll(' ', '-')}`} key={role} onClick={() => updateIntake({ career: role })} className={`suggestion-chip ${intake.career === role ? 'suggestion-chip-active' : ''}`}>{role}<ChevronRight size={13} /></button>
              ))}
            </div>
          </div>
        </div>
        <SideNote text="You can change your mind later. Direction is a hypothesis, not a contract." />
      </section>
    );
  }

  return <ReviewStep intake={intake} onEdit={onEdit} />;
}

function ReviewStep({ intake, onEdit }: { intake: Intake; onEdit: (step: number) => void }) {
  return (
    <section className="flow-panel" key="review">
      <StepEyebrow number="05" label="The snapshot" />
      <h2 className="mt-5 max-w-[650px] font-serif text-[clamp(3.2rem,8vw,5.9rem)] leading-[.88] tracking-[-0.045em] text-secondary">This is your signal.</h2>
      <p className="mt-6 max-w-[530px] text-[15px] leading-7 text-muted-foreground">Take a look before we turn these threads into a few thoughtful next moves.</p>
      <div className="mt-9 grid max-w-[730px] gap-3 sm:mt-11">
        <ReviewCard index={0} label="Education" value={`${intake.program} · ${intake.level}`} detail={`Graduating ${intake.year}`} onEdit={onEdit} />
        <ReviewCard index={1} label="Skills" value={intake.skills.join(' · ')} detail={`${intake.skills.length} ${intake.skills.length === 1 ? 'skill' : 'skills'} added`} onEdit={onEdit} />
        <ReviewCard index={2} label="Interests" value={intake.interests.join(' · ')} detail={intake.interestDetails || 'No extra context added'} onEdit={onEdit} />
        <ReviewCard index={3} label="Direction" value={intake.career} detail={`${intake.studyTime} per week · Your starting point, not a final answer`} onEdit={onEdit} />
      </div>
    </section>
  );
}

function ReviewCard({ index, label, value, detail, onEdit }: { index: number; label: string; value: string; detail: string; onEdit: (step: number) => void }) {
  return (
    <div data-testid={`card-review-${label.toLowerCase()}`} className="group flex items-start justify-between gap-4 rounded-2xl border border-border bg-card/75 p-4 shadow-[0_2px_0_hsl(228_35%_19%/0.04)] transition-shadow hover:shadow-md sm:p-5">
      <div className="min-w-0">
        <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.17em] text-primary">{label}</p>
        <p data-testid={`text-review-${label.toLowerCase()}`} className="truncate text-sm font-bold text-secondary sm:text-[15px]">{value}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>
      </div>
      <button type="button" data-testid={`button-edit-${label.toLowerCase()}`} onClick={() => onEdit(index)} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary">Edit</button>
    </div>
  );
}

function CompletionState({ intake, onRestart }: { intake: Intake; onRestart: () => void }) {
  const roadmap = buildRoadmap(intake);
  const target = formatTarget(intake.career);

  return (
    <div className="noise min-h-[100dvh] flow-shell paper-grid">
      <main className="mx-auto flex min-h-[100dvh] w-full max-w-[1080px] flex-col px-5 py-6 sm:px-8 sm:py-10 lg:px-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-secondary text-accent"><Sparkles size={19} strokeWidth={2.4} /></div>
            <span className="font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-secondary">pathfinder</span>
          </div>
          <span className="rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">Intake complete</span>
        </header>
        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1fr_390px] lg:gap-20">
          <section className="float-in">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-secondary shadow-[5px_5px_0_hsl(37_88%_58%/0.25)]"><Check size={27} strokeWidth={2.5} /></div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">A good place to begin</p>
            <h1 className="mt-5 max-w-[620px] font-serif text-[clamp(4rem,9vw,7.4rem)] leading-[.84] tracking-[-0.05em] text-secondary">Your next move has a shape now.</h1>
            <p className="mt-8 max-w-[560px] text-[15px] leading-7 text-muted-foreground">Your {intake.studyTime} weekly rhythm is matched to a path from {intake.program} toward {target}, using the skills you already have and the interests you want to follow.</p>
            <button type="button" data-testid="button-start-exploring" onClick={() => document.getElementById('roadmap-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="mt-9 inline-flex items-center gap-3 rounded-full bg-secondary px-6 py-3.5 text-sm font-bold text-secondary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary">
              See what comes next <ArrowRight size={17} />
            </button>
          </section>
          <aside id="roadmap-card" data-testid="card-career-roadmap" className="float-in delay-2 rounded-[28px] border border-border bg-card/85 p-6 shadow-[0_20px_50px_hsl(228_35%_19%/0.08)] sm:p-7">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-primary">Your first roadmap</p>
                <h2 className="mt-2 max-w-[280px] font-serif text-3xl leading-[.95] tracking-[-0.03em] text-secondary">{target}</h2>
                <p className="mt-2 text-xs text-muted-foreground">{roadmap.trackName} · {intake.studyTime} each week</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-primary"><Compass size={19} /></div>
            </div>
            <div className="mb-7 rounded-2xl border border-primary/15 bg-muted/45 p-4">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.17em] text-primary">Priority gaps</p>
              <p data-testid="text-missing-skills" className="mt-2 text-sm font-bold leading-6 text-secondary">
                {roadmap.missingSkills.length
                  ? roadmap.missingSkills.map((skill, index) => `${index + 1}. ${skill.name}`).join('  ·  ')
                  : 'No core gaps surfaced — focus on proof and feedback.'}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">Ranked against the skills most useful for your target direction.</p>
            </div>
            <div className="space-y-0">
              {roadmap.steps.map((item, index) => (
                <PreviewItem key={item.number} number={item.number} title={item.title} detail={item.detail} last={index === roadmap.steps.length - 1} />
              ))}
            </div>
            <div className="mt-7 border-t border-border pt-5">
              <p className="text-xs leading-5 text-muted-foreground">Built from your {intake.skills.length} skills, {intake.interests.length} interests, and the direction you named — not a generic quiz result.</p>
            </div>
          </aside>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5 text-xs text-muted-foreground">
          <span>Built for curious students.</span>
          <button type="button" data-testid="button-start-over" onClick={onRestart} className="inline-flex items-center gap-2 font-bold text-secondary transition-colors hover:text-primary"><RotateCcw size={14} /> Start over</button>
        </footer>
      </main>
    </div>
  );
}

function formatTarget(career: string) {
  const trimmed = career.trim();
  if (trimmed.length <= 38) return trimmed;
  return `${trimmed.slice(0, 38).trimEnd()}…`;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').trim();
}

function skillMatchesRequirement(skill: string, requirement: CareerRequirement) {
  const normalizedSkill = normalizeText(skill);
  return requirement.aliases.some((alias) => {
    const normalizedAlias = normalizeText(alias);
    return normalizedSkill === normalizedAlias || normalizedSkill.includes(normalizedAlias) || normalizedAlias.includes(normalizedSkill);
  });
}

function findCareerTrack(intake: Intake): CareerTrack {
  const targetText = normalizeText(intake.career);
  const contextText = normalizeText(`${intake.program} ${intake.interests.join(' ')}`);
  let bestTrack: CareerTrack | undefined;
  let bestScore = 0;

  for (const track of careerTracks) {
    const targetMatches = track.keywords.filter((keyword) => targetText.includes(normalizeText(keyword))).length;
    const contextMatches = track.interests.filter((interest) => contextText.includes(normalizeText(interest))).length;
    const score = targetMatches * 5 + contextMatches * 2;
    if (score > bestScore) {
      bestScore = score;
      bestTrack = track;
    }
  }

  if (bestTrack) return bestTrack;

  const target = formatTarget(intake.career);
  return {
    name: `${target} pathway`,
    keywords: [],
    interests: [],
    requirements: [
      { name: `Core tools for ${target}`, aliases: ['__unmatched_core_tools__'], why: 'to work with the tools this direction expects' },
      { name: `Proof of work in ${target}`, aliases: ['__unmatched_proof_of_work__'], why: 'to show how you think through a real problem in this field' },
      { name: `Feedback from ${target} practitioners`, aliases: ['__unmatched_practitioner_feedback__'], why: 'to test your assumptions against people already doing the work' },
    ],
    experiment: (student) => `find one real problem in ${student.interests[0]?.toLowerCase() || student.program.toLowerCase()} that this career could help solve and draft a small solution`,
  };
}

function practiceTask(requirement: CareerRequirement, intake: Intake, track: CareerTrack) {
  const name = requirement.name.toLowerCase();
  const interest = intake.interests[0]?.toLowerCase() || 'a topic you care about';

  if (name.includes('sql')) return `write five queries against a small dataset about ${interest}`;
  if (name.includes('data cleaning')) return `clean a small ${interest} dataset and write down three quality checks`;
  if (name.includes('statistics')) return `run one simple comparison and explain what the result does and does not prove`;
  if (name.includes('data storytelling')) return `turn one finding about ${interest} into a single chart with a written takeaway`;
  if (name.includes('user research') || name.includes('interview')) return `write an interview guide and speak with one person about ${interest}`;
  if (name.includes('synthesis')) return 'cluster your notes into themes and write the strongest insight in one sentence';
  if (name.includes('interaction')) return `map the steps in one ${interest} experience and prototype the riskiest moment`;
  if (name.includes('visual')) return `make two visual directions for a ${interest} idea and ask someone which is clearer`;
  if (name.includes('portfolio')) return `write a short case study showing your decision, evidence, and outcome`;
  if (name.includes('programming')) return `complete one small coding exercise connected to ${interest}`;
  if (name.includes('git')) return 'make a small change on a branch, open a pull request, and review your own diff';
  if (name.includes('testing')) return 'add tests for the riskiest behavior in a small project and fix one failing case';
  if (name.includes('shipping')) return 'put a small working project in front of one person and record what they tried';
  if (name.includes('domain')) return `read two credible sources about ${interest} and explain the important context in your own words`;
  if (name.includes('communicating')) return `make a five-minute explainer about ${interest} for someone outside ${track.name}`;
  if (name.includes('copywriting')) return `write two versions of a message about ${interest} and get feedback from a real reader`;
  if (name.includes('audience')) return `talk to two people who care about ${interest} and compare what they actually need`;
  if (name.includes('content')) return `outline a small three-part content plan for a ${interest} idea`;
  if (name.includes('measuring')) return 'define one success metric and one simple way to compare two approaches';
  return `complete a small ${track.name.toLowerCase()} exercise tied to ${interest}`;
}

function buildRoadmap(intake: Intake): PersonalizedRoadmap {
  const track = findCareerTrack(intake);
  const target = formatTarget(intake.career);
  const interests = intake.interests.length ? intake.interests.slice(0, 2).join(' + ') : 'the questions you care about';
  const strengths = intake.skills.length ? intake.skills.slice(0, 2).join(' + ') : 'your current strengths';
  const education = `${intake.level} in ${intake.program}, graduating ${intake.year}`;
  const knownSkills = intake.skills.map(normalizeText);
  const missingSkills = track.requirements.filter((requirement) => !knownSkills.some((skill) => skill && skillMatchesRequirement(skill, requirement)));
  const paceByTime: Record<string, string> = {
    '2–3 hours': 'two focused 60–90 minute sessions',
    '4–6 hours': 'three focused sessions of 90–120 minutes',
    '7–10 hours': 'four focused sessions of around two hours',
    '10+ hours': 'four deep-work sessions plus a short review',
  };
  const pace = paceByTime[intake.studyTime] || 'a small, repeatable weekly block';
  const priorityOne = missingSkills[0];
  const priorityTwo = missingSkills[1];
  const priorityThree = missingSkills[2];
  const currentFocus = priorityOne?.name || 'your strongest current skill';

  const steps: RoadmapStep[] = [
    {
      number: '01',
      title: `Week 1 · ${currentFocus}`,
      detail: priorityOne
        ? `${priorityOne.why}. Use ${pace} to ${practiceTask(priorityOne, intake, track)}.`
        : `You already cover the core signals for this track. Use ${pace} to turn ${strengths} into one small, finished example.`,
    },
    {
      number: '02',
      title: `Week 2 · ${priorityTwo?.name || 'Apply what you learned'}`,
      detail: priorityTwo
        ? `Priority 2: ${priorityTwo.why}. Use ${pace} to ${practiceTask(priorityTwo, intake, track)}.`
        : `Connect ${strengths} to ${interests.toLowerCase()} and use ${pace} to improve the example from week 1 with one round of feedback.`,
    },
    {
      number: '03',
      title: `Week 3 · ${priorityThree?.name || 'Test the fit'}`,
      detail: priorityThree
        ? `Priority 3: ${priorityThree.why}. Use ${pace} to ${practiceTask(priorityThree, intake, track)}.`
        : `Use ${pace} to test your work with one person who understands ${target} and note what you would change.`,
    },
    {
      number: '04',
      title: 'Week 4 · Make it visible',
      detail: `Use your ${education} perspective to ${track.experiment(intake)}. Tie it back to “${target},” then capture the result as proof of work.`,
    },
  ];

  return { trackName: track.name, missingSkills, steps };
}

function PreviewItem({ number, title, detail, last = false }: { number: string; title: string; detail: string; last?: boolean }) {
  return (
    <div className={`relative flex gap-3 pb-5 ${last ? '' : 'mb-1'}`}>
      {!last && <span className="absolute left-[11px] top-6 h-full w-px bg-border" />}
      <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary bg-card font-mono text-[9px] text-primary">{number}</span>
      <div className="pt-0.5">
        <p className="text-sm font-bold text-secondary">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function StepEyebrow({ number, label }: { number: string; label: string }) {
  return <div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-primary"><span>{number}</span><span className="h-px w-8 bg-primary/35" /><span>{label}</span></div>;
}

function Field({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <label className="mt-7 block first:mt-0">
      <span className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-bold text-secondary">{label}</span>
        <span className="text-[10px] text-muted-foreground">{hint}</span>
      </span>
      {children}
    </label>
  );
}

function SideNote({ text }: { text: string }) {
  return <p className="mt-12 max-w-[460px] border-l-2 border-accent pl-4 text-xs leading-5 text-muted-foreground sm:mt-16">{text}</p>;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;