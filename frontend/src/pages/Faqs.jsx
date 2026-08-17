import { useState } from 'react';
import MarketingLayout from '../components/marketing/MarketingLayout';

const faqs = [
  {
    q: 'How does backhaul matching actually work?',
    a: 'When a driver marks their route and availability, LoadShare checks pending shipment requests along that route \u2014 especially the return leg \u2014 and surfaces the best match by distance, vehicle fit, and timing.',
  },
  {
    q: 'Can a shipper both sell products and post raw shipments?',
    a: 'Yes. When you sign up as a shipper, you choose catalog mode, raw shipment mode, or both. You can change this later from your profile.',
  },
  {
    q: 'Who pays for what \u2014 the product or the delivery?',
    a: 'They\u2019re separate. Buyers pay shippers directly for products. Delivery is billed separately, based on distance, weight, and vehicle type.',
  },
  {
    q: 'How are drivers verified?',
    a: 'Drivers upload RC, permit, insurance, and driving license during signup. An admin reviews and approves documents before a driver can accept loads.',
  },
  {
    q: 'What happens if a driver rejects an assigned load?',
    a: 'The shipment goes back into the queue and the admin reassigns it to another available driver nearby.',
  },
];

const FaqItem = ({ faq, isOpen, onToggle }) => (
  <div className="border-b border-primary/10 py-5">
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between text-left"
    >
      <span className="font-display text-base font-semibold text-primary">{faq.q}</span>
      <span className="ml-4 shrink-0 font-mono-ls text-lg text-primary/50">
        {isOpen ? '\u2212' : '+'}
      </span>
    </button>
    {isOpen && <p className="mt-3 text-sm leading-relaxed text-[#5B7A70]">{faq.a}</p>}
  </div>
);

const Faqs = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <MarketingLayout eyebrow="FAQS" title="Common questions.">
      <div>
        {faqs.map((faq, i) => (
          <FaqItem
            key={faq.q}
            faq={faq}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </MarketingLayout>
  );
};

export default Faqs;
