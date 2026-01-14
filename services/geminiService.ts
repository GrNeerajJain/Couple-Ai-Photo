
import { GoogleGenAI } from "@google/genai";
import { ImageData, AspectRatio, GenerationStyle, DetailLevel, PoseVariation, CameraAngle } from "../types";

/**
 * Checks if the user has a selected API key.
 */
export const ensureApiKey = async (force: boolean = false): Promise<boolean> => {
  // @ts-ignore
  if (typeof window.aistudio === 'undefined') return true;
  // @ts-ignore
  const hasKey = await window.aistudio.hasSelectedApiKey();
  if (!hasKey && force) {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    return true;
  }
  return hasKey;
};

export const generateCouplePhoto = async (
  person1: ImageData,
  person2: ImageData,
  reference: ImageData,
  aspectRatio: AspectRatio,
  style: GenerationStyle,
  detailLevel: DetailLevel,
  poseVariation: PoseVariation,
  cameraAngle: CameraAngle,
  customPrompt?: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const styleDescriptions: Record<GenerationStyle, string> = {
    realistic: "photorealistic, natural skin textures, 8k resolution, professional photography",
    cinematic: "cinematic lighting, dramatic shadows, wide-angle lens, movie-like atmosphere",
    artistic: "stylized illustration, painterly textures, creative brushstrokes, expressive colors",
    vintage: "classic film grain, warm nostalgic tones, 35mm film aesthetic, slight chromatic aberration",
    anime: "modern high-quality anime style, vibrant cel-shaded aesthetics, clean line art"
  };

  const detailDescriptions: Record<DetailLevel, string> = {
    default: "standard high-quality model optimization",
    low: "focused on general shapes and composition",
    medium: "balanced detail and clarity across the scene",
    high: "extreme attention to minute details, textures, and crisp edges"
  };

  const poseDescriptions: Record<PoseVariation, string> = {
    default: "Automatically balance pose accuracy with a natural and aesthetic appearance.",
    exact: "Follow the reference image pose and positioning strictly.",
    relaxed: "Use the reference image as a base, but make the pose look more relaxed, natural, and candid.",
    dynamic: "Enhance the movement in the pose, making it more expressive and dynamic than the reference."
  };

  const angleDescriptions: Record<CameraAngle, string> = {
    default: "Match the camera angle of the reference image.",
    'eye-level': "Shoot from a direct eye-level perspective.",
    'low-angle': "Position the camera low, looking up at the couple for a heroic or monumental feel.",
    'high-angle': "Position the camera high, looking down at the couple.",
    'wide-shot': "Use a wide-angle perspective to capture more of the environment.",
    'close-up': "Focus closely on the couple's upper bodies and expressions."
  };

  const prompt = [
    `Create a high-quality photograph of the two individuals from the first and second images.`,
    `Reference scene: Recreate the setting and composition shown in the third image.`,
    `Pose instruction: ${poseDescriptions[poseVariation]}`,
    `Camera angle: ${angleDescriptions[cameraAngle]}`,
    `Maintain the distinct facial features and physical characteristics of both people.`,
    `The overall style should be ${styleDescriptions[style]}.`,
    `Ensure a ${detailDescriptions[detailLevel]} in the final output.`,
    customPrompt ? `Additional instructions: ${customPrompt}` : ""
  ].filter(Boolean).join(" ");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: person1.base64,
              mimeType: person1.mimeType,
            },
          },
          {
            inlineData: {
              data: person2.base64,
              mimeType: person2.mimeType,
            },
          },
          {
            inlineData: {
              data: reference.base64,
              mimeType: reference.mimeType,
            },
          },
          {
            text: prompt
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No image generated in the response.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    throw error;
  }

  throw new Error("Could not find image data in response.");
};

export const refineGeneratedPhoto = async (
  currentImageBase64: string,
  refinementPrompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const base64Data = currentImageBase64.includes(',') 
    ? currentImageBase64.split(',')[1] 
    : currentImageBase64;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/png',
            },
          },
          {
            text: `Apply this edit to the image: ${refinementPrompt}. Example edits include "Add a retro filter", "Remove the person in the background", or "Change background to a snowy mountain". Keep the core identities of the subjects the same.`
          },
        ],
      }
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("Refinement failed: No output received.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    throw error;
  }

  throw new Error("Refinement failed: Could not find image data in response.");
};
