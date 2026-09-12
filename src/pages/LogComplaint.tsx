import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Input, Textarea, Label, Badge } from '@/src/components/ui/Forms';
import { Button } from '@/src/components/ui/Button';
import { UploadCloud, FileText, Send, Sparkles, RefreshCcw, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { updateField, populateFromAI, resetComplaint } from '@/src/store/slices/complaintSlice';
import { startAnalysis, analysisComplete, analysisFailed, resetAiState } from '@/src/store/slices/aiSlice';
import { analyzeComplaint, saveComplaint } from '@/src/services/api';

export const LogComplaint = () => {
  const dispatch = useAppDispatch();
  const complaintState = useAppSelector((state) => state.complaint);
  const aiState = useAppSelector((state) => state.ai);
  
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = (field: keyof typeof complaintState, value: string) => {
    dispatch(updateField({ field, value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText && !selectedFile) return;

    dispatch(startAnalysis());
    try {
      const result = await analyzeComplaint(inputText, selectedFile);
      
      // Update form fields with extracted data
      if (result.extracted_complaint) {
        dispatch(populateFromAI({
          customer_name: result.extracted_complaint.customer_name || '',
          product_name: result.extracted_complaint.product_name || '',
          batch_number: result.extracted_complaint.batch_number || '',
          complaint_category: result.extracted_complaint.complaint_category || '',
          complaint_description: result.extracted_complaint.complaint_description || '',
          date_received: result.extracted_complaint.date_received || '',
          affected_quantity: result.extracted_complaint.affected_quantity || '',
          complaint_source: result.source_type === 'pdf' ? 'PDF Upload' : 'Manual Entry',
        }));
      }

      // Update AI metadata panel
      dispatch(analysisComplete({
        completeness: result.completeness_result,
        risk: result.risk_assessment,
        summary: result.summary || "No summary generated.",
        recommendations: result.recommendations || [],
      }));

    } catch (err: any) {
      dispatch(analysisFailed(err.message || "Failed to communicate with AI server"));
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...complaintState,
        ai_risk_level: aiState.risk?.risk_level,
        ai_risk_reason: aiState.risk?.risk_reason,
        ai_summary: aiState.summary,
        ai_completeness_score: aiState.completeness?.completeness_score,
      };
      
      const savedRecord = await saveComplaint(payload);
      alert(`Saved successfully! Complaint ID: ${savedRecord.complaint_number}`);
      
      // Reset after save
      dispatch(resetComplaint());
      dispatch(resetAiState());
      setInputText('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    }
  };

  const handleReset = () => {
    dispatch(resetComplaint());
    dispatch(resetAiState());
    setInputText('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-8rem)]">
      
      {/* LEFT PANEL: Log Customer Complaint Form */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Log Customer Complaint</h2>
            <p className="text-sm text-gray-500 mt-1">API & FDF Quality Assurance Module</p>
          </div>
          <Badge variant="warning" className="text-sm px-3 py-1 font-medium bg-orange-50 text-orange-600 border border-orange-200">Pending Triage</Badge>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {/* Section 1 */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-4">1. Origin & Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-gray-900 font-medium text-sm">Complaint Source</Label>
                <Input 
                  value={complaintState.complaint_source || ''}
                  onChange={(e) => handleFieldChange('complaint_source', e.target.value)}
                  placeholder={aiState.isAnalyzing ? "Extracting..." : "e.g., Email, Portal"} 
                  className="bg-white border-gray-200" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-900 font-medium text-sm">Customer Name</Label>
                <Input 
                  value={complaintState.customer_name || ''}
                  onChange={(e) => handleFieldChange('customer_name', e.target.value)}
                  placeholder={aiState.isAnalyzing ? "Extracting..." : "Customer or distributor name"} 
                  className="bg-white border-gray-200" 
                />
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-4">2. Product & Batch Identification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-gray-900 font-medium text-sm">Product Name</Label>
                <Input 
                  value={complaintState.product_name || ''}
                  onChange={(e) => handleFieldChange('product_name', e.target.value)}
                  placeholder={aiState.isAnalyzing ? "Extracting..." : "Name of API or product"} 
                  className="bg-white border-gray-200" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-900 font-medium text-sm">Batch/Lot Number</Label>
                <Input 
                  value={complaintState.batch_number || ''}
                  onChange={(e) => handleFieldChange('batch_number', e.target.value)}
                  placeholder={aiState.isAnalyzing ? "Extracting..." : "e.g., BATCH-123"} 
                  className="bg-white border-gray-200" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-900 font-medium text-sm">Quantity Affected</Label>
                <Input 
                  value={complaintState.affected_quantity || ''}
                  onChange={(e) => handleFieldChange('affected_quantity', e.target.value)}
                  placeholder={aiState.isAnalyzing ? "Extracting..." : "e.g., 5 drums, 20 kg"} 
                  className="bg-white border-gray-200" 
                />
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-4">3. Complaint Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-gray-900 font-medium text-sm">Complaint Category</Label>
                <Input 
                  value={complaintState.complaint_category || ''}
                  onChange={(e) => handleFieldChange('complaint_category', e.target.value)}
                  placeholder={aiState.isAnalyzing ? "Extracting..." : "e.g., Packaging, Efficacy"} 
                  className="bg-white border-gray-200" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-900 font-medium text-sm">Complaint Date</Label>
                <Input 
                  value={complaintState.date_received || ''}
                  onChange={(e) => handleFieldChange('date_received', e.target.value)}
                  type="date" 
                  className="bg-white border-gray-200" 
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-gray-900 font-medium text-sm">Detailed Complaint Description</Label>
                <Textarea 
                  value={complaintState.complaint_description || ''}
                  onChange={(e) => handleFieldChange('complaint_description', e.target.value)}
                  placeholder={aiState.isAnalyzing ? "Extracting..." : "Provide full details of the issue..."} 
                  className="bg-white border-gray-200 min-h-[100px] resize-y" 
                />
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-4">4. Initial Assessment & Priority</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-gray-900 font-medium text-sm">Initial Severity (Human Verified)</Label>
                <Input 
                  value={complaintState.severity || ''}
                  onChange={(e) => handleFieldChange('severity', e.target.value)}
                  placeholder="Set severity after reviewing AI assessment" 
                  className="bg-white border-gray-200" 
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/30 rounded-b-xl">
          <Button variant="outline" onClick={handleReset} className="text-gray-600 bg-white border-gray-200">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Reset Form
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" disabled={!complaintState.complaint_description || aiState.isAnalyzing}>
            <Save className="w-4 h-4 mr-2" />
            Save Complaint
          </Button>
        </div>
      </div>

      {/* RIGHT PANEL: AI Copilot Intake Assistant */}
      <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold tracking-tight text-gray-900">AI Complaint Intake Assistant</h2>
          </div>
          <Badge variant="outline" className="text-xs font-semibold text-blue-700 bg-blue-50 border-blue-200 tracking-wide">BETA</Badge>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Input Area (Only show if not analyzed yet) */}
          {!aiState.summary && !aiState.isAnalyzing && (
            <>
              {/* File Upload Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center text-center group cursor-pointer
                  ${selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-blue-400 bg-gray-50/50'}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf"
                  onChange={handleFileSelect}
                />
                {selectedFile ? (
                   <>
                     <CheckCircle2 className="w-8 h-8 text-green-500 mb-3" />
                     <p className="text-sm text-gray-900 font-medium">{selectedFile.name}</p>
                   </>
                ) : (
                   <>
                     <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" />
                     <p className="text-sm text-gray-900 font-medium">Drag & drop complaint document here</p>
                     <p className="text-sm text-gray-500 mt-1">or <span className="text-blue-600 font-medium">click to browse</span></p>
                   </>
                )}
              </div>

              <div className="flex items-center text-xs text-gray-400 font-medium uppercase tracking-widest before:flex-1 before:border-t before:border-gray-100 before:mr-4 after:flex-1 after:border-t after:border-gray-100 after:ml-4">
                OR
              </div>

              {/* Text Input Area */}
              <div className="space-y-3">
                <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Textarea 
                      placeholder="Paste Complaint Text / Email" 
                      className="min-h-[120px] pl-10 pt-3 border-gray-200 resize-y"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                </div>
              </div>

              <Button 
                onClick={handleAnalyze} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                disabled={!inputText && !selectedFile}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Document
              </Button>
            </>
          )}

          {/* Error State */}
          {aiState.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
               <strong>Error:</strong> {aiState.error}
            </div>
          )}
          
          {/* AI Progress area */}
          {aiState.isAnalyzing && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 tracking-wider uppercase">
                <span>Extraction Progress</span>
                <span className="text-gray-900">{aiState.progress}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${aiState.progress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{aiState.statusMessage}</p>
              </div>
            </div>
          )}

          {/* Results: AI Copilot Dashboard */}
          {!aiState.isAnalyzing && aiState.summary && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Risk Assessment Card */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">AI Risk Assessment</h3>
                  <Badge variant={
                    aiState.risk?.risk_level === 'CRITICAL' ? 'destructive' :
                    aiState.risk?.risk_level === 'HIGH' ? 'destructive' :
                    aiState.risk?.risk_level === 'MEDIUM' ? 'warning' : 'success'
                  }>
                    {aiState.risk?.risk_level || 'UNKNOWN'} RISK
                  </Badge>
                </div>
                <div className="p-4 text-sm text-gray-700">
                  {aiState.risk?.risk_reason}
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-2 text-sm text-gray-700">
                <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Executive Summary
                </h3>
                <p>{aiState.summary}</p>
              </div>

              {/* Recommendations */}
              {aiState.recommendations && aiState.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">Recommended Next Steps</h3>
                  <ul className="space-y-2">
                    {aiState.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mt-0.5">
                          {idx + 1}
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Completeness (Bonus Feature) */}
              {aiState.completeness && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">Completeness Check</h3>
                  <div className="flex items-center gap-4">
                     <div className="text-2xl font-bold text-gray-900">{aiState.completeness.score}%</div>
                     <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 rounded-full" style={{ width: `${aiState.completeness.score}%` }}></div>
                     </div>
                  </div>
                  {aiState.completeness.missing_fields && aiState.completeness.missing_fields.length > 0 && (
                    <div className="mt-2 bg-red-50 border border-red-100 rounded-md p-3 text-sm text-red-800">
                      <strong className="flex items-center gap-1.5 mb-1"><AlertTriangle className="w-4 h-4" /> Missing Vital Information:</strong>
                      <ul className="list-disc pl-5">
                        {aiState.completeness.missing_fields.map((field, idx) => (
                          <li key={idx}>{field}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
