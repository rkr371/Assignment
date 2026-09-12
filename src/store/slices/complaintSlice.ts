import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ComplaintState {
  customer_name: string | null;
  product_name: string | null;
  batch_number: string | null;
  complaint_category: string | null;
  complaint_description: string | null;
  date_received: string | null;
  affected_quantity: string | null;
  complaint_source: string | null;
  severity: string | null;
}

const initialState: ComplaintState = {
  customer_name: null,
  product_name: null,
  batch_number: null,
  complaint_category: null,
  complaint_description: null,
  date_received: null,
  affected_quantity: null,
  complaint_source: null,
  severity: null,
};

export const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    updateField: (state, action: PayloadAction<{ field: keyof ComplaintState; value: string | null }>) => {
      state[action.payload.field] = action.payload.value;
    },
    populateFromAI: (state, action: PayloadAction<Partial<ComplaintState>>) => {
      return { ...state, ...action.payload };
    },
    resetComplaint: () => initialState,
  },
});

export const { updateField, populateFromAI, resetComplaint } = complaintSlice.actions;
export default complaintSlice.reducer;
