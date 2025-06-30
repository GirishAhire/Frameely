import React from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
// import { DownloadIcon } from 'lucide-react'; // Uncomment if you have this icon

const downloadInvoice = async (orderId: string) => {
  try {
    const response = await axios.get(`/api/invoices/${orderId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice_${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    toast.error('Failed to download invoice');
  }
};

const InvoiceButton: React.FC<{ orderId: string }> = ({ orderId }) => (
  <button
    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded inline-flex items-center"
    onClick={() => downloadInvoice(orderId)}
  >
    {/* <DownloadIcon className="mr-2 h-4 w-4" /> */}
    Download Invoice
  </button>
);

export default InvoiceButton; 