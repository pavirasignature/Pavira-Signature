/**
 * Shipping Service Integration (Shiprocket & Delhivery Mock Clients)
 * Supports dynamic rate calculations, consignment creation, and AWB tracking
 */

/**
 * Calculate dynamic shipping rates using Delhivery and Shiprocket APIs
 * @param {string} postalCode - Shipping destination pincode
 * @param {number} weight - Total package weight in kg (default 2kg)
 * @returns {Promise<object>} - Dynamic rates for both carriers and chosen best rate
 */
const calculateShippingRates = async (postalCode, weight = 2) => {
  try {
    // 1. Delhivery Mock Rate API
    // Dynamic rate based on destination zone (using first two digits of PIN code)
    const codeStr = String(postalCode || '');
    const pincodePrefix = codeStr.slice(0, 2);
    let delhiveryBase = 60;
    
    if (['11', '12', '13', '201'].includes(pincodePrefix) || codeStr.startsWith('1100')) {
      // Zone A (Local/Delhi NCR)
      delhiveryBase = 40;
    } else if (['40', '56', '60'].includes(pincodePrefix)) {
      // Zone B (Metros: Mumbai, Bangalore, Chennai)
      delhiveryBase = 70;
    } else if (['70', '71', '72', '73'].includes(pincodePrefix)) {
      // Zone C (Kolkata/East)
      delhiveryBase = 85;
    } else {
      // Rest of India
      delhiveryBase = 100;
    }
    const delhiveryRate = delhiveryBase + (weight * 8); // Base + weight surcharge

    // 2. Shiprocket Mock Rate API
    // Base rate is ₹50 plus a weight surcharge of ₹15/kg
    const shiprocketRate = 50 + (weight * 12);

    // 3. Choose cheapest option automatically
    const chosenCarrier = delhiveryRate <= shiprocketRate ? 'Delhivery' : 'Shiprocket';
    const finalPrice = Math.min(delhiveryRate, shiprocketRate);

    return {
      success: true,
      rates: {
        Delhivery: delhiveryRate,
        Shiprocket: shiprocketRate
      },
      chosenCarrier,
      shippingPrice: finalPrice
    };
  } catch (error) {
    console.error('Shipping rate calculation failed, falling back to flat rate:', error);
    return {
      success: false,
      rates: {},
      chosenCarrier: 'Delhivery',
      shippingPrice: 50 // Standard fallback flat rate
    };
  }
};

/**
 * Create a shipping consignment consignment manifest (mock)
 * @param {object} order - Mongoose Order instance
 * @param {string} carrier - Preferred shipping partner ('Delhivery' | 'Shiprocket')
 * @returns {Promise<object>} - Created consignment details with tracking AWB
 */
const createShippingConsignment = async (order, carrier = 'Delhivery') => {
  try {
    const awbSuffix = Date.now().toString().slice(-6);
    const trackingNumber = carrier === 'Delhivery' 
      ? `DEL100${awbSuffix}` 
      : `SR99${awbSuffix}`;

    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 1); // Pickup scheduled next day

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (carrier === 'Delhivery' ? 3 : 4));

    return {
      success: true,
      carrier,
      trackingNumber,
      pickupDate: pickupDate.toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString(),
      labelUrl: `https://shipping-labels.s3.amazonaws.com/labels/${trackingNumber}.pdf`
    };
  } catch (error) {
    console.error('Failed to create consignment:', error);
    throw new Error('Shipping partner consignment generation failed');
  }
};

/**
 * Fetch mock tracking timeline milestones
 * @param {string} awbNumber - Shipping AWB number
 * @returns {object} - Status and track history
 */
const trackConsignment = (awbNumber) => {
  const isDelhivery = String(awbNumber).startsWith('DEL');
  const carrier = isDelhivery ? 'Delhivery' : 'Shiprocket';

  return {
    awbNumber,
    carrier,
    status: 'In Transit',
    milestones: [
      { status: 'Order Manifest Created', location: 'Pavira Warehouse, Delhi', time: new Date(Date.now() - 48*60*60*1000).toISOString() },
      { status: 'Consignment Picked Up', location: 'Delhi Hub', time: new Date(Date.now() - 36*60*60*1000).toISOString() },
      { status: 'In Transit', location: 'Central Sorting Facility', time: new Date(Date.now() - 12*60*60*1000).toISOString() }
    ]
  };
};

module.exports = {
  calculateShippingRates,
  createShippingConsignment,
  trackConsignment
};
