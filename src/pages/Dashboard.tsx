import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Forms';
import { Button } from '@/src/components/ui/Button';
import { Activity, AlertTriangle, FileText, Search, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getComplaints } from '@/src/services/api';

export const Dashboard = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await getComplaints();
        setComplaints(data);
      } catch (error: any) {
        console.error("Dashboard Fetch Error:", error.message || error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Complaints Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of all active customer complaints and AI assessments.</p>
        </div>
        <Link to="/log-complaint">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Complaint
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Active</p>
              <h4 className="text-2xl font-bold text-gray-900">{complaints.length}</h4>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Critical Risk</p>
              <h4 className="text-2xl font-bold text-gray-900">
                {complaints.filter(c => c.ai_risk_level === 'CRITICAL').length}
              </h4>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Triage</p>
              <h4 className="text-2xl font-bold text-gray-900">
                {complaints.filter(c => c.status === 'Open').length}
              </h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table Area */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 bg-white">
           <div className="relative w-full sm:w-72">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search complaints..." 
               className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
             />
           </div>
           <Button variant="outline" className="text-gray-600 border-gray-200 bg-white">
             <Filter className="w-4 h-4 mr-2" />
             Filter
           </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Complaint ID</th>
                <th className="px-6 py-4 font-medium tracking-wider">Date</th>
                <th className="px-6 py-4 font-medium tracking-wider">Customer / Product</th>
                <th className="px-6 py-4 font-medium tracking-wider">AI Risk Score</th>
                <th className="px-6 py-4 font-medium tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading complaints...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No complaints found. Create one to get started.
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
                  <tr key={complaint.complaint_number} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">
                      <Link to={`/complaint/${complaint.id}`}>
                        {complaint.complaint_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{new Date(complaint.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{complaint.customer_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{complaint.product_name || 'Unknown Product'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        complaint.ai_risk_level === 'CRITICAL' ? 'destructive' :
                        complaint.ai_risk_level === 'HIGH' ? 'destructive' :
                        complaint.ai_risk_level === 'MEDIUM' ? 'warning' : 'success'
                      }>
                        {complaint.ai_risk_level || 'UNKNOWN'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        {complaint.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
