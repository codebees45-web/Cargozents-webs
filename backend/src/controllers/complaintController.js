const Complaint = require('../models/Complaint');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (user)
exports.createComplaint = async (req, res, next) => {
  try {
    const { subject, description, order, shipment } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Subject and description are required',
      });
    }

    const complaint = await Complaint.create({
      user: req.user.id, // assumes auth middleware sets req.user
      subject,
      description,
      order,
      shipment,
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all complaints (admin)
// @route   GET /api/complaints  (or /api/admin/complaints)
// @access  Private (admin)
exports.getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name email')
      .populate('order')
      .populate('shipment')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (err) {
    next(err);
  }
};

// @desc    Get complaints for the logged-in user
// @route   GET /api/complaints/my
// @access  Private (user)
exports.getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private (owner or admin)
exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email')
      .populate('order')
      .populate('shipment');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const isOwner = complaint.user?._id?.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// @desc    Update complaint status / admin response
// @route   PUT /api/complaints/:id
// @access  Private (admin)
exports.updateComplaint = async (req, res, next) => {
  try {
    const { status, adminResponse } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (adminResponse !== undefined) complaint.adminResponse = adminResponse;

    await complaint.save();

    res.status(200).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a complaint
// @route   DELETE /api/complaints/:id
// @access  Private (admin)
exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    await complaint.deleteOne();

    res.status(200).json({ success: true, message: 'Complaint deleted' });
  } catch (err) {
    next(err);
  }
};