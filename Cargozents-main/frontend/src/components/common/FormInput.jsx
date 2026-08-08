const FormInput = ({ label, type = 'text', value, onChange, name, placeholder, required = true }) => {
  return (
    <label className="block">
      <span className="font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 w-full rounded-lg border border-primary/15 bg-secondary/40 px-4 py-2.5 text-sm text-primary placeholder:text-muted/40 outline-none transition focus:border-primary/60 focus:ring-1 focus:ring-primary/40"
      />
    </label>
  );
};

export default FormInput;
