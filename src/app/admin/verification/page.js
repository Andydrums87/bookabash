"use client"

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText, 
  User, 
  MapPin, 
  Camera,
  Search,
  Filter,
  Download,
  MessageSquare,
  AlertTriangle,
  Users,
  Calendar,
  ExternalLink,
  Loader2,
  Lock
} from 'lucide-react';

// Admin email list - add your emails here
const ADMIN_EMAILS = [
  'andydrums87@gmail.com',
];

// Alternative: Check against a role in your database
const AdminAuthWrapper = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Auth error:', error);
        setIsLoading(false);
        return;
      }

      if (!user) {
        setIsLoading(false);
        return;
      }

      setUser(user);

      // Method 1: Check against hardcoded admin emails
      if (ADMIN_EMAILS.includes(user.email)) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }


      setIsLoading(false);
    } catch (err) {
      console.error('Admin auth check error:', err);
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/signin'; // Redirect to your login page
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Checking authorization...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Admin Login Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Please sign in to access the admin dashboard.</p>
            <Button onClick={() => window.location.href = '/signin'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You do not have admin privileges to access this page.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-gray-600 mb-4">
              Signed in as: {user.email}
            </p>
            <div className="space-y-2">
              <Button variant="outline" onClick={signOut} className="w-full">
                Sign Out
              </Button>
              <Button variant="ghost" onClick={() => window.location.href = '/'} className="w-full">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
};

export default function AdminVerificationDashboard() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewingDoc, setReviewingDoc] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [stats, setStats] = useState({});
  const [viewingDocument, setViewingDocument] = useState(null);
  const [documentLoading, setDocumentLoading] = useState('');

  // All your existing component logic stays the same...
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('Verification component auth check:', {
          user: user?.id,
          email: user?.email,
          error: error?.message
        });
        
        if (user) {
          const { data: supplier } = await supabase
            .from('suppliers')
            .select('id, business_name')
            .eq('auth_user_id', user.id)
            .single();
          
          console.log('Supplier check:', supplier);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [activeTab]);

  const getAuthHeaders = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return { 'Content-Type': 'application/json' };
      }
      
      if (session?.access_token) {
        console.log('Adding auth header to request');
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        };
      }
      
      console.log('No session found - requesting without auth header');
      return { 'Content-Type': 'application/json' };
    } catch (err) {
      console.error('Error preparing auth headers:', err);
      return { 'Content-Type': 'application/json' };
    }
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      console.log('Fetching suppliers with admin auth...');
      
      const headers = await getAuthHeaders();
      console.log('Request headers prepared:', { hasAuth: !!headers.Authorization });
      
      const response = await fetch(`/api/admin/verification/list?status=${activeTab}`, {
        method: 'GET',
        headers
      });
      
      console.log('Response status:', response.status);
      
      if (response.status === 401) {
        console.error('Unauthorized - signing out');
        await supabase.auth.signOut();
        window.location.href = '/login';
        return;
      }
      
      if (response.status === 403) {
        console.error('Forbidden - admin access required');
        alert('Admin access required. You are not authorized to view this page.');
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Suppliers loaded successfully:', data.suppliers.length);
        setSuppliers(data.suppliers || []);
        calculateStats(data.suppliers || []);
      } else {
        console.error('API returned error:', data.error);
        alert('Failed to load suppliers: ' + data.error);
      }
    } catch (error) {
      console.error('Network error fetching suppliers:', error);
      alert('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (supplierList) => {
    const stats = {
      total: supplierList.length,
      pending: supplierList.filter(s => s.verification.status === 'pending' || s.verification.pendingCount > 0).length,
      approved: supplierList.filter(s => s.verification.status === 'verified' || s.verification.status === 'approved').length,
      rejected: supplierList.filter(s => s.verification.status === 'rejected' || s.verification.rejectedCount > 0).length,
      notStarted: supplierList.filter(s => s.verification.status === 'not_started').length
    };
    setStats(stats);
  };

  const getStatusBadge = (status, counts = {}) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending Review' },
      submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'Submitted' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approved' },
      verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Verified' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
      not_started: { color: 'bg-gray-100 text-gray-800', icon: User, text: 'Not Started' }
    };

    const config = statusConfig[status] || statusConfig.not_started;
    const Icon = config.icon;

    return (
      <div className="flex items-center gap-2">
        <Badge className={config.color}>
          <Icon className="h-3 w-3 mr-1" />
          {config.text}
        </Badge>
        {counts.pendingCount > 0 && (
          <Badge className="bg-yellow-100 text-yellow-800">
            {counts.pendingCount} pending
          </Badge>
        )}
        {counts.rejectedCount > 0 && (
          <Badge className="bg-red-100 text-red-800">
            {counts.rejectedCount} rejected
          </Badge>
        )}
      </div>
    );
  };

  const getDocumentIcon = (docType) => {
    const icons = {
      dbs: Shield,
      id: Camera,
      identity: Camera,
      address: MapPin,
      insurance: FileText,
      qualifications: FileText
    };
    return icons[docType] || FileText;
  };

  const getDocumentName = (docType) => {
    const names = {
      dbs: 'DBS Certificate',
      id: 'Photo ID',
      identity: 'Photo ID',
      address: 'Address Proof',
      insurance: 'Insurance',
      qualifications: 'Qualifications'
    };
    return names[docType] || docType;
  };

  const reviewDocument = async (supplierId, documentType, decision, feedback = '') => {
    try {
      console.log('Submitting document review...', { supplierId, documentType, decision });
      
      const headers = await getAuthHeaders();
      console.log('Review request headers prepared:', { hasAuth: !!headers.Authorization });
      
      const response = await fetch('/api/admin/verification/review', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          supplierId,
          documentType,
          decision,
          feedback
        })
      });
      
      console.log('Review response status:', response.status);
      
      if (response.status === 401) {
        console.error('Unauthorized - signing out');
        await supabase.auth.signOut();
        window.location.href = '/signin';
        return;
      }
      
      if (response.status === 403) {
        console.error('Forbidden - admin access required');
        alert('Admin access required for document review.');
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Review HTTP error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
  
      const result = await response.json();
      
      if (result.success) {
        console.log('Document reviewed successfully');
        alert(`Document ${decision} successfully!`);
        
        // Refresh data
        fetchSuppliers();
        setReviewingDoc(null);
        setReviewFeedback('');
        
        if (selectedSupplier?.id === supplierId) {
          viewSupplierDetails(supplierId);
        }
      } else {
        console.error('Review API error:', result.error);
        alert('Review failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Review network error:', error);
      alert('Review failed: ' + error.message);
    }
  };
  

