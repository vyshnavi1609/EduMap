
import { GoogleGenAI, Type } from "@google/genai";
import { Curriculum, CurriculumFormData } from "../types";

export const generateCurriculum = async (formData: CurriculumFormData): Promise<Curriculum> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  
  const textPart = {
    text: `
    Generate a high-fidelity academic curriculum for:
    - Course Title: ${formData.title}
    - Subject Area: ${formData.subject}
    - Academic Level: ${formData.level}
    - Course Difficulty (Hardness): ${formData.difficulty}
    - Target Duration: ${formData.duration}
    - Core Goals: ${formData.goals}
    - Industry Focus: ${formData.industryFocus}

    CRITICAL INSTRUCTION ON DIFFICULTY (${formData.difficulty}):
    - If Beginner: Use foundational language, assume no prior knowledge, focus on core definitions and simple applications.
    - If Intermediate: Assume basic knowledge, focus on integration of concepts, case studies, and practical implementation.
    - If Advanced: Assume mastery of basics, focus on theoretical depth, research-grade problems, complex system design, and critical evaluation.

    ATTACHED SOURCE DATA: I have provided ${formData.sourceImages?.length || 0} images of a syllabus or book. 
    Strictly align the generated content with these images if provided.

    CRITICAL REQUIREMENTS:
    1. TEXTBOOKS: For "Reading" resources, specify "title" AND "author". Ensure these are real or highly probable academic texts.
    2. VIDEOS: Suggest popular YouTube videos or educational series titles for "Video" resources.
    3. ASSESSMENTS: For each assessment type, include a "sampleConcepts" array containing 3-5 key concepts tested.
    4. MODULE ASSIGNMENTS: Include 2-3 "sampleQuestions" for the quizzes or tests within modules.
    5. DURATION: Each module MUST have a specific duration (e.g. "5 Hours").
    6. OVERVIEW: Provide a comprehensive description that covers the 'What', 'Why', and 'How' of the course.
  `};

  const imageParts = (formData.sourceImages || []).map(base64 => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: base64.split(',')[1] || base64
    }
  }));

  const response = await ai.models.generateContent({
    model: formData.model,
    contents: { parts: [textPart, ...imageParts] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          courseTitle: { type: Type.STRING },
          description: { type: Type.STRING },
          targetAudience: { type: Type.STRING },
          totalDuration: { type: Type.STRING },
          pedagogicalPhilosophy: { type: Type.STRING },
          learningOutcomes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.STRING },
                outcome: { type: Type.STRING }
              },
              required: ["level", "outcome"]
            }
          },
          modules: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                duration: { type: Type.STRING },
                pedagogicalStrategy: { type: Type.STRING },
                objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                keyConcepts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { concept: { type: Type.STRING }, explanation: { type: Type.STRING } },
                    required: ["concept", "explanation"]
                  }
                },
                resources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      author: { type: Type.STRING },
                      url: { type: Type.STRING },
                      type: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ["title", "type", "description"]
                  }
                },
                assignments: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      type: { type: Type.STRING },
                      deliverable: { type: Type.STRING },
                      sampleQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["title", "type", "deliverable"]
                  }
                }
              },
              required: ["title", "duration", "objectives", "topics", "keyConcepts", "resources", "assignments"]
            }
          },
          assessments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                weight: { type: Type.STRING },
                sampleConcepts: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["type", "description", "weight", "sampleConcepts"]
            }
          },
          industryAlignment: {
            type: Type.OBJECT,
            properties: {
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              jobRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
              relevanceScore: { type: Type.NUMBER },
              reasoning: { type: Type.STRING }
            },
            required: ["skills", "relevanceScore"]
          }
        },
        required: ["courseTitle", "description", "modules", "assessments"]
      }
    }
  });

  const rawJson = response.text || "{}";
  const parsedData = JSON.parse(rawJson);
  const id = crypto.randomUUID();
  
  return {
    ...parsedData,
    id,
    originalId: id,
    version: 1,
    difficulty: formData.difficulty,
    createdAt: new Date().toISOString(),
    modelUsed: formData.model
  };
};
