const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    // A vehicle is owned by either a driver (self-employed) or an agency
    // (fleet operator) — never both. Kept as two separate optional refs
    // rather than a single polymorphic "owner" so existing driver-side
    // queries (Vehicle.find({ driver: ... })) don't need to change.
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['mini_truck', 'tempo', 'container', 'trailer', 'open_body', 'refrigerated'],
      required: true,
    },
    capacityWeight: { type: Number, required: true }, // tons
    capacityVolume: { type: Number }, // cubic meters

    // Human-readable location label for fleets that don't have live GPS
    // wired up yet (e.g. "Chennai Hub"). currentLocation below stays for
    // the geo-matching engine once live tracking is added.
    locationLabel: { type: String, default: '' },

    photos: { type: [String], default: [] }, // base64 data URLs or hosted URLs

    // Verification documents, stored the same way as product photos in
    // this project (base64 data URLs) since no file-storage provider is
    // wired up yet. Swap these for real upload URLs if Cloudinary/S3 is
    // added later — nothing else needs to change shape-wise.
    documents: {
      rcBook: { type: String, default: '' },
      insurance: { type: String, default: '' },
      permit: { type: String, default: '' },
    },

    // A vehicle only becomes bookable once every required document on it
    // (RC, permit, insurance) is admin-approved.
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Live location, mirrored from the driver's device while a trip is
    // active. Kept on Vehicle (not just User) so the matching engine can
    // geo-query vehicles directly by type/capacity/location in one pass.
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    // When this location was last written — powers the "Live / stale /
    // set by agency" freshness badge (see frontend/utils/locationFreshness.js).
    locationUpdatedAt: { type: Date, default: null },
    // True only while the driver's own device has live GPS sharing turned
    // on for a trip. False for manual agency-set pins and once sharing stops.
    isSharingLocation: { type: Boolean, default: false },
    // 'gps' = driver's own device via useLiveLocationSharing.
    // 'manual' = agency staff clicked a position in for a driver with no
    // smartphone (see AgencyFleetTracking.jsx).
    locationSource: { type: String, enum: ['gps', 'manual'], default: 'gps' },

    // True from the moment a driver marks a delivery as "delivered" until
    // they either accept a new load or manually clear it. This is the flag
    // the backhaul matcher looks for — an empty vehicle sitting somewhere,
    // available to be filled instead of driving back empty.
    isOnEmptyReturn: { type: Boolean, default: false },
    emptyReturnSince: { type: Date, default: null },
    // Where the vehicle is headed home/base to, used to score how well a
    // candidate backhaul shipment's route overlaps with this leg.
    homeBaseLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);

vehicleSchema.index({ currentLocation: '2dsphere' });
vehicleSchema.index({ type: 1, isVerified: 1, isActive: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);