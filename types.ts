
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface LearningOutcome {
  level: 'Knowledge' | 'Comprehension' | 'Application' | 'Analysis' | 'Synthesis' | 'Evaluation';
  outcome: string;
}

export interface KeyConcept {
  concept: string;
  explanation: string;
}

export interface Resource {
  title: string;
  author?: string;
  url?: string;
  type: 'Reading' | 'Video' | 'Tool' | 'Dataset';
  description: string;
}

export interface Assignment {
  title: string;
  type: 'Quiz' | 'Lab' | 'Project' | 'Essay' | 'Test';
  deliverable: string;
  sampleQuestions?: string[];
}

export interface Module {
  title: string;
  duration: string;
  objectives: string[];
  topics: string[];
  keyConcepts: KeyConcept[];
  pedagogicalStrategy: string;
  resources: Resource[];
  assignments: Assignment[];
}

export interface AssessmentMethod {
  type: string;
  description: string;
  weight: string;
  sampleConcepts: string[];
}

export interface IndustryAlignment {
  skills: string[];
  jobRoles: string[];
  relevanceScore: number;
  reasoning: string;
}

export interface Curriculum {
  id: string;
  originalId: string;
  version: number;
  courseTitle: string;
  description: string;
  targetAudience: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  totalDuration: string;
  pedagogicalPhilosophy: string;
  learningOutcomes: LearningOutcome[];
  modules: Module[];
  assessments: AssessmentMethod[];
  industryAlignment: IndustryAlignment;
  createdAt: string;
  modelUsed: string;
  rating?: number;
  feedback?: string;
}

export type ViewState = 'dashboard' | 'create' | 'view' | 'saved';

export interface CurriculumFormData {
  title: string;
  subject: string;
  level: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  goals: string;
  industryFocus: string;
  model: 'gemini-3-flash-preview' | 'gemini-3-pro-preview';
  sourceImages?: string[]; // base64 strings
}
