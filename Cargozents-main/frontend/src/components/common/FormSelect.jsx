const FormSelect = ({ label, value, onChange, name, options, required = true, placeholder = 'Select…' }) => {
  return (
    <label className="block">
      <span className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1.5 w-full rounded-lg border border-primary/15 bg-secondary/40 px-4 py-2.5 text-sm text-primary outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default FormSelect;
