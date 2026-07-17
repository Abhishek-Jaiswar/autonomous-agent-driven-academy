export interface StartInterviewRequest {
  role: string;
  candidateIntro?: string;
}

export interface SubmitAnswerRequest {
  interviewId: string;
  answer: string;
}

export interface SubmitAnswerResponse {
  interviewId: string;
  question: string;
  questionCount: number;
}