// UPDATE your viewSupplierDetails function
const viewSupplierDetails = async (supplierId) => {
  try {
    console.log('Getting supplier details with auth...');
    
    const headers = await getAuthHeaders();
    
    const response = await fetch('/api/admin/verification/list', {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'getDetails', supplierId })
    });
    
    if (response.status === 401) {
      console.error('Unauthorized - signing out');
      await supabase.auth.signOut();
      window.location.href = '/login';
      return;
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Details HTTP error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    if (data.success) {
      console.log('Supplier details loaded');
      setSelectedSupplier(data.supplier);
    } else {
      console.error('Details API error:', data.error);
      alert('Failed to load supplier details: ' + data.error);
    }
  } catch (error) {
    console.error('Details network error:', error);
    alert('Network error: ' + error.message);
  }
};

// UPDATE your viewDocument function
const viewDocument = async (docData, docType, supplierId) => {
  setDocumentLoading(`${supplierId}-${docType}`);
  
  try {
    console.log('Viewing document with auth...');
    
    const headers = await getAuthHeaders();
    
    const response = await fetch('/api/admin/verification/view-document', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        cloudinaryId: docData.cloudinaryId,
        supplierId: supplierId,
        documentType: docType
      })
    });

    if (response.status === 401) {
      console.error('Unauthorized - signing out');
      await supabase.auth.signOut();
      window.location.href = '/signin';
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Document view HTTP error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('Document view URL generated');
      window.open(result.viewUrl, '_blank');
    } else {
      console.error('Document view API error:', result.error);
      alert('Failed to load document: ' + result.error);
    }
  } catch (error) {
    console.error('Document view network error:', error);
    alert('Failed to load document: ' + error.message);
  } finally {
    setDocumentLoading('');
  }
};

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          
          {/* Header with Admin Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">Verification Management</h1>
                  <Badge className="bg-red-100 text-red-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin Access
                  </Badge>
                </div>
                <p className="text-gray-600">Review and approve supplier verification documents</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button onClick={fetchSuppliers} variant="outline">
                  Refresh
                </Button>
                <Button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/login';
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold">{stats.total || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold">{stats.pending || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold">{stats.approved || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <XCircle className="h-8 w-8 text-red-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold">{stats.rejected || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <User className="h-8 w-8 text-gray-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Not Started</p>
                      <p className="text-2xl font-bold">{stats.notStarted || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content - Rest of your existing JSX remains the same */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Panel - Supplier List */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="not_started">Not Started</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {activeTab === 'all' ? 'All Suppliers' : 
                         activeTab === 'pending' ? 'Pending Review' :
                         activeTab === 'approved' ? 'Approved Suppliers' :
                         activeTab === 'rejected' ? 'Rejected Documents' :
                         'Not Started'}
                        <span className="text-gray-500 font-normal ml-2">
                          ({filteredSuppliers.length})
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p>Loading suppliers...</p>
                        </div>
                      ) : filteredSuppliers.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No suppliers found</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredSuppliers.map(supplier => (
                            <div 
                              key={supplier.id} 
                              className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                selectedSupplier?.id === supplier.id ? 'border-blue-500 bg-blue-50' : ''
                              }`}
                              onClick={() => viewSupplierDetails(supplier.id)}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-medium text-lg">{supplier.name}</h3>
                                  <p className="text-sm text-gray-600">{supplier.owner.email}</p>
                                  <p className="text-sm text-gray-500">{supplier.serviceType}</p>
                                </div>
                                {getStatusBadge(supplier.verification.status, {
                                  pendingCount: supplier.verification.pendingCount,
                                  rejectedCount: supplier.verification.rejectedCount
                                })}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Submitted: {supplier.submittedAt ? 
                                    new Date(supplier.submittedAt).toLocaleDateString() : 'Never'
                                  }
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  Documents: {Object.keys(supplier.verification.documents || {}).length}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - Supplier Details */}
            <div>
              {selectedSupplier ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {selectedSupplier.business_name || selectedSupplier.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Supplier Info */}
                    <div>
                      <h4 className="font-medium mb-2">Supplier Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Email:</span> {selectedSupplier.data?.owner?.email || 'N/A'}</p>
                        <p><span className="font-medium">Phone:</span> {selectedSupplier.data?.owner?.phone || 'N/A'}</p>
                        <p><span className="font-medium">Service:</span> {selectedSupplier.data?.serviceType || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Documents */}
                    <div>
                      <h4 className="font-medium mb-3">Verification Documents</h4>
                      <div className="space-y-3">
                        {Object.entries(selectedSupplier.data?.verification?.documents || {}).map(([docType, docData]) => {
                          const Icon = getDocumentIcon(docType);
                          const isLoading = documentLoading === `${selectedSupplier.id}-${docType}`;
                          
                          return (
                            <div key={docType} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span className="font-medium">{getDocumentName(docType)}</span>
                                </div>
                                <Badge className={
                                  docData.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  docData.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }>
                                  {docData.status}
                                </Badge>
                              </div>
                              
                              <div className="text-xs text-gray-500 space-y-1 mb-3">
                                <p>File: {docData.fileName}</p>
                                <p>Uploaded: {new Date(docData.uploadedAt || docData.submittedAt).toLocaleString()}</p>
                                {docData.reviewFeedback && (
                                  <p className="text-red-600">Feedback: {docData.reviewFeedback}</p>
                                )}
                              </div>

                              <div className="flex gap-2 flex-wrap">
                                {docData.cloudinaryId && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => viewDocument(docData, docType, selectedSupplier.id)}
                                    disabled={isLoading}
                                  >
                                    {isLoading ? (
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <ExternalLink className="h-4 w-4 mr-1" />
                                    )}
                                    View
                                  </Button>
                                )}

                                {docData.status === 'submitted' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      onClick={() => setReviewingDoc({supplierId: selectedSupplier.id, docType, docData})}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => setReviewingDoc({supplierId: selectedSupplier.id, docType, docData, reject: true})}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        
                        {Object.keys(selectedSupplier.data?.verification?.documents || {}).length === 0 && (
                          <p className="text-gray-500 text-center py-4">No documents uploaded</p>
                        )}
                      </div>
                    </div>

                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select a supplier to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Review Modal */}
          {reviewingDoc && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>
                    {reviewingDoc.reject ? 'Reject' : 'Approve'} {getDocumentName(reviewingDoc.docType)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Document: {reviewingDoc.docData.fileName}</Label>
                  </div>
                  
                  <div>
                    <Label htmlFor="feedback">
                      {reviewingDoc.reject ? 'Rejection reason (required)' : 'Review notes (optional)'}
                    </Label>
                    <Textarea
                      id="feedback"
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      placeholder={reviewingDoc.reject ? 
                        'Please explain why this document was rejected...' : 
                        'Any additional notes...'}
                      className="mt-1"
                      required={reviewingDoc.reject}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => {
                        if (reviewingDoc.reject && !reviewFeedback.trim()) {
                          alert('Please provide a rejection reason');
                          return;
                        }
                        reviewDocument(
                          reviewingDoc.supplierId,
                          reviewingDoc.docType,
                          reviewingDoc.reject ? 'rejected' : 'approved',
                          reviewFeedback
                        );
                      }}
                      className={reviewingDoc.reject ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                      disabled={reviewingDoc.reject && !reviewFeedback.trim()}
                    >
                      {reviewingDoc.reject ? 'Reject Document' : 'Approve Document'}
                    </Button>
                    <Button variant="outline" onClick={() => {setReviewingDoc(null); setReviewFeedback('');}}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminAuthWrapper>
  );
}