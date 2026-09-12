import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Forms';
import { Button } from '@/src/components/ui/Button';
import { ArrowLeft, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { getComplaints } from '@/src/services/api';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      try {
        const data = await getComplaints();
        // Since we don't have a GET /complaints/:id endpoint in the basic backend,
        // we'll filter from the list
        const found = data.find((c: any) => c.id.toString() === id);
        if (found) {
          setComplaint(found);
        } else {
          setError("Complaint not found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch details.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaintDetails();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading complaint details...</div>;
  }

  if (error || !complaint) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="outline" className="w-10 h-10 p-0 rounded-full border-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{complaint.complaint_number}</h1>
            <Badge variant="outline" className="bg-white border-gray-200">{complaint.status}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">Received on {new Date(complaint.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Complaint Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-200 shadow-sm overflow-hidden">
             <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
               <h3 className="font-semibold text-gray-900">Complaint Record</h3>
             </div>
             <CardContent className="p-0">
                <dl className="divide-y divide-gray-100">
                  <div className="px-6 py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{complaint.customer_name || 'N/A'}</dd>
                  </div>
                  <div className="px-6 py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Product</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{complaint.product_name || 'N/A'}</dd>
                  </div>
                  <div className="px-6 py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Batch Number</dt>
                    <dd className="text-sm text-gray-900 col-span-2 font-mono">{complaint.batch_number || 'N/A'}</dd>
                  </div>
                  <div className="px-6 py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{complaint.complaint_category || 'N/A'}</dd>
                  </div>
                  <div className="px-6 py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Affected Quantity</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{complaint.affected_quantity || 'N/A'}</dd>
                  </div>
                  <div className="px-6 py-4 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="text-sm text-gray-900 col-span-2 whitespace-pre-wrap">{complaint.complaint_description || 'N/A'}</dd>
                  </div>
                </dl>
             </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="space-y-6">
          <Card className={`border-2 shadow-sm overflow-hidden ${
             complaint.ai_risk_level === 'CRITICAL' ? 'border-red-200' :
             complaint.ai_risk_level === 'HIGH' ? 'border-red-200' :
             complaint.ai_risk_level === 'MEDIUM' ? 'border-orange-200' : 'border-green-200'
          }`}>
             <div className={`px-5 py-4 border-b flex items-center justify-between ${
               complaint.ai_risk_level === 'CRITICAL' ? 'bg-red-50 border-red-100 text-red-900' :
               complaint.ai_risk_level === 'HIGH' ? 'bg-red-50 border-red-100 text-red-900' :
               complaint.ai_risk_level === 'MEDIUM' ? 'bg-orange-50 border-orange-100 text-orange-900' : 
               'bg-green-50 border-green-100 text-green-900'
             }`}>
               <div className="flex items-center gap-2">
                 <AlertTriangle className="w-5 h-5" />
                 <h3 className="font-semibold">AI Risk Assessment</h3>
               </div>
               <Badge variant={
                  complaint.ai_risk_level === 'CRITICAL' ? 'destructive' :
                  complaint.ai_risk_level === 'HIGH' ? 'destructive' :
                  complaint.ai_risk_level === 'MEDIUM' ? 'warning' : 'success'
               }>
                 {complaint.ai_risk_level || 'UNKNOWN'}
               </Badge>
             </div>
             <CardContent className="p-5">
                <p className="text-sm text-gray-700">{complaint.ai_risk_reason || 'No risk reason provided.'}</p>
             </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm overflow-hidden">
             <div className="bg-blue-50/50 border-b border-blue-100 px-5 py-4 flex items-center gap-2">
               <FileText className="w-5 h-5 text-blue-600" />
               <h3 className="font-semibold text-blue-900">AI Summary</h3>
             </div>
             <CardContent className="p-5">
                <p className="text-sm text-gray-700">{complaint.ai_summary || 'No summary generated.'}</p>
             </CardContent>
          </Card>

          {complaint.ai_completeness_score && (
            <Card className="border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">Completeness Score</h3>
                <span className="font-bold text-gray-900">{complaint.ai_completeness_score}%</span>
              </div>
              <CardContent className="p-5">
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${complaint.ai_completeness_score}%` }}></div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};
