import React from 'react';
import * as XLSX from 'xlsx';

interface Order {
  id?: string;
  _id?: string;
  orderNumber?: string;
  date?: string | Date;
  createdAt?: string | Date;
  created_at?: string | Date;
  user?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  itemsPrice?: number;
  shippingPrice?: number;
  discountPrice?: number;
  totalPrice?: number;
  orderStatus?: string;
  paymentMethod?: string;
  paymentInfo?: {
    paymentStatus?: string;
  };
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
}

interface AdminOrderPanelProps {
  allOrders: Order[];
}

const AdminOrderPanel: React.FC<AdminOrderPanelProps> = ({ allOrders }) => {
  // Function to filter orders for the current month and trigger download
  const handleDownloadExcel = () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // 1. Filter orders for the current month
      const currentMonthOrders = allOrders.filter((order) => {
        const orderDate = new Date(order.date || order.createdAt || order.created_at || ""); 
        return (
          !isNaN(orderDate.getTime()) &&
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      });

      if (currentMonthOrders.length === 0) {
        alert("No orders found for the current month.");
        return;
      }

      // 2. Convert JSON data to an Excel worksheet
      const worksheet = XLSX.utils.json_to_sheet(currentMonthOrders);

      // 3. Create a new workbook and append the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Current Month Orders");

      // 4. Trigger the download
      XLSX.writeFile(workbook, `Orders_${currentMonth + 1}_${currentYear}.xlsx`);
      
    } catch (error) {
      console.error("Error generating Excel file:", error);
      alert("Failed to download the Excel file. Please try again.");
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-8 bg-secondary/40 p-1.5 rounded-xl border border-white/5">
      <button
        onClick={handleDownloadExcel}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        Download Current Month Orders (Excel)
      </button>
    </div>
  );
};

export default AdminOrderPanel;
