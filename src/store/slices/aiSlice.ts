import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AiState {
  isAnalyzing: boolean;
  progress: number;
  statusMessage: string;
  completeness: {
    is_complete: boolean;
    missing_fields: string[];
    score: number;
  } | null;
  risk: {
    level: string;
    reason: string;
  } | null;
  summary: string | null;
  recommendations: string[];
  error: string | null;
}

const initialState: AiState = {
  isAnalyzing: false,
  progress: 0,
  statusMessage: 'Upload a complaint document or paste text above.',
  completeness: null,
  risk: null,
  summary: null,
  recommendations: [],
  error: null,
};

export const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    startAnalysis: (state) => {
      state.isAnalyzing = true;
      state.progress = 10;
      state.statusMessage = 'Initializing AI models...';
      state.error = null;
    },
    updateProgress: (state, action: PayloadAction<{ progress: number; message: string }>) => {
      state.progress = action.payload.progress;
      state.statusMessage = action.payload.message;
    },
    analysisComplete: (state, action: PayloadAction<{
      completeness: any;
      risk: any;
      summary: string;
      recommendations: string[];
    }>) => {
      state.isAnalyzing = false;
      state.progress = 100;
      state.statusMessage = 'Analysis complete. Please review the extracted data.';
      state.completeness = action.payload.completeness;
      state.risk = action.payload.risk;
      state.summary = action.payload.summary;
      state.recommendations = action.payload.recommendations;
    },
    analysisFailed: (state, action: PayloadAction<string>) => {
      state.isAnalyzing = false;
      state.progress = 0;
      state.statusMessage = 'Analysis failed.';
      state.error = action.payload;
    },
    resetAiState: () => initialState,
  },
});

export const { startAnalysis, updateProgress, analysisComplete, analysisFailed, resetAiState } = aiSlice.actions;
export default aiSlice.reducer;
