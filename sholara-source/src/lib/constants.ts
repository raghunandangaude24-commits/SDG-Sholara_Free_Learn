export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "History",
  "Geography",
  "Economics",
  "General Studies",
] as const;

export const GRADE_LEVELS = [
  "Primary",
  "Middle School",
  "High School",
  "Undergraduate",
  "Graduate",
] as const;

export const RESOURCE_TYPES = [
  "Notes",
  "Textbook",
  "Worksheet",
  "Video",
  "Past Paper",
  "Cheat Sheet",
  "Other",
] as const;

export type Subject = (typeof SUBJECTS)[number];
export type GradeLevel = (typeof GRADE_LEVELS)[number];
export type ResourceType = (typeof RESOURCE_TYPES)[number];
