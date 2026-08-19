import React from "react";

const steps = [
  {
    id: 1,
    title: "Pickup",
    description: "Pickup & Delivery",
  },
  {
    id: 2,
    title: "Cargo",
    description: "Goods Information",
  },
  {
    id: 3,
    title: "Vehicle",
    description: "Vehicle Selection",
  },
  {
    id: 4,
    title: "Documents",
    description: "Upload Documents",
  },
  {
    id: 5,
    title: "Review",
    description: "Price & Review",
  },
];

export default function BookingStepper({
  currentStep = 1,
}) {
  return (
    <div className="bg-white rounded-xl border border-primary/10 shadow-sm p-6">

      <div className="flex items-center justify-between">

        {steps.map((step, index) => {

          const completed = currentStep > step.id;
          const active = currentStep === step.id;

          return (
            <React.Fragment key={step.id}>

              <div className="flex flex-col items-center flex-1">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition-all
                  ${
                    completed
                      ? "bg-primary border-primary text-white"
                      : active
                      ? "border-primary text-primary bg-primary/10"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {completed ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>

                <h3
                  className={`mt-3 text-sm font-semibold ${
                    active || completed
                      ? "text-primary"
                      : "text-gray-400"
                  }`}
                >
                  {step.title}
                </h3>

                <p className="mt-1 text-xs text-[#5B7A70] text-center">
                  {step.description}
                </p>

              </div>

              {index !== steps.length - 1 && (

                <div
                  className={`flex-1 h-1 rounded-full mx-4
                  ${
                    completed
                      ? "bg-primary"
                      : "bg-gray-200"
                  }`}
                />

              )}

            </React.Fragment>
          );
        })}

      </div>

    </div>
  );
}