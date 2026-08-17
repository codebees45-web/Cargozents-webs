/**
 * AI Document Verification Service (Mock)
 * Simulates analyzing uploaded documents using OCR and Machine Learning.
 * 
 * In a production environment, this would call Google Cloud Vision API,
 * Google Document AI, AWS Textract, or OpenAI Vision.
 */

const analyzeDocument = async (fileUrl, documentType) => {
  // Simulate network latency (2-3 seconds)
  const delay = Math.floor(Math.random() * 1000) + 2000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Determine a simulated confidence score (0-100)
  // Mostly returns high confidence, but occasionally returns a lower score to simulate flagged documents.
  const isHighConfidence = Math.random() > 0.15; // 85% chance of passing automatically
  const confidenceScore = isHighConfidence 
    ? Math.floor(Math.random() * 10) + 90 // 90 - 99
    : Math.floor(Math.random() * 40) + 40; // 40 - 79

  let extractedData = {};

  // Simulate OCR data extraction based on document type
  if (documentType === 'driving_license') {
    extractedData = {
      licenseNumber: 'DL-' + Math.floor(Math.random() * 10000000000),
      name: 'John Doe',
      dob: '1985-06-15',
      expiryDate: '2030-10-10',
    };
  } else if (documentType === 'rc') {
    extractedData = {
      registrationNumber: 'MH-12-AB-1234',
      chassisNumber: 'CHAS' + Math.floor(Math.random() * 1000000),
      engineNumber: 'ENG' + Math.floor(Math.random() * 1000000),
      ownerName: 'Cargozents Fleet',
    };
  } else if (documentType === 'insurance') {
    extractedData = {
      policyNumber: 'POL-' + Math.floor(Math.random() * 1000000),
      provider: 'SafeDrive Insurance',
      validUntil: '2027-12-31',
    };
  } else if (documentType === 'permit') {
    extractedData = {
      permitNumber: 'PERM-' + Math.floor(Math.random() * 100000),
      permitType: 'National Goods',
      validUntil: '2028-01-01',
    };
  } else if (documentType === 'selfie' || documentType === 'vehicle_photo') {
    extractedData = {
      faceDetected: true,
      imageQuality: 'Good',
      lighting: 'Optimal',
    };
  }

  // If confidence is low, add a simulated warning
  if (!isHighConfidence) {
    extractedData.aiWarning = "Image is blurry, glare detected, or text could not be parsed confidently.";
  }

  return {
    confidenceScore,
    extractedData,
    verificationStatus: confidenceScore >= 90 ? 'verified' : 'flagged',
  };
};

module.exports = {
  analyzeDocument,
};
