// frontend-admin/src/pages/OrderManagement.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useDebounce } from 'use-debounce';
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

// Update the Zod schema and validation to be more flexible
const OrderSchema = z.object({
  _id: z.string().optional().nullable(),
  userId: z.union([
    z.string(),
    z.object({
      name: z.string().optional().nullable(),
      email: z.string().optional().nullable()
    })
  ]).optional().nullable(),
  userDetails: z.object({
    name: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable()
  }).optional().nullable(),
  createdAt: z.string().datetime().optional().nullable(),
  totalAmount: z.number().positive().optional().nullable(),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional().nullable(),
  items: z.array(z.object({
    frame: z.union([
      z.string(),
      z.object({
        name: z.string().optional().nullable(),
        _id: z.string().optional().nullable()
      })
    ]).optional().nullable(),
    size: z.string().optional().nullable(),
    quantity: z.number().positive().optional().nullable(),
    price: z.number().positive().optional().nullable()
  })).optional().nullable(),
  shippingAddress: z.object({
    name: z.string().optional().nullable(),
    street: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    postalCode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().optional().nullable()
  }).optional().nullable(),
  shippingDetails: z.object({
    address: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    name: z.string().optional().nullable()
  }).optional().nullable()
});

type Order = z.infer<typeof OrderSchema>;

const getStatusVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
  switch (status) {
    case 'delivered': return 'default';
    case 'shipped': return 'secondary';
    case 'processing': return 'secondary';
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
};

const SafeDate = ({ date }: { date: string | null | undefined }) => {
  if (!date) return <span>N/A</span>;
  try {
    return <span>{new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })}</span>;
  } catch (error) {
    console.error('Date parsing error:', error);
    return <span>Invalid date</span>;
  }
};

// Create a helper function to safely get enum options
const getStatusOptions = (): string[] => {
  try {
    // @ts-ignore - we know this exists but TypeScript doesn't recognize it with optional/nullable
    return OrderSchema.shape.status._def.values || ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  } catch (e) {
    return ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  }
};

// Add this helper function to test API directly
const testOrdersApi = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    console.log('Testing API with token:', token);
    
    // Make a direct fetch request to the API
    const response = await fetch('/api/admin/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Test API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Test API response data:', data);
      return data;
    } else {
      const errorData = await response.json();
      console.error('Test API error:', errorData);
      return null;
    }
  } catch (error) {
    console.error('Test API exception:', error);
    return null;
  }
};

// Add helper functions to check object types before accessing properties
const isUserObject = (user: string | { name?: string | null, email?: string | null } | null | undefined): user is { name?: string | null, email?: string | null } => {
  return user !== null && typeof user === 'object';
};

const isFrameObject = (frame: string | { _id?: string | null, name?: string | null } | null | undefined): frame is { _id?: string | null, name?: string | null } => {
  return frame !== null && typeof frame === 'object';
};

