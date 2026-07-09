const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { supabase } = require('../utils/supabase');
const { sendError, sendSuccess } = require('../utils/response');

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    // Get total sales from completed orders
    const { data: salesData, error: salesError } = await supabase
      .from('orders')
      .select('totalPrice')
      .eq('paymentInfo->>paymentStatus', 'completed');
    
    if (salesError) throw salesError;
    const totalSales = salesData?.reduce((sum, order) => sum + (order.totalPrice || 0), 0) || 0;

    // Get total orders count
    const { count: totalOrders, error: countError } = await supabase
      .from('orders')
      .select('id', { count: 'exact' });
    
    if (countError) throw countError;

    // Get total products count
    const { count: totalProducts, error: productsCountError } = await supabase
      .from('products')
      .select('id', { count: 'exact' });
    
    if (productsCountError) throw productsCountError;

    // Get total users count
    const { count: totalUsers, error: usersCountError } = await supabase
      .from('users')
      .select('id', { count: 'exact' });
    
    if (usersCountError) throw usersCountError;

    // Get recent orders with user info
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(firstName, lastName, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (recentError) throw recentError;

    // Get top products by sales (simplified version)
    const { data: allOrders, error: ordersError } = await supabase
      .from('orders')
      .select('items');
    
    if (ordersError) throw ordersError;

    // Calculate product sales from order items
    const productSales = {};
    allOrders?.forEach(order => {
      order.items?.forEach(item => {
        const productId = item.product || item.name;
        productSales[productId] = (productSales[productId] || 0) + (item.quantity || 0);
      });
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, totalSold]) => ({ _id: productId, totalSold }));

    // Get revenue by month (simplified version)
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('totalPrice, created_at')
      .eq('paymentInfo->>paymentStatus', 'completed')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (revenueError) throw revenueError;

    const revenueByMonth = {};
    revenueData?.forEach(order => {
      const date = new Date(order.created_at);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;
      
      if (!revenueByMonth[key]) {
        revenueByMonth[key] = { _id: { year, month }, revenue: 0, orders: 0 };
      }
      revenueByMonth[key].revenue += order.totalPrice || 0;
      revenueByMonth[key].orders += 1;
    });

    const sortedRevenueByMonth = Object.values(revenueByMonth)
      .sort((a, b) => {
        if (b._id.year !== a._id.year) return b._id.year - a._id.year;
        return b._id.month - a._id.month;
      })
      .slice(0, 12);

    return sendSuccess(res, 200, {
      analytics: {
        totalSales,
        totalOrders: totalOrders || 0,
        totalProducts: totalProducts || 0,
        totalUsers: totalUsers || 0,
        recentOrders: recentOrders || [],
        topProducts,
        revenueByMonth: sortedRevenueByMonth
      }
    }, 'Analytics fetched successfully');
  } catch (error) {
    console.error('Get analytics error:', error);
    return sendError(res, 500, 'Error fetching analytics', error.message);
  }
};

// @desc    Get low stock products
// @route   GET /api/admin/low-stock
// @access  Private/Admin
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .lte('stock', 10)
      .order('stock', { ascending: true });
    
    if (error) throw error;

    return sendSuccess(res, 200, { products: products || [] }, 'Low stock products fetched successfully');
  } catch (error) {
    console.error('Get low stock products error:', error);
    return sendError(res, 500, 'Error fetching low stock products', error.message);
  }
};

// @desc    Get sales report
// @route   GET /api/admin/sales-report
// @access  Private/Admin
exports.getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let query = supabase
      .from('orders')
      .select(`
        *,
        user:users(firstName, lastName, email)
      `)
      .eq('paymentInfo->>paymentStatus', 'completed')
      .order('created_at', { ascending: false });

    if (startDate && endDate) {
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }

    const { data: sales, error } = await query;
    
    if (error) throw error;

    const totalRevenue = sales?.reduce((acc, order) => acc + (order.totalPrice || 0), 0) || 0;

    return sendSuccess(res, 200, {
      report: {
        sales: sales || [],
        totalRevenue,
        totalOrders: sales?.length || 0
      }
    }, 'Sales report fetched successfully');
  } catch (error) {
    console.error('Get sales report error:', error);
    return sendError(res, 500, 'Error fetching sales report', error.message);
  }
};

// @desc    Generate GST invoice
// @route   POST /api/admin/invoice/:orderId
// @access  Private/Admin
exports.generateInvoice = async (req, res, next) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(name, email, phone),
        items
      `)
      .eq('id', req.params.orderId)
      .single();

    if (error || !order) {
      return sendError(res, 404, 'Order not found');
    }

    // Generate invoice number
    const invoiceNumber = `INV${String(order.orderNumber).replace('ORD', '')}`;
    
    // Update order with invoice info
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        gstInvoice: {
          invoiceNumber,
          generatedAt: new Date().toISOString()
        }
      })
      .eq('id', req.params.orderId)
      .select()
      .single();

    if (updateError) throw updateError;

    return sendSuccess(res, 200, {
      invoiceNumber,
      message: 'Invoice generated successfully'
    }, 'Invoice generated successfully');
  } catch (error) {
    console.error('Generate invoice error:', error);
    return sendError(res, 500, 'Error generating invoice', error.message);
  }
};
