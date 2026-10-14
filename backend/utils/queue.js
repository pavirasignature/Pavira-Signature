const isRedisConfigured = Boolean(process.env.REDIS_HOST || process.env.REDIS_URL);

let emailQueue, emailWorker, cleanupQueue, cleanupWorker;

if (isRedisConfigured) {
  const { Queue, Worker } = require("bullmq");

  const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
  };

  emailQueue = new Queue("order-emails", { connection });

  emailWorker = new Worker(
    "order-emails",
    async (job) => {
      const { orderId, userEmail } = job.data;
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
        throw error;
      }
    },
    { 
      connection,
      settings: {
        backoffStrategies: {
          exponential: (attemptsMade) => Math.pow(2, attemptsMade) * 1000
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

  cleanupQueue = new Queue("order-cleanup", { connection });

  cleanupWorker = new Worker(
    "order-cleanup",
    async () => {
      console.log("Running abandoned order cleanup...");
      const { supabase } = require("./supabase");
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

  cleanupQueue.add("cleanup-job", {}, {
    repeat: { every: 5 * 60 * 1000 }
  });
} else {
  // In-memory / direct processing fallback when Redis is not running
  emailQueue = {
    add: async (name, data) => {
      try {
        const { sendOrderConfirmationEmail } = require("./email");
        const Order = require("../models/Order");
        const order = await Order.findById(data.orderId);
        if (order && data.userEmail) {
          await sendOrderConfirmationEmail(data.userEmail, order);
        }
      } catch (err) {
        // Safe delivery notice
      }
    }
  };
  cleanupQueue = { add: async () => {} };
  emailWorker = null;
  cleanupWorker = null;
}

module.exports = {
  emailQueue,
  emailWorker,
  cleanupQueue,
  cleanupWorker
};
