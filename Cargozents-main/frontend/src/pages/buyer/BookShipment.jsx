import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";

import BookingStepper from "../../components/buyer/BookingStepper";
import PickupDeliveryCard from "../../components/buyer/PickupDeliveryCard";
import GoodsInformation from "../../components/buyer/GoodsInformation";
import VehicleRecommendation from "../../components/buyer/VehicleRecommendation";
import PriceBreakdown from "../../components/buyer/PriceBreakdown";
import ShipmentSummary from "../../components/buyer/ShipmentSummary";
import UploadDocuments from "../../components/buyer/UploadDocuments";
import ShipmentOptions from "../../components/buyer/ShipmentOptions";
import DeliveryContact from "../../components/buyer/DeliveryContact";
import ReviewBooking from "../../components/buyer/ReviewBooking";
import orderService from "../../services/orderService";
import pricingService from "../../services/pricingService";
import mapsService from "../../services/mapsService";
import ShipmentRouteMap from "../../components/buyer/ShipmentRouteMap";
import AIPricePredictor from "../../components/common/AIPricePredictor";

export default function BookShipment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 5;
  const [distance, setDistance] = useState(0);
  
  const [duration, setDuration] = useState("");

  const [loadingDistance, setLoadingDistance] = useState(false);

  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const [loading, setLoading] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [formData, setFormData] = useState({
    deliveryType: "Standard",
    pickupSchedule: "",
    coupon: "",
    notes: "",

    receiverName: "",
    receiverPhone: "",
    pickupAddress: "",
    deliveryAddress: "",

    pickupLatitude: "",
    pickupLongitude: "",

    deliveryLatitude: "",
    deliveryLongitude: "",

    goodsName: "",
    goodsCategory: "",

    quantity: "",

    weight: "",

    length: "",
    width: "",
    height: "",

    fragile: false,
    hazardous: false,
    refrigerated: false,
    stackable: false,

    insurance: "Standard",

    documents: [],
  });
  const mapVehicleNameToBackendType = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("container")) return "container";
    if (n.includes("light commercial")) return "tempo";
    if (n.includes("pickup")) return "open_body";
    if (n.includes("mini")) return "mini_truck";
    return "mini_truck";
  };

  const submitBooking = async () => {
        try {
          setLoading(true);

          const payload = {
            pickup: {
              address: formData.pickupAddress,
            },

            delivery: {
              address: formData.deliveryAddress,
              contactName: formData.receiverName,
              contactPhone: formData.receiverPhone,
            },

            goods: {
              name: formData.goodsName,
              category: formData.goodsCategory,
              quantity: Number(formData.quantity),
              weight: Number(formData.weight),

              dimensions: {
                length: Number(formData.length),
                width: Number(formData.width),
                height: Number(formData.height),
              },

              fragile: formData.fragile,
              hazardous: formData.hazardous,
              refrigerated: formData.refrigerated,
              stackable: formData.stackable,

              notes: formData.notes,
            },

            shipment: {
              deliveryType: formData.deliveryType,
              pickupSchedule: formData.pickupSchedule,
            },

            vehicle: {
              type: mapBuyerVehicleToBackendType(selectedVehicle?.name),
              capacity: selectedVehicle?.capacity,
            },

            pricing: {
              totalAmount: estimatedPrice > 0 ? estimatedPrice : 1,
            },

            documents: formData.documents,
          };

          const response = await orderService.createOrder(payload);

          navigate("/buyer/order-confirmation", { state: { order: response.order } });

        } catch (err) {

          console.error(err);

          alert(err.response?.data?.message || "Booking Failed");

        } finally {

          setLoading(false);

        }
      };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const calculatePrice = async () => {
    if (!selectedVehicle) return;

    try {
      const pricing = await pricingService.calculatePrice({
        distance,
        vehicleType: selectedVehicle.name, // Use .type if your vehicle object has a type property
        weight: Number(formData.weight),
        insurance: formData.insurance,
        deliveryType: formData.deliveryType,
        couponDiscount: Number(formData.couponDiscount || 0),
      });

      setEstimatedPrice(pricing.total);
    } catch (err) {
      console.error("Price calculation failed:", err);
    }
  };

  const calculateDistance = async () => {
      if (
        !formData.pickupLatitude ||
        !formData.pickupLongitude ||
        !formData.deliveryLatitude ||
        !formData.deliveryLongitude
      ) {
        return;
      }

      try {
        setLoadingDistance(true);

        const result =
          await mapsService.calculateDistance(
            formData.pickupLatitude,
            formData.pickupLongitude,
            formData.deliveryLatitude,
            formData.deliveryLongitude
          );

        setDistance(result.distance);

        setDuration(result.duration);

      } catch (err) {
        console.error("Distance calculation failed", err);
      } finally {
        setLoadingDistance(false);
      }
    };

    useEffect(() => {
      calculateDistance();
    }, [
      formData.pickupLatitude,
      formData.pickupLongitude,
      formData.deliveryLatitude,
      formData.deliveryLongitude,
    ]);

  useEffect(() => {
    calculatePrice();
  }, [
    selectedVehicle,
    distance,
    formData.weight,
    formData.insurance,
    formData.deliveryType,
    formData.couponDiscount,
  ]);

  const swapLocations = () => {
    setFormData((prev) => ({
      ...prev,
      pickupAddress: prev.deliveryAddress,
      deliveryAddress: prev.pickupAddress,
      pickupLatitude: prev.deliveryLatitude,
      pickupLongitude: prev.deliveryLongitude,
      deliveryLatitude: prev.pickupLatitude,
      deliveryLongitude: prev.pickupLongitude,
    }));
  };

  const nextStep = () => {
    if (step < TOTAL_STEPS){
      setStep((prev) => prev + 1);
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <DashboardLayout
      title="Book Shipment"
      subtitle="Create a new logistics booking."
    >
      <div className="space-y-8">

        <BookingStepper
          currentStep={step}
        />

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Side */}

          <div className="lg:col-span-2 space-y-8">

            {step === 1 && (

              <PickupDeliveryCard
                  formData={formData}
                  handleChange={handleChange}
                  swapLocations={swapLocations}
                  onPickupSelect={(location) => {
                    setFormData((prev) => ({
                      ...prev,
                      pickupAddress: location.address,
                      pickupLatitude: location.latitude,
                      pickupLongitude: location.longitude,
                    }));
                  }}
                  onDeliverySelect={(location) => {
                    setFormData((prev) => ({
                      ...prev,
                      deliveryAddress: location.address,
                      deliveryLatitude: location.latitude,
                      deliveryLongitude: location.longitude,
                    }));
                  }}
                  distance={distance}
                  duration={duration}
                  loadingDistance={loadingDistance}
                />

            )}

            {step === 2 && (
              <>
                <GoodsInformation
                  formData={formData}
                  handleChange={handleChange}
                />

                <ShipmentOptions
                  formData={formData}
                  handleChange={handleChange}
                  onApplyCoupon={(discount, code) =>
                    setFormData((prev) => ({
                      ...prev,
                      couponDiscount: discount,
                      appliedCoupon: code,
                    }))
                  }
                />

                <DeliveryContact
                  formData={formData}
                  handleChange={handleChange}
                />
              </>
            )}

            {step === 3 && (

              <VehicleRecommendation
                formData={formData}
                distance={distance}
                onSelectVehicle={
                  setSelectedVehicle
                }
              />

            )}

            {step === 4 && (

              <UploadDocuments
                formData={formData}
                setFormData={setFormData}
              />

            )}
            {step === 5 && (
              <ReviewBooking
                formData={formData}
                selectedVehicle={selectedVehicle}
                estimatedPrice={estimatedPrice}
                onConfirm={submitBooking}
                loading={loading}
              />
            )}

            {step < TOTAL_STEPS && (
              <div className="flex justify-between">

                <button
                  disabled={step === 1}
                  onClick={previousStep}
                  className="rounded-lg border border-primary/20 px-6 py-3 disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  onClick={nextStep}
                  className="rounded-lg bg-primary px-8 py-3 text-white disabled:opacity-50"
                >
                  {step === 4 ? "Review Booking" : "Next"}
                </button>

              </div>
            )}

            {step === TOTAL_STEPS && (
              <div className="flex justify-start">

                <button
                  disabled={loading}
                  onClick={previousStep}
                  className="rounded-lg border border-primary/20 px-6 py-3 disabled:opacity-50"
                >
                  Previous
                </button>

              </div>
            )}

          </div>

          {/* Right Side */}

          <div className="sticky top-8 max-h-[calc(100vh-4rem)] space-y-8 overflow-y-auto pb-4">

            <ShipmentSummary
              formData={formData}
              selectedVehicle={
                selectedVehicle
              }
              distance={distance}
              eta={
                selectedVehicle?.eta ||
                "--"
              }
              estimatedPrice={estimatedPrice}
            />
            {formData.pickupLatitude &&
                formData.deliveryLatitude && (
                  <ShipmentRouteMap
                    pickup={{
                      lat: Number(
                        formData.pickupLatitude
                      ),
                      lng: Number(
                        formData.pickupLongitude
                      ),
                    }}
                    delivery={{
                      lat: Number(
                        formData.deliveryLatitude
                      ),
                      lng: Number(
                        formData.deliveryLongitude
                      ),
                    }}
                  />
              )}

            <PriceBreakdown
              distance={distance}
              selectedVehicle={selectedVehicle}
              insurance={formData.insurance}
              couponDiscount={formData.couponDiscount || 0}
              onContinue={step < TOTAL_STEPS ? nextStep : undefined}
            />
            {selectedVehicle &&
              formData.pickupLatitude &&
              formData.deliveryLatitude && (
                <AIPricePredictor
                  pickupCoordinates={[Number(formData.pickupLongitude), Number(formData.pickupLatitude)]}
                  dropCoordinates={[Number(formData.deliveryLongitude), Number(formData.deliveryLatitude)]}
                  weight={Number(formData.weight)}
                  vehicleType={mapVehicleNameToBackendType(selectedVehicle.name)}
                  insuranceOpted={formData.insurance !== "None"}
                  isBackhaulMatch={false}
                />
              )}

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}