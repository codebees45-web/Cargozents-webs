const workflowStressData = {
  users: [
    { key: 'stressBuyer1', role: 'buyer', name: 'Harish Kulkarni', email: 'stressbuyer1@cargozents.test', phone: '9200000001', password: 'Password123', isVerified: true },
    { key: 'stressBuyer2', role: 'buyer', name: 'Sneha Pillai', email: 'stressbuyer2@cargozents.test', phone: '9200000002', password: 'Password123', isVerified: true },
    { key: 'stressBuyer3', role: 'buyer', name: 'Rajat Das', email: 'stressbuyer3@cargozents.test', phone: '9200000003', password: 'Password123', isVerified: true },
    { key: 'stressBuyer4', role: 'buyer', name: 'Ishita Rao', email: 'stressbuyer4@cargozents.test', phone: '9200000004', password: 'Password123', isVerified: true },
    { key: 'stressBuyer5', role: 'buyer', name: 'Naveen Babu', email: 'stressbuyer5@cargozents.test', phone: '9200000005', password: 'Password123', isVerified: true },
    { key: 'stressShipper1', role: 'shipper', name: 'Pioneer Traders', email: 'stressshipper1@cargozents.test', phone: '9200000011', password: 'Password123', isVerified: true, shipperMode: 'both' },
    { key: 'stressShipper2', role: 'shipper', name: 'Rapid Freight Co.', email: 'stressshipper2@cargozents.test', phone: '9200000012', password: 'Password123', isVerified: true, shipperMode: 'catalog' },
    { key: 'stressShipper3', role: 'shipper', name: 'Metro Retail Network', email: 'stressshipper3@cargozents.test', phone: '9200000013', password: 'Password123', isVerified: true, shipperMode: 'raw_shipment' },
    { key: 'stressDriver1', role: 'driver', name: 'Kiran Shah', email: 'stressdriver1@cargozents.test', phone: '9200000021', password: 'Password123', isVerified: true, isApproved: true, driverProfile: { licenseNumber: 'MH9988776655', isAvailable: true } },
    { key: 'stressDriver2', role: 'driver', name: 'Mohan Iyer', email: 'stressdriver2@cargozents.test', phone: '9200000022', password: 'Password123', isVerified: true, isApproved: true, driverProfile: { licenseNumber: 'KA4455667788', isAvailable: true } },
    { key: 'stressDriver3', role: 'driver', name: 'Ali Khan', email: 'stressdriver3@cargozents.test', phone: '9200000023', password: 'Password123', isVerified: true, isApproved: true, driverProfile: { licenseNumber: 'DL2233445566', isAvailable: false } },
    { key: 'stressAgency1', role: 'agency', name: 'BlueLine Haulage', email: 'stressagency1@cargozents.test', phone: '9200000031', password: 'Password123', isVerified: true, isApproved: true, agencyProfile: { companyName: 'BlueLine Haulage Pvt. Ltd.', fleetSize: 20, rating: 4.7 } }
  ],
  products: [
    { key: 'stressProduct1', shipperKey: 'stressShipper1', name: 'Packaging Boxes', description: 'Corrugated cartons for warehousing.', category: 'Packaging', price: 120, unit: 'box', stock: 200, weightPerUnit: 10 },
    { key: 'stressProduct2', shipperKey: 'stressShipper2', name: 'Stationery Bundle', description: 'Office stationery in bulk.', category: 'Office', price: 85, unit: 'pack', stock: 180, weightPerUnit: 8 },
    { key: 'stressProduct3', shipperKey: 'stressShipper3', name: 'Frozen Foods', description: 'Cold-chain retail food packs.', category: 'Food', price: 220, unit: 'crate', stock: 150, weightPerUnit: 12 }
  ],
  orders: [],
  shipments: []
};

for (let i = 0; i < 15; i += 1) {
  workflowStressData.orders.push({
    buyerKey: ['stressBuyer1', 'stressBuyer2', 'stressBuyer3', 'stressBuyer4', 'stressBuyer5'][i % 5],
    shipperKey: ['stressShipper1', 'stressShipper2', 'stressShipper3'][i % 3],
    productKey: ['stressProduct1', 'stressProduct2', 'stressProduct3'][i % 3],
    quantity: 1 + (i % 4),
    priceAtPurchase: [120, 85, 220][i % 3],
    productTotal: (1 + (i % 4)) * [120, 85, 220][i % 3],
    status: ['placed', 'awaiting_shipment', 'confirmed_by_shipper', 'shipment_requested', 'out_for_delivery', 'delivered'][i % 6],
    deliveryAddress: {
      line1: `${10 + i} Main Road`,
      city: ['Pune', 'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad'][i % 6],
      state: ['Maharashtra', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana'][i % 6],
      pincode: ['411001', '400001', '110001', '560001', '600001', '500001'][i % 6],
    },
  });

  workflowStressData.shipments.push({
    shipperKey: ['stressShipper1', 'stressShipper2', 'stressShipper3'][i % 3],
    source: i % 2 === 0 ? 'manual' : 'order',
    goodsType: ['Packaging Boxes', 'Stationery Bundle', 'Frozen Foods'][i % 3],
    weight: 700 + (i * 80),
    volume: 3 + (i % 4),
    vehicleRequired: ['mini_truck', 'tempo', 'container', 'open_body', 'trailer'][i % 5],
    pickup: {
      address: `${20 + i} Industrial Road`,
      city: ['Pune', 'Mumbai', 'Noida', 'Bengaluru', 'Chennai', 'Hyderabad'][i % 6],
      state: ['Maharashtra', 'Maharashtra', 'Uttar Pradesh', 'Karnataka', 'Tamil Nadu', 'Telangana'][i % 6],
      pincode: ['411002', '400002', '201301', '560002', '600002', '500002'][i % 6],
      coordinates: [73.8567 + (i * 0.01), 18.5204 + (i * 0.005)],
    },
    drop: {
      address: `${30 + i} Warehouse Lane`,
      city: ['Nashik', 'Surat', 'Delhi', 'Coimbatore', 'Vizag', 'Nagpur'][i % 6],
      state: ['Maharashtra', 'Gujarat', 'Delhi', 'Tamil Nadu', 'Andhra Pradesh', 'Maharashtra'][i % 6],
      pincode: ['422001', '395007', '110002', '641001', '530001', '440001'][i % 6],
      coordinates: [74.0059 + (i * 0.01), 19.0760 + (i * 0.005)],
    },
    status: ['requested', 'assigned', 'accepted', 'in_transit', 'delivered', 'cancelled'][i % 6],
    estimatedPrice: 3000 + (i * 250),
    finalPrice: 3000 + (i * 250),
    isBackhaulMatch: i % 2 === 0,
  });
}

module.exports = workflowStressData;
