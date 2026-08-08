import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/common/DashboardLayout";

const vehicleData = [
  {
    id: 1,
    name: "Mini Truck",
    capacity: "1 Ton",
    dimensions: "6 × 5 × 5 ft",
    eta: "18 mins",
    price: 850,
    rating: 4.8,
    insurance: true,
    recommended: true,
    fastest: false,
    image:
      "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=800",
  },
  {
    id: 2,
    name: "Pickup Truck",
    capacity: "750 KG",
    dimensions: "5 × 4 × 4 ft",
    eta: "12 mins",
    price: 650,
    rating: 4.7,
    insurance: true,
    recommended: false,
    fastest: true,
    image:
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800",
  },
  {
    id: 3,
    name: "Container Truck",
    capacity: "20 Tons",
    dimensions: "20 × 8 × 8 ft",
    eta: "35 mins",
    price: 3200,
    rating: 4.9,
    insurance: true,
    recommended: false,
    fastest: false,
    image:
      "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800",
  },
];

export default function VehicleSelection() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    // Later replace with buyerService.getAvailableVehicles()
    setVehicles(vehicleData);
  }, []);

  const handleContinue = () => {
    if (!selectedVehicle) return;

    sessionStorage.setItem(
      "selectedVehicle",
      JSON.stringify(selectedVehicle)
    );

    navigate("/buyer/checkout");
  };

  return (
    <DashboardLayout
      title="Select Vehicle"
      subtitle="Choose the vehicle best suited for your shipment."
    >
      <div className="max-w-7xl mx-auto">

        <div className="grid lg:grid-cols-3 gap-6">

          {vehicles.map((vehicle) => (

            <div
              key={vehicle.id}
              onClick={() => setSelectedVehicle(vehicle)}
              className={`rounded-xl overflow-hidden border cursor-pointer transition duration-300
              ${
                selectedVehicle?.id === vehicle.id
                  ? "border-primary shadow-xl"
                  : "border-primary/10 hover:border-primary/40 hover:shadow-lg"
              }`}
            >

              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full h-52 object-cover"
              />

              <div className="p-6">

                <div className="flex justify-between items-center">

                  <h2 className="font-semibold text-lg text-primary">
                    {vehicle.name}
                  </h2>

                  <span className="font-bold text-primary">
                    ₹{vehicle.price}
                  </span>

                </div>

                <div className="mt-5 space-y-3 text-sm text-[#5B7A70]">

                  <div className="flex justify-between">
                    <span>Capacity</span>
                    <span>{vehicle.capacity}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Dimensions</span>
                    <span>{vehicle.dimensions}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated Arrival</span>
                    <span>{vehicle.eta}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Driver Rating</span>
                    <span>{vehicle.rating}/5</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Insurance</span>
                    <span>
                      {vehicle.insurance ? "Included" : "Not Included"}
                    </span>
                  </div>

                </div>

                <div className="mt-6 flex gap-2 flex-wrap">

                  {vehicle.recommended && (
                    <span className="rounded-full bg-success/10 text-success text-xs px-3 py-1">
                      Recommended
                    </span>
                  )}

                  {vehicle.fastest && (
                    <span className="rounded-full bg-warning/10 text-warning text-xs px-3 py-1">
                      Fastest
                    </span>
                  )}

                </div>

              </div>

            </div>

          ))}

        </div>

        <div className="flex justify-end mt-8">

          <button
            disabled={!selectedVehicle}
            onClick={handleContinue}
            className="rounded-lg bg-primary text-white px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Continue
          </button>

        </div>

      </div>
    </DashboardLayout>
  );
}