const OrderManagement = () => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<Record<string, Order['status']>>({});
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [filters, setFilters] = useState<{ status?: Order['status']; search?: string }>({});
  const [debouncedFilters] = useDebounce(filters, 500);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRowExpansion = (orderId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const queryKey = ['orders', pagination.page, pagination.limit, debouncedFilters.status, debouncedFilters.search];

  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());
      if (debouncedFilters.status) {
        queryParams.append('status', debouncedFilters.status);
      }
      if (debouncedFilters.search) {
        queryParams.append('search', debouncedFilters.search);
      }
      
      const token = localStorage.getItem('adminToken');
      console.log('🔑 ADMIN TOKEN USED:', token ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : 'NO TOKEN FOUND!');
      
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      console.log('Request headers:', headers);
      
      const requestUrl = `/api/admin/orders?${queryParams.toString()}`;
      console.log('Making request to:', requestUrl);
      
      const response = await fetch(requestUrl, { headers });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to fetch orders');
      }
      
      try {
        const data = await response.json();
        // Add debug logging to see the actual response
        console.log('API Response:', data);
        
        // Add an extra validation layer to ensure we have valid data
        if (!data || !Array.isArray(data.data)) {
          console.error('Invalid data format:', data);
          return { data: [], total: 0 };
        }
        
        // Log the parsed data
        const parsed = z.object({
          data: z.array(OrderSchema),
          total: z.number().default(0)
        }).parse(data);
        console.log('Parsed data:', parsed);
        return parsed;
      } catch (error) {
        console.error('Failed to parse orders data:', error);
        return { data: [], total: 0 };
      }
    },
    retry: 2,
    staleTime: 1000 * 60
  });

  const mutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] }) => {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Status update failed');
      }
      
      return response.json();
    },
    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousOrders = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => {
        // Handle undefined or null data
        if (!old || !old.data || !Array.isArray(old.data)) {
          return old;
        }
        
        return {
          ...old,
          data: old.data.map((order: Order) => 
            order._id === orderId ? { ...order, status } : order
          )
        };
      });

      return { previousOrders };
    },
    onError: (err, variables, context) => {
      toast({
        title: 'Update failed',
        description: err.message,
        variant: 'destructive'
      });
      queryClient.setQueryData(queryKey, context?.previousOrders);
    },
    onSuccess: () => {
      toast({ 
        title: 'Status updated successfully',
        description: 'The order status has been updated.'
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const handleStatusUpdate = (orderId: string) => {
    const newStatus = selectedStatus[orderId];
    if (newStatus) mutation.mutate({ orderId, status: newStatus });
  };

  if (error) {
    return (
      <Card className="m-4">
        <CardContent className="flex flex-col items-center justify-center h-[300px] gap-4">
          <div className="text-destructive text-xl">
            Error loading orders: {(error as Error).message}
          </div>
          <Button 
            onClick={() => queryClient.refetchQueries({ queryKey })}
            variant="outline"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Order Management</CardTitle>
          <div className="flex gap-2">
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => setFilters(prev => ({
                ...prev,
                status: value === 'all' ? undefined : value as Order['status']
              }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {getStatusOptions().map((status: string) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Search orders..."
              className="w-[200px]"
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <Button
              variant="outline"
              onClick={() => queryClient.refetchQueries({ queryKey })}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                testOrdersApi().then(data => {
                  if (data && data.data && data.data.length > 0) {
                    toast({
                      title: 'API Test Successful',
                      description: `Found ${data.data.length} orders directly from API`,
                    });
                  } else {
                    toast({
                      title: 'API Test Failed',
                      description: 'No orders found with direct API call',
                      variant: 'destructive'
                    });
                  }
                });
              }}
            >
              Test API
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        {Array(7).fill(0).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-[100px]" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : Array.isArray(data?.data) && data.data.length > 0 ? (
                    data.data.map((order) => (
                      <React.Fragment key={order._id}>
                        <TableRow className={expandedRows[order._id as string] ? "bg-blue-50" : ""}>
                          <TableCell className="font-mono">
                            <div className="flex items-center">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-6 w-6 p-0 mr-2"
                                onClick={() => toggleRowExpansion(order._id as string)}
                              >
                                {expandedRows[order._id as string] ? '−' : '+'}
                              </Button>
                              {order._id ? order._id.slice(-8) : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {order.userDetails?.name || (isUserObject(order.userId) 
                                  ? order.userId?.name 
                                  : (typeof order.userId === 'string' 
                                      ? `User ${order.userId.substring(0, 8)}` 
                                      : 'Unknown')
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {order.userDetails?.email || (isUserObject(order.userId) 
                                  ? order.userId?.email || 'No email' 
                                  : 'No email'
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <SafeDate date={order.createdAt} />
                          </TableCell>
                          <TableCell className="font-medium">
                            ₹{order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {(() => {
                                if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
                                  return 'No items';
                                }
                                
                                return order.items.map((item, idx) => (
                                  <div key={idx}>
                                    {(isFrameObject(item?.frame) 
                                      ? item.frame?.name 
                                      : (typeof item?.frame === 'string' 
                                          ? `Frame ${item.frame.substring(0, 8)}` 
                                          : 'Unknown frame')
                                    )} 
                                    ({item?.size || 'N/A'}) 
                                    x{item?.quantity?.toString() || '1'}
                                  </div>
                                ));
                              })()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order._id && selectedStatus[order._id as string] || order.status || 'pending'}
                              onValueChange={(value) => order._id && setSelectedStatus(prev => ({
                                ...prev,
                                [order._id as string]: value as Order['status']
                              }))}
                              disabled={mutation.isPending}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getStatusOptions().map((status: string) => (
                                  <SelectItem key={status} value={status}>
                                    <Badge variant={getStatusVariant(status)}>
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </Badge>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => order._id && selectedStatus[order._id as string] && handleStatusUpdate(order._id as string)}
                                disabled={!order._id || !selectedStatus[order._id as string] || mutation.isPending}
                              >
                                {mutation.isPending && mutation.variables?.orderId === order._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Update
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {expandedRows[order._id as string] && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-gray-50 p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-medium text-sm mb-2">Shipping Details</h3>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Name:</strong> {order.shippingAddress?.name || order.userDetails?.name || 'Not provided'}</p>
                                    <p><strong>Email:</strong> {order.shippingAddress?.email || order.userDetails?.email || 'Not provided'}</p>
                                    <p><strong>Phone:</strong> {order.shippingAddress?.phone || order.userDetails?.phone || 'Not provided'}</p>
                                    <p><strong>Address:</strong> {order.shippingAddress?.street || 'Not provided'}</p>
                                    <p><strong>City:</strong> {order.shippingAddress?.city || 'Not provided'}</p>
                                    <p><strong>State:</strong> {order.shippingAddress?.state || 'Not provided'}</p>
                                    <p><strong>Postal Code:</strong> {order.shippingAddress?.postalCode || 'Not provided'}</p>
                                    <p><strong>Country:</strong> {order.shippingAddress?.country || 'India'}</p>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-medium text-sm mb-2">Order Details</h3>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Order ID:</strong> {order._id}</p>
                                    <p><strong>Payment Method:</strong> {order.paymentMethod || 'Not specified'}</p>
                                    <p><strong>Payment ID:</strong> {order.paymentId || 'Not available'}</p>
                                    <p><strong>Payment Status:</strong> {order.paymentStatus || 'Unknown'}</p>
                                    <p><strong>Created:</strong> <SafeDate date={order.createdAt} /></p>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <p className="text-muted-foreground">No orders found</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setFilters({});
                              setPagination({ page: 1, limit: 10 });
                              queryClient.refetchQueries({ queryKey: ['orders'] });
                            }}
                          >
                            Reset filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          <div className="flex items-center justify-between mt-4 p-2">
            <div className="text-sm text-gray-500">
              Showing {data?.data?.length || 0} of {data?.total || 0} orders
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.page > 1 && setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm">Page {pagination.page}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!data?.total || data.total <= pagination.page * pagination.limit || isLoading}
              >
                Next
              </Button>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={pagination.limit}
                onChange={(e) => setPagination({ page: 1, limit: parseInt(e.target.value, 10) })}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Add an error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="m-4">
          <CardContent className="flex flex-col items-center justify-center h-[300px] gap-4">
            <div className="text-destructive text-xl">
              Something went wrong
            </div>
            <div className="text-sm text-gray-500">
              {this.state.error?.message || "An unknown error occurred"}
            </div>
            <Button 
              onClick={() => this.setState({ hasError: false, error: null })}
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Wrap the component export with the error boundary
const OrderManagementWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <OrderManagement />
    </ErrorBoundary>
  );
};

export default OrderManagementWithErrorBoundary;