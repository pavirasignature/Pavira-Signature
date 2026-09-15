const { Queue, Worker } = require("bullmq");

// Use Redis URL from env, default to local if not set
const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
};

// Create the email queue
const emailQueue = new Queue("order-emails", { connection });

// Initialize the worker that processes the queue
const emailWorker = new Worker(
  "order-emails",
  async (job) => {
    const { orderId, userEmail } = job.data;
    
    // Lazy load to avoid circular dependencies
    const { sendOrderConfirmationEmail } = require("./email");
    const Order = require("../models/Order");
    
    try {
      console.log(`Processing email job for order ${orderId}`);
      const order = await Order.findById(orderId);
      if (order && userEmail) {
        await sendOrderConfirmationEmail(userEmail, order);
      }
      return { success: true };
    } catch (error) {
      console.error(`Failed to send email for order ${orderId}:`, error);
      throw error; // Let BullMQ handle retries
    }
  },
  { 
    connection,
    // Add retry strategy for exponential backoff
    settings: {
      backoffStrategies: {
        exponential: (attemptsMade) => {
          return Math.pow(2, attemptsMade) * 1000;
        }
      }
    }
  }
);

emailWorker.on('completed', job => {
  console.log(`Email job with id ${job.id} has been completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Email job with id ${job.id} has failed with ${err.message}`);
});

// Create a queue for order cleanup
const cleanupQueue = new Queue("order-cleanup", { connection });

// Initialize the cleanup worker
const cleanupWorker = new Worker(
  "order-cleanup",
  async () => {
    console.log("Running abandoned order cleanup...");
    const { supabase } = require("./supabase");
    
    // Find orders older than 15 mins that are still pending
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: abandonedOrders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("orderStatus", "pending")
      .lt("created_at", fifteenMinsAgo);
      
    if (error || !abandonedOrders || abandonedOrders.length === 0) {
      return { success: true, count: 0 };
    }
    
    let restoredCount = 0;
    for (const order of abandonedOrders) {
      // For each item, restore stock
      const items = order.items || [];
      for (const item of items) {
        if (!item.product) continue;
        
        const { data: productData } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product)
          .single();
          
        if (productData) {
          await supabase
            .from("products")
            .update({ stock: productData.stock + item.quantity })
            .eq("id", item.product);
        }
      }
      
      // Mark order as cancelled
      await supabase
        .from("orders")
        .update({ orderStatus: "cancelled", "paymentInfo": { paymentStatus: "abandoned" } })
        .eq("id", order.id);
        
      restoredCount++;
    }
    
    return { success: true, count: restoredCount };
  },
  { connection }
);

// Schedule the cleanup job to run every 5 minutes
cleanupQueue.add("cleanup-job", {}, {
  repeat: {
    every: 5 * 60 * 1000
  }
});

module.exports = {
  emailQueue,
  emailWorker,
  cleanupQueue,
  cleanupWorker
};
