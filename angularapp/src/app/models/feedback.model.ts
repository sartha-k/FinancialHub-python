import { User } from './user.model';

export interface Feedback {
  feedbackId?: number;
  feedbackText: string;
  feedbackDate?: string;
  user?: User;
}